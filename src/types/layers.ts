import z from 'zod'

export const LayerTypes = z.enum(['osm', 'xyz', 'wms', 'wmts', '3dtiles', 'czml', 'terrain'])
export const LayerParents = z.enum([
    'demLayers',
    'basemaps',
    '3dLayers',
    'campus3D',
    'vectorLayers',
])

export const LayerBaseSchema = z.object({
    type: LayerTypes,
    active: z.boolean().default(true),
    name: z.string().or(
        z.object({
            pl: z.string(),
            en: z.string(),
        }),
    ),
    id: z.string().optional(),
    parent: LayerParents.nullish(),
})

export type LayerBaseType = z.infer<typeof LayerBaseSchema>

export const OSMLayerSchema = LayerBaseSchema.extend({
    type: z.literal('osm'),
})

export type OSMLayerType = z.infer<typeof OSMLayerSchema>

export const Cesium3DTilesLayerSchema = LayerBaseSchema.extend({
    type: z.literal('3dtiles'),
    zIndex: z.number().optional(),
    ionId: z.number(),
})

export type Cesium3DTilesLayerType = z.infer<typeof Cesium3DTilesLayerSchema>

export const CZMLLayerSchema = LayerBaseSchema.extend({
    type: z.literal('czml'),
    ionId: z.number(),
})

export type CZMLLayerType = z.infer<typeof CZMLLayerSchema>

export const XYZLayerSchema = LayerBaseSchema.extend({
    type: z.literal('xyz'),
    url: z.string(),
})

export type XYZLayerType = z.infer<typeof XYZLayerSchema>

export const TerrainLayerSchema = LayerBaseSchema.extend({
    type: z.literal('terrain'),
    group: z.literal('terrain'),
    ionId: z.number(),
})

export type TerrainLayerType = z.infer<typeof TerrainLayerSchema>

export const WMSLayerSchema = LayerBaseSchema.extend({
    type: z.literal('wms'),
    url: z.string(),
    layers: z.string(),
})

export const LayersUnionSchema = z.discriminatedUnion('type', [
    OSMLayerSchema,
    Cesium3DTilesLayerSchema,
    CZMLLayerSchema,
    XYZLayerSchema,
    WMSLayerSchema,
    TerrainLayerSchema,
])

export type LayersUnionType = z.infer<typeof LayersUnionSchema>
