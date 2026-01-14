<template>
    <div ref="cesiumContainer" id="cesiumContainer"></div>
    <UserInterface />
</template>

<script setup lang="ts">
import { initGlobeInstance } from '@/services/globe/globe'
import { onMounted, useTemplateRef } from 'vue'
import UserInterface from './UserInterface.vue'

const cesiumContainer = useTemplateRef('cesiumContainer')

onMounted(() => {
    initGlobeInstance(cesiumContainer.value!)
})
</script>

<style scoped>
#cesiumContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
}
</style>
