<template>
    <v-card-text>
        <v-row dense no-gutters>
            <span @click="registerSecretTap">{{ $t('version') }}: 1.2</span>
        </v-row>
        <v-row dense no-gutters>
            <span>{{ $t('dateOfRelease') }}: 01.03.2026</span>
        </v-row>

        <v-divider class="my-2"></v-divider>
        <span>{{ $t('appInfoContent') }}</span>
        <v-divider class="my-2"></v-divider>
        <v-row dense no-gutters>
            <span class="font-weight-medium">{{ $t('developer') }}:</span>
            <span class="ml-1">Marek Dworecki</span>
        </v-row>
        <v-divider class="my-2"></v-divider>
        <v-row dense no-gutters class="my-2">
            <span>{{ $t('tools') }}:</span>
        </v-row>
        <span class="d-flex align-center justify-space-between ga-2">
            <a target="_blank" href="https://github.com/MDworecki404/Master-Thesis-Geoportal">
                <v-icon
                    v-tooltip="{
                        text: $t('githubRepoLink'),
                        location: 'bottom',
                    }"
                    size="48"
                    >mdi-github</v-icon
                >
            </a>
            <v-img
                style="cursor: pointer"
                :src="TypescriptImg"
                :max-width="50"
                v-tooltip="{
                    text: 'TypeScript',
                    location: 'bottom',
                }"
                @click="openLink('https://www.typescriptlang.org/')"
            ></v-img>
            <v-img
                style="cursor: pointer"
                :src="VueImg"
                :max-width="50"
                v-tooltip="{
                    text: 'Vue.js',
                    location: 'bottom',
                }"
                @click="openLink('https://vuejs.org/')"
            ></v-img>
            <v-img
                style="cursor: pointer"
                :src="VuetifyImg"
                :max-width="50"
                v-tooltip="{
                    text: 'Vuetify',
                    location: 'bottom',
                }"
                @click="openLink('https://vuetifyjs.com/en/')"
            ></v-img>
            <v-img
                style="cursor: pointer"
                :src="CesiumImg"
                :max-width="50"
                v-tooltip="{
                    text: 'Cesium',
                    location: 'bottom',
                }"
                @click="openLink('https://cesium.com/platform/cesiumjs/')"
            ></v-img>
        </span>
    </v-card-text>
</template>

<script lang="ts" setup>
import { isDesktopEasterEggAvailable, setupSecretListener } from '@/services/utils'
import { onMounted, onUnmounted } from 'vue'
import CesiumImg from '../../assets/Cesium_logo.png'
import TypescriptImg from '../../assets/Typescript.png'
import VueImg from '../../assets/vue-logo.png'
import VuetifyImg from '../../assets/vuetify-logo-dark-atom.svg'

const versionTapThreshold = 5
const versionTapWindowTime = 1800

let armSecretListener: (() => void) | undefined
let cleanupSecretListener: (() => void) | undefined
let versionTapCount = 0
let versionTapTimeoutId: number | undefined

const openLink = (link: string) => {
    window.open(link, '_blank')
}

const resetSecretTapState = () => {
    versionTapCount = 0

    if (versionTapTimeoutId) {
        clearTimeout(versionTapTimeoutId)
        versionTapTimeoutId = undefined
    }
}

const registerSecretTap = () => {
    if (!isDesktopEasterEggAvailable()) {
        return
    }

    versionTapCount += 1

    if (versionTapTimeoutId) {
        clearTimeout(versionTapTimeoutId)
    }

    versionTapTimeoutId = window.setTimeout(() => {
        resetSecretTapState()
    }, versionTapWindowTime)

    if (versionTapCount < versionTapThreshold) {
        return
    }

    resetSecretTapState()
    armSecretListener?.()
}

onMounted(() => {
    const secretListenerControls = setupSecretListener()
    armSecretListener = secretListenerControls.arm
    cleanupSecretListener = secretListenerControls.cleanup
})

onUnmounted(() => {
    resetSecretTapState()
    cleanupSecretListener?.()
})
</script>

<style scoped>
a {
    color: inherit;
    text-decoration: none;
}
</style>
