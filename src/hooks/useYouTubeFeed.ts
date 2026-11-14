import { useQuery } from "@tanstack/react-query";
import type { FeedVideo } from "@/data/channelVideos";

export function useYouTubeFeed() {
  return useQuery({
    queryKey: ["youtube", "latest"],
    queryFn: async (): Promise<FeedVideo[]> => {
      const response = await fetch("/api/youtube", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Latest YouTube uploads are temporarily unavailable.");
      const payload = await response.json() as { videos?: FeedVideo[] };
      return Array.isArray(payload.videos) ? payload.videos : [];
    },
    retry: 1,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    refetchOnWindowFocus: true,
  });
}
