import type { userGlobeSettings } from '@/types/utils'
import { Cartesian3, Ion, Ray, ShadowMode, SkyAtmosphere } from '@cesium/engine'
import { type Viewer } from '@cesium/widgets'
import { getDefaultView, getDefaultViewerSettings } from '../defaults'
import { appLoaded } from '../eventBus'
import { getItemFromLocalStorage } from '../utils'
import type { GlobeEvent } from './events'
import type { LayersManager } from './layersManager'
import type { MeasurementsService } from './measurements'
import type { TimeManager } from './time'

export let globeInstance: GlobeService
export class GlobeService {
    private _viewer: Viewer | null = null
    private _layersManager: LayersManager | null = null
    private _timeManager: TimeManager | null = null
    private _events: GlobeEvent | null = null
    private _measurements: MeasurementsService | null = null

    constructor(viewer: Viewer) {
        this._viewer = viewer

        this.setInitialView()
    }

    get layers(): LayersManager {
        if (!this._layersManager) {
            throw new Error('LayersManager is not initialized')
        }
        return this._layersManager
    }

    get time(): TimeManager {
        if (!this._timeManager) {
            throw new Error('TimeManager is not initialized')
        }
        return this._timeManager
    }

    get events(): GlobeEvent {
        if (!this._events) {
            throw new Error('GlobeEvent is not initialized')
        }
        return this._events
    }

    get measurements(): MeasurementsService {
        if (!this._measurements) {
            throw new Error('MeasurementsService is not initialized')
        }
        return this._measurements
    }

    public async initServices(): Promise<void> {
        const { LayersManager } = await import('./layersManager')
        const { TimeManager } = await import('./time')
        const { GlobeEvent } = await import('./events')
        const { MeasurementsService } = await import('./measurements')

        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this._layersManager = new LayersManager(this._viewer)
        await this._layersManager.initializeLayers()

        this._timeManager = new TimeManager(this._viewer)
        this._events = new GlobeEvent(this._viewer)
        this._measurements = new MeasurementsService(this._viewer!, this._events)
    }

    private setInitialView(): void {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        const defaultView = getDefaultView()
        this._viewer.camera.setView({
            destination: Cartesian3.fromElements(
                defaultView.destination.x,
                defaultView.destination.y,
                defaultView.destination.z,
            ),
            orientation: defaultView.orientation,
        })
    }

    get viewer(): Viewer {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }
        return this._viewer
    }

    public flyHomeView(): void {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        const defaultView = getDefaultView()
        this._viewer.camera.flyTo({
            destination: Cartesian3.fromElements(
                defaultView.destination.x,
                defaultView.destination.y,
                defaultView.destination.z,
            ),
            orientation: defaultView.orientation,
            duration: 1.5,
        })
    }

    private getCameraFocus() {
        const { scene, camera } = this.viewer
        const ray = new Ray(camera.positionWC, camera.directionWC)
        const intersection = scene.globe.pick(ray, scene)

        if (intersection) {
            return intersection
        }
        ray.direction = camera.upWC
        const cameraIntersection = scene.globe.pick(ray, scene)
        return cameraIntersection || camera.positionWC
    }

    changeZoom(zoomChange: number) {
        const focus = this.getCameraFocus()
        const { camera } = this.viewer
        const { directionWC, positionWC } = camera
        const distance = Cartesian3.distance(focus, positionWC)
        if (distance > 15 && distance < 18331000) {
            const amount = Math.max(0.35 * distance, 50)
            const moveScratch = Cartesian3.multiplyByScalar(
                directionWC,
                zoomChange * amount,
                new Cartesian3(),
            )
            const destination = Cartesian3.add(positionWC, moveScratch, new Cartesian3())
            const orientation = {
                heading: camera.heading,
                pitch: camera.pitch,
                roll: camera.roll,
            }
            this.viewer.camera.flyTo({
                destination,
                orientation,
                duration: 0.3,
            })
        }
    }

    public setCameraNorthUp(): void {
        const { camera } = this.viewer
        const cameraFocus = this.getCameraFocus()
        const distance = Cartesian3.distance(camera.positionWC, cameraFocus)

        const surfaceNormal = Cartesian3.normalize(cameraFocus, new Cartesian3())

        const destination = Cartesian3.add(
            cameraFocus,
            Cartesian3.multiplyByScalar(surfaceNormal, distance, new Cartesian3()),
            new Cartesian3(),
        )

        const orientation = {
            heading: 0,
            pitch: -1.5708,
            roll: 0,
        }

        this.viewer.camera.flyTo({
            destination,
            orientation,
            duration: 0.5,
        })
    }

    public setView({
        destination,
        orientation,
    }: {
        destination: Cartesian3
        orientation: { heading: number; pitch: number; roll: number }
    }): void {
        this.viewer.camera.setView({
            destination,
            orientation,
        })
    }

    public getUserGlobeSettings(): void {
        const config = getItemFromLocalStorage<userGlobeSettings>('userGlobeSettings')
        if (config) {
            if (config.skyAtmosphere === true) {
                this._viewer!.scene.skyAtmosphere = new SkyAtmosphere()
            }

            if (config.terrainShadows) {
                switch (config.terrainShadows) {
                    case 'DISABLED':
                        this._viewer!.terrainShadows = ShadowMode.DISABLED
                        break
                    case 'ENABLED':
                        this._viewer!.terrainShadows = ShadowMode.ENABLED
                        break
                    case 'CAST_ONLY':
                        this._viewer!.terrainShadows = ShadowMode.CAST_ONLY
                        break
                    case 'RECEIVE_ONLY':
                        this._viewer!.terrainShadows = ShadowMode.RECEIVE_ONLY
                        break
                }
            }

            if (config.resolutionScale) {
                this._viewer!.resolutionScale = config.resolutionScale
            }
        }
    }
}

export const initGlobeInstance = async (target: HTMLElement): Promise<GlobeService> => {
    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API_KEY

    const { Viewer } = await import('@cesium/widgets')
    await import('cesium/Build/Cesium/Widgets/widgets.css')

    if (!globeInstance) {
        const viewer = new Viewer(target, getDefaultViewerSettings())
        viewer.dataSources.removeAll()
        viewer.imageryLayers.removeAll()
        viewer.scene.globe.depthTestAgainstTerrain = true
        viewer.scene.globe.dynamicAtmosphereLighting = true
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = true
        viewer.scene.globe.showGroundAtmosphere = true
        viewer.scene.globe.lightingFadeOutDistance = -100000
        viewer.scene.globe.nightFadeOutDistance = -100000

        globeInstance = new GlobeService(viewer)
        await globeInstance.initServices()

        globeInstance.getUserGlobeSettings()
        appLoaded.raiseEvent(true)
        return globeInstance
    } else {
        return globeInstance
    }
}
