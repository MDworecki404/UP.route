import type { ShadowMode } from '@cesium/engine'
import z from 'zod'

export type userGlobeSettings = {
    skyAtmosphere: boolean
    terrainShadows: keyof typeof ShadowMode
    resolutionScale: number
}

export const ViewConfigSchema = z.object({
    destination: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
    }),
    orientation: z.object({
        heading: z.number(),
        pitch: z.number(),
        roll: z.number(),
    }),
})
