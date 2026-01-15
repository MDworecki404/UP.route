<template>
    <v-card-text class="ma-0 pa-2">
        <v-row dense no-gutters class="ga-5">
            <v-select
                v-model="selectedLanguage"
                :items="languages"
                :item-title="(item) => $t(item)"
                :item-value="(item) => item"
                variant="outlined"
                color="primary"
                density="compact"
                prepend-inner-icon="mdi-translate"
                @update:model-value="onChangeLanguage"
            ></v-select>
            <v-select
                v-model="selectedTheme"
                :items="themes"
                :item-title="(item) => $t(item)"
                :item-value="(item) => item"
                variant="outlined"
                color="primary"
                density="compact"
                prepend-inner-icon="mdi-theme-light-dark"
                @update:model-value="onChangeTheme"
            ></v-select>
        </v-row>
        <v-row dense no-gutters justify="end">
            <TextButton
                :prepend-icon="'mdi-earth'"
                :text="$t('globeSettings')"
                :color="'primary'"
                @click="openCesiumSettingsDialog"
            ></TextButton>
        </v-row>
    </v-card-text>
</template>

<script lang="ts" setup>
import i18n from '@/i18n'
import { saveItemInLocalStorage } from '@/services/utils'
import { useDialogStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import TextButton from '../ui/TextButton.vue'

const vuetifyTheme = useTheme()

const selectedTheme = ref<string>('light')
const selectedLanguage = ref<'pl' | 'en'>('en')

const themes = ref<string[]>(['light', 'dark'])
const languages = ref<('pl' | 'en')[]>(['pl', 'en'])

const onChangeTheme = (theme: string) => {
    vuetifyTheme.change(theme)
    saveItemInLocalStorage('upRouteTheme', theme)
}

const onChangeLanguage = (language: 'pl' | 'en') => {
    i18n.global.locale.value = language
    saveItemInLocalStorage('upRouteLanguage', language)
}

const openCesiumSettingsDialog = async () => {
    const CesiumGlobeSettings = (await import('@/components/tools/CesiumGlobeSettings.vue')).default

    useDialogStore().openDialog({
        icon: 'mdi-earth',
        component: CesiumGlobeSettings,
        width: 600,
        title: 'globeSettings',
    })
}

onMounted(() => {
    selectedTheme.value = useTheme().current.value.dark ? 'dark' : 'light'
    selectedLanguage.value = i18n.global.locale.value
})
</script>
