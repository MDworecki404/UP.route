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
    </v-card-text>
</template>

<script setup lang="ts">
import type { SketchMethod } from '@/services/globe/sketch'
import { ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const activeMethod = ref<SketchMethod | null>(null)

const setSketchMethod = (method: SketchMethod) => {
    activeMethod.value = method
}

const cancelSketchMethod = () => {
    activeMethod.value = null
}

const finishSketchMethod = () => {
    activeMethod.value = null
}
</script>
