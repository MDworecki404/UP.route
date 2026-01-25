<template>
    <v-card-text>
        <v-text-field
            v-model="searchQuery"
            variant="outlined"
            color="primary"
            density="compact"
            :label="$t('search')"
            prepend-inner-icon="mdi-home-search-outline"
            hide-details
            class="pb-3"
        ></v-text-field>
        <v-data-table
            :items="buildingsData"
            :headers="headers"
            :search="searchQuery"
            density="compact"
            :items-per-page="5"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <ContextMenuButton
                    :icon="'mdi-dots-vertical'"
                    :elevation="0"
                    :context-menu-list="getContextMenuList(item)"
                />
            </template>
        </v-data-table>
    </v-card-text>
</template>

<script lang="ts" setup>
import { customObjectClicked } from '@/services/eventBus'
import { fetchJsonFile } from '@/services/utils'
import { useToolsStore } from '@/stores'
import type { UpwrBuildingsMetadata, UpwrBuildingsMetadataArray } from '@/types/customs'
import type { ContextMenuListType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataTableHeader } from 'vuetify'
import ContextMenuButton from '../ui/ContextMenuButton.vue'

const { t } = useI18n()

const toolsStore = useToolsStore()

const buildingsData = ref<UpwrBuildingsMetadataArray>([])
const searchQuery = ref<string>('')

const headers: DataTableHeader[] = [
    {
        title: t('nr'),
        value: 'buildingNum',
        align: 'start',
    },
    {
        title: t('address'),
        value: 'buildingAddress',
        align: 'start',
    },
    {
        title: t('actions'),
        align: 'center',
        value: 'actions',
    },
]

const getContextMenuList = (item: UpwrBuildingsMetadata): ContextMenuListType => {
    return [
        {
            text: t('zoomToBuilding'),
            icon: 'mdi-magnify-scan',
            method: () => {},
        },
        {
            text: t('openBuildingInfo'),
            icon: ' mdi-information-outline',
            method: async () => {
                if (
                    toolsStore.activeTools.has('upwrBuildingInfoPopUp') ||
                    toolsStore.mobileActiveTool?.id === 'upwrBuildingInfoPopUp'
                ) {
                    customObjectClicked.raiseEvent({
                        id: 'upwrBuildingInfoPopUp',
                        data: item,
                    })
                } else {
                    toolsStore.openTool({
                        id: 'upwrBuildingInfoPopUp',
                        width: 450,
                        maxHeight: 500,
                        component: (await import('@/components/customs/UpwrBuildingPopUp.vue'))
                            .default,
                        props: {
                            buildingMetadata: item,
                        },
                    })
                }
            },
        },
    ]
}

onMounted(async () => {
    buildingsData.value = await fetchJsonFile<UpwrBuildingsMetadataArray>(
        new URL('/properties/customs/upwrBuildingsMetadata.json', import.meta.url).href,
    )
})
</script>
