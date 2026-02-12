import z from 'zod'
import { ViewConfigSchema } from './utils'

export const upwrBuildingsMetadataSchema = z.object({
    type: z.string().nullish(),
    name: z.string().nullish(),
    buildingNum: z.string().nullish(),
    buildingAddress: z.string().nullish(),
    description: z.string().nullish(),
    height: z.number().nullish(),
    gmlIds: z.array(z.string()),
    icon: z.string().optional(),
    view: ViewConfigSchema.optional(),
})

export type UpwrBuildingsMetadata = z.infer<typeof upwrBuildingsMetadataSchema>

export const upwrBuildingsMetadataArraySchema = z.array(upwrBuildingsMetadataSchema)

export type UpwrBuildingsMetadataArray = z.infer<typeof upwrBuildingsMetadataArraySchema>
