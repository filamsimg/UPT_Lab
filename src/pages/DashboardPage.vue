<template>
  <!-- Dashboard ringkasan KPI/statistik -->
  <div>
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 mb-4 sm:mb-6">
      <StatCard
        v-for="card in kpiCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :type="card.type"
      />
    </div>
    <p
      v-if="analyticsStore.summaryError && canViewAnalytics"
      class="mb-4 text-sm text-danger"
    >
      {{ analyticsStore.summaryError }}
    </p>

    <!-- Chart -->
    <section class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4 mb-6">
      <div class="mb-4 space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-primaryDark">
              Tren Order Selesai {{ trendTitle }}
            </h3>
            <p class="text-xs text-gray-500">
              Total pendapatan dan jumlah order selesai per periode.
            </p>
            <p class="text-[11px] text-gray-400">
              Kosongkan tanggal untuk menampilkan semua data.
            </p>
          </div>
        </div>
        <div
          v-if="canViewAnalytics"
          class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4"
        >
          <label
            class="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 sm:w-auto sm:px-3 sm:py-2"
          >
            <AdjustmentsHorizontalIcon class="h-5 w-5 text-gray-400" />
            <span class="sr-only">Group tren</span>
            <select
              v-model="analyticsFilters.group"
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
              v-model="analyticsFilters.dateFrom"
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
              v-model="analyticsFilters.dateTo"
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
        <div v-if="canViewAnalytics" class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
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

      <div v-if="!canViewAnalytics" class="text-sm text-gray-500 py-6 text-center">
        Anda tidak memiliki izin analytics.
      </div>
      <div v-else-if="analyticsStore.trendsLoading" class="text-center text-gray-500 py-6">
        Memuat tren order...
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

    <!-- Recent Activity -->
    <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4">
      <h3 class="text-base sm:text-lg font-semibold mb-3 text-primaryDark">
        Aktivitas Terbaru
      </h3>

      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Memuat aktivitas...
      </div>

      <div v-else>
        <div v-if="!visibleActivities.length" class="text-center text-gray-500 py-6 text-sm">
          Belum ada aktivitas.
        </div>

        <div v-else>
          <!-- Mobile cards -->
          <div class="space-y-3 md:hidden">
            <article
              v-for="activity in visibleActivities"
              :key="activity.id || activity.timestamp || activity.reference"
              class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <p class="text-xs uppercase tracking-wide text-gray-500">Tanggal</p>
              <p class="text-sm font-semibold text-surfaceDark">
                {{ activity.date }}
              </p>
              <dl class="mt-3 space-y-1.5 text-sm text-gray-600">
                <div class="flex justify-between gap-4">
                  <dt class="font-medium text-gray-500">Causer</dt>
                  <dd class="text-right">{{ activity.causer }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-500">Aksi</dt>
                  <dd class="text-sm text-surfaceDark">{{ activity.action }}</dd>
                </div>
                <div class="flex justify-between gap-4 text-sm">
                  <dt class="font-medium text-gray-500">Subject</dt>
                  <dd class="text-right font-semibold">{{ activity.subject }}</dd>
                </div>
                <div v-if="activity.ip" class="flex justify-between gap-4 text-xs text-gray-500">
                  <dt class="font-medium">IP</dt>
                  <dd class="text-right font-semibold">{{ activity.ip }}</dd>
                </div>
              </dl>
            </article>
          </div>

          <!-- Desktop table -->
          <div class="hidden overflow-x-auto md:block">
            <table class="min-w-full text-sm text-left text-gray-600">
              <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th class="px-4 py-3">Tanggal</th>
                  <th class="px-4 py-3">Aktor</th>
                  <th class="px-4 py-3">Aksi</th>
                  <th class="px-4 py-3">Subject</th>
                  <th class="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="activity in visibleActivities"
                  :key="activity.id || activity.timestamp || activity.reference"
                  class="border-b last:border-b-0"
                >
                  <td class="px-4 py-3">{{ activity.date }}</td>
                  <td class="px-4 py-3">{{ activity.causer }}</td>
                  <td class="px-4 py-3">
                    <span class="font-semibold text-surfaceDark">{{ activity.action }}</span>
                  </td>
                  <td class="px-4 py-3">{{ activity.subject || '-' }}</td>
                  <td class="px-4 py-3">{{ activity.ip || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { AdjustmentsHorizontalIcon, CalendarIcon } from '@heroicons/vue/24/outline';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import { useActivityStore } from '@/stores/useActivityStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
import StatCard from '@/components/common/StatCard.vue';
import OrderTrendsChart from '@/components/charts/OrderTrendsChart.vue';

// === Store setup ===
const orderStore = useKajiUlangStore();
const analyticsStore = useAnalyticsStore();
const activityStore = useActivityStore();
const authStore = useAuthStore();
const { hasAnyPermission, isSuperAdmin } = useAuthorization();
const DEFAULT_TREND_GROUP = 'month';
const canViewAnalytics = computed(() =>
  isSuperAdmin.value ||
    hasAnyPermission(
      'analytics.index',
      'analytics.summary',
      'analytics.trends',
      'analytic.index'
    )
);
const isLoading = ref(true);
const canViewAllActivity = computed(() =>
  isSuperAdmin.value ||
    hasAnyPermission(
      'activity.index',
      'activities.index',
      'activity.show',
      'activities.show',
      'activities.view_all',
      'activities.*'
    )
);
const activityScope = computed(() => (canViewAllActivity.value ? 'all' : 'mine'));

// === Filters (analytics trends) ===
const analyticsFilters = reactive({
  dateFrom: '',
  dateTo: '',
  group: DEFAULT_TREND_GROUP,
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
  analyticsFilters.dateFrom = dateFrom;
  analyticsFilters.dateTo = dateTo;
};

const normalizeDateRange = () => {
  const from = analyticsFilters.dateFrom;
  const to = analyticsFilters.dateTo;
  if (from && to && from > to) {
    return { dateFrom: to, dateTo: from };
  }
  return { dateFrom: from, dateTo: to };
};

const applyAnalyticsFilters = async () => {
  const { dateFrom, dateTo } = normalizeDateRange();
  if (dateFrom !== analyticsFilters.dateFrom) analyticsFilters.dateFrom = dateFrom;
  if (dateTo !== analyticsFilters.dateTo) analyticsFilters.dateTo = dateTo;
  if (!canViewAnalytics.value) return;
  await analyticsStore.fetchOrderTrends({
    dateFrom,
    dateTo,
    group: analyticsFilters.group,
    force: true,
  });
};

const resetAnalyticsFilters = async () => {
  analyticsFilters.group = DEFAULT_TREND_GROUP;
  applyDefaultRange();
  await applyAnalyticsFilters();
};

// === Fetch data on mount ===
onMounted(async () => {
  try {
    activityStore.setActiveUser(authStore.currentUser?.id ?? null);
    if (!analyticsFilters.dateFrom && !analyticsFilters.dateTo) {
      applyDefaultRange();
    }
    const tasks = [
      orderStore.fetchAll?.(),
      activityStore.fetchAll?.({
        scope: activityScope.value,
        viewer: authStore.currentUser,
        viewerId: authStore.currentUser?.id,
        viewerIsSuperAdmin: isSuperAdmin.value,
        canViewAll: canViewAllActivity.value,
        include: ['causer', 'subject'],
      }),
    ];
    if (canViewAnalytics.value) {
      tasks.push(
        analyticsStore.fetchSummary({ force: true }),
        analyticsStore.fetchOrderTrends({
          dateFrom: analyticsFilters.dateFrom,
          dateTo: analyticsFilters.dateTo,
          group: analyticsFilters.group,
          force: true,
        })
      );
    }
    await Promise.all(tasks);
  } finally {
    isLoading.value = false;
  }
});

// === KPI ===
function countByStatus(status) {
  return (orderStore.orders || []).filter((o) => o.status === status).length;
}

const resolveKpiValue = (field, fallbackStatus) => {
  if (canViewAnalytics.value) {
    if (analyticsStore.summaryLoading) return '...';
    if (analyticsStore.summaryError) return countByStatus(fallbackStatus);
    const value = Number(analyticsStore.summary?.[field] ?? 0);
    return Number.isFinite(value) ? value : 0;
  }
  return countByStatus(fallbackStatus);
};

const kpiCards = computed(() => [
  {
    label: 'Menunggu Kaji Ulang',
    value: resolveKpiValue('awaiting_review_order_count', 'awaiting_review'),
    type: 'pending',
  },
  {
    label: 'Menunggu Pembayaran',
    value: resolveKpiValue('awaiting_payment_order_count', 'awaiting_payment'),
    type: 'pending',
  },
  {
    label: 'Proses Pengujian',
    value: resolveKpiValue('testing_order_count', 'testing'),
    type: 'testing',
  },
  {
    label: 'Selesai',
    value: resolveKpiValue('completed_order_count', 'completed'),
    type: 'completed',
  },
]);

const trendTitle = computed(() => {
  if (analyticsFilters.group === 'year') return 'Tahunan';
  if (analyticsFilters.group === 'date') return 'Harian';
  return 'Bulanan';
});

const trendGroup = computed(
  () => analyticsStore.trendsParams?.group || analyticsFilters.group || DEFAULT_TREND_GROUP
);

const formatTrendLabel = (value, group) => {
  if (!value) return '-';
  const text = String(value);
  if (group === 'year') return text.slice(0, 4);
  if (group === 'month') {
    const parts = text.split('-');
    if (parts.length >= 2) {
      const [year, month] = parts;
      const date = new Date(`${year}-${month}-01T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('id-ID', {
          month: 'short',
          year: '2-digit',
        }).format(date);
      }
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
    label: formatTrendLabel(item.period || `${index}`, trendGroup.value),
    sum: Number(item.sum) || 0,
    count: Number(item.count) || 0,
  }));
});

const trendLabels = computed(() => trendSeries.value.map((item) => item.label));
const trendSumData = computed(() => trendSeries.value.map((item) => item.sum));
const trendCountData = computed(() => trendSeries.value.map((item) => item.count));
const hasTrendData = computed(() => trendSeries.value.length > 0);

const rowsPerPage = 5;

// === Recent Activities ===
const recentActivities = computed(() => {
  const list = (activityStore.events || []).map((a) => {
    const ts = a.createdAt ? new Date(a.createdAt) : null;
    const causer =
      a.metadata?.causerName ||
      a.metadata?.causer?.email ||
      a.userId ||
      '-';
    const subject =
      a.metadata?.subjectName || a.referenceId || a.metadata?.referenceId || '-';
    const ip =
      a.metadata?.properties?.causer_ip_address ||
      a.metadata?.ip ||
      a.metadata?.causer_ip_address ||
      '';
    return {
      id: a.id,
      date: ts
        ? new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(ts)
        : '-',
      causer,
      subject,
      action: a.title || a.metadata?.action || a.type || '-',
      reference: a.referenceId || null,
      ip,
      createdAt: ts,
    };
  });
  return list
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, rowsPerPage);
});

const visibleActivities = computed(() => recentActivities.value);
</script>

<style scoped>
.text-primaryDark {
  color: #075985;
}
</style>

