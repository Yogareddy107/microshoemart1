import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/lib/admin.functions";
import { setAdminToken } from "@/lib/admin-client";
import { whatsappLink } from "@/lib/format";
import { storeSettingsQuery } from "@/lib/queries";

export function FloatingActions() {
  const { data: settings } = useQuery(storeSettingsQuery);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);

  const mutation = useMutation({
    mutationFn: (value: string) => login({ data: { pin: value } }),
    onSuccess: (result) => {
      if (!result.ok || !result.token) {
        toast.error("Incorrect PIN");
        setPin("");
        return;
      }
      setAdminToken(result.token);
      setOpen(false);
      setPin("");
      void navigate({ to: "/admin" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <a
          href={whatsappLink(
            settings?.whatsapp_number,
            `Hi ${settings?.store_name ?? "Micro Shoe Mart"}, I would like to know more about your footwear.`,
          )}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Chat on WhatsApp"
          className="flex size-14 items-center justify-center rounded-full bg-[oklch(0.62_0.17_150)] text-white shadow-soft transition-transform hover:scale-110"
        >
          <MessageCircle className="size-7" />
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Store admin access"
          title="Store admin"
          className="grid size-8 place-items-center rounded-full bg-background/70 text-sm opacity-40 shadow-soft transition-opacity hover:opacity-100"
        >
          <span aria-hidden="true">👟</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Admin access</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter the store PIN to open the management dashboard.
          </p>
          <form
            className="mt-2 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[0-9]{4,8}$/.test(pin)) {
                toast.error("PIN must be 4-8 digits");
                return;
              }
              mutation.mutate(pin);
            }}
          >
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              aria-label="Admin PIN"
              className="text-center text-2xl tracking-[0.5em]"
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Verifying…" : "Unlock dashboard"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
