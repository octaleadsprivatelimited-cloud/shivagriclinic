import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ImageIcon, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDeleteGalleryItem, useGalleryItems, useSaveGalleryItem } from "@/hooks/useCmsFirestore";
import type { FirestoreGalleryItem } from "@/types/cms";
import { MAX_IMAGE_DATA_URL_CHARS } from "@/lib/imageCompress";
import { AdminImageUpload } from "../components/AdminImageUpload";

const emptyItem = (): FirestoreGalleryItem => ({
  title: "",
  category: "Farm Visit",
  imageUrl: "",
  type: "image",
});

const GalleryManagement = () => {
  const { data: items = [], isPending, isError, error, refetch } = useGalleryItems();
  const saveItem = useSaveGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FirestoreGalleryItem>(emptyItem());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyItem());
    setImageBusy(false);
    setDialogOpen(true);
  };

  const openEdit = (id: string, row: FirestoreGalleryItem) => {
    setEditingId(id);
    setImageBusy(false);
    setForm({
      title: row.title,
      category: row.category,
      imageUrl: row.imageUrl,
      type: "image",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (imageBusy) {
      toast.error("Wait for the image to finish compressing.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!form.imageUrl.trim()) {
      toast.error("Upload an image for this gallery item.");
      return;
    }
    const data: FirestoreGalleryItem = { ...form, type: "image", videoUrl: "" };
    try {
      await saveItem.mutateAsync({ id: editingId ?? undefined, data });
      toast.success(editingId ? "Updated" : "Added");
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from the website gallery?")) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  };

  const images = items.filter((i) => i.type === "image");

  const renderGrid = (list: typeof images) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
            ) : <ImageIcon className="h-10 w-10 text-muted-foreground/40" />}
          </div>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <div className="flex shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item.id, item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => void handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Gallery">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Add photos for the homepage and Gallery page. Uploaded images are compressed below 1 MB before saving.
          </p>
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add image
          </Button>
        </div>
        {isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && (
          <p className="text-sm text-destructive">
            {(error as Error).message}{" "}
            <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>
              Retry
            </Button>
          </p>
        )}

        {images.length > 0 && renderGrid(images)}

        {!isPending && images.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No gallery images saved yet. Add an image to show it on the website.
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit gallery image" : "New gallery image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <AdminImageUpload
              label="Image"
              value={form.imageUrl}
              onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "" }))}
              disabled={saveItem.isPending}
              maxChars={MAX_IMAGE_DATA_URL_CHARS}
              onBusyChange={setImageBusy}
              helperText="The saved image must be under 1 MB. A larger original is resized and compressed automatically; images that remain too large are rejected."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saveItem.isPending || imageBusy}>
              {imageBusy ? "Compressing…" : saveItem.isPending ? "Saving…" : "Save image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default GalleryManagement;
