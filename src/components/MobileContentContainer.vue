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
        method: () => {
            console.log('appInfo')
        },
        icon: 'mdi-information-box',
    },
]
</script>
