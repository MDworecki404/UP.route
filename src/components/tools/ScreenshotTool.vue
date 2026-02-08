<template>
    <v-card-text class="pa-1 ma-0">
        <v-row dense no-gutters class="ga-5" justify="center">
            <Cropper ref="cropperRef" class="cropper my-3" :src="img" />
        </v-row>
        <v-row dense no-gutters class="ga-5" justify="space-between" align="center">
            <action-button
                :icon="'mdi-refresh'"
                :icon-size="29"
                :size="24"
                :tooltip="{
                    location: 'bottom',
                    text: $t('refresh'),
                }"
                @click="refresh"
            />
            <div>
                <text-button
                    class="mr-2"
                    :text="$t('toPdf')"
                    :prepend-icon="'mdi-file-pdf-box'"
                    color="primary"
                    @click="toPdf"
                />
                <text-button
                    :text="$t('toImage')"
                    :prepend-icon="'mdi-image-area'"
                    color="primary"
                    @click="toImage"
                />
            </div>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { globeInstance } from '@/services/globe/globe'
import { onMounted, ref, useTemplateRef } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import TextButton from '../ui/TextButton.vue'
import ActionButton from '../ui/ActionButton.vue'
import { addWaterMarkToScreenshot, imageToJPG, imageToPdf } from '@/services/utils'

const img = ref<string>('')
const cropperRef = useTemplateRef('cropperRef')

const getGlobeActualView = () => {
    const canvas = globeInstance.viewer.scene.canvas

    return canvas.toDataURL('image/png')
}

const toPdf = async () => {
    const cropperResult = cropperRef.value!.getResult()
    const watermarkedImage = await addWaterMarkToScreenshot(cropperResult)
    imageToPdf(watermarkedImage!, 'screenshot.pdf')
}

const toImage = async () => {
    const cropperResult = cropperRef.value!.getResult()
    const watermarkedImage = await addWaterMarkToScreenshot(cropperResult)

    imageToJPG(watermarkedImage!, 'screenshot.jpg')
}

const refresh = () => {
    img.value = getGlobeActualView()
}

onMounted(() => {
    img.value = getGlobeActualView()
})
</script>

<style scoped>
.cropper {
    width: 95%;
    height: 95%;
}
</style>
