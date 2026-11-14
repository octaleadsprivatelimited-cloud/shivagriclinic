import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Youtube } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { VideoCard } from "@/components/channel/VideoCard";
import { useChannelSite } from "@/hooks/useChannelSite";
import NotFound from "./NotFound";

export default function Watch() {
  const { id } = useParams();
  const { content, videos, feedQuery, videosQuery } = useChannelSite();
  const video = videos.find((item) => item.id === id);
  if (!video && (feedQuery.isPending || videosQuery.isPending)) return <div className="channel-loading" role="status">{content.ui.loadingVideoLabel}</div>;
  if (!video) return <NotFound />;
  const related = videos.filter((item) => item.id !== video.id && item.topic === video.topic).concat(videos.filter((item) => item.id !== video.id && item.topic !== video.topic)).slice(0, 3);

  return (
    <Layout>
      <SEO title={video.title} description={`${content.ui.watchVideoLabel}: ${video.title} — ${content.brand.name}. ${content.featured.description}`} image={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} type="video.other" video={video} />
      <section className="channel-watch-section"><div className="channel-shell">
        <Link className="channel-watch-back" to="/videos"><ArrowLeft size={17} /> {content.watch.backLabel}</Link>
        <div className="channel-watch-layout"><div>
          <div className="channel-player"><iframe src={"https://www.youtube-nocookie.com/embed/" + video.id + "?rel=0"} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
          <div className="channel-watch-meta"><h1>{video.title}</h1><a href={"https://www.youtube.com/watch?v=" + video.id} target="_blank" rel="noopener noreferrer">{content.watch.youtubeLabel} <ArrowUpRight size={18} /></a></div>
        </div><aside className="channel-watch-aside"><span className="channel-eyebrow">{content.watch.relatedEyebrow}</span><h2>{content.watch.relatedTitle}</h2><div>{related.map((item) => <VideoCard key={item.id} video={item} />)}</div><a href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer" className="channel-text-link"><Youtube size={19} /> {content.nav.youtube} <ArrowUpRight size={16} /></a></aside></div>
      </div></section>
    </Layout>
  );
}
