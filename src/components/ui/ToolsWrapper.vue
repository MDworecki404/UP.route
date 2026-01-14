<template>
    <v-card :width="width ?? 300" :max-height="maxHeight ?? 500" elevation="2" class="pa-0 ma-0">
        <v-card-title class="pa-0 ma-0">
            <ToolToolbar
                :icon="icon"
                :title="$t(id)"
                :close-custom-func="() => closeTool(id)"
                :show-minimize="true"
            ></ToolToolbar>
        </v-card-title>
        <slot name="default" />
    </v-card>
</template>

<script lang="ts" setup>
import type { ToolsMap } from '@/services/tools'
import ToolToolbar from './ToolToolbar.vue'
import { useToolsStore } from '@/stores'

defineProps<{
    width?: ToolsMap['width']
    maxHeight?: ToolsMap['maxHeight']
    id: ToolsMap['id']
    icon?: ToolsMap['icon']
}>()

const { closeTool } = useToolsStore()
</script>
