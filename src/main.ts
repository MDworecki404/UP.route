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
    burgundy: '#c7364e',
    burgundyDark: '#7a1f2f',
    amberAccent: '#FFC107',
    slateGrey: '#455A64',
}

const light = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: upwrBrandColors.burgundy,
        'on-primary': '#FFFFFF',
        secondary: upwrBrandColors.slateGrey,
        accent: upwrBrandColors.amberAccent,
        error: '#D32F2F',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
    },
}

const dark = {
    dark: true,
    colors: {
        background: '#121212',

        surface: '#111111',
        primary: upwrBrandColors.burgundy,
        'on-primary': '#FFFFFF',
        secondary: '#B0BEC5',
        accent: upwrBrandColors.amberAccent,
        error: '#EF5350',
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
