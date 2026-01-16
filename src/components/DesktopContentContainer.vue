<template>
    <div class="desktop-content-container">
        <v-toolbar elevation="2" height="47" density="comfortable" color="background">
            <template #prepend>
                <ActionButtonsList
                    v-if="buttonsList?.toolbarActionButtons"
                    :buttons-list="buttonsList?.toolbarActionButtons"
                    :orientation="'horizontal'"
                />
            </template>
            <template #append>
                <ContextMenuButton
                    :icon="'mdi-dots-horizontal'"
                    :contextMenuList="ContextMenuItems"
                />
            </template>
            <ToolsMenu />
        </v-toolbar>

        <LayersTreeDrawer></LayersTreeDrawer>

        <DesktopToolsContainer></DesktopToolsContainer>

        <BottomNavigation />

        <GlobeNavigationPanel />

        <NotifyComponent />
    </div>
</template>

<script setup lang="ts">
import { performAction } from '@/services/actions'
import { fetchJsonFile } from '@/services/utils'
import type { ContextMenuListType, UiType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import DesktopToolsContainer from './DesktopToolsContainer.vue'
import ActionButtonsList from './ui/ActionButtonsList.vue'
import BottomNavigation from './ui/BottomNavigation.vue'
import ContextMenuButton from './ui/ContextMenuButton.vue'
import LayersTreeDrawer from './ui/LayersTreeDrawer.vue'
import ToolsMenu from './ui/ToolsMenu.vue'
import NotifyComponent from './ui/NotifyComponent.vue'
import GlobeNavigationPanel from './ui/GlobeNavigationPanel.vue'

const buttonsList = ref<UiType>()

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig
})

const ContextMenuItems: ContextMenuListType = [
    {
        text: 'appSettings',
        method: () => {
            performAction({
                actionId: 'toggleTool',
                icon: 'mdi-cog-outline',
                toolId: 'appSettings',
                width: 400,
            })
        },
        icon: 'mdi-cog',
    },
    {
        text: 'appInfo',
        method: () => {
            console.log('appInfo')
        },
        icon: 'mdi-information-box',
    },
]
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
