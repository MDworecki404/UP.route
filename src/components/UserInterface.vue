<template>
    <DesktopContentContainer v-if="!mobile" />
    <MobileContentContainer v-else />
    <DialogWrapper />
</template>

<script setup lang="ts">
import DesktopContentContainer from './DesktopContentContainer.vue'
import DialogWrapper from './DialogWrapper.vue'
import { useDisplay } from 'vuetify'
import MobileContentContainer from './MobileContentContainer.vue'

const { mobile } = useDisplay()
</script>
