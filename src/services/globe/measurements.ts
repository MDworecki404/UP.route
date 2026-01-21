import type { Cartesian3, PolygonGraphics, PolylineGraphics } from '@cesium/engine'
import { Color, CustomDataSource, DataSource, ScreenSpaceEventType } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import type { GlobeEvent } from './events'
import type { ScreenSpaceEventHandler } from '@cesium/engine'
import type { Entity } from '@cesium/engine'

export const getPolylineStyle = (): PolylineGraphics.ConstructorOptions => {
    return {
        material: Color.fromBytes(0, 180, 255, 255),
        width: 3,
        clampToGround: true,
    }
}

export const getPolygonStyle = (): PolygonGraphics.ConstructorOptions => {
    return {
        material: Color.fromBytes(0, 180, 255, 80),
        outline: true,
        outlineColor: Color.fromBytes(0, 180, 255, 200),
        outlineWidth: 2,
    }
}

export class MeasurementsService {
    private _measurementLayer: DataSource | null = null
    private _temporaryLayer: DataSource | null = null
    private _eventsService: GlobeEvent | null = null
    private _activePoints: Cartesian3[] = []
    private _activeEntity: Entity | null = null

    constructor(
        private _viewer: Viewer,
        events: GlobeEvent,
    ) {
        this.initialize()
        this._eventsService = events
    }

    private initialize() {
        this._measurementLayer = new CustomDataSource()
        this._viewer.dataSources.add(this._measurementLayer)

        this._temporaryLayer = new CustomDataSource()
        this._viewer.dataSources.add(this._temporaryLayer)
    }

    public setMeasureMode(mode: 'distance' | 'area' | 'height') {
        if (!this._eventsService) {
            throw new Error('GlobeEvent service is not initialized')
        }

        switch (mode) {
            case 'distance':
                this.measureDistance()
                break
            case 'area':
                console.log('Area measurement mode activated')
                break
            case 'height':
                console.log('Height measurement mode activated')
                break
            default:
                console.log('Unknown measurement mode')
        }
    }

    private measureDistance() {
        const globeMouseMoveEvent = () => {
            this._viewer.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const pickRay = this._viewer.camera.getPickRay(e.position)
            if (pickRay) {
                const cartesian = this._viewer.scene.globe.pick(pickRay, this._viewer.scene)
                if (cartesian) {
                    this._activePoints.push(cartesian)
                }
            }

            if (this._activePoints.length >= 2) {
                const polyline = this._temporaryLayer?.entities.add({
                    polyline: {
                        ...getPolylineStyle(),
                        positions: this._activePoints,
                    },
                })

                this._activeEntity = polyline || null
            }
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            globeMouseMoveEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            globeLeftClickEvent,
            ScreenSpaceEventType.LEFT_CLICK,
        )
    }

    public clearMeasurements() {
        if (this._measurementLayer) {
            this._measurementLayer.entities.removeAll()
        }
    }

    public resetActiveMeasurement() {
        if (this._temporaryLayer) {
            this._temporaryLayer.entities.removeAll()
        }
        this._activePoints = []
        this._activeEntity = null
    }

    public finishActiveMeasurement() {
        if (this._activeEntity && this._measurementLayer) {
            this._measurementLayer.entities.add(this._activeEntity)
        }
        this.resetActiveMeasurement()
    }

    public stopMeasurementMode() {
        this.resetActiveMeasurement()
        this._eventsService?.setDefaultEvents()
    }

    public clearMeasurementLayer() {
        if (this._measurementLayer) {
            this._measurementLayer.entities.removeAll()
        }
    }
}
