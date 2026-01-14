<template>
    <v-divider></v-divider>
    <v-toolbar color="background" density="compact" height="40" class="py-1">
        <template #prepend>
            <v-icon
                v-if="icon"
                size="24"
                @click="iconCustomFunc && iconCustomFunc()"
                :style="iconCustomFunc ? { cursor: 'pointer' } : {}"
                >{{ icon }}</v-icon
            >
            <div class="text-button pl-4">{{ $t(title) }}</div>
        </template>
        <template #append>
            <v-icon v-if="showMinimize">mdi-minus</v-icon>
            <v-icon
                v-if="!hideCloseIcon"
                style="cursor: pointer"
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
    title: string
    showMinimize?: boolean
    hideCloseIcon?: boolean
    iconCustomFunc?: () => void
    closeCustomFunc?: () => void
}>()
</script>
