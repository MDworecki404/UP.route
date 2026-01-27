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
                        >mdi-restore</v-icon
                    >
                    <v-icon
                        style="cursor: pointer"
                        v-tooltip="{ text: $t('copyLink'), location: 'left' }"
                        >mdi-content-copy</v-icon
                    >
                </div>
            </template>
        </v-textarea>
    </v-card-text>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const mapLink = ref('')
</script>
