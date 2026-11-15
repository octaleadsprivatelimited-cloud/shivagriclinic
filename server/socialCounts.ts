/** Server-only social counts from the official YouTube and Meta APIs. */
export type SocialCountValues = {
  youtubeSubscribers?: string;
  facebookFollowers?: string;
  instagramFollowers?: string;
  updatedAt?: string;
};

export type SocialCountSnapshot = {
  values: SocialCountValues;
  /** Remaining lifetime of a successful snapshot. Zero means do not cache at the edge. */
  cacheSeconds: number;
};

type SocialCountKey = "youtubeSubscribers" | "facebookFollowers" | "instagramFollowers";
type ServerEnv = Record<string, string | undefined>;
type CountTask = { key: SocialCountKey; get: () => Promise<string> };

const WEEK_SECONDS = 7 * 24 * 60 * 60;
const RETRY_SECONDS = 5 * 60;
const DEFAULT_CHANNEL_ID = "UC2FhRhxSEAjEO9e0H94G5Wg";
const META_VERSION = "v27.0";

let cached: { expiresAt: number; values: SocialCountValues; cacheable: boolean } | null = null;
let pending: Promise<SocialCountSnapshot> | null = null;

function countString(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 && value <= 999_999_999_999 ? String(value) : null;
  }
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) return null;
  const count = Number(value);
  return Number.isSafeInteger(count) ? String(count) : null;
}

async function readJson(url: URL): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("Social platform request failed");
  return response.json() as Promise<unknown>;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

async function youtubeSubscribers(channelId: string, apiKey: string): Promise<string> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);
  const body = record(await readJson(url));
  const first = Array.isArray(body?.items) ? record(body.items[0]) : null;
  const statistics = record(first?.statistics);
  if (statistics?.hiddenSubscriberCount === true) throw new Error("Subscriber count is hidden");
  const count = countString(statistics?.subscriberCount);
  if (count === null) throw new Error("Subscriber count is unavailable");
  return count;
}

async function metaFollowers(id: string, token: string, field: "followers_count"): Promise<string> {
  const url = new URL("https://graph.facebook.com");
  url.pathname = "/" + META_VERSION + "/" + id;
  url.searchParams.set("fields", field);
  url.searchParams.set("access_token", token);
  const body = record(await readJson(url));
  const count = countString(body?.[field]);
  if (count === null) throw new Error("Follower count is unavailable");
  return count;
}

function availableTasks(env: ServerEnv): CountTask[] {
  const tasks: CountTask[] = [];
  const channelId = env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  if (env.YOUTUBE_API_KEY && /^UC[A-Za-z0-9_-]{22}$/.test(channelId)) {
    tasks.push({ key: "youtubeSubscribers", get: () => youtubeSubscribers(channelId, env.YOUTUBE_API_KEY!) });
  }
  if (env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ID && /^\d{1,30}$/.test(env.META_PAGE_ID)) {
    tasks.push({ key: "facebookFollowers", get: () => metaFollowers(env.META_PAGE_ID!, env.META_PAGE_ACCESS_TOKEN!, "followers_count") });
  }
  const instagramToken = env.META_IG_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  if (instagramToken && env.META_IG_USER_ID && /^\d{1,30}$/.test(env.META_IG_USER_ID)) {
    tasks.push({ key: "instagramFollowers", get: () => metaFollowers(env.META_IG_USER_ID!, instagramToken, "followers_count") });
  }
  return tasks;
}

function snapshot(now: number): SocialCountSnapshot {
  if (!cached) return { values: {}, cacheSeconds: 0 };
  return {
    values: cached.values,
    cacheSeconds: cached.cacheable ? Math.max(0, Math.ceil((cached.expiresAt - now) / 1000)) : 0,
  };
}

async function refresh(tasks: CountTask[], now: number): Promise<SocialCountSnapshot> {
  const previous = cached?.values ?? {};
  const values: SocialCountValues = {};
  for (const task of tasks) {
    const oldCount = previous[task.key];
    if (oldCount !== undefined) values[task.key] = oldCount;
  }
  if (previous.updatedAt) values.updatedAt = previous.updatedAt;

  const results = await Promise.allSettled(tasks.map((task) => task.get()));
  let succeeded = false;
  let failed = false;
  results.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      failed = true;
      return;
    }
    values[tasks[index].key] = result.value;
    succeeded = true;
  });
  if (succeeded) values.updatedAt = new Date(now).toISOString();

  // A failed refresh keeps each last good count, then retries soon. An empty
  // response is never cached by the CDN, so newly added credentials take effect.
  cached = {
    values,
    expiresAt: now + (succeeded && !failed ? WEEK_SECONDS : RETRY_SECONDS) * 1000,
    cacheable: succeeded && !failed,
  };
  return snapshot(now);
}

/** The first request after seven days refreshes the snapshot; no background cron is needed. */
export async function getSocialCounts(env: ServerEnv = process.env): Promise<SocialCountSnapshot> {
  const tasks = availableTasks(env);
  if (!tasks.length) {
    cached = null;
    return { values: {}, cacheSeconds: 0 };
  }
  const now = Date.now();
  if (cached && now < cached.expiresAt) return snapshot(now);
  if (!pending) pending = refresh(tasks, now).finally(() => { pending = null; });
  return pending;
}
