import type { Component } from 'vue'

type Tool = Component

export const TOOLS_KEYS = ['settings'] as const

export type ToolsKeys = (typeof TOOLS_KEYS)[number]

export interface ToolsDictionary {
    [key: string]: Tool
}

export const Tools: Record<ToolsKeys, Tool> = {
    settings: (await import('../components/tools/SettingsTool.vue')).default,
}

export const getTool = async (toolId: ToolsKeys): Promise<Tool | null> => {
    const toolImport = Tools[toolId]
    if (toolImport) {
        return toolImport
    }
    return null
}
