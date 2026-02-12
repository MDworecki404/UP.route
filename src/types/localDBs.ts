import z from 'zod'

export const GeneratedUPRoutesSchema = z.array(
    z.object({
        variantId: z.string(),
        route: z.array(z.array(z.number())),
        meta: z.object({
            startBud: z.string(),
            endBud: z.string(),
            startCoords: z.array(z.number()),
            endCoords: z.array(z.number()),
        }),
    }),
)

export type GeneratedUPRoutesType = z.infer<typeof GeneratedUPRoutesSchema>
