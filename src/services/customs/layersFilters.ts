import type { UpwrBuildingsMetadataArray } from '@/types/customs'
import { Cesium3DTileStyle } from '@cesium/engine'
import { globeInstance } from '../globe/globe'
import { fetchJsonFile } from '../utils'

export type FilterIds = 'upwrLOD1Buildings'

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

const LayersFilters: Record<FilterIds, () => Promise<void>> = {
    upwrLOD1Buildings: () => upwrLoD1Filter('upwrLOD1Buildings'),
}

export const applyLayerFilter = async (filterId: string) => {
    const filterFunction = LayersFilters[filterId as FilterIds]
    if (filterFunction) {
        await filterFunction()
    }
}
