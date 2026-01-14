<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                v-tooltip="{
                    text: $t('openContextMenu'),
                    location: 'bottom',
                }"
                :icon="icon"
                :text="text"
                class="rounded-0"
            >
                <v-icon color="primary" :icon="icon" />
            </v-btn>
        </template>
        <v-list density="compact">
            <v-list-item
                v-for="(item, index) in contextMenuList"
                :key="index"
                density="compact"
                :min-height="24"
                :max-height="24"
                class="pa-0 ma-0 pr-2 pl-3 mt-1 mb-1 rounded-0"
                @click="item.method()"
            >
                <template #append>
                    <v-icon :icon="item.icon" size="16" />
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import type { ContextMenuListType } from '@/types/ui'

defineProps<{
    icon: string
    text?: string
    contextMenuList?: ContextMenuListType
}>()
</script>
