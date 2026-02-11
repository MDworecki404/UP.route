import { useCommonStore, useToolsStore } from '@/stores'
import type { Action, ActionsIds } from '@/types/actions'
import { actionPerformed } from './eventBus'
import { getTool } from './tools'
import { globeInstance } from './globe/globe'

const toggleTool = async (config: Action) => {
    if (config.actionId !== 'toggleTool') return
    const toolsStore = useToolsStore()

    const tool = await getTool(config.toolId)
    if (!tool) {
        console.warn(`Tool with id ${config.toolId} not found.`)
        return
    }
    toolsStore.openTool({
        id: config.toolId,
        component: tool!,
        props: config.props,
        width: config.width,
        icon: config.icon,
        maxHeight: config.maxHeight,
        customTitle: config.customTitle,
    })

    actionPerformed.raiseEvent(config)
}

const toggleLayersDrawer = (config: Action) => {
    if (config.actionId !== 'toggleLayersDrawer') return
    actionPerformed.raiseEvent(config)
    useCommonStore().toggleDrawerState()
}

const backToHomeView = (config: Action) => {
    if (config.actionId !== 'backToHomeView') return

    globeInstance.flyHomeView()

    actionPerformed.raiseEvent(config)
}

const zoomIn = (config: Action) => {
    if (config.actionId !== 'zoomIn') return

    globeInstance.changeZoom(1)

    actionPerformed.raiseEvent(config)
}

const zoomOut = (config: Action) => {
    if (config.actionId !== 'zoomOut') return

    globeInstance.changeZoom(-1)

    actionPerformed.raiseEvent(config)
}

const ACTION_HANDLERS: { [key in ActionsIds]: (config: Action) => void } = {
    toggleLayersDrawer,
    toggleTool,
    backToHomeView,
    zoomIn,
    zoomOut,
}

export const performAction = (actionConfig: Action) => {
    const handler = ACTION_HANDLERS[actionConfig.actionId]
    if (handler) {
        handler(actionConfig)
    } else {
        console.warn(`No handler found for actionId: ${actionConfig.actionId}`)
    }
}
