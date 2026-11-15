import { useState } from "react";
import { ArrowUpRight, Maximize2, Newspaper } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { editorialText, safeEditorialLink } from "@/components/channel/editorialCopy";
import { useFeaturedIn, type FeaturedInRow } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";
import "@/featured-in.css";

export default function FeaturedIn() {
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: features = [], isPending, isError } = useFeaturedIn();
  const stories = features.filter((feature) => feature.imageUrl?.trim() || safeEditorialLink(feature.linkUrl));
  const [openClipping, setOpenClipping] = useState<FeaturedInRow | null>(null);
  const articleUrl = safeEditorialLink(openClipping?.linkUrl);

  return (
    <Layout>
      <SEO title={t.featuredIn} description="News clippings and media features about Shiva Agri Clinic and its agriculture video stories." keywords="Shiva Agri Clinic news, farming media coverage, agriculture YouTube press" />
      <section className="channel-editorial-hero channel-editorial-hero-lavender">
        <div className="channel-shell"><span className="channel-eyebrow">{t.featuredEyebrow}</span><h1>{t.featuredIn}</h1><p>{t.featuredIntro}</p></div>
      </section>
      <section className="channel-editorial-content">
        <div className="channel-shell">
          {isPending ? <p className="channel-editorial-empty" role="status">{t.loading}</p> : isError ? <p className="channel-editorial-empty" role="alert">{t.unable}</p> : stories.length ? (
            <div className="channel-feature-grid">
              {stories.map((feature) => {
                const href = safeEditorialLink(feature.linkUrl);
                return <article className="channel-feature-card" key={feature.id}>
                  {feature.imageUrl ? <button className="channel-feature-clipping channel-feature-image-button" type="button" onClick={() => setOpenClipping(feature)} aria-label={`${t.openClipping}: ${feature.title}`}>
                    <img src={feature.imageUrl} alt={`${feature.title} — ${feature.source}`} loading="lazy" />
                    <span className="channel-feature-expand" aria-hidden="true"><Maximize2 size={17} /></span>
                  </button> : <div className="channel-feature-clipping"><Newspaper size={54} aria-hidden="true" /></div>}
                  <div className="channel-feature-caption">
                    <span>{feature.source}{feature.date ? ` · ${feature.date}` : ""}</span>
                    <h2>{feature.title}</h2>
                    {href && <a className="channel-feature-article-link" href={href} target="_blank" rel="noopener noreferrer">{t.originalArticle} <ArrowUpRight size={16} aria-hidden="true" /></a>}
                  </div>
                </article>;
              })}
            </div>
          ) : <p className="channel-editorial-empty">{t.featuredEmpty}</p>}
        </div>
      </section>
      <Dialog open={openClipping !== null} onOpenChange={(open) => { if (!open) setOpenClipping(null); }}>
        <DialogContent className="channel-feature-lightbox">
          <DialogTitle>{openClipping?.title}</DialogTitle>
          {openClipping?.imageUrl && <div className="channel-feature-lightbox-image"><img src={openClipping.imageUrl} alt={`${openClipping.title} — ${openClipping.source}`} /></div>}
          <div className="channel-feature-lightbox-footer">
            <span>{openClipping?.source}{openClipping?.date ? ` · ${openClipping.date}` : ""}</span>
            {articleUrl && <a href={articleUrl} target="_blank" rel="noopener noreferrer">{t.originalArticle} <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
