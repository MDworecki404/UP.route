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
        <v-row dense no-gutters class="mt-2">
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
import { onUnmounted, ref } from 'vue'
import TextButton from '../ui/TextButton.vue'
import { globeInstance } from '@/services/globe/globe'
import { profileCreated } from '@/services/eventBus'

const samplingDistance = ref<number>(10)
const isActive = ref<boolean>(false)

const activateTool = () => {
    isActive.value = true
    globeInstance.profile.setUpDrawing(samplingDistance.value)
    const listener = profileCreated.addEventListener((evt) => {
        if (evt) {
            globeInstance.profile.endDrawing()
            deactivateTool()
            listener()
        }
    })
}

const deactivateTool = () => {
    isActive.value = false
    globeInstance.events.setDefaultEvents()
}

onUnmounted(() => {
    if (isActive.value) {
        deactivateTool()
    }

    globeInstance.profile.resetProfile()
})
</script>
