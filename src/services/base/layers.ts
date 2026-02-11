import { ImageryLayer } from '@cesium/engine'
import { globeInstance } from '../globe/globe'
import { visibilityChanged } from '../eventBus'
import type { RasterLayerAdjustmentOptions } from '@/types/layers'

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
        visibilityChanged.raiseEvent({ id: this.getName(), visible })
    }

    isVisible(): boolean {
        return this._layer?.show ?? false
    }

    setImageryAdjustment(adjustments: RasterLayerAdjustmentOptions): void {
        if (!(this._layer instanceof ImageryLayer) || !this._layer) return

        this._layer.brightness = adjustments.brightness ?? this._layer.brightness
        this._layer.contrast = adjustments.contrast ?? this._layer.contrast
        this._layer.hue = adjustments.hue ?? this._layer.hue
        this._layer.saturation = adjustments.saturation ?? this._layer.saturation
        this._layer.gamma = adjustments.gamma ?? this._layer.gamma
        this._layer.alpha = adjustments.alpha ?? this._layer.alpha
    }
}
