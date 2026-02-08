import z from 'zod'

export type BookmarkElements = 'cameraPosition' | 'layers' | 'shadowsSettings' | 'objectInfo'

export const ViewsBookmarksSchema = z.object({
    bookmarks: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            cameraPosition: z
                .object({
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
                })
                .optional(),
            layers: z.array(z.string()).optional(),
            shadowsSettings: z
                .object({
                    objectsShadows: z.boolean(),
                    terrainShadows: z.boolean(),
                    smoothShadows: z.boolean(),
                    allTimeInMs: z.number(),
                    timeOfDay: z.number(),
                })
                .optional(),
            objectInfo: z
                .array(
                    z.object({
                        id: z.string(),
                        props: z.record(z.string(), z.unknown()).optional(),
                        width: z.number().optional(),
                        icon: z.string().optional(),
                    }),
                )
                .optional(),
        }),
    ),
})

export type ViewsBookmarks = z.infer<typeof ViewsBookmarksSchema>
