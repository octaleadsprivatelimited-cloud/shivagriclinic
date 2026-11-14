import type { ReactNode } from "react";
import "@/channel.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

export function Layout({ children }: { children: ReactNode }) {
  const content = useLocalizedChannelContent();
  return (
    <div className="channel-site">
      <a href="#main-content" className="channel-skip-link">{content.ui.skipLabel}</a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Layout;
