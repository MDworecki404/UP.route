<template>
    <div class="desktop-content-container">
        <v-toolbar elevation="2" height="47" density="comfortable" color="background">
            <div>
                <ActionButtonsList
                    v-if="buttonsList?.toolbarActionButtons"
                    class="ml-2"
                    :buttons-list="buttonsList?.toolbarActionButtons"
                    :orientation="'horizontal'"
                />
            </div>
        </v-toolbar>
        <LayersTreeDrawer></LayersTreeDrawer>
        <DesktopToolsContainer></DesktopToolsContainer>
    </div>
</template>

<script setup lang="ts">
import { fetchJsonFile } from '@/services/utils'
import type { UiType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import ActionButtonsList from './ui/ActionButtonsList.vue'
import LayersTreeDrawer from './ui/LayersTreeDrawer.vue'
import DesktopToolsContainer from './DesktopToolsContainer.vue'

const buttonsList = ref<UiType>()

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('@/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig
})
</script>

<style scoped>
.desktop-content-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    pointer-events: none;
    z-index: 10;
}

.desktop-content-container > * {
    pointer-events: auto;
}
</style>
