<template>
    <div class="desktop-tools-container">
        <ToolsWrapper
            v-for="tool in activeToolsArray"
            :key="tool.id"
            :id="tool.id"
            :width="tool.width"
            :max-height="tool.maxHeight"
            :icon="tool.icon"
        >
            <template #default>
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
    min-height: 300px;
    pointer-events: none;
}
</style>
