<template>
    <div class="dialog-wrapper">
        <v-dialog v-model="isDialogOpen" :width="dialogContent?.width" persistent scrollable>
            <v-card class="pa-0 ma-0">
                <v-card-title class="pa-0 ma-0"
                    ><ToolToolbar
                        :icon="dialogContent?.icon"
                        :title="dialogContent?.title"
                        :close-custom-func="() => dialogStore.closeDialog()"
                /></v-card-title>
                <component :is="dialogContent?.component" v-bind="dialogContent?.props" />
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts" setup>
import { useDialogStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ToolToolbar from './ui/ToolToolbar.vue'

const dialogStore = useDialogStore()
const { isDialogOpen, dialogContent } = storeToRefs(dialogStore)
</script>
