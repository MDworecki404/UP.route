<template>
    <div class="pa-2 ma-0">
        <v-text-field
            v-model="bookmarkName"
            variant="outlined"
            density="compact"
            hide-details
            :label="$t('bookmarkName')"
        ></v-text-field>

        <v-textarea
            variant="outlined"
            density="compact"
            hide-details
            :label="$t('bookmarkConfiguration')"
            class="mt-3"
            v-model="bookmarkConfiguration"
            no-resize
        >
        </v-textarea>

        <v-row dense no-gutters class="mt-3" justify="end">
            <TextButton
                :text="$t('import')"
                color="primary"
                prepend-icon="mdi-bookmark-multiple-outline"
                :disabled="bookmarkConfiguration.length === 0 || bookmarkName.length === 0"
                @click="triggerImportBookmark"
            />
            <TextButton
                :text="$t('cancel')"
                color="secondary"
                prepend-icon="mdi-close"
                class="ml-2"
                @click="onCancel"
            />
        </v-row>
    </div>
</template>

<script lang="ts" setup>
import { importBookmarkConfiguration } from '@/services/viewsBookmarks'
import { useDialogStore } from '@/stores'
import type { ViewsBookmarks } from '@/types/viewsBookmarks'
import { ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const bookmarkName = ref('')
const bookmarkConfiguration = ref('')

const { onImport } = defineProps<{
    onImport: () => void
}>()

const triggerImportBookmark = () => {
    const parsedConfig: ViewsBookmarks['bookmarks'][number] = JSON.parse(
        bookmarkConfiguration.value,
    )

    importBookmarkConfiguration({
        ...parsedConfig,
        id: crypto.randomUUID(),
        name: bookmarkName.value,
    })
    useDialogStore().closeDialog()
    onImport()
}

const onCancel = () => {
    useDialogStore().closeDialog()
}
</script>
