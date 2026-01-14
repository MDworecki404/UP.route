<template>
    <v-card-text>
        <v-row dense no-gutters class="d-flex ga-5 flex-wrap" justify="start" align="center">
            <v-checkbox
                v-model="skyAtmosphere"
                :label="$t('skyAtmosphere')"
                hide-details
                color="primary"
            ></v-checkbox>
            <v-select
                v-model="terrainShadows"
                :label="$t('terrainShadows')"
                variant="outlined"
                density="compact"
                :max-width="200"
                hide-details
                :items="['DISABLED', 'ENABLED', 'CAST_ONLY', 'RECEIVE_ONLY']"
            ></v-select>
        </v-row>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
        <TextButton color="success" :text="$t('save')" :prepend-icon="'mdi-content-save-outline'" />
    </v-card-actions>
</template>

<script lang="ts" setup>
import { getDefaultViewerSettings } from '@/services/defaults'
import { ShadowMode } from '@cesium/engine'
import { SkyAtmosphere } from '@cesium/engine'
import { onMounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const skyAtmosphere = ref(false)
const terrainShadows = ref('DISABLED')

onMounted(() => {
    const viewerSettings = getDefaultViewerSettings()

    if (viewerSettings.skyAtmosphere instanceof SkyAtmosphere) {
        skyAtmosphere.value = true
    } else {
        skyAtmosphere.value = false
    }

    if (viewerSettings.terrainShadows === undefined) {
        terrainShadows.value = 'DISABLED'
    } else if (viewerSettings.terrainShadows === ShadowMode.ENABLED) {
        terrainShadows.value = 'ENABLED'
    } else if (viewerSettings.terrainShadows === ShadowMode.CAST_ONLY) {
        terrainShadows.value = 'CAST_ONLY'
    } else if (viewerSettings.terrainShadows === ShadowMode.RECEIVE_ONLY) {
        terrainShadows.value = 'RECEIVE_ONLY'
    }
})
</script>
