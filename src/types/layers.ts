import z from 'zod'

export const LayerTypes = z.enum(['osm', 'xyz', 'wms', 'wmts', '3dtiles', 'czml', 'terrain'])
export const LayerParents = z.enum([
    'demLayers',
    'basemaps',
    '3dLayers',
    'campus3D',
    'vectorLayers',
])

export const LayerParentsIcons: Record<z.infer<typeof LayerParents>, string> = {
    demLayers: 'mdi-image-filter-hdr',
    basemaps: 'mdi-map',
    '3dLayers': 'mdi-cube',
    campus3D: 'mdi-school',
    vectorLayers: 'mdi-vector-square',
}

export const LayerBaseSchema = z.object({
    type: LayerTypes,
    active: z.boolean().default(true),
    icon: z.string().optional(),
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

const Cesium3DTilesPointCloudSchema = z.object({
    type: z.literal('pointCloud'),
    pointSize: z.number().optional(),
    maximumScreenSpaceError: z.number().optional(),
    pointCloudShading: z
        .object({
            attenuation: z.boolean().optional(),
            geometricErrorScale: z.number().optional(),
            baseResolution: z.number().optional(),
            eyeDomeLighting: z.boolean().optional(),
            eyeDomeLightingStrength: z.number().optional(),
            eyeDomeLightingRadius: z.number().optional(),
        })
        .optional(),
})

const Cesium3DTilesUnionSchema = z.discriminatedUnion('type', [Cesium3DTilesPointCloudSchema])

export const Cesium3DTilesLayerSchema = LayerBaseSchema.extend({
    type: z.literal('3dtiles'),
    tilesProps: Cesium3DTilesUnionSchema.optional(),
    zIndex: z.number().optional(),
    ionId: z.number(),
})

export type Cesium3DTilesLayerType = z.infer<typeof Cesium3DTilesLayerSchema>

export const CZMLLayerSchema = LayerBaseSchema.extend({
    type: z.literal('czml'),
    ionId: z.number(),
})

export type CZMLLayerType = z.infer<typeof CZMLLayerSchema>

export const GeoJSONLayerSchema = LayerBaseSchema.extend({
    type: z.literal('geojson'),
    ionId: z.number(),
})

export type GeoJSONLayerType = z.infer<typeof GeoJSONLayerSchema>

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
    GeoJSONLayerSchema,
    CZMLLayerSchema,
    XYZLayerSchema,
    WMSLayerSchema,
    TerrainLayerSchema,
])

export type LayersUnionType = z.infer<typeof LayersUnionSchema>

export type RasterLayerAdjustmentOptions = {
    brightness?: number
    contrast?: number
    hue?: number
    saturation?: number
    gamma?: number
    alpha?: number
}

export const PointCloudLayerAdjustmentOptionsSchema = Cesium3DTilesPointCloudSchema.omit({
    type: true,
})

export type PointCloudLayerAdjustmentOptions = z.infer<
    typeof PointCloudLayerAdjustmentOptionsSchema
>
