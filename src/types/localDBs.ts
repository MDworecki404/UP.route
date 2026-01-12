import z from 'zod'

export const BaseLayerSchema = z.object({
    name: z.string(),
    treeParentId: z.string().nullable(),
    activeOnStart: z.boolean().default(false),
})
