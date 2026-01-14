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
    </v-treeview>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import { LayerParents } from '@/types/layers'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import _ from 'lodash'

const { t } = useI18n()
const search = ref('')

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
}

type TreeNode = TreeNodeParent | TreeNodeLayer

const treeItems = ref<TreeNode[]>([])
const activeLayers = ref<string[]>([])

watch(activeLayers, (newVal, oldVal) => {
    _.difference(newVal, oldVal).forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer) {
            layer.setVisibility(!layer.isVisible())
        }
    })

    _.difference(oldVal, newVal).forEach((layerId) => {
        const layer = globeInstance.layers.layers.get(layerId)
        if (layer) {
            layer.setVisibility(!layer.isVisible())
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
        if (layer._layer?.show) {
            activeLayers.value.push(layer.config.id!)
        }
        if (parentName) {
            const parentNode = treeItems.value.find((node) => node.id === parentName)
            if (parentNode && parentNode.type === 'parent') {
                parentNode.children.push({
                    id: layer.config.id!,
                    title: layer.config.name,
                    type: 'layer',
                })
            }
        }
    })
}

onMounted(() => {
    createParents()

    populateTree()
})
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
