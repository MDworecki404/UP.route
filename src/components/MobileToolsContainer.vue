<template>
    <div
        class="mobile-tools-container d-flex flex-column align-end"
        :class="{ fullscreen: currentTool?.fullscreen && !currentTool?.isMinimized }"
    >
        <ToolsWrapper
            v-if="currentTool && !currentTool.isMinimized"
            :id="currentTool?.id"
            :style="
                currentTool?.fullscreen
                    ? { width: '100dvw', maxHeight: '100dvh' }
                    : { width: '100dvw' }
            "
            :icon="currentTool?.icon"
            :fullscreen="currentTool?.fullscreen"
        >
            <template #card-text>
                <component :is="currentTool?.component" v-bind="currentTool?.props" />
            </template>
        </ToolsWrapper>
    </div>
</template>

<script lang="ts" setup>
import { useToolsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ToolsWrapper from './ui/ToolsWrapper.vue'

const toolsStore = useToolsStore()
const { currentTool } = storeToRefs(toolsStore)
</script>

<style scoped>
.mobile-tools-container {
    position: absolute;
    bottom: 55px;
    left: 0;
    width: 100dvw;
    pointer-events: auto;
    max-height: 45vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
}

.mobile-tools-container.fullscreen {
    top: 0;
    height: 100dvh;
    max-height: 100dvh;
}

.desktop-tools-container > * {
    pointer-events: all;
}
</style>
