import type { Component } from 'vue'

type Tool = Component

export interface ToolsDictionary {
    [key: string]: Tool
}

export const Tools: ToolsDictionary = {
    settings: (await import('../components/tools/SettingsTool.vue')).default,
}

export type ToolsKeys = keyof typeof Tools

export const getTool = async (toolId: ToolsKeys): Promise<Tool | null> => {
    const toolImport = Tools[toolId]
    if (toolImport) {
        const toolModule = toolImport
        return toolModule
    }
    return null
}
