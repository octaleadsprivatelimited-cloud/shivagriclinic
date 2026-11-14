import { defaultChannelContent } from "@/data/channelContent";
import { getChannelVideos } from "@/data/channelVideos";
import { useChannelContent } from "@/hooks/useChannelContent";
import { useYouTubeFeed } from "@/hooks/useYouTubeFeed";
import { useVideos } from "@/hooks/useCmsFirestore";
import { localizeContent } from "@/i18n/channelI18n";
import { useLanguage } from "@/i18n/LanguageContext";

export function useChannelSite() {
  const { language } = useLanguage();
  const contentQuery = useChannelContent();
  const videosQuery = useVideos();
  const feedQuery = useYouTubeFeed();
  const content = localizeContent(contentQuery.data || defaultChannelContent, language);
  const feed = feedQuery.data || [];
  const managed = videosQuery.data || [];
  const videos = getChannelVideos(managed, feed);
  const featured = videos.find((video) => video.id === content.hero.featuredVideoId) || videos[0];

  return { content, videos, featured, managed, feed, contentQuery, videosQuery, feedQuery };
}
