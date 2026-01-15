import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotifyStore = defineStore('notify', () => {
    const isActive = ref(false)
    const message = ref('')
    const type = ref<'success' | 'error' | 'info'>('info')
    const width = ref(300)
    const icon = ref<string>()
    const duration = ref(3000)

    const showNotify = ({
        msg,
        notifyType,
        notifyWidth,
        notifyIcon,
        notifyDuration,
    }: {
        msg: string
        notifyType: 'success' | 'error' | 'info'
        notifyWidth?: number
        notifyIcon?: string
        notifyDuration?: number
    }) => {
        message.value = msg
        type.value = notifyType
        if (notifyWidth) {
            width.value = notifyWidth
        }
        if (notifyIcon) {
            icon.value = notifyIcon
        }
        if (notifyDuration) {
            duration.value = notifyDuration
        }
        isActive.value = true
    }

    return { isActive, message, type, width, showNotify, icon, duration }
})
