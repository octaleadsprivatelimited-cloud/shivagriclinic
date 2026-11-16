import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useChannelSite } from "@/hooks/useChannelSite";
import { youtubeVideoId } from "@/lib/youtubeVideoId";
import "@/floating-youtube.css";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
};

type YouTubeApi = {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: YouTubePlayer }) => void;
      onStateChange: (event: { data: number }) => void;
      onAutoplayBlocked: () => void;
      onError: () => void;
    };
  }) => YouTubePlayer;
};

type YouTubeWindow = Window & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeApi> | undefined;
const dismissedKey = "shiva-floating-video-dismissed";

function loadYouTubeApi(): Promise<YouTubeApi> {
  const host = window as YouTubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previousReady = host.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      apiPromise = undefined;
      reject(new Error("YouTube player did not load."));
    }, 15000);
    host.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      if (host.YT?.Player) resolve(host.YT);
      else reject(new Error("YouTube player is unavailable."));
    };
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      apiPromise = undefined;
      reject(new Error("YouTube player could not load."));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function FloatingYouTubePlayer({ videoId, title }: { videoId: string | undefined; title?: string }) {
  const safeId = youtubeVideoId(videoId);
  const targetRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(dismissedKey) === "1"; } catch { return false; }
  });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = targetRef.current;
    if (!safeId || dismissed || !mount) return;
    let cancelled = false;
    let retriedMuted = false;
    let fallbackTimer: number | undefined;
    const fallbackToMuted = () => {
      const player = playerRef.current;
      if (!player || retriedMuted || player.getPlayerState() === 1) return;
      retriedMuted = true;
      player.mute();
      setMuted(true);
      setBlocked(true);
      player.playVideo();
    };
    void loadYouTubeApi().then((api) => {
      if (cancelled) return;
      const placeholder = document.createElement("div");
      mount.appendChild(placeholder);
      playerRef.current = new api.Player(placeholder, {
        videoId: safeId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            if (cancelled) return;
            // Browsers allow sound autoplay only after a prior interaction. Try it
            // first, then keep video moving muted when that attempt is blocked.
            target.unMute();
            target.setVolume(100);
            target.playVideo();
            fallbackTimer = window.setTimeout(fallbackToMuted, 1800);
          },
          onStateChange: ({ data }) => {
            if (cancelled) return;
            setPlaying(data === 1);
          },
          onAutoplayBlocked: () => { if (!cancelled) fallbackToMuted(); },
          onError: () => {
            if (cancelled) return;
            playerRef.current?.destroy();
            playerRef.current = null;
            setFailed(true);
          },
        },
      });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      playerRef.current?.destroy();
      playerRef.current = null;
      mount.replaceChildren();
    };
  }, [safeId, dismissed]);

  if (!safeId || dismissed) return null;
  const videoUrl = `https://www.youtube.com/watch?v=${safeId}`;
  const videoTitle = title?.trim() || "Shiva Agri Clinic video";

  return <aside className="channel-floating-video" aria-label="Floating YouTube video">
    <div className="channel-floating-video-screen">
      {failed ? <div className="channel-floating-video-error">Video unavailable. <a href={videoUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube <ExternalLink size={13} /></a></div> : <div ref={targetRef} className="channel-floating-video-embed" />}
      <span className="channel-floating-video-title" title={videoTitle}>{videoTitle}</span>
      <button type="button" className="channel-floating-video-close" onClick={() => { try { sessionStorage.setItem(dismissedKey, "1"); } catch { /* Dismiss in memory when storage is unavailable. */ } setDismissed(true); }} aria-label="Close floating video" title="Close video"><X size={16} /></button>
      {!failed && <div className="channel-floating-video-controls" role="group" aria-label="Floating video controls">
        <button type="button" onClick={() => {
          const player = playerRef.current;
          if (!player) return;
          if (playing) { player.pauseVideo(); setPlaying(false); }
          else { const restoredVolume = volume || 100; player.unMute(); player.setVolume(restoredVolume); player.playVideo(); setVolume(restoredVolume); setMuted(false); setBlocked(false); }
        }} aria-label={playing ? "Pause floating video" : "Play floating video with sound"} title={playing ? "Pause" : "Play with sound"}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
        <button type="button" onClick={() => {
          const player = playerRef.current;
          if (!player) return;
          if (muted) { const restoredVolume = volume || 100; player.unMute(); player.setVolume(restoredVolume); setVolume(restoredVolume); setMuted(false); setBlocked(false); }
          else { player.mute(); setMuted(true); }
        }} aria-label={muted ? "Unmute floating video" : "Mute floating video"} title={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
        <input className="channel-floating-video-volume" type="range" min="0" max="100" step="5" value={muted ? 0 : volume} onChange={(event) => {
          const nextVolume = Number(event.target.value);
          const player = playerRef.current;
          if (!player) return;
          setVolume(nextVolume);
          player.setVolume(nextVolume);
          if (nextVolume === 0) { player.mute(); setMuted(true); }
          else { player.unMute(); setMuted(false); setBlocked(false); }
        }} aria-label="Floating video volume" title="Volume" />
        {blocked && <span className="sr-only" role="status">Autoplay with sound was blocked. Use the unmute control to turn on sound.</span>}
        <a className="channel-floating-video-youtube" href={videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open this video on YouTube" title="Watch on YouTube"><ExternalLink size={17} /></a>
      </div>}
    </div>
  </aside>;
}

function FloatingVideoFromChannel() {
  const { content, videos, feedQuery } = useChannelSite();
  if (!content.floatingVideo.enabled) return null;
  const newestUpload = videos.filter((video) => video.source === "youtube")
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))[0] || videos[0];
  // Keep the preview usable when the production feed endpoint is absent locally.
  // A live eligible upload always takes precedence over this known channel video.
  const selectedVideoId = youtubeVideoId(content.floatingVideo.videoId)
    || newestUpload?.id
    || (feedQuery.isPending ? undefined : "bsjydN6cmNk");
  const selectedVideoTitle = videos.find((video) => video.id === selectedVideoId)?.title;
  return <FloatingYouTubePlayer key={selectedVideoId} videoId={selectedVideoId} title={selectedVideoTitle} />;
}

/** Mount once above the public routes so navigation does not restart playback. */
export function PublicFloatingVideo() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <FloatingVideoFromChannel />;
}
