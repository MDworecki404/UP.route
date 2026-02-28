import { useCommonStore } from '@/stores'
import type { UpwrBuildingsMetadata } from '@/types/customs'
import { GeneratedUPRoutesSchema, type GeneratedUPRoutesType } from '@/types/localDBs'
import { upwrBrandColors } from '@/vuetify'
import type { DataSource, PolylineGraphics } from '@cesium/engine'
import { Cartesian3, Cartographic, Color, CustomDataSource, PropertyBag } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { safeParse } from 'zod'
import {
    calculateDistanceFromGeographicCoordinates,
    calculateDistanceFromPositions,
    fetchJsonFile,
    zoomToPolyline,
} from '../utils'
import { parseOptimizedGraph, type SerializedGraph } from './graphCreator'
import type { GraphNode } from './types'

const getLineStringStyle = (positions: Cartesian3[]): PolylineGraphics.ConstructorOptions => ({
    positions,
    width: 5,
    material: Color.fromCssColorString(upwrBrandColors.burgundyDark),
    clampToGround: true,
})

export class RouteFinder {
    private _routeFinderLayer: DataSource | null = null
    private _initPromise: Promise<void> | null = null
    private _carGraph: Map<string, GraphNode> | null = null
    private _footGraph: Map<string, GraphNode> | null = null
    private _bikeGraph: Map<string, GraphNode> | null = null

    constructor(private _viewer: Viewer) {
        this.registerRouteFinderLayer()

        this._initPromise = this._initializeGraphCreator()
    }

    public ready(): Promise<void> {
        return this._initPromise ?? Promise.resolve()
    }

    private async _initializeGraphCreator() {
        try {
            const carData = await fetchJsonFile<SerializedGraph>(
                new URL('/graphs/car_graph.json', import.meta.url).href,
            )
            const footData = await fetchJsonFile<SerializedGraph>(
                new URL('/graphs/foot_graph.json', import.meta.url).href,
            )
            const bikeData = await fetchJsonFile<SerializedGraph>(
                new URL('/graphs/bike_graph.json', import.meta.url).href,
            )

            this._carGraph = parseOptimizedGraph(carData)
            this._footGraph = parseOptimizedGraph(footData)
            this._bikeGraph = parseOptimizedGraph(bikeData)
        } catch (error) {
            console.error('Failed to initialize graphs:', error)
        }
    }

    private registerRouteFinderLayer() {
        if (!this._routeFinderLayer) {
            this._routeFinderLayer = new CustomDataSource('routeFinderLayer')
            this._viewer.dataSources.add(this._routeFinderLayer)
        }
    }

    private drawLineString(coordinates: number[][]) {
        this.clearRoutes()

        if (!this._routeFinderLayer) {
            console.error('RouteFinder layer is not initialized')
            return
        }

        const commonStore = useCommonStore()

        const positions = coordinates.map((coord) => Cartesian3.fromDegrees(coord[0]!, coord[1]!))
        zoomToPolyline(positions)

        const entity = this._routeFinderLayer.entities.add({
            polyline: getLineStringStyle(positions),
        })

        entity.properties = new PropertyBag({
            distance: `${(calculateDistanceFromPositions(positions) / 1000).toFixed(2)} km`,
        })

        commonStore.setRouteCreated(true)
    }

    clearRoutes() {
        if (!this._routeFinderLayer) {
            console.error('RouteFinder layer is not initialized')
            return
        }

        this._routeFinderLayer.entities.removeAll()
    }

    async b2bRoute(startBuilding: string, endBuilding: string, mode: 'car' | 'foot' | 'bike') {
        let routes: GeneratedUPRoutesType | null = null

        try {
            const data = await fetchJsonFile<GeneratedUPRoutesType>(
                `/properties/generatedRoutes/${mode}_routes_results.json`,
            )

            const parsedData = safeParse(GeneratedUPRoutesSchema, data)
            if (!parsedData.success) {
                console.error('Failed to parse generated routes data:', parsedData.error)
                return
            } else {
                routes = parsedData.data
            }
        } catch (error) {
            console.error('Failed to load generated routes:', error)
        }

        if (!routes) {
            console.error('No routes data available')
            return
        }

        const variantId = `${startBuilding}-${endBuilding}`
        const routeData = routes.find((route) => route.variantId === variantId)

        if (!routeData) {
            console.error(`No route found for variantId: ${variantId}`)
            return
        }

        this.drawLineString(routeData.route)
    }

    async p2pRoute(userPosition: number[], endPosition: number[], mode: 'car' | 'foot' | 'bike') {
        const graph =
            mode === 'car' ? this._carGraph : mode === 'foot' ? this._footGraph : this._bikeGraph

        if (!graph) {
            console.error(`Graph for mode ${mode} is not initialized`)
            return
        }

        try {
            let startKey: string | null = null
            let endKey: string | null = null
            let minStartDist = Infinity
            let minEndDist = Infinity

            graph.forEach((node, key) => {
                const vertex = node.vertex
                const distToUser = calculateDistanceFromGeographicCoordinates(userPosition, vertex)
                if (distToUser < minStartDist) {
                    minStartDist = distToUser
                    startKey = key
                }
                const distToEnd = calculateDistanceFromGeographicCoordinates(endPosition, vertex)
                if (distToEnd < minEndDist) {
                    minEndDist = distToEnd
                    endKey = key
                }
            })

            if (!startKey || !endKey) {
                console.error('Could not find suitable graph nodes for start/end')
                return
            }

            graph.forEach((node) => {
                node.aStarAttrs.gScore = Infinity
                node.aStarAttrs.fScore = Infinity
                node.aStarAttrs.prev = undefined
            })

            const closedSet = new Set<string>()
            const openSet = new Set<string>([startKey])

            const startNode = graph.get(startKey)!
            startNode.aStarAttrs.gScore = 0
            startNode.aStarAttrs.fScore = calculateDistanceFromGeographicCoordinates(
                startNode.vertex,
                graph.get(endKey)!.vertex,
            )

            while (openSet.size > 0) {
                let currentKey: string | null = null
                let minF = Infinity
                openSet.forEach((k) => {
                    const n = graph.get(k)!
                    if (n.aStarAttrs.fScore < minF) {
                        minF = n.aStarAttrs.fScore
                        currentKey = k
                    }
                })

                if (currentKey === null) break

                if (currentKey === endKey) {
                    const path: number[][] = []
                    let cur: string | undefined = endKey
                    while (cur && cur !== startKey) {
                        const n: GraphNode = graph.get(cur)!
                        path.push(n.vertex)
                        cur = n.aStarAttrs.prev
                    }
                    if (cur === startKey) path.push(graph.get(startKey)!.vertex)
                    this.drawLineString(path.reverse())
                    return
                }

                openSet.delete(currentKey)
                closedSet.add(currentKey)

                const currentNode = graph.get(currentKey)!
                for (const edge of currentNode.edges) {
                    const neighborKey = edge.to.join(',')
                    if (closedSet.has(neighborKey)) continue

                    const tentativeG = currentNode.aStarAttrs.gScore + edge.weight
                    const neighborNode = graph.get(neighborKey)
                    if (!neighborNode) continue

                    if (tentativeG < neighborNode.aStarAttrs.gScore) {
                        neighborNode.aStarAttrs.prev = currentKey
                        neighborNode.aStarAttrs.gScore = tentativeG
                        neighborNode.aStarAttrs.fScore =
                            tentativeG +
                            calculateDistanceFromGeographicCoordinates(
                                neighborNode.vertex,
                                graph.get(endKey)!.vertex,
                            )
                        openSet.add(neighborKey)
                    }
                }
            }

            console.error('No path found between the two positions')
        } catch (err) {
            console.error('p2pRoute failed:', err)
        }
    }

    async u2bRoute(userPosition: number[], endBuilding: string, mode: 'car' | 'foot' | 'bike') {
        const graph =
            mode === 'car' ? this._carGraph : mode === 'foot' ? this._footGraph : this._bikeGraph

        if (!graph) {
            console.error(`Graph for mode ${mode} is not initialized`)
            return
        }
        try {
            const buildings = await fetchJsonFile<UpwrBuildingsMetadata[]>(
                new URL('/properties/customs/upwrBuildingsMetadata.json', import.meta.url).href,
            )
            type NodeFeature = { properties: { nr_bud: string; lng: number; lat: number } }
            type NodeCollection = { features: NodeFeature[] }

            const nodesData = await fetchJsonFile<NodeCollection>(
                new URL('/properties/beginningNodes.json', import.meta.url).href,
            )
            const node = nodesData.features.find((f) => f.properties.nr_bud === endBuilding)

            let destLonLat: number[] | null = null
            if (node) {
                destLonLat = [node.properties.lng, node.properties.lat]
            }

            if (!destLonLat) {
                const building = buildings.find((b) => b.buildingNum === endBuilding)
                if (!building || !building.view || !building.view.destination) {
                    console.error(
                        `Building metadata or node for ${endBuilding} not found, cannot compute destination`,
                    )
                    return
                }
                const destCart = Cartesian3.fromElements(
                    building.view.destination.x,
                    building.view.destination.y,
                    building.view.destination.z,
                )
                const destCarto = Cartographic.fromCartesian(destCart)
                destLonLat = [
                    destCarto.longitude * (180 / Math.PI),
                    destCarto.latitude * (180 / Math.PI),
                ]
            }

            let startKey: string | null = null
            let endKey: string | null = null
            let minStartDist = Infinity
            let minEndDist = Infinity

            graph.forEach((node, key) => {
                const vertex = node.vertex
                const distToUser = calculateDistanceFromGeographicCoordinates(userPosition, vertex)
                if (distToUser < minStartDist) {
                    minStartDist = distToUser
                    startKey = key
                }

                const distToDest = calculateDistanceFromGeographicCoordinates(destLonLat, vertex)
                if (distToDest < minEndDist) {
                    minEndDist = distToDest
                    endKey = key
                }
            })

            if (!startKey || !endKey) {
                console.error('Could not find suitable graph nodes for start/end')
                return
            }

            graph.forEach((node) => {
                node.aStarAttrs.gScore = Infinity
                node.aStarAttrs.fScore = Infinity
                node.aStarAttrs.prev = undefined
            })

            const closedSet = new Set<string>()
            const openSet = new Set<string>([startKey])

            const startNode = graph.get(startKey)!
            startNode.aStarAttrs.gScore = 0
            startNode.aStarAttrs.fScore = calculateDistanceFromGeographicCoordinates(
                startNode.vertex,
                graph.get(endKey)!.vertex,
            )

            while (openSet.size > 0) {
                let currentKey: string | null = null
                let minF = Infinity
                openSet.forEach((k) => {
                    const n = graph.get(k)!
                    if (n.aStarAttrs.fScore < minF) {
                        minF = n.aStarAttrs.fScore
                        currentKey = k
                    }
                })

                if (currentKey === null) break

                if (currentKey === endKey) {
                    const path: number[][] = []
                    let cur: string | undefined = endKey
                    while (cur && cur !== startKey) {
                        const n: GraphNode = graph.get(cur)!
                        path.push(n.vertex)
                        cur = n.aStarAttrs.prev
                    }
                    if (cur === startKey) path.push(graph.get(startKey)!.vertex)
                    this.drawLineString(path.reverse())
                    return
                }

                openSet.delete(currentKey)
                closedSet.add(currentKey)

                const currentNode = graph.get(currentKey)!
                for (const edge of currentNode.edges) {
                    const neighborKey = edge.to.join(',')
                    if (closedSet.has(neighborKey)) continue

                    const tentativeG = currentNode.aStarAttrs.gScore + edge.weight
                    const neighborNode = graph.get(neighborKey)
                    if (!neighborNode) continue

                    if (tentativeG < neighborNode.aStarAttrs.gScore) {
                        neighborNode.aStarAttrs.prev = currentKey
                        neighborNode.aStarAttrs.gScore = tentativeG
                        neighborNode.aStarAttrs.fScore =
                            tentativeG +
                            calculateDistanceFromGeographicCoordinates(
                                neighborNode.vertex,
                                graph.get(endKey)!.vertex,
                            )
                        openSet.add(neighborKey)
                    }
                }
            }

            console.error('No path found between user and building')
        } catch (err) {
            console.error('u2bRoute failed:', err)
        }
    }
}
