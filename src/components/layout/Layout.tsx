import type { CSSProperties, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import "@/channel.css";
import "@/channel-appearance.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { fontStack, headerForeground, sectionFontOptions } from "@/data/fontOptions";

function pageFontGroup(pathname: string): string {
  if (pathname === "/videos") return "videos";
  if (pathname === "/about") return "about";
  if (pathname === "/contact") return "contact";
  if (pathname.startsWith("/watch/")) return "watch";
  if (["/team", "/gallery", "/featured-in", "/blog", "/case-studies"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) return "editorial";
  return pathname === "/" ? "home" : "legal";
}

export function Layout({ children }: { children: ReactNode }) {
  const content = useLocalizedChannelContent();
  const { pathname } = useLocation();
  const { appearance } = content;
  const appearanceStyle = {
    "--channel-body-font": fontStack(appearance.bodyFont),
    "--channel-heading-font": fontStack(appearance.headingFont),
    "--channel-logo-font": fontStack(appearance.logoFont),
    "--channel-header-background": appearance.headerColor,
    "--channel-header-foreground": headerForeground(appearance.headerColor),
  } as CSSProperties & Record<string, string>;
  const fontClasses: string[] = [];
  for (const { id } of sectionFontOptions) {
    const selected = appearance.sectionFonts[id];
    if (!selected) continue;
    appearanceStyle[`--channel-section-font-${id}`] = fontStack(selected);
    fontClasses.push(`has-font-${id}`);
  }
  return (
    <div className={`channel-site page-${pageFontGroup(pathname)} ${fontClasses.join(" ")}`} style={appearanceStyle}>
      <a href="#main-content" className="channel-skip-link">{content.ui.skipLabel}</a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Layout;
