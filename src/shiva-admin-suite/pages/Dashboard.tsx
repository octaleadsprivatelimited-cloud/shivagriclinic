import { Link } from "react-router-dom";
import { ArrowUpRight, PanelsTopLeft, Video, Youtube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "../components/AdminLayout";
import { useChannelSite } from "@/hooks/useChannelSite";
import { channelStorageMode } from "@/hooks/useChannelContent";

export default function Dashboard() {
  const { content, videos, managed, feed, feedQuery } = useChannelSite();
  const mode = channelStorageMode();

  return <AdminLayout title="Channel overview"><div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-semibold text-primary">{content.brand.name}</p><h2 className="mt-2 text-3xl font-bold">Your channel website</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Edit website content and manage how YouTube uploads appear for visitors.</p></div>
    {mode === "local" && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Local preview: edits remain in this browser. Configure Firebase before publishing a shared editable site.</p>}
    {feedQuery.isError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Latest YouTube uploads are temporarily unavailable. Saved videos remain available.</p>}
    <div className="grid gap-4 sm:grid-cols-3">
      {[{ label: "Public videos", value: videos.length, Icon: Video }, { label: "Latest uploads", value: feed.length, Icon: Youtube }, { label: "Saved customizations", value: managed.length, Icon: PanelsTopLeft }].map(({ label, value, Icon }) => <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div><Icon className="h-7 w-7 text-primary" /></CardContent></Card>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-2"><Link to="/admin/content" className="rounded-xl border bg-card p-6 hover:bg-muted"><PanelsTopLeft className="mb-3 h-7 w-7 text-primary" /><h3 className="font-semibold">Edit website content</h3><p className="mt-1 text-sm text-muted-foreground">Hero, sections, topics, About, legal pages, links and metadata.</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open editor <ArrowUpRight className="h-4 w-4" /></span></Link><Link to="/admin/videos" className="rounded-xl border bg-card p-6 hover:bg-muted"><Video className="mb-3 h-7 w-7 text-primary" /><h3 className="font-semibold">Manage videos</h3><p className="mt-1 text-sm text-muted-foreground">Customize uploads, add videos, reorder or hide entries.</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open video manager <ArrowUpRight className="h-4 w-4" /></span></Link></div>
    <a href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Open YouTube channel <ArrowUpRight className="h-4 w-4" /></a>
  </div></AdminLayout>;
}
