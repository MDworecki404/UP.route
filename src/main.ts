import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import 'vuetify/styles/main.css'
import App from './App.vue'
import i18n from './i18n'
import './main.css'
import router from './router'
import { vuetify } from './vuetify'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
