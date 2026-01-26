<template>
    <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions"
        :search="search"
        :items-per-page-text="$t('itemsPerPage')"
        :no-data-text="noDataText ?? $t('noDataAvailable')"
        density="compact"
    >
        <template v-slot:[`item.actions`]="{ item }">
            <slot name="actions" :item="item"></slot>
        </template>
    </v-data-table>
</template>

<script lang="ts" setup generic="T extends Record<string, any>">
import type { DataTableHeader } from 'vuetify'

defineProps<{
    headers: DataTableHeader[]
    items: Array<T>
    itemsPerPage?: number
    itemsPerPageOptions?: number[]
    search?: string
    noDataText?: string
}>()
</script>
