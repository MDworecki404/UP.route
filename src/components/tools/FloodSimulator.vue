<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters class="ga-2">
            <TextButton
                class="w-100"
                :color="floodAnalysisMode === 'useWroclawArea' ? 'success' : 'primary'"
                :text="$t('useWroclawArea')"
                :prepend-icon="'mdi-city'"
                :disabled="floodAnalysisMode !== null"
                @click="selectMode('useWroclawArea')"
            />
            <TextButton
                class="w-100"
                :color="floodAnalysisMode === 'selectArea' ? 'success' : 'primary'"
                :text="$t('selectFloodArea')"
                :prepend-icon="'mdi-arrow-expand-all'"
                :disabled="floodAnalysisMode !== null"
                @click="selectMode('selectArea')"
            />
        </v-row>

        <v-expand-transition>
            <div v-if="floodAnalysisMode === 'selectArea' && !areaSelected">
                <v-row dense no-gutters>
                    <div class="my-3 w-100">
                        <v-divider>{{ $t('selectFloodAreaInstructions') }}</v-divider>
                    </div>
                </v-row>
                <v-row dense no-gutters>
                    <v-number-input
                        :label="$t('sideLength')"
                        variant="outlined"
                        :min="0"
                        :step="1"
                        :precision="0"
                        density="compact"
                        :disabled="inSelectionMode"
                        v-model="sideLength"
                    >
                    </v-number-input>
                </v-row>
                <v-row dense no-gutters justify="center">
                    <TextButton
                        :text="$t('selectByPoint')"
                        color="primary"
                        :prepend-icon="'mdi-cursor-default-click'"
                        @click="selectAreaByPoint"
                    />
                </v-row>
            </div>
        </v-expand-transition>

        <v-expand-transition>
            <div
                v-if="
                    floodAnalysisMode === 'useWroclawArea' ||
                    (floodAnalysisMode === 'selectArea' && areaSelected)
                "
            >
                <v-row dense no-gutters>
                    <div class="my-3 w-100">
                        <v-divider>{{ $t('settingsPanel') }}</v-divider>
                    </div>
                </v-row>

                <v-row dense no-gutters class="pb-3 ga-3" justify="center" align="center">
                    <ActionButton
                        :icon="'mdi-numeric-10-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus1meter'),
                        }"
                        @click="
                            () => {
                                floodHeight -= 1
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                    <ActionButton
                        :icon="'mdi-numeric-5-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus5meters'),
                        }"
                        @click="
                            () => {
                                floodHeight -= 5
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                    <ActionButton
                        :icon="'mdi-numeric-1-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus10meters'),
                        }"
                        @click="
                            () => {
                                floodHeight -= 1
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                    <span>- / +</span>
                    <ActionButton
                        :icon="'mdi-numeric-1-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus1meter'),
                        }"
                        @click="
                            () => {
                                floodHeight += 1
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                    <ActionButton
                        :icon="'mdi-numeric-5-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus5meters'),
                        }"
                        @click="
                            () => {
                                floodHeight += 5
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                    <ActionButton
                        :icon="'mdi-numeric-10-box'"
                        :size="34"
                        :icon-size="30"
                        elevation="0"
                        :tooltip="{
                            location: 'top',
                            text: $t('plus10meters'),
                        }"
                        @click="
                            () => {
                                floodHeight += 10
                                updateFloodHeight(floodHeight)
                            }
                        "
                    />
                </v-row>

                <v-row dense no-gutters class="px-5">
                    <span class="w-100 pb-3">{{ $t('floodHeight') }}:</span>
                    <v-slider
                        v-model="floodHeight"
                        @update:modelValue="updateFloodHeight"
                        color="primary"
                        thumb-size="12"
                        :step="0.01"
                        :min="100"
                        :max="200"
                        thumb-label
                    >
                    </v-slider>
                    <v-number-input
                        v-model="floodHeight"
                        density="compact"
                        @update:modelValue="updateFloodHeight"
                        class="number-input"
                        variant="outlined"
                        max-width="120"
                        :precision="2"
                        :step="0.01"
                        :min="100"
                        :max="200"
                        :control-variant="'stacked'"
                    ></v-number-input>
                </v-row>

                <v-row dense no-gutters>
                    <text-button
                        class="w-100"
                        color="primary"
                        :text="$t('cancel')"
                        :prepend-icon="'mdi-close-circle-outline'"
                        @click="cancelFloodAnalysis"
                    />
                </v-row>
            </div>
        </v-expand-transition>
    </v-card-text>
</template>

<script lang="ts" setup>
import type { FloodAnalysisMode } from '@/services/globe/floodSim'
import { globeInstance } from '@/services/globe/globe'
import { onUnmounted, ref } from 'vue'
import ActionButton from '../ui/ActionButton.vue'
import TextButton from '../ui/TextButton.vue'
import { floodAreaSelected } from '@/services/eventBus'

const floodAnalysisMode = ref<FloodAnalysisMode | null>(null)
const floodHeight = ref(200)
const sideLength = ref(200)
const areaSelected = ref(false)
const listenersRemovers: (() => void)[] = []
const inSelectionMode = ref(false)

const selectMode = (mode: FloodAnalysisMode) => {
    floodAnalysisMode.value = mode
    globeInstance.floodSim.selectFloodAnalysisMode(mode)
}

const selectAreaByPoint = () => {
    inSelectionMode.value = true
    globeInstance.floodSim.selectFloodAreaByClick(sideLength.value)

    listenersRemovers.push(
        floodAreaSelected.addEventListener((selected) => {
            areaSelected.value = selected
            if (selected) {
                inSelectionMode.value = false
            }
        }),
    )
}

const updateFloodHeight = (height: number) => {
    globeInstance.floodSim.setFloodHeight(height)
}

const cancelFloodAnalysis = () => {
    floodHeight.value = 200
    floodAnalysisMode.value = null
    areaSelected.value = false
    floodAreaSelected.raiseEvent(false)
    globeInstance.floodSim.cancelFloodAnalysis()
}

onUnmounted(() => {
    if (floodAnalysisMode.value) {
        cancelFloodAnalysis()
    }

    listenersRemovers.forEach((remove) => remove())
})
</script>

<style scoped>
:deep(.v-slider-thumb__label) {
    background-color: transparent !important;
    width: 100px;
    color: rgb(var(--v-theme-primary)) !important;
}

.clock-tooltip :deep(.v-overlay__content) {
    background-color: transparent !important;
}
</style>
