import { useToolsStore } from '@/stores'
import type { Action, ActionsIds } from '@/types/actions'
import { actionPerformed } from './eventBus'
import { getTool } from './tools'

const toggleTool = async (config: Action) => {
    if (config.actionId !== 'toggleTool') return
    const toolsStore = useToolsStore()

    const tool = await getTool(config.toolId)
    toolsStore.openTool({
        id: config.toolId,
        component: tool!,
        props: config.props,
        width: config.width,
        icon: config.icon,
        maxHeight: config.maxHeight,
    })

    actionPerformed.raiseEvent(config)
}

const toggleLayersDrawer = (config: Action) => {
    if (config.actionId !== 'toggleLayersDrawer') return
    actionPerformed.raiseEvent(config)
}

const ACTION_HANDLERS: { [key in ActionsIds]: (config: Action) => void } = {
    toggleLayersDrawer,
    toggleTool,
}

export const performAction = (actionConfig: Action) => {
    const handler = ACTION_HANDLERS[actionConfig.actionId]
    if (handler) {
        handler(actionConfig)
    } else {
        console.warn(`No handler found for actionId: ${actionConfig.actionId}`)
    }
}
