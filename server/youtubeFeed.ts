export type YouTubeFeedVideo = {
  id: string;
  title: string;
  publishedAt?: string;
  thumbnail: string;
};

const DEFAULT_CHANNEL_ID = "UC2FhRhxSEAjEO9e0H94G5Wg";
const CACHE_MS = 5 * 60 * 1000;
const MAX_FEED_CHARS = 1_000_000;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;

let cached: { at: number; videos: YouTubeFeedVideo[] } | null = null;
let pending: Promise<YouTubeFeedVideo[]> | null = null;

function xmlText(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    const names: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
    };
    const lower = entity.toLowerCase();
    if (lower in names) return names[lower];
    const codePoint = lower.startsWith("#x")
      ? Number.parseInt(lower.slice(2), 16)
      : Number.parseInt(lower.slice(1), 10);
    return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  });
}

function tag(entry: string, name: string): string | undefined {
  const match = entry.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? xmlText(match[1].trim()) : undefined;
}

/** Parse the public Atom feed for one channel. Feed content remains untrusted text. */
export function parseYouTubeFeed(xml: string): YouTubeFeedVideo[] {
  if (xml.length > MAX_FEED_CHARS || !xml.includes("<feed")) return [];
  const videos: YouTubeFeedVideo[] = [];
  const seen = new Set<string>();

  for (const match of xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)) {
    const entry = match[1];
    const id = tag(entry, "yt:videoId");
    const title = tag(entry, "title");
    if (!id || !VIDEO_ID.test(id) || !title || seen.has(id)) continue;
    seen.add(id);

    const publishedAt = tag(entry, "published");
    videos.push({
      id,
      title,
      ...(publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? { publishedAt } : {}),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }

  return videos;
}

async function fetchRssVideos(channelId: string): Promise<YouTubeFeedVideo[]> {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    { headers: { accept: "application/atom+xml, application/xml;q=0.9" }, signal: AbortSignal.timeout(8_000) },
  );
  if (!response.ok) throw new Error(`YouTube feed returned ${response.status}`);
  const xml = await response.text();
  const videos = parseYouTubeFeed(xml);
  if (!videos.length) throw new Error("YouTube feed had no usable videos");
  return videos;
}

type UploadsResponse = { items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[] };
type PlaylistResponse = {
  items?: {
    contentDetails?: { videoId?: string; videoPublishedAt?: string };
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: Record<string, { url?: string }>;
    };
  }[];
};

async function fetchApiJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`YouTube API returned ${response.status}`);
  return await response.json() as T;
}

/** The official uploads playlist supplies recent videos when the public RSS feed fails. */
async function fetchDataApiVideos(channelId: string, apiKey: string): Promise<YouTubeFeedVideo[]> {
  const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelsUrl.search = new URLSearchParams({ part: "contentDetails", id: channelId, key: apiKey }).toString();
  const channels = await fetchApiJson<UploadsResponse>(channelsUrl);
  const uploads = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads || !/^[A-Za-z0-9_-]+$/.test(uploads)) throw new Error("YouTube uploads playlist unavailable");

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.search = new URLSearchParams({ part: "snippet,contentDetails", playlistId: uploads, maxResults: "50", key: apiKey }).toString();
  const playlist = await fetchApiJson<PlaylistResponse>(playlistUrl);
  const seen = new Set<string>();
  const videos: YouTubeFeedVideo[] = [];
  for (const item of playlist.items || []) {
    const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title?.trim();
    if (!id || !VIDEO_ID.test(id) || !title || /^(private|deleted) video$/i.test(title) || seen.has(id)) continue;
    const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
    const suppliedThumbnail = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url;
    const thumbnail = suppliedThumbnail?.startsWith("https://")
      ? suppliedThumbnail
      : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    videos.push({ id, title, ...(publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? { publishedAt } : {}), thumbnail });
    seen.add(id);
  }
  if (!videos.length) throw new Error("YouTube uploads playlist had no usable videos");
  return videos;
}

async function fetchYouTubeVideos(env: NodeJS.ProcessEnv): Promise<YouTubeFeedVideo[]> {
  const channelId = env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  if (!CHANNEL_ID.test(channelId)) throw new Error("Invalid YouTube channel ID");
  const apiKey = env.YOUTUBE_API_KEY?.trim();
  let videos: YouTubeFeedVideo[];
  if (apiKey) {
    try {
      videos = await fetchDataApiVideos(channelId, apiKey);
    } catch {
      videos = await fetchRssVideos(channelId);
    }
  } else {
    videos = await fetchRssVideos(channelId);
  }
  cached = { at: Date.now(), videos };
  return videos;
}

/** Cached for five minutes, with the last good response retained if YouTube is briefly down. */
export async function getYouTubeVideos(env: NodeJS.ProcessEnv = process.env): Promise<YouTubeFeedVideo[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.videos;
  if (!pending) pending = fetchYouTubeVideos(env).finally(() => { pending = null; });
  try {
    return await pending;
  } catch (error) {
    if (cached) return cached.videos;
    throw error;
  }
}
