<template>
  <div class="space-y-3">
    <!-- Header -->
    <header
      v-if="!showModal"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primaryLight">
        Pengujian
      </p>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
          Daftar Permintaan
        </h2>
        <p class="text-sm text-gray-500">
          Buat Permintaan Pengujian baru atau kelola permintaan yang sudah ada.
        </p>
      </div>
      <div
        class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap"
      >
        <button
          class="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          @click="openAddModal"
        >
          Tambah Permintaan
        </button>
      </div>
    </header>

    <!-- Form section (non-modal) -->
    <section v-if="showModal">
      <FormPermintaan
        :model-value="selectedRequest"
        :is-edit="isEdit"
        @submit="handleFormSubmit"
        @cancel="closeModal"
      />
    </section>

    <div
      v-if="!showModal"
      class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4"
    >
      <div
        class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-base font-semibold text-surfaceDark sm:text-lg"></h3>
        
      </div>

      <div class="overflow-x-auto md:overflow-visible">
        <DataTable
          :columns="columns"
          :rows="tableRows"
          :page-size="10"
          searchable
          filterable
          :status-options="requestStatusOptions"
          row-key="__rowKey"
          scroll-body-on-mobile
          body-scroll-height="55vh"
        >
          <template #idOrder="{ value }">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-1 text-center text-sm text-gray-800 hover:text-gray-900 md:justify-start md:text-left sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis"
              @click="copyId(value)"
              :title="value || '-'"
            >
              <span class="truncate">{{ value || '-' }}</span>
              <DocumentDuplicateIcon class="h-[1em] w-[1em] shrink-0 text-gray-600" />
            </button>
          </template>
          <template #orderNumber="{ row }">
            <span class="block text-center text-sm text-gray-700">
              {{ formatOrderNumber(row) }}
            </span>
          </template>
          <template #entryDate="{ value }">
            <span class="block text-center text-sm text-gray-700 md:text-left">
              {{ formatShortDate(value) }}
            </span>
          </template>
          <template #testItems="{ value, row }">
            <div class="text-left">
              <template v-if="value?.length">
                <span
                  v-for="(item, idx) in value"
                  :key="`${row.idOrder}-test-${idx}`"
                  class="block text-xs text-gray-700"
                >
                  {{ resolveTestName(item) }}
                  <span class="text-gray-500">({{ item.quantity }})</span>
                </span>
              </template>
              <span v-else class="text-xs text-gray-400">
                {{ '-' }}
              </span>
            </div>
          </template>

          <template #status="{ value }">
            <div class="w-full">
              <Badge :status="value" class="w-full justify-center md:justify-start" />
            </div>
          </template>

          <template #actions="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button
                class="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                @click="openEditModal(row)"
              >
                <PencilIcon class="w-5 h-5" />
              </button>
              <button
                v-if="canCancel(row)"
                class="p-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-800"
                title="Batalkan permintaan"
                @click="cancelRequest(row)"
              >
                <XCircleIcon class="w-5 h-5" />
              </button>
              <button
                v-if="canOpenPayment(row)"
                class="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 hover:text-amber-800"
                @click="openPaymentModal(row)"
                title="Input Pembayaran"
              >
                <BanknotesIcon class="w-5 h-5" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <FormPayment
      v-if="showPaymentModal"
      :tests="testStore.tests"
      :order-id="paymentContext?.orderId ?? ''"
      :initial-rows="paymentContext?.rows ?? []"
      :customer-name="paymentContext?.customerName ?? ''"
      :entry-date="paymentContext?.entryDate ?? ''"
      @close="closePaymentModal"
      @payment-saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/useOrderStore';
import { useTestStore } from '@/stores/useTestStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter, useRoute } from 'vue-router';
import {
  PencilIcon,
  XCircleIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
} from '@heroicons/vue/24/outline';
import FormPermintaan from '@/components/form/FormPermintaan.vue';
import FormPayment from '@/components/form/FormPayment.vue';
import Badge from '@/components/common/Badge.vue';
import DataTable from '../components/common/DataTable.vue';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { copyText } from '@/utils/copyText';

const orderStore = useOrderStore();
const testStore = useTestStore();
const authStore = useAuthStore();
const { hasPermission } = useAuthorization();
const router = useRouter();
const route = useRoute();
const showModal = ref(false);
const showPaymentModal = ref(false);
const isEdit = ref(false);
const selectedRequest = ref(null);
const paymentContext = ref(null);
const openConfirm = useConfirmDialog();
const { notify } = useNotificationCenter();
const sampleShipmentMessage =
  'Bukti pembayaran telah dikirim. Admin akan mereview sebelum melanjutkan proses pengujian.';

const isCustomer = computed(() =>
  (authStore.currentUser?.roles || []).some((role) => {
    const name = typeof role === 'string' ? role : role?.name || role?.slug || role?.code;
    return name && name.toLowerCase().includes('customer');
  })
);

const canViewServices = computed(() =>
  !isCustomer.value || hasPermission('material_test_services.index')
);
const canViewAllOrders = computed(() =>
  hasPermission('material_test_orders.index')
);
const currentUserId = computed(() => resolveUserId(authStore.currentUser));

// Query mode routing: ?mode=new|edit|payment&id=ORDER_NO
const readQueryValue = (value) =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';

const routeMode = computed(() =>
  String(readQueryValue(route.query.mode)).trim().toLowerCase()
);
const routeId = computed(() => String(readQueryValue(route.query.id)).trim());

function updateRouteQuery(next = {}) {
  const query = { ...route.query };
  Object.entries(next).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      delete query[key];
    } else {
      query[key] = value;
    }
  });
  router.push({ path: route.path, query });
}

function clearRouteQuery(keys = ['mode', 'id']) {
  const query = { ...route.query };
  keys.forEach((key) => {
    delete query[key];
  });
  router.push({ path: route.path, query });
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

function canAccessOrder(order) {
  if (!order) return false;
  if (canViewAllOrders.value) return true;
  return isOrderOwner(order, currentUserId.value);
}

onMounted(() => {
  if (!canViewServices.value) {
    router.replace('/dashboard');
    return;
  }
  orderStore.fetchAll();
  if (!testStore.tests.length) {
    testStore.fetchAll();
  }
});

// === DataTable columns ===
// Kolom tabel permintaan
const columns = [
  // Kolom utama tetap tampak
  {
    field: 'idOrder',
    title: 'ID Order',
    className: 'md:max-w-[180px] md:min-w-[140px] md:pr-4',
    slotName: 'idOrder',
  },
  {
    field: 'orderNumber',
    title: 'No Order',
    className: 'md:min-w-[120px] text-left',
  },
  { field: 'entryDate', title: 'Tanggal Masuk',
   },

  {
    field: 'status',
    title: 'Status',
    className: 'md:min-w-[110px] md:max-w-[140px] text-left',
  },

  // Tampil mulai SM
  {
    field: 'customerName',
    title: 'Pelanggan',
    className: 'hidden sm:table-cell',
  },

  {
    field: 'phoneNumber',
    title: 'No. Telepon',
    className: 'hidden md:table-cell',
  },

  {
    field: 'testItems',
    title: 'Nama Pengujian',
    className: 'hidden lg:table-cell text-left',
  },

  // Aksi: selalu tampil, jangan mengecil
  {
    field: 'actions',
    title: 'Aksi',
    className: 'md:shrink-0 md:w-auto',
    sortable: false,
  },
];

const requestStatusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'awaiting_review', label: 'Menunggu Kaji Ulang' },
  { value: 'awaiting_payment', label: 'Menunggu Pembayaran' },
  { value: 'payment_submitted', label: 'Bukti Pembayaran Dikirim' },
  { value: 'payment_approved', label: 'Pembayaran Disetujui' },
  { value: 'payment_rejected', label: 'Bukti Pembayaran Ditolak' },
  { value: 'testing', label: 'Proses Pengujian' },
  { value: 'completed', label: 'Selesai' },
  { value: 'refunded', label: 'Refund' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'rejected', label: 'Ditolak' },
];

// Order tidak bisa dihapus; gunakan cancel agar status berubah ke "cancelled".
const cancelableStatuses = new Set([
  'draft',
  'awaiting_review',
  'awaiting_payment',
  'payment_rejected',
  'rejected',
]);

const visibleOrders = computed(() => {
  const orders = Array.isArray(orderStore.orders) ? orderStore.orders : [];
  if (canViewAllOrders.value) return orders;
  const userId = normalizeId(currentUserId.value);
  if (!userId) return [];
  return orders.filter((order) => isOrderOwner(order, userId));
});

const tableRows = computed(() =>
  (visibleOrders.value ?? []).map((order, index) => {
    const idOrder = order.orderNo || order.id || `row-${index}`;
    return {
      ...order,
      idOrder,
      orderNumber: order.orderNumber ?? null,
      entryDate: order.entryDate || order.createdAt || '',
      phoneNumber: order.customerPhone || order.phoneNumber || '',
      customerName: order.customerName || '',
      address: order.address || order.customerAddress || '',
      jobCategory: order.jobCategory || order.workCategoryName || '',
      workPackage:
        order.workPackageName ||
        order.workPackage ||
        order.workPackageId ||
        '',
      testItems: order.testItems || [],
      paymentInfo: order.paymentInfo || null,
      __rowKey: `${idOrder}-${index}`,
    };
  })
);

// === Modal logic ===
function resetFormState() {
  showModal.value = false;
  selectedRequest.value = null;
  isEdit.value = false;
}

function resetPaymentState() {
  showPaymentModal.value = false;
  paymentContext.value = null;
}

function buildDefaultRequest() {
  return {
    idOrder: '',
    entryDate: new Date().toISOString().substring(0, 10),
    customerName: '',
    phoneNumber: '',
    address: '',
    testCategory: '',
    jobCategory: '',
    workPackage: '',
    testItems: [],
    status: 'draft',
  };
}

function applyNewFormState() {
  resetPaymentState();
  isEdit.value = false;
  selectedRequest.value = buildDefaultRequest();
  showModal.value = true;
}

function applyEditSelection(item) {
  isEdit.value = true;
  selectedRequest.value = {
    ...item,
    testItems: (item.testItems || []).map((detail) => ({
      testId: detail.testId || '',
      testName: detail.testName || '',
      quantity: detail.quantity ?? 1,
      objectName: detail.objectName || detail.testName || '',
      price: Number(detail.price ?? 0),
    })),
  };
  showModal.value = true;
}

function applyPaymentContext(row) {
  paymentContext.value = {
    orderId: row.idOrder,
    customerName: row.customerName,
    entryDate: row.entryDate,
    rows: buildPaymentRows(row.testItems),
  };
  showPaymentModal.value = true;
}

function findRowById(orderId) {
  const target = String(orderId || '').trim().toLowerCase();
  if (!target) return null;
  return (
    tableRows.value.find(
      (row) => String(row.idOrder || '').trim().toLowerCase() === target
    ) || null
  );
}

async function resolveRowById(orderId) {
  const target = String(orderId || '').trim();
  if (!target) return null;
  const existing = findRowById(target);
  if (existing) return existing;

  const { ok, data } = await orderStore.fetchById(target);
  if (!ok || !data) return null;
  const idOrder = data.orderNo || data.id || target;
  return {
    ...data,
    idOrder,
    orderNumber: data.orderNumber ?? null,
    entryDate: data.entryDate || data.createdAt || '',
    phoneNumber: data.customerPhone || data.phoneNumber || '',
    customerName: data.customerName || '',
    address: data.address || data.customerAddress || '',
    jobCategory: data.jobCategory || data.workCategoryName || '',
    workPackage:
      data.workPackageName ||
      data.workPackage ||
      data.workPackageId ||
      '',
    testItems: data.testItems || [],
    paymentInfo: data.paymentInfo || null,
  };
}

function handleOrderAccessDenied(orderId) {
  notify({
    tone: 'warning',
    title: 'Akses Ditolak',
    message: `Anda tidak memiliki akses ke order ${orderId || '-'}.`,
    duration: 4000,
  });
}

async function openEditById(orderId) {
  const row = await resolveRowById(orderId);
  if (!row) {
    notify({
      tone: 'warning',
      title: 'Order Tidak Ditemukan',
      message: `Order ${orderId || '-'} tidak ditemukan.`,
      duration: 4000,
    });
    clearRouteQuery();
    resetFormState();
    return;
  }
  if (!canAccessOrder(row)) {
    handleOrderAccessDenied(orderId);
    clearRouteQuery();
    resetFormState();
    return;
  }
  applyEditSelection(row);
}

async function openPaymentById(orderId) {
  const row = await resolveRowById(orderId);
  if (!row) {
    notify({
      tone: 'warning',
      title: 'Order Tidak Ditemukan',
      message: `Order ${orderId || '-'} tidak ditemukan.`,
      duration: 4000,
    });
    clearRouteQuery();
    resetPaymentState();
    return;
  }
  if (!canAccessOrder(row)) {
    handleOrderAccessDenied(orderId);
    clearRouteQuery();
    resetPaymentState();
    return;
  }
  if (!canOpenPayment(row)) {
    notify({
      tone: 'warning',
      title: 'Pembayaran Belum Tersedia',
      message: 'Status order belum bisa melakukan input pembayaran.',
      duration: 4000,
    });
    clearRouteQuery();
    resetPaymentState();
    return;
  }
  applyPaymentContext(row);
}

watch(
  [routeMode, routeId],
  async ([mode, id]) => {
    if (!mode) {
      resetFormState();
      resetPaymentState();
      return;
    }

    if (mode === 'new') {
      applyNewFormState();
      return;
    }

    if (mode === 'edit') {
      resetPaymentState();
      if (!id) {
        notify({
          tone: 'warning',
          title: 'ID Order Kosong',
          message: 'Masukkan id order pada query untuk membuka form edit.',
          duration: 4000,
        });
        clearRouteQuery();
        return;
      }
      await openEditById(id);
      return;
    }

    if (mode === 'payment') {
      resetFormState();
      if (!id) {
        notify({
          tone: 'warning',
          title: 'ID Order Kosong',
          message: 'Masukkan id order pada query untuk pembayaran.',
          duration: 4000,
        });
        clearRouteQuery();
        return;
      }
      await openPaymentById(id);
      return;
    }

    resetFormState();
    resetPaymentState();
  },
  { immediate: true }
);

function openAddModal() {
  updateRouteQuery({ mode: 'new', id: null });
}

function openEditModal(item) {
  if (!item?.idOrder) return;
  updateRouteQuery({ mode: 'edit', id: item.idOrder });
}

function canOpenPayment(row) {
  if (!row) return false;
  const allowedStatuses = ['awaiting_payment', 'payment_rejected'];
  return (
    allowedStatuses.includes(row.status) && Array.isArray(row.testItems) && row.testItems.length > 0
  );
}

function canCancel(row) {
  return Boolean(row && cancelableStatuses.has(row.status));
}

function openPaymentModal(row) {
  if (!canOpenPayment(row)) return;
  updateRouteQuery({ mode: 'payment', id: row.idOrder });
}

function buildPaymentRows(items = []) {
  return (items || []).map((item) => {
    const test =
      typeof testStore.getTestById === 'function'
        ? testStore.getTestById(item.testId)
        : (testStore.tests || []).find((t) => t.id === item.testId);
    const directName = sanitizeTestName(item.testName);
    const resolvedName =
      directName ||
      sanitizeTestName(test?.name) ||
      sanitizeTestName(test?.testName) ||
      sanitizeTestName(test?.test_name) ||
      sanitizeTestName(test?.code) ||
      '';
    return {
      testId: item.testId || test?.id || null,
      testName: resolvedName,
      objectName:
        item.objectName ||
        directName ||
        sanitizeTestName(test?.name) ||
        sanitizeTestName(test?.code) ||
        '',
      quantity: item.quantity ?? 1,
      price: Number(item.price ?? test?.price ?? 0),
    };
  });
}

function formatBackendErrors(details) {
  const errors = details?.errors;
  if (!errors || typeof errors !== 'object') return '';
  const messages = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((msg) => typeof msg === 'string' && msg.trim());
  return messages.length ? messages.join(' | ') : '';
}

async function handleFormSubmit(payload) {
  const data = payload?.data || {};
  const result = isEdit.value
    ? await orderStore.updateOrder(data.idOrder, data)
    : await orderStore.createOrder(data);

  if (!result?.ok) {
    const details = formatBackendErrors(result?.details);
    const fallbackMessage = isEdit.value
      ? 'Gagal memperbarui permintaan.'
      : 'Gagal membuat permintaan.';
    const message = details
      ? `${result?.error || fallbackMessage} ${details}`
      : result?.error || fallbackMessage;
    notify({
      tone: 'error',
      title: isEdit.value ? 'Gagal Menyimpan Permintaan' : 'Gagal Membuat Permintaan',
      message,
      duration: 5000,
    });
    return;
  }

  resetFormState();
  clearRouteQuery();
}

function closePaymentModal() {
  resetPaymentState();
  clearRouteQuery();
}

function closeModal() {
  resetFormState();
  clearRouteQuery();
}

async function cancelRequest(item) {
  if (!canCancel(item)) {
    notify({
      tone: 'warning',
      title: 'Tidak Bisa Dibatalkan',
      message: 'Status permintaan sudah tidak bisa dibatalkan.',
      persist: false,
    });
    return;
  }
  const ok = await openConfirm({
    title: 'Batalkan permintaan?',
    message: `Permintaan ${item.idOrder} akan dibatalkan.`,
    confirmLabel: 'Batalkan',
    variant: 'danger',
  });
  if (!ok) return;
  const result = await orderStore.cancelOrder(item.idOrder);
  if (!result?.ok) {
    notify({
      tone: 'error',
      title: 'Gagal Membatalkan',
      message: result?.error || 'Tidak dapat membatalkan permintaan.',
      persist: false,
    });
    return;
  }
  notify({
    tone: 'success',
    title: 'Permintaan Dibatalkan',
    message: `Permintaan ${item.idOrder} sudah dibatalkan.`,
    persist: false,
  });
}


function formatOrderNumber(row) {
  if (!row) return '-';
  const explicit =
    row.orderDisplay || row.orderCode || row.formattedOrder || row.orderNumber;
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }
  const orderNumber = Number(row.orderNumber);
  if (Number.isFinite(orderNumber)) {
    return orderNumber.toString().padStart(3, '0');
  }
  return '-';
}

function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const raw = String(value || "").trim();
    if (raw.length >= 10) {
      const fallback = new Date(raw.slice(0, 10));
      if (!Number.isNaN(fallback.getTime())) {
        return new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(fallback);
      }
    }
    return raw || "-";
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
function looksLikeId(value) {
  if (!value) return false;
  const text = String(value).trim();
  if (!text) return false;
  return (
    /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(text) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)
  );
}

function sanitizeTestName(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (!text) return '';
  if (looksLikeId(text)) return '';
  return text;
}

function resolveTestName(detail) {
  if (!detail) return '-';
  const direct =
    sanitizeTestName(detail.testName) ||
    sanitizeTestName(detail.test_name) ||
    sanitizeTestName(detail.name) ||
    sanitizeTestName(detail.service?.test_name) ||
    sanitizeTestName(detail.service?.testName) ||
    sanitizeTestName(detail.service?.name);
  if (direct) return direct;

  const testId =
    detail.serviceId ||
    detail.service_id ||
    detail.testId ||
    detail.service?.id ||
    '';
  if (!testId) return '-';
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : testStore.tests.find((t) => t.id === testId);
  return (
    sanitizeTestName(test?.name) ||
    sanitizeTestName(test?.testName) ||
    sanitizeTestName(test?.test_name) ||
    sanitizeTestName(test?.code) ||
    '-'
  );
}

async function handlePaymentSaved(detail) {
  const paymentStatus = 'payment_submitted';
  const paymentInfo = {
    ...detail,
    status: paymentStatus,
    reviewStatus: detail.reviewStatus || 'pending',
  };
  const rawFiles = Array.isArray(detail.transferFilesRaw)
    ? detail.transferFilesRaw
    : [];
  const paymentFile = rawFiles.find((file) => file instanceof File) || rawFiles[0] || null;
  if (!paymentFile) {
    notify({
      tone: 'error',
      title: 'Bukti Pembayaran Kosong',
      message: 'Unggah bukti pembayaran terlebih dahulu.',
      duration: 5000,
    });
    return;
  }

  const { ok, error } = await orderStore.submitPayment(detail.orderId, {
    file: paymentFile,
  });
  if (!ok) {
    notify({
      tone: 'error',
      title: 'Gagal Mengirim Pembayaran',
      message: error || 'Tidak dapat mengirim bukti pembayaran.',
      duration: 6000,
    });
    return;
  }

  orderStore.updateLocalOrder(detail.orderId, {
    status: paymentStatus,
    paymentInfo,
  });
  closePaymentModal();
  notify({
    tone: 'info',
    title: 'Kirim Sampel Uji',
    message: sampleShipmentMessage,
    duration: 8000,
  });
}

async function copyId(id) {
  if (!id) return;
  const copied = await copyText(id);
  notify({
    tone: copied ? 'success' : 'error',
    title: copied ? 'ID disalin' : 'Gagal menyalin',
    message: copied
      ? `${id} sudah disalin ke clipboard.`
      : 'Tidak dapat menyalin ID, silakan salin manual.',
    duration: 3000,
    persist: false,
  });
}
</script>
