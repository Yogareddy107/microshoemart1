import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { adminGetSettings, adminSaveSettings, adminUploadImage } from "@/lib/admin.functions";
import type { StoreSettings } from "@/lib/types";
import { STOREFRONT_KEYS, fileToBase64, useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Draft = Omit<StoreSettings, "updated_at">;

function SettingsPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const getSettings = useServerFn(adminGetSettings);
  const saveSettings = useServerFn(adminSaveSettings);
  const uploadImage = useServerFn(adminUploadImage);

  const [draft, setDraft] = useState<Draft | null>(null);

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    enabled: Boolean(token),
    queryFn: () => getSettings({ data: { token: token! } }),
  });

  useEffect(() => {
    if (settings.data && !draft) {
      const { updated_at: _ignored, ...rest } = settings.data;
      setDraft(rest);
    }
  }, [settings.data, draft]);

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      saveSettings({
        data: {
          token: token!,
          id: input.id,
          store_name: input.store_name,
          tagline: input.tagline,
          logo_url: input.logo_url,
          whatsapp_number: input.whatsapp_number,
          instagram_url: input.instagram_url,
          address: input.address,
          phone: input.phone,
          email: input.email,
          opening_hours: input.opening_hours,
          delivery_info: input.delivery_info,
          policies: input.policies,
          winner_photo_url: input.winner_photo_url,
          winner_name: input.winner_name,
          winner_description: input.winner_description,
          winner_show_popup: input.winner_show_popup,
        },
      }),
    onSuccess: () => {
      toast.success("Store settings updated");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      STOREFRONT_KEYS.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: [...key] });
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataBase64 = await fileToBase64(file);
      return uploadImage({
        data: {
          token: token!,
          fileName: file.name,
          contentType: file.type,
          dataBase64,
        },
      });
    },
    onSuccess: (result) => {
      setDraft((current) => (current ? { ...current, logo_url: result.url } : current));
      toast.success("Logo uploaded — remember to save");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const winnerPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataBase64 = await fileToBase64(file);
      return uploadImage({
        data: {
          token: token!,
          fileName: file.name,
          contentType: file.type,
          dataBase64,
        },
      });
    },
    onSuccess: (result) => {
      setDraft((current) => (current ? { ...current, winner_photo_url: result.url } : current));
      toast.success("Winner photo uploaded — remember to save");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (settings.isPending || !draft) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate(draft);
      }}
    >
      <header>
        <h1 className="font-display text-3xl">Store settings</h1>
        <p className="text-sm text-muted-foreground">
          These details drive the storefront header, footer, WhatsApp ordering and contact page.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-2">
        <Field label="Store name" id="store_name">
          <Input
            id="store_name"
            value={draft.store_name}
            onChange={(event) => set("store_name", event.target.value)}
            required
          />
        </Field>
        <Field label="Tagline" id="tagline">
          <Input
            id="tagline"
            value={draft.tagline}
            onChange={(event) => set("tagline", event.target.value)}
          />
        </Field>
        <Field label="WhatsApp number" id="whatsapp_number">
          <Input
            id="whatsapp_number"
            value={draft.whatsapp_number}
            onChange={(event) => set("whatsapp_number", event.target.value)}
            placeholder="9959810473"
            required
          />
        </Field>
        <Field label="Phone" id="phone">
          <Input
            id="phone"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>
        <Field label="Email" id="email">
          <Input
            id="email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </Field>
        <Field label="Instagram URL" id="instagram_url">
          <Input
            id="instagram_url"
            value={draft.instagram_url}
            onChange={(event) => set("instagram_url", event.target.value)}
          />
        </Field>
        <Field label="Opening hours" id="opening_hours">
          <Input
            id="opening_hours"
            value={draft.opening_hours}
            onChange={(event) => set("opening_hours", event.target.value)}
          />
        </Field>
        <Field label="Logo" id="logo">
          <div className="flex items-center gap-3">
            {draft.logo_url && (
              <img
                src={draft.logo_url}
                alt="Store logo preview"
                className="size-12 rounded-lg border border-border object-cover"
              />
            )}
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) logoMutation.mutate(file);
                event.target.value = "";
              }}
            />
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address" id="address">
            <Textarea
              id="address"
              value={draft.address}
              onChange={(event) => set("address", event.target.value)}
              rows={2}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Delivery information" id="delivery_info">
            <Textarea
              id="delivery_info"
              value={draft.delivery_info}
              onChange={(event) => set("delivery_info", event.target.value)}
              rows={3}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Policies" id="policies">
            <Textarea
              id="policies"
              value={draft.policies}
              onChange={(event) => set("policies", event.target.value)}
              rows={5}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
        <div>
          <h2 className="font-display text-xl">Weekly Giveaway Winner</h2>
          <p className="text-xs text-muted-foreground">
            Promote your Instagram reel giveaway winners. Shown on the home page and as a popup modal when the site is opened.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 pt-2 sm:col-span-2">
            <input
              type="checkbox"
              id="winner_show_popup"
              checked={draft.winner_show_popup || false}
              onChange={(event) => set("winner_show_popup", event.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="winner_show_popup" className="font-medium cursor-pointer">
              Show winner popup modal to visitors
            </Label>
          </div>

          <Field label="Winner Name / Handle" id="winner_name">
            <Input
              id="winner_name"
              value={draft.winner_name || ""}
              onChange={(event) => set("winner_name", event.target.value)}
              placeholder="@username"
            />
          </Field>

          <Field label="Winner Photo" id="winner_photo">
            <div className="flex items-center gap-3">
              {draft.winner_photo_url && (
                <img
                  src={draft.winner_photo_url}
                  alt="Winner preview"
                  className="size-12 rounded-lg border border-border object-cover"
                />
              )}
              <Input
                id="winner_photo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) winnerPhotoMutation.mutate(file);
                  event.target.value = "";
                }}
              />
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Winner Description / Quote" id="winner_description">
              <Textarea
                id="winner_description"
                value={draft.winner_description || ""}
                onChange={(event) => set("winner_description", event.target.value)}
                placeholder="Won a free pair of running shoes in our weekly Reels giveaway! With 1,420 likes on their comment."
                rows={2}
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saveMutation.isPending || logoMutation.isPending || winnerPhotoMutation.isPending}>
          {saveMutation.isPending ? "Saving…" : "Save settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (settings.data) {
              const { updated_at: _ignored, ...rest } = settings.data;
              setDraft(rest);
            }
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
