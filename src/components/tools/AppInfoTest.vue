<template>
    <div class="test">
        <ActionButton
            class="close-button"
            :icon="'mdi-close'"
            :size="28"
            :icon-size="26"
            :tooltip="{
                text: 'close',
                location: 'bottom',
            }"
            @click="closeButton"
        ></ActionButton>
        <video ref="videoRef" class="test__video" autoplay loop playsinline>
            <source :src="testVideo" type="video/mp4" />
        </video>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import testVideo from '@/assets/private/static/videos/test.dat'
import ActionButton from '../ui/ActionButton.vue'
import { useCommonStore } from '@/stores'

const videoRef = ref<HTMLVideoElement | null>(null)

const closeButton = () => {
    if (videoRef.value) {
        videoRef.value.pause()
    }

    useCommonStore().toggleAppInfoTestState()
}

onMounted(() => {
    if (videoRef.value) {
        videoRef.value.volume = 0.01
    }
})
</script>

<style scoped>
.test {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgb(var(--v-theme-primary));
    overflow: hidden;
    z-index: 9999999;
}

.test__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
}
</style>
