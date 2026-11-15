import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { useLanguage } from "@/i18n/LanguageContext";
import seoPages from "@/data/seoPages.json";

type VideoSEO = { id: string; title: string; thumbnail?: string; publishedAt?: string };
type SEOProps = { title?: string; description?: string; keywords?: string; image?: string; type?: string; noindex?: boolean; video?: VideoSEO };

const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.shivaagriclinic.com").replace(/\/$/, "");
const defaultImage = `${siteUrl}/og-image.png`;
const defaultOrganizationLogo = `${siteUrl}/favicon-shiva-512.png`;
const routePages: Record<string, { title: string; description: string; keywords: string }> = seoPages;

function absoluteImage(value?: string): string {
  if (!value) return defaultImage;
  try {
    const url = new URL(value, siteUrl);
    return url.protocol === "https:" ? url.href : defaultImage;
  } catch { return defaultImage; }
}

function organizationLogo(value?: string): string {
  if (!value) return defaultOrganizationLogo;
  try {
    const url = new URL(value, siteUrl);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : defaultOrganizationLogo;
  } catch { return defaultOrganizationLogo; }
}

function setMeta(key: string, value: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
}

function addSchema(id: string, data: Record<string, unknown>) {
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.dataset.channelSchema = "true";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function SEO({ title, description, keywords, image, type = "website", noindex = false, video }: SEOProps) {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const content = useLocalizedChannelContent();
  const route = routePages[pathname];
  const pageTitle = title || route?.title || content.brand.name;
  const fullTitle = pageTitle.includes(content.brand.name) ? pageTitle : `${pageTitle} | ${content.brand.name}`;
  const pageDescription = description || route?.description || seoPages["/"].description;
  const pageKeywords = keywords || route?.keywords || seoPages["/"].keywords;
  const currentUrl = `${siteUrl}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
  const fullImage = absoluteImage(image);
  const videoId = video?.id;
  const videoTitle = video?.title;
  const videoThumbnail = video?.thumbnail;
  const publishedAt = video?.publishedAt;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("description", pageDescription);
    setMeta("keywords", pageKeywords);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-video-preview:-1");
    setMeta("author", "G. Shiva Kumar");
    setMeta("theme-color", "#111d1e");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", pageDescription, "property");
    setMeta("og:image", fullImage, "property");
    setMeta("og:url", currentUrl, "property");
    setMeta("og:type", type, "property");
    setMeta("og:site_name", content.brand.name, "property");
    setMeta("og:locale", { en: "en_IN", te: "te_IN", hi: "hi_IN" }[language], "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", pageDescription);
    setMeta("twitter:image", fullImage);
    setMeta("twitter:url", currentUrl);

    document.head.querySelectorAll('script[data-channel-schema="true"]').forEach((script) => script.remove());
    const sameAs = [content.brand.youtubeUrl, content.brand.instagramUrl, content.brand.facebookUrl].filter((url) => /^https:\/\//.test(url));
    if (pathname === "/") {
      addSchema("channel-organization-schema", {
        "@context": "https://schema.org", "@type": "Organization",
        name: content.brand.name, url: `${siteUrl}/`, logo: organizationLogo(content.brand.logoUrl),
        description: pageDescription, sameAs,
      });
      addSchema("channel-website-schema", {
        "@context": "https://schema.org", "@type": "WebSite",
        name: content.brand.name, url: `${siteUrl}/`, inLanguage: ["en", "te", "hi"],
      });
    }
    if (videoId && videoTitle && publishedAt && !Number.isNaN(Date.parse(publishedAt))) {
      addSchema("channel-video-schema", {
        "@context": "https://schema.org", "@type": "VideoObject",
        name: videoTitle, description: pageDescription,
        thumbnailUrl: absoluteImage(videoThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`),
        uploadDate: publishedAt, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        publisher: { "@type": "Organization", name: content.brand.name, url: `${siteUrl}/` },
      });
    }
    return () => { document.head.querySelectorAll('script[data-channel-schema="true"]').forEach((script) => script.remove()); };
  }, [fullTitle, pageDescription, pageKeywords, fullImage, currentUrl, type, noindex, pathname, language, content.brand.name, content.brand.logoUrl, content.brand.youtubeUrl, content.brand.instagramUrl, content.brand.facebookUrl, videoId, videoTitle, videoThumbnail, publishedAt]);

  return null;
}

export default SEO;
