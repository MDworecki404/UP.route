import type { ToolsKeys, ToolsMap } from '@/services/tools'
import { defineStore } from 'pinia'
import { computed, markRaw, ref } from 'vue'
import { useDisplay } from 'vuetify'

export const useToolsStore = defineStore('tools', () => {
    const { mobile } = useDisplay()
    const activeTools = ref<Map<ToolsKeys | string, ToolsMap>>(new Map())
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
        customTitle,
    }: ToolsMap) => {
        let toolId: ToolsKeys | string = id

        if (id === 'rasterAdjustment') {
            toolId = 'rasterAdjustment-' + crypto.randomUUID()
        }

        if (id === 'pointCloudAdjustment') {
            toolId = 'pointCloudAdjustment-' + crypto.randomUUID()
        }

        if (mobile.value) {
            if (activeTools.value.has(toolId) && activeTools.value.get(toolId)?.isMinimized) {
                restoreTool(toolId)
                return
            }

            if (activeTools.value?.has(toolId)) {
                closeTool(toolId)
                return
            }
            activeToolsArray.value.forEach((tool) => {
                if (tool.id !== toolId) tool.isMinimized = true
            })
        } else {
            if (activeTools.value?.has(toolId)) {
                closeTool(toolId)
                return
            }
        }

        const toolData: ToolsMap = {
            id: toolId,
            component: markRaw(component),
            props,
            icon,
            isMinimized: false,
            maxHeight,
            width,
            fullscreen,
            customTitle,
        }

        activeTools.value?.set(toolId, toolData)
        activeToolsArray.value.unshift(toolData)
    }

    const closeTool = (id: ToolsKeys | string) => {
        activeTools.value?.delete(id)
        activeToolsArray.value = activeToolsArray.value.filter((tool) => tool.id !== id)
    }

    const minimizeTool = (id: ToolsKeys | string) => {
        const tool = activeTools.value?.get(id)
        if (tool) {
            if (tool.fullscreen) {
                tool.fullscreen = false
            }
            tool.isMinimized = true
        }
    }

    const isMinimizedTool = (id: ToolsKeys | string): boolean => {
        const tool = activeTools.value?.get(id)
        return tool?.isMinimized ?? false
    }

    const restoreTool = (id: ToolsKeys | string) => {
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

    const toggleFullscreen = (id: ToolsKeys | string) => {
        activeTools.value.forEach((tool) => {
            if (tool.id !== id) tool.fullscreen = false
        })

        const tool = activeTools.value?.get(id)
        if (tool) {
            if (tool.isMinimized) {
                tool.isMinimized = false
            }
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
