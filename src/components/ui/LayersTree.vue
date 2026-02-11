<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters>
            <v-text-field
                v-model="search"
                hide-details
                :label="$t('searchLayers')"
                clearable
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                class="pa-2"
            ></v-text-field>
        </v-row>
        <v-treeview
            v-model:selected="activeLayers"
            v-model:opened="openIds"
            :items="treeItems"
            item-value="id"
            :activatable="false"
            density="compact"
            :selectable="true"
            select-strategy="classic"
            collapse-icon="mdi-chevron-down"
            expand-icon="mdi-chevron-right"
            selected-color="primary"
            slim
            :search="search"
            :indent="32"
        >
            <template #no-data>
                <div class="px-5 text-medium-emphasis">
                    {{ $t('noLayersInSearch') }}
                </div>
            </template>
            <template #append="{ item }">
                <template
                    v-if="
                        item.type === 'layer' &&
                        (item.layerType === 'xyz' || item.layerType === 'osm')
                    "
                >
                    <context-menu-button
                        :context-menu-list="getImageryLayerContextMenuList(item)"
                        icon="mdi-dots-vertical"
                        location="right"
                        size="x-small"
                        :iconSize="18"
                        :elevation="0"
                    />
                </template>

                <template v-if="item.type === 'layer' && item.isPointCloud">
                    <context-menu-button
                        :context-menu-list="getContextMenuListForPointCloudLayer(item)"
                        icon="mdi-dots-vertical"
                        location="right"
                        size="x-small"
                        :iconSize="18"
                        :elevation="0"
                    />
                </template>
                <template
                    v-else-if="
                        item.type === 'layer' &&
                        (item.layerType === '3dtiles' || item.layerType === 'czml')
                    "
                >
                    <context-menu-button
                        :context-menu-list="get3DTilesAndCZMLContextMenuList(item)"
                        icon="mdi-dots-vertical"
                        location="right"
                        size="x-small"
                        :iconSize="18"
                        :elevation="0"
                    />
                </template>
            </template>
        </v-treeview>
    </v-card-text>
</template>

<script setup lang="ts">
import { useDynamicTranslation } from '@/composables/useDynamicTranslation'
import { globeInstance } from '@/services/globe/globe'
import { zoomToLayerById } from '@/services/utils'
import { LayerParents, type LayersUnionType } from '@/types/layers'
import type { ContextMenuListType } from '@/types/ui'
import _ from 'lodash'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ContextMenuButton from './ContextMenuButton.vue'
import { visibilityChanged } from '@/services/eventBus'

const { t } = useI18n()
const search = ref('')
const { translate } = useDynamicTranslation()
const listenersRemovers: (() => void)[] = []

type TreeNodeParent = {
    id: string
    title: string
    children: TreeNode[]
    type: 'parent'
}

type TreeNodeLayer = {
    id: string
    title: string
    type: 'layer'
    layerType: LayersUnionType['type']
    isPointCloud?: boolean
}

type TreeNode = TreeNodeParent | TreeNodeLayer

const treeItemsBase = ref<TreeNode[]>([])
const activeLayers = ref<string[]>([])
const openIds = ref(['campus3D', '3dLayers', 'basemaps'])

const treeItems = computed(() => {
    return treeItemsBase.value.map((node) => {
        if (node.type === 'parent') {
            return {
                ...node,
                title: t(node.id),
                children: node.children.map((child) => {
                    const layer = globeInstance.layers.layers.get(child.id)
                    return {
                        ...child,
                        title: layer ? translate(layer.config.name).value! : child.title,
                    }
                }),
            }
        } else {
            const layer = globeInstance.layers.layers.get(node.id)
            return {
                ...node,
                title: layer ? translate(layer.config.name).value! : node.title,
                isPointCloud:
                    layer?.config.type === '3dtiles' &&
                    layer.config.tilesProps?.type === 'pointCloud',
            }
        }
    })
})

let isUpdatingFromGlobe = false

watch(activeLayers, (newVal, oldVal) => {
    if (isUpdatingFromGlobe) return

    const toShow = _.difference(newVal, oldVal)
    const toHide = _.difference(oldVal, newVal)

    toShow.forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer && !layer.isVisible()) {
            layer.setVisibility(true)
        }
    })

    toHide.forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer && layer.isVisible()) {
            layer.setVisibility(false)
        }
    })
})

const createParents = () => {
    LayerParents.options.forEach((parent) => {
        treeItemsBase.value.push({
            id: parent,
            title: t(parent),
            children: [],
            type: 'parent',
        })
    })
}

const populateTreeStructure = () => {
    const layers = globeInstance.layers.layers
    layers.forEach((layer) => {
        const parentName = layer.config.parent || null

        if (parentName) {
            const parentNode = treeItemsBase.value.find((node) => node.id === parentName)
            if (parentNode && parentNode.type === 'parent') {
                parentNode.children.push({
                    id: layer.config.id!,
                    title: '',
                    type: 'layer',
                    layerType: layer.config.type,
                    isPointCloud:
                        layer.config.type === '3dtiles' &&
                        layer.config.tilesProps?.type === 'pointCloud',
                })
            }
        } else {
            treeItemsBase.value.push({
                id: layer.config.id!,
                title: '',
                type: 'layer',
                layerType: layer.config.type,
                isPointCloud:
                    layer.config.type === '3dtiles' &&
                    layer.config.tilesProps?.type === 'pointCloud',
            })
        }
    })
}

const syncSelectionFromGlobe = () => {
    const layers = globeInstance.layers.layers
    const visibleIds: string[] = []

    layers.forEach((layer) => {
        if (layer.classType !== 'terrain' && layer._layer?.show) {
            visibleIds.push(layer.config.id!)
        }
        if (layer.classType === 'terrain' && layer.isVisible()) {
            visibleIds.push(layer.config.id!)
        }
    })

    const currentSorted = [...activeLayers.value].sort()
    const newSorted = [...visibleIds].sort()

    if (!_.isEqual(currentSorted, newSorted)) {
        isUpdatingFromGlobe = true
        activeLayers.value = visibleIds

        setTimeout(() => {
            isUpdatingFromGlobe = false
        }, 0)
    }
}

onMounted(() => {
    createParents()
    populateTreeStructure()

    syncSelectionFromGlobe()

    const listener = visibilityChanged.addEventListener(() => {
        // Nie przebudowujemy drzewa, tylko aktualizujemy checkboxy
        syncSelectionFromGlobe()
    })

    if (typeof listener === 'function') {
        listenersRemovers.push(listener)
    }
})

onUnmounted(() => {
    listenersRemovers.forEach((remove) => remove())
})

const getImageryLayerContextMenuList = (item: TreeNodeLayer): ContextMenuListType => [
    {
        text: 'raiseToTop',
        icon: 'mdi-arrow-up-thick',
        method: () => {
            const layer = globeInstance.layers.layers.get(item.id)
            if (layer && layer.classType !== 'terrain') {
                layer.raiseToTop()
            }
        },
    },
    {
        text: 'adjust',
        icon: 'mdi-tune',
        method: async () => {
            const { performAction } = await import('@/services/actions')
            performAction({
                actionId: 'toggleTool',
                icon: 'mdi-tune',
                toolId: 'rasterAdjustment',
                width: 450,
                customTitle: `${t('adjust')} - ${item.title}`,
                props: {
                    layerId: item.id,
                },
            })
        },
    },
]

const get3DTilesAndCZMLContextMenuList = (item: TreeNodeLayer): ContextMenuListType => [
    {
        text: 'zoomToExtent',
        icon: 'mdi-magnify-scan',
        method: () => {
            zoomToLayerById(item.id)
        },
    },
]

const getContextMenuListForPointCloudLayer = (item: TreeNodeLayer): ContextMenuListType => [
    ...get3DTilesAndCZMLContextMenuList(item),
    {
        text: 'adjust',
        icon: 'mdi-tune',
        method: async () => {
            const { performAction } = await import('@/services/actions')
            performAction({
                actionId: 'toggleTool',
                icon: 'mdi-tune',
                toolId: 'pointCloudAdjustment',
                width: 450,
                customTitle: `${t('adjust')} - ${item.title}`,
                props: {
                    layerId: item.id,
                },
            })
        },
    },
]
</script>

<style scoped>
.v-treeview {
    font-size: 0.9rem !important;
}

:deep(.v-list-item-title) {
    font-size: 0.95rem !important;
}

:deep(.v-list-item) {
    min-height: 24px !important;
    padding-top: 1px !important;
    padding-bottom: 1px !important;
}

:deep(.v-list-item__overlay) {
    opacity: 0 !important;
    display: none !important;
}
</style>
