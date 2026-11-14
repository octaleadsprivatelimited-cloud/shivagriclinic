import { getYouTubeVideos } from "../server/youtubeFeed.js";

/** Vercel Function: public, same-origin feed for the channel's newest uploads. */
export async function GET(): Promise<Response> {
  try {
    const videos = await getYouTubeVideos();
    return Response.json(
      { videos },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600", "X-Content-Type-Options": "nosniff" } },
    );
  } catch {
    return Response.json(
      { videos: [], error: "YouTube feed is temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
