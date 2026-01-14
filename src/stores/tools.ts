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
        activeToolsArray.value.unshift(activeTools.value.get(id)!)
    }

    const closeTool = (id: string) => {
        activeTools.value?.delete(id)
        activeToolsArray.value = activeToolsArray.value.filter((tool) => tool.id !== id)
    }

    const minimizeTool = (id: string) => {
        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = true
        }
    }

    const restoreTool = (id: string) => {
        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = false
        }
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
