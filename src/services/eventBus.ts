import type { Action } from '@/types/actions'
import UPEvent from './globalEvents'

export const appLoaded = new UPEvent<boolean>()

export const actionPerformed = new UPEvent<Action>()

export const objectClicked = new UPEvent<Record<string, unknown> | null>()

export const customObjectClicked = new UPEvent<{
    id: string
    data: Record<string, unknown> | null
}>()
