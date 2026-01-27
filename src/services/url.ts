import { Cartesian3 } from '@cesium/engine'
import LZstring from 'lz-string'
import { globeInstance } from './globe/globe'
import { getCameraPositionAndOrientation } from './utils'
import type { ToolsMap } from './tools'

///////////////////////////////////
// ? MARK: URL TYPE
///////////////////////////////////

type UrlParams = {
    camera?: {
        destination: {
            x: number
            y: number
            z: number
        }
        orientation: {
            heading: number
            pitch: number
            roll: number
        }
    }
    tools?: Array<ToolsMap>
}

///////////////////////////////////
// ? MARK: CAMERA PARAMS
///////////////////////////////////

const setCameraParamsToUrl = () => {
    const camera = getCameraPositionAndOrientation()
    const cameraConfig: UrlParams['camera'] = {
        destination: {
            x: Number(camera.x.toFixed(2)),
            y: Number(camera.y.toFixed(2)),
            z: Number(camera.z.toFixed(2)),
        },
        orientation: {
            heading: Number(camera.heading.toFixed(2)),
            pitch: Number(camera.pitch.toFixed(2)),
            roll: Number(camera.roll.toFixed(2)),
        },
    }

    return cameraConfig
}

const setCameraViewFromParams = (params: URLSearchParams) => {
    const cameraParam = params.get('camera')
    if (cameraParam) {
        try {
            const camera: UrlParams['camera'] = JSON.parse(cameraParam)
            console.log('Parsed camera from URL:', camera)
            if (camera?.destination && camera?.orientation) {
                globeInstance.setView({
                    destination: Cartesian3.fromElements(
                        camera.destination.x,
                        camera.destination.y,
                        camera.destination.z,
                    ),
                    orientation: camera.orientation,
                })
            }
        } catch (e) {
            console.warn('Failed to parse camera parameters from URL', e)
        }
    }
}

///////////////////////////////////
// ? MARK: TOOLS PARAMS
///////////////////////////////////

const setToolParamsToUrl = async () => {
    const { useToolsStore } = await import('@/stores/index')
    const { activeToolsArray } = useToolsStore()

    const arrrayToUrl = activeToolsArray
        .filter((tool) => tool.id !== 'shareMap')
        .map((tool) => {
            return {
                id: tool.id,
                props: tool.props || {},
                width: tool.width,
                isMimized: tool.isMinimized,
                fullscreen: tool.fullscreen,
                icon: tool.icon,
            }
        })

    return arrrayToUrl
}

const openToolsFromParams = async (params: URLSearchParams) => {
    const toolsParam = params.get('tools')
    if (toolsParam) {
        try {
            const tools: UrlParams['tools'] = JSON.parse(toolsParam)
            console.log('Parsed tools from URL:', tools)
            if (tools && tools.length > 0) {
                tools.reverse()
                const { performAction } = await import('./actions')
                for (const tool of tools) {
                    performAction({
                        actionId: 'toggleTool',
                        toolId: tool.id,
                        props: tool.props,
                        width: tool.width,
                        icon: tool.icon!,
                    })
                }
            }
        } catch (e) {
            console.warn('Failed to parse tools parameters from URL', e)
        }
    }
}

///////////////////////////////////
// ? MARK: URL PREPARE & APPLY
///////////////////////////////////

export const prepareUrl = async () => {
    const baseUrl = window.location.origin + window.location.pathname + '?'
    const urlParams = new URLSearchParams()

    const cameraParams = setCameraParamsToUrl()
    urlParams.set('camera', JSON.stringify(cameraParams))

    const toolsParams = await setToolParamsToUrl()
    urlParams.set('tools', JSON.stringify(toolsParams))

    const compressedParams = LZstring.compressToEncodedURIComponent(urlParams.toString())

    return baseUrl + compressedParams
}

export const applyUrlParams = () => {
    const params = new URLSearchParams(window.location.search)
    const decompressed = LZstring.decompressFromEncodedURIComponent(params.toString())
    if (!decompressed) {
        return
    }
    const decompressedParams = new URLSearchParams(decompressed)

    setCameraViewFromParams(decompressedParams)
    openToolsFromParams(decompressedParams)
}
