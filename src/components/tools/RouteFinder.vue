<template>
    <v-card-text class="pa-1 ma-0 justify-center">
        <v-tabs v-model="tab" color="primary" center-active>
            <v-tab value="b2b" v-tooltip="{ text: $t('buildingToBuilding'), location: 'bottom' }">
                <v-icon size="25">mdi-office-building-marker</v-icon>
                <v-icon size="25">mdi-format-horizontal-align-center</v-icon>
                <v-icon size="25">mdi-office-building-marker</v-icon>
            </v-tab>
            <v-tab value="u2b" v-tooltip="{ text: $t('userToBuilding'), location: 'bottom' }">
                <v-icon size="25">mdi-account</v-icon>
                <v-icon size="25">mdi-format-horizontal-align-center</v-icon>
                <v-icon size="25">mdi-office-building-marker</v-icon>
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab" class="pt-3">
            <v-tabs-window-item value="b2b">
                <div class="mb-3">
                    <v-divider>{{ $t('modes') }}</v-divider>
                </div>
                <v-row dense no-gutters justify="center" class="ga-5 pb-3">
                    <ActionButton
                        :icon="'mdi-walk'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byFoot'),
                        }"
                        variant="outlined"
                        :color="routeType === 'foot' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'foot' ? 'success' : 'primary'"
                        @click="routeType = 'foot'"
                    />
                    <ActionButton
                        :icon="'mdi-bike'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byBike'),
                        }"
                        variant="outlined"
                        :color="routeType === 'bike' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'bike' ? 'success' : 'primary'"
                        @click="routeType = 'bike'"
                    />
                    <ActionButton
                        :icon="'mdi-car'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byCar'),
                        }"
                        variant="outlined"
                        :color="routeType === 'car' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'car' ? 'success' : 'primary'"
                        @click="routeType = 'car'"
                    />
                </v-row>

                <div class="my-3">
                    <v-divider>{{ $t('settings') }}</v-divider>
                </div>

                <v-row dense no-gutters>
                    <v-autocomplete
                        v-model="startBuilding"
                        :items="buildings"
                        :item-title="(item) => item.buildingNum"
                        :item-value="(item) => item.buildingNum"
                        variant="outlined"
                        :label="$t('startBuilding')"
                        color="primary"
                        density="compact"
                        :prepend-inner-icon="'mdi-ray-start-arrow'"
                    ></v-autocomplete>
                </v-row>
                <v-row dense no-gutters>
                    <v-autocomplete
                        v-model="endBuilding"
                        :items="buildings"
                        :item-title="(item) => item.buildingNum"
                        :item-value="(item) => item.buildingNum"
                        variant="outlined"
                        :label="$t('endBuilding')"
                        color="primary"
                        density="compact"
                        :prepend-inner-icon="'mdi-ray-end-arrow'"
                    ></v-autocomplete>
                </v-row>

                <v-row dense no-gutters justify="end">
                    <TextButton
                        :text="$t('showRoute')"
                        color="primary"
                        prepend-icon="mdi-navigation-variant-outline"
                        :disabled="!startBuilding || !endBuilding"
                        @click="triggerB2BRouteFinding"
                    />
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="u2b">
                <div class="mb-3">
                    <v-divider>{{ $t('modes') }}</v-divider>
                </div>
                <v-row dense no-gutters justify="center" class="ga-5 pb-3">
                    <ActionButton
                        :icon="'mdi-walk'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byFoot'),
                        }"
                        variant="outlined"
                        :color="routeType === 'foot' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'foot' ? 'success' : 'primary'"
                        @click="routeType = 'foot'"
                    />
                    <ActionButton
                        :icon="'mdi-bike'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byBike'),
                        }"
                        variant="outlined"
                        :color="routeType === 'bike' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'bike' ? 'success' : 'primary'"
                        @click="routeType = 'bike'"
                    />
                    <ActionButton
                        :icon="'mdi-car'"
                        :tooltip="{
                            location: 'bottom',
                            text: $t('byCar'),
                        }"
                        variant="outlined"
                        :color="routeType === 'car' ? 'success' : 'primary'"
                        :size="29"
                        :icon-size="24"
                        :icon-color="routeType === 'car' ? 'success' : 'primary'"
                        @click="routeType = 'car'"
                    />
                </v-row>

                <div class="my-3">
                    <v-divider>{{ $t('settings') }}</v-divider>
                </div>

                <v-row dense no-gutters>
                    <v-autocomplete
                        v-model="endBuilding"
                        :items="buildings"
                        :item-title="(item) => item.buildingNum"
                        :item-value="(item) => item.buildingNum"
                        variant="outlined"
                        :label="$t('endBuilding')"
                        color="primary"
                        density="compact"
                        :prepend-inner-icon="'mdi-ray-end-arrow'"
                    ></v-autocomplete>
                </v-row>

                <v-row dense no-gutters justify="end">
                    <TextButton
                        :text="$t('showRoute')"
                        color="primary"
                        prepend-icon="mdi-navigation-variant-outline"
                        :disabled="!startBuilding || !endBuilding"
                        @click="triggerU2BRouteFinding"
                    />
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { fetchJsonFile } from '@/services/utils'
import { upwrBuildingsMetadataArraySchema, type UpwrBuildingsMetadataArray } from '@/types/customs'
import { onMounted, ref } from 'vue'
import { safeParse } from 'zod'
import ActionButton from '../ui/ActionButton.vue'
import TextButton from '../ui/TextButton.vue'

const tab = ref('b2b')

const buildings = ref<UpwrBuildingsMetadataArray>([])

const startBuilding = ref<string | null>('C1')
const endBuilding = ref<string | null>('B8')
const routeType = ref<'bike' | 'foot' | 'car'>('bike')

const triggerB2BRouteFinding = async () => {
    if (!startBuilding.value || !endBuilding.value) {
        return
    }

    await globeInstance.routeFinder.b2bRoute(
        startBuilding.value,
        endBuilding.value,
        routeType.value,
    )
}

const triggerU2BRouteFinding = async () => {
    if (!endBuilding.value) {
        return
    }

    const userPosition = await globeInstance.userPositionService.getNowUserPosition()
    if (!userPosition) {
        alert(
            'Unable to get user position. Please make sure location services are enabled and try again.',
        )
        return
    }

    const userCoords = [userPosition.longitude, userPosition.latitude]

    await globeInstance.routeFinder.u2bRoute(userCoords, endBuilding.value, routeType.value)
}

onMounted(async () => {
    try {
        const data = await fetchJsonFile<UpwrBuildingsMetadataArray>(
            new URL('/properties/customs/upwrBuildingsMetadata.json', import.meta.url).href,
        )

        const parsed = safeParse(upwrBuildingsMetadataArraySchema, data)
        if (parsed.success) {
            buildings.value = parsed.data
        } else {
            console.error('Failed to parse buildings metadata:', parsed.error)
        }
    } catch (error) {
        console.error('Failed to load buildings metadata:', error)
    }
})
</script>
