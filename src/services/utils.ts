import { globeInstance } from './globe/globe'

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
