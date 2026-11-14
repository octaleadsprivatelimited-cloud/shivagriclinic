import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { VideoCard } from "@/components/channel/VideoCard";
import { useChannelSite } from "@/hooks/useChannelSite";

const cropTitle = /crop|farm|cultivat|irrigat|water|ginger|maize|jowar|cotton|cabbage|beans|flower|fruit|సాగు|పంట|నీరు|सिंचाई|खेती|फ़सल/i;
const unrelatedTitle = /goat|sheep|pig|poultry|expo/i;

export default function CropManagement() {
  const { content, videos } = useChannelSite();
  const cropVideos = videos.filter((video) => cropTitle.test(video.title) && !unrelatedTitle.test(video.title)).slice(0, 9);

  return (
    <Layout>
      <SEO title={content.seo.cropManagementTitle} description={content.seo.cropManagementDescription} />
      <section className="channel-page-intro">
        <div className="channel-shell">
          <span className="channel-eyebrow channel-eyebrow-red">{content.cropManagement.eyebrow}</span>
          <h1>{content.cropManagement.title}</h1>
          <p>{content.cropManagement.intro}</p>
        </div>
      </section>
      <section className="channel-section channel-crop-section">
        <div className="channel-shell">
          <div className="channel-section-heading">
            <div><span className="channel-eyebrow channel-eyebrow-red">{content.cropManagement.videosEyebrow}</span><h2>{content.cropManagement.videosTitle}</h2></div>
            <Link className="channel-button channel-button-white" to="/contact">{content.cropManagement.contactLabel} <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          {cropVideos.length ? <div className="channel-video-grid">{cropVideos.map((video, index) => <VideoCard key={video.id} video={video} index={index} />)}</div> : <p className="channel-empty">{content.cropManagement.emptyLabel}</p>}
        </div>
      </section>
    </Layout>
  );
}
