<template>
    <v-snackbar
        v-model="isActive"
        :color="type"
        :min-width="width"
        :max-width="width"
        :timeout="duration"
        style="z-index: 99999"
    >
        <template #text>
            <div class="d-flex">
                <v-icon left>{{ icon }}</v-icon>
                <span class="ml-2">{{ message }}</span>
            </div>
        </template>
    </v-snackbar>
</template>

<script lang="ts" setup>
import { useNotifyStore } from '@/stores/notify'
import { storeToRefs } from 'pinia'

const notifyStore = useNotifyStore()
const { isActive, message, type, width, icon, duration } = storeToRefs(notifyStore)
</script>
