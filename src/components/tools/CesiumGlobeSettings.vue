<template>
    <v-card-text>
        <v-row dense no-gutters class="d-flex ga-5 flex-wrap" justify="start" align="center">
            <v-checkbox
                v-model="skyAtmosphere"
                :label="$t('skyAtmosphere')"
                hide-details
                color="primary"
                @update:model-value="onSkyAtmosphereChange($event!)"
            ></v-checkbox>
            <v-select
                v-model="terrainShadows"
                :label="$t('terrainShadows')"
                variant="outlined"
                color="primary"
                density="compact"
                :max-width="200"
                hide-details
                :items="['DISABLED', 'ENABLED', 'CAST_ONLY', 'RECEIVE_ONLY']"
                :item-title="(item) => $t(item)"
                :item-value="(item) => item"
                @update:model-value="onTerrainShadowsChange($event!)"
            ></v-select>
            <v-slider
                v-model="resolutionScale"
                :label="$t('resolutionScale')"
                min="0.1"
                max="2.0"
                step="0.1"
                color="primary"
                :hide-details="true"
                :min-width="300"
                :max-width="200"
                @update:model-value="onResolutionScaleChange($event!)"
            >
                <template #append>
                    <span>{{ resolutionScale.toFixed(1) }}</span>
                </template>
            </v-slider>
        </v-row>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
        <TextButton color="success" :text="$t('save')" :prepend-icon="'mdi-content-save-outline'" />
    </v-card-actions>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { ShadowMode, SkyAtmosphere } from '@cesium/engine'
import { onMounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const skyAtmosphere = ref(false)
const terrainShadows = ref('DISABLED')
const resolutionScale = ref(1.0)

const onSkyAtmosphereChange = (value: boolean) => {
    if (value) {
        globeInstance.viewer.scene.skyAtmosphere = new SkyAtmosphere()
    } else {
        globeInstance.viewer.scene.skyAtmosphere = undefined
    }
}

const onTerrainShadowsChange = (value: string) => {
    if (value === 'DISABLED') {
        globeInstance.viewer.terrainShadows = ShadowMode.DISABLED
    } else if (value === 'ENABLED') {
        globeInstance.viewer.terrainShadows = ShadowMode.ENABLED
    } else if (value === 'CAST_ONLY') {
        globeInstance.viewer.terrainShadows = ShadowMode.CAST_ONLY
    } else if (value === 'RECEIVE_ONLY') {
        globeInstance.viewer.terrainShadows = ShadowMode.RECEIVE_ONLY
    }
}

const onResolutionScaleChange = (value: number) => {
    globeInstance.viewer.resolutionScale = value
}

onMounted(() => {
    if (globeInstance.viewer.scene.skyAtmosphere) {
        skyAtmosphere.value = true
    } else {
        skyAtmosphere.value = false
    }

    if (globeInstance.viewer.terrainShadows === undefined) {
        terrainShadows.value = 'DISABLED'
    } else if (globeInstance.viewer.terrainShadows === ShadowMode.ENABLED) {
        terrainShadows.value = 'ENABLED'
    } else if (globeInstance.viewer.terrainShadows === ShadowMode.CAST_ONLY) {
        terrainShadows.value = 'CAST_ONLY'
    } else if (globeInstance.viewer.terrainShadows === ShadowMode.RECEIVE_ONLY) {
        terrainShadows.value = 'RECEIVE_ONLY'
    }

    resolutionScale.value = globeInstance.viewer.resolutionScale
})
</script>
