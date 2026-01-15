<template>
    <div class="desktop-tools-container d-flex flex-column align-end">
        <ToolsWrapper
            v-if="mobileActiveTool"
            :id="mobileActiveTool?.id"
            :max-height="mobileActiveTool.maxHeight"
            style="width: 100dvw; max-height: 40dvh"
            :icon="mobileActiveTool?.icon"
        >
            <template #card-text>
                <component :is="mobileActiveTool?.component" v-bind="mobileActiveTool?.props" />
            </template>
        </ToolsWrapper>
    </div>
</template>

<script lang="ts" setup>
import { useToolsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ToolsWrapper from './ui/ToolsWrapper.vue'

const toolsStore = useToolsStore()
const { mobileActiveTool } = storeToRefs(toolsStore)
</script>

<style scoped>
.desktop-tools-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100dvw;
    pointer-events: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
}

.desktop-tools-container > * {
    pointer-events: all;
}
</style>
