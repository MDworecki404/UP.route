import { Cartesian3, type DataSource } from '@cesium/engine'
import { CallbackProperty, Color, CustomDataSource, Entity } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import type { LayersManager } from './layersManager'
import { HeightReference } from '@cesium/engine'
import type { ScreenSpaceEventHandler } from '@cesium/engine'
import { ScreenSpaceEventType } from '@cesium/engine'
import { floodAreaSelected } from '../eventBus'
import type { GlobeEvent } from './events'

export type FloodAnalysisMode = 'selectArea' | 'useWroclawArea'

export class FloodSim {
    private _floodAnalysisLayer: DataSource | null = null
    private _floodAreaEntity: Entity | null = null

    constructor(
        private _viewer: Viewer,
        private _layersManager: LayersManager,
        private _events: GlobeEvent,
    ) {
        this.registerFloodAnalysisLayer()
    }

    private registerFloodAnalysisLayer(): void {
        this._floodAnalysisLayer = new CustomDataSource('floodAnalysisLayer')
        this._viewer.dataSources.add(this._floodAnalysisLayer)
    }

    selectFloodAnalysisMode(mode: FloodAnalysisMode): void {
        switch (mode) {
            case 'selectArea':
                break
            case 'useWroclawArea':
                this._useWroclawArea()
                break
        }
    }

    selectFloodAreaByClick(length: number): void {
        const mouseMoveEvent = () => {
            this._viewer.scene.canvas.style.cursor = 'crosshair'
        }

        const mouseClickEvent = (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const position = this._viewer.scene.pickPosition(e.position)
            if (position) {
                const positions = [
                    Cartesian3.fromElements(position.x - length, position.y - length, position.z),
                    Cartesian3.fromElements(position.x + length, position.y - length, position.z),
                    Cartesian3.fromElements(position.x + length, position.y + length, position.z),
                    Cartesian3.fromElements(position.x - length, position.y + length, position.z),
                ]

                this._floodAreaEntity = new Entity({
                    polygon: {
                        hierarchy: positions,
                        extrudedHeight: 200,
                        material: Color.BLUE.withAlpha(0.5),
                        outline: true,
                        outlineColor: Color.DARKBLUE,
                    },
                })

                this._floodAnalysisLayer?.entities.add(this._floodAreaEntity)
                floodAreaSelected.raiseEvent(true)
            }

            this._viewer.scene.canvas.style.cursor = 'default'
            this._events.setDefaultEvents()
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            mouseClickEvent,
            ScreenSpaceEventType.LEFT_CLICK,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            mouseMoveEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
    }

    private _useWroclawArea(): void {
        const wroclawBoundaries = this._layersManager.layers.get('wroclawBoundaries')
        if (!wroclawBoundaries || wroclawBoundaries.classType !== 'czml') return
        const layer = wroclawBoundaries._layer
        if (!layer) return

        const wroclawBoundariesPositions: Cartesian3[] = ([] as Cartesian3[]).concat(
            ...layer.entities.values.map((entity) => {
                const positions =
                    entity.wall?.positions?.getValue && entity.wall.positions.getValue()
                return Array.isArray(positions) ? (positions as Cartesian3[]) : []
            }),
        )

        if (!wroclawBoundariesPositions.length) {
            console.warn(
                'No valid wall positions found for Wroclaw boundaries; aborting flood area creation.',
            )
            return
        }

        this._floodAnalysisLayer?.entities.removeAll()

        this._floodAreaEntity = new Entity({
            polygon: {
                hierarchy: wroclawBoundariesPositions,
                extrudedHeight: 200,
                material: Color.BLUE.withAlpha(0.5),
                outline: true,
                outlineColor: Color.DARKBLUE,
                distanceDisplayCondition: undefined,
                closeTop: true,
                closeBottom: true,
                heightReference: HeightReference.NONE,
                extrudedHeightReference: HeightReference.NONE,
            },
        })

        this._floodAnalysisLayer?.entities.add(this._floodAreaEntity)
    }

    public setFloodHeight(height: number): void {
        if (this._floodAreaEntity && this._floodAreaEntity.polygon) {
            this._floodAreaEntity.polygon.extrudedHeight = new CallbackProperty(() => height, false)
            this._floodAreaEntity.polygon.height = new CallbackProperty(() => 0, false)
        }
    }

    public cancelFloodAnalysis(): void {
        this._floodAnalysisLayer?.entities.removeAll()
        this._floodAreaEntity = null
        this._events.setDefaultEvents()
    }
}
