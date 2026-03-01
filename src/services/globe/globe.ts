import type { userGlobeSettings } from '@/types/utils'
import {
    Cartesian3,
    Ion,
    PostProcessStage,
    PostProcessStageComposite,
    PostProcessStageLibrary,
    Ray,
} from '@cesium/engine'
import { type Viewer } from '@cesium/widgets'
import { getDefaultView, getDefaultViewerSettings } from '../defaults'
import { appLoaded, appLoadingInfo } from '../eventBus'
import type { RouteFinder } from '../nearestRouteFinder/routeFinder'
import { getItemFromLocalStorage } from '../utils'
import type { DrawService } from './draw'
import type { GlobeEvent } from './events'
import type { FloodSim } from './floodSim'
import type { LayersManager } from './layersManager'
import type { MeasurementsService } from './measurements'
import type { ProfileManager } from './profile'
import type { TimeManager } from './time'
import type { UserPositionService } from './userPositions'
import { Sun } from '@cesium/engine'
import { Moon } from '@cesium/engine'
import { SkyAtmosphere } from '@cesium/engine'

export type DefinedShader =
    | 'none'
    | 'blackAndWhite'
    | 'nightVision'
    | 'bloom'
    | 'depthOfField'
    | 'ambientOcclusion'

export let globeInstance: GlobeService
export class GlobeService {
    private _viewer: Viewer | null = null
    private _layersManager: LayersManager | null = null
    private _timeManager: TimeManager | null = null
    private _events: GlobeEvent | null = null
    private _measurements: MeasurementsService | null = null
    private _drawService: DrawService | null = null
    private _floodSim: FloodSim | null = null
    private _profileManager: ProfileManager | null = null
    private _routeFinder: RouteFinder | null = null
    private _userPositionService: UserPositionService | null = null
    private _activeShaderStage: PostProcessStage | PostProcessStageComposite | null = null
    public definedShader: DefinedShader = 'none'
    private _dofListener: (() => void) | null = null
    public environmentEnabled: boolean = false

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

    get draw(): DrawService {
        if (!this._drawService) {
            throw new Error('DrawService is not initialized')
        }
        return this._drawService
    }

    get measurements(): MeasurementsService {
        if (!this._measurements) {
            throw new Error('MeasurementsService is not initialized')
        }
        return this._measurements
    }

    get floodSim(): FloodSim {
        if (!this._floodSim) {
            throw new Error('FloodSim is not initialized')
        }
        return this._floodSim
    }

    get profile(): ProfileManager {
        if (!this._profileManager) {
            throw new Error('ProfileManager is not initialized')
        }
        return this._profileManager
    }

    get routeFinder(): RouteFinder {
        if (!this._routeFinder) {
            throw new Error('RouteFinder is not initialized')
        }
        return this._routeFinder
    }

    get userPositionService(): UserPositionService {
        if (!this._userPositionService) {
            throw new Error('UserPositionService is not initialized')
        }
        return this._userPositionService
    }

    public async initServices(): Promise<void> {
        const { LayersManager } = await import('./layersManager')
        const { TimeManager } = await import('./time')
        const { GlobeEvent } = await import('./events')
        const { MeasurementsService } = await import('./measurements')
        const { DrawService } = await import('./draw')
        const { FloodSim } = await import('./floodSim')
        const { ProfileManager } = await import('./profile')
        const { RouteFinder } = await import('../nearestRouteFinder/routeFinder')
        const { UserPositionService } = await import('./userPositions')

        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        appLoadingInfo.raiseEvent('initalizingLayers')
        this._layersManager = new LayersManager(this._viewer)
        await this._layersManager.initializeLayers()

        appLoadingInfo.raiseEvent('initializingTools')
        this._timeManager = new TimeManager(this._viewer)
        this._events = new GlobeEvent(this._viewer)
        this._measurements = new MeasurementsService(this._viewer!, this._events)
        this._drawService = new DrawService(this._viewer!, this._events)
        this._floodSim = new FloodSim(this._viewer!, this._layersManager, this._events)
        this._profileManager = new ProfileManager(this._viewer!, this._events)
        this._routeFinder = new RouteFinder(this._viewer!)
        await this._routeFinder.ready()
        this._userPositionService = new UserPositionService(this._viewer!)
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
            if (config.resolutionScale) {
                this._viewer!.resolutionScale = config.resolutionScale
            }

            if (config.selectedShader) {
                this.setDefinedShaders(config.selectedShader)
            }

            if (config.skyAtmosphere) {
                this.enableEnvironment()
            } else {
                this.disableEnvironment()
            }
        }
    }

    public setDefinedShaders(shader: DefinedShader): void {
        const { postProcessStages, camera, postRender } = this._viewer!.scene

        if (this._activeShaderStage) {
            postProcessStages.remove(this._activeShaderStage)
            this._activeShaderStage = null
        }

        if (this._dofListener) {
            postRender.removeEventListener(this._dofListener)
            this._dofListener = null
        }

        postProcessStages.bloom.enabled = false
        postProcessStages.ambientOcclusion.enabled = false

        this.definedShader = shader

        switch (shader) {
            case 'none':
                break

            case 'blackAndWhite':
                this._activeShaderStage = postProcessStages.add(
                    PostProcessStageLibrary.createBlackAndWhiteStage(),
                )
                break

            case 'nightVision':
                this._activeShaderStage = postProcessStages.add(
                    PostProcessStageLibrary.createNightVisionStage(),
                )
                break

            case 'bloom':
                postProcessStages.bloom.enabled = true
                postProcessStages.bloom.uniforms.contrast = 128.0
                postProcessStages.bloom.uniforms.brightness = -0.6
                postProcessStages.bloom.uniforms.glowOnly = false
                postProcessStages.bloom.uniforms.delta = 1.0
                postProcessStages.bloom.uniforms.sigma = 2.0
                postProcessStages.bloom.uniforms.stepSize = 1.0
                break

            case 'depthOfField': {
                const stage = PostProcessStageLibrary.createDepthOfFieldStage()

                stage.uniforms.delta = 1.0
                stage.uniforms.sigma = 1.0
                stage.uniforms.stepSize = 1.0

                this._activeShaderStage = postProcessStages.add(stage)

                this._dofListener = () => {
                    const focus = this.getCameraFocus()
                    const distance = Cartesian3.distance(camera.positionWC, focus)
                    stage.uniforms.focalDistance = Math.max(distance, 10.0)
                }

                postRender.addEventListener(this._dofListener)
                break
            }

            case 'ambientOcclusion':
                postProcessStages.ambientOcclusion.enabled = true
                postProcessStages.ambientOcclusion.uniforms.intensity = 0.6
                postProcessStages.ambientOcclusion.uniforms.ambientOcclusionOnly = false

                postProcessStages.ambientOcclusion.uniforms.bias = 0.1

                postProcessStages.ambientOcclusion.uniforms.lengthCap = 0.02

                postProcessStages.ambientOcclusion.uniforms.stepSize = 1.0
                break
        }
    }

    public enableEnvironment(): void {
        const scene = this._viewer!.scene
        this.environmentEnabled = true

        scene.globe.enableLighting = true

        scene.globe.dynamicAtmosphereLighting = true
        scene.globe.dynamicAtmosphereLightingFromSun = true

        if (!scene.sun) {
            scene.sun = new Sun()
        }
        scene.sun.show = true

        if (!scene.moon) {
            scene.moon = new Moon()
        }
        scene.moon.show = true

        if (!scene.skyAtmosphere) {
            scene.skyAtmosphere = new SkyAtmosphere()
        }
        scene.skyAtmosphere.show = true

        if (scene.skyBox) {
            scene.skyBox.show = true
        }
    }

    public disableEnvironment(): void {
        const scene = this._viewer!.scene
        this.environmentEnabled = false

        scene.globe.enableLighting = false

        scene.globe.dynamicAtmosphereLighting = false
        scene.globe.dynamicAtmosphereLightingFromSun = false

        if (scene.sun) scene.sun.show = false
        if (scene.moon) scene.moon.show = false
        if (scene.skyAtmosphere) scene.skyAtmosphere.show = false
        if (scene.skyBox) scene.skyBox.show = false
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
        viewer.shadowMap.maximumDistance = 2500
        viewer.shadowMap.fadingEnabled = true
        viewer.shadowMap.size = 4096

        globeInstance = new GlobeService(viewer)
        await globeInstance.initServices()

        globeInstance.getUserGlobeSettings()
        appLoadingInfo.raiseEvent('appLoaded')
        appLoaded.raiseEvent(true)
        return globeInstance
    } else {
        return globeInstance
    }
}
