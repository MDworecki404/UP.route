import type { ToolsMap } from '@/services/tools'
import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import { useDisplay } from 'vuetify'

export const useToolsStore = defineStore('tools', () => {
    const { mobile } = useDisplay()
    const activeTools = ref<Map<string, ToolsMap>>(new Map())
    const mobileActiveTool = ref<ToolsMap | null>(null)
    const activeToolsArray = ref<ToolsMap[]>([])

    const openTool = ({ id, component, props, icon, isMinimized, maxHeight, width }: ToolsMap) => {
        if (mobile.value) {
            if (mobileActiveTool.value?.id === id) {
                mobileActiveTool.value = null
                return
            }

            mobileActiveTool.value = {
                id,
                component: markRaw(component),
                props,
                icon,
                isMinimized,
                maxHeight,
                width,
            }
            return
        }

        if (activeTools.value?.has(id)) {
            closeTool(id)
            return
        }

        const toolData: ToolsMap = {
            id,
            component: markRaw(component),
            props,
            icon,
            isMinimized,
            maxHeight,
            width,
        }

        activeTools.value?.set(id, toolData)
        activeToolsArray.value.unshift(toolData)
    }

    const closeTool = (id: string) => {
        activeTools.value?.delete(id)
        activeToolsArray.value = activeToolsArray.value.filter((tool) => tool.id !== id)

        if (mobile.value && mobileActiveTool.value?.id === id) {
            mobileActiveTool.value = null
        }
    }

    const minimizeTool = (id: string) => {
        if (mobile.value) {
            if (mobileActiveTool.value) {
                mobileActiveTool.value.isMinimized = true
            }
            return
        }

        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = true
        }
    }

    const isMinimizedTool = (id: string): boolean => {
        if (mobile.value) {
            return mobileActiveTool.value?.isMinimized ?? false
        } else {
            const tool = activeTools.value?.get(id)
            return tool?.isMinimized ?? false
        }
    }

    const restoreTool = (id: string) => {
        if (mobile.value) {
            if (mobileActiveTool.value) {
                mobileActiveTool.value.isMinimized = false
            }
            return
        }

        const tool = activeTools.value?.get(id)
        if (tool) {
            tool.isMinimized = false
        }
    }

    return {
        activeTools,
        activeToolsArray,
        mobileActiveTool,
        openTool,
        closeTool,
        minimizeTool,
        restoreTool,
        isMinimizedTool,
    }
})
