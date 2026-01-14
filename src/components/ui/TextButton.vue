<template>
    <v-btn
        :variant="'outlined'"
        :disabled="disabled"
        :prepend-icon="prependIcon"
        :text="text"
        rounded="0"
        slim
        elevation="2"
        @click="$emit('click')"
    >
    </v-btn>
</template>

<script lang="ts" setup>
defineProps<{
    disabled?: boolean
    prependIcon?: string
    text?: string
}>()

defineEmits<{
    (e: 'click'): void
}>()
</script>
