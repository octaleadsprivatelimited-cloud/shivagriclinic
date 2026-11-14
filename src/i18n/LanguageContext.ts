import { createContext, useContext } from "react";
import type { Language } from "@/data/channelContent";

export const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void } | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within LanguageProvider");
  return value;
}
