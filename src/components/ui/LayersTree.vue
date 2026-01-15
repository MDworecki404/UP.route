<template>
    <v-row dense no-gutters>
        <v-text-field
            v-model="search"
            hide-details
            :label="$t('searchLayers')"
            clearable
            :density="'compact'"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="pa-2"
        ></v-text-field>
    </v-row>
    <v-treeview
        v-model:selected="activeLayers"
        :items="treeItems"
        :item-value="'id'"
        :activatable="false"
        density="compact"
        :selectable="true"
        :select-strategy="'classic'"
        :collapse-icon="'mdi-chevron-down'"
        :expand-icon="'mdi-chevron-right'"
        :selected-color="'primary'"
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
                    item.type === 'layer' && (item.layerType === 'xyz' || item.layerType === 'osm')
                "
            >
                <context-menu-button
                    :context-menu-list="getImageryLayerContextMenuList(item)"
                    :icon="'mdi-dots-vertical'"
                    :location="'right'"
                    :size="'x-small'"
                    :iconSize="18"
                    :elevation="0"
                />
            </template>
        </template>
    </v-treeview>
</template>

<script setup lang="ts">
import { useDynamicTranslation } from '@/composables/useDynamicTranslation'
import { globeInstance } from '@/services/globe/globe'
import { LayerParents } from '@/types/layers'
import type { ContextMenuListType } from '@/types/ui'
import _ from 'lodash'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ContextMenuButton from './ContextMenuButton.vue'

const { t } = useI18n()
const search = ref('')
const { translate } = useDynamicTranslation()

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
    layerType: string
}

type TreeNode = TreeNodeParent | TreeNodeLayer

const treeItems = ref<TreeNode[]>([])
const activeLayers = ref<string[]>([])

watch(activeLayers, (newVal, oldVal) => {
    _.difference(newVal, oldVal).forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer && layer.classType !== 'terrain') {
            layer.setVisibility(!layer.isVisible())
        }
        if (layer && layer.classType === 'terrain') {
            layer.setVisibility(true)
        }
    })

    _.difference(oldVal, newVal).forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer && layer.classType !== 'terrain') {
            layer.setVisibility(!layer.isVisible())
        }
        if (layer && layer.classType === 'terrain') {
            layer.setVisibility(false)
        }
    })
})

const createParents = () => {
    LayerParents.options.forEach((parent) => {
        treeItems.value.push({
            id: parent,
            title: t(parent),
            children: [],
            type: 'parent',
        })
    })
}

const populateTree = () => {
    const layers = globeInstance.layers.layers
    layers.forEach((layer) => {
        const parentName = layer.config.parent || null
        if (layer && layer.classType !== 'terrain' && layer._layer?.show) {
            activeLayers.value.push(layer.config.id!)
        }
        if (layer && layer.classType === 'terrain' && layer.isVisible()) {
            activeLayers.value.push(layer.config.id!)
        }

        if (parentName) {
            const parentNode = treeItems.value.find((node) => node.id === parentName)
            if (parentNode && parentNode.type === 'parent') {
                parentNode.children.push({
                    id: layer.config.id!,
                    title: translate(layer.config.name).value!,
                    type: 'layer',
                    layerType: layer.config.type,
                })
            }
        }
    })
}

onMounted(() => {
    createParents()

    populateTree()
})

const getImageryLayerContextMenuList = (item: TreeNodeLayer): ContextMenuListType => [
    {
        text: t('raiseToTop'),
        icon: 'mdi-arrow-up-thick',
        method: () => {
            const layer = globeInstance.layers.layers.get(item.id)
            if (layer && layer.classType !== 'terrain') {
                layer.raiseToTop()
            }
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
