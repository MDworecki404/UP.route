<template>
    <v-card-text class="pa-1 ma-0">
        <table-component
            v-if="data"
            :headers="headers"
            :items="items"
            :items-per-page="5"
            :items-per-page-options="[5]"
        >
        </table-component>
    </v-card-text>
</template>

<script lang="ts" setup>
import { objectClicked } from '@/services/eventBus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataTableHeader } from 'vuetify'
import TableComponent from '../ui/TableComponent.vue'

const { t } = useI18n()

const { initialData } = defineProps<{
    initialData: Record<string, unknown> | null
}>()

const listenersRemovers: (() => void)[] = []
const data = ref<Record<string, unknown> | null>(initialData)

const headers: DataTableHeader[] = [
    {
        title: t('property'),
        key: 'property',
        align: 'start',
    },
    {
        title: t('value'),
        key: 'value',
        align: 'start',
    },
]

const items = computed(() => {
    if (!data.value) return []

    return Object.entries(data.value).map(([key, value]) => ({
        property: t(key),
        value: String(value),
    }))
})

onMounted(() => {
    const listener = objectClicked.addEventListener((newData) => {
        data.value = newData
    })
    listenersRemovers.push(() => objectClicked.removeEventListener(listener))
})

onUnmounted(() => {
    listenersRemovers.forEach((remove) => remove())
})
</script>
