<template>
    <div>
        <v-toolbar color="background" density="compact">
            <template #prepend>
                <ActionButton
                    :icon="'mdi-close-thick'"
                    :tooltip="{
                        location: 'bottom',
                        text: $t('close'),
                    }"
                    @click="turnOffPresentationMode"
                ></ActionButton>
            </template>
            <template #title>
                <span class="text-button">{{ dynamicT.translate(presentationConfig?.title) }}</span>
            </template>
        </v-toolbar>

        <v-card
            v-if="actualSlide"
            class="presentation-slide-card mx-auto"
            :class="mobile ? 'presentation-slide-card--mobile' : 'presentation-slide-card--desktop'"
            elevation="6"
            rounded="lg"
            color="surface"
        >
            <v-card-item>
                <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="36">
                        <span class="text-caption font-weight-bold">{{ actualIndex }}</span>
                    </v-avatar>
                </template>
                <v-card-title class="text-subtitle-1 font-weight-bold text-wrap">
                    {{ dynamicT.translate(actualSlide.title) }}
                </v-card-title>
                <template #append>
                    <v-chip size="small" color="primary" variant="tonal" label>
                        {{ actualIndex }}&nbsp;/&nbsp;{{ slidesLength }}
                    </v-chip>
                </template>
            </v-card-item>

            <v-divider></v-divider>

            <v-card-text class="text-body-2">
                {{ dynamicT.translate(actualSlide.text) }}
            </v-card-text>
        </v-card>

        <v-bottom-navigation density="compact">
            <v-pagination
                v-model="actualIndex"
                :variant="'text'"
                :length="slidesLength"
                :density="'compact'"
                class="w-100"
                :color="'primary'"
                :show-first-last-page="true"
                @update:model-value="onSlideChange"
            ></v-pagination>
        </v-bottom-navigation>
    </div>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores'
import ActionButton from './ActionButton.vue'
import { useDynamicTranslation } from '@/composables/useDynamicTranslation'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { triggerNextSlide } from '@/services/presentations/presentation'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const commonStore = useCommonStore()
const { presentationConfig } = storeToRefs(commonStore)

const dynamicT = useDynamicTranslation()

const turnOffPresentationMode = () => {
    commonStore.togglePresentationMode()
    commonStore.clearPresentationConfig()
}

const actualIndex = ref(1)

const slides = computed(() => presentationConfig.value?.slides ?? [])
const slidesLength = computed(() => slides.value.length)

const actualSlide = computed(() => {
    return slides.value[actualIndex.value - 1]
})

const onSlideChange = (newIndex: number) => {
    triggerNextSlide(newIndex)
}

onMounted(() => {
    actualIndex.value = 1
    onSlideChange(1)
})
</script>

<style scoped>
.presentation-slide-card {
    position: absolute;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    max-height: 40vh;
    overflow-y: auto;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.presentation-slide-card--desktop {
    width: 420px;
}

.presentation-slide-card--mobile {
    width: calc(100vw - 24px);
}
</style>
