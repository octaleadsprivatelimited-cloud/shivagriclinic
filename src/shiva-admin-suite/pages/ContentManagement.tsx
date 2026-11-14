import { useState } from "react";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { AdminImageUpload } from "../components/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { channelStorageMode, useChannelContent, useSaveChannelContent } from "@/hooks/useChannelContent";
import { defaultChannelContent, safeInstagramHref, safeTelephoneHref, safeWhatsAppHref, type ChannelContent, type ChannelCopy, type Language } from "@/data/channelContent";
import { localizeContent } from "@/i18n/channelI18n";

type Path = (string | number)[];
const sections: { key: keyof ChannelCopy; name: string }[] = [
  { key: "brand", name: "Brand & links" }, { key: "nav", name: "Navigation" },
  { key: "hero", name: "Hero" }, { key: "highlights", name: "Highlights" },
  { key: "partners", name: "Logo showcase" },
  { key: "featured", name: "Featured videos" }, { key: "library", name: "Video library" },
  { key: "topics", name: "Topics" }, { key: "story", name: "Creator story" },
  { key: "steps", name: "Steps" }, { key: "subscribe", name: "Subscribe" },
  { key: "about", name: "About page" }, { key: "cropManagement", name: "Crop management page" },
  { key: "contact", name: "Contact page" }, { key: "watch", name: "Watch page" },
  { key: "notFound", name: "404 page" },
  { key: "ui", name: "Interface labels" },
  { key: "legal", name: "Privacy & terms" }, { key: "seo", name: "Search metadata" },
];

const label = (key: string) => ({ logoUrl: "Main logo", youtubeUrl: "YouTube channel URL", instagramUrl: "Instagram URL", whatsappPhone: "WhatsApp number", phone: "Contact phone number", email: "Contact email" })[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const imageField = (key: string) => /^(logoUrl|backgroundUrl|imageUrl)$/.test(key);
const longField = (key: string, value: string) => /description|paragraph|body|intro|bio|note/i.test(key) || value.length > 110;

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
  return { title: "", description: "" };
}

const sharedField = (path: Path) => {
  const last = String(path[path.length - 1]);
  return ["logoUrl", "youtubeUrl", "email", "phone", "whatsappPhone", "instagramUrl", "developerName", "developerUrl", "backgroundUrl", "featuredVideoId", "imageUrl", "icon", "website"].includes(last) || path[0] === "partners" && path.includes("items");
};
type EditorProps = { name: string; value: unknown; path: Path; onChange: (path: Path, value: unknown) => void; translationMode?: boolean };

function EditorField({ name, value, path, onChange, translationMode = false }: EditorProps) {
  if (Array.isArray(value)) {
    return <fieldset className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <legend className="px-2 text-sm font-semibold">{label(name)}</legend>
      {value.map((item, index) => <div key={index} className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><strong className="text-sm">Item {index + 1}</strong>{!translationMode && <div className="flex flex-wrap gap-1">{path[0] === "partners" && <><Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(path, next); }}>Up</Button><Button type="button" variant="outline" size="sm" disabled={index === value.length - 1} onClick={() => { const next = [...value]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(path, next); }}>Down</Button></>}<Button type="button" variant="outline" size="sm" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button></div>}</div>
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
    {longField(name, text) ? <Textarea rows={Math.min(7, Math.max(3, Math.ceil(text.length / 80)))} value={text} onChange={(event) => onChange(path, event.target.value)} /> : <Input value={text} onChange={(event) => onChange(path, event.target.value)} />}
    {name === "featuredVideoId" && <small className="block text-muted-foreground">Leave blank to feature the newest visible upload. Enter a YouTube video ID to pin one.</small>}
    {name === "phone" && path[0] === "brand" && <small className="block text-muted-foreground">Shown on the Contact page. Leave blank to hide the call link.</small>}
    {name === "whatsappPhone" && <small className="block text-muted-foreground">Include country code. This number powers the floating WhatsApp button and Contact page. Leave blank to hide both.</small>}
    {name === "instagramUrl" && <small className="block text-muted-foreground">Use an HTTPS instagram.com profile URL. Leave blank to hide Instagram links.</small>}
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
    setEditedDraft((current) => language === "en" ? updateAtPath(current ?? saved, path, value) : updateTranslationAtPath(current ?? saved, language, path, value));
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
    if (JSON.stringify(draft).length > 850_000) { toast.error("Content is too large for one Firestore document. Use smaller images or image URLs."); return; }
    try {
      await saveContent.mutateAsync(draft);
      setEditedDraft(null);
      toast.success(mode === "local" ? "Saved in this browser's local preview." : "Website content saved.");
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save content."); }
  }

  return <AdminLayout title="Website content"><div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">Edit the channel website</h2><p className="mt-1 text-sm text-muted-foreground">Use Brand & links for the main logo, contact details, social links and floating WhatsApp number. Use Logo showcase for partner logos. The public site updates after saving.</p></div><Button onClick={() => void save()} disabled={!dirty || saveContent.isPending || mode === "readonly"}><Save className="mr-2 h-4 w-4" />{saveContent.isPending ? "Saving…" : "Save changes"}</Button></div>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Content language">{(["en", "te", "hi"] as const).map((code) => <button key={code} type="button" aria-pressed={language === code} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${language === code ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`} onClick={() => setLanguage(code)}>{code === "en" ? "English" : code === "te" ? "తెలుగు" : "हिन्दी"}</button>)}</div>
    {language !== "en" && <p className="text-sm text-muted-foreground">Edit translated text for {language === "te" ? "Telugu" : "Hindi"}. Links, images, video selection, and list structure are shared with English. Unedited text uses the built-in translation or English fallback.</p>}
    {mode === "local" && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Local preview mode: edits are saved only in this browser on localhost. Configure Firebase for shared, persistent production editing.</p>}
    {isError && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error instanceof Error ? error.message : "Content could not be loaded."}</p>}
    {isPending && <p className="text-sm text-muted-foreground">Loading content…</p>}
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Content sections">{sections.map((item) => <button key={item.key} type="button" className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${section === item.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`} onClick={() => setSection(item.key)}>{item.name}</button>)}</nav>
      <section className="min-w-0 rounded-xl border bg-card p-5 shadow-sm"><h3 className="mb-5 text-xl font-semibold">{sections.find((item) => item.key === section)?.name}</h3><EditorField name={section} value={getAtPath(localizeContent(draft, language), [section])} path={[section]} onChange={onChange} translationMode={language !== "en"} /></section>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><Button type="button" variant="outline" disabled={!dirty} onClick={() => setEditedDraft(null)}><RotateCcw className="mr-2 h-4 w-4" />Discard unsaved changes</Button><Button onClick={() => void save()} disabled={!dirty || saveContent.isPending || mode === "readonly"}>Save changes</Button></div>
  </div></AdminLayout>;
}
