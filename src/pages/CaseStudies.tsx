import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { editorialText } from "@/components/channel/editorialCopy";
import { useCaseStudies } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CaseStudies() {
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: studies = [], isPending, isError } = useCaseStudies();

  return (
    <Layout>
      <SEO title={t.caseStudies} description="Read real farmer case studies and field stories from the Shiva Agri Clinic community." keywords="Shiva Agri Clinic case studies, farmer stories, agriculture success stories, crop management stories" />
      <section className="channel-editorial-hero channel-editorial-hero-mint"><div className="channel-shell"><span className="channel-eyebrow">{t.caseEyebrow}</span><h1>{t.caseStudies}</h1><p>{t.caseIntro}</p></div></section>
      <section className="channel-editorial-content"><div className="channel-shell">
        {isPending ? <p className="channel-editorial-empty" role="status">{t.loading}</p> : isError ? <p className="channel-editorial-empty" role="alert">{t.unable}</p> : studies.length ? (
          <div className="channel-case-list">{studies.map((study, index) => <article className="channel-case-card" key={study.id}>
            <div className="channel-case-visual">{study.imageUrl ? <img src={study.imageUrl} alt="" loading="lazy" /> : <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}</div>
            <div className="channel-case-body"><span className="channel-blog-kicker">{study.category}</span><h2>{study.title}</h2>
              {(study.farmer || study.location) && <p className="channel-case-byline">{[study.farmer && `${t.farmer}: ${study.farmer}`, study.location].filter(Boolean).join(" · ")}</p>}
              {study.challenge && <div><h3>{t.challenge}</h3><p>{study.challenge}</p></div>}
              {study.solution && <div><h3>{t.solution}</h3><p>{study.solution}</p></div>}
              {study.results?.length > 0 && <div><h3>{t.results}</h3><ul>{study.results.filter(Boolean).map((result, resultIndex) => <li key={`${result}-${resultIndex}`}>{result}</li>)}</ul></div>}
            </div>
          </article>)}</div>
        ) : <p className="channel-editorial-empty">{t.caseEmpty}</p>}
      </div></section>
    </Layout>
  );
}
