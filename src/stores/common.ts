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

    return {
        isOverlayActive,
        turnOffOverlay,
        turnOnOverlay,
    }
})
