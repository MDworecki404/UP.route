<template>
    <div class="temp-actions pa-1">
        <v-fade-transition>
            <TextButton
                v-if="commonStore.routeCreated"
                :prepend-icon="'mdi-map-marker-path'"
                color="primary"
                :text="$t('clearRoute')"
                class="bg-background"
                @click="commonStore.removeRoute()"
            />
        </v-fade-transition>
    </div>
</template>

<script lang="ts" setup>
import TextButton from './TextButton.vue'
import { useCommonStore } from '@/stores'

const commonStore = useCommonStore()
</script>
