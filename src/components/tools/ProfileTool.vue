<template>
    <v-card-text class="pa-1 ma-0">
        <v-number-input
            v-model="samplingDistance"
            hide-details
            variant="outlined"
            :disabled="isActive"
            :min="0.1"
            :precision="1"
            :step="0.1"
            density="compact"
        >
            <template #append>
                <v-icon icon="mdi-elevation-rise" class="me-2" />
                {{ $t('samplingDistance') }}
            </template>
        </v-number-input>

        <v-row dense no-gutters>
            <v-checkbox
                v-model="useTerrainObjects"
                class="pa-0 ma-0"
                hide-details
                :disabled="isActive"
                :label="$t('useTerrainObjects')"
                color="primary"
            ></v-checkbox>
        </v-row>
        <v-row dense no-gutters>
            <TextButton
                v-if="!isActive"
                :text="$t('createProfile')"
                :prepend-icon="'mdi-chart-line'"
                color="primary"
                class="flex-grow-1"
                @click="activateTool"
            />
            <TextButton
                v-else
                :text="$t('cancel')"
                :prepend-icon="'mdi-cancel'"
                color="primary"
                class="flex-grow-1"
                @click="deactivateTool"
            />
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextButton from '../ui/TextButton.vue'

const samplingDistance = ref<number>(10)
const useTerrainObjects = ref<boolean>(false)
const isActive = ref<boolean>(false)

const activateTool = () => {
    isActive.value = true
}

const deactivateTool = () => {
    isActive.value = false
}
</script>
