import { ShadowMode, Terrain, WebMercatorProjection } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'

export const getDefaultViewerSettings = (): Viewer.ConstructorOptions => {
    return {
        animation: false,
        contextOptions: {
            webgl: {
                preserveDrawingBuffer: true,
            },
        },
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        mapProjection: new WebMercatorProjection(),
        baseLayer: undefined,
        clockViewModel: undefined,
        projectionPicker: false,
        scene3DOnly: true,
        terrain: Terrain.fromWorldTerrain(),
        skyBox: false,
        skyAtmosphere: false,
        shadows: false,
        shouldAnimate: false,
        terrainShadows: ShadowMode.DISABLED,
    }
}

export const getDefaultView = () => {
    return {
        destination: {
            x: 3836539.6043590815,
            y: 1177074.7885446213,
            z: 4941506.153548925,
        },
        orientation: {
            heading: 0.8406217924200536,
            pitch: -0.4624461944848104,
            roll: 0.0000016676494114520324,
        },
    }
}
