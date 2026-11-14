import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { defaultChannelContent, mergeChannelContent, type ChannelContent } from "@/data/channelContent";

const CONTENT_KEY = "shiva-channel-content-v1";
const QUERY_KEY = ["cms", "channelContent"] as const;

export function isLocalChannelPreview(): boolean {
  return import.meta.env.DEV && typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
}

function readLocalContent(): ChannelContent {
  try {
    const value = localStorage.getItem(CONTENT_KEY);
    return mergeChannelContent(value ? JSON.parse(value) as Partial<ChannelContent> : null);
  } catch {
    return defaultChannelContent;
  }
}

export function useChannelContent() {
  const client = useQueryClient();
  useEffect(() => {
    if (!isLocalChannelPreview()) return;
    const onChange = () => { void client.invalidateQueries({ queryKey: QUERY_KEY }); };
    window.addEventListener("storage", onChange);
    window.addEventListener("channel-content-changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("channel-content-changed", onChange);
    };
  }, [client]);

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ChannelContent> => {
      const db = getDb();
      if (!db) return isLocalChannelPreview() ? readLocalContent() : defaultChannelContent;
      const snapshot = await getDoc(doc(db, "settings", "channel"));
      return mergeChannelContent(snapshot.exists() ? snapshot.data() as Partial<ChannelContent> : null);
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}

export function useSaveChannelContent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (content: ChannelContent) => {
      const db = getDb();
      if (db) {
        await setDoc(doc(db, "settings", "channel"), content);
        return;
      }
      if (!isLocalChannelPreview()) {
        throw new Error("Configure Firebase to edit the production website.");
      }
      localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
      window.dispatchEvent(new Event("channel-content-changed"));
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function channelStorageMode(): "firebase" | "local" | "readonly" {
  if (isFirebaseConfigured()) return "firebase";
  return isLocalChannelPreview() ? "local" : "readonly";
}
