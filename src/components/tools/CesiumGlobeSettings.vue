<template>
    <v-card-text>
        <v-row dense no-gutters class="d-flex flex-column">
            <span class="text-subtitle-2">{{ $t('globeSettingsDescription') }}</span>
            <v-divider class="my-2" />
        </v-row>
        <v-row dense no-gutters class="d-flex ga-5 flex-wrap" justify="start" align="center">
            <v-checkbox
                v-model="skyAtmosphere"
                :label="$t('skyAtmosphere')"
                hide-details
                v-tooltip="{
                    text: $t('skyAtmosphereTooltip'),
                    location: 'top',
                }"
                color="primary"
                @update:model-value="onSkyAtmosphereChange($event!)"
            ></v-checkbox>
            <v-select
                v-model="terrainShadows"
                :label="$t('terrainShadows')"
                variant="outlined"
                color="primary"
                density="compact"
                v-tooltip="{
                    text: $t('terrainShadowsTooltip'),
                    location: 'top',
                }"
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
                v-tooltip="{
                    text: $t('resolutionScaleTooltip'),
                    location: 'bottom',
                }"
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
    <v-card-actions class="d-flex justify-space-between">
        <TextButton
            :loading="saveLoading"
            color="error"
            :text="$t('removeGlobeSettings')"
            :prepend-icon="'mdi-trash-can-outline'"
            @click="removeUserGlobeSettings"
        />
        <TextButton
            :loading="saveLoading"
            color="success"
            :text="$t('save')"
            :prepend-icon="'mdi-content-save-outline'"
            @click="onGlobeSettingsSave"
        />
    </v-card-actions>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { ShadowMode, SkyAtmosphere } from '@cesium/engine'
import { onMounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import { saveItemInLocalStorage } from '@/services/utils'
import type { userGlobeSettings } from '@/types/utils'
import { useNotifyStore } from '@/stores/notify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const notifyStore = useNotifyStore()

const saveLoading = ref(false)

const skyAtmosphere = ref(false)
const terrainShadows = ref<keyof typeof ShadowMode>('DISABLED')
const resolutionScale = ref(1.0)

const onSkyAtmosphereChange = (value: boolean) => {
    if (value) {
        globeInstance.viewer.scene.skyAtmosphere = new SkyAtmosphere()
    } else {
        globeInstance.viewer.scene.skyAtmosphere = undefined
    }
}

const onTerrainShadowsChange = (value: keyof typeof ShadowMode) => {
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

const onGlobeSettingsSave = () => {
    saveLoading.value = true

    const config: userGlobeSettings = {
        skyAtmosphere: skyAtmosphere.value,
        terrainShadows: terrainShadows.value as keyof typeof ShadowMode,
        resolutionScale: resolutionScale.value,
    }

    saveItemInLocalStorage('userGlobeSettings', config)

    saveLoading.value = false

    notifyStore.showNotify({
        msg: t('globeSettingsSaved'),
        notifyType: 'success',
        notifyIcon: 'mdi-check-circle-outline',
        notifyDuration: 2000,
        notifyWidth: 250,
    })
}

const removeUserGlobeSettings = () => {
    localStorage.removeItem('userGlobeSettings')

    notifyStore.showNotify({
        msg: t('globeSettingsRemoved'),
        notifyType: 'info',
        notifyIcon: 'mdi-trash-can-outline',
        notifyDuration: 2000,
        notifyWidth: 250,
    })
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
