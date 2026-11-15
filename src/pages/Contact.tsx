import { ArrowUpRight, Facebook, Instagram, Mail, MessageCircle, Phone, Youtube } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { safeFacebookHref, safeInstagramHref, safeTelephoneHref, safeWhatsAppHref } from "@/data/channelContent";

export default function Contact() {
  const content = useLocalizedChannelContent();
  const phoneHref = safeTelephoneHref(content.brand.phone);
  const whatsappHref = safeWhatsAppHref(content.brand.whatsappPhone);
  const instagramHref = safeInstagramHref(content.brand.instagramUrl);
  const facebookHref = safeFacebookHref(content.brand.facebookUrl);

  return (
    <Layout>
      <SEO title={content.seo.contactTitle} description={content.seo.contactDescription} />
      <section className="channel-page-intro">
        <div className="channel-shell">
          <span className="channel-eyebrow channel-eyebrow-red">{content.contact.eyebrow}</span>
          <h1>{content.contact.title}</h1>
          <p>{content.contact.intro}</p>
        </div>
      </section>
      <section className="channel-section channel-contact-section">
        <div className="channel-shell">
          <div className="channel-contact-grid">
            <a className="channel-contact-card" href={`mailto:${content.brand.email}`}>
              <Mail size={35} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.emailLabel}</strong><small>{content.brand.email}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>
            {phoneHref && <a className="channel-contact-card" href={phoneHref}>
              <Phone size={35} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.phoneLabel}</strong><small>{content.brand.phone}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>}
            {whatsappHref && <a className="channel-contact-card" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={35} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.whatsappLabel}</strong><small>{content.brand.whatsappPhone}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>}
            {instagramHref && <a className="channel-contact-card" href={instagramHref} target="_blank" rel="noopener noreferrer">
              <Instagram size={35} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.instagramLabel}</strong><small>{content.brand.instagramUrl}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>}
            {facebookHref && <a className="channel-contact-card" href={facebookHref} target="_blank" rel="noopener noreferrer">
              <Facebook size={35} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.facebookLabel}</strong><small>{content.brand.facebookUrl}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>}
            <a className="channel-contact-card" href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer">
              <Youtube size={37} strokeWidth={1.8} aria-hidden="true" />
              <span><strong>{content.contact.youtubeLabel}</strong><small>{content.brand.name}</small></span>
              <ArrowUpRight size={24} aria-hidden="true" />
            </a>
          </div>
          <p className="channel-contact-note">{content.contact.note}</p>
        </div>
      </section>
    </Layout>
  );
}
