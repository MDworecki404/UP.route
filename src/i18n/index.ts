import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pl from './locales/pl.json'
import { getItemFromLocalStorage } from '@/services/utils'

export type SupportedLocales = 'en' | 'pl'

const SUPPORTED_LOCALES: SupportedLocales[] = ['en', 'pl']

const getBrowserLocale = (): SupportedLocales | null => {
    if (typeof navigator === 'undefined') return null

    const browserLang = navigator.language || (navigator.languages && navigator.languages[0])

    if (!browserLang) return null

    const localeCode = browserLang.split('-')[0] as SupportedLocales

    if (SUPPORTED_LOCALES.includes(localeCode)) {
        return localeCode
    }

    return null
}

const startingLocale =
    getItemFromLocalStorage<SupportedLocales>('upRouteLanguage') || getBrowserLocale() || 'en'

const i18n = createI18n({
    legacy: false,
    locale: startingLocale,
    fallbackLocale: 'en',
    messages: {
        pl,
        en,
    },
    missingWarn: false,
    warnHtmlInMessage: 'off',
    fallbackWarn: false,
})

export default i18n
