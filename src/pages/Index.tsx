import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Clapperboard, Flower2, Play, Sprout, Waves, Youtube, Apple } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { VideoCard } from "@/components/channel/VideoCard";
import { SubscribeBanner } from "@/components/channel/SubscribeBanner";
import { PartnerMarquee } from "@/components/channel/PartnerMarquee";
import { SocialCounts } from "@/components/channel/SocialCounts";
import { Testimonials } from "@/components/channel/Testimonials";
import { videoThumbnail } from "@/data/channelVideos";
import { useChannelSite } from "@/hooks/useChannelSite";
import { defaultChannelContent, type TopicCard } from "@/data/channelContent";
import "@/hero-appearance.css";

const topicIcons = { flower: Flower2, story: Clapperboard, water: Waves, sprout: Sprout, fruit: Apple };
const stepIcons = [Flower2, Play, Youtube];

export default function Index() {
  const { content, videos, featured } = useChannelSite();
  const remainingVideos = featured ? videos.filter((video) => video.id !== featured.id) : videos;
  const topicCards = content.topics.items.filter((item): item is TopicCard => Boolean(item?.title));
  const desktopFade = content.appearance.heroFadeDesktop / 100;
  const mobileFade = content.appearance.heroFadeMobile / 100;
  const heroStyle = {
    backgroundImage: `url(${JSON.stringify(content.hero.backgroundUrl)})`,
    "--channel-hero-desktop-alpha-1": String(.96 * desktopFade),
    "--channel-hero-desktop-alpha-2": String(.87 * desktopFade),
    "--channel-hero-desktop-alpha-3": String(.45 * desktopFade),
    "--channel-hero-desktop-alpha-4": String(.2 * desktopFade),
    "--channel-hero-mobile-alpha-1": String(.6 * mobileFade),
    "--channel-hero-mobile-alpha-2": String(.72 * mobileFade),
    "--channel-hero-mobile-alpha-3": String(.9 * mobileFade),
    "--channel-hero-mobile-alpha-4": String(mobileFade),
  } as CSSProperties;

  return (
    <Layout>
      <SEO title={content.seo.homeTitle} description={content.seo.homeDescription} />

      <section className="channel-hero channel-hero-farm" style={heroStyle}>
        <div className="channel-shell channel-hero-grid">
          <div className="channel-hero-copy">
            <span className="channel-eyebrow"><span className="channel-live-dot" /> {content.hero.eyebrow}</span>
            <h1>{content.hero.title}<br /><em>{content.hero.accent}</em></h1>
            <p>{content.hero.description}</p>
            <div className="channel-hero-actions">
              <Link className="channel-button channel-button-yellow" to="/videos"><Play size={18} fill="currentColor" aria-hidden="true" /> {content.hero.primaryLabel} <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <a className="channel-button channel-button-white" href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube size={19} aria-hidden="true" /> {content.hero.secondaryLabel} <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <div className="channel-hero-note"><span className="channel-note-dots" aria-hidden="true"><i>F</i><i>V</i><i>S</i></span><span>{content.hero.note}</span></div>
          </div>
          <div className="channel-hero-visual">
            <span className="channel-handnote channel-handnote-top">{content.hero.handnoteTop} <span aria-hidden="true">↘</span></span>
            <span className="channel-mint-sticker" aria-hidden="true">{content.hero.sticker}</span>
            <span className="channel-coral-burst" aria-hidden="true">✦</span>
            {featured ? <Link className="channel-hero-feature" to={`/watch/${featured.id}`} aria-label={`${content.ui.watchVideoLabel} ${featured.title}`}>
              <span className="channel-browser-bar" aria-hidden="true"><span><i /><i /><i /></span><strong>{content.brand.name.toUpperCase()} / {content.hero.browserLabel}</strong><ArrowUpRight size={17} /></span>
              <span className="channel-feature-image"><img src={videoThumbnail(featured.id, featured.thumbnail)} alt="" onError={(event) => { event.currentTarget.src = content.hero.backgroundUrl; }} /><span className="channel-feature-play"><Play size={30} fill="currentColor" aria-hidden="true" /></span></span>
              <span className="channel-feature-bottom"><strong>{featured.title}</strong></span>
            </Link> : <div className="channel-hero-feature channel-hero-feature-empty"><img src={content.hero.backgroundUrl} alt="" /><span>{content.ui.emptyFeatureLabel}</span></div>}
            <span className="channel-handnote channel-handnote-bottom">{content.hero.handnoteBottom} <span aria-hidden="true">↗</span></span>
            <span className="channel-circle-sticker" aria-hidden="true">{content.hero.circleSticker}<br />↗</span>
          </div>
        </div>
        <div className="channel-hero-edge" aria-hidden="true">{content.hero.scrollLabel} <ArrowDownRight size={15} /></div>
      </section>

      <PartnerMarquee partners={content.partners} />

      <section className="channel-capabilities" aria-label={content.nav.exploreHeading}>
        <div className="channel-shell channel-capabilities-grid">
          {content.highlights.items.map((item, index) => <div key={`${item.title}-${index}`}><span aria-hidden="true">{["✦", "↗", "✳", "▷"][index % 4]}</span><strong>{item.title}</strong><small>{item.description}</small></div>)}
        </div>
      </section>

      <SocialCounts content={content} />

      <section className="channel-section channel-featured-section">
        <div className="channel-shell">
          <div className="channel-section-heading"><div><span className="channel-eyebrow channel-eyebrow-red">{content.featured.eyebrow}</span><h2>{content.featured.title}</h2></div><Link className="channel-button channel-button-white" to="/videos">{content.featured.viewAllLabel} <ArrowUpRight size={18} /></Link></div>
          {remainingVideos.length ? <div className="channel-video-grid">{remainingVideos.slice(0, 6).map((video, index) => <VideoCard key={video.id} video={video} index={index} />)}</div> : <p className="channel-empty">{content.ui.emptyVideosLabel}</p>}
        </div>
      </section>

      <section className="channel-topics-section">
        <div className="channel-shell">
          <div className="channel-section-heading"><div><span className="channel-eyebrow channel-eyebrow-red">{content.topics.eyebrow}</span><h2>{content.topics.title}</h2></div><p>{content.topics.description}</p></div>
          <div className="channel-topic-grid">{topicCards.map((topic, index) => {
            const Icon = topicIcons[topic.icon] || Sprout;
            return <Link key={`${topic.title}-${index}`} to={`/videos?topic=${encodeURIComponent(defaultChannelContent.topics.items[index]?.title || topic.title)}`} className="channel-topic-card"><span className="channel-topic-number">{String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={21} aria-hidden="true" /><Icon className="channel-topic-icon" size={40} strokeWidth={1.7} aria-hidden="true" /><span><strong>{topic.title}</strong><small>{topic.description}</small></span></Link>;
          })}</div>
        </div>
      </section>

      <section className="channel-story-section"><div className="channel-shell channel-story-grid">
        <div className="channel-story-image"><img src={content.story.imageUrl} alt={content.story.imageAlt} loading="lazy" /><span>{content.story.imageCaption}</span></div>
        <div className="channel-story-copy"><span className="channel-eyebrow channel-eyebrow-red">{content.story.eyebrow}</span><h2>{content.story.title}</h2><p>{content.story.paragraphOne}</p><p>{content.story.paragraphTwo}</p><Link className="channel-text-link" to="/about">{content.story.linkLabel} <ArrowUpRight size={18} /></Link></div>
      </div></section>

      <Testimonials content={content.testimonials} />

      <section className="channel-steps-section" id="how-to-watch"><div className="channel-shell">
        <div className="channel-section-heading"><div><span className="channel-eyebrow">{content.steps.eyebrow}</span><h2>{content.steps.title}</h2></div><p>{content.steps.description}</p></div>
        <div className="channel-steps-grid">{content.steps.items.map((item, index) => { const Icon = stepIcons[index % stepIcons.length]; return <div className="channel-step-card" key={`${item.title}-${index}`}><span>{index + 1}</span><Icon size={42} strokeWidth={1.6} aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p></div>; })}</div>
      </div></section>
      <SubscribeBanner />
    </Layout>
  );
}
