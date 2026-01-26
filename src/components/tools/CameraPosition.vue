<template>
    <v-textarea
        :value="formatAsJsObject(cameraPosition)"
        readonly
        auto-grow
        variant="outlined"
        color="primary"
        density="compact"
        hide-details
    >
        <template #prepend>
            <div class="d-flex flex-column align-center pa-2 ga-5">
                <v-icon
                    color="primary"
                    v-tooltip="{
                        text: $t('updateCameraPosition'),
                        location: 'left',
                    }"
                    style="cursor: pointer"
                    @click="updateCameraPosition"
                    >mdi-update</v-icon
                >
                <v-badge color="transparent">
                    <v-icon
                        color="primary"
                        v-tooltip="{
                            text: $t('copyJSONObject'),
                            location: 'left',
                        }"
                        style="cursor: pointer"
                        @click="copyCameraPositionToClipboard('json')"
                        >mdi-content-copy</v-icon
                    >
                    <template #badge>
                        <v-icon size="16" color="secondary">mdi-code-json</v-icon>
                    </template>
                </v-badge>
                <v-badge color="transparent">
                    <v-icon
                        color="primary"
                        v-tooltip="{
                            text: $t('copyJavaScriptObject'),
                            location: 'left',
                        }"
                        style="cursor: pointer"
                        @click="copyCameraPositionToClipboard('js')"
                        >mdi-content-copy</v-icon
                    >
                    <template #badge>
                        <v-icon size="16" color="#f7df1e">mdi-language-javascript</v-icon>
                    </template>
                </v-badge>
            </div>
        </template>
    </v-textarea>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { getCameraPositionAndOrientation } from '@/services/utils'
import { useNotifyStore } from '@/stores/notify'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const cameraPosition = ref({
    destination: {
        x: 0,
        y: 0,
        z: 0,
    },
    orientation: {
        heading: 0,
        pitch: 0,
        roll: 0,
    },
})

const formatAsJsObject = (obj: unknown, indent = 0): string => {
    if (typeof obj !== 'object' || obj === null) {
        return JSON.stringify(obj)
    }
    if (Array.isArray(obj)) {
        const arr = obj
            .map((v) => formatAsJsObject(v, indent + 2))
            .join(',\n' + ' '.repeat(indent + 2))
        return `[${arr}]`
    }
    const pad = ' '.repeat(indent)
    const pad2 = ' '.repeat(indent + 2)
    const entries = Object.entries(obj).map(
        ([k, v]) => `${pad2}${k}: ${formatAsJsObject(v, indent + 2)}`,
    )
    return `{\n${entries.join(',\n')}\n${pad}}`
}

const updateCameraPosition = () => {
    cameraPosition.value = {
        destination: {
            x: getCameraPositionAndOrientation().x,
            y: getCameraPositionAndOrientation().y,
            z: getCameraPositionAndOrientation().z,
        },
        orientation: {
            heading: getCameraPositionAndOrientation().heading,
            pitch: getCameraPositionAndOrientation().pitch,
            roll: getCameraPositionAndOrientation().roll,
        },
    }
}

const copyCameraPositionToClipboard = (format: 'json' | 'js') => {
    if (format === 'json') {
        const cameraPositionString = JSON.stringify(cameraPosition.value, null, 2)
        navigator.clipboard.writeText(cameraPositionString)

        useNotifyStore().showNotify({
            msg: t('cameraPositionCopied'),
            notifyType: 'success',
            notifyDuration: 2000,
            notifyIcon: 'mdi-check-decagram',
            notifyWidth: 300,
        })

        return
    }
    const cameraPositionString = formatAsJsObject(cameraPosition.value)
    navigator.clipboard.writeText(cameraPositionString)

    useNotifyStore().showNotify({
        msg: t('cameraPositionCopied'),
        notifyType: 'success',
        notifyDuration: 2000,
        notifyIcon: 'mdi-check-decagram',
        notifyWidth: 300,
    })
}

onMounted(() => {
    cameraPosition.value = {
        destination: {
            x: getCameraPositionAndOrientation().x,
            y: getCameraPositionAndOrientation().y,
            z: getCameraPositionAndOrientation().z,
        },
        orientation: {
            heading: getCameraPositionAndOrientation().heading,
            pitch: getCameraPositionAndOrientation().pitch,
            roll: getCameraPositionAndOrientation().roll,
        },
    }

    globeInstance.viewer.camera.changed.addEventListener(() => {
        cameraPosition.value = {
            destination: {
                x: getCameraPositionAndOrientation().x,
                y: getCameraPositionAndOrientation().y,
                z: getCameraPositionAndOrientation().z,
            },
            orientation: {
                heading: getCameraPositionAndOrientation().heading,
                pitch: getCameraPositionAndOrientation().pitch,
                roll: getCameraPositionAndOrientation().roll,
            },
        }
    })
})
</script>
