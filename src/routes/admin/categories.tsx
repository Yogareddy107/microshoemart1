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
  adminDeleteCategory,
  adminListCategories,
  adminSaveCategory,
} from "@/lib/admin.functions";
import type { Category } from "@/lib/types";
import { STOREFRONT_KEYS, slugify, useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  active: boolean;
};

const EMPTY: Draft = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  display_order: 0,
  active: true,
};

function CategoriesPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const listCategories = useServerFn(adminListCategories);
  const saveCategory = useServerFn(adminSaveCategory);
  const deleteCategory = useServerFn(adminDeleteCategory);

  const [draft, setDraft] = useState<Draft | null>(null);

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    enabled: Boolean(token),
    queryFn: () => listCategories({ data: { token: token! } }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    STOREFRONT_KEYS.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: [...key] });
    });
  };

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      saveCategory({
        data: {
          token: token!,
          ...(input.id ? { id: input.id } : {}),
          name: input.name,
          slug: input.slug || slugify(input.name),
          description: input.description,
          image_url: input.image_url.trim() ? input.image_url.trim() : null,
          display_order: input.display_order,
          active: input.active,
        },
      }),
    onSuccess: () => {
      toast.success("Category saved");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { token: token!, id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openEdit = (category: Category) =>
    setDraft({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url ?? "",
      display_order: category.display_order,
      active: category.active,
    });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Categories power the storefront menus and shop filters.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" aria-hidden="true" />
          New category
        </Button>
      </header>

      {categories.isPending && <Skeleton className="h-40 w-full rounded-2xl" />}

      {!categories.isPending && (categories.data ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No categories yet. Create your first category to organise the catalogue.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(categories.data ?? []).map((category) => (
          <article key={category.id} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  category.active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {category.active ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {category.description || "No description"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Order {category.display_order}</p>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(category)}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  saveMutation.mutate({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    image_url: category.image_url ?? "",
                    display_order: category.display_order,
                    active: !category.active,
                  })
                }
              >
                {category.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete ${category.name}?`)) {
                    deleteMutation.mutate(category.id);
                  }
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
            <DialogTitle>{draft?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      name: event.target.value,
                      slug: draft.id ? draft.slug : slugify(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-image">Image URL</Label>
                <Input
                  id="cat-image"
                  value={draft.image_url}
                  onChange={(event) => setDraft({ ...draft, image_url: event.target.value })}
                  placeholder="/images/shoes/mens-sneaker.jpg"
                />
              </div>
              <div className="flex items-end gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-order">Display order</Label>
                  <Input
                    id="cat-order"
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
              disabled={saveMutation.isPending || !draft?.name}
              onClick={() => draft && saveMutation.mutate(draft)}
            >
              {saveMutation.isPending ? "Saving…" : "Save category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
