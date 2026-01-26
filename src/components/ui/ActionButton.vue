<template>
    <v-btn
        :icon="icon"
        v-tooltip="{
            text: translatedTooltip,
            location: tooltip.location,
        }"
        @click="onClick"
        rounded="0"
        size="32"
    >
        <v-icon size="27" :color="iconColor">{{ icon }}</v-icon>
    </v-btn>
</template>

<script setup lang="ts">
import { useDynamicTranslation } from '@/composables/useDynamicTranslation'
import type { ActionButtonWithActionType } from '@/types/ui'

const { tooltip, iconColor = 'primary' } = defineProps<{
    icon: string
    tooltip: ActionButtonWithActionType['tooltip']
    onClick?: () => void
    iconColor?: string
}>()

const { translate } = useDynamicTranslation()
const translatedTooltip = translate(tooltip.text)
</script>
