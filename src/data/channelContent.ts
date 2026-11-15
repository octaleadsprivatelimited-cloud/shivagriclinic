import seoPages from "./seoPages.json";

export type TextCard = { title: string; description: string };
export type TopicCard = TextCard & { icon: "flower" | "story" | "water" | "sprout" | "fruit" };
export type LegalSection = { heading: string; body: string };
export type PartnerLogo = { name: string; logoUrl: string; website: string };
export type FarmerTestimonial = { name: string; role: string; quote: string; imageUrl: string };

export type ChannelCopy = {
  brand: { name: string; tagline: string; logoUrl: string; youtubeUrl: string; email: string; phone: string; whatsappPhone: string; instagramUrl: string; facebookUrl: string; developerName: string; developerUrl: string; copyrightText: string; developedByLabel: string; footerDescription: string; footerPoster: string; footerPosterAccent: string };
  nav: { home: string; videos: string; cropManagement: string; about: string; contact: string; youtube: string; exploreHeading: string; connectHeading: string; emailLabel: string; privacyLabel: string; termsLabel: string };
  hero: {
    eyebrow: string; title: string; accent: string; description: string;
    backgroundUrl: string; featuredVideoId: string;
    primaryLabel: string; secondaryLabel: string; note: string; sticker: string;
    handnoteTop: string; handnoteBottom: string; circleSticker: string; browserLabel: string;
    featuredLabel: string; watchLabel: string; scrollLabel: string;
  };
  highlights: { items: TextCard[] };
  social: { eyebrow: string; title: string; youtubeSubscribers: string; facebookFollowers: string; instagramFollowers: string; subscribersLabel: string; followersLabel: string; unavailableLabel: string };
  partners: { eyebrow: string; title: string; items: PartnerLogo[] };
  testimonials: { eyebrow: string; title: string; items: FarmerTestimonial[] };
  featured: { eyebrow: string; title: string; description: string; viewAllLabel: string };
  library: { eyebrow: string; title: string; accent: string; description: string; searchLabel: string; allLabel: string; emptyTitle: string; emptyDescription: string; resetLabel: string };
  topics: { eyebrow: string; title: string; description: string; items: TopicCard[] };
  story: { eyebrow: string; title: string; paragraphOne: string; paragraphTwo: string; imageUrl: string; imageAlt: string; imageCaption: string; linkLabel: string };
  steps: { eyebrow: string; title: string; description: string; items: TextCard[] };
  subscribe: { eyebrow: string; title: string; description: string; buttonLabel: string };
  about: {
    eyebrow: string; title: string; accent: string; intro: string; creatorEyebrow: string;
    creatorTitle: string; paragraphOne: string; paragraphTwo: string; buttonLabel: string;
    videosEyebrow: string; videosTitle: string; videosDescription: string; videosLinkLabel: string;
  };
  cropManagement: { eyebrow: string; title: string; intro: string; videosEyebrow: string; videosTitle: string; emptyLabel: string; contactLabel: string };
  contact: { eyebrow: string; title: string; intro: string; emailLabel: string; phoneLabel: string; youtubeLabel: string; whatsappLabel: string; instagramLabel: string; note: string };
  watch: { backLabel: string; youtubeLabel: string; relatedEyebrow: string; relatedTitle: string };
  ui: { watchVideoLabel: string; selectVideoLabel: string; videoSingular: string; videoPlural: string; clearSearchLabel: string; emptyFeatureLabel: string; emptyVideosLabel: string; skipLabel: string; mainNavLabel: string; mobileNavLabel: string; openMenuLabel: string; closeMenuLabel: string; filterLabel: string; loadingVideoLabel: string; siteInformationLabel: string; latestUploadsLabel: string; languageLabel: string };
  notFound: { eyebrow: string; title: string; description: string; buttonLabel: string };
  legal: {
    privacy: { title: string; intro: string; sections: LegalSection[] };
    terms: { title: string; intro: string; sections: LegalSection[] };
  };
  seo: {
    homeTitle: string; homeDescription: string; videosTitle: string; videosDescription: string;
    aboutTitle: string; aboutDescription: string; cropManagementTitle: string; cropManagementDescription: string;
    contactTitle: string; contactDescription: string; privacyTitle: string; privacyDescription: string;
    termsTitle: string; termsDescription: string;
  };
};

export type Language = "en" | "te" | "hi";
export type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export type ChannelContent = ChannelCopy & { translations?: Partial<Record<"te" | "hi", DeepPartial<ChannelCopy>>> };

export const defaultChannelContent: ChannelContent = {
  brand: {
    name: "Shiva Agri Clinic", tagline: "STORIES FROM THE FIELD", logoUrl: "/images/shiva-logo.png",
    youtubeUrl: "https://www.youtube.com/@ShivaAgriClinic",
    email: "info@shivaagriclinic.com",
    phone: "+91 70135 70447", whatsappPhone: "917013570447",
    instagramUrl: "https://www.instagram.com/shiva_agriclinic/",
    facebookUrl: "",
    developerName: "Octaleads", developerUrl: "https://www.octaleads.com/",
    copyrightText: "All rights reserved.", developedByLabel: "Developed By",
    footerDescription: "Watch stories from the field and explore farming videos from Shiva Agri Clinic.",
    footerPoster: "GOOD STORIES.", footerPosterAccent: "GROWING TOGETHER.",
  },
  nav: { home: "Home", videos: "Videos", cropManagement: "Crop Management", about: "About", contact: "Contact", youtube: "Watch on YouTube", exploreHeading: "Explore", connectHeading: "Connect", emailLabel: "Email the channel", privacyLabel: "Privacy", termsLabel: "Terms" },
  hero: {
    eyebrow: "THE AGRICULTURE VIDEO CHANNEL",
    title: "Farming stories,",
    accent: "straight from the field.",
    description: "Join G. Shiva Kumar in the field for real farming stories, practical growing ideas, and videos made for curious farmers.",
    backgroundUrl: "/images/hero-farmland.jpg",
    featuredVideoId: "",
    primaryLabel: "Explore videos", secondaryLabel: "Visit our YouTube",
    note: "Real farms. Real voices. A new perspective in every video.",
    sticker: "WATCH\nLEARN\nGROW",
    handnoteTop: "REAL FIELDS.\nBIGGER STORIES.", handnoteBottom: "FIELD NOTES\nON FILM.",
    circleSticker: "STAY\nCURIOUS", browserLabel: "THE VIDEO CHANNEL",
    featuredLabel: "FEATURED VIDEO", watchLabel: "Watch now", scrollLabel: "SCROLL TO EXPLORE",
  },
  highlights: { items: [
    { title: "Field stories", description: "Meet the people behind the work." },
    { title: "Real places", description: "See farms and ideas up close." },
    { title: "Curious minds", description: "Find a new perspective in each video." },
    { title: "Watch freely", description: "Explore here or on YouTube." },
  ] },
  social: {
    eyebrow: "FOLLOW THE FIELD STORIES", title: "Our growing community.",
    youtubeSubscribers: "", facebookFollowers: "", instagramFollowers: "",
    subscribersLabel: "Subscribers", followersLabel: "Followers", unavailableLabel: "Count not available",
  },
  partners: {
    eyebrow: "LOGO SHOWCASE", title: "A few familiar marks.",
    items: [
      { name: "BASF", logoUrl: "/images/partners/basf.webp", website: "" },
      { name: "Gromor", logoUrl: "/images/partners/gromor.jpg", website: "" },
      { name: "Nuziveedu Seeds", logoUrl: "/images/partners/nuziveedu-seeds.png", website: "" },
      { name: "Godrej Agrovet", logoUrl: "/images/partners/godrej-agrovet.jpg", website: "" },
      { name: "Coromandel", logoUrl: "/images/partners/coromandel.png", website: "" },
      { name: "Dhanuka", logoUrl: "/images/partners/dhanuka.png", website: "" },
      { name: "Laxmi Seeds", logoUrl: "/images/partners/laxmi-seeds.jpg", website: "" },
      { name: "Bayer", logoUrl: "/images/partners/bayer.jpg", website: "" },
      { name: "VPR Agro Tech", logoUrl: "/images/partners/vpr-agro-tech.jpg", website: "" },
    ],
  },
  testimonials: {
    eyebrow: "TESTIMONIALS", title: "Hear from our farmers.",
    items: [
      { name: "Ashok", role: "Flower Farmer - Vikarabad District, Telangana", imageUrl: "/images/testimonials/Ashok.jpeg", quote: "Shiva Agri Clinic played an important role in showcasing my flower farming practices to many fellow farmers. Through their efforts, my colour flower cultivation was shared as a practical example, creating awareness about the potential of flower crops. This exposure encouraged other farmers to explore flower farming as a profitable option. I am grateful to Shiva Agri Clinic for highlighting my work and helping spread knowledge that supports better farming practices and improved farmer income." },
      { name: "Buchi Reddy", role: "Fruit Farmer - Rangareddy District, Telangana", imageUrl: "/images/testimonials/Buchi Reddy.jpeg", quote: "Shiva Agri Clinic actively promoted my unique Gac fruit farming through video coverage, which gave my cultivation strong visibility among farmers and buyers. This promotion helped create awareness about the value and market potential of Gac fruit. With better marketing and increased interest, I was able to reach more people and improve my income. I appreciate Shiva Agri Clinic for supporting innovative crops and helping farmers benefit through knowledge, promotion, and market exposure." },
      { name: "Ajay Kumar Reddy", role: "Palm oil Farmer - Mahabubnagar District, Telangana", imageUrl: "/images/testimonials/Ajay Kumar Reddy.jpeg", quote: "Shiva Agri Clinic gave me the opportunity to share my palm oil farming experience through their videos. By showcasing practical techniques, daily farm practices, and tips for higher yield, I was able to reach many fellow farmers. It feels rewarding to know that my knowledge is helping others improve their farming, manage crops better, and increase their income. I sincerely thank Shiva Agri Clinic for creating this platform that connects farmers and spreads valuable, practical guidance." },
      { name: "Ramu", role: "Dragon Fruit Farmer - Rangareddy District, Telangana", imageUrl: "/images/testimonials/Ramu.jpeg", quote: "Growing dragon fruit was a new experience for me, and I wasn't sure how to reach the market. Shiva Agri Clinic guided me not only in cultivation techniques but also in connecting directly with customers. This helped me sell my fruits at better prices and build a loyal customer base. I am also happy that my plants and knowledge could reach other farmers, encouraging them to start dragon fruit cultivation. Thanks to Shiva Agri Clinic, my farming has become more profitable, organized, and inspiring for others." },
    ],
  },
  featured: { eyebrow: "FROM THE CHANNEL", title: "Watch the stories.", description: "A selection from the Shiva Agri Clinic video library.", viewAllLabel: "View all videos" },
  library: {
    eyebrow: "THE VIDEO LIBRARY", title: "Something good", accent: "to watch.",
    description: "Explore the Shiva Agri Clinic collection, choose a topic and watch at your own pace.",
    searchLabel: "Search videos", allLabel: "All videos", emptyTitle: "No videos found.",
    emptyDescription: "Try another search or topic.", resetLabel: "See all videos",
  },
  topics: {
    eyebrow: "FIND YOUR NEXT WATCH", title: "Explore by topic.",
    description: "Start with a subject and find videos worth sharing.",
    items: [
      { title: "Flower farming", description: "From jasmine fields to decorative crops.", icon: "flower" },
      { title: "Farm stories", description: "A closer look at people and places.", icon: "story" },
      { title: "Water & irrigation", description: "Practical ideas from working farms.", icon: "water" },
      { title: "Organic practices", description: "Natural methods and growing know-how.", icon: "sprout" },
      { title: "Fruit farming", description: "Explore fruit growing through video.", icon: "fruit" },
    ],
  },
  story: {
    eyebrow: "MEET THE CREATOR", title: "Knowledge starts with a story.",
    paragraphOne: "Shiva Agri Clinic was founded by G. Shiva Kumar, a National Youth Awardee (Government of India). The channel brings farming experiences and practical knowledge to viewers through video.",
    paragraphTwo: "From field visits to cultivation stories, each video offers another way to see the work happening on farms.",
    imageUrl: "/images/founder.jpg", imageAlt: "G. Shiva Kumar, founder of Shiva Agri Clinic",
    imageCaption: "THE PERSON BEHIND THE CHANNEL", linkLabel: "More about the channel",
  },
  steps: {
    eyebrow: "A SIMPLE WAY IN", title: "GOOD STORIES START HERE.",
    description: "Find a subject you love, spend a few minutes in the field, and keep exploring on YouTube.",
    items: [
      { title: "Pick a topic.", description: "Browse videos by the subjects that interest you." },
      { title: "Watch a story.", description: "Meet people, places and practices through video." },
      { title: "Keep learning.", description: "Follow the channel for more stories from the field." },
    ],
  },
  subscribe: {
    eyebrow: "STAY CURIOUS. KEEP GROWING.", title: "More stories are waiting on YouTube.",
    description: "Join the Shiva Agri Clinic channel to follow field visits, cultivation videos and practical farming stories.",
    buttonLabel: "Visit the channel",
  },
  about: {
    eyebrow: "ABOUT THE CHANNEL", title: "Real fields.", accent: "Real stories.",
    intro: "Shiva Agri Clinic brings farming stories and practical knowledge to viewers through video.",
    creatorEyebrow: "THE CREATOR", creatorTitle: "Meet G. Shiva Kumar.",
    paragraphOne: "G. Shiva Kumar founded Shiva Agri Clinic. He is a National Youth Awardee (Government of India) and has used video to share farming experiences, demonstrations and field visits.",
    paragraphTwo: "The channel is a place to see people at work on farms, hear their stories and explore cultivation through the lens of real visits.",
    buttonLabel: "Visit the YouTube channel", videosEyebrow: "START WATCHING",
    videosTitle: "The story continues in every video.",
    videosDescription: "Browse the library for flower farming, field stories, irrigation and organic practices.",
    videosLinkLabel: "Explore all videos",
  },
  cropManagement: {
    eyebrow: "CROP MANAGEMENT", title: "Learn from the field.",
    intro: "Explore cultivation and irrigation videos from Shiva Agri Clinic. Each video shows real farming practices and experiences from the channel.",
    videosEyebrow: "CROP VIDEOS", videosTitle: "Watch crop stories.",
    emptyLabel: "Crop videos will appear here when available.", contactLabel: "Contact the channel",
  },
  contact: {
    eyebrow: "GET IN TOUCH", title: "Contact the channel.",
    intro: "Questions about a video or want to connect with Shiva Agri Clinic? Choose the best way to reach us.",
    emailLabel: "Send an email", phoneLabel: "Call us", youtubeLabel: "Visit YouTube", whatsappLabel: "Chat on WhatsApp", instagramLabel: "Follow on Instagram", note: "For a question about a video, include its link in your message.",
  },
  watch: { backLabel: "Back to videos", youtubeLabel: "Open on YouTube", relatedEyebrow: "KEEP EXPLORING", relatedTitle: "More from the channel" },
  ui: { watchVideoLabel: "Watch video", selectVideoLabel: "SELECT A VIDEO TO WATCH", videoSingular: "video", videoPlural: "videos", clearSearchLabel: "Clear search", emptyFeatureLabel: "New videos will appear here.", emptyVideosLabel: "Videos will appear here when available.", skipLabel: "Skip to content", mainNavLabel: "Main navigation", mobileNavLabel: "Mobile navigation", openMenuLabel: "Open menu", closeMenuLabel: "Close menu", filterLabel: "Filter videos by topic", loadingVideoLabel: "Loading video...", siteInformationLabel: "SITE INFORMATION", latestUploadsLabel: "Latest uploads", languageLabel: "Language" },
  notFound: { eyebrow: "404 / PAGE NOT FOUND", title: "Nothing to watch here.", description: "This page may have moved. Head back to the video library and find your next watch.", buttonLabel: "Explore videos" },
  legal: {
    privacy: { title: "Privacy policy.", intro: "Last updated: 14 November 2026", sections: [
      { heading: "How this website works", body: "This website presents Shiva Agri Clinic videos and channel information. The public video library may load entries from Firebase or the public YouTube channel. The website does not offer an account for visitors or a contact form." },
      { heading: "Video content", body: "Video thumbnails are loaded from YouTube. When you choose to play a video, the embedded YouTube player loads from YouTube's privacy-enhanced domain. YouTube may process information about your visit according to its own policies." },
      { heading: "Analytics and local storage", body: "Where configured, Firebase Analytics may collect usage information about this website. Browser storage may also be used for essential application behavior." },
      { heading: "Questions", body: "For privacy questions, use the email address in the footer." },
    ] },
    terms: { title: "Terms of use.", intro: "Last updated: 14 November 2026", sections: [
      { heading: "Using the site", body: "This site helps visitors discover Shiva Agri Clinic videos. Video playback and external channel links are provided through YouTube and are subject to YouTube's terms and policies." },
      { heading: "Content", body: "Site content is for general information and viewing. Please respect the rights of the original video creators. Farming conditions vary, so video content should not be treated as a promise of a specific outcome." },
      { heading: "Availability", body: "Videos and links may change or become unavailable. We may update the site and its content over time." },
      { heading: "Questions", body: "For questions about this website, use the email address in the footer." },
    ] },
  },
  seo: {
    homeTitle: seoPages["/"].title, homeDescription: seoPages["/"].description,
    videosTitle: seoPages["/videos"].title, videosDescription: seoPages["/videos"].description,
    aboutTitle: seoPages["/about"].title, aboutDescription: seoPages["/about"].description,
    cropManagementTitle: seoPages["/crop-management"].title, cropManagementDescription: seoPages["/crop-management"].description,
    contactTitle: seoPages["/contact"].title, contactDescription: seoPages["/contact"].description,
    privacyTitle: seoPages["/privacy-policy"].title, privacyDescription: seoPages["/privacy-policy"].description,
    termsTitle: seoPages["/terms"].title, termsDescription: seoPages["/terms"].description,
  },
};

export function mergeChannelContent(value: Partial<ChannelContent> | null | undefined): ChannelContent {
  if (!value || typeof value !== "object") return defaultChannelContent;
  const merged = { ...defaultChannelContent } as ChannelContent;
  for (const key of Object.keys(defaultChannelContent) as (keyof ChannelContent)[]) {
    const section = value[key];
    if (section && typeof section === "object" && !Array.isArray(section)) {
      (merged as unknown as Record<string, unknown>)[key] = { ...defaultChannelContent[key], ...section };
    }
  }
  if (value.translations && typeof value.translations === "object") merged.translations = value.translations;
  merged.brand.youtubeUrl = safeYouTubeHref(merged.brand.youtubeUrl) ?? defaultChannelContent.brand.youtubeUrl;
  merged.brand.facebookUrl = safeFacebookHref(merged.brand.facebookUrl) ?? "";
  merged.social.youtubeSubscribers = normalizeSocialCount(merged.social.youtubeSubscribers);
  merged.social.facebookFollowers = normalizeSocialCount(merged.social.facebookFollowers);
  merged.social.instagramFollowers = normalizeSocialCount(merged.social.instagramFollowers);
  return merged;
}

function deepOverlay<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (patch === undefined || patch === null) return base;
  if (Array.isArray(base) && Array.isArray(patch)) {
    return base.map((item, index) => deepOverlay(item, patch[index] as DeepPartial<typeof item>)) as T;
  }
  if (base && typeof base === "object" && patch && typeof patch === "object" && !Array.isArray(patch)) {
    const result = { ...base } as Record<string, unknown>;
    for (const [key, value] of Object.entries(patch)) {
      if (key in result) result[key] = deepOverlay(result[key], value as never);
    }
    return result as T;
  }
  return typeof patch === "string" && !patch.trim() ? base : patch as T;
}

export function resolveChannelContent(content: ChannelContent, language: Language, builtIn: Partial<Record<"te" | "hi", DeepPartial<ChannelCopy>>>): ChannelCopy {
  if (language === "en") return content;
  const translated = deepOverlay(deepOverlay(content, builtIn[language]), content.translations?.[language]);
  // Media and external destinations are global, so changing language never changes the logo, links, or featured video.
  translated.brand.logoUrl = content.brand.logoUrl;
  translated.brand.youtubeUrl = content.brand.youtubeUrl;
  translated.brand.email = content.brand.email;
  translated.brand.phone = content.brand.phone;
  translated.brand.whatsappPhone = content.brand.whatsappPhone;
  translated.brand.instagramUrl = content.brand.instagramUrl;
  translated.brand.facebookUrl = content.brand.facebookUrl;
  translated.brand.developerName = content.brand.developerName;
  translated.brand.developerUrl = content.brand.developerUrl;
  translated.hero.backgroundUrl = content.hero.backgroundUrl;
  translated.hero.featuredVideoId = content.hero.featuredVideoId;
  translated.story.imageUrl = content.story.imageUrl;
  translated.partners.items = content.partners.items;
  translated.testimonials.items = content.testimonials.items.map((item, index) => ({ ...item, ...(translated.testimonials.items[index] ?? {}), imageUrl: item.imageUrl }));
  translated.social.youtubeSubscribers = content.social.youtubeSubscribers;
  translated.social.facebookFollowers = content.social.facebookFollowers;
  translated.social.instagramFollowers = content.social.instagramFollowers;
  return translated;
}

export function safeInstagramHref(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}

export function safeFacebookHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && ["facebook.com", "www.facebook.com", "m.facebook.com", "web.facebook.com", "fb.com", "www.fb.com"].includes(url.hostname) && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}

export function normalizeSocialCount(value: unknown): string {
  if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0 ? String(value) : "";
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value.trim())) return "";
  const count = Number(value.trim());
  return Number.isSafeInteger(count) ? String(count) : "";
}

export function safeYouTubeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname) && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}

export function safeTelephoneHref(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(digits)) return null;
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

export function safeWhatsAppHref(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
}
