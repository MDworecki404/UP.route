import { useCommonStore } from '@/stores'
import { fetchJsonFile } from '../utils'
import type { Presentations } from './types'
import { globeInstance } from '../globe/globe'
import { Cartesian3 } from 'cesium'

export const triggerPresentation = async (presentationId: string) => {
    const commonStore = useCommonStore()

    const presentations = await fetchJsonFile<Presentations>('/properties/presentations.json')
    const presentation = presentations.find((p) => p.id === presentationId)
    if (presentation) {
        commonStore.setPresentationConfig(presentation)

        commonStore.togglePresentationMode()
    } else {
        console.warn(`Presentation with id ${presentationId} not found.`)
    }
}

export const triggerNextSlide = (index: number) => {
    const commonStore = useCommonStore()
    const presentation = commonStore.presentationConfig
    if (!presentation) {
        console.warn('No presentation is currently active.')
        return
    }

    const slide = presentation.slides.find((s) => s.index === index)
    if (!slide) {
        console.warn(`Slide with index ${index} not found in the current presentation.`)
        return
    }

    if (slide.cameraPosition) {
        globeInstance.viewer.camera.flyTo({
            destination: Cartesian3.fromArray([
                slide.cameraPosition.destination.x,
                slide.cameraPosition.destination.y,
                slide.cameraPosition.destination.z,
            ]),
            orientation: {
                heading: slide.cameraPosition.orientation.heading,
                pitch: slide.cameraPosition.orientation.pitch,
                roll: slide.cameraPosition.orientation.roll,
            },
        })
    }

    if (slide.layerIds && slide.layerIds.length > 0) {
        setLayersVisibility(slide.layerIds)
    }
}

const setLayersVisibility = (layerIds: string[]) => {
    globeInstance.layers.layers.forEach((layer) => {
        if (layerIds.includes(layer.config.id!) && !layer.isVisible()) {
            layer.setVisibility(true)
        }
    })
    globeInstance.layers.layers.forEach((layer) => {
        if (!layerIds.includes(layer.config.id!) && layer.isVisible()) {
            layer.setVisibility(false)
        }
    })
}
