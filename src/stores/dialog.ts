import { defineStore } from 'pinia'
import { markRaw, ref, type Component } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
    const isDialogOpen = ref(false)
    const dialogContent = ref<{
        title: string
        component: Component
        props?: Record<string, unknown>
        width?: string | number
        icon: string
    } | null>(null)

    const openDialog = ({
        title,
        component,
        props,
        icon,
        width,
    }: {
        title: string
        component: Component
        props?: Record<string, unknown>
        icon: string
        width?: string | number
    }) => {
        dialogContent.value = { title, component: markRaw(component), props, icon, width }
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    return {
        isDialogOpen,
        dialogContent,
        openDialog,
        closeDialog,
    }
})
