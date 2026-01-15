import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles/main.css'
import './main.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { getItemFromLocalStorage } from './services/utils'

const upwrBrandColors = {
    burgundy: '#c7364e', // Kolor główny pobrany z logo/pieczęci
    burgundyDark: '#7a1f2f', // Ciemniejsza wersja dla ciemnego motywu lub stanów hover
    amberAccent: '#FFC107', // Kolor uzupełniający (np. dla aktywnej trasy/lokalizacji)
    slateGrey: '#455A64', // Neutralny kolor dodatkowy
}

// Motyw Jasny (UPWr Light)
const light = {
    dark: false,
    colors: {
        background: '#FFFFFF', // Czysta biel tła
        surface: '#FFFFFF', // Białe karty/elementy
        primary: upwrBrandColors.burgundy, // Główny kolor marki
        'on-primary': '#FFFFFF', // Biały tekst na burgundowych przyciskach
        secondary: upwrBrandColors.slateGrey, // Kolor drugorzędny
        accent: upwrBrandColors.amberAccent, // Kolor akcentu (np. FAB, ważne powiadomienia)
        error: '#D32F2F',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
        // Opcjonalnie: delikatne tło dla aplikacji nawigacyjnej
        // background: '#F5F5F5',
    },
}

// Motyw Ciemny (UPWr Dark - inspirowany bluzą)
const dark = {
    dark: true,
    colors: {
        background: '#121212', // Standardowe ciemne tło Vuetify (dla lepszego kontrastu)
        // Alternatywnie, bardzo ciemny burgund jako tło:
        // background: '#1a0f12',

        surface: '#111111', // Nieco jaśniejsze karty
        // W ciemnym motywie czasem warto lekko rozjaśnić kolor główny, aby lepiej "świecił",
        // ale oryginał ma dobry kontrast, więc zostawiamy bazowy:
        primary: upwrBrandColors.burgundy,
        'on-primary': '#FFFFFF', // Biały tekst na burgundzie (jak na bluzie)
        secondary: '#B0BEC5', // Jaśniejszy szary dla kontrastu na ciemnym tle
        accent: upwrBrandColors.amberAccent, // Złoty akcent świetnie wygląda na ciemnym
        error: '#EF5350', // Nieco jaśniejsze kolory statusów dla ciemnego tła
        info: '#42A5F5',
        success: '#66BB6A',
        warning: '#FFA726',
    },
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: getItemFromLocalStorage<string>('upRouteTheme') || 'light',
        themes: {
            light: light,
            dark: dark,
        },
    },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
