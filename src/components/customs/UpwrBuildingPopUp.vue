<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters justify="space-between">
            <v-card elevation="8" variant="outlined" color="primary" style="width: 100%">
                <v-card-title class="d-flex justify-center align-center">
                    <v-skeleton-loader
                        v-if="!buildingInfoRef"
                        type="paragraph"
                        class="pa-0 ma-0"
                        style="width: 100%; height: min-content"
                    />
                    <v-icon v-if="buildingInfoRef">{{
                        buildingInfoRef?.icon ? buildingInfoRef.icon : 'mdi-school-outline'
                    }}</v-icon>
                    <span v-if="buildingInfoRef" class="ml-2 font-weight-bold"
                        >{{ $t('building') }} {{ buildingInfoRef?.buildingNum }}</span
                    >

                    <div
                        v-if="buildingInfoRef"
                        :style="{
                            position: 'absolute',
                            right: '10px',
                            display: 'flex',
                            gap: '8px',
                        }"
                    >
                        <action-button
                            :icon="'mdi-walk'"
                            :tooltip="{
                                text: $t('navigateToBuilding'),
                                location: 'bottom',
                            }"
                            :size="22"
                            :icon-size="22"
                            :elevation="0"
                            :loading="isRouteLoading"
                            @click="triggerNavigateToBuilding(buildingInfoRef, 'foot')"
                        />
                        <action-button
                            :icon="'mdi-bike'"
                            :tooltip="{
                                text: $t('navigateToBuilding'),
                                location: 'bottom',
                            }"
                            :size="22"
                            :icon-size="22"
                            :elevation="0"
                            :loading="isRouteLoading"
                            @click="triggerNavigateToBuilding(buildingInfoRef, 'bike')"
                        />
                        <action-button
                            :icon="'mdi-car'"
                            :tooltip="{
                                text: $t('navigateToBuilding'),
                                location: 'bottom',
                            }"
                            :size="22"
                            :icon-size="22"
                            :elevation="0"
                            :loading="isRouteLoading"
                            @click="triggerNavigateToBuilding(buildingInfoRef, 'car')"
                        />
                    </div>
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
                    <v-skeleton-loader
                        v-if="!buildingInfoRef"
                        type="paragraph"
                        class="pa-0 ma-0"
                        style="width: 100%; height: min-content"
                    />
                    <span v-else class="ml-2 font-weight-bold">{{ buildingInfoRef?.name }}</span>
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
                    <v-skeleton-loader
                        v-if="!buildingInfoRef"
                        type="paragraph"
                        class="pa-0 ma-0"
                        style="width: 100%; height: min-content"
                    />
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
import ActionButton from '../ui/ActionButton.vue'
import { globeInstance } from '@/services/globe/globe'

const { initialData, buildingMetadata } = defineProps<{
    initialData?: Record<string, unknown>
    buildingMetadata?: UpwrBuildingsMetadata
}>()

const buildingInfoRef = ref<UpwrBuildingsMetadata>()
const listenersRemovers: Array<() => void> = []
const isRouteLoading = ref(false)

const upwrBuildingsMetadata = ref<UpwrBuildingsMetadataArray>([])

const triggerNavigateToBuilding = async (
    buildingInfo: UpwrBuildingsMetadata,
    mode: 'foot' | 'bike' | 'car',
) => {
    if (!buildingInfo.gmlIds || buildingInfo.gmlIds.length === 0) {
        console.log('No GML IDs available for navigation')
        return
    }

    isRouteLoading.value = true
    const actualUserPosition = await globeInstance.userPositionService.getNowUserPosition()
    await globeInstance.routeFinder.u2bRoute(
        [actualUserPosition!.longitude, actualUserPosition!.latitude],
        buildingInfo.buildingNum!,
        mode,
    )
    isRouteLoading.value = false
}

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
