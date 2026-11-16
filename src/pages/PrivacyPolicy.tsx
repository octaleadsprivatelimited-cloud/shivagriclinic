import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

export default function PrivacyPolicy() {
  const content = useLocalizedChannelContent();
  const page = content.legal.privacy;
  return <Layout><SEO title={content.seo.privacyTitle} description={content.seo.privacyDescription} />
    <section className="channel-simple-page"><div className="channel-shell">
      <span className="channel-eyebrow channel-eyebrow-red">{content.ui.siteInformationLabel}</span>
      <h1>{page.title}</h1><p>{page.intro}</p>
      {page.sections.map((section, index) => <div key={`${section.heading}-${index}`}><h2>{section.heading}</h2><p>{section.body}</p></div>)}
      <button type="button" className="channel-button channel-button-yellow channel-privacy-analytics" onClick={() => window.dispatchEvent(new Event("shiva:open-analytics-settings"))}>{content.analytics.settingsLabel}</button>
    </div></section>
  </Layout>;
}
