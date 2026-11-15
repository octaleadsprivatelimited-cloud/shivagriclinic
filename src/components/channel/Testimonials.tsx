import { Quote } from "lucide-react";
import type { ChannelCopy } from "@/data/channelContent";

type TestimonialsContent = ChannelCopy["testimonials"];

export function Testimonials({ content }: { content: TestimonialsContent }) {
  const items = content.items.filter((item) => item.name.trim() && item.quote.trim());
  if (!items.length) return null;

  return (
    <section className="channel-testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="channel-shell">
        <div className="channel-editorial-section-title">
          <span className="channel-eyebrow channel-eyebrow-red">{content.eyebrow}</span>
          <h2 id="testimonials-heading">{content.title}</h2>
        </div>
        <div className="channel-testimonials-grid">
          {items.map((item, index) => (
            <article className="channel-testimonial-card" key={`${item.name}-${index}`}>
              <Quote className="channel-testimonial-quote" size={34} aria-hidden="true" />
              <blockquote><p>{item.quote}</p></blockquote>
              <div className="channel-testimonial-author">
                {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <span aria-hidden="true">{item.name.charAt(0)}</span>}
                <div><strong>{item.name}</strong><small>{item.role}</small></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
