import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const pages = JSON.parse(await readFile(path.join(projectRoot, "src/data/seoPages.json"), "utf8"));
const sourceHtml = await readFile(path.join(distRoot, "index.html"), "utf8");
const siteUrl = (process.env.VITE_SITE_URL || "https://www.shivaagriclinic.com").replace(/\/$/, "");

if (!/^https:\/\/[^/]+$/.test(siteUrl)) throw new Error("VITE_SITE_URL must be an HTTPS site origin");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function replaceMeta(html, attribute, key, value) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${key}["'][^>]*>`, "i");
  if (!pattern.test(html)) throw new Error(`Missing ${attribute}=${key} in index.html`);
  return html.replace(pattern, tag);
}

function renderPage(route, page) {
  const canonical = `${siteUrl}${route}`;
  const title = page.title.includes("Shiva Agri Clinic") ? page.title : `${page.title} | Shiva Agri Clinic`;
  let html = sourceHtml.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "name", "keywords", page.keywords);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", `${siteUrl}/og-image.png`);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = replaceMeta(html, "name", "twitter:url", canonical);
  html = replaceMeta(html, "name", "twitter:image", `${siteUrl}/og-image.png`);
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  if (route === "/") {
    const organization = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Shiva Agri Clinic",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/favicon-shiva-512.png`,
    }).replace(/</g, "\\u003c");
    html = html.replace("</head>", `  <script id="channel-organization-schema" data-channel-schema="true" type="application/ld+json">${organization}</script>\n  </head>`);
  }
  return html;
}

for (const [route, page] of Object.entries(pages)) {
  if (route !== "/" && !/^\/[a-z-]+$/.test(route)) throw new Error(`Invalid SEO route: ${route}`);
  const output = route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route.slice(1), "index.html");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, renderPage(route, page));
}

function renderFallback({ kind }) {
  const indexable = kind !== "generic";
  const title = kind === "watch"
    ? "Watch a farming video | Shiva Agri Clinic"
    : kind === "blog"
      ? "Read a field note | Shiva Agri Clinic"
      : "Shiva Agri Clinic";
  const description = kind === "watch"
    ? "Watch a farming video and explore more stories from the Shiva Agri Clinic YouTube channel."
    : kind === "blog"
      ? "Read a published field note from Shiva Agri Clinic."
      : "Explore farming videos and field stories from Shiva Agri Clinic.";
  let html = sourceHtml.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "name", "keywords", kind === "watch" ? "Shiva Agri Clinic farming video" : "Shiva Agri Clinic");
  html = replaceMeta(html, "name", "robots", indexable ? "index, follow" : "noindex, nofollow");
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/i, "");
  html = html.replace(/<meta\s+[^>]*property=["']og:url["'][^>]*>\s*/i, "");
  html = html.replace(/<meta\s+[^>]*name=["']twitter:url["'][^>]*>\s*/i, "");
  return html;
}

await mkdir(path.join(distRoot, "watch"), { recursive: true });
await writeFile(path.join(distRoot, "watch", "index.html"), renderFallback({ kind: "watch" }));
await mkdir(path.join(distRoot, "blog-post"), { recursive: true });
await writeFile(path.join(distRoot, "blog-post", "index.html"), renderFallback({ kind: "blog" }));
const fallback = renderFallback({ kind: "generic" });
await writeFile(path.join(distRoot, "spa-fallback.html"), fallback);
await writeFile(path.join(distRoot, "404.html"), fallback);

console.log(`Generated ${Object.keys(pages).length} SEO page shells, two dynamic shells, and two SPA fallbacks`);
