<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters class="ga-2">
            <v-number-input
                v-model="options.pointSize"
                density="compact"
                max-width="180"
                :step="1"
                :min="1"
                :label="$t('pointSize')"
                :control-variant="'stacked'"
                :prepend-inner-icon="'mdi-vector-point-edit'"
                @update:model-value="updatePointCloudProps"
            ></v-number-input>
        </v-row>
        <v-row dense no-gutters class="ga-2">
            <v-switch
                v-model="options.pointCloudShading!.attenuation"
                density="compact"
                :label="$t('pointCloudAttenuation')"
                @update:model-value="updatePointCloudProps"
            ></v-switch>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import type { Cesium3DTilesLayer } from '@/services/globe/layersManager'
import type { PointCloudLayerAdjustmentOptions } from '@/types/layers'
import { onMounted, ref } from 'vue'

const { layerId } = defineProps<{
    layerId: string
}>()

const layer = ref<Cesium3DTilesLayer>()

const options = ref<PointCloudLayerAdjustmentOptions>({
    pointSize: 1,
    maximumScreenSpaceError: undefined,
    pointCloudShading: {
        attenuation: false,
        geometricErrorScale: 1,
        baseResolution: 1,
        eyeDomeLighting: false,
        eyeDomeLightingStrength: 1,
        eyeDomeLightingRadius: 1,
    },
})

const updatePointCloudProps = () => {
    if (layer.value) {
        layer.value.setPointCloudLayerProperties(options.value)
    }
}

onMounted(() => {
    const pointCloudLayer = globeInstance.layers.layers.get(layerId)
    if (pointCloudLayer) {
        console.log('Point cloud layer config:', pointCloudLayer.config)
    } else {
        console.warn('Layer with ID', layerId, 'not found')
    }

    layer.value = pointCloudLayer as Cesium3DTilesLayer
    options.value.pointSize = layer.value.config.tilesProps?.pointSize ?? 1
    options.value.maximumScreenSpaceError =
        layer.value.config.tilesProps?.maximumScreenSpaceError ?? undefined
    options.value.pointCloudShading =
        layer.value.config.tilesProps?.pointCloudShading ?? options.value.pointCloudShading
})
</script>
