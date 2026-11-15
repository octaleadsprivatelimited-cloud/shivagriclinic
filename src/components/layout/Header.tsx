import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Facebook, Instagram, Menu, X } from "lucide-react";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { useLanguage } from "@/i18n/LanguageContext";
import { safeFacebookHref, safeInstagramHref, type Language } from "@/data/channelContent";
import { editorialText } from "@/components/channel/editorialCopy";
import "@/social-contact.css";

function YouTubeMark() {
  return <svg className="channel-youtube-mark" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="6" fill="#ff0033" /><path d="M11 5.2 19 10l-8 4.8z" fill="#fff" /></svg>;
}

export function Header() {
  const location = useLocation();
  const [menu, setMenu] = useState({ key: location.key, open: false });
  const open = menu.key === location.key && menu.open;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const content = useLocalizedChannelContent();
  const { language, setLanguage } = useLanguage();
  const t = editorialText(language);
  const instagramHref = safeInstagramHref(content.brand.instagramUrl);
  const facebookHref = safeFacebookHref(content.brand.facebookUrl);
  const socialLinks = Number(Boolean(instagramHref)) + Number(Boolean(facebookHref));
  const nav = [
    { label: content.nav.home, to: "/" },
    { label: content.nav.videos, to: "/videos" },
    { label: content.nav.about, to: "/about" },
    { label: content.nav.contact, to: "/contact" },
  ];
  const editorialNav = [
    { label: t.gallery, to: "/gallery" },
    { label: t.team, to: "/team" },
    { label: t.featuredIn, to: "/featured-in" },
    { label: t.blog, to: "/blog" },
    { label: t.caseStudies, to: "/case-studies" },
  ];
  const moreLabel = { en: "Stories", te: "కథలు", hi: "कहानियाँ" }[language];
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu((current) => ({ ...current, open: false }));
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="channel-header">
      <div className="channel-shell channel-header-inner">
        <Link className="channel-brand" to="/" aria-label={`${content.brand.name} ${content.nav.home}`}>
          <span className={`channel-brand-logo-frame ${content.brand.logoUrl === "/images/shiva-logo.png" ? "is-padded-original" : ""}`}><img className="channel-brand-logo" src={content.brand.logoUrl} alt="" /></span>
          <span>{content.brand.name}<small>{content.brand.tagline}</small></span>
        </Link>
        <nav className="channel-nav" aria-label={content.ui.mainNavLabel}>
          {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => isActive ? "is-active" : ""}>{item.label}</NavLink>)}
          <details className="channel-nav-more" key={location.pathname}><summary>{moreLabel}</summary><div>{editorialNav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "is-active" : ""}>{item.label}</NavLink>)}</div></details>
        </nav>
        <label className="channel-language-picker"><span className="sr-only">{content.ui.languageLabel}</span>
          <select aria-label={content.ui.languageLabel} value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            <option value="en">English</option><option value="te">తెలుగు</option><option value="hi">हिन्दी</option>
          </select>
        </label>
        {instagramHref && <a className="channel-social-link channel-social-link--desktop" href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label={`${content.contact.instagramLabel}: ${content.brand.name}`} title="Instagram"><Instagram size={20} strokeWidth={2} aria-hidden="true" /></a>}
        {facebookHref && <a className="channel-social-link channel-social-link--desktop" href={facebookHref} target="_blank" rel="noopener noreferrer" aria-label={`${content.contact.facebookLabel}: ${content.brand.name}`} title="Facebook"><Facebook size={20} strokeWidth={2} aria-hidden="true" /></a>}
        <a className="channel-header-cta" href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${content.nav.youtube}: ${content.brand.name}`}>
          <YouTubeMark /><span>{content.brand.name}</span><ArrowUpRight size={17} aria-hidden="true" />
        </a>
        <button ref={menuButtonRef} className="channel-menu-toggle" type="button" onClick={() => setMenu({ key: location.key, open: !open })} aria-expanded={open} aria-controls="channel-mobile-nav" aria-label={open ? content.ui.closeMenuLabel : content.ui.openMenuLabel}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div className={`channel-social-row${socialLinks === 1 ? " has-social" : ""}${socialLinks === 2 ? " has-two-social" : ""}`}>
        <a className="channel-mobile-cta" href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${content.nav.youtube}: ${content.brand.name}`}><YouTubeMark /><span>{content.brand.name}</span><ArrowUpRight size={15} aria-hidden="true" /></a>
        {instagramHref && <a className="channel-social-link channel-social-link--mobile" href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label={`${content.contact.instagramLabel}: ${content.brand.name}`} title="Instagram"><Instagram size={20} strokeWidth={2} aria-hidden="true" /></a>}
        {facebookHref && <a className="channel-social-link channel-social-link--mobile" href={facebookHref} target="_blank" rel="noopener noreferrer" aria-label={`${content.contact.facebookLabel}: ${content.brand.name}`} title="Facebook"><Facebook size={20} strokeWidth={2} aria-hidden="true" /></a>}
      </div>
      {open && (
        <nav id="channel-mobile-nav" className="channel-mobile-nav" aria-label={content.ui.mobileNavLabel}>
          {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"}>{item.label}</NavLink>)}
          {editorialNav.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          <a href={content.brand.youtubeUrl} target="_blank" rel="noopener noreferrer">{content.nav.youtube} <ArrowUpRight size={16} /></a>
        </nav>
      )}
    </header>
  );
}

export default Header;
