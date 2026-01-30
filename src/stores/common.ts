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

    return {
        isOverlayActive,
        turnOffOverlay,
        turnOnOverlay,
        isDrawerOpen,
        toggleDrawerState,
    }
})
