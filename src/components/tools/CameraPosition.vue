<template>
    <v-card-text class="pa-3 ma-0">
        <div>X: {{ cameraPosition.x.toFixed(2) }}m</div>
        <div>Y: {{ cameraPosition.y.toFixed(2) }}m</div>
        <div>Z: {{ cameraPosition.z.toFixed(2) }}m</div>
        <div>{{ $t('heading') }}: {{ cameraPosition.heading.toFixed(2) }}</div>
        <div>{{ $t('pitch') }}: {{ cameraPosition.pitch.toFixed(2) }}</div>
        <div>{{ $t('roll') }}: {{ cameraPosition.roll.toFixed(2) }}</div>
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { getCameraPositionAndOrientation } from '@/services/utils'
import { onMounted, ref } from 'vue'

const cameraPosition = ref({
    x: 0,
    y: 0,
    z: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
})

onMounted(() => {
    cameraPosition.value = getCameraPositionAndOrientation()

    globeInstance.viewer.camera.changed.addEventListener(() => {
        cameraPosition.value = getCameraPositionAndOrientation()
    })
})
</script>
