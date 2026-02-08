<template>
    <v-menu
        :offset="-5"
        location="bottom center"
        :close-on-content-click="false"
        :location-strategy="'connected'"
    >
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                v-tooltip="{
                    text: $t('toolsMenuTooltip'),
                    location: 'bottom',
                }"
                icon="mdi-tools"
                elevation="0"
                class="rounded-0 pa-0 ma-0 menuButton"
            >
                <v-icon color="primary" icon="mdi-tools" />
            </v-btn>
        </template>
        <v-list class="rounded-t-0" density="compact">
            <v-list-item>
                <ActionButtonsList
                    v-if="buttonsList?.toolsButtons"
                    :buttons-list="buttonsList?.toolsButtons"
                    :orientation="'horizontal'"
                    :buttons-size="29"
                    :buttons-icon-size="24"
                    :elevation="0"
                    class="d-flex justify-center ga-5 flex-wrap"
                />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ActionButtonsList from './ActionButtonsList.vue'
import { fetchJsonFile } from '@/services/utils'
import type { UiType } from '@/types/ui'
import { ref } from 'vue'

const buttonsList = ref<UiType | null>(null)

onMounted(async () => {
    buttonsList.value = await fetchJsonFile<UiType>(
        new URL('/properties/ui.json', import.meta.url).href,
    )
})
</script>

<style scoped>
.menuButton {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    position: relative;
}
</style>
