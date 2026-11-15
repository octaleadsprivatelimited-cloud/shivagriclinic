import { PartnerMarquee } from "@/components/channel/PartnerMarquee";
import type { ChannelCopy, PartnerLogo } from "@/data/channelContent";
import { useFeaturedIn } from "@/hooks/useCmsFirestore";
import "@/press-marquee.css";

export function PressMarquee({ press }: { press: ChannelCopy["press"] }) {
  const { data: features = [] } = useFeaturedIn();
  const publications = new Map<string, number>();
  const logos: PartnerLogo[] = [];

  for (const feature of features) {
    const source = feature.source?.trim();
    const publication = source && /[\p{L}\p{N}]/u.test(source) ? source : feature.title?.trim();
    const logoUrl = feature.logoUrl?.trim() ?? "";
    if (!publication || feature.showInSlider === false) continue;
    const identity = publication.toLocaleLowerCase();
    const existing = publications.get(identity);
    if (existing !== undefined) {
      // A publication may have multiple clippings. Use any uploaded logo,
      // even when its newest clipping has none.
      if (!logos[existing].logoUrl && logoUrl) logos[existing].logoUrl = logoUrl;
      continue;
    }
    publications.set(identity, logos.length);
    logos.push({ name: publication, logoUrl, website: "/featured-in" });
  }

  if (!logos.length) return null;
  return <PartnerMarquee partners={{ eyebrow: press.eyebrow, title: press.title, items: logos }} className="channel-press-section" showEyebrow allowTextOnly />;
}
