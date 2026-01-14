import type { ToolsMap } from '@/services/tools'
import { defineStore } from 'pinia'
import { ref, markRaw } from 'vue'

export const useToolsStore = defineStore('tools', () => {
    const activeTools = ref<Map<string, ToolsMap>>(new Map())
    const activeToolsArray = ref<ToolsMap[]>([])

    const openTool = ({ id, component, props, icon, isMinimized, maxHeight, width }: ToolsMap) => {
        if (activeTools.value?.has(id)) {
            closeTool(id)
            return
        }

        activeTools.value?.set(id, {
            id,
            component: markRaw(component),
            props,
            icon,
            isMinimized,
            maxHeight,
            width,
        })
        activeToolsArray.value = Array.from(activeTools.value.values())
    }

    const closeTool = (id: string) => {
        activeTools.value?.delete(id)
        activeToolsArray.value = Array.from(activeTools.value.values())
    }

    const minimizeTool = (id: string) => {
        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = true
        }
        activeToolsArray.value = Array.from(activeTools.value.values())
    }

    const restoreTool = (id: string) => {
        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = false
        }
        activeToolsArray.value = Array.from(activeTools.value.values())
    }

    return {
        activeTools,
        activeToolsArray,
        openTool,
        closeTool,
        minimizeTool,
        restoreTool,
    }
})
