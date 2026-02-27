import { globeInstance } from '@/services/globe/globe'
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

    return {
        isOverlayActive,
        turnOffOverlay,
        turnOnOverlay,
        isDrawerOpen,
        toggleDrawerState,
        routeCreated,
        setRouteCreated,
        removeRoute,
    }
})
