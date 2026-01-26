<template>
    <v-bottom-navigation class="mobile-bottom-navigation">
        <div class="wrapper">
            <ActionButton
                v-for="tool in toolsArray"
                :key="tool.id"
                :icon="tool.icon!"
                :icon-color="tool.isMinimized ? 'grey' : 'primary'"
                :tooltip="{
                    location: 'top',
                    text: $t(tool.id),
                }"
                @click="
                    () => {
                        tool.isMinimized ? restoreTool(tool.id) : minimizeTool(tool.id)
                    }
                "
            />
        </div>
    </v-bottom-navigation>
</template>

<script setup lang="ts">
import type { ToolsMap } from '@/services/tools'
import { useToolsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import ActionButton from './ActionButton.vue'

const toolsStore = useToolsStore()

const toolsArray = ref<ToolsMap[]>([])

const { activeToolsArray } = storeToRefs(toolsStore)
const { restoreTool, minimizeTool } = toolsStore

watch(
    () => activeToolsArray.value,
    (newActiveTools) => {
        const activeIds = new Set(newActiveTools.map((t) => t.id))

        const keptTools = toolsArray.value.filter((tool) => activeIds.has(tool.id))

        const currentLocalIds = new Set(keptTools.map((t) => t.id))
        const toolsToAdd = newActiveTools.filter((tool) => !currentLocalIds.has(tool.id))

        toolsArray.value = [...keptTools, ...toolsToAdd]
    },
    { deep: true },
)

onMounted(() => {
    toolsArray.value = [...activeToolsArray.value]
})
</script>

<style scoped>
.mobile-bottom-navigation .wrapper {
    width: 85dvw;
    overflow-x: scroll;
    display: flex;
    justify-content: center;
    height: 100%;
    align-items: center;
}
</style>
