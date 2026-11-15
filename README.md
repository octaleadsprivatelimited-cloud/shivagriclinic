# Shiva Agri Clinic Video Channel

A Vite, React and TypeScript website for the Shiva Agri Clinic YouTube channel. The original round green and gold logo is retained. The hero uses a farm landscape and a featured channel video.

The homepage shows two continuously scrolling rows of partner logos immediately after the hero, plus YouTube subscriber, Facebook follower and Instagram follower cards. The header links to YouTube and Instagram, every public page has a floating WhatsApp link, and the footer includes the current-year copyright and an Octaleads development credit. The main and partner logos, contact details, social profile URLs, WhatsApp number, follower totals and credit link are editable in `/admin/content`. The server can fetch available counts from official platform APIs once credentials are configured; editor-entered totals remain a fallback. Until a total is available, its card shows a dash rather than an invented number.

The browser favicon, Apple touch icon and web manifest use a cropped version of the round header logo. The production HTML also includes crawlable homepage Organization logo metadata. See `SEO_SETUP.md` for the deployment and Google recrawl checks; changing a logo in the admin editor alone does not regenerate these static search assets.

## Run locally

Requires Node.js 24 (the same major version configured for Vercel).

```sh
npm ci
npm run dev
```

Open <http://localhost:8080>. The **local preview studio** is at <http://localhost:8080/admin>. It is available without Firebase only in Vite development mode on `localhost` or `127.0.0.1`. Content and video edits are stored in that browser's `localStorage`, so they are not shared with other users or devices. `npm run build` creates the production bundle; local preview editing is disabled in that bundle.

## Dynamic content

The public routes are `/`, `/videos`, `/watch/:id`, `/about`, `/crop-management`, `/contact`, `/team`, `/featured-in`, `/blog`, `/blog/:slug`, `/case-studies`, `/privacy-policy`, and `/terms`. The former `/services/crop-advisory` and `/services/crop-management` URLs redirect to `/crop-management`. Site copy, section cards, topics, partner logo images, links, testimonials, legal pages and SEO descriptions are edited at `/admin/content`. The editor renders text as text; it does not accept raw HTML. The hero's featured video ID can be left blank to use the newest visible upload. The Contact page offers email, phone, WhatsApp, Instagram and YouTube links; it does not rely on a form or Firebase configuration.

Visitors can switch between English, Telugu and Hindi from the site header. Their choice is saved in that browser and updates the document language for assistive technology. `/admin/content` has an editor for each language. English remains the base content; Telugu and Hindi text is stored as optional `translations.te` and `translations.hi` overrides in the same `settings/channel` document. Built-in translations fill missing fields, so content saved before multilingual support continues to work. Shared media, links and the featured video ID are edited once. Video titles supplied by YouTube retain the language used on YouTube.

The homepage farmer testimonials can be added, reordered, edited, or removed in `/admin/content` → Farmer testimonials. `/admin/team` manages team profiles. `/admin/featured-in` manages news clippings with an image upload or HTTPS image URL; each clipping can optionally open an HTTPS article URL. `/admin/blog` manages draft and published plain-text articles, and `/admin/case-studies` manages farmer case studies. The public editorial pages use the selected language for interface labels; editor-written entries appear in the language they were entered. In local preview, these records live only in the current browser. With Firebase configured, the same editors use Firestore collections protected by the admin claim rules in `firebase/rules/firestore.rules`.

The latest uploads come from the official YouTube channel's public RSS feed through `GET /api/youtube`. Vite provides this endpoint locally. `api/youtube.ts` provides the same endpoint on Vercel. It is cached for five minutes and keeps the last good feed on transient errors. YouTube's RSS feed supplies only the latest 15 uploads. Automatic uploads are combined with `/admin/videos` records: editors can change title/topic, set display order, hide an upload, or add an older YouTube video by ID. Drones, pesticides, sprayers, equipment and product videos are excluded by default. If the feed is unavailable, saved YouTube video entries remain visible; there is no static sample video fallback.

`npm run build` also generates distinct HTML metadata for the static public routes in `dist/<route>/index.html`. Vercel and Firebase Hosting map those exact paths before the SPA fallback. Watch and individual blog pages have generic indexable HTML shells without a canonical; the browser updates item metadata after loading, so non-JavaScript link-preview crawlers do not receive per-item titles or images. Unknown and admin paths use a noindex fallback shell. Changes to the built-in SEO text or `VITE_SITE_URL` canonical origin require a new deployment, while the public page copy and video list remain dynamic.

### Weekly social counts

`GET /api/social-counts` fetches YouTube subscribers and Facebook/Instagram followers from the [YouTube channels API](https://developers.google.com/youtube/data/reference/rest/v3/channels/list), [Facebook Page API](https://developers.facebook.com/docs/graph-api/reference/page/) and [Instagram User API](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user). Only counts are returned to visitors; keys and access tokens stay server-side. Configure these optional variables in `.env.local` for local development and in the host's server environment for deployment:

- `YOUTUBE_API_KEY` for this channel's public subscriber count. `YOUTUBE_CHANNEL_ID` can override the built-in channel ID.
- `META_PAGE_ID` and `META_PAGE_ACCESS_TOKEN` for the Facebook Page's `followers_count`.
- `META_IG_USER_ID` and `META_IG_ACCESS_TOKEN` for an Instagram professional account's `followers_count` through Facebook Graph API. The token must be authorized to read that IG User. If the Facebook Page token already has that access, the Instagram token can be omitted.

Meta access requires a valid app/token and the relevant Page or Instagram permissions. Set IDs to numeric platform IDs, and keep tokens out of `VITE_*` variables and Git. Restart the local Vite server after changing `.env.local`. The first request after a seven-day cache expires refreshes the counts; a site with no visitors does not run a scheduled refresh. Temporary platform failures preserve the last good count in a running server and retry after five minutes. Without credentials, the endpoint returns an empty object, so the admin-entered totals remain visible; if those are also blank, the cards show a dash. Static-only Firebase Hosting cannot run this endpoint without an additional function or proxy.
YouTube reports its public subscriber count rounded to three significant figures, so the card shows that public figure rather than an exact private total.

## Production CMS setup

Copy `.env.example` to `.env.local` and set all required `VITE_FIREBASE_*` values for local Firebase use. Set the same values in the production host and enable Firebase Authentication for staff. **Deploy `firebase/rules/firestore.rules` before enabling production editing.** CMS writes require a signed-in Firebase user whose ID token contains the custom claim `admin: true`; a regular authenticated account cannot write. The public site can read the channel content and video collection. Firestore stores channel content at `settings/channel` and video customizations in `videos`. Keep uploaded editor images small: the content editor compresses each image and rejects a document that approaches Firestore's size limit.

Grant the admin custom claim only from a trusted Firebase Admin SDK environment, never from browser code or a public endpoint. For a one-time grant, run this example in a separate trusted Node.js environment with `firebase-admin` installed and Application Default Credentials available. Set `ADMIN_EMAIL` to the intended staff account; keep service account credentials outside this repository:

```js
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!process.env.ADMIN_EMAIL) throw new Error("Set ADMIN_EMAIL first");
initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const user = await auth.getUserByEmail(process.env.ADMIN_EMAIL);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log(`Granted admin access to ${user.email}`);
```

After granting or removing a claim, the account must sign out and sign in again (or refresh its ID token) before the new permission takes effect. Restrict who can run the provisioning code and review admin claims periodically.

Automatic YouTube updates require a deployment host that executes `/api/youtube` (the included Vercel function, or an equivalent endpoint). A static-only Firebase Hosting deployment serves the website but cannot run this endpoint without an additional function or proxy. No YouTube API key is needed for the RSS endpoint.

## Deploy on Vercel with Firebase CMS

Vercel hosts the website and `/api/youtube` function; Firebase Authentication and Firestore hold the admin content. These are separate services. Create or select the **correct Shiva Agri Clinic Firebase project** before changing `.firebaserc` or deploying Firestore rules. Do not deploy this project's rules to an unrelated Firebase project.

1. Enable Firebase Authentication and Cloud Firestore in that project. Copy its Web App configuration into the `VITE_FIREBASE_*` environment variables for Vercel Preview and Production. These values identify the Firebase Web App; keep any Admin SDK credentials outside the frontend and repository. Add the Vercel preview and final website domains to Firebase Authentication's authorized domains.
2. For an editable preview, use an isolated Firebase project with this repository's Firestore rules and indexes, then grant the intended staff account the `admin: true` custom claim as described above. Test admin sign-in and a content save there. If the current live site shares a Firebase project, deploy the narrowed rules to it only at the replacement cutover, after checking its legacy collections are no longer needed.
3. Run `npm ci && npm run build` locally. Link this directory to an existing Vercel project and deploy with `npx vercel deploy --environment preview`. A newly created Vercel project assigns its first deployment to Production, even before a custom domain is connected; review that bootstrap separately. Verify `/`, `/videos`, `/contact`, `/api/youtube`, an admin route, and a direct reload of `/watch/<video-id>`. Check route-specific page source on the static routes and that old URLs return redirects.
4. After the preview is accepted, promote or deploy to Production and connect the final domain in Vercel. The SEO canonical URLs use `https://www.shivaagriclinic.com/`; move that domain only after preview verification and access to its current Vercel account is available.

The Vercel configuration supplies permanent redirects for retired service/product/solution routes, indexable HTML for the static pages, `X-Robots-Tag: noindex` for admin routes, and a fallback for client-side routes. Firebase Hosting configuration mirrors the static route and redirect behavior if Hosting is used separately, but Hosting alone cannot run the YouTube feed endpoint.

## Source layout

- `src/data/channelContent.ts`: typed defaults and content schema.
- `src/data/channelTranslations.ts`: built-in Telugu and Hindi copy and translation fallback.
- `src/hooks/useChannelContent.ts`: Firestore content read/write with a local development preview fallback.
- `src/hooks/useChannelSite.ts`: combines content, RSS uploads and admin video entries.
- `src/data/channelVideos.ts`: topic classification, exclusions and ordering.
- `src/components/channel/`: reusable video and subscription components.
- `src/channel.css`: public design, separate from the admin UI.

Old service, product and resource URLs other than crop advisory redirect to the video library or About page. The active admin includes channel overview, website content and testimonials, videos, team, Featured In, blog and case studies. The four named testimonials and their photos were carried over from the old site. Team profiles, press clippings, blog posts and case studies start empty until an editor adds verified material.
