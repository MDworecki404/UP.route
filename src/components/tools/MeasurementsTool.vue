<template>
    <v-card-text>
        <v-row dense no-gutters justify="center">
            <v-btn-toggle
                v-model="activeDrawTool"
                divided
                :disabled="measureActivated"
                mandatory
                variant="outlined"
                color="primary"
                base-color="primary"
                elevation="3"
                class="d-flex w-100"
            >
                <v-btn
                    value="distance"
                    class="flex-grow-1"
                    icon="mdi-ruler"
                    v-tooltip="{
                        text: $t('measureDistance'),
                        location: 'bottom',
                    }"
                ></v-btn>
                <v-btn
                    value="area"
                    class="flex-grow-1"
                    icon="mdi-vector-polygon-variant"
                    v-tooltip="{
                        text: $t('measureArea'),
                        location: 'bottom',
                    }"
                ></v-btn>
                <v-btn
                    value="height"
                    class="flex-grow-1"
                    icon="mdi-human-male-height-variant"
                    v-tooltip="{
                        text: $t('measureHeight'),
                        location: 'bottom',
                    }"
                ></v-btn>
            </v-btn-toggle>
        </v-row>
        <v-expand-transition>
            <v-row v-if="measureActivated" dense no-gutters justify="center" class="mt-4 ga-3">
                <v-divider class="my-2"></v-divider>
                <text-button
                    :text="$t('resetMeasure')"
                    color="primary"
                    :prepend-icon="'mdi-window-close'"
                    elevation="2"
                    @click="globeInstance.measurements.resetActiveMeasurement()"
                />
                <text-button
                    :text="$t('endMeasure')"
                    color="primary"
                    :prepend-icon="'mdi-check-bold'"
                    elevation="2"
                    @click="globeInstance.measurements.finishActiveMeasurement()"
                />
                <v-divider class="my-2"></v-divider>
            </v-row>
        </v-expand-transition>
        <v-row dense no-gutters justify="center" class="mt-4">
            <text-button
                v-if="!measureActivated"
                :text="$t('startMeasure')"
                color="primary"
                :prepend-icon="'mdi-draw'"
                elevation="2"
                @click="startMeasure"
            />
            <text-button
                v-if="measureActivated"
                :text="$t('stopMeasure')"
                color="error"
                :prepend-icon="'mdi-close-thick'"
                elevation="2"
                @click="stopMeasure"
            />
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import { globeInstance } from '@/services/globe/globe'

const activeDrawTool = ref<'distance' | 'area' | 'height'>('distance')
const measureActivated = ref(false)

const startMeasure = () => {
    measureActivated.value = true

    globeInstance.measurements?.setMeasureMode(activeDrawTool.value)
}

const stopMeasure = () => {
    globeInstance.measurements?.stopMeasurementMode()
    measureActivated.value = false
}

onUnmounted(() => {
    if (measureActivated.value) {
        globeInstance.measurements?.finishActiveMeasurement()
    }

    globeInstance.measurements?.clearMeasurementLayer()
})
</script>
