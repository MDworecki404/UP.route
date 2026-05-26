import z from 'zod'

export const presentationSlideSchema = z.object({
    index: z.number(),
    title: z.string(),
    cameraPosition: z.object({
        destination: z.object({
            x: z.number(),
            y: z.number(),
            z: z.number(),
        }),
        orientation: z.object({
            heading: z.number(),
            pitch: z.number(),
            roll: z.number(),
        }),
    }),
    layerIds: z.array(z.string()),
    text: z.string().optional(),
})

export const presentationSchema = z.object({
    id: z.string(),
    title: z.object({
        en: z.string(),
        pl: z.string(),
    }),
    description: z.string().optional(),
    slides: z.array(presentationSlideSchema),
})

export type Presentation = z.infer<typeof presentationSchema>

export type Presentations = Presentation[]
