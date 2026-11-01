import { create } from 'zustand';
import { Language } from '@/types';
import en from '@/i18n/en.json';
import gu from '@/i18n/gu.json';

type Translations = typeof en;

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
}

const LANGUAGE_KEY = 'bams_admin_language';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return Language.EN;
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === Language.GU ? Language.GU : Language.EN;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),
  translations: getInitialLanguage() === Language.GU ? (gu as unknown as Translations) : en,

  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lang);
      document.documentElement.lang = lang === Language.GU ? 'gu' : 'en';
    }
    set({
      language: lang,
      translations: lang === Language.GU ? (gu as unknown as Translations) : en,
    });
  },

  toggleLanguage: () => {
    const current = get().language;
    const next = current === Language.EN ? Language.GU : Language.EN;
    get().setLanguage(next);
  },

  t: (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: unknown = get().translations;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return fallback || path;
      }
    }

    if (typeof current === 'string') {
      return current;
    }
    return fallback || path;
  },
}));
