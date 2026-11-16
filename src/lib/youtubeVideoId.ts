const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

/** Accept only a YouTube video ID or a video URL from a known YouTube host. */
export function youtubeVideoId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (videoIdPattern.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    const id = host === "youtu.be"
      ? url.pathname.split("/")[1]
      : ["youtube.com", "youtube-nocookie.com"].includes(host)
        ? url.pathname === "/watch"
          ? url.searchParams.get("v")
          : /^\/(shorts|live|embed)\//.test(url.pathname)
            ? url.pathname.split("/")[2]
            : null
        : null;
    return id && videoIdPattern.test(id) ? id : null;
  } catch {
    return null;
  }
}
