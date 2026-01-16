<template>
    <v-card-text>
        <v-row dense no-gutters justify="space-between">
            <v-checkbox
                v-model="shadowsObjectsEnabled"
                :label="$t('objectsShadows')"
                density="compact"
                color="primary"
                hide-details
            ></v-checkbox>
            <v-checkbox
                v-model="shadowsTerrainEnabled"
                :label="$t('terrainShadows')"
                density="compact"
                color="primary"
                hide-details
                :disabled="!shadowsObjectsEnabled"
            ></v-checkbox>
            <v-checkbox
                v-model="smoothShadowsEnabled"
                :label="$t('smoothShadows')"
                density="compact"
                color="primary"
                hide-details
                :disabled="!shadowsObjectsEnabled"
            ></v-checkbox>
        </v-row>
        <v-divider class="my-2"></v-divider>
        <v-row dense no-gutters align="center" justify="space-between" class="d-flex flex-column">
            <v-slider
                v-model="allTimeMS"
                style="width: 90%"
                color="primary"
                :label="$t('day') + ':'"
                :min="startOfYear"
                :max="endOfYear"
                :thumb-label="true"
                :thumb-size="12"
                :step="1440"
                @update:model-value="updateGlobeTime"
            >
                <template #append>
                    <v-tooltip
                        class="clock-tooltip"
                        :open-on-click="true"
                        :open-on-hover="false"
                        :close-on-content-click="false"
                        :interactive="true"
                        location="bottom left"
                    >
                        <template #activator="{ props }">
                            <v-icon v-bind="props" size="18" style="cursor: pointer"
                                >mdi-calendar</v-icon
                            >
                        </template>
                        <v-date-picker
                            v-model="calendarDate"
                            :year="new Date().getFullYear()"
                            :allowed-years="[new Date().getFullYear()]"
                            density="compact"
                            @update:model-value="updateGlobeTime"
                            color="primary"
                        >
                            <template #title>
                                {{ $t('selectDay') }}
                            </template>
                        </v-date-picker>
                    </v-tooltip>
                </template>
                <template #thumb-label>
                    <span>{{ formatedDate }}</span>
                </template>
            </v-slider>
            <v-slider
                v-model="timeOfDay"
                style="width: 90%"
                color="primary"
                :label="$t('time') + ':'"
                :min="0"
                :max="1439"
                :thumb-label="true"
                :thumb-size="12"
                :step="1"
                @update:model-value="updateGlobeTime"
            >
                <template #append>
                    <v-tooltip
                        class="clock-tooltip"
                        :open-on-click="true"
                        :open-on-hover="false"
                        :close-on-content-click="false"
                        :interactive="true"
                        location="bottom left"
                    >
                        <template #activator="{ props }">
                            <v-icon v-bind="props" size="18" style="cursor: pointer"
                                >mdi-clock-outline</v-icon
                            >
                        </template>
                        <v-time-picker
                            v-model="clockTimeOfDay"
                            density="compact"
                            :format="'24hr'"
                            @update:model-value="updateGlobeTime"
                            color="primary"
                        >
                            <template #title>
                                {{ $t('selectHour') }}
                            </template>
                        </v-time-picker>
                    </v-tooltip>
                </template>
                <template #thumb-label>
                    <span>{{ formatedHoursAndMinutes }}</span>
                </template>
            </v-slider>
        </v-row>
    </v-card-text>
    <v-card-actions class="ga-3 d-flex justify-end flex-column">
        <v-row dense no-gutters justify="end"
            ><text-button
                color="primary"
                :text="$t('setActualTime')"
                :prepend-icon="'mdi-timelapse'"
                @click="setActualTime"
        /></v-row>

        <v-row dense no-gutters
            ><text-button
                color="primary"
                :text="$t('setDefaultTime')"
                :prepend-icon="'mdi-restore'"
                @click="setDefaultTime"
        /></v-row>
    </v-card-actions>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { ShadowMode } from 'cesium'
import { computed, onMounted, ref, watch } from 'vue'
import TextButton from '../ui/TextButton.vue'

const shadowsObjectsEnabled = ref<boolean>(false)
const shadowsTerrainEnabled = ref<boolean>(false)
const smoothShadowsEnabled = ref<boolean>(false)

const timeOfDay = ref(12 * 60)
const clockTimeOfDay = ref<string>('12:00')
const calendarDate = ref<Date>(new Date())
const allTimeMS = ref<number>(0)

watch(clockTimeOfDay, (newValue) => {
    const [hours, minutes] = newValue.split(':').map(Number)
    timeOfDay.value = hours! * 60 + minutes!
})

watch(timeOfDay, (newValue) => {
    const hours = Math.floor(newValue / 60)
    const minutes = newValue % 60
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    clockTimeOfDay.value = `${formattedHours}:${formattedMinutes}`
})

watch(calendarDate, (newValue) => {
    const date = new Date(allTimeMS.value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const updatedDate = new Date(
        newValue.getFullYear(),
        newValue.getMonth(),
        newValue.getDate(),
        hours,
        minutes,
    )
    allTimeMS.value = updatedDate.getTime()
})

watch(allTimeMS, (newValue) => {
    const date = new Date(newValue)
    calendarDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
})

const startOfYear = computed(() => {
    const date = new Date(allTimeMS.value)
    const fullYear = date.getFullYear()
    const startOfYear = new Date(fullYear, 0, 1).getTime()
    return startOfYear
})

const endOfYear = computed(() => {
    const date = new Date(allTimeMS.value)
    const fullYear = date.getFullYear()
    const endOfYear = new Date(fullYear, 11, 31).getTime()
    return endOfYear
})

const formatedDate = computed(() => {
    const date = new Date(allTimeMS.value)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const formattedMonth = month < 10 ? `0${month}` : `${month}`
    const formattedDay = day < 10 ? `0${day}` : `${day}`
    return `${year}-${formattedMonth}-${formattedDay}`
})

const formatedHoursAndMinutes = computed(() => {
    const hours = Math.floor(timeOfDay.value / 60)
    const minutes = timeOfDay.value % 60
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    return `${formattedHours}:${formattedMinutes}`
})

const updateGlobeTime = () => {
    const date = new Date(allTimeMS.value)
    const hours = Math.floor(timeOfDay.value / 60)
    const minutes = timeOfDay.value % 60
    date.setHours(hours, minutes, 0, 0)
    globeInstance.time.setTime(date.getTime())
}

const setActualTime = () => {
    globeInstance.time.setToActualTime()
    allTimeMS.value = globeInstance.time.getTime()

    const date = new Date(allTimeMS.value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    timeOfDay.value = hours * 60 + minutes
}

const setDefaultTime = () => {
    globeInstance.time.resetToDefaultTime()
    allTimeMS.value = globeInstance.time.getTime()

    const date = new Date(allTimeMS.value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    timeOfDay.value = hours * 60 + minutes
}

watch(shadowsObjectsEnabled, (newValue) => {
    globeInstance.viewer.shadows = newValue
})

watch(shadowsTerrainEnabled, (newValue) => {
    if (newValue) {
        globeInstance.viewer.terrainShadows = ShadowMode.ENABLED
    } else {
        globeInstance.viewer.terrainShadows = ShadowMode.DISABLED
    }
})

watch(smoothShadowsEnabled, (newValue) => {
    if (newValue) {
        globeInstance.viewer.shadowMap.softShadows = true
    } else {
        globeInstance.viewer.shadowMap.softShadows = false
    }
})

onMounted(() => {
    allTimeMS.value = globeInstance.time.getTime()

    const date = new Date(allTimeMS.value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    timeOfDay.value = hours * 60 + minutes

    shadowsObjectsEnabled.value = globeInstance.viewer.shadows
    if (globeInstance.viewer.terrainShadows === ShadowMode.ENABLED) {
        shadowsTerrainEnabled.value = true
    } else {
        shadowsTerrainEnabled.value = false
    }
})
</script>

<style scoped>
:deep(.v-slider-thumb__label) {
    background-color: transparent !important;
    width: 100px;
    color: rgb(var(--v-theme-primary)) !important;
}

.clock-tooltip :deep(.v-overlay__content) {
    background-color: transparent !important;
}
</style>
