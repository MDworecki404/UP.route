import z from 'zod'
import { ActionSchema } from './actions'

export const ActionButtonSchema = z.object({
    tooltip: z.object({
        text: z
            .object({
                pl: z.string(),
                en: z.string(),
            })
            .or(z.string()),
        location: z.enum(['top', 'bottom', 'left', 'right']).default('top'),
    }),
    icon: z.string(),
    text: z.string().optional(),
})

export const ActionButtonWithActionSchema = ActionButtonSchema.extend({
    action: ActionSchema,
})

export type ActionButtonWithActionType = z.infer<typeof ActionButtonSchema> & {
    action: z.infer<typeof ActionSchema>
}

export const UiSchema = z.object({
    toolbarActionButtons: z.array(ActionButtonWithActionSchema),
})

export type UiType = z.infer<typeof UiSchema>
