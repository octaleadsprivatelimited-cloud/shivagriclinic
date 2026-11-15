import { useState } from "react";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { AdminImageUpload } from "../components/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { channelStorageMode, useChannelContent, useSaveChannelContent } from "@/hooks/useChannelContent";
import { defaultChannelContent, normalizeHeroFade, normalizeSocialCount, safeFacebookHref, safeInstagramHref, safeTelephoneHref, safeWhatsAppHref, type ChannelContent, type ChannelCopy, type Language } from "@/data/channelContent";
import { localizeContent } from "@/i18n/channelI18n";
import { fontOptions, isFontId, normalizeHeaderColor, sectionFontOptions, type FontId } from "@/data/fontOptions";

type Path = (string | number)[];
const sections: { key: keyof ChannelCopy; name: string }[] = [
  { key: "appearance", name: "Appearance" },
  { key: "brand", name: "Brand & links" }, { key: "nav", name: "Navigation" },
  { key: "hero", name: "Hero" }, { key: "highlights", name: "Highlights" },
  { key: "social", name: "Social counts" },
  { key: "analytics", name: "Analytics tracking" },
  { key: "partners", name: "Logo showcase" },
  { key: "testimonials", name: "Farmer testimonials" },
  { key: "featured", name: "Featured videos" }, { key: "library", name: "Video library" },
  { key: "topics", name: "Topics" }, { key: "story", name: "Creator story" },
  { key: "steps", name: "Steps" }, { key: "subscribe", name: "Subscribe" },
  { key: "about", name: "About page" },
  { key: "contact", name: "Contact page" }, { key: "watch", name: "Watch page" },
  { key: "notFound", name: "404 page" },
  { key: "ui", name: "Interface labels" },
  { key: "legal", name: "Privacy & terms" }, { key: "seo", name: "Search metadata" },
];

const label = (key: string) => ({ logoUrl: "Main logo", youtubeUrl: "YouTube channel URL", instagramUrl: "Instagram URL", facebookUrl: "Facebook profile URL", whatsappPhone: "WhatsApp number", phone: "Contact phone number", email: "Contact email", youtubeSubscribers: "YouTube subscribers", facebookFollowers: "Facebook followers", instagramFollowers: "Instagram followers", ga4MeasurementId: "GA4 measurement ID", clarityProjectId: "Microsoft Clarity project ID" })[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const imageField = (key: string) => /^(logoUrl|backgroundUrl|imageUrl)$/.test(key);
const longField = (key: string, value: string) => /description|paragraph|body|intro|bio|note/i.test(key) || value.length > 110;
const validHeroBackgroundUrl = (value: string) => {
  const url = value.trim();
  if (/^\/(?!\/)[^\s<>"']+$/.test(url)) return true;
  if (url.length <= 180_000 && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(url)) return true;
  try { return new URL(url).protocol === "https:"; } catch { return false; }
};

function updateAtPath(content: ChannelContent, path: Path, value: unknown): ChannelContent {
  const copy = structuredClone(content);
  let node: Record<string | number, unknown> = copy as unknown as Record<string | number, unknown>;
  for (const part of path.slice(0, -1)) node = node[part] as Record<string | number, unknown>;
  node[path[path.length - 1]] = value;
  return copy;
}

function updateTranslationAtPath(content: ChannelContent, language: "te" | "hi", path: Path, value: unknown): ChannelContent {
  const copy = structuredClone(content);
  copy.translations ??= {};
  const root = (copy.translations[language] ??= {});
  let node = root as Record<string | number, unknown>;
  for (let index = 0; index < path.length - 1; index++) {
    const part = path[index];
    // Firestore arrays cannot contain sparse holes; fill untouched entries with empty patches.
    if (Array.isArray(node) && typeof part === "number") {
      for (let item = 0; item <= part; item++) node[item] ??= {};
    }
    if (node[part] === undefined) node[part] = typeof path[index + 1] === "number" ? [] : {};
    node = node[part] as Record<string | number, unknown>;
  }
  node[path[path.length - 1]] = value;
  return copy;
}

function getAtPath(content: ChannelContent, path: Path): unknown {
  let node: unknown = content;
  for (const part of path) node = (node as Record<string | number, unknown>)[part];
  return node;
}

function emptyItem(path: Path): Record<string, string> {
  if (path[0] === "topics") return { title: "", description: "", icon: "sprout" };
  if (path[0] === "legal") return { heading: "", body: "" };
  if (path[0] === "partners") return { name: "", logoUrl: "", website: "" };
  if (path[0] === "testimonials") return { name: "", role: "", quote: "", imageUrl: "" };
  return { title: "", description: "" };
}

const sharedField = (path: Path) => {
  if (path[0] === "appearance") return true;
  const last = String(path[path.length - 1]);
  return ["logoUrl", "youtubeUrl", "email", "phone", "whatsappPhone", "instagramUrl", "facebookUrl", "youtubeSubscribers", "facebookFollowers", "instagramFollowers", "ga4MeasurementId", "clarityProjectId", "developerName", "developerUrl", "backgroundUrl", "featuredVideoId", "imageUrl", "icon", "website"].includes(last) || path[0] === "partners" && path.includes("items");
};

function AppearanceEditor({ appearance, heroBackgroundUrl, onChange }: { appearance: ChannelCopy["appearance"]; heroBackgroundUrl: string; onChange: (path: Path, value: unknown) => void }) {
  const fontSelect = (name: string, value: FontId | "", path: Path, optional = false) => <label className="block space-y-1.5 text-sm font-medium">
    <span>{name}</span>
    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value} onChange={(event) => onChange(path, event.target.value)}>
      {optional && <option value="">Use site fonts</option>}
      {fontOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
  </label>;

  return <div className="space-y-8">
    <p className="text-sm text-muted-foreground">Appearance settings are shared by English, Telugu and Hindi. Each font includes Telugu and Hindi fallbacks. Section choices override both site body and heading fonts within that section.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-1.5 text-sm font-medium sm:col-span-2"><span>Header background color</span>
        <div className="flex items-center gap-3">
          <input type="color" aria-label="Pick header background color" className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1" value={normalizeHeaderColor(appearance.headerColor)} onChange={(event) => onChange(["appearance", "headerColor"], event.target.value)} />
          <Input aria-label="Header background hex color" value={appearance.headerColor} onChange={(event) => onChange(["appearance", "headerColor"], event.target.value)} placeholder="#f6f1e6" maxLength={7} />
        </div>
        <small className="block text-muted-foreground">Enter a six-digit hex color. Header text switches automatically between dark and light for contrast.</small>
      </label>
      {fontSelect("Logo and brand name font", appearance.logoFont, ["appearance", "logoFont"])}
      {fontSelect("Site body font", appearance.bodyFont, ["appearance", "bodyFont"])}
      {fontSelect("Site heading font", appearance.headingFont, ["appearance", "headingFont"])}
    </div>
    <div className="space-y-4">
      <div><h4 className="text-base font-semibold">Hero background and fade</h4><p className="mt-1 text-sm text-muted-foreground">Choose the farming photograph and how strongly the page color fades over it. The current look is the default at 100%.</p></div>
      <AdminImageUpload label="Hero background image" value={heroBackgroundUrl} onChange={(value) => onChange(["hero", "backgroundUrl"], value)} maxChars={180_000} helperText="Upload a compressed image or use an HTTPS image URL. This background appears behind the hero on desktop and mobile." />
      <Input aria-label="Hero background image URL" value={heroBackgroundUrl.startsWith("data:") ? "" : heroBackgroundUrl} onChange={(event) => onChange(["hero", "backgroundUrl"], event.target.value)} placeholder="/images/hero-farmland.jpg or https://..." />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["heroFadeDesktop", "heroFadeMobile"] as const).map((key) => <label key={key} className="block space-y-2 text-sm font-medium">
          <span>{key === "heroFadeDesktop" ? "Desktop background fade" : "Mobile background fade"}: {appearance[key]}%</span>
          <input type="range" min="0" max="100" step="1" value={appearance[key]} onChange={(event) => onChange(["appearance", key], Number(event.target.value))} className="w-full accent-primary" />
          <small className="block text-muted-foreground">0% shows the image clearly; 100% matches the current fade.</small>
        </label>)}
      </div>
      <Button type="button" variant="outline" onClick={() => {
        onChange(["hero", "backgroundUrl"], defaultChannelContent.hero.backgroundUrl);
        onChange(["appearance", "heroFadeDesktop"], defaultChannelContent.appearance.heroFadeDesktop);
        onChange(["appearance", "heroFadeMobile"], defaultChannelContent.appearance.heroFadeMobile);
      }}>Restore current hero look</Button>
    </div>
    <div className="space-y-4">
      <div><h4 className="text-base font-semibold">Section fonts</h4><p className="mt-1 text-sm text-muted-foreground">Choose a font for a section, or leave it on the site fonts above.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sectionFontOptions.map(({ id, label }) => <div key={id}>{fontSelect(label, appearance.sectionFonts[id], ["appearance", "sectionFonts", id], true)}</div>)}
      </div>
    </div>
  </div>;
}
type EditorProps = { name: string; value: unknown; path: Path; onChange: (path: Path, value: unknown) => void; translationMode?: boolean };

function EditorField({ name, value, path, onChange, translationMode = false }: EditorProps) {
  if (Array.isArray(value)) {
    return <fieldset className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <legend className="px-2 text-sm font-semibold">{label(name)}</legend>
      {value.map((item, index) => <div key={index} className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><strong className="text-sm">Item {index + 1}</strong>{!translationMode && <div className="flex flex-wrap gap-1">{["partners", "testimonials"].includes(String(path[0])) && <><Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(path, next); }}>Up</Button><Button type="button" variant="outline" size="sm" disabled={index === value.length - 1} onClick={() => { const next = [...value]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(path, next); }}>Down</Button></>}<Button type="button" variant="outline" size="sm" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button></div>}</div>
        <EditorField name={`${name} ${index + 1}`} value={item} path={[...path, index]} onChange={onChange} translationMode={translationMode} />
      </div>)}
      {!translationMode && <Button type="button" variant="outline" size="sm" onClick={() => onChange(path, [...value, emptyItem(path)])}>Add item</Button>}
    </fieldset>;
  }
  if (value && typeof value === "object") {
    return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(value).filter(([key]) => !translationMode || !sharedField([...path, key])).map(([key, fieldValue]) => <EditorField key={key} name={key} value={fieldValue} path={[...path, key]} onChange={onChange} translationMode={translationMode} />)}</div>;
  }
  const text = String(value ?? "");
  if (imageField(name)) return <div className="space-y-2 sm:col-span-2">
    <AdminImageUpload label={label(name)} value={text} onChange={(next) => onChange(path, next)} maxChars={180_000} helperText="Upload a compressed image or enter an HTTPS image URL. Large images are limited so the content document fits in Firestore." />
    <Input aria-label={`${label(name)} URL`} value={text.startsWith("data:") ? "" : text} onChange={(event) => onChange(path, event.target.value)} placeholder="/images/example.jpg or https://..." />
  </div>;
  return <label className={`block space-y-1 text-sm font-medium ${longField(name, text) ? "sm:col-span-2" : ""}`}>
    <span>{label(name)}</span>
    {longField(name, text) ? <Textarea rows={Math.min(7, Math.max(3, Math.ceil(text.length / 80)))} value={text} onChange={(event) => onChange(path, event.target.value)} /> : <Input value={text} inputMode={/^(youtubeSubscribers|facebookFollowers|instagramFollowers)$/.test(name) ? "numeric" : undefined} onChange={(event) => onChange(path, event.target.value)} />}
    {name === "featuredVideoId" && <small className="block text-muted-foreground">Leave blank to feature the newest visible upload. Enter a YouTube video ID to pin one.</small>}
    {name === "phone" && path[0] === "brand" && <small className="block text-muted-foreground">Shown on the Contact page. Leave blank to hide the call link.</small>}
    {name === "whatsappPhone" && <small className="block text-muted-foreground">Include country code. This number powers the floating WhatsApp button and Contact page. Leave blank to hide both.</small>}
    {name === "instagramUrl" && <small className="block text-muted-foreground">Use an HTTPS instagram.com profile URL. Leave blank to hide Instagram links.</small>}
    {name === "facebookUrl" && <small className="block text-muted-foreground">Use an HTTPS facebook.com profile URL. Leave blank to show the Facebook count without a link.</small>}
    {name === "ga4MeasurementId" && <small className="block text-muted-foreground">Enter the GA4 web stream measurement ID (G-...). Leave blank until the correct property is available.</small>}
    {name === "clarityProjectId" && <small className="block text-muted-foreground">Enter the Clarity project ID. Leave blank until the correct project is available.</small>}
    {/^(youtubeSubscribers|facebookFollowers|instagramFollowers)$/.test(name) && <small className="block text-muted-foreground">Enter the current total using digits only. Leave blank if unavailable; the website will show a dash instead of an invented count.</small>}
  </label>;
}

export default function ContentManagement() {
  const { data: saved = defaultChannelContent, isPending, isError, error } = useChannelContent();
  const saveContent = useSaveChannelContent();
  const [editedDraft, setEditedDraft] = useState<ChannelContent | null>(null);
  const draft = editedDraft ?? saved;
  const dirty = editedDraft !== null;
  const [section, setSection] = useState<keyof ChannelCopy>("hero");
  const [language, setLanguage] = useState<Language>("en");
  const mode = channelStorageMode();

  function onChange(path: Path, value: unknown) {
    setEditedDraft((current) => language === "en" || path[0] === "appearance" || path[0] === "hero" && path[1] === "backgroundUrl" ? updateAtPath(current ?? saved, path, value) : updateTranslationAtPath(current ?? saved, language, path, value));
  }

  async function save() {
    const youtube = draft.brand.youtubeUrl.trim();
    try {
      const url = new URL(youtube);
      if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) throw new Error();
    } catch { toast.error("Use an HTTPS YouTube channel URL."); return; }
    try {
      const url = new URL(draft.brand.developerUrl.trim());
      if (url.protocol !== "https:") throw new Error();
    } catch { toast.error("Use an HTTPS developer website URL."); return; }
    const phone = draft.brand.phone.trim();
    if (phone && !safeTelephoneHref(phone)) {
      toast.error("Enter a contact phone number with 10 to 15 digits, or leave it blank to hide the call link.");
      return;
    }
    const whatsapp = draft.brand.whatsappPhone.trim();
    if (whatsapp && !safeWhatsAppHref(whatsapp)) {
      toast.error("Enter a WhatsApp number with 10 to 15 digits, or leave it blank to hide the button.");
      return;
    }
    const instagram = draft.brand.instagramUrl.trim();
    if (instagram && !safeInstagramHref(instagram)) {
      toast.error("Use an HTTPS instagram.com profile URL, or leave Instagram blank to hide the link.");
      return;
    }
    const facebook = draft.brand.facebookUrl.trim();
    if (facebook && !safeFacebookHref(facebook)) {
      toast.error("Use an HTTPS facebook.com profile URL, or leave Facebook blank.");
      return;
    }
    for (const key of ["youtubeSubscribers", "facebookFollowers", "instagramFollowers"] as const) {
      const count = draft.social[key].trim();
      if (count && !normalizeSocialCount(count)) {
        toast.error(`${label(key)} must be a whole number of up to 12 digits, or blank.`);
        return;
      }
    }
    const ga4Id = draft.analytics.ga4MeasurementId.trim();
    if (ga4Id && !/^G-[A-Z0-9]{4,20}$/.test(ga4Id)) { toast.error("Enter a valid GA4 measurement ID beginning G-, or leave it blank."); return; }
    const clarityId = draft.analytics.clarityProjectId.trim();
    if (clarityId && !/^[a-z0-9]{4,32}$/.test(clarityId)) { toast.error("Enter a valid Microsoft Clarity project ID, or leave it blank."); return; }
    if (!/^#[\da-fA-F]{6}$/.test(draft.appearance.headerColor.trim())) { toast.error("Enter a six-digit hex header color, such as #f6f1e6."); return; }
    if (![draft.appearance.logoFont, draft.appearance.bodyFont, draft.appearance.headingFont].every(isFontId) || sectionFontOptions.some(({ id }) => draft.appearance.sectionFonts[id] !== "" && !isFontId(draft.appearance.sectionFonts[id]))) {
      toast.error("Choose fonts from the available list."); return;
    }
    if ([draft.appearance.heroFadeDesktop, draft.appearance.heroFadeMobile].some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100 || normalizeHeroFade(value) !== value)) {
      toast.error("Choose hero fade values from 0 to 100%."); return;
    }
    if (!validHeroBackgroundUrl(draft.hero.backgroundUrl)) { toast.error("Use a hero background image from this site, an HTTPS URL, or an uploaded image."); return; }
    if (JSON.stringify(draft).length > 850_000) { toast.error("Content is too large for one Firestore document. Use smaller images or image URLs."); return; }
    try {
      await saveContent.mutateAsync(draft);
      setEditedDraft(null);
      toast.success(mode === "local" ? "Saved in this browser's local preview." : "Website content saved.");
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save content."); }
  }

  return <AdminLayout title="Website content"><div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">Edit the channel website</h2><p className="mt-1 text-sm text-muted-foreground">Use Appearance for colors and fonts, Brand & links for the logo, contact details and social URLs, Social counts for subscriber and follower totals, Logo showcase for partners, and Farmer testimonials for quotes and photos. The public site updates after saving.</p></div><Button onClick={() => void save()} disabled={!dirty || saveContent.isPending || mode === "readonly"}><Save className="mr-2 h-4 w-4" />{saveContent.isPending ? "Saving…" : "Save changes"}</Button></div>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Content language">{(["en", "te", "hi"] as const).map((code) => <button key={code} type="button" aria-pressed={language === code} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${language === code ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`} onClick={() => setLanguage(code)}>{code === "en" ? "English" : code === "te" ? "తెలుగు" : "हिन्दी"}</button>)}</div>
    {language !== "en" && <p className="text-sm text-muted-foreground">Edit translated text for {language === "te" ? "Telugu" : "Hindi"}. Links, images, video selection, and list structure are shared with English. Unedited text uses the built-in translation or English fallback.</p>}
    {mode === "local" && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Local preview mode: edits are saved only in this browser on localhost. Configure Firebase for shared, persistent production editing.</p>}
    {isError && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error instanceof Error ? error.message : "Content could not be loaded."}</p>}
    {isPending && <p className="text-sm text-muted-foreground">Loading content…</p>}
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Content sections">{sections.map((item) => <button key={item.key} type="button" className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${section === item.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`} onClick={() => setSection(item.key)}>{item.name}</button>)}</nav>
      <section className="min-w-0 rounded-xl border bg-card p-5 shadow-sm"><h3 className="mb-5 text-xl font-semibold">{sections.find((item) => item.key === section)?.name}</h3>{section === "appearance" ? <AppearanceEditor appearance={draft.appearance} heroBackgroundUrl={draft.hero.backgroundUrl} onChange={onChange} /> : <EditorField name={section} value={getAtPath(localizeContent(draft, language), [section])} path={[section]} onChange={onChange} translationMode={language !== "en"} />}</section>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><Button type="button" variant="outline" disabled={!dirty} onClick={() => setEditedDraft(null)}><RotateCcw className="mr-2 h-4 w-4" />Discard unsaved changes</Button><Button onClick={() => void save()} disabled={!dirty || saveContent.isPending || mode === "readonly"}>Save changes</Button></div>
  </div></AdminLayout>;
}
