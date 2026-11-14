# SEO setup

The public pages are `/`, `/videos`, `/about`, `/crop-management`, `/contact`, `/privacy-policy`, and `/terms`. Their English fallback titles, descriptions, and keyword phrases live in `src/data/seoPages.json`. The site editor at `/admin/content` can change public page titles and descriptions at runtime. The build also generates route-specific HTML heads from the fallback values so link previews can read titles and descriptions without running JavaScript.

The canonical host is `https://www.shivaagriclinic.com`. Its apex currently redirects to `www`. Set `VITE_SITE_URL` to this HTTPS origin for production builds if the host changes. `public/sitemap.xml` lists public static routes, and `public/robots.txt` points to it. The admin and API paths are excluded from crawling; production hosting should also send `X-Robots-Tag: noindex` for admin pages.

`src/components/SEO.tsx` updates metadata when users navigate or switch language. It adds Organization and WebSite structured data on the homepage and VideoObject data on watch pages when the YouTube publish date is available. The watch page metadata is currently client rendered; a server-rendered watch response would improve previews in crawlers that do not run JavaScript. Automatically uploaded watch URLs are not included in the static sitemap.

The pages include a small, relevant `meta keywords` field because it was requested. [Google ignores this field for indexing and ranking](https://developers.google.com/search/docs/crawling-indexing/special-tags); titles, descriptive page copy, internal links, and crawlable HTML matter more.

After the replacement site is live on the production domain, verify the domain in [Google Search Console](https://search.google.com/search-console), submit `https://www.shivaagriclinic.com/sitemap.xml`, and inspect the homepage, videos page, and representative watch pages. Search Console access and ranking data are outside this repository.
