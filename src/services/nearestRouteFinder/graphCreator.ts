import { calculateDistanceFromGeographicCoordinates } from '../utils'
import type { GeoJsonFile, GraphNode } from './types'

export class GraphCreator {
    constructor() {}

    private getUniqueNodes(network: GeoJsonFile): Map<string, number[]> {
        const nodes = new Map<string, number[]>()

        network.features.forEach((feature) => {
            let points: number[][] = []

            if (feature.geometry.type === 'LineString') {
                points = feature.geometry.coordinates as number[][]
            } else if (feature.geometry.type === 'MultiLineString') {
                points = (feature.geometry.coordinates as number[][][]).flat()
            }

            points.forEach((coord: number[]) => {
                const key = coord.join(',')
                if (!nodes.has(key)) {
                    nodes.set(key, [coord[0]!, coord[1]!])
                }
            })
        })
        return nodes
    }

    public buildGraph(network: GeoJsonFile): Map<string, GraphNode> {
        const nodes = this.getUniqueNodes(network)
        const nodeMap = new Map<string, GraphNode>()

        nodes.forEach((vertex, key) => {
            const nodeObject: GraphNode = {
                vertex: vertex,
                edges: [],
                aStarAttrs: {
                    fScore: Infinity,
                    gScore: Infinity,
                    prev: undefined,
                },
            }
            nodeMap.set(key, nodeObject)
        })

        network.features.forEach((feature) => {
            let lines: number[][][] = []
            if (feature.geometry.type === 'LineString') {
                lines = [feature.geometry.coordinates as number[][]]
            } else if (feature.geometry.type === 'MultiLineString') {
                lines = feature.geometry.coordinates as number[][][]
            }

            const rawOneway = feature.properties && feature.properties.oneway
            const oneway = rawOneway !== undefined && rawOneway !== null ? String(rawOneway) : 'B'

            lines.forEach((line) => {
                for (let i = 0; i < line.length - 1; i++) {
                    const from = line[i]
                    const to = line[i + 1]
                    if (!from || !to) continue
                    const weight = calculateDistanceFromGeographicCoordinates(from, to)
                    const fromKey = from.join(',')
                    const toKey = to.join(',')
                    const fromNode = nodeMap.get(fromKey)
                    const toNode = nodeMap.get(toKey)

                    if (oneway === 'F') {
                        fromNode?.edges.push({ to: to, weight: weight })
                    } else {
                        fromNode?.edges.push({ to: to, weight: weight })
                        toNode?.edges.push({ to: from, weight: weight })
                    }
                }
            })
        })

        return nodeMap
    }
}
