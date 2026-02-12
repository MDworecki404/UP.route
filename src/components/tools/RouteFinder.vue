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

        <v-tabs-window v-model="tab" class="pt-4">
            <v-tabs-window-item value="b2b">
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
                    />
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="u2b">
                <pre>Not implemented yet</pre>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card-text>
</template>

<script lang="ts" setup>
import { fetchJsonFile } from '@/services/utils'
import { upwrBuildingsMetadataArraySchema, type UpwrBuildingsMetadataArray } from '@/types/customs'
import { onMounted, ref } from 'vue'
import { safeParse } from 'zod'
import TextButton from '../ui/TextButton.vue'

const tab = ref('b2b')

const buildings = ref<UpwrBuildingsMetadataArray>([])

const startBuilding = ref<string | null>(null)
const endBuilding = ref<string | null>(null)

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
