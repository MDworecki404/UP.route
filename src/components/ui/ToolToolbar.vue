<template>
    <v-divider></v-divider>
    <v-toolbar color="background" density="compact" height="40" class="py-1">
        <template #prepend>
            <v-icon
                v-if="icon"
                size="24"
                @click="iconCustomFunc && iconCustomFunc()"
                color="primary"
                :style="iconCustomFunc ? { cursor: 'pointer' } : { cursor: 'default' }"
                >{{ icon }}</v-icon
            >
            <div class="text-button pl-4 text-primary text-button--large font-weight-bold">
                {{ title ? $t(title) : '' }}
            </div>
        </template>
        <template #append>
            <v-icon v-if="showMinimize" color="primary">mdi-minus</v-icon>
            <v-icon
                v-if="!hideCloseIcon"
                style="cursor: pointer"
                color="primary"
                @click="closeCustomFunc && closeCustomFunc()"
                >mdi-close</v-icon
            >
        </template>
    </v-toolbar>
    <v-divider></v-divider>
</template>

<script setup lang="ts">
defineProps<{
    icon?: string
    title?: string
    showMinimize?: boolean
    hideCloseIcon?: boolean
    iconCustomFunc?: () => void
    closeCustomFunc?: () => void
}>()
</script>
