import type { GraphNode } from './types'

export interface SerializedNode {
    vertex: number[]
    edges: { to: number[]; weight: number }[]
}

export type SerializedGraph = Record<string, SerializedNode>

export function parseOptimizedGraph(data: SerializedGraph): Map<string, GraphNode> {
    const graphMap = new Map<string, GraphNode>()

    for (const [key, node] of Object.entries(data)) {
        graphMap.set(key, {
            vertex: node.vertex,
            edges: node.edges,
            aStarAttrs: {
                fScore: Infinity,
                gScore: Infinity,
                prev: undefined,
            },
        })
    }

    return graphMap
}
