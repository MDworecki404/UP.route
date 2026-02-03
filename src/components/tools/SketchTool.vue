<template>
    <v-card-text class="pa-1 ma-0">
        <div class="mt-0 mb-3">
            <v-divider>{{ $t('sketchMethods') }}</v-divider>
        </div>
        <div class="d-flex ga-2 flex-wrap">
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-vector-point'"
                :text="$t('point')"
                :disabled="activeMethod !== 'point' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('point')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-vector-polyline'"
                :text="$t('polyline')"
                :disabled="activeMethod !== 'polyline' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('polyline')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-square-outline'"
                :text="$t('rectangle')"
                :disabled="activeMethod !== 'rectangle' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('rectangle')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-circle-outline'"
                :text="$t('circle')"
                :disabled="activeMethod !== 'circle' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('circle')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-vector-polygon-variant'"
                :text="$t('polygon')"
                :disabled="activeMethod !== 'polygon' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('polygon')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-wall'"
                :text="$t('wall')"
                :disabled="activeMethod !== 'wall' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('wall')"
            />
            <TextButton
                class="flex-grow-1"
                :prepend-icon="'mdi-vector-ellipse'"
                :text="$t('ellipse')"
                :disabled="activeMethod !== 'ellipse' && activeMethod !== null"
                color="primary"
                @click="setSketchMethod('ellipse')"
            />
        </div>

        <v-expand-transition>
            <div v-if="activeMethod">
                <div class="my-3">
                    <v-divider>{{ $t('actions') }}</v-divider>
                </div>
                <div class="d-flex ga-2 flex-wrap">
                    <TextButton
                        class="flex-grow-1"
                        :prepend-icon="'mdi-cancel'"
                        :text="$t('cancel')"
                        color="primary"
                        @click="cancelSketchMethod"
                    />
                    <TextButton
                        class="flex-grow-1"
                        :prepend-icon="'mdi-check-bold'"
                        :text="$t('finish')"
                        color="primary"
                        @click="finishSketchMethod"
                    />
                </div>
            </div>
        </v-expand-transition>

        <div class="my-3">
            <v-divider>{{ $t('styles') }}</v-divider>
        </div>

        <div class="my-3">
            <v-divider>{{ $t('layerManagement') }}</v-divider>
        </div>

        <v-row dense no-gutters justify="center">
            <v-btn
                icon="mdi-trash-can"
                color="primary"
                variant="text"
                rounded="0"
                v-tooltip="{
                    text: $t('resetDrawLayer'),
                    location: 'bottom',
                }"
                @click="clearDrawLayer"
            ></v-btn>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import { globeInstance } from '@/services/globe/globe'
import type { DrawType } from '@/services/globe/draw'

const activeMethod = ref<DrawType | null>(null)

const setSketchMethod = (method: DrawType) => {
    activeMethod.value = method

    globeInstance.draw.setDrawMode(method)
}

const cancelSketchMethod = () => {
    activeMethod.value = null

    globeInstance.draw.cancelDrawing()
}

const clearDrawLayer = () => {
    globeInstance.draw.clearDrawLayer()
}

const finishSketchMethod = () => {
    activeMethod.value = null

    globeInstance.draw.finishDrawing()
}

onUnmounted(() => {
    globeInstance.draw.cancelDrawing()
})
</script>
