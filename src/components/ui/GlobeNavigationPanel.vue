<template>
    <div
        :class="[
            mobile ? 'mobile-globe-navigation-panel' : 'globe-navigation-panel',
            'd-flex',
            'flex-column',
            'align-center',
            'pa-2',
            'rounded',
        ]"
    >
        <v-btn
            icon
            size="26"
            @click="setNorthUp"
            rounded="0"
            v-tooltip="{
                text: $t('setNorthUp'),
                location: 'left',
            }"
            color="primary"
            variant="outlined"
            class="bg-background"
        >
            <v-icon color="primary" :size="18" :style="{ rotate: cameraHeading + 'rad' }"
                >mdi-navigation</v-icon
            >
        </v-btn>
        <v-slider
            v-model="cameraPitch"
            :direction="'vertical'"
            :glow="true"
            :hide-details="true"
            color="primary"
            v-tooltip="{
                text: $t('cameraPitch'),
                location: 'left',
            }"
            :min="-1.51"
            :max="1.51"
            :step="0.01"
            @update:model-value="changeCameraPitch"
        >
        </v-slider>
        <ActionButtonsList
            v-if="buttonsList?.navigationButtons"
            :buttons-list="buttonsList?.navigationButtons"
            :orientation="'vertical'"
            :button-variant="'outlined'"
            :button-custom-class="'bg-background'"
            :button-color="'primary'"
        />
    </div>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import { fetchJsonFile } from '@/services/utils'
import type { UiType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import ActionButtonsList from './ActionButtonsList.vue'

const buttonsList = ref<UiType>()

const { mobile } = useDisplay()

const cameraPitch = ref(0)
const cameraHeading = ref(0)

const changeCameraPitch = (value: number) => {
    globeInstance.viewer.camera.setView({
        orientation: {
            pitch: value,
        },
    })
}

globeInstance.viewer.camera.changed.addEventListener(() => {
    cameraPitch.value = globeInstance.viewer.camera.pitch
    cameraHeading.value = globeInstance.viewer.camera.heading
})

const setNorthUp = () => {
    globeInstance.setCameraNorthUp()
    cameraHeading.value = 0
}

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig

    cameraPitch.value = globeInstance.viewer.camera.pitch
})
</script>

<style scoped>
.globe-navigation-panel {
    position: absolute;
    bottom: 50px;
    right: 12px;
    z-index: 5;
}

.mobile-globe-navigation-panel {
    position: absolute;
    top: 50px;
    right: 12px;
    z-index: 5;
}

.globe-navigation-panel,
.mobile-globe-navigation-panel {
    pointer-events: none;
}

.globe-navigation-panel,
.mobile-globe-navigation-panel > * {
    pointer-events: auto;
}

:deep(.v-slider-thumb__surface) {
    border-radius: 4px;
    width: 24px;
    height: 8px;
}

:deep(.v-slider-thumb--focused) {
    border-radius: 4px;
    width: 24px;
    height: 8px;
    background-color: transparent !important;
}

:deep(.v-slider-thumb--pressed) {
    border-radius: 4px;
    width: 24px;
    height: 8px;
}

:deep(.v-slider-thumb__ripple) {
    display: none;
}

:deep(.v-slider-thumb__surface::before) {
    width: 26px;
    height: 10px;
    border-radius: 5px;
}

:deep(.v-slider-thumb) {
    box-shadow: none !important;
}
</style>
