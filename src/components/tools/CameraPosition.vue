<template>
    <v-row dense no-gutters>
        <v-switch
            v-model="isTextArea"
            :label="$t('showAsTextArea')"
            class="ma-0 pa-0"
            hide-details
            color="primary"
        ></v-switch>
    </v-row>
    <v-textarea
        v-if="isTextArea"
        :value="JSON.stringify(cameraPosition, null, 2)"
        readonly
        auto-grow
        variant="outlined"
        color="primary"
        density="compact"
        hide-details
    >
        <template #prepend>
            <div class="d-flex flex-column align-center pa-2 ga-5">
                <v-icon style="cursor: pointer" @click="updateCameraPosition">mdi-update</v-icon>
                <v-icon style="cursor: pointer" @click="copyCameraPositionToClipboard"
                    >mdi-content-copy</v-icon
                >
            </div>
        </template>
    </v-textarea>
    <div v-if="!isTextArea">
        <div>X: {{ cameraPosition.destination.x.toFixed(2) }}m</div>
        <div>Y: {{ cameraPosition.destination.y.toFixed(2) }}m</div>
        <div>Z: {{ cameraPosition.destination.z.toFixed(2) }}m</div>
        <div>{{ $t('heading') }}: {{ cameraPosition.orientation.heading.toFixed(2) }}</div>
        <div>{{ $t('pitch') }}: {{ cameraPosition.orientation.pitch.toFixed(2) }}</div>
        <div>{{ $t('roll') }}: {{ cameraPosition.orientation.roll.toFixed(2) }}</div>
    </div>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { getCameraPositionAndOrientation } from '@/services/utils'
import { onMounted, ref } from 'vue'

const isTextArea = ref(false)

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

const copyCameraPositionToClipboard = () => {
    const cameraPositionString = JSON.stringify(cameraPosition.value, null, 2)
    navigator.clipboard.writeText(cameraPositionString)
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
