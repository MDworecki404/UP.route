export type GeoJsonFile = {
    type: string
    name: string
    features: Array<{
        type: string
        properties: Record<string, unknown>
        geometry: {
            type: string
            coordinates: Array<unknown>
        }
    }>
}

export type GraphNode = {
    vertex: number[]
    edges: Array<{
        to: number[]
        weight: number
        key: string
    }>
    aStarAttrs: {
        gScore: number
        fScore: number
        prev: string | undefined
    }
}
