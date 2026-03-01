<template>
    <v-card-text>
        <v-row dense no-gutters class="d-flex flex-column">
            <span class="text-subtitle-2">{{ $t('globeSettingsDescription') }}</span>
            <v-divider class="my-2" />
        </v-row>
        <v-row dense no-gutters class="d-flex ga-5 flex-wrap" justify="start" align="center">
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

            <v-select
                v-model="selectedShader"
                :items="items"
                variant="outlined"
                density="compact"
                hide-details
                :item-title="(item) => $t(item)"
                :item-value="(item) => item"
                :label="$t('postProcessingShader')"
                @update:model-value="onSelectedShaderChange($event)"
            ></v-select>

            <v-checkbox
                v-model="skyAtmosphere"
                hide-details
                color="primary"
                :label="$t('skyAtmosphere')"
                @update:model-value="onSkyAtmosphereChange($event!)"
            ></v-checkbox>
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
import { globeInstance, type DefinedShader } from '@/services/globe/globe'
import { saveItemInLocalStorage } from '@/services/utils'
import { useNotifyStore } from '@/stores/notify'
import type { userGlobeSettings } from '@/types/utils'
import { ShadowMode } from '@cesium/engine'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TextButton from '../ui/TextButton.vue'

const { t } = useI18n()

const notifyStore = useNotifyStore()

const saveLoading = ref(false)

const skyAtmosphere = ref(false)
const terrainShadows = ref<keyof typeof ShadowMode>('DISABLED')
const resolutionScale = ref(1.0)
const selectedShader = ref<DefinedShader>('none')

const items: DefinedShader[] = [
    'none',
    'blackAndWhite',
    'nightVision',
    'bloom',
    'depthOfField',
    'ambientOcclusion',
]

const onResolutionScaleChange = (value: number) => {
    globeInstance.viewer.resolutionScale = value
}

const onSelectedShaderChange = (value: DefinedShader) => {
    globeInstance.setDefinedShaders(value)
}

const onSkyAtmosphereChange = (value: boolean) => {
    if (value) {
        globeInstance.enableEnvironment()
    } else {
        globeInstance.disableEnvironment()
    }
}

const onGlobeSettingsSave = () => {
    saveLoading.value = true

    const config: userGlobeSettings = {
        resolutionScale: resolutionScale.value,
        selectedShader: selectedShader.value,
        skyAtmosphere: skyAtmosphere.value,
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

    selectedShader.value = globeInstance.definedShader

    skyAtmosphere.value = globeInstance.environmentEnabled
})
</script>
