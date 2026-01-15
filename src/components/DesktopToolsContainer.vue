<template>
    <div class="desktop-tools-container d-flex flex-column align-end">
        <ToolsWrapper
            v-for="tool in activeToolsArray"
            :key="tool.id"
            :id="tool.id"
            :width="tool.width"
            :max-height="tool.maxHeight"
            :icon="tool.icon"
            class="mt-1"
        >
            <template #card-text>
                <component :is="tool.component" v-bind="tool.props" />
            </template>
        </ToolsWrapper>
    </div>
</template>

<script lang="ts" setup>
import { useToolsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ToolsWrapper from './ui/ToolsWrapper.vue'

const toolsStore = useToolsStore()
const { activeToolsArray } = storeToRefs(toolsStore)
</script>

<style scoped>
.desktop-tools-container {
    position: absolute;
    top: 38px;
    margin: 5px;
    right: 0;
    width: auto;
    min-height: min-content;
    pointer-events: none;
}
</style>
