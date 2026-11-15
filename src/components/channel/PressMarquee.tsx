import { PartnerMarquee } from "@/components/channel/PartnerMarquee";
import { defaultChannelContent, type ChannelCopy, type PartnerLogo } from "@/data/channelContent";
import { useFeaturedIn } from "@/hooks/useCmsFirestore";
import "@/press-marquee.css";

function bundledPublicationLogo(source: string, title: string): string {
  const name = `${source} ${title}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (name.includes("sakshi") || name.includes("sakhipaper")) return "/images/news/sakshi.png";
  if (name.includes("eenadu")) return "/images/news/eenadu.png";
  if (name.includes("hansindia")) return "/images/news/the-hans-india.png";
  return "";
}

export function PressMarquee({ press }: { press: ChannelCopy["press"] }) {
  const { data: features = [] } = useFeaturedIn();
  const publications = new Map<string, number>();
  const customLogos = new Set<string>();
  const logos: PartnerLogo[] = [];

  for (const feature of features) {
    const source = feature.source?.trim();
    const originalName = source && /[\p{L}\p{N}]/u.test(source) ? source : feature.title?.trim();
    const publication = originalName === "Sakhi paper" ? "Sakshi" : originalName === "Hansindia" ? "The Hans India" : originalName;
    const customLogo = feature.logoUrl?.trim() ?? "";
    const logoUrl = customLogo || bundledPublicationLogo(source ?? "", feature.title ?? "");
    if (!publication || feature.showInSlider === false) continue;
    const identity = publication.toLocaleLowerCase();
    const existing = publications.get(identity);
    if (existing !== undefined) {
      // A logo uploaded for any clipping takes priority over the bundled mark.
      if (customLogo && !customLogos.has(identity)) {
        logos[existing].logoUrl = customLogo;
        customLogos.add(identity);
      }
      continue;
    }
    publications.set(identity, logos.length);
    if (customLogo) customLogos.add(identity);
    logos.push({ name: publication, logoUrl, website: "/featured-in" });
  }

  if (!logos.length) return null;
  // Older CMS content may have an empty press title. Keep the section heading
  // visible using its localized eyebrow in that case.
  const title = press.title?.trim() || press.eyebrow?.trim() || defaultChannelContent.press.title;
  const eyebrow = press.title?.trim() ? press.eyebrow : "";
  return <PartnerMarquee partners={{ eyebrow, title, items: logos }} className="channel-press-section" showEyebrow allowTextOnly />;
}
