import type { UpwrBuildingsMetadataArray } from '@/types/customs'
import { Cesium3DTileStyle, ConstantProperty, BillboardGraphics } from '@cesium/engine'
import { globeInstance } from '../globe/globe'
import { fetchJsonFile } from '../utils'
import wroclawRestaurantsSvgUrl from '@/assets/layerIcons/wroclawRestaurants.svg?url'
import wroclawMuseumsSvgUrl from '@/assets/layerIcons/wroclawMuseums.svg?url'
import wroclawCafesSvgUrl from '@/assets/layerIcons/wroclawCafes.svg?url'
import wroclawPubsSvgUrl from '@/assets/layerIcons/wroclawPubs.svg?url'
import przybijPiatakaPNGUrl from '@/assets/layerIcons/przybijPiataka.png?url'
import wroclawBarsSvgUrl from '@/assets/layerIcons/wroclawBars.svg?url'
import { HeightReference } from '@cesium/engine'

const svgToCanvas = (url: string, size = 32): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject(new Error('Could not get 2d context'))
            ctx.drawImage(img, 0, 0, size, size)
            resolve(canvas)
        }
        img.onerror = reject
        img.src = url
    })
}

export type FilterIds =
    | 'upwrLOD1Buildings'
    | 'wroclawRestaurants'
    | 'wroclawMuseums'
    | 'wroclawCafes'
    | 'wroclawPubs'
    | 'wroclawBars'

const upwrLoD1Filter = async (id: FilterIds) => {
    const groupColors: Record<string, string> = {
        A: 'color("tomato")',
        B: 'color("cornflowerblue")',
        C: 'color("mediumseagreen")',
        E: 'color("orange")',
        F: 'color("mediumpurple")',
        D: 'color("hotpink")',
        DEFAULT: 'color("white")',
    }

    const layer = globeInstance.layers.layers.get(id)
    const upwrBuildingsMetaData = await fetchJsonFile<UpwrBuildingsMetadataArray>(
        '/properties/customs/upwrBuildingsMetadata.json',
    )

    if (layer?.classType !== '3dTiles' || !layer._layer) {
        return
    }

    const tileset = layer._layer

    tileset.customPopUpId = 'upwrBuildingInfoPopUp'

    const idsByPrefix: Record<string, string[]> = {}

    upwrBuildingsMetaData.forEach((item) => {
        if (!item.gmlIds || item.gmlIds.length === 0 || !item.buildingNum) return

        const prefix = item.buildingNum.charAt(0).toUpperCase()

        if (!idsByPrefix[prefix]) {
            idsByPrefix[prefix] = []
        }

        idsByPrefix[prefix].push(...item.gmlIds)
    })

    const colorConditions: [string, string][] = []

    Object.keys(idsByPrefix).forEach((prefix) => {
        const ids = idsByPrefix[prefix]
        const color = groupColors[prefix] || groupColors['DEFAULT']

        const regexPattern = ids!.join('|')

        colorConditions.push([`regExp('^(${regexPattern})$').test(\${feature['gml:id']})`, color!])
    })

    colorConditions.push(['true', groupColors['DEFAULT']!])

    const allValidIds = upwrBuildingsMetaData
        .flatMap((item) => item.gmlIds)
        .filter((id) => id && id.length > 0)
        .join('|')

    const showConditions: [string, string][] = [
        [`regExp('^(${allValidIds})$').test(\${feature['gml:id']})`, 'true'],
        ['true', 'false'],
    ]

    tileset.style = new Cesium3DTileStyle({
        show: {
            conditions: showConditions,
        },
        color: {
            conditions: colorConditions,
        },
    })
}

const wroclawRestaurantsFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== 'geojson' || !layer._layer) {
        return
    }

    const dataSource = layer._layer

    const canvas = await svgToCanvas(wroclawRestaurantsSvgUrl, 48)

    dataSource.entities.values.forEach((entity) => {
        entity.billboard = new BillboardGraphics({
            image: new ConstantProperty(canvas),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        })
    })
}

const wroclawMuseumsFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== 'geojson' || !layer._layer) {
        return
    }

    const dataSource = layer._layer

    const canvas = await svgToCanvas(wroclawMuseumsSvgUrl, 48)

    dataSource.entities.values.forEach((entity) => {
        entity.billboard = new BillboardGraphics({
            image: new ConstantProperty(canvas),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        })
    })
}

const wroclawCafesFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== 'geojson' || !layer._layer) {
        return
    }

    const dataSource = layer._layer

    const canvas = await svgToCanvas(wroclawCafesSvgUrl, 48)

    dataSource.entities.values.forEach((entity) => {
        entity.billboard = new BillboardGraphics({
            image: new ConstantProperty(canvas),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        })
    })
}

const wroclawPubsFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== 'geojson' || !layer._layer) {
        return
    }

    const dataSource = layer._layer

    const canvas = await svgToCanvas(wroclawPubsSvgUrl, 48)
    const przybijPiatakaCanvas = await svgToCanvas(przybijPiatakaPNGUrl, 48)

    dataSource.entities.values.forEach((entity) => {
        const properties = entity.properties
        const name = properties?.name?.getValue()
        const icon = name === 'Przybij Piątaka' ? przybijPiatakaCanvas : canvas

        entity.billboard = new BillboardGraphics({
            image: new ConstantProperty(icon),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        })
    })
}

const wroclawBarsFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== 'geojson' || !layer._layer) {
        return
    }

    const dataSource = layer._layer

    const canvas = await svgToCanvas(wroclawBarsSvgUrl, 48)

    dataSource.entities.values.forEach((entity) => {
        entity.billboard = new BillboardGraphics({
            image: new ConstantProperty(canvas),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        })
    })
}

const LayersFilters: Record<FilterIds, () => Promise<void>> = {
    upwrLOD1Buildings: () => upwrLoD1Filter('upwrLOD1Buildings'),
    wroclawRestaurants: () => wroclawRestaurantsFilter('wroclawRestaurants'),
    wroclawMuseums: () => wroclawMuseumsFilter('wroclawMuseums'),
    wroclawCafes: () => wroclawCafesFilter('wroclawCafes'),
    wroclawPubs: () => wroclawPubsFilter('wroclawPubs'),
    wroclawBars: () => wroclawBarsFilter('wroclawBars'),
}

export const applyLayerFilter = async (filterId: string) => {
    const filterFunction = LayersFilters[filterId as FilterIds]
    if (filterFunction) {
        await filterFunction()
    }
}
