import type { Component } from 'vue'

export const CUSTOM_TOOLS_IDS = ['upwrBuildingInfoPopUp'] as const

export type ToolsKeys = (typeof CUSTOM_TOOLS_IDS)[number]

export const CustomTools: Record<ToolsKeys, Component> = {
    upwrBuildingInfoPopUp: (await import('@/components/customs/UpwrBuildingPopUp.vue')).default,
}
