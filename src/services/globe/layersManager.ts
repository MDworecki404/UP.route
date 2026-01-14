import {
    type Cesium3DTilesLayerType,
    type LayersUnionType,
    type OSMLayerType,
    type XYZLayerType,
} from '@/types/layers'
import {
    Cesium3DTileset,
    OpenStreetMapImageryProvider,
    UrlTemplateImageryProvider,
    type ImageryLayer,
} from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { LayerBase } from '../base/layers'
import { fetchJsonFile } from '../utils'

export type LayersClassTypes = OSMLayer | Cesium3DTilesLayer | XYZLayer

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

                LayerClass.addToGlobe()
                this._layers.set(layerConfig.id!, LayerClass)
            } catch (error) {
                console.error(`Error initializing layer ${layerConfig.name}:`, error)
                continue
            }
        }
    }
}

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
        return new Promise(async (resolve) => {
            this._layer = await Cesium3DTileset.fromIonAssetId(this._config.ionId)
            this._layer.show = this._config.active
            this._layer.parent = this._config.parent!

            resolve(this._layer)
        })
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

    destroy(): void {
        if (this._layer) {
            this._viewer.scene.primitives.remove(this._layer)
            this._layer = null
        }
    }
}

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

export const LayersFactory = (layer: LayersUnionType, viewer: Viewer) => {
    switch (layer.type) {
        case 'osm':
            return new OSMLayer(viewer, layer)
        case '3dtiles':
            return new Cesium3DTilesLayer(viewer, layer)
        case 'xyz':
            return new XYZLayer(viewer, layer)
        default:
            throw new Error(`Layer type ${layer.type} is not supported`)
    }
}
