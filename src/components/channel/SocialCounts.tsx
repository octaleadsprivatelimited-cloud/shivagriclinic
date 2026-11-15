import { ArrowUpRight, Facebook, Instagram, Youtube } from "lucide-react";
import { safeFacebookHref, safeInstagramHref, type ChannelCopy } from "@/data/channelContent";
import { useSocialCounts } from "@/hooks/useSocialCounts";

type SocialCountsProps = { content: ChannelCopy };

const formatCount = (value: string): string =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));

export function SocialCounts({ content }: SocialCountsProps) {
  const { data: liveCounts } = useSocialCounts();
  const cards = [
    { platform: "YouTube", count: liveCounts?.youtubeSubscribers ?? content.social.youtubeSubscribers, estimate: !liveCounts?.youtubeSubscribers, label: content.social.subscribersLabel, href: content.brand.youtubeUrl, icon: Youtube },
    { platform: "Facebook", count: liveCounts?.facebookFollowers ?? content.social.facebookFollowers, estimate: !liveCounts?.facebookFollowers, label: content.social.followersLabel, href: safeFacebookHref(content.brand.facebookUrl), icon: Facebook },
    { platform: "Instagram", count: liveCounts?.instagramFollowers ?? content.social.instagramFollowers, estimate: !liveCounts?.instagramFollowers, label: content.social.followersLabel, href: safeInstagramHref(content.brand.instagramUrl), icon: Instagram },
  ];

  return <section className="channel-social-counts" aria-labelledby="channel-social-title">
    <div className="channel-shell">
      <div className="channel-social-heading">
        <span className="channel-eyebrow">{content.social.eyebrow}</span>
        <h2 id="channel-social-title">{content.social.title}</h2>
        {cards.some((card) => card.estimate && card.count) && <p>{content.social.estimatesNote}</p>}
      </div>
      <div className="channel-social-grid">
        {cards.map(({ platform, count, estimate, label, href, icon: Icon }) => {
          const number = count ? `${estimate ? "~" : ""}${formatCount(count)}` : "—";
          const accessibleCount = count ? `${estimate ? `${content.social.approximateLabel} ` : ""}${new Intl.NumberFormat("en-IN").format(Number(count))}` : content.social.unavailableLabel;
          const body = <>
            <span className="channel-social-card-top"><Icon size={26} strokeWidth={1.8} aria-hidden="true" /><span>{platform}</span>{href && <ArrowUpRight size={19} aria-hidden="true" />}</span>
            <span className="channel-social-card-number" title={count ? accessibleCount : undefined}>{number}</span>
            <span className="channel-social-card-label">{label}</span>
          </>;
          return href
            ? <a key={platform} className="channel-social-card" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${platform}: ${accessibleCount} ${count ? label : ""}`.trim()}>{body}</a>
            : <div key={platform} className="channel-social-card" aria-label={`${platform}: ${accessibleCount} ${count ? label : ""}`.trim()}>{body}</div>;
        })}
      </div>
    </div>
  </section>;
}
