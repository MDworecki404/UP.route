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
                <ContextMenuButton :icon="'mdi-menu'" :contextMenuList="ContextMenuItems" />
            </template>
        </v-toolbar>

        <LayersTreeDrawer></LayersTreeDrawer>

        <DesktopToolsContainer></DesktopToolsContainer>

        <BottomNavigation />
    </div>
</template>

<script setup lang="ts">
import { fetchJsonFile } from '@/services/utils'
import type { ContextMenuListType, UiType } from '@/types/ui'
import { onMounted, ref } from 'vue'
import DesktopToolsContainer from './DesktopToolsContainer.vue'
import ActionButtonsList from './ui/ActionButtonsList.vue'
import ContextMenuButton from './ui/ContextMenuButton.vue'
import LayersTreeDrawer from './ui/LayersTreeDrawer.vue'
import { useI18n } from 'vue-i18n'
import BottomNavigation from './ui/BottomNavigation.vue'

const { t } = useI18n()

const buttonsList = ref<UiType>()

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('@/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig
})

const ContextMenuItems: ContextMenuListType = [
    {
        text: t('appSettings'),
        method: () => {
            console.log('Open app settings')
        },
        icon: 'mdi-cog',
    },
    {
        text: t('appInfo'),
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
