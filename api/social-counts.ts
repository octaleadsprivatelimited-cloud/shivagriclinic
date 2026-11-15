import { getSocialCounts } from "../server/socialCounts.js";

/** Public counts contain no credentials or platform error details. */
export async function socialCountsResponse(env: Record<string, string | undefined> = process.env): Promise<Response> {
  const { values, cacheSeconds } = await getSocialCounts(env);
  const cacheControl = cacheSeconds > 0
    ? "public, max-age=" + Math.min(cacheSeconds, 3600) + ", s-maxage=" + cacheSeconds
    : "no-store";
  return Response.json(values, {
    headers: { "Cache-Control": cacheControl, "X-Content-Type-Options": "nosniff" },
  });
}

/** Vercel Function: platform tokens are read only on the server. */
export async function GET(): Promise<Response> {
  return socialCountsResponse();
}
