import type { GraphNode } from './types'

export interface SerializedNode {
    vertex: number[]
    edges: { to: number[]; weight: number }[]
}

export type SerializedGraph = Record<string, SerializedNode>

export function parseOptimizedGraph(data: SerializedGraph): Map<string, GraphNode> {
    const graphMap = new Map<string, GraphNode>()

    for (const key in data) {
        const node = data[key]!
        graphMap.set(key, {
            vertex: node.vertex,
            edges: node.edges.map((e) => ({ to: e.to, weight: e.weight, key: e.to.join(',') })),
            aStarAttrs: {
                fScore: Infinity,
                gScore: Infinity,
                prev: undefined,
            },
        })
    }

    return graphMap
}
