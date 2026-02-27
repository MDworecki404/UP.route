import type { GraphNode } from './types'

// Definiujemy interfejs dla zoptymalizowanych danych z pliku
export interface SerializedNode {
    vertex: number[]
    edges: { to: number[]; weight: number }[]
}

export type SerializedGraph = Record<string, SerializedNode>

// Funkcja zamieniająca płaski obiekt JSON z powrotem na Mapę dla A*
export function parseOptimizedGraph(data: SerializedGraph): Map<string, GraphNode> {
    const graphMap = new Map<string, GraphNode>()

    for (const [key, node] of Object.entries(data)) {
        graphMap.set(key, {
            vertex: node.vertex,
            edges: node.edges,
            // Inicjalizujemy puste stany dla A* bezpośrednio we frontendzie
            aStarAttrs: {
                fScore: Infinity,
                gScore: Infinity,
                prev: undefined,
            },
        })
    }

    return graphMap
}
