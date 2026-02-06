<template>
    <v-card-text class="ma-0 pa-1" style="height: 300px; position: relative">
        <Line :data="chartData" :options="options" />
    </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    type ChartOptions,
} from 'chart.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
)

const props = defineProps<{
    xAxis: (string | number)[]
    yAxis: number[]
    xAxisTitle?: string
    yAxisTitle?: string
    title?: string
    chartColor?: string
    chartBGColor?: string
}>()

const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: {
            display: !!props.title,
            text: props.title ? t(props.title) : undefined,
            align: 'center',
            font: { size: 16 },
        },
        tooltip: {
            intersect: false,
            mode: 'index' as const,
            callbacks: {
                label: (context) => `${context.parsed.y!.toFixed(2)}`,
            },
        },
    },
    scales: {
        x: {
            display: true,
            grid: { display: false },
            title: { display: true, text: t(props.xAxisTitle!) },
        },
        y: {
            display: true,
            title: { display: true, text: t(props.yAxisTitle!) },
        },
    },
}

const chartData = computed(() => ({
    labels: props.xAxis,
    datasets: [
        {
            data: props.yAxis,
            borderColor: props.chartColor || '#c56c22',
            backgroundColor: props.chartBGColor
                ? `${props.chartBGColor}`
                : 'rgba(197, 108, 34, 0.2)',
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            tension: 0.2,
        },
    ],
}))
</script>
