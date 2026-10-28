import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'
import { getLanguage, type Language } from './settings'

export const LANGUAGES: Language[] = ['en', 'zh-TW']

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, 'zh-TW': { translation: zhTW } },
  lng: getLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng
}
syncHtmlLang(i18n.language)
i18n.on('languageChanged', syncHtmlLang)

export default i18n
