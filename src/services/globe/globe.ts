import type { userGlobeSettings } from '@/types/utils'
import { Cartesian3, Ion, ShadowMode, SkyAtmosphere } from '@cesium/engine'
import { type Viewer } from '@cesium/widgets'
import { getDefaultView, getDefaultViewerSettings } from '../defaults'
import { appLoaded } from '../eventBus'
import { getItemFromLocalStorage } from '../utils'
import type { LayersManager } from './layersManager'
import type { TimeManager } from './time'
import { Ray } from '@cesium/engine'

export let globeInstance: GlobeService
export class GlobeService {
    private _viewer: Viewer | null = null
    private _layersManager: LayersManager | null = null
    private _timeManager: TimeManager | null = null

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

    public async initServices(): Promise<void> {
        const { LayersManager } = await import('./layersManager')
        const { TimeManager } = await import('./time')

        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this._layersManager = new LayersManager(this._viewer)
        await this._layersManager.initializeLayers()

        this._timeManager = new TimeManager(this._viewer)
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

        globeInstance = new GlobeService(viewer)
        await globeInstance.initServices()

        globeInstance.getUserGlobeSettings()
        appLoaded.raiseEvent(true)
        return globeInstance
    } else {
        return globeInstance
    }
}
