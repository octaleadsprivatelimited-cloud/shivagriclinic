import { getYouTubeVideos } from "../server/youtubeFeed.js";

/** Public, same-origin endpoint for the channel's newest uploads. */
export async function youtubeFeedResponse(env: NodeJS.ProcessEnv = process.env): Promise<Response> {
  try {
    const videos = await getYouTubeVideos(env);
    return Response.json(
      { videos },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600", "X-Content-Type-Options": "nosniff" } },
    );
  } catch {
    return Response.json(
      { videos: [], error: "YouTube uploads are temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}

/** Vercel Function entry point. */
export async function GET(): Promise<Response> {
  return youtubeFeedResponse();
}
