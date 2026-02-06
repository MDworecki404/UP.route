import type { DataSource, Entity, ScreenSpaceEventHandler } from '@cesium/engine'
import { Cartesian3, Color, CustomDataSource, ScreenSpaceEventType } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { profileCreated } from '../eventBus'
import type { GlobeEvent } from './events'
import { useNotifyStore, useToolsStore } from '@/stores'
import { PolylineDashMaterialProperty } from '@cesium/engine'

export class ProfileManager {
    private _profileLayer: DataSource | null = null
    private _activePositions: Cartesian3[] = []
    private _profileEntity: Entity | null = null

    constructor(
        private _viewer: Viewer,
        private _events: GlobeEvent,
    ) {
        this._registerProfileLayer()
    }

    private _registerProfileLayer(): void {
        this._profileLayer = new CustomDataSource('profileLayer')
        this._viewer.dataSources.add(this._profileLayer)
    }

    get profileLayer(): DataSource {
        if (!this._profileLayer) {
            throw new Error('Profile layer is not initialized')
        }
        return this._profileLayer
    }

    public setUpDrawing(samplingDistance: number): void {
        this.resetProfile()

        const mouseMoveEvent = () => {
            this._viewer.scene.canvas.style.cursor = 'crosshair'
        }

        const mouseClickEvent = async (e: ScreenSpaceEventHandler.PositionedEvent) => {
            const position = this._viewer.scene.pickPosition(e.position)
            if (!position) return
            this._profileLayer!.entities.add({
                position,
                point: {
                    pixelSize: 8,
                    color: Color.fromCssColorString('#ca1744'),
                    outlineColor: Color.fromCssColorString('#5e0f22'),
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
            })

            this._activePositions.push(position)

            if (this._activePositions.length === 2) {
                this._profileEntity = this._profileLayer!.entities.add({
                    polyline: {
                        positions: this._activePositions,
                        width: 3,
                        material: new PolylineDashMaterialProperty({
                            color: Color.fromCssColorString('#ca1744'),
                            dashLength: 16,
                        }),
                        clampToGround: true,
                    },
                })

                profileCreated.raiseEvent(true)
                await this.createChart(samplingDistance)
            }
        }

        this._viewer.screenSpaceEventHandler.setInputAction(
            mouseMoveEvent,
            ScreenSpaceEventType.MOUSE_MOVE,
        )
        this._viewer.screenSpaceEventHandler.setInputAction(
            mouseClickEvent,
            ScreenSpaceEventType.LEFT_DOWN,
        )
    }

    private async createChart(samplingDistance: number): Promise<void> {
        if (useToolsStore().activeTools.has('chartView')) {
            useToolsStore().closeTool('chartView')
        }

        const start = this._activePositions[0]!
        const end = this._activePositions[1]!

        const rawPositions: Cartesian3[] = []
        const totalDistance = Cartesian3.distance(start, end)

        if (totalDistance < samplingDistance) {
            useNotifyStore().showNotify({
                msg: 'distanceShorterThanSamplingDistance',
                notifyType: 'error',
                notifyDuration: 3000,
                notifyIcon: 'mdi-alert-circle',
                notifyWidth: 300,
            })

            return
        }

        const numSamples = Math.ceil(totalDistance / samplingDistance)

        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples
            const interpolatedPoint = Cartesian3.lerp(start, end, t, new Cartesian3())
            rawPositions.push(interpolatedPoint)
        }

        const ellipsoid = this._viewer.scene.globe.ellipsoid
        const cartographicSamples = ellipsoid.cartesianArrayToCartographicArray(rawPositions)

        await this._viewer.scene.sampleHeightMostDetailed(cartographicSamples)

        const xAxis = cartographicSamples.map((_, i) => (i * samplingDistance).toFixed(1))

        const yAxis = cartographicSamples.map((cart) => cart.height)

        console.log('Wysokości terenu:', yAxis)

        const { performAction } = await import('@/services/actions')
        performAction({
            actionId: 'toggleTool',
            icon: 'mdi-chart-line',
            toolId: 'chartView',
            props: {
                xAxis,
                yAxis,
                yAxisTitle: 'height',
                xAxisTitle: 'distance',
                title: 'profileChart',
                chartColor: '#ca1744',
                chartBGColor: '#ca174433',
            },
            width: 600,
        })
    }

    public endDrawing(): void {
        this._viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
        this._viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN)

        this._events.setDefaultEvents()
    }

    public resetProfile(): void {
        this._activePositions = []
        if (this._profileEntity) {
            this._profileLayer!.entities.removeAll()
            this._profileEntity = null
        }
    }
}
