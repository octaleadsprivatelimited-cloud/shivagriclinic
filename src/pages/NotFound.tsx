import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";

export default function NotFound() {
  const content = useLocalizedChannelContent();
  return (
    <Layout>
      <SEO title={content.notFound.title} description={content.notFound.description} noindex />
      <section className="channel-simple-page"><div className="channel-shell"><span className="channel-eyebrow channel-eyebrow-red">{content.notFound.eyebrow}</span><h1>{content.notFound.title}</h1><p>{content.notFound.description}</p><Link className="channel-button channel-button-yellow" to="/videos"><ArrowLeft size={18} /> {content.notFound.buttonLabel}</Link></div></section>
    </Layout>
  );
}
