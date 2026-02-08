import type { Action } from '@/types/actions'
import UPEvent from './globalEvents'

export const appLoaded = new UPEvent<boolean>()
export const appLoadingInfo = new UPEvent<string>()

export const actionPerformed = new UPEvent<Action>()

export const objectClicked = new UPEvent<Record<string, unknown> | null>()

export const customObjectClicked = new UPEvent<{
    id: string
    data: Record<string, unknown> | null
}>()

export const floodAreaSelected = new UPEvent<boolean>()

export const profileCreated = new UPEvent<boolean>()

export const visibilityChanged = new UPEvent<{
    id: string
    visible: boolean
}>()
