import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { editorialText } from "@/components/channel/editorialCopy";
import { usePublishedFirestoreBlogPosts } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Blog() {
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: posts = [], isPending, isError } = usePublishedFirestoreBlogPosts();
  const published = posts.filter((post) => post.status === "published" && post.slug && post.title);

  return (
    <Layout>
      <SEO title={t.blog} description="Read field notes, farming stories and agriculture ideas from Shiva Agri Clinic." keywords="Shiva Agri Clinic blog, farming stories, agriculture field notes, farmer videos" />
      <section className="channel-editorial-hero channel-editorial-hero-yellow">
        <div className="channel-shell"><span className="channel-eyebrow">{t.blogEyebrow}</span><h1>{t.blog}</h1><p>{t.blogIntro}</p></div>
      </section>
      <section className="channel-editorial-content">
        <div className="channel-shell">
          {isPending ? <p className="channel-editorial-empty" role="status">{t.loading}</p> : isError ? <p className="channel-editorial-empty" role="alert">{t.unable}</p> : published.length ? (
            <div className="channel-blog-grid">
              {published.map((post) => <Link className="channel-blog-card" key={post.slug} to={`/blog/${encodeURIComponent(post.slug)}`}>
                <div className="channel-blog-image">{post.imageUrl ? <img src={post.imageUrl} alt="" loading="lazy" /> : <BookOpen size={54} aria-hidden="true" />}</div>
                <div className="channel-blog-body"><span className="channel-blog-kicker">{post.category || t.blogEyebrow}</span><h2>{post.title}</h2>{post.excerpt && <p>{post.excerpt}</p>}<div className="channel-blog-card-footer"><span>{[post.date, post.author].filter(Boolean).join(" · ")}</span><span>{t.readArticle} <ArrowUpRight size={17} aria-hidden="true" /></span></div></div>
              </Link>)}
            </div>
          ) : <p className="channel-editorial-empty">{t.blogEmpty}</p>}
        </div>
      </section>
    </Layout>
  );
}
