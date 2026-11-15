import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import type { ChannelCopy } from "@/data/channelContent";
import { useLanguage } from "@/i18n/LanguageContext";
import "@/testimonials-marquee.css";

type TestimonialsContent = ChannelCopy["testimonials"];

export function Testimonials({ content }: { content: TestimonialsContent }) {
  const { language } = useLanguage();
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const pointerDownRef = useRef(false);
  const resumeAfterRef = useRef(0);
  const dragRef = useRef({ x: 0, scrollLeft: 0 });
  const items = content.items.filter((item) => item.name.trim() && item.quote.trim());
  const loop = items.length > 1;
  const repetitions = loop ? Math.ceil(4 / items.length) : 1;
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !loop) return;

    let frame = 0;
    let lastTime = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(viewport);

    const advance = (now: number) => {
      const elapsed = Math.min(now - (lastTime || now), 100);
      lastTime = now;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const focused = viewport.contains(document.activeElement);
      if (visible && !reducedMotion && !paused && !hoveredRef.current && !pointerDownRef.current && !focused && now >= resumeAfterRef.current) {
        const setWidth = (viewport.firstElementChild?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        if (setWidth > 0) {
          viewport.scrollLeft += elapsed * 0.035;
          if (viewport.scrollLeft >= setWidth) viewport.scrollLeft -= setWidth;
        }
      }
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [loop, paused]);

  if (!items.length) return null;
  const motionLabel = {
    en: paused ? "Resume testimonials" : "Pause testimonials",
    te: paused ? "రైతుల అనుభవాలను తిరిగి కదిలించు" : "రైతుల అనుభవాలను ఆపు",
    hi: paused ? "किसानों के अनुभव फिर चलाएँ" : "किसानों के अनुभव रोकें",
  }[language];
  const directionLabels = {
    en: ["Previous testimonials", "Next testimonials"],
    te: ["మునుపటి రైతుల అనుభవాలు", "తరువాతి రైతుల అనుభవాలు"],
    hi: ["पिछले किसानों के अनुभव", "अगले किसानों के अनुभव"],
  }[language];

  const scrollManually = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    resumeAfterRef.current = performance.now() + 1800;
    const setWidth = (viewport.firstElementChild?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    if (direction < 0 && loop && viewport.scrollLeft < 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      viewport.scrollLeft = setWidth;
    }
    viewport.scrollBy({
      left: direction * Math.min(viewport.clientWidth * 0.8, 480),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerDownRef.current = true;
    resumeAfterRef.current = Number.POSITIVE_INFINITY;
    if (event.pointerType === "mouse") {
      dragRef.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      event.preventDefault();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging || event.pointerType !== "mouse") return;
    event.currentTarget.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.x);
  };

  const handlePointerEnd = () => {
    pointerDownRef.current = false;
    resumeAfterRef.current = performance.now() + 1200;
    setDragging(false);
  };

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
          {loop && <div className="channel-testimonials-controls">
            <button className="channel-testimonials-toggle" type="button" onClick={() => scrollManually(-1)} aria-label={directionLabels[0]} title={directionLabels[0]}><ChevronLeft size={20} aria-hidden="true" /></button>
            <button className="channel-testimonials-toggle" type="button" onClick={() => scrollManually(1)} aria-label={directionLabels[1]} title={directionLabels[1]}><ChevronRight size={20} aria-hidden="true" /></button>
            <button className="channel-testimonials-toggle channel-testimonials-motion-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={motionLabel} title={motionLabel}>
              {paused ? <Play size={18} fill="currentColor" aria-hidden="true" /> : <Pause size={18} fill="currentColor" aria-hidden="true" />}
            </button>
          </div>}
        </div>
        <div ref={viewportRef} className={`channel-testimonials-viewport${dragging ? " is-dragging" : ""}${loop ? "" : " is-single"}`}
          role="region" aria-label={content.title} tabIndex={0}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") hoveredRef.current = true; }}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") hoveredRef.current = false; }}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}
          onWheel={(event) => { if (event.deltaX !== 0 || event.shiftKey) resumeAfterRef.current = performance.now() + 1200; }}>
          <div className="channel-testimonials-track">
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
