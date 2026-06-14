import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import kk from './locales/kk.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      kk: { translation: kk },
      ru: { translation: ru },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'qg_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
