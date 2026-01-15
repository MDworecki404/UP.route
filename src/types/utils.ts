import type { ShadowMode } from '@cesium/engine'

export type userGlobeSettings = {
    skyAtmosphere: boolean
    terrainShadows: keyof typeof ShadowMode
    resolutionScale: number
}
