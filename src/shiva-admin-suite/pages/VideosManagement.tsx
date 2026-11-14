import { useState } from "react";
import { toast } from "sonner";
import { Edit, EyeOff, Plus, Trash2, Youtube } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteVideo, useSaveVideo, useVideos, type VideoRow } from "@/hooks/useCmsFirestore";
import { useYouTubeFeed } from "@/hooks/useYouTubeFeed";
import { getChannelVideos, topicFor, videoThumbnail } from "@/data/channelVideos";
import type { FirestoreVideo } from "@/types/cms";

const emptyVideo = (): FirestoreVideo => ({ id: "", title: "", category: "", order: undefined, hidden: false });
const youtubeId = /^[\w-]{11}$/;

export default function VideosManagement() {
  const { data: saved = [], isPending: loadingSaved, isError: savedError } = useVideos();
  const { data: feed = [], isPending: loadingFeed, isError: feedError, refetch } = useYouTubeFeed();
  const saveVideo = useSaveVideo();
  const deleteVideo = useDeleteVideo();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FirestoreVideo>(emptyVideo());
  const [editingDocId, setEditingDocId] = useState<string | undefined>();
  const visible = new Set(getChannelVideos(saved, feed).map((video) => video.id));
  const feedIds = new Set(feed.map((item) => item.id));
  const list = [
    ...feed.map((item) => ({
      id: item.id, title: saved.find((row) => row.id === item.id)?.title || item.title,
      category: saved.find((row) => row.id === item.id)?.category || topicFor(item.title),
      thumbnail: item.thumbnail, row: saved.find((row) => row.id === item.id), source: "YouTube upload",
    })),
    ...saved.filter((row) => !feedIds.has(row.id)).map((row) => ({ id: row.id, title: row.title, category: row.category, thumbnail: undefined as string | undefined, row, source: "Manually added" })),
  ];

  function edit(item?: { id: string; title: string; category: string; row?: VideoRow }) {
    setEditingDocId(item?.row?.docId || item?.row?.id);
    setForm(item ? { id: item.id, title: item.title, category: item.category, hidden: item.row?.hidden || false, order: item.row?.order } : emptyVideo());
    setDialogOpen(true);
  }

  async function save() {
    if (!youtubeId.test(form.id.trim())) { toast.error("Enter a valid 11-character YouTube video ID."); return; }
    if (!form.title.trim()) { toast.error("Enter a video title."); return; }
    try {
      await saveVideo.mutateAsync({ id: editingDocId, data: { ...form, id: form.id.trim(), title: form.title.trim(), category: form.category.trim() } });
      toast.success("Video saved.");
      setDialogOpen(false);
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save video."); }
  }

  async function remove(row: VideoRow) {
    if (!window.confirm("Remove this saved video entry? An automatic upload may reappear unless hidden.")) return;
    try { await deleteVideo.mutateAsync(row.docId || row.id); toast.success("Saved entry removed."); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not remove video."); }
  }

  async function hide(item: { id: string; title: string; category: string; row?: VideoRow }) {
    try {
      await saveVideo.mutateAsync({ id: item.row?.docId || item.row?.id, data: { id: item.id, title: item.title, category: item.category, order: item.row?.order, hidden: !(item.row?.hidden || false) } });
      toast.success(item.row?.hidden ? "Video is visible again." : "Video hidden from the public site.");
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not update video."); }
  }

  return <AdminLayout title="Video management"><div className="mx-auto max-w-6xl space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold">YouTube uploads & site videos</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">The latest public uploads sync automatically. Customize titles and topics, choose display order, or hide a video. Drones, pesticides, sprayers and equipment are excluded by default.</p></div><Button onClick={() => edit()}><Plus className="mr-2 h-4 w-4" />Add video</Button></div>
    {feedError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">The YouTube feed is unavailable. Saved videos can still be edited. <button type="button" className="underline" onClick={() => void refetch()}>Retry</button></p>}
    {(loadingFeed || loadingSaved) && <p className="text-sm text-muted-foreground">Loading videos…</p>}
    {savedError && <p role="alert" className="text-sm text-destructive">Saved video entries could not be loaded.</p>}
    <div className="grid gap-3 sm:grid-cols-2">{list.map((item) => <article key={item.id} className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <img src={videoThumbnail(item.id, item.thumbnail)} alt="" className="aspect-video w-28 shrink-0 rounded-md object-cover" />
      <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{item.source} · {visible.has(item.id) ? "Visible" : "Hidden or filtered"}</p><h3 className="mt-1 line-clamp-2 text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.category}{item.row?.order != null ? ` · Order ${item.row.order}` : ""}</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => edit(item)}><Edit className="mr-1 h-3 w-3" /> Edit</Button><Button type="button" variant="outline" size="sm" onClick={() => void hide(item)}><EyeOff className="mr-1 h-3 w-3" />{item.row?.hidden ? "Show" : "Hide"}</Button>{item.row && <Button type="button" variant="ghost" size="sm" onClick={() => void remove(item.row!)}><Trash2 className="mr-1 h-3 w-3" />Remove override</Button>}</div></div>
    </article>)}</div>
    {!list.length && !loadingFeed && !loadingSaved && <p className="rounded-lg border p-5 text-sm text-muted-foreground">No videos yet. Add a video or check the YouTube feed connection.</p>}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-auto"><DialogHeader><DialogTitle>{editingDocId ? "Edit video" : "Add or customize video"}</DialogTitle></DialogHeader><div className="space-y-4 py-2">
      <label className="block space-y-1"><Label htmlFor="video-id">YouTube video ID</Label><Input id="video-id" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="11-character ID" /></label>
      <label className="block space-y-1"><Label htmlFor="video-title">Title</Label><Input id="video-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="block space-y-1"><Label htmlFor="video-topic">Topic</Label><Input id="video-topic" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Flower farming" /></label>
      <label className="block space-y-1"><Label htmlFor="video-order">Display order (optional)</Label><Input id="video-order" type="number" value={form.order ?? ""} onChange={(event) => setForm({ ...form, order: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.hidden)} onChange={(event) => setForm({ ...form, hidden: event.target.checked })} /> Hide from public site</label>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Youtube className="h-4 w-4" />Featured video is selected under Website content → Hero.</p>
    </div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={() => void save()} disabled={saveVideo.isPending}>{saveVideo.isPending ? "Saving…" : "Save video"}</Button></DialogFooter></DialogContent></Dialog>
  </div></AdminLayout>;
}
