<template>
  <div ref="containerRef" class="relative h-full w-full">
    <canvas ref="canvasRef" class="h-full w-full"></canvas>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
);

Chart.defaults.font.family = "Poppins, Roboto, ui-sans-serif, system-ui";
Chart.defaults.color = '#6b7280';

const props = defineProps({
  labels: { type: Array, default: () => [] },
  sumData: { type: Array, default: () => [] },
  countData: { type: Array, default: () => [] },
});

const canvasRef = ref(null);
const containerRef = ref(null);
let chartInstance = null;
let resizeObserver = null;

const formatCompact = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
};

const formatCurrency = (value) => {
  const numeric = Number(value) || 0;
  return `Rp ${numeric.toLocaleString('id-ID')}`;
};

const formatCount = (value) => {
  const numeric = Number(value) || 0;
  return numeric.toLocaleString('id-ID');
};

const buildChartData = () => ({
  labels: props.labels,
  datasets: [
    {
      type: 'bar',
      label: 'Total (Rp)',
      data: props.sumData,
      backgroundColor: 'rgba(2, 132, 199, 0.55)',
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.6,
      categoryPercentage: 0.7,
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'Jumlah order',
      data: props.countData,
      borderColor: '#0f172a',
      pointBackgroundColor: '#0f172a',
      pointBorderColor: '#0f172a',
      pointRadius: 3,
      pointHoverRadius: 4,
      tension: 0.35,
      yAxisID: 'y1',
    },
  ],
});

const buildChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed?.y ?? 0;
          if (context.dataset?.yAxisID === 'y') {
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          }
          return `${context.dataset.label}: ${formatCount(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, autoSkip: true },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCompact(value),
      },
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: {
        precision: 0,
        callback: (value) => formatCompact(value),
      },
    },
  },
});

const renderChart = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const data = buildChartData();
  if (chartInstance) {
    chartInstance.data = data;
    chartInstance.update();
    return;
  }
  chartInstance = new Chart(canvas, {
    type: 'bar',
    data,
    options: buildChartOptions(),
  });
};

const handleResize = () => {
  if (!chartInstance) return;
  chartInstance.resize();
};

onMounted(() => {
  renderChart();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
  } else {
    window.addEventListener('resize', handleResize);
  }
});

watch(
  () => [props.labels, props.sumData, props.countData],
  () => renderChart(),
  { deep: true }
);

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', handleResize);
  }
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>
