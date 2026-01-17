<template>
    <v-card
        :width="width ?? 300"
        elevation="2"
        class="pa-0 ma-0"
        rounded="0"
        style="z-index: 100"
        :class="{
            'tools-wrapper-card-mobile': mobile,
            'tools-wrapper-fullscreen': mobile && fullscreen && !isMinimizedTool(id),
        }"
    >
        <v-card-title class="pa-0 ma-0">
            <ToolToolbar
                :icon="icon"
                :title="id"
                :close-custom-func="() => closeTool(id)"
                :minimize-custom-func="
                    isMinimizedTool(id) ? () => restoreTool(id) : () => minimizeTool(id)
                "
                :fullscreen="fullscreen"
                :set-fullscreen-custom-func="toggleFullScreenMobileTool"
                :minimized="isMinimizedTool(id)"
                :show-minimize="true"
            ></ToolToolbar>
        </v-card-title>
        <v-card-text
            v-show="!isMinimizedTool(id)"
            class="ma-0 pa-2 overflow-y-auto"
            :class="{ 'tools-wrapper-content-mobile': mobile }"
            :style="`max-height: ${maxHeight ?? '400px'}`"
        >
            <slot name="card-text" />
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import type { ToolsMap } from '@/services/tools'
import { useToolsStore } from '@/stores'
import { useDisplay } from 'vuetify'
import ToolToolbar from './ToolToolbar.vue'

defineProps<{
    width?: ToolsMap['width']
    maxHeight?: ToolsMap['maxHeight']
    id: ToolsMap['id']
    icon?: ToolsMap['icon']
    fullscreen?: ToolsMap['fullscreen']
}>()

const { closeTool, minimizeTool, isMinimizedTool, restoreTool, toggleFullScreenMobileTool } =
    useToolsStore()
const { mobile } = useDisplay()
</script>

<style scoped>
.tools-wrapper-card-mobile {
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.tools-wrapper-fullscreen {
    max-height: 100dvh !important;
    height: 100dvh;
}

.tools-wrapper-content-mobile {
    flex: 1 1 auto;
    overflow-y: auto;
}
</style>
