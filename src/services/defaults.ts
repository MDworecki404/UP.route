import { WebMercatorProjection } from '@cesium/engine'
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
        terrainProvider: undefined,
    }
}
