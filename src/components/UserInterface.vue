<template>
    <PresentationUI v-if="presentationMode" />
    <DesktopContentContainer v-else-if="!mobile" />
    <MobileContentContainer v-else />
    <DialogWrapper />
</template>

<script setup lang="ts">
import DesktopContentContainer from './DesktopContentContainer.vue'
import DialogWrapper from './DialogWrapper.vue'
import { useDisplay } from 'vuetify'
import MobileContentContainer from './MobileContentContainer.vue'
import PresentationUI from './ui/PresentationUI.vue'
import { useCommonStore } from '@/stores'
import { storeToRefs } from 'pinia'

const { mobile } = useDisplay()
const commonStore = useCommonStore()
const { presentationMode } = storeToRefs(commonStore)
</script>
