import type { DefinedShader } from '@/services/globe/globe'
import z from 'zod'

export type userGlobeSettings = {
    resolutionScale: number
    selectedShader: DefinedShader
    skyAtmosphere: boolean
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
