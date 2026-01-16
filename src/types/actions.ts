import { TOOLS_KEYS } from '@/services/tools'
import z from 'zod'

export const ToggleToolActionSchema = z.object({
    actionId: z.literal('toggleTool'),
    toolId: z.enum(TOOLS_KEYS),
    icon: z.string(),
    props: z.record(z.string(), z.any()).optional(),
    width: z.number().optional(),
    maxHeight: z.number().optional(),
})

export const ToggleLayersDrawerSchema = z.object({
    actionId: z.literal('toggleLayersDrawer'),
})

export const BackToHomeViewActionSchema = z.object({
    actionId: z.literal('backToHomeView'),
})

export const ZoomInActionSchema = z.object({
    actionId: z.literal('zoomIn'),
})

export const ZoomOutActionSchema = z.object({
    actionId: z.literal('zoomOut'),
})

export const ActionSchema = z.discriminatedUnion('actionId', [
    ToggleToolActionSchema,
    ToggleLayersDrawerSchema,
    BackToHomeViewActionSchema,
    ZoomInActionSchema,
    ZoomOutActionSchema,
])

export type Action = z.infer<typeof ActionSchema>

export type ActionsIds = z.infer<typeof ActionSchema>['actionId']
