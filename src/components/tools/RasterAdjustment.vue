<template>
    <v-card-text class="pa-1 ma-0">
        <v-row v-for="(value, key) in adjustmentOptions" :key="key" dense no-gutters>
            <v-slider
                v-model="adjustmentOptions[key]"
                class="px-3"
                color="primary"
                :label="$t(key)"
                :min="minValues[key] ?? 0"
                :max="maxValues[key] ?? 3"
                :step="0.1"
                density="compact"
                @update:model-value="applySettings"
            >
                <template #prepend>
                    <v-icon :icon="icons[key] ?? 'mdi-tune'"></v-icon>
                </template>

                <template #append>
                    <span>{{ adjustmentOptions[key]!.toFixed(1) }}</span>
                </template>
            </v-slider>
        </v-row>
        <v-row dense no-gutters justify="end">
            <TextButton
                :text="$t('restoreDefault')"
                :prepend-icon="'mdi-restore'"
                color="primary"
                @click="restoreDefault"
            />
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import type { LayersClassTypes } from '@/services/globe/layersManager'
import type { RasterLayerAdjustmentOptions } from '@/types/layers'
import { onMounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const { layerId } = defineProps<{
    layerId: string
}>()

const layer = ref<LayersClassTypes>()
const adjustmentOptions = ref<RasterLayerAdjustmentOptions>({
    brightness: 1,
    contrast: 1,
    hue: 0,
    saturation: 1,
    gamma: 1,
    alpha: 1,
})

const minValues: Record<string, number> = {
    brightness: 0,
    contrast: 0,
    hue: -1,
    saturation: 0,
    gamma: 0.1,
    alpha: 0,
}

const maxValues: Record<string, number> = {
    brightness: 2,
    contrast: 2,
    hue: 1,
    saturation: 2,
    gamma: 3,
    alpha: 1,
}

const applySettings = () => {
    if (layer.value && 'setImageryAdjustment' in layer.value) {
        layer.value.setImageryAdjustment(adjustmentOptions.value)
    }
}

const icons: Record<string, string> = {
    brightness: 'mdi-white-balance-sunny',
    contrast: 'mdi-contrast',
    hue: 'mdi-format-color-highlight',
    saturation: 'mdi-tune-variant',
    gamma: 'mdi-gamma',
    alpha: 'mdi-opacity',
}

onMounted(() => {
    const imageryLayer = globeInstance.layers.layers.get(layerId)
    if (!imageryLayer) {
        console.error(`Layer with id ${layerId} not found`)
        return
    } else if (imageryLayer.classType !== 'OSMLayer' && imageryLayer.classType !== 'xyz') {
        console.error(`Layer with id ${layerId} is not a raster layer`)
        return
    }

    layer.value = imageryLayer

    adjustmentOptions.value = {
        brightness: imageryLayer._layer?.brightness ?? 1,
        contrast: imageryLayer._layer?.contrast ?? 1,
        hue: imageryLayer._layer?.hue ?? 0,
        saturation: imageryLayer._layer?.saturation ?? 1,
        gamma: imageryLayer._layer?.gamma ?? 1,
        alpha: imageryLayer._layer?.alpha ?? 1,
    }
})

const restoreDefault = () => {
    adjustmentOptions.value = {
        brightness: 1,
        contrast: 1,
        hue: 0,
        saturation: 1,
        gamma: 1,
        alpha: 1,
    }
    applySettings()
}
</script>
