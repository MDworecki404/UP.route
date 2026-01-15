<template>
    <div
        v-if="isOverlayActive"
        class="overlay-loading d-flex flex-column justify-center align-center bg-background"
    >
        <div style="width: 50%" class="d-flex justify-center flex-column align-center">
            <v-row dense no-gutters class="py-5">
                <v-img :src="imgPath" :width="mobile ? 200 : 400" />
                <v-img :src="appLogo" :width="mobile ? 100 : 200" />
            </v-row>
            <v-row dense no-gutters class="py-5">
                {{ $t('loadingApplication') }}
            </v-row>
            <v-progress-linear color="primary" indeterminate></v-progress-linear>
        </div>
    </div>
</template>

<script setup lang="ts">
import { appLoaded } from '@/services/eventBus'
import { useCommonStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useTheme } from 'vuetify'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const appLogo = new URL('/appLogo.png', import.meta.url).href
const imgPath = useTheme().current.value.dark
    ? new URL('@/assets/UPWR_polish_logo_dark.png', import.meta.url).href
    : new URL('@/assets/UPWR_polish_logo.png', import.meta.url).href

const commonStore = useCommonStore()
const { isOverlayActive } = storeToRefs(commonStore)
const { turnOffOverlay } = commonStore

const removeAppLoadedListener = appLoaded.addEventListener((isTrue: boolean) => {
    if (isTrue) {
        turnOffOverlay()
        removeAppLoadedListener()
    }
})
</script>

<style scoped>
.overlay-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    z-index: 99999;
}
</style>
