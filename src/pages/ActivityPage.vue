<template>
  <!-- Halaman riwayat aktivitas/log pengguna -->
  <div class="space-y-6">
    <header class="flex flex-col gap-2">
      <p
        class="text-xs font-semibold uppercase tracking-wide text-primaryLight"
      >
        Monitoring
      </p>
      <h1 class="text-2xl font-semibold text-surfaceDark">
        Riwayat Aktivitas Sistem
      </h1>
      <p class="text-sm text-gray-500">
        Lacak status login, pembuatan permintaan, dan update pembayaran terbaru
        yang terjadi di aplikasi.
      </p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Total Aktivitas
        </p>
        <p class="mt-2 text-3xl font-semibold text-primaryDark">
          {{ stats.total }}
        </p>
        <p class="text-xs text-gray-500">Seluruh event yang tersimpan.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Akses Pengguna
        </p>
        <p class="mt-2 text-3xl font-semibold text-emerald-600">
          {{ stats.login }}
        </p>
        <p class="text-xs text-gray-500">Riwayat pengguna masuk / keluar.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Permintaan Pengujian
        </p>
        <p class="mt-2 text-3xl font-semibold text-sky-600">
          {{ stats.request }}
        </p>
        <p class="text-xs text-gray-500">
          Penambahan & perubahan status permintaan pengujian.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Pembayaran</p>
        <p class="mt-2 text-3xl font-semibold text-amber-600">
          {{ stats.payment }}
        </p>
        <p class="text-xs text-gray-500">
          Update status pembayaran permintaan pengujian.
        </p>
      </article>
    </section>

    <section
      v-if="canViewAllActivity"
      class="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div
        class="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
      >
        <span class="font-semibold text-gray-700 sm:w-full"
          >Filter Super Admin:</span
        >

        <label
          class="flex w-full flex-col gap-1 text-xs font-semibold text-gray-600 sm:w-56"
        >
          ID user (opsional)
          <input
            v-model="filterUserId"
            type="text"
            placeholder="ID user"
            class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label
          class="flex w-full flex-col gap-1 text-xs font-semibold text-gray-600 sm:w-48"
        >
          Dari tanggal
          <input
            v-model="dateFrom"
            type="date"
            class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label
          class="flex w-full flex-col gap-1 text-xs font-semibold text-gray-600 sm:w-48"
        >
          Sampai tanggal
          <input
            v-model="dateTo"
            type="date"
            class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <div
          class="grid w-full grid-cols-1 gap-2 pt-2 sm:w-56 sm:grid-cols-2 sm:pt-0"
        >
          <button
            type="button"
            class="flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-primaryDark px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            @click="loadActivities"
          >
            Terapkan
          </button>
          <button
            type="button"
            class="flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary/60"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        v-if="filterUserId || dateFrom || dateTo"
        class="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 sm:px-6"
      >
        Menyaring:
        <span v-if="filterUserId"
          >ID pengguna =
          <span class="font-mono text-gray-700">{{ filterUserId }}</span></span
        >
        <span v-if="dateFrom || dateTo">
          <span v-if="filterUserId"> � </span>
          {{ dateFrom || 'awal' }} � {{ dateTo || 'sekarang' }}
        </span>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        class="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
            :class="[
              activeFilter === filter.value
                ? 'border-primary bg-primary/10 text-primaryDark'
                : 'border-gray-200 text-gray-600 hover:border-primary/40',
            ]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div
        v-if="showErrorBanner"
        class="mx-4 mt-3 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
      >
        <span>
          {{ apiError }}
          � tidak dapat memuat data aktivitas. Coba ulangi atau cek backend.
        </span>
        <button
          type="button"
          class="text-xs font-semibold text-amber-800 hover:text-amber-900"
          @click="dismissError"
        >
          Tutup
        </button>
      </div>

      <div
        v-if="!hasEvents"
        class="flex flex-col items-center gap-3 px-6 py-16 text-center text-gray-500"
      >
        <ClockIcon class="h-10 w-10 text-gray-400" />
        <p class="text-base font-medium text-gray-700">Belum ada riwayat</p>
        <p class="text-sm max-w-md">
          Aktivitas akan otomatis terekam ketika pengguna login, membuat
          permintaan, atau memperbarui status pembayaran.
        </p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="group in groupedEvents"
          :key="group.date"
          class="flex flex-col gap-4 px-4 py-6 sm:px-6"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600"
            >
              {{ group.label }}
            </span>
            <span class="text-xs text-gray-400"
              >{{ group.items.length }} aktivitas</span
            >
          </div>

          <ol class="relative border-s border-gray-200 pl-6">
            <li
              v-for="event in group.items"
              :key="event.id"
              class="mb-8 last:mb-0"
            >
              <span
                class="absolute -start-1.5 flex h-3 w-3 items-center justify-center rounded-full border bg-white"
                :class="typeConfig[event.type]?.dot"
              ></span>
              <div
                class="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-surfaceDark">{{
                    event.title
                  }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="statusClass(event.status)"
                  >
                    {{ statusLabel(event.status) }}
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="typeConfig[event.type]?.badge"
                  >
                    {{ typeConfig[event.type]?.label || 'Sistem' }}
                  </span>
                  <span class="text-xs text-gray-400">{{
                    formatTime(event.createdAt)
                  }}</span>
                </div>
                <div
                  class="flex flex-wrap items-center gap-3 text-xs text-gray-500"
                >
                  <button
                    type="button"
                    class="text-[11px] font-medium text-primary hover:text-primaryDark"
                    @click="copyCauserId(event)"
                  >
                    {{ resolveIdLabel(event) }}:
                    <span class="font-mono">{{ resolveIdValue(event) }}</span>
                  </button>
                  <span>
                    {{ resolveActorLabel(event) }}:
                    <span class="font-semibold text-gray-700">{{
                      resolveActorValue(event)
                    }}</span>
                  </span>
                  <span v-if="displaySubject(event)">
                    {{ resolveSubjectLabel(event) }}:
                    <span class="font-semibold text-gray-700">{{
                      displaySubject(event)
                    }}</span>
                  </span>
                  <span
                    v-if="canShowIp && event.metadata?.causer_ip_address"
                    class="text-[11px] text-gray-400"
                  >
                    IP {{ event.metadata.causer_ip_address }}
                  </span>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
      <div
        v-if="
          activityStore.pagination?.totalItems >
          activityStore.pagination?.perPage
        "
        class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600 sm:px-6"
      >
        <div>
          Halaman {{ activityStore.pagination.currentPage }} dari
          {{ activityStore.pagination.lastPage }}
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md border border-gray-200 px-3 py-1.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:border-primary/50"
            :disabled="
              !activityStore.pagination.hasPrevPage || activityStore.loading
            "
            @click="prevPage"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            class="rounded-md border border-gray-200 px-3 py-1.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:border-primary/50"
            :disabled="
              !activityStore.pagination.hasNextPage || activityStore.loading
            "
            @click="nextPage"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ClockIcon } from '@heroicons/vue/24/outline';
import { useActivityStore } from '@/stores/useActivityStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { copyText } from '@/utils/copyText';

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'login', label: 'Akses Pengguna' },
  { value: 'request', label: 'Permintaan Pengujian' },
  { value: 'payment', label: 'Pembayaran' },
];

const typeConfig = {
  login: {
    label: 'Akses Pengguna',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'border-emerald-200 bg-emerald-500/80',
  },
  request: {
    label: 'Permintaan Pengujian',
    badge: 'bg-sky-100 text-sky-700',
    dot: 'border-sky-200 bg-sky-500/80',
  },
  payment: {
    label: 'Pembayaran',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'border-amber-200 bg-amber-500/80',
  },
  system: {
    label: 'Sistem',
    badge: 'bg-gray-100 text-gray-600',
    dot: 'border-gray-200 bg-gray-400/80',
  },
};

const ORDER_STATUS_EVENTS = [
  { key: 'createdAt', title: 'Order dibuat', type: 'request', status: 'info' },
  {
    key: 'submittedAt',
    title: 'Permintaan dikirim',
    type: 'request',
    status: 'info',
  },
  {
    key: 'approvedAt',
    title: 'Permintaan disetujui',
    type: 'request',
    status: 'success',
  },
  {
    key: 'rejectedAt',
    title: 'Permintaan ditolak',
    type: 'request',
    status: 'error',
  },
  {
    key: 'cancelledAt',
    title: 'Permintaan dibatalkan',
    type: 'request',
    status: 'warning',
  },
  {
    key: 'paymentSubmittedAt',
    title: 'Pembayaran dikirim',
    type: 'payment',
    status: 'info',
  },
  {
    key: 'paymentApprovedAt',
    title: 'Pembayaran disetujui',
    type: 'payment',
    status: 'success',
  },
  {
    key: 'paymentRejectedAt',
    title: 'Pembayaran ditolak',
    type: 'payment',
    status: 'error',
  },
  {
    key: 'testingAt',
    title: 'Pengujian dimulai',
    type: 'request',
    status: 'info',
  },
  {
    key: 'refundedAt',
    title: 'Refund diproses',
    type: 'payment',
    status: 'warning',
  },
  {
    key: 'completedAt',
    title: 'Order selesai',
    type: 'request',
    status: 'success',
  },
];

const MAX_MERGED_EVENTS = 200;

const activityStore = useActivityStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();
const { notify } = useNotificationCenter();
const activeFilter = ref('all');
const errorDismissed = ref(false);
const { hasAnyPermission, hasPermission, isSuperAdmin } = useAuthorization();

const normalizeRoleName = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const isCustomer = computed(() =>
  (authStore.currentUser?.roles || []).some((role) =>
    ['customer', 'pelanggan'].includes(
      normalizeRoleName(role?.slug || role?.code || role?.name)
    )
  )
);

const currentUserId = computed(() => resolveUserId(authStore.currentUser));
const canViewAllOrders = computed(() =>
  hasPermission('material_test_orders.index')
);

const filterUserId = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const page = ref(1);

const visibleOrders = computed(() => {
  const orders = Array.isArray(orderStore.orders) ? orderStore.orders : [];
  if (canViewAllOrders.value) return orders;
  const userId = normalizeId(currentUserId.value);
  if (!userId) return [];
  return orders.filter((order) => isOrderOwner(order, userId));
});

// Cek apakah user boleh melihat semua aktivitas (bukan hanya miliknya)
const canViewAllActivity = computed(() => {
  if (isCustomer.value) return false;
  return (
    isSuperAdmin.value ||
    hasAnyPermission(
      'activity.index', // sesuai Postman & izin BE
      'activities.index', // fallback jika naming plural dipakai
      'activity.show', // jika BE pakai show sebagai akses baca
      'activities.show',
      'activities.view_all',
      'activities.*'
    )
  );
});
const canShowIp = computed(() => canViewAllActivity.value);

// Scope fetch: all untuk admin, mine untuk user biasa
const fetchScope = computed(() => (canViewAllActivity.value ? 'all' : 'mine'));

const filteredOrders = computed(() => {
  const orders = visibleOrders.value;
  if (!canViewAllActivity.value) return orders;
  const ownerId = normalizeId(filterUserId.value);
  if (!ownerId) return orders;
  return orders.filter((order) => {
    if (normalizeId(order.customerId) === ownerId) return true;
    return isOrderOwner(order, ownerId);
  });
});

// Ambil aktivitas dengan filter/pagination
async function loadActivities() {
  activityStore.setActiveUser(authStore.currentUser?.id ?? null);
  await activityStore.fetchImportant?.({
    perPage: 20,
    page: page.value,
    include: ['causer', 'subject'],
    scope: fetchScope.value,
    viewer: authStore.currentUser,
    viewerId: authStore.currentUser?.id,
    viewerIsSuperAdmin: isSuperAdmin.value,
    canViewAll: canViewAllActivity.value,
    filterUserId: canViewAllActivity.value
      ? filterUserId.value || undefined
      : undefined,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
  });
  page.value = activityStore.pagination?.currentPage || page.value;
}

async function loadOrders() {
  if (orderStore.loading) return;
  if (orderStore.orders?.length) return;
  await orderStore.fetchAll();
}

onMounted(async () => {
  activityStore.hydrate();
  await Promise.all([loadActivities(), loadOrders()]);
});

function normalizeEventTimestamp(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function resolveOrderReference(order) {
  return (
    order?.orderId ||
    order?.orderNo ||
    order?.orderCode ||
    order?.orderDisplay ||
    order?.id ||
    ''
  );
}

function resolveOrderSubjectName(order, fallback = '') {
  return order?.orderId || order?.orderDisplay || order?.orderCode || fallback;
}

function buildOrderStatusDescription(order, referenceId) {
  const parts = [];
  if (referenceId) parts.push(`Order ${referenceId}`);
  if (order?.customerName) parts.push(`Pemohon: ${order.customerName}`);
  if (order?.statusLabel) parts.push(`Status: ${order.statusLabel}`);
  return parts.length ? parts.join(' | ') : 'Riwayat order';
}

function buildOrderStatusEvents(order = {}) {
  const referenceId = resolveOrderReference(order);
  if (!referenceId) return [];
  const subjectName = resolveOrderSubjectName(order, referenceId);
  const description = buildOrderStatusDescription(order, referenceId);
  const owner = resolveOrderOwner(order);
  const baseMeta = {
    source: 'order-status',
    module: 'order',
    orderNo: order?.orderNo || '',
    orderId: order?.orderId || referenceId,
    orderCode: order?.orderCode || order?.orderNumber || '',
    orderStatus: order.status,
    orderStatusLabel: order.statusLabel,
    customerName: order.customerName || '',
    ownerId: owner.id || '',
    ownerName: owner.name || '',
    subjectName,
    causerName: 'Sistem',
    causer: { name: 'Sistem' },
  };

  return ORDER_STATUS_EVENTS.map((eventConfig) => {
    const rawTimestamp = order[eventConfig.key];
    const createdAt = normalizeEventTimestamp(rawTimestamp);
    if (!createdAt) return null;
    return {
      id: `order-${referenceId}-${eventConfig.key}-${createdAt}`,
      type: eventConfig.type,
      title: eventConfig.title,
      description,
      status: eventConfig.status,
      referenceId,
      userId: null,
      metadata: { ...baseMeta },
      createdAt,
    };
  }).filter(Boolean);
}

function filterEventsByDateRange(events = []) {
  const hasFrom = Boolean(dateFrom.value);
  const hasTo = Boolean(dateTo.value);
  if (!hasFrom && !hasTo) return events;
  const from = hasFrom ? new Date(`${dateFrom.value}T00:00:00`) : null;
  const to = hasTo ? new Date(`${dateTo.value}T23:59:59`) : null;
  return events.filter((event) => {
    const timestamp = new Date(event.createdAt);
    if (Number.isNaN(timestamp.getTime())) return false;
    if (from && timestamp < from) return false;
    if (to && timestamp > to) return false;
    return true;
  });
}

function buildMergeKey(event) {
  const reference = event?.referenceId || event?.metadata?.orderNo || '';
  const title = event?.title || '';
  const createdAt = event?.createdAt || '';
  if (!reference && event?.id) return event.id;
  return `${reference}|${title}|${createdAt}`;
}

function mergeEvents(activityEvents = [], statusEvents = []) {
  const map = new Map();
  (statusEvents || []).forEach((event) => {
    map.set(buildMergeKey(event), event);
  });
  (activityEvents || []).forEach((event) => {
    map.set(buildMergeKey(event), event);
  });
  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_MERGED_EVENTS);
}

function summarizeEvents(events = []) {
  return events.reduce(
    (acc, event) => {
      acc.total += 1;
      if (event.type === 'login') acc.login += 1;
      else if (event.type === 'request') acc.request += 1;
      else if (event.type === 'payment') acc.payment += 1;
      else acc.system += 1;
      return acc;
    },
    { total: 0, login: 0, request: 0, payment: 0, system: 0 }
  );
}

const orderStatusEvents = computed(() => {
  const orders = filteredOrders.value;
  const events = orders.flatMap((order) => buildOrderStatusEvents(order));
  return filterEventsByDateRange(events);
});

const mergedEvents = computed(() =>
  mergeEvents(activityStore.events, orderStatusEvents.value)
);

const stats = computed(() => summarizeEvents(mergedEvents.value));
const apiError = computed(() => activityStore.apiError);
const isPermissionIssue = computed(() => {
  const status = activityStore.apiStatus;
  return status === 401 || status === 403;
});
const showErrorBanner = computed(
  () => apiError.value && !errorDismissed.value && !isPermissionIssue.value
);

const hasEvents = computed(() => mergedEvents.value.length > 0);

// Filter event berdasarkan tab aktif
const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return mergedEvents.value;
  return mergedEvents.value.filter(
    (event) => event.type === activeFilter.value
  );
});

// Kelompokkan event per tanggal (descending)
const groupedEvents = computed(() => {
  const map = new Map();
  filteredEvents.value.forEach((event) => {
    const key = formatDateKey(event.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(event);
  });

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      label: formatReadableDate(date),
      items: items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    }));
});

function dismissError() {
  errorDismissed.value = true;
}

// Map status success/warning/error ke warna badge
function statusClass(status) {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700';
    case 'warning':
      return 'bg-amber-100 text-amber-700';
    case 'error':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function statusLabel(status) {
  if (status === 'success') return 'Berhasil';
  if (status === 'warning') return 'Perlu Tinjauan';
  if (status === 'error') return 'Gagal';
  return 'Info';
}

function formatDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'invalid';
  return date.toISOString().slice(0, 10);
}

function formatReadableDate(value) {
  if (value === 'invalid') return 'Tanggal tidak valid';
  const date = new Date(value);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resolveUserId(user) {
  return user?.id || user?.user_id || user?.userId || '';
}

function normalizeId(value) {
  const text = String(value || '').trim();
  return text ? text.toLowerCase() : '';
}

function extractOrderOwnerIds(order) {
  if (!order) return [];
  const orderUsersRaw = Array.isArray(order.orderUsers || order.order_users)
    ? order.orderUsers || order.order_users
    : [];
  const fromUsers = orderUsersRaw
    .filter((item) => String(item?.type || '').trim().toLowerCase() === 'owner')
    .map((item) => item?.userId || item?.user_id || item?.user?.id)
    .filter(Boolean);

  const ownerIdsRaw =
    order.ownerUserIds ??
    order.owner_user_ids ??
    order.ownerUserId ??
    order.owner_user_id ??
    [];
  const ownerIdsList = Array.isArray(ownerIdsRaw) ? ownerIdsRaw : [ownerIdsRaw];

  const combined = [...fromUsers, ...ownerIdsList]
    .map((id) => normalizeId(id))
    .filter(Boolean);
  return Array.from(new Set(combined));
}

function isOrderOwner(order, userId) {
  const normalizedUserId = normalizeId(userId);
  if (!normalizedUserId) return false;
  return extractOrderOwnerIds(order).includes(normalizedUserId);
}

function resolveOrderOwner(order) {
  if (!order) return { id: '', name: '' };
  const orderUsersRaw = Array.isArray(order.orderUsers || order.order_users)
    ? order.orderUsers || order.order_users
    : [];
  const owners = orderUsersRaw
    .filter((item) => String(item?.type || '').trim().toLowerCase() === 'owner')
    .map((item) => {
      const user = item?.user || null;
      const id = user?.id || item?.userId || item?.user_id || '';
      const name = user?.name || '';
      const email = user?.email || '';
      return {
        id,
        name: name || email || '',
      };
    })
    .filter((item) => item.id || item.name);

  if (owners.length) {
    return {
      id: owners[0].id || '',
      name: owners[0].name || owners[0].id || '',
    };
  }

  const fallbackId = order.customerId || '';
  const fallbackName = order.customerName || fallbackId || '';
  return { id: fallbackId, name: fallbackName };
}

function displayCauser(event) {
  return (
    event.metadata?.causer?.name ||
    event.metadata?.causerName ||
    event.metadata?.causer?.email ||
    ''
  );
}

function displaySubject(event) {
  return (
    event.metadata?.orderId ||
    event.metadata?.subjectName ||
    event.metadata?.subject?.email ||
    event.referenceId ||
    ''
  );
}

function isOrderStatusEvent(event) {
  return event?.metadata?.source === 'order-status';
}

function resolveIdLabel(event) {
  return isOrderStatusEvent(event) ? 'Owner ID' : 'ID';
}

function resolveIdValue(event) {
  if (isOrderStatusEvent(event)) {
    return event?.metadata?.ownerId || '-';
  }
  return displayCauserId(event);
}

function resolveActorLabel(event) {
  return isOrderStatusEvent(event) ? 'Owner' : 'Aktor';
}

function resolveActorValue(event) {
  if (isOrderStatusEvent(event)) {
    return (
      event?.metadata?.ownerName ||
      event?.metadata?.customerName ||
      'Sistem'
    );
  }
  return displayCauser(event) || 'Sistem';
}

function resolveSubjectLabel(event) {
  return isOrderStatusEvent(event) ? 'Order ID' : 'Subject';
}

// Bersihkan filter dan muat ulang
function resetFilters() {
  filterUserId.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  page.value = 1;
  loadActivities();
}

// Pagination: halaman berikutnya
function nextPage() {
  if (activityStore.pagination.hasNextPage && !activityStore.loading) {
    page.value = (activityStore.pagination.currentPage || page.value) + 1;
    loadActivities();
  }
}

// Pagination: halaman sebelumnya
function prevPage() {
  if (activityStore.pagination.hasPrevPage && !activityStore.loading) {
    const current = activityStore.pagination.currentPage || page.value;
    page.value = Math.max(1, current - 1);
    loadActivities();
  }
}

function displayCauserId(event) {
  return event.metadata?.causer?.id || event.userId || '-';
}

// Salin ID aktor ke clipboard dan beri notifikasi
async function copyCauserId(event) {
  const id = resolveIdValue(event);
  if (!id || id === '-') {
    notify({
      tone: 'error',
      title: 'ID tidak tersedia',
      message: 'ID tidak tersedia untuk aktivitas ini.',
      duration: 2000,
      persist: false,
    });
    return;
  }
  const copied = await copyText(id);
  notify({
    tone: copied ? 'success' : 'error',
    title: copied ? 'ID disalin' : 'Gagal menyalin',
    message: copied
      ? `${id} sudah disalin ke clipboard.`
      : 'Tidak dapat menyalin ID, salin manual bila perlu.',
    duration: 2500,
    persist: false,
  });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
