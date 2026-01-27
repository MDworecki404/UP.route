<template>
    <v-card-text class="pa-1 ma-0">
        <v-textarea
            v-model="mapLink"
            :label="$t('shareableLink')"
            variant="outlined"
            readonly
            no-resize
            prepend-inner-icon="mdi-link"
        >
            <template #prepend>
                <div class="d-flex flex-column ga-5">
                    <v-icon
                        style="cursor: pointer"
                        v-tooltip="{ text: $t('updateLink'), location: 'left' }"
                        @click="updateLink"
                        >mdi-restore</v-icon
                    >
                    <v-icon
                        style="cursor: pointer"
                        v-tooltip="{ text: $t('copyLink'), location: 'left' }"
                        @click="clickCopy"
                        >mdi-content-copy</v-icon
                    >
                </div>
            </template>
        </v-textarea>
    </v-card-text>
</template>

<script lang="ts" setup>
import { prepareUrl } from '@/services/url'
import { useNotifyStore } from '@/stores/notify'
import { onMounted, ref } from 'vue'

const mapLink = ref('')

const updateLink = () => {
    mapLink.value = prepareUrl()
}

const clickCopy = () => {
    navigator.clipboard.writeText(mapLink.value)

    useNotifyStore().showNotify({
        msg: 'linkCopied',
        notifyType: 'success',
        notifyDuration: 1500,
        notifyIcon: 'mdi-content-copy',
        notifyWidth: 250,
    })
}

onMounted(() => {
    updateLink()
})
</script>
