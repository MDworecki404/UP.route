<template>
    <div
        :class="[
            orientation === 'horizontal' ? ['d-flex', 'flex-row'] : ['d-flex', 'flex-column'],
            'ga-2',
        ]"
    >
        <ActionButton
            v-for="button in buttonsList"
            :key="button.icon"
            :class="buttonCustomClass"
            :icon="button.icon"
            :color="buttonColor"
            :tooltip="button.tooltip"
            :size="buttonsSize"
            :iconSize="buttonsIconSize"
            :variant="buttonVariant"
            @click="performAction(button.action)"
        ></ActionButton>
    </div>
</template>
<script setup lang="ts">
import ActionButton from './ActionButton.vue'
import { type ActionButtonWithActionType } from '@/types/ui'
import { performAction } from '@/services/actions'

const { orientation = 'horizontal' } = defineProps<{
    buttonsList: ActionButtonWithActionType[]
    orientation?: 'horizontal' | 'vertical'
    buttonVariant?: string
    buttonCustomClass?: string
    buttonColor?: string
    buttonsSize?: number
    buttonsIconSize?: number
}>()
</script>
