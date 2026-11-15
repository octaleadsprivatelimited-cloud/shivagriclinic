import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { editorialText } from "@/components/channel/editorialCopy";
import { useFirestoreBlogPost } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: post, isPending, isError } = useFirestoreBlogPost(slug);
  const published = post?.status === "published" ? post : null;
  const paragraphs = (published?.content || "").split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);

  return (
    <Layout>
      <SEO title={published?.title || t.postNotFound} description={published?.excerpt || t.postNotFoundText} image={published?.imageUrl} type={published ? "article" : "website"} noindex={!isPending && !published} />
      {isPending ? <div className="channel-shell channel-editorial-state" role="status">{t.loading}</div> : isError ? <div className="channel-shell channel-editorial-state" role="alert">{t.unable}</div> : !published ? (
        <div className="channel-shell channel-editorial-state"><h1>{t.postNotFound}</h1><p>{t.postNotFoundText}</p><Link className="channel-button channel-button-yellow" to="/blog"><ArrowLeft size={17} aria-hidden="true" />{t.backToBlog}</Link></div>
      ) : <>
        <section className="channel-editorial-hero channel-editorial-hero-yellow channel-blog-post-hero"><div className="channel-shell">
          <Link className="channel-editorial-back" to="/blog"><ArrowLeft size={18} aria-hidden="true" />{t.backToBlog}</Link>
          {published.category && <span className="channel-eyebrow">{published.category}</span>}
          <h1>{published.title}</h1><p>{[published.date, published.author, published.readTime].filter(Boolean).join(" · ")}</p>
        </div></section>
        <article className="channel-editorial-content channel-blog-article"><div className="channel-shell channel-blog-article-inner">
          {published.imageUrl && <img className="channel-blog-article-image" src={published.imageUrl} alt="" />}
          {published.excerpt && <p className="channel-blog-lede">{published.excerpt}</p>}
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          <Link className="channel-editorial-back channel-editorial-back-bottom" to="/blog"><ArrowLeft size={18} aria-hidden="true" />{t.backToBlog}</Link>
        </div></article>
      </>}
    </Layout>
  );
}
