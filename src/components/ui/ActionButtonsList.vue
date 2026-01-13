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
            :icon="button.icon"
            :tooltip="button.tooltip"
        ></ActionButton>
    </div>
</template>
<script setup lang="ts">
import ActionButton from './ActionButton.vue'
import { type ActionButtonWithActionType } from '@/types/ui'

const { orientation = 'horizontal' } = defineProps<{
    buttonsList: ActionButtonWithActionType[]
    orientation?: 'horizontal' | 'vertical'
}>()
</script>
