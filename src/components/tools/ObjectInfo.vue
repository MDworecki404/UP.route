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
        <v-row v-if="coordinates" dense no-gutters justify="end" align="center">
            <div class="text-button px-2 text-medium-emphasis">{{ $t('navigate') }}:</div>

            <action-button
                :icon="'mdi-walk'"
                :tooltip="{
                    location: 'bottom',
                    text: $t('byFoot'),
                }"
                :loading="isRouteLoading"
                :elevation="0"
                @click="triggerP2PNavigation('foot')"
            ></action-button>

            <action-button
                :icon="'mdi-bike'"
                :tooltip="{
                    location: 'bottom',
                    text: $t('byBike'),
                }"
                :loading="isRouteLoading"
                :elevation="0"
                @click="triggerP2PNavigation('bike')"
            ></action-button>

            <action-button
                :icon="'mdi-car'"
                :tooltip="{
                    location: 'bottom',
                    text: $t('byCar'),
                }"
                :loading="isRouteLoading"
                :elevation="0"
                @click="triggerP2PNavigation('car')"
            ></action-button>
        </v-row>
    </v-card-text>
</template>

<script lang="ts" setup>
import { objectClicked } from '@/services/eventBus'
import { globeInstance } from '@/services/globe/globe'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataTableHeader } from 'vuetify'
import ActionButton from '../ui/ActionButton.vue'
import TableComponent from '../ui/TableComponent.vue'

const { t } = useI18n()

const { initialData, coordinates } = defineProps<{
    initialData: Record<string, unknown> | null
    coordinates?: number[]
}>()

const listenersRemovers: (() => void)[] = []
const data = ref<Record<string, unknown> | null>(initialData)
const coords = ref(coordinates)
const isRouteLoading = ref(false)

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

const triggerP2PNavigation = async (mode: 'foot' | 'bike' | 'car'): Promise<void> => {
    isRouteLoading.value = true

    const degressCoords = coords.value?.map((coord) => (coord * 180) / Math.PI) as number[]
    const userPosition = await globeInstance.userPositionService.getNowUserPosition()
    const userPositionArray = [userPosition?.longitude, userPosition?.latitude] as number[]

    globeInstance.routeFinder.p2pRoute(userPositionArray, degressCoords, mode)

    isRouteLoading.value = false
}

onMounted(() => {
    const listener = objectClicked.addEventListener((newData) => {
        data.value = newData?.initialData as Record<string, unknown> | null
        coords.value = newData?.coordinates as number[] | undefined
    })
    listenersRemovers.push(() => objectClicked.removeEventListener(listener))
})

onUnmounted(() => {
    listenersRemovers.forEach((remove) => remove())
})
</script>
