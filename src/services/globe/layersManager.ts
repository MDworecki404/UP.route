import {
    type Cesium3DTilesLayerType,
    type CZMLLayerType,
    type LayersUnionType,
    type OSMLayerType,
    type TerrainLayerType,
    type XYZLayerType,
} from '@/types/layers'
import {
    Cesium3DTileset,
    CesiumTerrainProvider,
    CzmlDataSource,
    IonResource,
    OpenStreetMapImageryProvider,
    Terrain,
    UrlTemplateImageryProvider,
    type ImageryLayer,
} from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { LayerBase } from '../base/layers'
import { fetchJsonFile } from '../utils'
import { Cesium3DTileStyle } from '@cesium/engine'

export type LayersClassTypes = OSMLayer | Cesium3DTilesLayer | XYZLayer | TerrainLayer | CZMLLayer

////////////////////////////////////////////////////////////////
// MARK: - Layers Manager
////////////////////////////////////////////////////////////////

export class LayersManager {
    private _viewer: Viewer
    private _layers: Map<string, LayersClassTypes> = new Map()

    constructor(viewer: Viewer) {
        this._viewer = viewer
    }

    get layers(): Map<string, LayersClassTypes> {
        return this._layers
    }

    async initializeLayers(): Promise<void> {
        const layersConfig = await fetchJsonFile<LayersUnionType[]>(
            new URL('/properties/layers.json', import.meta.url).href,
        )

        for (let i = 0; i < layersConfig.length; i++) {
            const layerConfig = layersConfig[i]

            if (!layerConfig) continue

            try {
                const LayerClass = LayersFactory(layerConfig, this._viewer)

                await LayerClass.initialize()

                if (!(LayerClass instanceof TerrainLayer)) {
                    LayerClass.addToGlobe()
                }

                if (LayerClass instanceof TerrainLayer) {
                    if (layerConfig.active) {
                        LayerClass.setVisibility(true)
                    }
                }

                this._layers.set(layerConfig.id!, LayerClass)
            } catch (error) {
                console.error(`Error initializing layer ${layerConfig.name}:`, error)
                continue
            }
        }
    }
}

////////////////////////////////////////////////////////////////
// MARK: - OSM Layer
////////////////////////////////////////////////////////////////

export class OSMLayer extends LayerBase<ImageryLayer> {
    public readonly classType = 'OSMLayer'
    private _viewer: Viewer
    private _config: OSMLayerType
    public _layer: ImageryLayer | null = null

    constructor(viewer: Viewer, config: OSMLayerType) {
        super()
        this._viewer = viewer
        this._config = config
    }

    initialize(): Promise<ImageryLayer> {
        return new Promise((resolve) => {
            this._layer = this._viewer.imageryLayers.addImageryProvider(
                new OpenStreetMapImageryProvider({
                    url: 'https://a.tile.openstreetmap.org/',
                    credit: '© OpenStreetMap contributors',
                }),
            )
            this._layer.appId = this._config.id
            this._layer.show = this._config.active
            this._layer.parent = this._config.parent!
            resolve(this._layer)
        })
    }

    get config(): OSMLayerType {
        return this._config
    }

    getName(): string {
        return this._layer!.name ?? this.classType
    }

    getType(): string {
        return this.classType
    }

    addToGlobe(): void {
        if (this._layer && !this._viewer.imageryLayers.contains(this._layer)) {
            this._viewer.imageryLayers.add(this._layer)
        }
    }

    destroy(): void {
        if (this._layer) {
            this._viewer.imageryLayers.remove(this._layer)
            this._layer = null
        }
    }
}

////////////////////////////////////////////////////////////////
// MARK: - 3D Tiles Layer
////////////////////////////////////////////////////////////////

export class Cesium3DTilesLayer extends LayerBase<Cesium3DTileset> {
    public readonly classType = '3dTiles'
    private _viewer: Viewer
    private _config: Cesium3DTilesLayerType
    public _layer: Cesium3DTileset | null = null

    constructor(viewer: Viewer, config: Cesium3DTilesLayerType) {
        super()
        this._viewer = viewer
        this._config = config
    }

    initialize(): Promise<Cesium3DTileset> {
        return (async () => {
            try {
                this._layer = await Cesium3DTileset.fromIonAssetId(this._config.ionId)
                this._layer.show = this._config.active
                this._layer.parent = this._config.parent!

                this.setLayerProperties()

                return this._layer
            } catch (error) {
                throw error
            }
        })()
    }

    get config(): Cesium3DTilesLayerType {
        return this._config
    }

    getName(): string {
        return this._layer!.name ?? this.classType
    }

    getType(): string {
        return this.classType
    }

    addToGlobe(): void {
        if (this._layer && !this._viewer.scene.primitives.contains(this._layer)) {
            this._viewer.scene.primitives.add(this._layer)
        }
    }

    private setLayerProperties(): void {
        if (!this._layer) return

        switch (this._config.tilesProps?.type) {
            case 'pointCloud':
                if (this._layer.style) {
                    this._layer!.style = new Cesium3DTileStyle({
                        pointSize: this._config.tilesProps.pointSize ?? 1,
                    })
                }
        }
    }

    destroy(): void {
        if (this._layer) {
            this._viewer.scene.primitives.remove(this._layer)
            this._layer = null
        }
    }
}

////////////////////////////////////////////////////////////////
// MARK: - XYZ Layer
////////////////////////////////////////////////////////////////

export class XYZLayer extends LayerBase<ImageryLayer> {
    public readonly classType = 'xyz'
    private _viewer: Viewer
    private _config: XYZLayerType
    public _layer: ImageryLayer | null = null

    constructor(viewer: Viewer, config: XYZLayerType) {
        super()
        this._viewer = viewer
        this._config = config
    }

    initialize(): Promise<ImageryLayer> {
        return new Promise(async (resolve) => {
            this._layer = this._viewer.imageryLayers.addImageryProvider(
                new UrlTemplateImageryProvider({
                    url: this._config.url,
                }),
            )
            this._layer.show = this._config.active
            this._layer.parent = this._config.parent!

            resolve(this._layer)
        })
    }

    get config(): XYZLayerType {
        return this._config
    }

    getName(): string {
        return this._layer!.name ?? this.classType
    }

    getType(): string {
        return this.classType
    }

    addToGlobe(): void {
        if (this._layer && !this._viewer.scene.imageryLayers.contains(this._layer)) {
            this._viewer.scene.imageryLayers.add(this._layer)
        }
    }

    destroy(): void {
        if (this._layer) {
            this._viewer.scene.imageryLayers.remove(this._layer)
            this._layer = null
        }
    }
}

////////////////////////////////////////////////////////////////
// MARK: - Terrain Layer
////////////////////////////////////////////////////////////////

export class TerrainLayer {
    public readonly classType = 'terrain'
    private _viewer: Viewer
    private _config: TerrainLayerType
    public _layer: Terrain | null = null

    constructor(viewer: Viewer, config: TerrainLayerType) {
        this._viewer = viewer
        this._config = config
    }

    get config(): TerrainLayerType {
        return this._config
    }

    initialize(): Promise<Terrain> {
        return new Promise(async (resolve) => {
            this._layer = new Terrain(CesiumTerrainProvider.fromIonAssetId(this._config.ionId))

            resolve(this._layer)
        })
    }

    setVisibility(visible: boolean): void {
        if (this._layer) {
            if (!visible) {
                this._viewer.scene.setTerrain(Terrain.fromWorldTerrain())
                return
            }
            this._viewer.scene.setTerrain(this._layer)
        }
    }

    isVisible(): boolean {
        return this._viewer.terrainProvider === this._layer?.provider
    }
}

////////////////////////////////////////////////////////////////
// MARK: - CZML Layer
////////////////////////////////////////////////////////////////

export class CZMLLayer extends LayerBase<CzmlDataSource> {
    public readonly classType = 'czml'
    private _viewer: Viewer
    private _config: CZMLLayerType
    public _layer: CzmlDataSource | null = null

    constructor(viewer: Viewer, config: CZMLLayerType) {
        super()
        this._viewer = viewer
        this._config = config
    }

    initialize(): Promise<CzmlDataSource> {
        return (async () => {
            try {
                const resource = await IonResource.fromAssetId(this._config.ionId)
                this._layer = await CzmlDataSource.load(resource)
                if (this._layer) {
                    this._layer.show = this._config.active
                    this._layer.parent = this._config.parent!
                }
            } catch (error) {
                throw error
            }
            return this._layer!
        })()
    }

    addToGlobe(): void {
        if (this._layer && !this._viewer.dataSources.contains(this._layer)) {
            this._viewer.dataSources.add(this._layer)
        }
    }

    get config(): CZMLLayerType {
        return this._config
    }

    getName(): string {
        return this._layer!.name ?? this.classType
    }

    getType(): string {
        return this.classType
    }

    destroy(): void {
        if (this._layer) {
            this._viewer.dataSources.remove(this._layer)
            this._layer = null
        }
    }
}

////////////////////////////////////////////////////////////////
// MARK: - Layers Factory
////////////////////////////////////////////////////////////////

export const LayersFactory = (layer: LayersUnionType, viewer: Viewer) => {
    switch (layer.type) {
        case 'osm':
            return new OSMLayer(viewer, layer)
        case '3dtiles':
            return new Cesium3DTilesLayer(viewer, layer)
        case 'xyz':
            return new XYZLayer(viewer, layer)
        case 'terrain':
            return new TerrainLayer(viewer, layer)
        case 'czml':
            return new CZMLLayer(viewer, layer)
        default:
            throw new Error(`Layer type ${layer.type} is not supported`)
    }
}
