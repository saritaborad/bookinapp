import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// English language files
import about_en from "./translations/en/about.json";
import book_en from "./translations/en/book.json";
import common_en from "./translations/en/common.json";
import details_en from "./translations/en/details.json";
import home_en from "./translations/en/home.json";
import privacyPolicy_en from "./translations/en/privacyPolicy.json";
import search_en from "./translations/en/search.json";
import services_en from "./translations/en/services.json";
import tags_en from "./translations/en/tags.json";
import subjects_en from "./translations/en/subjects.json";
// Russian language files
import about_ru from "./translations/ru/about.json";
import book_ru from "./translations/ru/book.json";
import common_ru from "./translations/ru/common.json";
import details_ru from "./translations/ru/details.json";
import home_ru from "./translations/ru/home.json";
import privacyPolicy_ru from "./translations/ru/privacyPolicy.json";
import search_ru from "./translations/ru/search.json";
import services_ru from "./translations/ru/services.json";
import tags_ru from "./translations/ru/tags.json";
import subjects_ru from "./translations/ru/subjects.json";
// Frech language files
import about_fr from "./translations/fr/about.json";
import book_fr from "./translations/fr/book.json";
import common_fr from "./translations/fr/common.json";
import details_fr from "./translations/fr/details.json";
import home_fr from "./translations/fr/home.json";
import privacyPolicy_fr from "./translations/fr/privacyPolicy.json";
import search_fr from "./translations/fr/search.json";
import services_fr from "./translations/fr/services.json";
import tags_fr from "./translations/fr/tags.json";
import subjects_fr from "./translations/fr/subjects.json";
// Arabic language files
import about_ar from "./translations/ar/about.json";
import book_ar from "./translations/ar/book.json";
import common_ar from "./translations/ar/common.json";
import details_ar from "./translations/ar/details.json";
import home_ar from "./translations/ar/home.json";
import privacyPolicy_ar from "./translations/ar/privacyPolicy.json";
import search_ar from "./translations/ar/search.json";
import services_ar from "./translations/ar/services.json";
import tags_ar from "./translations/ar/tags.json";
import subjects_ar from "./translations/ar/subjects.json";

i18n.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: window.IS_UAE ? "en" : "ru",
  fallbackLng: "en",
  resources: {
    en: {
      privacyPolicy: privacyPolicy_en,
      common: common_en,
      home: home_en,
      search: search_en,
      details: details_en,
      book: book_en,
      services: services_en,
      about: about_en,
      tags: tags_en,
      subjects: subjects_en,
    },
    ru: {
      privacyPolicy: privacyPolicy_ru,
      common: common_ru,
      home: home_ru,
      search: search_ru,
      details: details_ru,
      book: book_ru,
      services: services_ru,
      about: about_ru,
      tags: tags_ru,
      subjects: subjects_ru,
    },
    fr: {
      privacyPolicy: privacyPolicy_fr,
      common: common_fr,
      home: home_fr,
      search: search_fr,
      details: details_fr,
      book: book_fr,
      services: services_fr,
      about: about_fr,
      tags: tags_fr,
      subjects: subjects_fr,
    },
    ar: {
      privacyPolicy: privacyPolicy_ar,
      common: common_ar,
      home: home_ar,
      search: search_ar,
      details: details_ar,
      book: book_ar,
      services: services_ar,
      about: about_ar,
      tags: tags_ar,
      subjects: subjects_ar,
    }
  }
});

export default i18n;
