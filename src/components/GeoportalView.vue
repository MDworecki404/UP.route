<template>
    <div ref="cesiumContainer" id="cesiumContainer"></div>
    <UserInterface v-if="loaded" />
</template>

<script setup lang="ts">
import { initGlobeInstance } from '@/services/globe/globe'
import { onMounted, ref, useTemplateRef } from 'vue'
import UserInterface from './UserInterface.vue'
import { appLoaded } from '@/services/eventBus'

const cesiumContainer = useTemplateRef('cesiumContainer')
const loaded = ref(false)
onMounted(() => {
    initGlobeInstance(cesiumContainer.value!)
    const listener = appLoaded.addEventListener(() => {
        loaded.value = true
        listener()
    })
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
