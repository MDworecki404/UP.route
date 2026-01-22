import type { Entity, LabelGraphics, PointGraphics, ScreenSpaceEventHandler } from '@cesium/engine'
import {
    Cartesian2,
    Cartesian3,
    Color,
    CustomDataSource,
    DataSource,
    HorizontalOrigin,
    LabelStyle,
    NearFarScalar,
    ScreenSpaceEventType,
    VerticalOrigin,
    type PolygonGraphics,
    type PolylineGraphics,
} from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import {
    calculateAreaFromPositions,
    calculateDistanceFromPositions,
    calculateHeihtDifference,
} from '../utils'
import type { GlobeEvent } from './events'
import { useNotifyStore } from '@/stores/notify'

export const getPolylineStyle = (): PolylineGraphics.ConstructorOptions => {
    return {
        material: Color.fromBytes(0, 180, 255, 255),
        width: 3,
        clampToGround: true,
    }
}

export const getPointStyle = (): PointGraphics.ConstructorOptions => {
    return {
        color: Color.fromBytes(0, 180, 255, 255),
        pixelSize: 8,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
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

export const getLabelStyle = (text: string): LabelGraphics.ConstructorOptions => {
    return {
        text: text,
        font: "bold 13px 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        fillColor: Color.WHITE,
        style: LabelStyle.FILL,
        showBackground: true,
        backgroundColor: Color.fromCssColorString('#1e1e1e').withAlpha(0.85),
        backgroundPadding: new Cartesian2(8, 5),
        verticalOrigin: VerticalOrigin.BOTTOM,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: new Cartesian2(0, -15),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
        translucencyByDistance: new NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0),
    }
}

export class MeasurementsService {
    private _measurementLayer: DataSource | null = null
    private _temporaryLayer: DataSource | null = null
    private _temporaryPointsLayer: DataSource | null = null
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

        this._temporaryPointsLayer = new CustomDataSource()
        this._viewer.dataSources.add(this._temporaryPointsLayer)
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
                this.measureArea()
                break
            case 'height':
                this.measureHeight()
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
            const clickPosition = this._viewer.scene.pickPosition(e.position)
            if (clickPosition) {
                this._activePoints.push(clickPosition)
            }

            this._temporaryPointsLayer?.entities.add({
                position: this._activePoints[this._activePoints.length - 1]!,
                point: getPointStyle(),
            })

            if (this._activePoints.length >= 2) {
                const distance = calculateDistanceFromPositions(this._activePoints)

                const polyline = this._temporaryLayer?.entities.add({
                    polyline: {
                        ...getPolylineStyle(),
                        positions: this._activePoints,
                    },
                })

                this._temporaryLayer?.entities.add({
                    position: this._activePoints[this._activePoints.length - 1]!,
                    label: getLabelStyle(`${distance.toFixed(2)} m`),
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

    private measureArea() {
        const globeMouseMoveEvent = () => {
            this._viewer.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const clickPosition = this._viewer.scene.pickPosition(e.position)
            if (clickPosition) {
                this._activePoints.push(clickPosition)
            }

            this._temporaryLayer?.entities.removeAll()
            this._temporaryPointsLayer?.entities.add({
                position: this._activePoints[this._activePoints.length - 1]!,
                point: getPointStyle(),
            })

            if (this._activePoints.length >= 3) {
                const area = calculateAreaFromPositions(this._activePoints)

                const polygon = this._temporaryLayer?.entities.add({
                    polygon: {
                        ...getPolygonStyle(),
                        hierarchy: this._activePoints,
                    },
                })

                this._temporaryLayer?.entities.add({
                    position: this._activePoints[0]!,
                    label: getLabelStyle(
                        area > 1000000
                            ? `${(area / 1000000).toFixed(2)} km²`
                            : `${area.toFixed(2)} m²`,
                    ),
                })

                this._activeEntity = polygon || null
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

    private measureHeight() {
        const globeMouseMoveEvent = () => {
            this._viewer.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const clickPosition = this._viewer.scene.pickPosition(e.position)
            if (clickPosition) {
                this._activePoints.push(clickPosition)
            }

            this._temporaryPointsLayer?.entities.add({
                position: this._activePoints[this._activePoints.length - 1]!,
                point: getPointStyle(),
            })

            if (this._activePoints.length === 2) {
                const heightDifference = calculateHeihtDifference(this._activePoints)

                const polyline = this._temporaryLayer?.entities.add({
                    polyline: {
                        ...getPolylineStyle(),
                        positions: this._activePoints,
                        clampToGround: false,
                    },
                })

                this._temporaryLayer?.entities.add({
                    position: this._activePoints[1]!,
                    label: getLabelStyle(`${heightDifference.toFixed(2)} m`),
                })

                this._activeEntity = polyline || null

                this._activePoints = []
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
        this.resetPointsLayer()
    }

    public resetActiveMeasurement() {
        if (this._temporaryLayer) {
            this._temporaryLayer.entities.removeAll()
        }
        this._activePoints = []
        this._activeEntity = null
        this.resetPointsLayer()
    }

    public finishActiveMeasurement() {
        if (this._activeEntity && this._measurementLayer) {
            this._temporaryLayer?.entities.values.forEach((entity) => {
                this._measurementLayer?.entities.add(entity)
            })
        }
        this.resetActiveMeasurement()

        useNotifyStore().showNotify({
            msg: 'measurementFinished',
            notifyType: 'success',
            notifyDuration: 1000,
            notifyIcon: 'mdi-check-circle-outline',
            notifyWidth: 300,
        })
    }

    public stopMeasurementMode() {
        this.resetActiveMeasurement()
        this.resetPointsLayer()
        this._eventsService?.setDefaultEvents()
    }

    public clearMeasurementLayer() {
        if (this._measurementLayer) {
            this._measurementLayer.entities.removeAll()
        }
        this.resetPointsLayer()

        this._eventsService?.setDefaultEvents()
    }

    private resetPointsLayer() {
        if (this._temporaryPointsLayer) {
            this._temporaryPointsLayer.entities.removeAll()
        }
    }

    public clearEverything() {
        this.clearMeasurements()
        this.resetActiveMeasurement()
    }
}
