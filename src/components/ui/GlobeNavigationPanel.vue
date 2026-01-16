<template>
    <div :class="mobile ? 'mobile-globe-navigation-panel' : 'globe-navigation-panel'">
        <ActionButtonsList
            v-if="buttonsList?.navigationButtons"
            :buttons-list="buttonsList?.navigationButtons"
            :orientation="'vertical'"
            :button-variant="'outlined'"
            :button-custom-class="'bg-background'"
            :button-color="'primary'"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ActionButtonsList from './ActionButtonsList.vue'
import { fetchJsonFile } from '@/services/utils'
import type { UiType } from '@/types/ui'
import { useDisplay } from 'vuetify'

const buttonsList = ref<UiType>()

const { mobile } = useDisplay()

onMounted(async () => {
    const uiConfig = await fetchJsonFile<UiType>(
        new URL('/properties/ui.json', import.meta.url).href,
    )

    buttonsList.value = uiConfig
})
</script>

<style scoped>
.globe-navigation-panel {
    position: absolute;
    bottom: 50px;
    right: 12px;
    z-index: 5;
}

.mobile-globe-navigation-panel {
    position: absolute;
    top: 50px;
    right: 12px;
    z-index: 5;
}
</style>
