import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import type { ChannelVideo } from "@/data/channelVideos";
import { videoThumbnail } from "@/data/channelVideos";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

type Props = { video: ChannelVideo; index?: number };

export function VideoCard({ video, index }: Props) {
  const content = useLocalizedChannelContent();
  return (
    <article className="channel-video-card">
      <Link to={"/watch/" + video.id} aria-label={`${content.ui.watchVideoLabel} ${video.title}`}>
        <div className="channel-video-image">
          <img
            src={videoThumbnail(video.id, video.thumbnail)}
            alt=""
            loading={index === 0 ? "eager" : "lazy"}
            onError={(event) => { event.currentTarget.src = "/images/hero-farmland.jpg"; }}
          />
          <span className="channel-play-icon" aria-hidden="true"><Play size={20} fill="currentColor" /></span>
        </div>
        <div className="channel-video-copy">
          <h3>{video.title}</h3>
        </div>
      </Link>
    </article>
  );
}
