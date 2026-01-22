import type { Entity } from '@cesium/engine'
import { BoundingSphere, Cartesian3 } from '@cesium/engine'
import { globeInstance } from './globe/globe'
import { Cartographic } from '@cesium/engine'

export const fetchJsonFile = async <T>(url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch JSON file from ${url}: ${response.statusText}`)
    }

    const data: T = await response.json()
    return data
}

export const getCameraCartographicPosition = (): { lat: number; lng: number; height: number } => {
    return {
        lat: globeInstance.viewer.camera.positionCartographic.latitude * (180 / Math.PI),
        lng: globeInstance.viewer.camera.positionCartographic.longitude * (180 / Math.PI),
        height: globeInstance.viewer.camera.positionCartographic.height,
    }
}

export const getCameraOrientation = (): { heading: number; pitch: number; roll: number } => {
    return {
        heading: globeInstance.viewer.camera.heading,
        pitch: globeInstance.viewer.camera.pitch,
        roll: globeInstance.viewer.camera.roll,
    }
}

export const getCameraPositionAndOrientation = (): {
    x: number
    y: number
    z: number
    heading: number
    pitch: number
    roll: number
} => {
    return {
        x: globeInstance.viewer.camera.position.x,
        y: globeInstance.viewer.camera.position.y,
        z: globeInstance.viewer.camera.position.z,
        heading: globeInstance.viewer.camera.heading,
        pitch: globeInstance.viewer.camera.pitch,
        roll: globeInstance.viewer.camera.roll,
    }
}

export const saveItemInLocalStorage = (key: string, value: unknown): void => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const getItemFromLocalStorage = <T>(key: string): T | null => {
    const item = localStorage.getItem(key)
    if (item) {
        return JSON.parse(item) as T
    }
    return null
}

export const removeItemFromLocalStorage = (key: string): void => {
    localStorage.removeItem(key)
}

export const getAllPositionsFromEntities = (entities: Entity[]): Cartesian3[] => {
    const positions: Cartesian3[] = []
    const currentTime = globeInstance.viewer.clock.currentTime

    entities.forEach((entity) => {
        if (entity.position) {
            const position = entity.position.getValue(currentTime)
            if (position) {
                positions.push(position)
            }
        }
        if (entity.wall) {
            const wallPositions = entity.wall.positions?.getValue(currentTime)
            if (wallPositions) {
                positions.push(...wallPositions)
            }
        }
        if (entity.polyline) {
            const polylinePositions = entity.polyline.positions?.getValue(currentTime)
            if (polylinePositions) {
                positions.push(...polylinePositions)
            }
        }
        if (entity.polygon) {
            const hierarchy = entity.polygon.hierarchy?.getValue(currentTime)
            if (hierarchy) {
                if (Array.isArray(hierarchy)) {
                    positions.push(...hierarchy)
                } else {
                    positions.push(...hierarchy.positions)
                }
            }
        }
        if (entity.rectangle) {
            const rectanglePositions = entity.rectangle.coordinates?.getValue(currentTime)
            if (rectanglePositions) {
                positions.push(...rectanglePositions)
            }
        }
    })

    return positions
}

export const zoomToLayerById = (layerId: string): void => {
    const layer = globeInstance.layers.layers.get(layerId)
    if (layer && (layer.classType === '3dTiles' || layer.classType === 'czml')) {
        let extent
        if (layer.classType === '3dTiles') {
            const tileset = layer._layer
            if (tileset) {
                extent = tileset.boundingSphere
            }
        } else if (layer.classType === 'czml') {
            const czmlDataSource = layer._layer
            if (czmlDataSource) {
                const entities = czmlDataSource.entities.values
                const positions: Cartesian3[] = []

                const czmlPositions = getAllPositionsFromEntities(entities)
                positions.push(...czmlPositions)

                if (positions.length > 0) {
                    extent = BoundingSphere.fromPoints(positions)
                }
            }
        }
        if (extent) {
            globeInstance.viewer.camera.flyToBoundingSphere(extent, {
                duration: 1.5,
            })
        }
    }
}

export const calculateDistanceFromPositions = (positions: Cartesian3[]): number => {
    let totalDistance = 0
    for (let i = 1; i < positions.length; i++) {
        totalDistance += Cartesian3.distance(positions[i - 1]!, positions[i]!)
    }
    return totalDistance
}

export const calculateAreaFromPositions = (positions: Cartesian3[]): number => {
    if (positions.length < 3) return 0

    let nx = 0
    let ny = 0
    let nz = 0
    for (let i = 0; i < positions.length; i++) {
        const j = (i + 1) % positions.length
        const xi = positions[i]!.x,
            yi = positions[i]!.y,
            zi = positions[i]!.z
        const xj = positions[j]!.x,
            yj = positions[j]!.y,
            zj = positions[j]!.z
        nx += (yi - yj) * (zi + zj)
        ny += (zi - zj) * (xi + xj)
        nz += (xi - xj) * (yi + yj)
    }
    const normal = new Cartesian3(nx, ny, nz)
    const normalMag = Cartesian3.magnitude(normal)
    if (normalMag === 0) return 0
    const nHat = new Cartesian3(normal.x / normalMag, normal.y / normalMag, normal.z / normalMag)

    const arbitrary = Math.abs(nHat.x) > 0.9 ? new Cartesian3(0, 1, 0) : new Cartesian3(1, 0, 0)
    const u = Cartesian3.cross(arbitrary, nHat, new Cartesian3(0, 0, 0))
    Cartesian3.normalize(u, u)
    const v = Cartesian3.cross(nHat, u, new Cartesian3(0, 0, 0))

    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < positions.length; i++) {
        xs.push(Cartesian3.dot(positions[i]!, u))
        ys.push(Cartesian3.dot(positions[i]!, v))
    }

    let area2 = 0
    for (let i = 0; i < positions.length; i++) {
        const j = (i + 1) % positions.length
        area2 += xs[i]! * ys[j]! - xs[j]! * ys[i]!
    }

    return Math.abs(area2) * 0.5
}

export const calculateHeihtDifference = (positions: Cartesian3[]): number => {
    if (positions.length !== 2) return 0
    const carto1 = Cartographic.fromCartesian(positions[0]!)
    const carto2 = Cartographic.fromCartesian(positions[1]!)
    return Math.abs(carto2.height - carto1.height)
}
