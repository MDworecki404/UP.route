import { ImageryLayer } from '@cesium/engine'
import { globeInstance } from '../globe/globe'

export abstract class LayerBase<T extends { show: boolean }> {
    public abstract readonly classType: string
    public _layer: T | null = null

    abstract initialize(): Promise<T>

    abstract destroy(): void
    abstract getName(): string
    abstract getType(): string

    abstract addToGlobe(): void

    raiseToTop(): void {
        if (this._layer instanceof ImageryLayer) {
            globeInstance.viewer.imageryLayers.raiseToTop(this._layer)
        }
    }

    setVisibility(visible: boolean): void {
        if (this._layer) {
            this._layer.show = visible
        }

        this.raiseToTop()
    }

    isVisible(): boolean {
        return this._layer?.show ?? false
    }
}
