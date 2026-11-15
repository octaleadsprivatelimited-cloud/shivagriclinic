import { ArrowUpRight, Newspaper } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { editorialText, safeEditorialLink } from "@/components/channel/editorialCopy";
import { useFeaturedIn } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";

export default function FeaturedIn() {
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: features = [], isPending, isError } = useFeaturedIn();

  return (
    <Layout>
      <SEO title={t.featuredIn} description="News clippings and media features about Shiva Agri Clinic and its agriculture video stories." keywords="Shiva Agri Clinic news, farming media coverage, agriculture YouTube press" />
      <section className="channel-editorial-hero channel-editorial-hero-lavender">
        <div className="channel-shell"><span className="channel-eyebrow">{t.featuredEyebrow}</span><h1>{t.featuredIn}</h1><p>{t.featuredIntro}</p></div>
      </section>
      <section className="channel-editorial-content">
        <div className="channel-shell">
          {isPending ? <p className="channel-editorial-empty" role="status">{t.loading}</p> : isError ? <p className="channel-editorial-empty" role="alert">{t.unable}</p> : features.length ? (
            <div className="channel-feature-grid">
              {features.map((feature) => {
                const href = safeEditorialLink(feature.linkUrl);
                const contents = <>
                  <div className="channel-feature-clipping">{feature.imageUrl ? <img src={feature.imageUrl} alt={`${feature.title} — ${feature.source}`} loading="lazy" /> : <Newspaper size={54} aria-hidden="true" />}</div>
                  <div className="channel-feature-caption"><span>{feature.source}{feature.date ? ` · ${feature.date}` : ""}</span><h2>{feature.title}</h2>{href && <span className="channel-feature-link-label">{t.viewFeature} <ArrowUpRight size={16} aria-hidden="true" /></span>}</div>
                </>;
                return href ? <a className="channel-feature-card" key={feature.id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${t.viewFeature}: ${feature.title}`}>{contents}</a> : <article className="channel-feature-card" key={feature.id}>{contents}</article>;
              })}
            </div>
          ) : <p className="channel-editorial-empty">{t.featuredEmpty}</p>}
        </div>
      </section>
    </Layout>
  );
}
