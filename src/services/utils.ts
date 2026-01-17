import { BoundingSphere } from '@cesium/engine'
import { globeInstance } from './globe/globe'
import type { Cartesian3 } from '@cesium/engine'
import type { Entity } from '@cesium/engine'

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
