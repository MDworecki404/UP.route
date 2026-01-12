<template>
    <div ref="cesiumContainer" id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { initGlobeInstance } from '@/services/globe/globe'
import { onMounted, useTemplateRef } from 'vue'

const cesiumContainer = useTemplateRef('cesiumContainer')

onMounted(() => {
    initGlobeInstance(cesiumContainer.value!)
})
</script>

<style scoped>
#cesiumContainer {
    width: 100dvw;
    height: 100dvh;
}
</style>
