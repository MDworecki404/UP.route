<template>
    <v-card-text class="pa-1 ma-0">
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
        <TableComponent
            generic="UpwrBuildingsMetadata"
            :items="buildingsData"
            :headers="headers"
            :search="searchQuery"
            :items-per-page="5"
            :items-per-page-options="[5, 7, 10, 15]"
        >
            <template #actions="{ item }">
                <ContextMenuButton
                    :icon="'mdi-dots-vertical'"
                    :elevation="0"
                    size="24"
                    :icon-size="20"
                    :context-menu-list="getContextMenuList(item)"
                />
            </template>
        </TableComponent>
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
import { globeInstance } from '@/services/globe/globe'
import { Cartesian3 } from '@cesium/engine'
import TableComponent from '../ui/TableComponent.vue'

const { t } = useI18n()

const toolsStore = useToolsStore()

const buildingsData = ref<UpwrBuildingsMetadataArray>([])
const searchQuery = ref<string>('')

const headers: DataTableHeader[] = [
    {
        title: t('nr'),
        value: 'buildingNum',
        align: 'start',
        sortable: true,
    },
    {
        title: t('address'),
        value: 'buildingAddress',
        align: 'start',
        sortable: true,
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
            disabled: !item.view,
            method: () => {
                globeInstance.viewer.camera.flyTo({
                    destination: Cartesian3.fromElements(
                        item.view?.destination.x ?? 0,
                        item.view?.destination.y ?? 0,
                        item.view?.destination.z ?? 0,
                    ),
                    orientation: item.view?.orientation,
                    duration: 1.5,
                })
            },
        },
        {
            text: t('openBuildingInfo'),
            icon: ' mdi-information-outline',
            method: async () => {
                if (toolsStore.activeTools.has('upwrBuildingInfoPopUp')) {
                    if (toolsStore.activeTools.get('upwrBuildingInfoPopUp')?.isMinimized) {
                        toolsStore.restoreTool('upwrBuildingInfoPopUp')
                    }

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
                        icon: 'mdi-information-outline',
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
