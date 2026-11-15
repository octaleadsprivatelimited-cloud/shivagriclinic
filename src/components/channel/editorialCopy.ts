import type { Language } from "@/data/channelContent";

const copy = {
  en: {
    gallery: "Gallery",
    team: "Our team", teamEyebrow: "THE PEOPLE BEHIND THE CAMERA", teamIntro: "Meet the people who bring farming stories from the field to your screen.", teamEmpty: "Team profiles will appear here when they are added.",
    featuredIn: "Featured in", featuredEyebrow: "IN THE NEWS", featuredIntro: "A collection of news clippings and features about Shiva Agri Clinic.", featuredEmpty: "Press features will appear here when they are added.", viewFeature: "View feature", openClipping: "Open clipping", originalArticle: "Original article",
    blog: "Field notes", blogEyebrow: "FROM THE BLOG", blogIntro: "Stories and ideas from the Shiva Agri Clinic team.", blogEmpty: "Blog posts will appear here when they are published.", readArticle: "Read article", backToBlog: "Back to blog", postNotFound: "Article not found", postNotFoundText: "This article is unavailable or has not been published.",
    caseStudies: "Case studies", caseEyebrow: "REAL FIELD STORIES", caseIntro: "A closer look at the farming stories shared by our community.", caseEmpty: "Case studies will appear here when they are added.", challenge: "The challenge", solution: "The approach", results: "What happened", farmer: "Farmer", loading: "Loading…", unable: "Content could not be loaded. Please try again later.",
  },
  te: {
    gallery: "ఫోటో గ్యాలరీ",
    team: "మా బృందం", teamEyebrow: "కెమెరా వెనుక ఉన్నవారు", teamIntro: "పొలాల కథలను మీ ముందుకు తీసుకువచ్చే మా బృందాన్ని పరిచయం చేసుకోండి.", teamEmpty: "బృంద సభ్యుల వివరాలు జోడించిన తర్వాత ఇక్కడ కనిపిస్తాయి.",
    featuredIn: "వార్తల్లో మేము", featuredEyebrow: "వార్తా కథనాలు", featuredIntro: "శివ అగ్రి క్లినిక్ గురించి ప్రచురితమైన వార్తా కథనాలు, క్లిప్పింగుల సమాహారం.", featuredEmpty: "వార్తా కథనాలు జోడించిన తర్వాత ఇక్కడ కనిపిస్తాయి.", viewFeature: "కథనం చూడండి", openClipping: "క్లిప్పింగ్ తెరవండి", originalArticle: "అసలు కథనం",
    blog: "క్షేత్ర విశేషాలు", blogEyebrow: "బ్లాగ్ నుండి", blogIntro: "శివ అగ్రి క్లినిక్ బృందం నుంచి కథలు, ఆలోచనలు.", blogEmpty: "ప్రచురితమైన బ్లాగ్ కథనాలు ఇక్కడ కనిపిస్తాయి.", readArticle: "కథనం చదవండి", backToBlog: "బ్లాగ్‌కు తిరిగి", postNotFound: "కథనం కనిపించలేదు", postNotFoundText: "ఈ కథనం అందుబాటులో లేదు లేదా ఇంకా ప్రచురించబడలేదు.",
    caseStudies: "రైతుల కథనాలు", caseEyebrow: "నిజమైన క్షేత్ర కథలు", caseIntro: "మన రైతు సమాజం పంచుకున్న సాగు కథలను మరింత దగ్గరగా తెలుసుకోండి.", caseEmpty: "కేస్ స్టడీలు జోడించిన తర్వాత ఇక్కడ కనిపిస్తాయి.", challenge: "సవాలు", solution: "అనుసరించిన విధానం", results: "ఫలితాలు", farmer: "రైతు", loading: "లోడ్ అవుతోంది…", unable: "వివరాలు లోడ్ కాలేదు. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
  },
  hi: {
    gallery: "फोटो गैलरी",
    team: "हमारी टीम", teamEyebrow: "कैमरे के पीछे के लोग", teamIntro: "मिलिए उन लोगों से जो खेतों की कहानियाँ आप तक पहुँचाते हैं।", teamEmpty: "टीम के सदस्यों की जानकारी जुड़ने पर यहाँ दिखाई देगी।",
    featuredIn: "खबरों में", featuredEyebrow: "समाचारों में", featuredIntro: "शिवा एग्री क्लिनिक के बारे में प्रकाशित खबरों और कतरनों का संग्रह।", featuredEmpty: "खबरें जुड़ने पर यहाँ दिखाई देंगी।", viewFeature: "खबर देखें", openClipping: "कतरन खोलें", originalArticle: "मूल लेख",
    blog: "खेत की बातें", blogEyebrow: "ब्लॉग से", blogIntro: "शिवा एग्री क्लिनिक टीम की कहानियाँ और विचार।", blogEmpty: "प्रकाशित ब्लॉग लेख यहाँ दिखाई देंगे।", readArticle: "लेख पढ़ें", backToBlog: "ब्लॉग पर लौटें", postNotFound: "लेख नहीं मिला", postNotFoundText: "यह लेख उपलब्ध नहीं है या अभी प्रकाशित नहीं हुआ है।",
    caseStudies: "किसानों की कहानियाँ", caseEyebrow: "खेतों की सच्ची कहानियाँ", caseIntro: "हमारे किसान समुदाय की खेती की कहानियों को करीब से जानें।", caseEmpty: "केस स्टडी जुड़ने पर यहाँ दिखाई देंगी।", challenge: "चुनौती", solution: "अपनाया गया तरीका", results: "नतीजे", farmer: "किसान", loading: "लोड हो रहा है…", unable: "जानकारी लोड नहीं हो सकी। कृपया बाद में फिर प्रयास करें।",
  },
} as const;

export function editorialText(language: Language) { return copy[language] ?? copy.en; }

export function safeEditorialLink(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
