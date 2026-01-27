<template>
    <v-btn
        :icon="icon"
        v-tooltip="{
            text: translatedTooltip,
            location: tooltip.location,
        }"
        @click="onClick"
        rounded="0"
        :size="size"
    >
        <v-icon :size="iconSize" :color="iconColor">{{ icon }}</v-icon>
    </v-btn>
</template>

<script setup lang="ts">
import { useDynamicTranslation } from '@/composables/useDynamicTranslation'
import type { ActionButtonWithActionType } from '@/types/ui'

const {
    tooltip,
    iconColor = 'primary',
    size = 32,
    iconSize = 27,
} = defineProps<{
    icon: string
    tooltip: ActionButtonWithActionType['tooltip']
    onClick?: () => void
    iconColor?: string
    size?: number
    iconSize?: number
}>()

const { translate } = useDynamicTranslation()
const translatedTooltip = translate(tooltip.text)
</script>
