<template>
    <v-card-text class="pa-1 ma-0">
        <v-textarea
            v-model="mapLink"
            :label="$t('shareableLink')"
            variant="outlined"
            color="primary"
            readonly
            no-resize
            hide-details
            prepend-inner-icon="mdi-link"
        >
            <template #prepend>
                <div class="d-flex flex-column ga-5">
                    <v-icon
                        style="cursor: pointer"
                        v-tooltip="{ text: $t('updateLink'), location: 'left' }"
                        color="primary"
                        @click="updateLink"
                        >mdi-restore</v-icon
                    >
                    <v-icon
                        style="cursor: pointer"
                        v-tooltip="{ text: $t('copyLink'), location: 'left' }"
                        color="primary"
                        @click="clickCopy"
                        >mdi-content-copy</v-icon
                    >
                </div>
            </template>
        </v-textarea>

        <v-row dense no-gutters justify="center" class="pt-1">
            <canvas ref="qrCanvas" width="200" height="200"></canvas>
        </v-row>
    </v-card-text>
</template>

<script lang="ts" setup>
import { prepareUrl } from '@/services/url'
import { useNotifyStore } from '@/stores/notify'
import * as QRCode from 'qrcode'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

const theme = useTheme()
const { mobile } = useDisplay()

const mapLink = ref('')
const qrCanvas = useTemplateRef('qrCanvas')

const updateLink = async () => {
    mapLink.value = await prepareUrl(mobile.value)
    generateQRCode()
}

watch(theme.current, () => {
    generateQRCode()
})

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

const generateQRCode = () => {
    QRCode.toCanvas(
        qrCanvas.value,
        mapLink.value,
        {
            width: 200,
            color: {
                dark: theme.current.value.colors.primary,
                light: theme.current.value.colors.background,
            },
        },
        function (error) {
            if (error) console.error(error)
        },
    )
}

onMounted(async () => {
    await updateLink()
})
</script>
