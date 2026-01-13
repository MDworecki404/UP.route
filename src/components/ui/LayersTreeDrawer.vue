<template>
    <v-navigation-drawer
        v-model="isActive"
        class="layersTree-drawer"
        width="300"
        :persistent="true"
        :scrim="false"
        :absolute="true"
    >
        <ToolToolbar
            :icon="'mdi-chevron-left'"
            :title="'layers'"
            :icon-custom-func="() => performAction({ actionId: 'toggleLayersDrawer' })"
            :hide-close-icon="true"
        />
        <LayersTree />
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { actionPerformed } from '@/services/eventBus'
import { onMounted, ref } from 'vue'
import LayersTree from './LayersTree.vue'
import ToolToolbar from './ToolToolbar.vue'
import { performAction } from '@/services/actions'

const isActive = ref(false)

onMounted(() => {
    actionPerformed.addEventListener((action) => {
        if (action.actionId === 'toggleLayersDrawer') {
            isActive.value = !isActive.value
        }
    })
})
</script>

<style scoped>
.layersTree-drawer {
    position: relative !important;
    pointer-events: auto;
    height: calc(100vh - 47px);
}
</style>
