import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { ChannelCopy, PartnerLogo } from "@/data/channelContent";

function safeWebsite(value: string): string | null {
  if (value === "/featured-in") return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function PartnerTile({ partner, duplicate }: { partner: PartnerLogo; duplicate: boolean }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed = failedImageUrl === partner.logoUrl;
  const website = safeWebsite(partner.website);
  const content = <>
    {!partner.logoUrl || imageFailed ? <span className="channel-partner-name">{partner.name}</span> : <img src={partner.logoUrl} alt={partner.name} loading="lazy" onError={() => setFailedImageUrl(partner.logoUrl)} />}
  </>;

  if (!website) return <div className="channel-partner-tile" aria-hidden={duplicate || undefined}>{content}</div>;
  if (website.startsWith("/")) return <Link className="channel-partner-tile" to={website} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}>{content}</Link>;
  return <a className="channel-partner-tile" href={website} target="_blank" rel="noopener noreferrer" aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}>{content}</a>;
}

function PartnerRow({ partners, reverse }: { partners: PartnerLogo[]; reverse: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [tileCount, setTileCount] = useState(() => partners.length ? Math.ceil(10 / partners.length) * partners.length : 0);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const fillRail = () => {
      const tile = rail.querySelector<HTMLElement>(".channel-partner-tile");
      if (!tile) return;
      const style = getComputedStyle(tile);
      const tileSpace = tile.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      if (!tileSpace) return;
      // Each of the two identical groups must cover the entire rail by itself.
      const requiredTiles = Math.ceil(rail.clientWidth / tileSpace) + 1;
      setTileCount(Math.ceil(requiredTiles / partners.length) * partners.length);
    };

    fillRail();
    const observer = new ResizeObserver(fillRail);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [partners.length]);

  if (!partners.length) return null;
  const row = Array.from({ length: Math.max(tileCount, partners.length) }, (_, index) => partners[index % partners.length]);
  const trackStyle = {
    "--partner-duration": `${row.length * 5}s`,
  } as CSSProperties;
  return <div ref={railRef} className={`channel-partner-rail ${reverse ? "is-reverse" : ""}`}>
    <div className="channel-partner-track" style={trackStyle}>
      {[false, true].map((duplicate) => <div className="channel-partner-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
        {row.map((partner, index) => <PartnerTile key={`${partner.name}-${index}`} partner={partner} duplicate={duplicate || index >= partners.length} />)}
      </div>)}
    </div>
  </div>;
}

export function PartnerMarquee({ partners, className = "", showEyebrow = false, allowTextOnly = false }: { partners: ChannelCopy["partners"]; className?: string; showEyebrow?: boolean; allowTextOnly?: boolean }) {
  const logos = partners.items.filter((item) => item?.name?.trim() && (allowTextOnly || item?.logoUrl?.trim()));
  if (!logos.length) return null;
  const firstRow = logos.filter((_, index) => index % 2 === 0);
  const secondRow = logos.filter((_, index) => index % 2 === 1);

  return <section className={`channel-partners-section ${className}`.trim()} aria-label={partners.title}>
    <div className="channel-shell channel-partners-heading">
      {showEyebrow && partners.eyebrow && <span className="channel-eyebrow">{partners.eyebrow}</span>}
      <h2>{partners.title}</h2>
    </div>
    <div className="channel-partner-rows">
      <PartnerRow partners={firstRow} reverse={false} />
      <PartnerRow partners={secondRow.length ? secondRow : firstRow} reverse />
    </div>
  </section>;
}
