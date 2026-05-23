import { globeInstance } from '@/services/globe/globe'
import type { Presentation } from '@/services/presentations/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
    // Overlay state and methods
    const isOverlayActive = ref(true)

    const turnOffOverlay = () => {
        isOverlayActive.value = false
    }

    const turnOnOverlay = () => {
        isOverlayActive.value = true
    }

    //Drawer state
    const isDrawerOpen = ref(false)

    const toggleDrawerState = () => {
        isDrawerOpen.value = !isDrawerOpen.value
    }

    //Route states
    const routeCreated = ref(false)

    const setRouteCreated = (created: boolean) => {
        routeCreated.value = created
    }

    const removeRoute = () => {
        globeInstance.routeFinder.clearRoutes()
        routeCreated.value = false
    }

    //AppInfoTestState

    const appInfoTestState = ref(false)
    const toggleAppInfoTestState = () => {
        appInfoTestState.value = !appInfoTestState.value
    }

    //Presentation mode state
    const presentationMode = ref(false)
    const togglePresentationMode = () => {
        presentationMode.value = !presentationMode.value
    }

    const presentationConfig = ref<Presentation | null>(null)
    const setPresentationConfig = (config: Presentation) => {
        presentationConfig.value = config
    }

    const clearPresentationConfig = () => {
        presentationConfig.value = null
    }

    return {
        isOverlayActive,
        turnOffOverlay,
        turnOnOverlay,
        isDrawerOpen,
        toggleDrawerState,
        routeCreated,
        setRouteCreated,
        removeRoute,
        appInfoTestState,
        toggleAppInfoTestState,
        presentationMode,
        togglePresentationMode,
        presentationConfig,
        setPresentationConfig,
        clearPresentationConfig,
    }
})
