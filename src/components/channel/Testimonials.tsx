import { useState, type CSSProperties } from "react";
import { Pause, Play, Quote } from "lucide-react";
import type { ChannelCopy } from "@/data/channelContent";
import { useLanguage } from "@/i18n/LanguageContext";
import "@/testimonials-marquee.css";

type TestimonialsContent = ChannelCopy["testimonials"];

export function Testimonials({ content }: { content: TestimonialsContent }) {
  const { language } = useLanguage();
  const [paused, setPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const items = content.items.filter((item) => item.name.trim() && item.quote.trim());
  if (!items.length) return null;
  const loop = items.length > 1;
  const repetitions = loop ? Math.ceil(4 / items.length) : 1;
  const motionLabel = {
    en: paused ? "Resume testimonials" : "Pause testimonials",
    te: paused ? "రైతుల అనుభవాలను తిరిగి కదిలించు" : "రైతుల అనుభవాలను ఆపు",
    hi: paused ? "किसानों के अनुभव फिर चलाएँ" : "किसानों के अनुभव रोकें",
  }[language];

  const cards = (duplicate: boolean, repetition: number) => items.map((item, index) => (
    <article className="channel-testimonial-card" key={`${duplicate ? "copy" : "original"}-${repetition}-${item.name}-${index}`}
      aria-hidden={duplicate ? true : undefined} inert={duplicate ? true : undefined}>
      <Quote className="channel-testimonial-quote" size={34} aria-hidden="true" />
      <blockquote><p>{item.quote}</p></blockquote>
      <div className="channel-testimonial-author">
        {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <span aria-hidden="true">{item.name.charAt(0)}</span>}
        <div><strong>{item.name}</strong><small>{item.role}</small></div>
      </div>
    </article>
  ));

  return (
    <section className="channel-testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="channel-shell">
        <div className="channel-testimonials-heading">
          <div className="channel-editorial-section-title">
            <span className="channel-eyebrow channel-eyebrow-red">{content.eyebrow}</span>
            <h2 id="testimonials-heading">{content.title}</h2>
          </div>
          {loop && <button className="channel-testimonials-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={motionLabel} title={motionLabel}>
            {paused ? <Play size={18} fill="currentColor" aria-hidden="true" /> : <Pause size={18} fill="currentColor" aria-hidden="true" />}
          </button>}
        </div>
        <div className={`channel-testimonials-viewport${paused || touching ? " is-paused" : ""}${loop ? "" : " is-single"}`}
          onPointerDown={(event) => { if (event.pointerType === "touch") setTouching(true); }}
          onPointerUp={() => setTouching(false)}
          onPointerCancel={() => setTouching(false)}>
          <div className="channel-testimonials-track" style={{ animationDuration: `${Math.max(30, items.length * repetitions * 15)}s` } as CSSProperties}>
            <div className="channel-testimonials-set">
              {cards(false, 0)}
              {Array.from({ length: repetitions - 1 }, (_, index) => cards(true, index + 1))}
            </div>
            {loop && <div className="channel-testimonials-set channel-testimonials-set-copy" aria-hidden="true" inert>
              {Array.from({ length: repetitions }, (_, index) => cards(true, index))}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
