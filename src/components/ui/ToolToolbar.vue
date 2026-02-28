<template>
    <v-divider></v-divider>
    <v-toolbar color="background" density="compact" height="40" class="py-1">
        <template #prepend>
            <div class="pa-0 ma-0" style="width: 24px">
                <v-icon
                    v-if="icon"
                    size="24"
                    @click="iconCustomFunc && iconCustomFunc()"
                    color="primary"
                    :style="iconCustomFunc ? { cursor: 'pointer' } : { cursor: 'default' }"
                    >{{ icon }}</v-icon
                >
            </div>
        </template>
        <div
            class="text-button text-primary text-button--large font-weight-bold text-truncate"
            :class="icon ? 'pl-2' : 'pl-1'"
        >
            {{ title ? $t(title) : '' }}
        </div>
        <template #append>
            <v-icon
                v-if="!hideFullscreenIcon"
                color="primary"
                style="cursor: pointer"
                @click="setFullscreenCustomFunc && setFullscreenCustomFunc()"
                >{{ !fullscreen ? 'mdi-fullscreen' : 'mdi-fullscreen-exit' }}</v-icon
            >
            <v-icon
                v-if="showMinimize"
                color="primary"
                style="cursor: pointer"
                @click="minimizeCustomFunc && minimizeCustomFunc()"
                >{{ !minimized ? 'mdi-minus' : 'mdi-window-maximize' }}</v-icon
            >
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
    minimized?: boolean
    fullscreen?: boolean
    hideFullscreenIcon?: boolean
    iconCustomFunc?: () => void
    closeCustomFunc?: () => void
    minimizeCustomFunc?: () => void
    setFullscreenCustomFunc?: () => void
}>()
</script>
