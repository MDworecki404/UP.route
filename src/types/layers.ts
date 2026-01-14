import z from 'zod'

export const LayerTypes = z.enum(['osm', 'wms', 'wmts', '3dtiles'])
export const LayerParents = z.enum(['basemaps'])

export const LayerBaseSchema = z.object({
    type: LayerTypes,
    active: z.boolean().default(true),
    name: z.string(),
    id: z.string().optional(),
    parent: LayerParents.nullish(),
})

export type LayerBaseType = z.infer<typeof LayerBaseSchema>

export const OSMLayerSchema = LayerBaseSchema.extend({
    type: z.literal('osm'),
})

export type OSMLayerType = z.infer<typeof OSMLayerSchema>

export const WMSLayerSchema = LayerBaseSchema.extend({
    type: z.literal('wms'),
    url: z.string(),
    layers: z.string(),
})

export const LayersUnionSchema = z.discriminatedUnion('type', [OSMLayerSchema, WMSLayerSchema])

export type LayersUnionType = z.infer<typeof LayersUnionSchema>
