import z from 'zod'
import { ViewConfigSchema } from './utils'

export const upwrBuildingsMetadataSchema = z.object({
    type: z.string(),
    name: z.string().or(z.null()),
    buildingNum: z.string().or(z.null()),
    buildingAddress: z.string().or(z.null()),
    description: z.string().or(z.null()),
    height: z.number().or(z.null()),
    gmlIds: z.array(z.string()),
    icon: z.string().optional(),
    view: ViewConfigSchema.optional(),
})

export type UpwrBuildingsMetadata = z.infer<typeof upwrBuildingsMetadataSchema>

export const upwrBuildingsMetadataArraySchema = z.array(upwrBuildingsMetadataSchema)

export type UpwrBuildingsMetadataArray = z.infer<typeof upwrBuildingsMetadataArraySchema>
