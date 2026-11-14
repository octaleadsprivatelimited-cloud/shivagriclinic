import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { VideoCard } from "@/components/channel/VideoCard";
import { SubscribeBanner } from "@/components/channel/SubscribeBanner";
import { useChannelSite } from "@/hooks/useChannelSite";
import { defaultChannelContent } from "@/data/channelContent";
import { topicLabel } from "@/i18n/channelI18n";

export default function Videos() {
  const { content, videos } = useChannelSite();
  const topics = ["", ...new Set([...defaultChannelContent.topics.items.map((topic) => topic.title), ...videos.map((video) => video.topic).filter((topic) => topic !== "Latest uploads")])];
  const [params, setParams] = useSearchParams();
  const selectedTopic = topics.includes(params.get("topic") || "") ? params.get("topic")! : "";
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => videos.filter((video) => {
    const topicMatch = !selectedTopic || video.topic === selectedTopic;
    const searchMatch = (video.title + " " + video.topic + " " + topicLabel(video.topic, content)).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
    return topicMatch && searchMatch;
  }), [videos, selectedTopic, search, content]);

  function selectTopic(topic: string) {
    setParams(topic ? { topic } : {});
  }

  return (
    <Layout>
      <SEO title={content.seo.videosTitle} description={content.seo.videosDescription} />
      <section className="channel-page-intro">
        <div className="channel-shell"><span className="channel-eyebrow channel-eyebrow-red">{content.library.eyebrow}</span><h1>{content.library.title}<br /><em>{content.library.accent}</em></h1><p>{content.library.description}</p></div>
      </section>
      <section className="channel-section channel-library-section">
        <div className="channel-shell">
          <div className="channel-library-tools">
            <div className="channel-topic-filters" role="group" aria-label={content.ui.filterLabel}>
              {topics.map((topic) => <button key={topic} type="button" className={selectedTopic === topic ? "is-selected" : ""} aria-pressed={selectedTopic === topic} onClick={() => selectTopic(topic)}>{topic ? topicLabel(topic, content) : content.library.allLabel}</button>)}
            </div>
            <label className="channel-search"><Search size={19} aria-hidden="true" /><span className="sr-only">{content.library.searchLabel}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={content.library.searchLabel} type="search" />{search && <button type="button" onClick={() => setSearch("")} aria-label={content.ui.clearSearchLabel}><X size={17} /></button>}</label>
          </div>
          <div className="channel-results-label"><span>{filtered.length} {filtered.length === 1 ? content.ui.videoSingular : content.ui.videoPlural}</span></div>
          {filtered.length ? <div className="channel-video-grid channel-library-grid">{filtered.map((video, index) => <VideoCard key={video.id} video={video} index={index} />)}</div> : <div className="channel-empty"><h2>{content.library.emptyTitle}</h2><p>{content.library.emptyDescription}</p><button type="button" className="channel-button channel-button-yellow" onClick={() => { setSearch(""); selectTopic(""); }}>{content.library.resetLabel}</button></div>}
        </div>
      </section>
      <SubscribeBanner />
    </Layout>
  );
}
