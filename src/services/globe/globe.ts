import type { userGlobeSettings } from '@/types/utils'
import { Cartesian3, Ion, ShadowMode, SkyAtmosphere } from '@cesium/engine'
import { type Viewer } from '@cesium/widgets'
import { getDefaultView, getDefaultViewerSettings } from '../defaults'
import { appLoaded } from '../eventBus'
import { getItemFromLocalStorage } from '../utils'
import type { LayersManager } from './layersManager'

export let globeInstance: GlobeService
export class GlobeService {
    private _viewer: Viewer | null = null
    private _layersManager: LayersManager | null = null

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

    public async initServices(): Promise<void> {
        const { LayersManager } = await import('./layersManager')

        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this._layersManager = new LayersManager(this._viewer)
        await this._layersManager.initializeLayers()
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
