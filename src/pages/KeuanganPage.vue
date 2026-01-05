<template>
  <!-- Halaman keuangan: ringkasan pembayaran/tagihan -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Keuangan</h2>
    <div class="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        v-for="card in kpiCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :type="card.type"
      />
    </div>
    <p v-if="analyticsStore.summaryError" class="mb-4 text-sm text-danger">
      {{ analyticsStore.summaryError }}
    </p>
    <section class="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4">
      <div class="mb-4 space-y-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-primaryDark">
              Tren Keuangan {{ trendTitle }}
            </h3>
            <p class="text-xs text-gray-500">
              Total pendapatan dan jumlah order berdasarkan periode terpilih.
            </p>
            <p class="text-[11px] text-gray-400">
              Kosongkan tanggal untuk menampilkan semua data.
            </p>
          </div>
        </div>
        <div
          class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4"
        >
          <label
            class="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 sm:w-auto sm:px-3 sm:py-2"
          >
            <AdjustmentsHorizontalIcon class="h-5 w-5 text-gray-400" />
            <span class="sr-only">Group tren</span>
            <select
              v-model="filters.group"
              class="flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-gray-700 outline-none focus:ring-0"
            >
              <option
                v-for="option in groupOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <label
            class="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 sm:w-auto sm:px-3 sm:py-2"
          >
            <CalendarIcon class="h-5 w-5 text-gray-400" />
            <span class="sr-only">Dari tanggal</span>
            <input
              v-model="filters.dateFrom"
              type="date"
              class="flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-gray-700 outline-none focus:ring-0"
            />
          </label>
          <label
            class="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 sm:w-auto sm:px-3 sm:py-2"
          >
            <CalendarIcon class="h-5 w-5 text-gray-400" />
            <span class="sr-only">Sampai tanggal</span>
            <input
              v-model="filters.dateTo"
              type="date"
              class="flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-gray-700 outline-none focus:ring-0"
            />
          </label>
          <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
              @click="applyAnalyticsFilters"
            >
              Terapkan
            </button>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary/50 hover:text-primaryDark sm:w-auto"
              @click="resetAnalyticsFilters"
            >
              Reset
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span class="inline-flex items-center gap-2">
            <span class="h-3 w-3 rounded-sm bg-primaryLight/80"></span>
            Total (Rp)
          </span>
          <span class="inline-flex items-center gap-2">
            <span class="h-3 w-3 rounded-sm bg-gray-300"></span>
            Jumlah order
          </span>
        </div>
      </div>

      <div v-if="analyticsStore.trendsLoading" class="text-center text-gray-500 py-6">
        Memuat tren keuangan...
      </div>
      <div v-else-if="analyticsStore.trendsError" class="text-sm text-danger">
        {{ analyticsStore.trendsError }}
      </div>
      <div v-else-if="!hasTrendData" class="text-center text-gray-500 py-6 text-sm">
        Belum ada data tren.
      </div>
      <div v-else class="h-56 sm:h-64 overflow-hidden">
        <OrderTrendsChart
          :labels="trendLabels"
          :sum-data="trendSumData"
          :count-data="trendCountData"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import StatCard from '@/components/common/StatCard.vue';
import OrderTrendsChart from '@/components/charts/OrderTrendsChart.vue';
import { AdjustmentsHorizontalIcon, CalendarIcon } from '@heroicons/vue/24/outline';

const analyticsStore = useAnalyticsStore();

const filters = reactive({
  dateFrom: '',
  dateTo: '',
  group: 'month',
});

const groupOptions = [
  { value: 'date', label: 'Harian' },
  { value: 'month', label: 'Bulanan' },
  { value: 'year', label: 'Tahunan' },
];

const getDefaultRange = () => {
  return { dateFrom: '', dateTo: '' };
};

const applyDefaultRange = () => {
  const { dateFrom, dateTo } = getDefaultRange();
  filters.dateFrom = dateFrom;
  filters.dateTo = dateTo;
};

const formatNumber = (value) => {
  const numeric = Number(value ?? 0);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return safe.toLocaleString('id-ID');
};

const formatCurrency = (value) => `Rp ${formatNumber(value)}`;

const displayValue = (value, { currency = false } = {}) => {
  if (analyticsStore.summaryLoading) return '...';
  if (analyticsStore.summaryError) return '-';
  return currency ? formatCurrency(value) : formatNumber(value);
};

const kpiCards = computed(() => [
  {
    label: 'Pendapatan selesai',
    value: displayValue(analyticsStore.summary.completed_order_sum, { currency: true }),
    type: 'money',
  },
  {
    label: 'Order selesai',
    value: displayValue(analyticsStore.summary.completed_order_count),
    type: 'completed',
  },
  {
    label: 'Refund',
    value: displayValue(analyticsStore.summary.refunded_order_count),
    type: 'refund',
  },
]);

const trendTitle = computed(() => {
  if (filters.group === 'year') return 'Tahunan';
  if (filters.group === 'date') return 'Harian';
  return 'Bulanan';
});

const trendGroup = computed(() => analyticsStore.trendsParams?.group || filters.group || 'month');

const formatPeriodLabel = (value, group) => {
  if (!value) return '-';
  const text = String(value);
  if (group === 'year') {
    return text.slice(0, 4);
  }
  if (group === 'month') {
    const [year, month] = text.split('-');
    const date = new Date(`${year}-${month}-01T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        year: '2-digit',
      }).format(date);
    }
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
    }).format(parsed);
  }
  return text;
};

const trendSeries = computed(() => {
  const items = Array.isArray(analyticsStore.orderTrends)
    ? analyticsStore.orderTrends
    : [];
  return items.map((item, index) => ({
    label: formatPeriodLabel(item.period || `${index}`, trendGroup.value),
    sum: Number(item.sum) || 0,
    count: Number(item.count) || 0,
  }));
});

const trendLabels = computed(() => trendSeries.value.map((item) => item.label));
const trendSumData = computed(() => trendSeries.value.map((item) => item.sum));
const trendCountData = computed(() => trendSeries.value.map((item) => item.count));
const hasTrendData = computed(() => trendSeries.value.length > 0);

const normalizeDateRange = () => {
  const from = filters.dateFrom;
  const to = filters.dateTo;
  if (from && to && from > to) {
    return { dateFrom: to, dateTo: from };
  }
  return { dateFrom: from, dateTo: to };
};

const applyAnalyticsFilters = async () => {
  const { dateFrom, dateTo } = normalizeDateRange();
  if (dateFrom !== filters.dateFrom) filters.dateFrom = dateFrom;
  if (dateTo !== filters.dateTo) filters.dateTo = dateTo;
  await Promise.all([
    analyticsStore.fetchSummary({ dateFrom, dateTo, force: true }),
    analyticsStore.fetchOrderTrends({
      dateFrom,
      dateTo,
      group: filters.group,
      force: true,
    }),
  ]);
};

const resetAnalyticsFilters = async () => {
  filters.group = 'month';
  applyDefaultRange();
  await applyAnalyticsFilters();
};

onMounted(async () => {
  if (!filters.dateFrom && !filters.dateTo) {
    applyDefaultRange();
  }
  await applyAnalyticsFilters();
});

</script>

