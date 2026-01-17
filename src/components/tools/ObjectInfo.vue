<template>
    <v-data-table
        v-if="data"
        :headers="headers"
        :items="items"
        :items-per-page="5"
        :items-per-page-options="[5]"
        :density="'compact'"
        :striped="'odd'"
        :items-per-page-text="$t('itemsPerPage')"
        :page-text="''"
    >
    </v-data-table>
</template>

<script lang="ts" setup>
import { objectClicked } from '@/services/eventBus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { DataTableHeader } from 'vuetify'
import { useI18n } from 'vue-i18n'

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
        property: key,
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
