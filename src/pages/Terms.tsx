import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

export default function Terms() {
  const content = useLocalizedChannelContent();
  const page = content.legal.terms;
  return <Layout><SEO title={content.seo.termsTitle} description={content.seo.termsDescription} />
    <section className="channel-simple-page"><div className="channel-shell">
      <span className="channel-eyebrow channel-eyebrow-red">{content.ui.siteInformationLabel}</span>
      <h1>{page.title}</h1><p>{page.intro}</p>
      {page.sections.map((section, index) => <div key={`${section.heading}-${index}`}><h2>{section.heading}</h2><p>{section.body}</p></div>)}
    </div></section>
  </Layout>;
}
