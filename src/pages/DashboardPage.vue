<template>
  <div>
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Order Baru" :value="countByStatus('new')" type="new" />
      <StatCard
        label="Menunggu Validasi"
        :value="countByStatus('pending_validation')"
        type="pending"
      />
      <StatCard
        label="Dalam Uji"
        :value="countByStatus('in_testing')"
        type="testing"
      />
      <StatCard
        label="Selesai"
        :value="countByStatus('completed')"
        type="completed"
      />
    </div>

    <!-- Chart Placeholder -->
    <div
      class="bg-white rounded-xl shadow-md p-4 h-64 mb-6 flex items-center justify-center text-gray-400"
    >
      Chart mingguan (placeholder)
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Cari Customer</label
        >
        <input
          v-model="filters.search"
          type="text"
          placeholder="Nama customer..."
          class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Status</label
        >
        <select
          v-model="filters.status"
          class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua</option>
          <option value="new">Baru</option>
          <option value="pending_validation">Menunggu Validasi</option>
          <option value="in_testing">Dalam Uji</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-8">
      <h3 class="text-lg font-semibold mb-3 text-primaryDark">Daftar Order</h3>

      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Memuat data...
      </div>

      <template v-else>
        <div v-if="!visibleOrders.length" class="text-center text-gray-500 py-6 text-sm">
          Belum ada data order.
        </div>

        <div v-else>
          <!-- Mobile Cards -->
          <div class="space-y-3 md:hidden">
            <article
              v-for="order in visibleOrders"
              :key="order.id || order.orderNo"
              class="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/80 p-4 shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-wide text-gray-500">No Order</p>
                  <p class="text-base font-semibold text-surfaceDark">
                    {{ order.orderNo || '-' }}
                  </p>
                </div>
                <Badge :status="order.status" />
              </div>

              <dl class="mt-3 space-y-2 text-sm text-gray-600">
                <div class="flex justify-between gap-4">
                  <dt class="font-medium text-gray-500">Customer</dt>
                  <dd class="text-right font-semibold text-surfaceDark">
                    {{ order.customerName || '-' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="font-medium text-gray-500">Komoditi</dt>
                  <dd class="text-right">
                    {{ order.commodity || '-' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="font-medium text-gray-500">Tanggal Masuk</dt>
                  <dd class="text-right">
                    {{ order.date || '-' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="font-medium text-gray-500">Sisa Bayar</dt>
                  <dd class="text-right font-semibold text-primary">
                    Rp {{ Number(order.remaining || 0).toLocaleString('id-ID') }}
                  </dd>
                </div>
              </dl>

              <router-link
                v-if="order?.id"
                :to="{ path: '/kaji-ulang', query: { orderId: order.id } }"
                class="mt-4 inline-flex items-center text-xs font-semibold text-primary hover:text-primaryDark"
              >
                Lihat Detail 
              </router-link>
            </article>
          </div>

          <!-- Desktop table -->
          <div class="hidden overflow-x-auto md:block">
            <table class="min-w-full text-sm text-left text-gray-600">
              <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th class="px-4 py-3">No Order</th>
                  <th class="px-4 py-3">Customer</th>
                  <th class="px-4 py-3">Komoditi</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Tgl Masuk</th>
                  <th class="px-4 py-3">Sisa Bayar</th>
                  <th class="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in visibleOrders"
                  :key="order.id || order.orderNo"
                  class="border-b last:border-b-0"
                >
                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ order.orderNo || '-' }}
                  </td>
                  <td class="px-4 py-3">{{ order.customerName || '-' }}</td>
                  <td class="px-4 py-3">{{ order.commodity || '-' }}</td>
                  <td class="px-4 py-3">
                    <Badge :status="order.status" />
                  </td>
                  <td class="px-4 py-3">{{ order.date || '-' }}</td>
                  <td class="px-4 py-3">
                    Rp {{ Number(order.remaining || 0).toLocaleString('id-ID') }}
                  </td>
                  <td class="px-4 py-3">
                    <router-link
                      v-if="order?.id"
                      :to="{ path: '/kaji-ulang', query: { orderId: order.id } }"
                      class="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      Detail
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <h3 class="text-lg font-semibold mb-3 text-primaryDark">
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
                  <th class="px-4 py-3">Causer</th>
                  <th class="px-4 py-3">Aksi</th>
                  <th class="px-4 py-3">Subject / Ref</th>
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
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import { useActivityStore } from '@/stores/useActivityStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
import StatCard from '@/components/common/StatCard.vue';
import Badge from '@/components/common/Badge.vue';

// === Store setup ===
const orderStore = useKajiUlangStore();
const customerStore = useCustomerStore();
const activityStore = useActivityStore();
const authStore = useAuthStore();
const { hasAnyPermission, isSuperAdmin } = useAuthorization();
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

// === Fetch data on mount ===
onMounted(async () => {
  try {
    activityStore.setActiveUser(authStore.currentUser?.id ?? null);
    await Promise.all([
      orderStore.fetchAll?.(),
      customerStore.fetchAll?.(),
      activityStore.fetchAll?.({
        scope: activityScope.value,
        viewer: authStore.currentUser,
        viewerId: authStore.currentUser?.id,
        viewerIsSuperAdmin: isSuperAdmin.value,
        canViewAll: canViewAllActivity.value,
        include: ['causer', 'subject'],
      }),
    ]);
  } finally {
    isLoading.value = false;
  }
});

// === Lookup customer name ===
const customerMap = computed(() => {
  const map = {};
  (customerStore.customers || []).forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
});

// === Filters ===
const filters = reactive({
  search: '',
  status: '',
});

// === KPI ===
function countByStatus(status) {
  return (orderStore.orders || []).filter((o) => o.status === status).length;
}

// === Flatten Orders ===
const flattenedOrders = computed(() =>
  (orderStore.orders || []).map((o) => ({
    ...o,
    customerName: customerMap.value[o.customerId] ?? '',
  }))
);

// === Filtered Orders ===
const filteredOrders = computed(() =>
  flattenedOrders.value.filter((o) => {
    const matchSearch = filters.search
      ? o.customerName?.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchStatus = filters.status ? o.status === filters.status : true;
    return matchSearch && matchStatus;
  })
);

const rowsPerPage = 5;
const visibleOrders = computed(() =>
  filteredOrders.value.slice(0, rowsPerPage)
);

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
