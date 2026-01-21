<template>
    <div class="desktop-content-container">
        <v-toolbar
            elevation="2"
            height="47"
            density="comfortable"
            color="background"
            class="toolbar-with-centered-menu"
        >
            <template #prepend>
                <ActionButtonsList
                    v-if="buttonsList?.mobileToolbarActionButtons"
                    :buttons-list="buttonsList?.mobileToolbarActionButtons"
                    :orientation="'horizontal'"
                />
            </template>

            <div class="centered-tools-menu">
                <ToolsMenu />
            </div>

            <template #append>
                <ActionButtonsList
                    v-if="buttonsList?.mobileToolbarEndActionButtons"
                    :buttons-list="buttonsList?.mobileToolbarEndActionButtons"
                    :orientation="'horizontal'"
                />
                <ContextMenuButton
                    :icon="'mdi-dots-horizontal'"
                    :contextMenuList="ContextMenuItems"
                />
            </template>
        </v-toolbar>

        <MobileToolsContainer />

        <GlobeNavigationPanel />

        <NotifyComponent />
    </div>
</template>

<script setup lang="ts">
import { performAction } from '@/services/actions'
import { fetchJsonFile } from '@/services/utils'
import type { ContextMenuListType, UiType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionButtonsList from './ui/ActionButtonsList.vue'
import ContextMenuButton from './ui/ContextMenuButton.vue'
import ToolsMenu from './ui/ToolsMenu.vue'
import MobileToolsContainer from './MobileToolsContainer.vue'
import GlobeNavigationPanel from './ui/GlobeNavigationPanel.vue'
import NotifyComponent from './ui/NotifyComponent.vue'
import { useDialogStore } from '@/stores'
const { t } = useI18n()

const buttonsList = ref<UiType>()

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig
})

const ContextMenuItems: ContextMenuListType = [
    {
        text: t('appSettings'),
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
        text: t('appInfo'),
        method: async () => {
            const appInfo = (await import('@/components/tools/AppInfo.vue')).default
            useDialogStore().openDialog({
                component: appInfo,
                title: 'appInfo',
                width: 600,
                icon: 'mdi-information-box',
            })
        },
        icon: 'mdi-information-box',
    },
]
</script>

<style scoped>
.toolbar-with-centered-menu {
    position: relative;
}

.centered-tools-menu {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}
</style>
