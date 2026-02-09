import type { ToolsMap } from '@/services/tools'
import { defineStore } from 'pinia'
import { computed, markRaw, ref } from 'vue'
import { useDisplay } from 'vuetify'

export const useToolsStore = defineStore('tools', () => {
    const { mobile } = useDisplay()
    const activeTools = ref<Map<string, ToolsMap>>(new Map())
    const activeToolsArray = ref<ToolsMap[]>([])

    const currentTool = computed<ToolsMap | null>(() => {
        if (mobile.value) {
            return activeToolsArray.value.length > 0 && activeToolsArray.value[0] !== undefined
                ? activeToolsArray.value[0]
                : null
        }
        return null
    })

    const openTool = ({
        id,
        component,
        props,
        icon,
        maxHeight,
        width,
        fullscreen = false,
    }: ToolsMap) => {
        if (mobile.value) {
            if (activeTools.value?.has(id)) {
                closeTool(id)
                return
            }
            activeToolsArray.value.forEach((tool) => {
                if (tool.id !== id) tool.isMinimized = true
            })
        } else {
            if (activeTools.value?.has(id)) {
                closeTool(id)
                return
            }
        }

        const toolData: ToolsMap = {
            id,
            component: markRaw(component),
            props,
            icon,
            isMinimized: false,
            maxHeight,
            width,
            fullscreen,
        }

        activeTools.value?.set(id, toolData)
        activeToolsArray.value.unshift(toolData)
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

    const isMinimizedTool = (id: string): boolean => {
        const tool = activeTools.value?.get(id)
        return tool?.isMinimized ?? false
    }

    const restoreTool = (id: string) => {
        if (mobile.value) {
            activeToolsArray.value.forEach((tool) => {
                if (tool.id !== id) tool.isMinimized = true
            })
            const idx = activeToolsArray.value.findIndex((tool) => tool.id === id)
            if (idx > 0) {
                const [toolObj] = activeToolsArray.value.splice(idx, 1)
                activeToolsArray.value.unshift(toolObj!)
            }
        }

        const tool = activeTools.value?.get(id)

        if (tool) {
            tool.isMinimized = false
        }
    }

    const toggleFullscreen = (id: string) => {
        activeTools.value.forEach((tool) => {
            if (tool.id !== id) tool.fullscreen = false
        })

        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.fullscreen = !tool.fullscreen
        }
    }

    return {
        activeTools,
        activeToolsArray,
        currentTool,
        openTool,
        closeTool,
        minimizeTool,
        restoreTool,
        isMinimizedTool,
        toggleFullscreen,
    }
})
