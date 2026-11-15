import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { defaultGalleryItems, resolveGalleryImageUrl } from "@/data/galleryData";
import { useGalleryItems } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";
import "@/gallery.css";

const copy = {
  en: { eyebrow: "FROM THE FIELD", title: "FIELD GALLERY.", intro: "A closer look at the people, places and moments behind the stories.", viewAll: "View all photos", open: "Open photo", previous: "Previous photo", next: "Next photo", empty: "Photos will appear here soon." },
  te: { eyebrow: "పొలం నుంచి", title: "చిత్రాల గ్యాలరీ", intro: "కథల వెనుక ఉన్న రైతులు, ప్రదేశాలు, క్షణాలను చూడండి.", viewAll: "అన్ని ఫోటోలు చూడండి", open: "ఫోటో తెరవండి", previous: "మునుపటి ఫోటో", next: "తర్వాతి ఫోటో", empty: "ఫోటోలు త్వరలో ఇక్కడ కనిపిస్తాయి." },
  hi: { eyebrow: "खेतों से", title: "फोटो गैलरी", intro: "कहानियों के पीछे के लोग, जगहें और पलों को करीब से देखें।", viewAll: "सभी तस्वीरें देखें", open: "तस्वीर खोलें", previous: "पिछली तस्वीर", next: "अगली तस्वीर", empty: "तस्वीरें जल्द ही यहाँ दिखाई देंगी।" },
} as const;

type Photo = { id: string; title: string; category: string; imageUrl: string };
type GalleryHeading = { eyebrow: string; title: string; description: string };

const legacyHeadings: Record<"en" | "te" | "hi", GalleryHeading> = {
  en: { eyebrow: "A SIMPLE WAY IN", title: "GOOD STORIES START HERE.", description: "Find a subject you love, spend a few minutes in the field, and keep exploring on YouTube." },
  te: { eyebrow: "సులభంగా మొదలుపెట్టండి", title: "మంచి కథలు ఇక్కడ మొదలవుతాయి.", description: "మీకు నచ్చిన అంశాన్ని ఎంచుకోండి, పొలం కథను చూడండి, యూట్యూబ్‌లో ఇంకా తెలుసుకోండి." },
  hi: { eyebrow: "आसानी से शुरुआत करें", title: "अच्छी कहानियाँ यहाँ शुरू होती हैं.", description: "अपना पसंदीदा विषय चुनें, खेत की कहानी देखें और यूट्यूब पर आगे बढ़ें।" },
};

export function PhotoGallery({ preview = false, heading }: { preview?: boolean; heading?: GalleryHeading }) {
  const { language } = useLanguage();
  const t = copy[language] ?? copy.en;
  const legacy = legacyHeadings[language] ?? legacyHeadings.en;
  const eyebrow = heading?.eyebrow === legacy.eyebrow ? t.eyebrow : heading?.eyebrow || t.eyebrow;
  const title = heading?.title === legacy.title ? t.title : heading?.title || t.title;
  const intro = heading?.description === legacy.description ? t.intro : heading?.description || t.intro;
  const { data: rows = [] } = useGalleryItems();
  const storedPhotos = rows.filter((row) => row.type === "image" && row.imageUrl?.trim());
  const uploadedPhotos: Photo[] = storedPhotos.map((row) => ({ id: row.id, title: row.title, category: row.category, imageUrl: resolveGalleryImageUrl(row.id, row.imageUrl) }));
  const storedIds = new Set(storedPhotos.map((row) => row.id));
  const fallbackPhotos: Photo[] = defaultGalleryItems.filter((row) => !storedIds.has(String(row.id))).map((row) => ({ id: `default-${row.id}`, title: row.title, category: row.category, imageUrl: row.image }));
  const photos = uploadedPhotos.length ? uploadedPhotos : fallbackPhotos;
  const shownPhotos = preview ? [...uploadedPhotos, ...fallbackPhotos].slice(0, 3) : photos;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : shownPhotos[activeIndex];

  const move = (direction: number) => {
    setActiveIndex((index) => index === null ? null : (index + direction + shownPhotos.length) % shownPhotos.length);
  };

  return (
    <section className={`channel-gallery-section${preview ? " is-preview" : " is-page"}`} aria-label={title}>
      <div className="channel-shell">
        <div className="channel-section-heading channel-gallery-heading">
          <div><span className="channel-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{intro}</p></div>
          {preview && <Link className="channel-button channel-button-white" to="/gallery">{t.viewAll} <ArrowUpRight size={18} aria-hidden="true" /></Link>}
        </div>
        {shownPhotos.length ? <div className="channel-gallery-grid">
          {shownPhotos.map((photo, index) => <button
            className="channel-gallery-card" type="button" key={photo.id}
            onClick={() => setActiveIndex(index)} aria-label={`${t.open}: ${photo.title}`}
          >
            <img src={photo.imageUrl} alt={photo.title} loading={index < 3 ? "eager" : "lazy"} />
            <span className="channel-gallery-card-caption"><small>{photo.category}</small><strong>{photo.title}</strong></span>
            <span className="channel-gallery-expand" aria-hidden="true"><Expand size={18} /></span>
          </button>)}
        </div> : <p className="channel-gallery-empty">{t.empty}</p>}
      </div>
      <Dialog open={activeIndex !== null} onOpenChange={(open) => { if (!open) setActiveIndex(null); }}>
        <DialogContent className="channel-gallery-lightbox">
          <DialogTitle>{activePhoto?.title ?? t.title}</DialogTitle>
          {activePhoto && <>
            <div className="channel-gallery-lightbox-image"><img src={activePhoto.imageUrl} alt={activePhoto.title} /></div>
            <div className="channel-gallery-lightbox-bottom">
              <span>{activePhoto.category}{shownPhotos.length > 1 ? ` · ${activeIndex! + 1} / ${shownPhotos.length}` : ""}</span>
              {shownPhotos.length > 1 && <div className="channel-gallery-lightbox-controls">
                <button type="button" onClick={() => move(-1)} aria-label={t.previous}><ArrowLeft size={19} /></button>
                <button type="button" onClick={() => move(1)} aria-label={t.next}><ArrowRight size={19} /></button>
              </div>}
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
