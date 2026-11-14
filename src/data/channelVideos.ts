import type { VideoRow } from "@/hooks/useCmsFirestore";

export type FeedVideo = { id: string; title: string; publishedAt?: string; thumbnail?: string };
export type ChannelVideo = FeedVideo & { topic: string; order?: number; source: "youtube" | "managed" };

const excludedTopics = /drone|pesticide|spray|sprayer|shredder|pulverizer|chemical|product|equipment|shoe|seed solution/i;
const youtubeId = /^[\w-]{11}$/;

export function topicFor(title: string): string {
  const content = title.toLowerCase();
  if (/jasmine|flower|floriculture|leaf/.test(content)) return "Flower farming";
  if (/fruit|orchard/.test(content)) return "Fruit farming";
  if (/irrigation|water|drip/.test(content)) return "Water & irrigation";
  if (/organic|vermicompost|natural fertilizer|compost/.test(content)) return "Organic practices";
  if (/goat|sheep|pig|livestock|farm visit|farmer/.test(content)) return "Farm stories";
  return "Latest uploads";
}

export function getChannelVideos(managed: VideoRow[] = [], feed: FeedVideo[] = []): ChannelVideo[] {
  const managedById = new Map(managed.filter((video) => youtubeId.test(video.id)).map((video) => [video.id, video]));
  const rows: ChannelVideo[] = [];
  const seen = new Set<string>();

  for (const item of feed) {
    if (!youtubeId.test(item.id)) continue;
    const override = managedById.get(item.id);
    if (override?.hidden) { seen.add(item.id); continue; }
    if (excludedTopics.test(item.title)) { seen.add(item.id); continue; }
    const title = override?.title?.trim() || item.title;
    const topic = override?.category?.trim() || topicFor(title);
    if (excludedTopics.test(title + " " + topic)) { seen.add(item.id); continue; }
    rows.push({ ...item, title, topic, order: override?.order, source: "youtube" });
    seen.add(item.id);
  }

  for (const item of managed) {
    if (seen.has(item.id) || item.hidden || !youtubeId.test(item.id)) continue;
    const topic = item.category?.trim() || topicFor(item.title);
    if (excludedTopics.test(item.title + " " + topic)) continue;
    rows.push({ id: item.id, title: item.title, topic, order: item.order, source: "managed" });
    seen.add(item.id);
  }

  return rows.sort((a, b) => {
    const aRank = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
    const bRank = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return (b.publishedAt || "").localeCompare(a.publishedAt || "");
  });
}

export function videoThumbnail(id: string, thumbnail?: string): string {
  return thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
