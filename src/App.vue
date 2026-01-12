<script setup lang="ts">
import LoadingOverlay from './components/LoadingOverlay.vue'
</script>

<template>
    <v-app>
        <v-main>
            <v-fade-transition>
                <loading-overlay />
            </v-fade-transition>
            <router-view />
        </v-main>
    </v-app>
</template>
