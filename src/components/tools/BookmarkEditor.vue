<template>
    <div class="pa-2 ma-0">
        <v-text-field
            variant="outlined"
            density="compact"
            :label="$t('bookmarkName')"
            v-model="bookmarkName"
            hide-details
        ></v-text-field>
        <div class="my-5">
            <v-divider>{{ $t('options') }}</v-divider>
        </div>

        <v-row dense no-gutters class="ga-2" justify="space-between">
            <v-checkbox
                v-model="selectedOptions"
                :label="$t('cameraPosition')"
                value="cameraPosition"
                color="primary"
                density="compact"
                hide-details
            ></v-checkbox>
            <v-checkbox
                v-model="selectedOptions"
                :label="$t('layers')"
                value="layers"
                color="primary"
                density="compact"
                hide-details
            ></v-checkbox>
            <v-checkbox
                v-model="selectedOptions"
                :label="$t('shadowsSettings')"
                value="shadowsSettings"
                color="primary"
                density="compact"
                hide-details
            ></v-checkbox>
            <v-checkbox
                v-model="selectedOptions"
                :label="$t('objectInfo')"
                value="objectInfo"
                color="primary"
                density="compact"
                hide-details
            ></v-checkbox>
        </v-row>

        <div class="my-5">
            <v-divider>{{ $t('actions') }}</v-divider>
        </div>
        <v-row dense no-gutters justify="end" class="ga-2">
            <TextButton
                :text="$t('save')"
                color="primary"
                :disabled="!bookmarkName || selectedOptions.length === 0"
                prepend-icon="mdi-content-save-outline"
                @click="onSave"
            />
            <TextButton
                :text="$t('cancel')"
                color="secondary"
                prepend-icon="mdi-close-circle-outline"
                @click="onCancel"
            />
        </v-row>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import type { BookmarkElements } from '@/types/viewsBookmarks'
import { useDialogStore } from '@/stores'
import { addNewBookmark } from '@/services/viewsBookmarks'

const props = defineProps<{
    onSave: () => void
}>()

const bookmarkName = ref('')
const selectedOptions = ref<BookmarkElements[]>([])

const onCancel = () => {
    const dialogStore = useDialogStore()
    dialogStore.closeDialog()
}

const onSave = () => {
    addNewBookmark(selectedOptions.value, bookmarkName.value)

    const dialogStore = useDialogStore()
    dialogStore.closeDialog()
    props.onSave()
}
</script>
