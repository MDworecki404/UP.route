import z from 'zod'

export const ToggleToolActionSchema = z.object({
    actionId: z.literal('toggleTool'),
    toolId: z.string(),
    icon: z.string(),
    props: z.record(z.string(), z.any()).optional(),
})

export const ActionSchema = z.discriminatedUnion('actionId', [ToggleToolActionSchema])

export type ActionsIds = z.infer<typeof ActionSchema>['actionId']
