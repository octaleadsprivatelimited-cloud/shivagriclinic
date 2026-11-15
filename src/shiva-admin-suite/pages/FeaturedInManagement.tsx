import { useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../components/AdminLayout";
import { AdminImageUpload } from "../components/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteFeaturedIn, useFeaturedIn, useSaveFeaturedIn, type FeaturedInRow } from "@/hooks/useCmsFirestore";
import type { FirestoreFeaturedIn } from "@/types/cms";
import { safeEditorialLink } from "@/components/channel/editorialCopy";

const emptyForm = (): FirestoreFeaturedIn => ({ title: "", source: "", imageUrl: "", linkUrl: "", date: "" });

export default function FeaturedInManagement() {
  const { data: rows = [], isPending, isError, error, refetch } = useFeaturedIn();
  const saveItem = useSaveFeaturedIn();
  const deleteItem = useDeleteFeaturedIn();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<FirestoreFeaturedIn>(emptyForm());

  function startNew() { setEditingId(undefined); setForm(emptyForm()); setOpen(true); }
  function startEdit(row: FeaturedInRow) {
    setEditingId(row.id);
    setForm({ title: row.title, source: row.source, imageUrl: row.imageUrl, linkUrl: row.linkUrl ?? "", date: row.date ?? "" });
    setOpen(true);
  }
  async function save() {
    try {
      await saveItem.mutateAsync({ id: editingId, data: form });
      toast.success(editingId ? "Clipping updated" : "Clipping added");
      setOpen(false);
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save clipping."); }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this clipping?")) return;
    try { await deleteItem.mutateAsync(id); toast.success("Clipping deleted"); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not delete clipping."); }
  }

  return <AdminLayout title="Featured In">
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Add news clippings and coverage for the public Featured In page. The external article link is optional.</p>
        <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />Add clipping</Button>
      </div>
      {isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p role="alert" className="text-sm text-destructive">{error instanceof Error ? error.message : "Could not load clippings."} <Button variant="outline" size="sm" onClick={() => void refetch()}>Retry</Button></p>}
      {!isPending && rows.length === 0 && <p className="text-sm text-muted-foreground">No clippings have been added yet.</p>}
      <div className="grid gap-4 md:grid-cols-2">{rows.map((row) => <Card key={row.id}><CardContent className="flex gap-3 p-4">
        <img src={row.imageUrl} alt="" className="h-20 w-24 shrink-0 rounded-md border object-cover" />
        <div className="min-w-0 flex-1"><h3 className="font-semibold">{row.title}</h3><p className="text-sm text-muted-foreground">{row.source}{row.date ? ` · ${row.date}` : ""}</p>{safeEditorialLink(row.linkUrl) && <a href={safeEditorialLink(row.linkUrl)!} target="_blank" rel="noopener noreferrer" className="text-sm underline">Open article</a>}</div>
        <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${row.title}`} title={`Edit ${row.title}`} onClick={() => startEdit(row)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.title}`} title={`Delete ${row.title}`} onClick={() => void remove(row.id)}><Trash2 className="h-4 w-4" /></Button></div>
      </CardContent></Card>)}</div>
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingId ? "Edit clipping" : "Add clipping"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <label className="block space-y-1"><Label htmlFor="featured-title">Title</Label><Input id="featured-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
        <label className="block space-y-1"><Label htmlFor="featured-source">Publication or source</Label><Input id="featured-source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} /></label>
        <AdminImageUpload label="Clipping image" value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} onClear={() => setForm((current) => ({ ...current, imageUrl: "" }))} helperText="Upload a compressed image or enter an HTTPS image URL." />
        <label className="block space-y-1"><Label htmlFor="featured-image-url">Image URL</Label><Input id="featured-image-url" type="url" placeholder="https://example.com/clipping.jpg" value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} /></label>
        <label className="block space-y-1"><Label htmlFor="featured-link">Article URL (optional)</Label><Input id="featured-link" type="url" placeholder="https://example.com/article" value={form.linkUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} /><small className="text-muted-foreground">Leave blank to display the clipping without a link.</small></label>
        <label className="block space-y-1"><Label htmlFor="featured-date">Date (optional)</Label><Input id="featured-date" type="date" value={form.date ?? ""} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></label>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saveItem.isPending} onClick={() => void save()}>{saveItem.isPending ? "Saving…" : "Save"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </AdminLayout>;
}
