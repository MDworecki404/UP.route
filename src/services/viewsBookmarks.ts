import type { BookmarkElements, ViewsBookmarks } from '@/types/viewsBookmarks'
import { getCameraPositionAndOrientation } from './utils'
import { globeInstance } from './globe/globe'
import { Cartesian3 } from '@cesium/engine'
import { ShadowMode } from '@cesium/engine'
import { JulianDate } from '@cesium/engine'
import { useNotifyStore, useToolsStore } from '@/stores'
import type { ToolsKeys } from './tools'

export const getBookmarks = (): ViewsBookmarks => {
    const bookmarksString = localStorage.getItem('viewsBookmarks')
    if (bookmarksString) {
        try {
            const bookmarks = JSON.parse(bookmarksString)
            return bookmarks
        } catch (error) {
            console.error('Error parsing bookmarks from localStorage:', error)
            return { bookmarks: [] }
        }
    } else {
        return { bookmarks: [] }
    }
}

export const getAcutalCameraPosition =
    (): ViewsBookmarks['bookmarks'][number]['cameraPosition'] => {
        const cameraPosition = getCameraPositionAndOrientation()
        return {
            destination: {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z,
            },
            orientation: {
                heading: cameraPosition.heading,
                pitch: cameraPosition.pitch,
                roll: cameraPosition.roll,
            },
        }
    }

export const getEnabledLayers = (): string[] => {
    const layers: string[] = []
    globeInstance.layers.layers.forEach((layer) => {
        if (layer.isVisible()) {
            layers.push(layer.config.id!)
        }
    })
    return layers
}

export const enableLayers = (layers: string[]) => {
    if (!layers || layers.length === 0) {
        return
    }

    globeInstance.layers.layers.forEach((layer) => {
        if (layers.includes(layer.config.id!)) {
            if (!layer.isVisible()) {
                layer.setVisibility(true)
            }
        } else {
            if (layer.isVisible()) {
                layer.setVisibility(false)
            }
        }
    })
}

export const getActualShadowsSettings =
    (): ViewsBookmarks['bookmarks'][number]['shadowsSettings'] => {
        const settings: ViewsBookmarks['bookmarks'][number]['shadowsSettings'] = {
            objectsShadows: globeInstance.viewer.shadows,
            terrainShadows:
                globeInstance.viewer.terrainShadows !== ShadowMode.DISABLED ? true : false,
            smoothShadows: globeInstance.viewer.shadowMap.softShadows,
            allTimeInMs: JulianDate.toDate(globeInstance.viewer.clock.currentTime).getTime(),
            timeOfDay: globeInstance.viewer.clock.currentTime.secondsOfDay,
        }
        return settings
    }

export const setupShadowsSettings = (
    shadowsSettings: ViewsBookmarks['bookmarks'][number]['shadowsSettings'],
) => {
    if (!shadowsSettings) {
        return
    }

    globeInstance.viewer.shadows = shadowsSettings.objectsShadows
    globeInstance.viewer.terrainShadows = shadowsSettings.terrainShadows
        ? ShadowMode.ENABLED
        : ShadowMode.DISABLED
    globeInstance.viewer.shadowMap.softShadows = shadowsSettings.smoothShadows

    const time = JulianDate.fromDate(new Date(shadowsSettings.allTimeInMs))
    time.secondsOfDay = shadowsSettings.timeOfDay
    globeInstance.viewer.clock.currentTime = time
}

export const getOpenedObjectInfos = (): ViewsBookmarks['bookmarks'][number]['objectInfo'] => {
    const openedObjectInfos: ViewsBookmarks['bookmarks'][number]['objectInfo'] = []

    useToolsStore().activeTools.forEach((tool) => {
        if (tool.id === 'objectInfo') {
            const objectInfoTool = tool
            openedObjectInfos.push({
                id: objectInfoTool.id,
                props: objectInfoTool.props,
                width: objectInfoTool.width,
                icon: objectInfoTool.icon,
            })
        }
        if (tool.id === 'upwrBuildingInfoPopUp') {
            const buildingInfoTool = tool
            openedObjectInfos.push({
                id: buildingInfoTool.id,
                props: buildingInfoTool.props,
                width: buildingInfoTool.width,
                icon: buildingInfoTool.icon,
            })
        }
    })

    return openedObjectInfos
}

export const openObjectInfos = async (
    objectInfos: ViewsBookmarks['bookmarks'][number]['objectInfo'],
) => {
    if (!objectInfos || objectInfos.length === 0) {
        return
    }

    const useTools = useToolsStore()

    const { performAction } = await import('./actions')

    objectInfos.forEach((objectInfo) => {
        if (useTools.activeTools.has(objectInfo.id)) {
            useTools.closeTool(objectInfo.id)
        }

        performAction({
            actionId: 'toggleTool',
            icon: objectInfo.icon!,
            props: objectInfo.props!,
            width: objectInfo.width!,
            toolId: objectInfo.id as ToolsKeys,
        })
    })
}

export const addNewBookmark = (selectedOptions: BookmarkElements[], bookmarkName: string) => {
    console.log('Adding new bookmark with options:', selectedOptions, 'and name:', bookmarkName)

    const actualBookmarks = getBookmarks()

    const newBookmark: ViewsBookmarks['bookmarks'][number] = {
        id: crypto.randomUUID(),
        name: bookmarkName,
        cameraPosition: selectedOptions.includes('cameraPosition')
            ? getAcutalCameraPosition()
            : undefined,
        layers: selectedOptions.includes('layers') ? getEnabledLayers() : undefined,
        shadowsSettings: selectedOptions.includes('shadowsSettings')
            ? getActualShadowsSettings()
            : undefined,
        objectInfo: selectedOptions.includes('objectInfo') ? getOpenedObjectInfos() : undefined,
    }

    const updatedBookmarks = [...actualBookmarks.bookmarks, newBookmark]

    const bookmarksToStore: ViewsBookmarks = {
        bookmarks: updatedBookmarks,
    }

    localStorage.setItem('viewsBookmarks', JSON.stringify(bookmarksToStore))
}

export const deleteBookmark = (bookmarkId: string) => {
    const actualBookmarks = getBookmarks()

    const updatedBookmarks = actualBookmarks.bookmarks.filter(
        (bookmark) => bookmark.id !== bookmarkId,
    )

    const bookmarksToStore: ViewsBookmarks = {
        bookmarks: updatedBookmarks,
    }

    localStorage.setItem('viewsBookmarks', JSON.stringify(bookmarksToStore))
}

export const runBookmark = (bookmark: ViewsBookmarks['bookmarks'][number]) => {
    const { cameraPosition, layers, shadowsSettings, objectInfo } = bookmark

    console.log(bookmark)

    if (cameraPosition) {
        globeInstance.setView({
            destination: Cartesian3.fromElements(
                cameraPosition.destination.x,
                cameraPosition.destination.y,
                cameraPosition.destination.z,
            ),
            orientation: cameraPosition.orientation,
        })
    }

    if (layers) {
        enableLayers(layers)
    }

    if (shadowsSettings) {
        setupShadowsSettings(shadowsSettings)
    }

    if (objectInfo) {
        openObjectInfos(objectInfo)
    }
}

export const importBookmarkConfiguration = (
    bookmarkConfig: ViewsBookmarks['bookmarks'][number],
) => {
    const actualBookmarks = getBookmarks()

    const updatedBookmarks = [...actualBookmarks.bookmarks, bookmarkConfig]

    const bookmarksToStore: ViewsBookmarks = {
        bookmarks: updatedBookmarks,
    }

    localStorage.setItem('viewsBookmarks', JSON.stringify(bookmarksToStore))
}

export const copyBookmarkConfiguration = (bookmark: ViewsBookmarks['bookmarks'][number]) => {
    navigator.clipboard.writeText(JSON.stringify(bookmark))

    useNotifyStore().showNotify({
        msg: 'bookmarkConfigurationCopied',
        notifyType: 'success',
        notifyDuration: 2000,
        notifyIcon: 'mdi-content-copy',
        notifyWidth: 300,
    })
}
