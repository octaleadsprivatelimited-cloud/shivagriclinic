import { defaultChannelContent, resolveChannelContent, type ChannelContent, type ChannelCopy } from "@/data/channelContent";
import { builtInTranslations } from "@/data/channelTranslations";
import { useChannelContent } from "@/hooks/useChannelContent";
import { useLanguage } from "./LanguageContext";

export function localizeContent(content: ChannelContent, language: "en" | "te" | "hi"): ChannelCopy {
  return resolveChannelContent(content, language, builtInTranslations);
}

export function useLocalizedChannelContent(): ChannelCopy {
  const { data = defaultChannelContent } = useChannelContent();
  const { language } = useLanguage();
  return localizeContent(data, language);
}

export function topicLabel(topic: string, content: ChannelCopy): string {
  if (topic === "Latest uploads") return content.ui.latestUploadsLabel;
  const index = defaultChannelContent.topics.items.findIndex((item) => item.title === topic);
  return index < 0 ? topic : content.topics.items[index]?.title || topic;
}
