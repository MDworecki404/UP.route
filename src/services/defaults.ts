import { ShadowMode, Terrain, WebMercatorProjection } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'

export const getDefaultViewerSettings = (): Viewer.ConstructorOptions => {
    return {
        animation: false,
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
            x: 3841338.2348480183,
            y: 1178907.9723167613,
            z: 4941123.403761086,
        },
        orientation: {
            heading: 0.22980001877882295,
            pitch: -0.8007149279440147,
            roll: 6.283156544952853,
        },
    }
}

export const getDefaultView = () => {
    return {
        destination: {
            x: 3841338.2348480183,
            y: 1178907.9723167613,
            z: 4941123.403761086,
        },
        orientation: {
            heading: 0.22980001877882295,
            pitch: -0.8007149279440147,
            roll: 6.283156544952853,
        },
    }
}
