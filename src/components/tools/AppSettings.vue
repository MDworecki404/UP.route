<template>
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
            v-model="selectedMode"
            :items="modes"
            :item-title="(item) => $t(item)"
            :item-value="(item) => item"
            :label="$t('colorMode')"
            variant="outlined"
            color="primary"
            density="compact"
            prepend-inner-icon="mdi-theme-light-dark"
            @update:model-value="onChangeTheme"
        ></v-select>
        <v-select
            v-model="selectedPalette"
            :items="palettes"
            :item-title="(item) => $t(item)"
            :item-value="(item) => item"
            :label="$t('colorPalette')"
            variant="outlined"
            color="primary"
            density="compact"
            prepend-inner-icon="mdi-palette"
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
</template>

<script lang="ts" setup>
import i18n from '@/i18n'
import { saveItemInLocalStorage } from '@/services/utils'
import { useDialogStore } from '@/stores'
import { buildThemeName, parseThemeName, type ColorPalette } from '@/vuetify'
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import TextButton from '../ui/TextButton.vue'

const vuetifyTheme = useTheme()

const selectedMode = ref<'light' | 'dark'>('light')
const selectedPalette = ref<ColorPalette>('upwr')
const selectedLanguage = ref<'pl' | 'en'>('en')

const modes = ref<('light' | 'dark')[]>(['light', 'dark'])
const palettes = ref<ColorPalette[]>(['upwr', 'forest', 'ocean'])
const languages = ref<('pl' | 'en')[]>(['pl', 'en'])

const onChangeTheme = () => {
    const themeName = buildThemeName(selectedPalette.value, selectedMode.value === 'dark')
    vuetifyTheme.change(themeName)
    saveItemInLocalStorage('upRouteTheme', themeName)
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
    const current = parseThemeName(vuetifyTheme.name.value)
    selectedMode.value = current.dark ? 'dark' : 'light'
    selectedPalette.value = current.palette
    selectedLanguage.value = i18n.global.locale.value
})
</script>
