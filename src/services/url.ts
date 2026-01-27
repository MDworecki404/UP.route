import { Cartesian3 } from '@cesium/engine'
import { globeInstance } from './globe/globe'
import { getCameraPositionAndOrientation } from './utils'

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
}

///////////////////////////////////
// ? MARK: CAMERA PARAMS
///////////////////////////////////

const setCameraParamsToUrl = () => {
    const camera = getCameraPositionAndOrientation()
    const cameraConfig: UrlParams['camera'] = {
        destination: {
            x: camera.x,
            y: camera.y,
            z: camera.z,
        },
        orientation: {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
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
// ? MARK: URL PREPARE & APPLY
///////////////////////////////////

export const prepareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname + '?'
    const urlParams = new URLSearchParams()

    const cameraParams = setCameraParamsToUrl()
    urlParams.set('camera', JSON.stringify(cameraParams))

    return baseUrl + urlParams.toString()
}

export const applyUrlParams = () => {
    const params = new URLSearchParams(window.location.search)

    setCameraViewFromParams(params)
}
