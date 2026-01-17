import type { Component } from 'vue'

type Tool = Component

export const TOOLS_KEYS = [
    'cameraPosition',
    'appSettings',
    'layersTree',
    'shadowsSettings',
] as const

export type ToolsKeys = (typeof TOOLS_KEYS)[number]

export interface ToolsDictionary {
    [key: string]: Tool
}

export type ToolsMap = {
    id: ToolsKeys
    component: Tool
    props?: Record<string, unknown>
    width?: number
    maxHeight?: number
    isMinimized?: boolean
    fullscreen?: boolean
    icon?: string
}

export const Tools: Record<ToolsKeys, Tool> = {
    cameraPosition: (await import('@/components/tools/CameraPosition.vue')).default,
    appSettings: (await import('@/components/tools/AppSettings.vue')).default,
    layersTree: (await import('@/components/ui/LayersTree.vue')).default,
    shadowsSettings: (await import('@/components/tools/ShadowsSettings.vue')).default,
}

export const getTool = async (toolId: ToolsKeys): Promise<Tool | null> => {
    const toolImport = Tools[toolId]
    if (toolImport) {
        return toolImport
    }
    return null
}
