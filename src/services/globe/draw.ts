import type { Viewer } from '@cesium/widgets'
import type { GlobeEvent } from './events'
import { Cartesian3 } from '@cesium/engine'
import { CustomDataSource } from '@cesium/engine'
import { PolygonGraphics, PolylineGraphics, ScreenSpaceEventType } from '@cesium/engine'
import type { PointGraphics } from '@cesium/engine'
import { Color } from '@cesium/engine'
import type { ScreenSpaceEventHandler } from '@cesium/engine'
import type { Entity } from '@cesium/engine'
import { PolygonHierarchy, ConstantProperty } from '@cesium/engine'

export type DrawType =
    | 'point'
    | 'polyline'
    | 'rectangle'
    | 'polygon'
    | 'circle'
    | 'wall'
    | 'ellipse'

////////////////
// ? MARK: STYLES
////////////////

export const getDrawPointStyle = (): PointGraphics.ConstructorOptions => ({
    color: Color.fromCssColorString('#7a1f2f'),
    pixelSize: 8,
    outlineColor: Color.WHITE,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
})

export const getDrawPolylineStyle = (): PolylineGraphics.ConstructorOptions => ({
    material: Color.fromCssColorString('#7a1f2f'),
    width: 3,
    clampToGround: true,
})

export const getDrawPolygonStyle = (): PolygonGraphics.ConstructorOptions => ({
    material: Color.fromCssColorString('#7a1f2f').withAlpha(0.31),
    outline: true,
    outlineColor: Color.fromCssColorString('#7a1f2f').withAlpha(0.78),
    outlineWidth: 2,
})

export const getDefaultStyle: Partial<Entity.ConstructorOptions> = {
    point: getDrawPointStyle(),
    polyline: getDrawPolylineStyle(),
    polygon: getDrawPolygonStyle(),
}

export class DrawService {
    private _activePoints: Cartesian3[] = []
    private _temporaryLayer: CustomDataSource | null = null
    private _drawLayer: CustomDataSource | null = null
    private _previewPointsLayer: CustomDataSource | null = null
    private _activeEntity: Entity | null = null

    constructor(
        private _viewer: Viewer,
        private _events: GlobeEvent,
    ) {
        this._initializeLayers()
    }

    private _initializeLayers(): void {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this._temporaryLayer = new CustomDataSource('temporary-draw-layer')
        this._drawLayer = new CustomDataSource('draw-layer')
        this._previewPointsLayer = new CustomDataSource('preview-points-layer')
        this._viewer.dataSources.add(this._temporaryLayer)
        this._viewer.dataSources.add(this._drawLayer)
        this._viewer.dataSources.add(this._previewPointsLayer)
    }

    public setDrawMode(drawType: DrawType): void {
        switch (drawType) {
            case 'point':
                this.drawPoint()
                break
            case 'polyline':
                this.drawPolyline()
                break
            case 'rectangle':
                // Implement rectangle drawing logic here
                break
            case 'polygon':
                this.drawPolygon()
                break
            case 'circle':
                // Implement circle drawing logic here
                break
            case 'wall':
                // Implement wall drawing logic here
                break
            case 'ellipse':
                // Implement ellipse drawing logic here
                break
            default:
                throw new Error(`Unsupported draw type: ${drawType}`)
        }
    }

    private _clearTemporaryLayer(): void {
        if (this._temporaryLayer) {
            this._temporaryLayer.entities.removeAll()
        }
    }

    private _clearPreviewPointsLayer(): void {
        if (this._previewPointsLayer) {
            this._previewPointsLayer.entities.removeAll()
        }
    }

    public clearDrawLayer(): void {
        if (this._drawLayer) {
            this._drawLayer.entities.removeAll()
        }
    }

    private _moveTemporaryToDrawLayer(): void {
        if (!this._temporaryLayer || !this._drawLayer) {
            throw new Error('Layers are not initialized')
        }

        this._temporaryLayer.entities.values.forEach((entity) => {
            this._drawLayer!.entities.add(entity)
        })
        this._clearTemporaryLayer()
    }

    public finishDrawing(): void {
        this._events.setDefaultEvents()

        this._moveTemporaryToDrawLayer()
        this._activePoints = []
        this._activeEntity = null
        this._clearPreviewPointsLayer()
    }

    public cancelDrawing(): void {
        this._activePoints = []
        this._clearTemporaryLayer()
        this._clearPreviewPointsLayer()
        this._activeEntity = null
        this._events.setDefaultEvents()
    }

    ////////////////////////
    // MARK: DRAW METHODS
    ////////////////////////

    // * MARK: POINT

    private drawPoint(): void {
        const globeMouseEvent = () => {
            this._viewer.scene.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const position = this._viewer.scene.pickPosition(e.position)
            if (position) {
                this._activePoints.push(position)

                this._temporaryLayer?.entities.add({
                    position: position,
                    point: getDrawPointStyle(),
                })
            }
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            globeMouseEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            globeLeftClickEvent,
            ScreenSpaceEventType.LEFT_CLICK,
        )
    }

    // * MARK: POLYLINE

    private drawPolyline(): void {
        const globeMouseEvent = () => {
            this._viewer.scene.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const position = this._viewer.scene.pickPosition(e.position)
            if (position) {
                this._activePoints.push(position)

                this._previewPointsLayer?.entities.add({
                    position: position,
                    point: getDrawPointStyle(),
                })
            }

            if (this._activePoints.length >= 2) {
                if (this._activeEntity) {
                    this._temporaryLayer!.entities.remove(this._activeEntity)
                }

                this._activeEntity = this._temporaryLayer!.entities.add({
                    polyline: {
                        positions: this._activePoints,
                        ...getDrawPolylineStyle(),
                    },
                })
            }
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            globeMouseEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            globeLeftClickEvent,
            ScreenSpaceEventType.LEFT_CLICK,
        )
    }

    // * MARK: RECTANGLE

    // * MARK: POLYGON

    private drawPolygon(): void {
        const globeMouseEvent = () => {
            this._viewer.scene.canvas.style.cursor = 'crosshair'
        }

        const globeLeftClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const position = this._viewer.scene.pickPosition(e.position)
            if (position) {
                this._activePoints.push(position)

                this._previewPointsLayer?.entities.add({
                    position: position,
                    point: getDrawPointStyle(),
                })
            }

            if (this._activePoints.length >= 3) {
                if (this._activeEntity) {
                    this._temporaryLayer!.entities.remove(this._activeEntity)
                }

                this._activeEntity = this._temporaryLayer!.entities.add({
                    polygon: {
                        hierarchy: new ConstantProperty(new PolygonHierarchy(this._activePoints)),
                        ...getDrawPolygonStyle(),
                    },
                })
            }
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            globeMouseEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            globeLeftClickEvent,
            ScreenSpaceEventType.LEFT_CLICK,
        )
    }

    // * MARK: CIRCLE

    // * MARK: WALL

    // * MARK: ELLIPSE
}
