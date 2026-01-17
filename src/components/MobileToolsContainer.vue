<template>
    <div
        class="mobile-tools-container d-flex flex-column align-end"
        :class="{ fullscreen: mobileActiveTool?.fullscreen && !mobileActiveTool?.isMinimized }"
    >
        <ToolsWrapper
            v-if="mobileActiveTool"
            :id="mobileActiveTool?.id"
            :style="
                mobileActiveTool?.fullscreen
                    ? { width: '100dvw', maxHeight: '100dvh' }
                    : { width: '100dvw' }
            "
            :icon="mobileActiveTool?.icon"
            :fullscreen="mobileActiveTool?.fullscreen"
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
.mobile-tools-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100dvw;
    pointer-events: auto;
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
