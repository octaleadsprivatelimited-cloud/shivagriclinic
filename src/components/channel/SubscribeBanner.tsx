import { ArrowUpRight, Youtube } from "lucide-react";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

export function SubscribeBanner() {
  const content = useLocalizedChannelContent();
  return (
    <section className="channel-subscribe">
      <div className="channel-shell channel-subscribe-inner">
        <div>
          <span className="channel-eyebrow">{content.subscribe.eyebrow}</span>
          <h2>{content.subscribe.title}</h2>
          <p>{content.subscribe.description}</p>
        </div>
        <a className="channel-button channel-button-yellow" href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer">
          <Youtube size={20} aria-hidden="true" /> {content.subscribe.buttonLabel} <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
