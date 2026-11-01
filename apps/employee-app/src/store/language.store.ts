import { create } from 'zustand';
import { Language } from '@/types';
import en from '@/i18n/en.json';
import gu from '@/i18n/gu.json';

const LANGUAGE_KEY = 'bams_employee_language';

const translations: Record<Language, any> = {
  en,
  gu,
};

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
  return saved === 'gu' ? 'gu' : 'en';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },

  toggleLanguage: () => {
    const current = get().language;
    const next: Language = current === 'en' ? 'gu' : 'en';
    get().setLanguage(next);
  },

  t: (key: string, params?: Record<string, string | number>): string => {
    const lang = get().language;
    const currentTranslations = translations[lang] || translations.en;

    const parts = key.split('.');
    let result: any = currentTranslations;

    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        // Fallback to English if not found in current language
        let fallback: any = translations.en;
        for (const fbPart of parts) {
          if (fallback && typeof fallback === 'object' && fbPart in fallback) {
            fallback = fallback[fbPart];
          } else {
            fallback = key;
            break;
          }
        }
        result = fallback;
        break;
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((str, [paramKey, val]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      }, result);
    }

    return result;
  },
}));
