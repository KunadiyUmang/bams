import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import enTranslations from '@/i18n/en.json';
import guTranslations from '@/i18n/gu.json';

export type LanguageCode = 'en' | 'gu';
export type ThemeMode = 'light' | 'dark';

interface LanguageState {
  language: LanguageCode;
  theme: ThemeMode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (path: string, fallback?: string) => string;
}

const translations: Record<LanguageCode, any> = {
  en: enTranslations,
  gu: guTranslations,
};

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      theme: 'light',

      setLanguage: (language: LanguageCode) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.classList.remove('lang-en', 'lang-gu');
          document.documentElement.classList.add(`lang-${language}`);
        }
      },

      toggleLanguage: () => {
        const nextLang: LanguageCode = get().language === 'en' ? 'gu' : 'en';
        get().setLanguage(nextLang);
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },

      t: (path: string, fallback?: string): string => {
        const lang = get().language;
        const currentDict = translations[lang] || translations.en;
        const val = getNestedValue(currentDict, path);
        if (val) return val;

        const enVal = getNestedValue(translations.en, path);
        if (enVal) return enVal;

        return fallback || path;
      },
    }),
    {
      name: 'bams-owner-ui-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
