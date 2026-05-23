import type { Entity } from '@cesium/engine'
import { BoundingSphere, Cartesian3, Cartographic, HeadingPitchRange } from '@cesium/engine'
import jsPDF from 'jspdf'
import type { CropperResult } from 'vue-advanced-cropper'
import { globeInstance } from './globe/globe'
import { useCommonStore, useDialogStore } from '@/stores'

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

export const _xEnv = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false
    }

    return window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)').matches
}

export const _xHook = () => {
    if (!_xEnv()) {
        return {
            arm: () => {},
            cleanup: () => {},
        }
    }

    const _tt = 3000
    const _aw = 5000
    const _b = ['Left', 'Right', 'Up', 'Down'].map((x) => 'Arrow' + x)
    const _sq: string[] = []
    const _sid: number[] = []
    const _nq = '\x02\x02\x02\x00\x01\x03\x03'.split('').map((c) => _b[c.charCodeAt(0)]!)
    let _ia = false
    let _ai: number | undefined

    const _rss = () => {
        _sq.length = 0
        _sid.forEach((t) => clearTimeout(t))
        _sid.length = 0
    }

    const _ras = () => {
        _ia = false
        _rss()
        if (_ai) {
            clearTimeout(_ai)
            _ai = undefined
        }
    }

    const arm = () => {
        if (!_xEnv()) {
            return
        }
        _ia = true
        _rss()
        if (_ai) {
            clearTimeout(_ai)
        }
        _ai = window.setTimeout(_ras, _aw)
    }

    const _hkd = (e: KeyboardEvent) => {
        if (!_ia) {
            return
        }
        if (!_b.includes(e.key)) {
            _rss()
            return
        }
        _sq.push(e.key)
        const _t = window.setTimeout(() => {
            _sq.shift()
            const _i = _sid.indexOf(_t)
            if (_i >= 0) {
                _sid.splice(_i, 1)
            }
        }, _tt)
        _sid.push(_t)
        if (_sq.length === _nq.length && _sq.every((k, i) => k === _nq[i])) {
            const commonStore = useCommonStore()
            commonStore.toggleAppInfoTestState()
            useDialogStore().closeDialog()
            _ras()
        }
    }

    document.addEventListener('keydown', _hkd)

    return {
        arm,
        cleanup: () => {
            _ras()
            document.removeEventListener('keydown', _hkd)
        },
    }
}

export const zoomToLayerById = (layerId: string): void => {
    const layer = globeInstance.layers.layers.get(layerId)
    if (
        layer &&
        (layer.classType === '3dTiles' ||
            layer.classType === 'czml' ||
            layer.classType === 'geojson')
    ) {
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
        } else if (layer.classType === 'geojson') {
            const dataSource = layer._layer
            if (dataSource) {
                const entities = dataSource.entities.values
                const positions: Cartesian3[] = []

                const geoJsonPositions = getAllPositionsFromEntities(entities)
                positions.push(...geoJsonPositions)

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

export const zoomToPolyline = (positions: Cartesian3[]): void => {
    if (positions.length === 0) return

    const boundingSphere = BoundingSphere.fromPoints(positions)
    const range = Math.max(boundingSphere.radius * 2.5, 1000)
    const offset = new HeadingPitchRange(0, -Math.PI / 2, range)
    globeInstance.viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: 1.5,
        offset,
    })
}

export const zoomToEntity = (entity: Entity): void => {
    globeInstance.viewer.flyTo(entity, {
        duration: 1.5,
    })
}

export const getPositionOfBillboardEntity = (entity: Entity): number[] => {
    if (!entity.position) {
        return []
    }
    const position = entity.position?.getValue(globeInstance.viewer.clock.currentTime)
    if (position) {
        const cartographic = Cartographic.fromCartesian(position)
        return [cartographic.longitude, cartographic.latitude]
    }
    return []
}

export const calculateDistanceFromPositions = (positions: Cartesian3[]): number => {
    let totalDistance = 0
    for (let i = 1; i < positions.length; i++) {
        totalDistance += Cartesian3.distance(positions[i - 1]!, positions[i]!)
    }
    return totalDistance
}

export const calculateDistanceFromGeographicCoordinates = (
    coord1: number[],
    coord2: number[],
): number => {
    const carto1 = Cartographic.fromDegrees(coord1[0]!, coord1[1]!)
    const carto2 = Cartographic.fromDegrees(coord2[0]!, coord2[1]!)
    return Cartesian3.distance(
        Cartesian3.fromRadians(carto1.longitude, carto1.latitude),
        Cartesian3.fromRadians(carto2.longitude, carto2.latitude),
    )
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

export const addWaterMarkToScreenshot = async (
    cropperResult: CropperResult,
): Promise<string | null> => {
    const { canvas } = cropperResult

    if (!canvas) {
        console.error('Błąd: Brak canvasu w wyniku croppera')
        return null
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return null
    }

    const watermarkUrl = '/watermark_project.png'

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'Anonymous'
            img.onload = () => resolve(img)
            img.onerror = (e) => reject(e)
            img.src = src
        })
    }

    try {
        const logo = await loadImage(watermarkUrl)

        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        const ORIGINAL_W = 465
        const ORIGINAL_H = 100

        const maxWidth = canvasWidth * 0.25
        const maxHeight = canvasHeight * 0.12

        const scale = Math.min(maxWidth / ORIGINAL_W, maxHeight / ORIGINAL_H, 1)

        const drawWidth = Math.round(ORIGINAL_W * scale)
        const drawHeight = Math.round(ORIGINAL_H * scale)

        const margin = 0

        const x = Math.max(0, canvasWidth - drawWidth - margin)
        const y = Math.max(0, canvasHeight - drawHeight - margin)

        ctx.drawImage(logo, x, y, drawWidth, drawHeight)

        return canvas.toDataURL('image/png')
    } catch (error) {
        console.error('Nie udało się załadować znaku wodnego:', error)
        return canvas.toDataURL('image/png')
    }
}

export const imageToPdf = (imageDataUrl: string, filename: string): void => {
    const tempPdf = new jsPDF()
    const imgProps = tempPdf.getImageProperties(imageDataUrl)

    const pdf = new jsPDF({
        orientation: imgProps.width > imgProps.height ? 'l' : 'p',
        unit: 'px',
        format: [imgProps.width, imgProps.height],
    })

    pdf.addImage(imageDataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height)

    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    pdf.save(finalFilename)
}

export const imageToJPG = (imageDataUrl: string, filename: string): void => {
    const img = new Image()

    img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(img, 0, 0)

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 1.0)

        const link = document.createElement('a')
        link.href = jpegDataUrl

        const finalFilename = filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`

        link.download = finalFilename

        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
    }

    img.src = imageDataUrl
}
