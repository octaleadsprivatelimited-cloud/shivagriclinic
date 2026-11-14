import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { Language } from "@/data/channelContent";
import { LanguageContext } from "./LanguageContext";

const STORAGE_KEY = "shiva-channel-language";
function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "te" || stored === "hi" || stored === "en") return stored;
  } catch { /* Browser storage may be disabled. */ }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* The selection still works for this visit. */ }
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
