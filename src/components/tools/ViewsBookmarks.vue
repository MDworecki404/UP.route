<template>
    <v-card-text class="pa-1 ma-0">
        <v-list v-if="bookmarks && bookmarks.bookmarks.length" density="compact" class="ma-0 pa-0">
            <v-list-item
                v-for="bookmark in bookmarks.bookmarks"
                :key="bookmark.id"
                density="compact"
            >
                <template #title>
                    <span>{{ bookmark.name }}</span>
                </template>
                <template #prepend>
                    <v-icon color="primary">mdi-bookmark</v-icon>
                </template>
                <template #append>
                    <context-menu-button
                        :context-menu-list="contextMenuOptions(bookmark)"
                        :icon="'mdi-dots-vertical'"
                        :size="29"
                        :elevation="0"
                    />
                </template>
            </v-list-item>
        </v-list>
        <span v-else class="text-disabled">{{ $t('noBookmarks') }}</span>
        <v-divider class="my-3"></v-divider>
        <v-row dense no-gutters justify="end">
            <text-button
                :text="$t('addBookmark')"
                color="primary"
                prepend-icon="mdi-bookmark-plus-outline"
                @click="triggerNewBookmark"
            />
        </v-row>
    </v-card-text>
</template>

<script lang="ts" setup>
import type { ViewsBookmarks } from '@/types/viewsBookmarks'
import { onMounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import { useDialogStore } from '@/stores'
import ContextMenuButton from '../ui/ContextMenuButton.vue'
import type { ContextMenuListType } from '@/types/ui'
import { useI18n } from 'vue-i18n'
import { deleteBookmark, runBookmark } from '@/services/viewsBookmarks'

const { t } = useI18n()

const bookmarks = ref<ViewsBookmarks>()

const refreshBookmarks = () => {
    const storedBookmarks = localStorage.getItem('viewsBookmarks')
    if (storedBookmarks) {
        bookmarks.value = JSON.parse(storedBookmarks)
    }
}

const triggerNewBookmark = async () => {
    const dialogStore = useDialogStore()
    const BookmarkEditor = (await import('@/components/tools/BookmarkEditor.vue')).default

    dialogStore.openDialog({
        title: 'addBookmark',
        component: BookmarkEditor,
        props: {
            onSave: () => {
                refreshBookmarks()
            },
        },
        icon: 'mdi-bookmark-plus-outline',
        width: 600,
    })
}

const contextMenuOptions = (item: ViewsBookmarks['bookmarks'][number]): ContextMenuListType => [
    {
        text: t('run'),
        icon: 'mdi-play',
        method: () => {
            runBookmark(item)
        },
    },
    {
        text: t('delete'),
        icon: 'mdi-delete',
        method: () => {
            deleteBookmark(item.id)
            refreshBookmarks()
        },
    },
]

onMounted(() => {
    const storedBookmarks = localStorage.getItem('viewsBookmarks')
    if (storedBookmarks) {
        bookmarks.value = JSON.parse(storedBookmarks)
    }
})
</script>
