import { Link } from "react-router-dom";
import { ArrowUpRight, Youtube } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { SubscribeBanner } from "@/components/channel/SubscribeBanner";
import { videoThumbnail } from "@/data/channelVideos";
import { useChannelSite } from "@/hooks/useChannelSite";

export default function About() {
  const { content, featured } = useChannelSite();
  return (
    <Layout>
      <SEO title={content.seo.aboutTitle} description={content.seo.aboutDescription} />
      <section className="channel-page-intro channel-about-intro"><div className="channel-shell"><span className="channel-eyebrow channel-eyebrow-red">{content.about.eyebrow}</span><h1>{content.about.title}<br /><em>{content.about.accent}</em></h1><p>{content.about.intro}</p></div></section>
      <section className="channel-section"><div className="channel-shell channel-about-grid">
        <div className="channel-about-portrait"><img src={content.story.imageUrl} alt={content.story.imageAlt} /><span>{content.story.imageCaption}</span></div>
        <div className="channel-about-copy"><span className="channel-eyebrow channel-eyebrow-red">{content.about.creatorEyebrow}</span><h2>{content.about.creatorTitle}</h2><p>{content.about.paragraphOne}</p><p>{content.about.paragraphTwo}</p><a href={content.brand.youtubeUrl} className="channel-button channel-button-dark" target="_blank" rel="noopener noreferrer"><Youtube size={20} /> {content.about.buttonLabel} <ArrowUpRight size={18} /></a></div>
      </div></section>
      <section className="channel-about-video-section"><div className="channel-shell channel-about-video-grid"><div><span className="channel-eyebrow channel-eyebrow-red">{content.about.videosEyebrow}</span><h2>{content.about.videosTitle}</h2><p>{content.about.videosDescription}</p><Link className="channel-text-link" to="/videos">{content.about.videosLinkLabel} <ArrowUpRight size={18} /></Link></div>{featured && <Link to={`/watch/${featured.id}`} className="channel-about-preview" aria-label={`${content.ui.watchVideoLabel} ${featured.title}`}><img src={videoThumbnail(featured.id, featured.thumbnail)} alt="" loading="lazy" /><span>{featured.title}</span></Link>}</div></section>
      <SubscribeBanner />
    </Layout>
  );
}
