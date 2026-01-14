<template>
    <v-bottom-navigation :height="32" class="d-flex flex-row align-center">
        <v-spacer />
        <div class="d-flex flex-column align-center pr-2">
            <v-breadcrumbs
                :items="cameraPositionBreadcrumbs"
                divider="|"
                color="primary"
                density="compact"
                class="font-weight-bold"
                :disabled="false"
            ></v-breadcrumbs>
        </div>
    </v-bottom-navigation>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import { getCameraCartographicPosition } from '@/services/utils'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { BreadcrumbItem } from 'vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs'

const listenersRemovers: (() => void)[] = []

const cameraPosition = ref({
    lat: 0,
    lng: 0,
    height: 0,
})

const cameraPositionBreadcrumbs = computed((): BreadcrumbItem[] => {
    return [
        {
            title: `φ: ${cameraPosition.value.lat.toFixed(4)}°`,
            disabled: false,
        },
        {
            title: `λ: ${cameraPosition.value.lng.toFixed(4)}°`,
            disabled: false,
        },
        {
            title: `h: ${cameraPosition.value.height.toFixed(2)} m`,
            disabled: false,
        },
    ]
})

onMounted(() => {
    cameraPosition.value = getCameraCartographicPosition()

    const listener = globeInstance.viewer.camera.changed.addEventListener(() => {
        cameraPosition.value = getCameraCartographicPosition()
    })
    listenersRemovers.push(listener)
})

onUnmounted(() => {
    listenersRemovers.forEach((removeListener) => removeListener())
})
</script>
