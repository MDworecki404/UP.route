import type { Action, ActionsIds } from '@/types/actions'
import { actionPerformed } from './eventBus'

const toggleTool = (config: Action) => {
    if (config.actionId !== 'toggleTool') return
    console.log(`Toggling tool with ID: ${config.toolId}`)
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
