import type { VideoRow } from "@/hooks/useCmsFirestore";

export type FeedVideo = { id: string; title: string; publishedAt?: string; thumbnail?: string };
export type ChannelVideo = FeedVideo & { topic: string; order?: number; source: "youtube" | "managed" };

export const videoTopics = ["Flower farming", "Vegetable farming", "Animal Farming", "Organic practices", "Fruit farming", "Farm machineries"] as const;

const excludedTopics = /drone|pesticide|spray|sprayer|chemical|product|shoe|seed solution|డ్రోన్|పురుగు\s*మందు|క్రిమిసంహారక|స్ప్రే|ड्रोन|कीटनाशक|स्प्रे/i;
const youtubeId = /^[\w-]{11}$/;

export function topicFor(title: string): string {
  const content = title.toLowerCase();
  if (/\b(jasmine|flower|floriculture|marigold|rose|chrysanthemum|lily|gerbera)\b|పూల|పూలు|మల్లె|फूल|चमेली/.test(content)) return "Flower farming";
  if (/\b(vegetable|cabbage|tomato|chilli|chili|brinjal|eggplant|okra|lady.?finger|cauliflower|carrot|cucumber|onion|potato|gourd|beans|spinach|ginger|turmeric)\b|కూరగాయ|క్యాబేజీ|టమాట|మిరప|వంకాయ|గోబీ|అల్లం|పసుపు|सब्ज|गोभी|टमाटर|मिर्च|बैंगन|अदरक|हल्दी/.test(content)) return "Vegetable farming";
  if (/\b(cow|cattle|buffalo|dairy|goat|sheep|pig|livestock|poultry|chicken|animal husbandry|fish farming)\b|పశు|గేదె|ఆవు|మేక|గొర్రె|కోళ్ల|डेयरी|पशु|गाय|बकरी|भेड़|मुर्गी/.test(content)) return "Animal Farming";
  if (/\b(tractor|machine|machinery|harvester|tiller|shredder|pulverizer|rotavator|thresher|seeder|transplanter|cultivator|baler|farm equipment|power weeder|irrigation pump|drip irrigation)\b|ట్రాక్టర్|యంత్ర|మిషన్|మిషినరీ|मशीन|ट्रैक्टर/.test(content)) return "Farm machineries";
  if (/\b(organic|vermicompost|natural farming|natural fertilizer|compost|biofertilizer|sustainable farming)\b|సేంద్రియ|సహజ సాగు|जैविक|प्राकृतिक खेती/.test(content)) return "Organic practices";
  if (/\b(fruit|orchard|mango|banana|guava|papaya|pomegranate|dragon fruit|citrus|orange|grape|apple farming)\b|పండ్ల|మామిడి|అరటి|జామ|फल|आम|केला|अमरूद/.test(content)) return "Fruit farming";
  return "Latest uploads";
}

export function normalizeVideoTopic(category: string | undefined, title: string): string {
  const selected = category?.trim();
  if (selected === "Latest uploads" || videoTopics.some((topic) => topic === selected)) return selected;
  // Retired category names and arbitrary old values should be reclassified from
  // the video title, so homepage links always lead to a real category filter.
  return topicFor(title);
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
    const topic = normalizeVideoTopic(override?.category, title);
    if (excludedTopics.test(title + " " + topic)) { seen.add(item.id); continue; }
    rows.push({ ...item, title, topic, order: override?.order, source: "youtube" });
    seen.add(item.id);
  }

  for (const item of managed) {
    if (seen.has(item.id) || item.hidden || !youtubeId.test(item.id)) continue;
    const topic = normalizeVideoTopic(item.category, item.title);
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
