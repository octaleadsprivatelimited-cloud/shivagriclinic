import { useQuery } from "@tanstack/react-query";
import { normalizeSocialCount } from "@/data/channelContent";

export type LiveSocialCounts = {
  youtubeSubscribers?: string;
  facebookFollowers?: string;
  instagramFollowers?: string;
  updatedAt?: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useSocialCounts() {
  return useQuery({
    queryKey: ["social-counts"],
    queryFn: async (): Promise<LiveSocialCounts> => {
      const response = await fetch("/api/social-counts", { headers: { Accept: "application/json" } });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return {};
      const payload = await response.json() as Record<string, unknown>;
      const counts: LiveSocialCounts = {};
      for (const key of ["youtubeSubscribers", "facebookFollowers", "instagramFollowers"] as const) {
        const value = normalizeSocialCount(payload[key]);
        if (value) counts[key] = value;
      }
      if (typeof payload.updatedAt === "string") counts.updatedAt = payload.updatedAt;
      return counts;
    },
    staleTime: WEEK_MS,
    refetchInterval: WEEK_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });
}
