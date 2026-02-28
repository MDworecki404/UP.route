<template>
    <v-card-text class="pa-1 ma-0">
        <v-text-field
            v-model="search"
            variant="outlined"
            density="compact"
            :prepend-inner-icon="'mdi-magnify'"
            :label="$t('search')"
        ></v-text-field>
        <TableComponent
            :headers="headers"
            :items="items"
            :items-per-page-options="[5, 10, 15, 25, 50]"
            :items-per-page="5"
            :search="search"
        >
            <template #actions="{ item }">
                <context-menu-button
                    :context-menu-list="getContextMenuList(item)"
                    icon="mdi-dots-vertical"
                    location="right"
                    :size="24"
                    :iconSize="18"
                    :elevation="0"
                />
            </template>
        </TableComponent>
    </v-card-text>
</template>

<script lang="ts" setup>
import type { DataTableHeader } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { globeInstance } from '@/services/globe/globe'
import type { Entity } from '@cesium/engine'
import TableComponent from '../ui/TableComponent.vue'
import ContextMenuButton from '../ui/ContextMenuButton.vue'
import type { ContextMenuListType } from '@/types/ui'
import { useToolsStore } from '@/stores'
import { objectClicked } from '@/services/eventBus'

const { t } = useI18n()

const { layerId } = defineProps<{
    layerId: string
}>()

const search = ref('')

const headers: DataTableHeader[] = [
    {
        title: t('id'),
        key: 'id',
        align: 'start',
        width: '100px',
        maxWidth: '100px',
        cellProps: {
            class: 'text-truncate',
        },
    },
    {
        title: t('name'),
        key: 'name',
        align: 'start',
    },
    {
        title: t('actions'),
        key: 'actions',
        align: 'center',
        sortable: false,
    },
]

const items = ref<{ id: string; name: string }[]>([])

const prepareGeoJSONObjectsList = async () => {
    const layer = globeInstance.layers.layers.get(layerId)
    if (layer && layer.classType === 'geojson') {
        const geojsonLayer = layer._layer
        const entities = geojsonLayer?.entities

        if (!entities) {
            console.warn(`Layer with id ${layerId} does not have entities.`)
            return
        }

        const objectsList = entities.values.map((entity: Entity) => ({
            id: entity.id,
            name: entity.name || t('unnamedObject'),
        }))
        items.value = objectsList
    }
}

const getContextMenuList = (item: { id: string; name: string }): ContextMenuListType => {
    return [
        {
            text: 'openObjectInfo',
            icon: 'mdi-information-outline',
            method: async () => {
                let properties: Record<string, unknown> | null = null

                const layer = globeInstance.layers.layers.get(layerId)
                if (layer && layer.classType === 'geojson') {
                    const entity = layer._layer?.entities.getById(item.id)
                    if (!entity) return

                    properties = globeInstance.events.unPackProperties(entity)
                    if (!properties) {
                        console.warn(
                            `No properties found for entity with id ${item.id} in layer ${layerId}.`,
                        )
                        return
                    }
                }

                const toolsStore = useToolsStore()
                if (toolsStore.activeTools.has('objectInfo')) {
                    if (toolsStore.activeTools.get('objectInfo')?.isMinimized) {
                        toolsStore.restoreTool('objectInfo')
                    }

                    objectClicked.raiseEvent({
                        ...properties,
                    })
                } else {
                    toolsStore.openTool({
                        id: 'objectInfo',
                        width: 450,
                        maxHeight: 500,
                        component: (await import('@/components/tools/ObjectInfo.vue')).default,
                        props: {
                            initialData: properties,
                        },
                        icon: 'mdi-information-outline',
                    })
                }
            },
        },
        {
            text: 'zoomToObject',
            icon: 'mdi-magnify-scan',
            method: async () => {
                const { zoomToEntity } = await import('@/services/utils')
                const layer = globeInstance.layers.layers.get(layerId)
                if (layer && layer.classType === 'geojson') {
                    const entity = layer._layer?.entities.getById(item.id)
                    if (entity) {
                        zoomToEntity(entity)
                    } else {
                        console.warn(`Entity with id ${item.id} not found in layer ${layerId}.`)
                    }
                } else {
                    console.warn(`Layer with id ${layerId} not found or is not a GeoJSON layer.`)
                }
            },
        },
    ]
}

onMounted(async () => {
    await prepareGeoJSONObjectsList()
})
</script>
