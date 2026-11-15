import { PartnerMarquee } from "@/components/channel/PartnerMarquee";
import type { ChannelCopy, PartnerLogo } from "@/data/channelContent";
import { useFeaturedIn } from "@/hooks/useCmsFirestore";
import "@/press-marquee.css";

export function PressMarquee({ press }: { press: ChannelCopy["press"] }) {
  const { data: features = [] } = useFeaturedIn();
  const publications = new Set<string>();
  const logos: PartnerLogo[] = [];

  for (const feature of features) {
    const source = feature.source?.trim();
    const publication = source && /[\p{L}\p{N}]/u.test(source) ? source : feature.title?.trim();
    const logoUrl = feature.logoUrl?.trim() ?? "";
    if (!publication || feature.showInSlider === false) continue;
    const identity = publication.toLocaleLowerCase();
    if (publications.has(identity)) continue;
    publications.add(identity);
    logos.push({ name: publication, logoUrl, website: "/featured-in" });
  }

  if (!logos.length) return null;
  return <PartnerMarquee partners={{ eyebrow: press.eyebrow, title: press.title, items: logos }} className="channel-press-section" showEyebrow allowTextOnly />;
}
