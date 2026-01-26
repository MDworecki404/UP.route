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
            x: 3838754.754100896,
            y: 1179560.3644217171,
            z: 4944745.01843994,
        },
        orientation: {
            heading: 1.7763568394002505e-15,
            pitch: -1.5500001117734095,
            roll: 0,
        },
    }
}
