import { type LayersUnionType, type OSMLayerType } from '@/types/layers'
import type { ImageryLayer } from '@cesium/engine'
import { OpenStreetMapImageryProvider } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { LayerBase } from '../base/layers'
import { fetchJsonFile } from '../utils'

export type LayersClassTypes = OSMLayer

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
            new URL('@/properties/layers.json', import.meta.url).href,
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
            this._layer.name = this._config.name
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

    isVisible(): boolean {
        return this._layer?.show ?? false
    }

    setVisibility(visible: boolean): void {
        if (this._layer) {
            this._layer.show = visible
        }
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

export const LayersFactory = (layer: LayersUnionType, viewer: Viewer) => {
    switch (layer.type) {
        case 'osm':
            return new OSMLayer(viewer, layer)
        default:
            throw new Error(`Layer type ${layer.type} is not supported`)
    }
}
