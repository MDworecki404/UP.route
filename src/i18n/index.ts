import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pl from './locales/pl.json'
import { getItemFromLocalStorage } from '@/services/utils'

export type SupportedLocales = 'en' | 'pl'

const i18n = createI18n({
    legacy: false,
    locale: getItemFromLocalStorage<SupportedLocales>('upRouteLanguage') || 'pl',
    fallbackLocale: 'en',
    messages: {
        pl,
        en,
    },
})

export default i18n
