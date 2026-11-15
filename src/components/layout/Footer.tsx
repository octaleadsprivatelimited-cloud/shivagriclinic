import { Link } from "react-router-dom";
import { ArrowUpRight, Youtube } from "lucide-react";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { useLanguage } from "@/i18n/LanguageContext";
import { editorialText } from "@/components/channel/editorialCopy";

function safeDeveloperUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.href;
  } catch { /* Keep the verified default. */ }
  return "https://www.octaleads.com/";
}

export function Footer() {
  const content = useLocalizedChannelContent();
  const { language } = useLanguage();
  const t = editorialText(language);
  const developerUrl = safeDeveloperUrl(content.brand.developerUrl);
  return (
    <footer className="channel-footer">
      <div className="channel-shell channel-footer-poster" aria-hidden="true">{content.brand.footerPoster}<br /><span>{content.brand.footerPosterAccent}</span><i>✳</i></div>
      <div className="channel-shell channel-footer-main">
        <div>
          <Link className="channel-brand channel-brand-footer" to="/" aria-label={`${content.brand.name} ${content.nav.home}`}>
            <span className={`channel-brand-logo-frame ${content.brand.logoUrl === "/images/shiva-logo.png" ? "is-padded-original" : ""}`}><img className="channel-brand-logo" src={content.brand.logoUrl} alt="" /></span>
            <span>{content.brand.name}<small>{content.brand.tagline}</small></span>
          </Link>
          <p>{content.brand.footerDescription}</p>
        </div>
        <div className="channel-footer-links">
          <div>
            <h2>{content.nav.exploreHeading}</h2>
            <Link to="/">{content.nav.home}</Link>
            <Link to="/videos">{content.nav.videos}</Link>
            <Link to="/about">{content.nav.about}</Link>
            <Link to="/team">{t.team}</Link>
            <Link to="/featured-in">{t.featuredIn}</Link>
            <Link to="/blog">{t.blog}</Link>
            <Link to="/case-studies">{t.caseStudies}</Link>
            <Link to="/contact">{content.nav.contact}</Link>
          </div>
          <div>
            <h2>{content.nav.connectHeading}</h2>
            <a href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube size={17} /> YouTube <ArrowUpRight size={14} /></a>
            <a href={`mailto:${content.brand.email}`}>{content.nav.emailLabel}</a>
          </div>
        </div>
      </div>
      <div className="channel-shell channel-footer-bottom">
        <span className="channel-footer-copyright">© {new Date().getFullYear()} {content.brand.name}. {content.brand.copyrightText}</span>
        <span className="channel-footer-meta">
          <span className="channel-footer-legal"><Link to="/privacy-policy">{content.nav.privacyLabel}</Link><Link to="/terms">{content.nav.termsLabel}</Link></span>
          <span className="channel-footer-credit">{content.brand.developedByLabel} <a href={developerUrl} target="_blank" rel="noopener noreferrer">{content.brand.developerName || "Octaleads"}</a></span>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
