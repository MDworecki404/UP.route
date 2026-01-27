<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters>
            <v-card elevation="8" variant="outlined" color="primary" style="width: 100%">
                <v-card-title class="d-flex justify-center align-center">
                    <v-icon>{{
                        buildingInfoRef?.icon ? buildingInfoRef.icon : 'mdi-school-outline'
                    }}</v-icon>
                    <span class="ml-2 font-weight-bold"
                        >{{ $t('building') }} {{ buildingInfoRef?.buildingNum }}</span
                    >
                </v-card-title>
            </v-card>
        </v-row>
        <v-row v-if="buildingInfoRef?.name" dense no-gutters>
            <v-card
                elevation="8"
                variant="outlined"
                color="primary"
                style="width: 100%; margin-top: 10px"
            >
                <v-card-title class="d-flex justify-center align-center">
                    <span class="ml-2 font-weight-bold">{{ buildingInfoRef?.name }}</span>
                </v-card-title>
            </v-card>
        </v-row>
        <v-row dense no-gutters>
            <v-card
                elevation="8"
                variant="outlined"
                color="primary"
                style="width: 100%; margin-top: 10px"
            >
                <v-card-text style="max-height: 250px; overflow-y: auto">
                    <div v-if="buildingInfoRef?.buildingAddress">
                        <strong>{{ $t('address') }}:</strong>
                        <div>{{ buildingInfoRef.buildingAddress }}</div>
                    </div>
                    <div v-if="buildingInfoRef?.description" style="margin-top: 10px">
                        <strong>{{ $t('description') }}:</strong>
                        <div v-html="buildingInfoRef.description"></div>
                    </div>
                </v-card-text>
            </v-card>
        </v-row>
    </v-card-text>
</template>

<script lang="ts" setup>
import { customObjectClicked } from '@/services/eventBus'
import { fetchJsonFile } from '@/services/utils'
import type { UpwrBuildingsMetadata, UpwrBuildingsMetadataArray } from '@/types/customs'
import { onMounted, onUnmounted, ref } from 'vue'

const { initialData, buildingMetadata } = defineProps<{
    initialData?: Record<string, unknown>
    buildingMetadata?: UpwrBuildingsMetadata
}>()

const buildingInfoRef = ref<UpwrBuildingsMetadata>()
const listenersRemovers: Array<() => void> = []

const upwrBuildingsMetadata = ref<UpwrBuildingsMetadataArray>([])

const getBuildingInfo = (data: Record<string, unknown>) => {
    if (!data['gml:id']) return

    const buildingId = data['gml:id'] as string

    const buildingInfo = upwrBuildingsMetadata.value.find((building) =>
        building.gmlIds?.includes(buildingId),
    )
    if (buildingInfo) {
        buildingInfoRef.value = buildingInfo
    } else {
        console.log('No building info found for ID:', buildingId)
    }
}

onMounted(async () => {
    upwrBuildingsMetadata.value = await fetchJsonFile<UpwrBuildingsMetadataArray>(
        new URL('/properties/customs/upwrBuildingsMetadata.json', import.meta.url).href,
    )

    if (initialData) {
        getBuildingInfo(initialData)
    } else if (buildingMetadata) {
        buildingInfoRef.value = buildingMetadata
    }

    const listener = customObjectClicked.addEventListener((eventData) => {
        if (eventData.id === 'upwrBuildingInfoPopUp') {
            if ('buildingNum' in eventData.data!) {
                buildingInfoRef.value = eventData.data as UpwrBuildingsMetadata
            }

            getBuildingInfo(eventData.data!)
        }
    })

    listenersRemovers.push(listener)
})

onUnmounted(() => {
    listenersRemovers.forEach((removeListener) => removeListener())
})
</script>
