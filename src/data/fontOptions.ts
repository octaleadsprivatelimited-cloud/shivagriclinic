/** Only fonts already loaded by the public site can be selected in the admin. */
export const fontOptions = [
  { id: "inter", label: "Inter", stack: '"Inter", "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' },
  { id: "anton", label: "Anton", stack: '"Anton", "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' },
  { id: "jakarta", label: "Plus Jakarta Sans", stack: '"Plus Jakarta Sans", "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' },
  { id: "sora", label: "Sora", stack: '"Sora", "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' },
  { id: "telugu", label: "Noto Sans Telugu", stack: '"Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' },
  { id: "devanagari", label: "Noto Sans Devanagari", stack: '"Noto Sans Devanagari", "Noto Sans Telugu", sans-serif' },
] as const;

export type FontId = (typeof fontOptions)[number]["id"];

export const sectionFontOptions = [
  { id: "hero", label: "Hero" },
  { id: "partners", label: "Logo showcase" },
  { id: "highlights", label: "Highlights" },
  { id: "social", label: "Social counts" },
  { id: "featured", label: "Featured videos" },
  { id: "topics", label: "Explore by topic" },
  { id: "story", label: "Creator story" },
  { id: "testimonials", label: "Testimonials" },
  { id: "press", label: "News slider" },
  { id: "steps", label: "Gallery preview" },
  { id: "subscribe", label: "Subscribe banner" },
  { id: "header", label: "Header and navigation" },
  { id: "footer", label: "Footer" },
  { id: "videos", label: "Video library page" },
  { id: "about", label: "About page" },
  { id: "contact", label: "Contact page" },
  { id: "watch", label: "Video player page" },
  { id: "editorial", label: "Team, Featured In, blog and case studies" },
  { id: "legal", label: "Privacy, terms and other pages" },
] as const;

export type SectionFontId = (typeof sectionFontOptions)[number]["id"];
export type SectionFonts = Record<SectionFontId, FontId | "">;

export const defaultSectionFonts = Object.fromEntries(sectionFontOptions.map(({ id }) => [id, ""])) as SectionFonts;

export function isFontId(value: unknown): value is FontId {
  return typeof value === "string" && fontOptions.some((option) => option.id === value);
}

export function fontStack(id: FontId): string {
  return fontOptions.find((option) => option.id === id)!.stack;
}

export function normalizeHeaderColor(value: unknown, fallback = "#f6f1e6"): string {
  return typeof value === "string" && /^#[\da-fA-F]{6}$/.test(value.trim()) ? value.trim().toLowerCase() : fallback;
}

/** Black or white text, whichever has greater WCAG contrast against the background. */
export function headerForeground(color: string): "#000000" | "#ffffff" {
  const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
  const luminance = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? "#000000" : "#ffffff";
}
