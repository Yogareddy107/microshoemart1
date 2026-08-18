import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminDeleteAdvertisement,
  adminListAdvertisements,
  adminSaveAdvertisement,
} from "@/lib/admin.functions";
import type { Advertisement } from "@/lib/types";
import { STOREFRONT_KEYS, useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/advertisements")({
  component: AdvertisementsPage,
});

type Draft = {
  id?: string;
  title: string;
  message: string;
  link: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  display_order: number;
};

const EMPTY: Draft = {
  title: "",
  message: "",
  link: "",
  starts_at: "",
  ends_at: "",
  active: true,
  display_order: 0,
};

function isRunning(ad: Advertisement): boolean {
  if (!ad.active) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (ad.starts_at && ad.starts_at > today) return false;
  if (ad.ends_at && ad.ends_at < today) return false;
  return true;
}

function AdvertisementsPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const listAds = useServerFn(adminListAdvertisements);
  const saveAd = useServerFn(adminSaveAdvertisement);
  const deleteAd = useServerFn(adminDeleteAdvertisement);

  const [draft, setDraft] = useState<Draft | null>(null);

  const ads = useQuery({
    queryKey: ["admin", "advertisements"],
    enabled: Boolean(token),
    queryFn: () => listAds({ data: { token: token! } }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    STOREFRONT_KEYS.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: [...key] });
    });
  };

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      saveAd({
        data: {
          token: token!,
          ...(input.id ? { id: input.id } : {}),
          title: input.title,
          message: input.message,
          link: input.link.trim() ? input.link.trim() : null,
          starts_at: input.starts_at ? input.starts_at : null,
          ends_at: input.ends_at ? input.ends_at : null,
          active: input.active,
          display_order: input.display_order,
        },
      }),
    onSuccess: () => {
      toast.success("Advertisement saved");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAd({ data: { token: token!, id } }),
    onSuccess: () => {
      toast.success("Advertisement deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Advertisements</h1>
          <p className="text-sm text-muted-foreground">
            Running promotions scroll automatically in the marquee below the navbar.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" aria-hidden="true" />
          New advertisement
        </Button>
      </header>

      {ads.isPending && <Skeleton className="h-40 w-full rounded-2xl" />}

      {!ads.isPending && (ads.data ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No advertisements yet. Add one to start promoting offers.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(ads.data ?? []).map((ad) => (
          <article key={ad.id} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{ad.title}</p>
                <p className="text-sm text-muted-foreground">{ad.message}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  isRunning(ad) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {isRunning(ad) ? "Running" : ad.active ? "Scheduled" : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {ad.starts_at ?? "always"} → {ad.ends_at ?? "no end"} · order {ad.display_order}
              {ad.link ? ` · ${ad.link}` : ""}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraft({
                    id: ad.id,
                    title: ad.title,
                    message: ad.message,
                    link: ad.link ?? "",
                    starts_at: ad.starts_at ?? "",
                    ends_at: ad.ends_at ?? "",
                    active: ad.active,
                    display_order: ad.display_order,
                  })
                }
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  saveMutation.mutate({
                    id: ad.id,
                    title: ad.title,
                    message: ad.message,
                    link: ad.link ?? "",
                    starts_at: ad.starts_at ?? "",
                    ends_at: ad.ends_at ?? "",
                    active: !ad.active,
                    display_order: ad.display_order,
                  })
                }
              >
                {ad.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete "${ad.title}"?`)) deleteMutation.mutate(ad.id);
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit advertisement" : "New advertisement"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ad-title">Title</Label>
                <Input
                  id="ad-title"
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Monsoon Sale"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-message">Message</Label>
                <Textarea
                  id="ad-message"
                  value={draft.message}
                  onChange={(event) => setDraft({ ...draft, message: event.target.value })}
                  placeholder="Flat 30% off on all sports shoes"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-link">Link (optional)</Label>
                <Input
                  id="ad-link"
                  value={draft.link}
                  onChange={(event) => setDraft({ ...draft, link: event.target.value })}
                  placeholder="/offers"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ad-start">Starts on</Label>
                  <Input
                    id="ad-start"
                    type="date"
                    value={draft.starts_at}
                    onChange={(event) => setDraft({ ...draft, starts_at: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ad-end">Ends on</Label>
                  <Input
                    id="ad-end"
                    type="date"
                    value={draft.ends_at}
                    onChange={(event) => setDraft({ ...draft, ends_at: event.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-end gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="ad-order">Display order</Label>
                  <Input
                    id="ad-order"
                    type="number"
                    min={0}
                    value={draft.display_order}
                    onChange={(event) =>
                      setDraft({ ...draft, display_order: Number(event.target.value) || 0 })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={draft.active}
                    onCheckedChange={(active) => setDraft({ ...draft, active })}
                  />
                  Active
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending || !draft?.title || !draft?.message}
              onClick={() => draft && saveMutation.mutate(draft)}
            >
              {saveMutation.isPending ? "Saving…" : "Save advertisement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
