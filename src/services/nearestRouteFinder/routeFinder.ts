import type { DataSource } from '@cesium/engine'
import { CustomDataSource } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { fetchJsonFile } from '../utils'
import { safeParse } from 'zod'
import { GeneratedUPRoutesSchema, type GeneratedUPRoutesType } from '@/types/localDBs'
import { Cartesian3 } from '@cesium/engine'
import { Color } from '@cesium/engine'
import { upwrBrandColors } from '@/vuetify'
import type { PolylineGraphics } from '@cesium/engine'

const getLineStringStyle = (positions: Cartesian3[]): PolylineGraphics.ConstructorOptions => ({
    positions,
    width: 5,
    material: Color.fromCssColorString(upwrBrandColors.burgundyDark),
    clampToGround: true,
})

export class RouteFinder {
    private _routeFinderLayer: DataSource | null = null

    constructor(private _viewer: Viewer) {
        this.registerRouteFinderLayer()
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

        const positions = coordinates.map((coord) => Cartesian3.fromDegrees(coord[0]!, coord[1]!))

        this._routeFinderLayer.entities.add({
            polyline: getLineStringStyle(positions),
        })
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
            const data = await fetchJsonFile(
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
}
