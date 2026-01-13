import { computed, unref, type MaybeRef } from 'vue'
import { useI18n } from 'vue-i18n'

export interface LocalizedString {
    [key: string]: string
}

// 1. Tworzymy typ unii: może to być obiekt ALBO zwykły string
type TranslatableContent = LocalizedString | string | null | undefined

export function useDynamicTranslation() {
    const { locale, fallbackLocale } = useI18n()

    const translate = (content: MaybeRef<TranslatableContent>, defaultLang = 'en') => {
        return computed(() => {
            const data = unref(content)

            // Obsługa braku danych
            if (!data) return ''

            // 2. NOWOŚĆ: Jeśli to zwykły string, zwracamy go bez zmian
            if (typeof data === 'string') {
                return data
            }

            // Tutaj kod jest bez zmian (obsługa obiektu)
            const currentLang = locale.value
            const fallback = (unref(fallbackLocale) as string) || defaultLang

            if (data[currentLang]) return data[currentLang]
            if (data[fallback]) return data[fallback]

            const keys = Object.keys(data)
            return keys.length > 0 ? data[keys[0]!] : ''
        })
    }

    return { translate }
}
