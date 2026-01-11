<template>
  <div class="space-y-3">
    <header
      v-if="!showForm"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primaryLight">
        Pengujian
      </p>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
          Manajemen Kaji Ulang
        </h2>
        <p class="text-sm text-gray-500">
          Validasi permintaan pengujian, review pembayaran, dan catat hasil kaji
          ulang secara menyeluruh.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          @click="handleAdd"
        >
          Tambah Kaji Ulang
        </button>
      </div>
    </header>

    <div
      v-if="!showForm"
      class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4"
    >
      <div
        class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-base font-semibold text-surfaceDark sm:text-lg"></h3>

      </div>

      <DataTable
        :columns="columns"
        :rows="tableRows"
        searchable
        filterable
        search-field="orderNo"
        status-field="status"
        date-field="date"
        :status-options="statusOptions"
        row-key="__rowKey"
        scroll-body-on-mobile
        body-scroll-height="55vh"
      >
        <template #sampleNo="{ row }">
          <div class="text-center text-sm text-gray-700 md:text-left">
            <template v-if="row.sampleCodes && row.sampleCodes.length">
              <p
                v-for="code in row.sampleCodes"
                :key="`${row.id}-sample-${code}`"
                class="font-mono text-[11px] uppercase tracking-wide text-center md:text-left"
              >
                {{ code }}
              </p>
            </template>
            <span v-else>-</span>
          </div>
        </template>
        <template #date="{ value }">
          <span class="block text-center text-sm text-gray-700 md:text-left">{{
            formatDateDisplay(value)
          }}</span>
        </template>
        <template #orderNo="{ value }">
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
        <template #status="{ value }">
          <div class="w-full">
            <Badge :status="value" class="w-full justify-center md:justify-start" />
          </div>
        </template>
        <template #testNames="{ row }">
          <div class="text-center md:text-left">
            <template v-if="row.testItems && row.testItems.length">
              <span
                v-for="(item, idx) in row.testItems"
                :key="`${row.id}-test-${idx}`"
                class="block text-xs text-gray-700 text-center md:text-left"
              >
                {{ resolveTestName(item) || '-' }}
              </span>
            </template>
            <span v-else class="text-xs text-gray-400">-</span>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex justify-center gap-2 text-surfaceDark">
            <button
              v-if="row.canPreview"
              class="rounded-md bg-sky-50 p-1.5 text-sky-600 transition hover:bg-sky-100 hover:text-sky-800"
              @click="openPreviewForm(row)"
              title="Preview Form Kaji Ulang"
            >
              <DocumentMagnifyingGlassIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canReviewPayment"
              class="rounded-md bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
              @click="openPaymentReview(row)"
              title="Review Bukti Pembayaran"
            >
              <EyeIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canOpenForm"
              class="rounded-md bg-emerald-50 p-1.5 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
              @click="handleEdit(row)"
              title="Buka Form Kaji Ulang"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canMarkTesting"
              class="rounded-md bg-indigo-50 p-1.5 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-800"
              @click="markTesting(row)"
              title="Mulai Pengujian"
            >
              <BeakerIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canComplete"
              class="rounded-md bg-emerald-50 p-1.5 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
              @click="completeTesting(row)"
              title="Selesaikan Pengujian"
            >
              <CheckCircleIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canRefund"
              class="rounded-md bg-amber-50 p-1.5 text-amber-700 transition hover:bg-amber-100 hover:text-amber-800"
              @click="openRefundModal(row)"
              title="Refund"
            >
              <ArrowUturnLeftIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canCancel"
              class="rounded-md bg-red-50 p-1.5 text-danger transition hover:bg-red-100 hover:text-red-700"
              @click="cancelOrder(row)"
              title="Batalkan Order"
            >
              <XCircleIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <FormKajiUlang
      v-if="showForm"
      :form="form"
      :kajiUlangRows="reviewRows"
      :tests="tests"
      :isEditing="isEditing"
      :isPreview="isPreview"
      :lookup-loading="lookupLoading"
      :lookup-error="lookupError"
      @lookup-order="lookupOrder"
      @save-draft="saveDraft"
      @lolos-kaji-ulang="approveReview"
      @tolak="rejectReview"
      @close="closeForm"
    />

    <transition name="fade">
      <div
        v-if="showReviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div
            class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">
                Review Bukti Pembayaran
              </p>
              <h3 class="text-lg font-semibold text-surfaceDark">
                Order {{ reviewingOrder?.orderNo || '-' }}
              </h3>
            </div>
            <button
              class="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              @click="closeReviewModal"
            >
              <span class="sr-only">Tutup</span>
              <XCircleIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="mb-2 text-sm font-semibold text-surfaceDark">
                Detail Pembayaran
              </h4>
              <div class="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <span
                  >Customer:
                  <strong class="text-surfaceDark">{{
                    reviewingOrder?.customerName || '-'
                  }}</strong></span
                >
                <span
                  >Total:
                  <strong class="text-surfaceDark"
                    >Rp
                    {{
                      formatCurrency(reviewingOrder?.paymentInfo?.total)
                    }}</strong
                  ></span
                >
                <span
                  >Dibayar:
                  <strong class="text-surfaceDark"
                    >Rp
                    {{
                      formatCurrency(reviewingOrder?.paymentInfo?.amountPaid)
                    }}</strong
                  ></span
                >
                <span
                  >Sisa:
                  <strong class="text-surfaceDark"
                    >Rp
                    {{
                      formatCurrency(reviewingOrder?.paymentInfo?.outstanding)
                    }}</strong
                  ></span
                >
              </div>
            </section>

            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="mb-3 text-sm font-semibold text-surfaceDark">
                Lampiran Bukti
              </h4>
              <div
                v-if="!reviewFiles.length"
                class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500"
              >
                Tidak ada file yang diunggah.
              </div>
              <div v-else class="grid gap-4 sm:grid-cols-2">
                <article
                  v-for="file in reviewFiles"
                  :key="file.id"
                  class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div class="h-48 bg-white">
                    <img
                      v-if="file.previewUrl && file.type?.startsWith('image/')"
                      :src="file.previewUrl"
                      :alt="file.name"
                      class="h-full w-full object-contain"
                    />
                    <div
                      v-else
                      class="flex h-full flex-col items-center justify-center text-sm text-gray-500"
                    >
                      <span class="font-semibold">{{ file.name }}</span>
                      <span>{{ file.type || 'Lampiran' }}</span>
                    </div>
                  </div>
                  <div
                    class="flex items-center justify-between bg-white px-3 py-2 text-xs text-gray-600"
                  >
                    <span class="truncate">{{ file.name }}</span>
                    <span>{{ formatFileSize(file.size) }}</span>
                  </div>
                </article>
              </div>
            </section>

            <section class="rounded-xl border border-gray-200 p-4">
              <label
                class="mb-1 block text-sm font-medium text-surfaceDark"
                for="review-note"
              >
                Catatan Review
              </label>
              <textarea
                id="review-note"
                v-model="reviewNote"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primaryLight focus:outline-none focus:ring-1 focus:ring-primaryLight"
                placeholder="Catatan untuk pemohon atau alasan penolakan (opsional)"
              ></textarea>
            </section>

            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:w-auto"
                @click="closeReviewModal"
              >
                Batal
              </button>
              <button
                class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
                @click="approvePaymentEvidence"
              >
                Setujui Bukti
              </button>
              <button
                class="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 sm:w-auto"
                @click="rejectPaymentEvidence"
              >
                Tolak & Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="showRefundModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div
            class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">
                Proses Refund
              </p>
              <h3 class="text-lg font-semibold text-surfaceDark">
                Order {{ refundingOrder?.orderNo || '-' }}
              </h3>
            </div>
            <button
              class="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              @click="closeRefundModal"
            >
              <span class="sr-only">Tutup</span>
              <XCircleIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="mb-2 text-sm font-semibold text-surfaceDark">
                Upload Bukti Refund
              </h4>
              <input
                type="file"
                class="w-full text-sm"
                accept=".pdf,.png,.jpg,.jpeg"
                @change="handleRefundFileChange"
              />
              <p v-if="refundFileName" class="mt-2 text-xs text-gray-600">
                File terpilih: <strong>{{ refundFileName }}</strong>
              </p>
              <p v-if="refundError" class="mt-2 text-xs font-medium text-rose-600">
                {{ refundError }}
              </p>
            </section>

            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:w-auto"
                @click="closeRefundModal"
              >
                Batal
              </button>
              <button
                class="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="!refundFile"
                @click="submitRefund"
              >
                Proses Refund
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import Badge from '@/components/common/Badge.vue';
import FormKajiUlang from '@/components/form/FormKajiUlang.vue';
import {
  PencilIcon,
  EyeIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  BeakerIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/vue/24/outline';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useTestStore } from '@/stores/useTestStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useOrderStore } from '@/stores/useOrderStore';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { copyText } from '@/utils/copyText';
import { normalizeOrderStatus } from '@/utils/orderStatus';
import { useRoute, useRouter } from 'vue-router';
import { useAuthorization } from '@/composables/auth/useAuthorization';

const kajiUlangStore = useKajiUlangStore();
const testStore = useTestStore();
const openConfirm = useConfirmDialog();
const orderStore = useOrderStore();
const { notify } = useNotificationCenter();
const route = useRoute();
const router = useRouter();
const { hasPermission } = useAuthorization();
const MTO_PERMISSION = 'material_test_orders.index';
const canViewKajiUlang = computed(() => hasPermission(MTO_PERMISSION));
const pushToast = (options = {}) =>
  notify({
    duration: options.duration ?? 4500,
    ...options,
  });

const showForm = ref(false);
const editingOrderId = ref(null);
const isEditing = ref(false);
const isPreview = ref(false);
const lookupLoading = ref(false);
const lookupError = ref('');
const showReviewModal = ref(false);
const reviewingOrder = ref(null);
const reviewNote = ref('');
const reviewerName = 'Admin';
const showRefundModal = ref(false);
const refundingOrder = ref(null);
const refundFile = ref(null);
const refundError = ref('');

// Query mode routing: ?mode=new|edit|payment|preview&id=ORDER_NO
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

const makeDefaultReviewRows = () => [
  { topic: 'Peralatan', result: '' },
  { topic: 'Personel', result: '' },
  { topic: 'Waktu', result: '' },
  { topic: 'Kondisi', result: '' },
  { topic: 'Laboratorium Subkontrak', result: '' },
];

const evaluationFields = [
  'is_equipment_available',
  'is_personnel_available',
  'is_time_available',
  'is_test_ready',
  'is_subcontract_lab_available',
];

const isEvaluationItemComplete = (item = {}) => {
  const ev = item?.evaluation || {};
  return evaluationFields.every(
    (field) => ev[field] === true || ev[field] === false
  );
};

const resolveEvaluationId = (item = {}) =>
  item?.evaluation?.id || item?.evaluation_id || item?.evaluationId || '';

const buildServiceEvaluationPayload = (item = {}) => {
  const evaluation = item?.evaluation || {};
  return {
    is_equipment_available: evaluation.is_equipment_available,
    is_personnel_available: evaluation.is_personnel_available,
    is_time_available: evaluation.is_time_available,
    is_test_ready: evaluation.is_test_ready,
    is_subcontract_lab_available: evaluation.is_subcontract_lab_available,
  };
};

const isEvaluationComplete = (items = []) =>
  Array.isArray(items) &&
  items.length > 0 &&
  items.every((item) => isEvaluationItemComplete(item));

const cloneTestItems = (items = []) =>
  items.map((item) => ({
    ...item,
    sampleNo:
      item.sampleNo !== undefined &&
      item.sampleNo !== null &&
      item.sampleNo !== ''
        ? String(item.sampleNo).trim()
        : '',
    testCode:
      item.testCode && item.testCode.trim()
        ? item.testCode
        : item.testId
        ? String(item.testId).split('-')[0]
        : '',
  }));

const clonePaymentInfo = (info) => (info ? { ...info } : null);

const sumFormTestItems = (items = []) =>
  (items || []).reduce((total, item) => {
    const price = Math.max(0, Number(item.price) || 0);
    const quantity = Math.max(1, Number(item.quantity) || 1);
    return total + price * quantity;
  }, 0);

function buildInvoiceDetail() {
  const items = cloneTestItems(form.testItems);
  const baseInfo = clonePaymentInfo(form.paymentInfo) || {};
  const computedTotal = sumFormTestItems(items);
  const allowedStatuses = [
    'awaiting_payment',
    'payment_submitted',
    'payment_approved',
    'payment_rejected',
  ];
  const statusCandidate = normalizeOrderStatus(baseInfo.status) || 'awaiting_payment';
  const status = allowedStatuses.includes(statusCandidate)
    ? statusCandidate
    : 'awaiting_payment';
  const amountPaid = Math.max(0, Number(baseInfo.amountPaid) || 0);
  const total = baseInfo.total ?? computedTotal;
  const outstanding =
    baseInfo.outstanding ?? Math.max(total - amountPaid, 0);
  return {
    ...baseInfo,
    status,
    reviewStatus:
      status === 'awaiting_payment'
        ? 'invoice_ready'
        : baseInfo.reviewStatus || 'pending',
    total,
    amountPaid,
    outstanding,
    transferFiles: baseInfo.transferFiles || [],
    testRows: items,
  };
}

async function syncServiceEvaluations({ strict = false } = {}) {
  const orderNo = String(form.orderNo || '').trim();
  if (!orderNo) {
    return { ok: false, error: 'ID order kosong.' };
  }
  const items = Array.isArray(form.testItems) ? form.testItems : [];
  if (!items.length) {
    return { ok: false, error: 'Data pengujian belum tersedia.' };
  }

  const incompleteItems = items.filter((item) => !isEvaluationItemComplete(item));
  if (strict && incompleteItems.length) {
    return { ok: false, error: 'Evaluasi kaji ulang belum lengkap.' };
  }

  const candidates = strict
    ? items
    : items.filter((item) => isEvaluationItemComplete(item));
  const missingEvaluation = candidates.filter(
    (item) => !resolveEvaluationId(item)
  );
  if (strict && missingEvaluation.length) {
    return { ok: false, error: 'ID evaluasi layanan belum tersedia.' };
  }

  const updateItems = candidates.filter((item) => resolveEvaluationId(item));
  if (!updateItems.length) {
    return {
      ok: true,
      updated: 0,
      skipped: items.length,
      missing: missingEvaluation.length,
      incomplete: incompleteItems.length,
    };
  }

  const results = await Promise.allSettled(
    updateItems.map((item) =>
      orderStore.updateServiceEvaluation(
        orderNo,
        resolveEvaluationId(item),
        buildServiceEvaluationPayload(item)
      )
    )
  );

  const failures = results.filter(
    (result) => result.status === 'rejected' || !result.value?.ok
  );
  const error =
    failures[0]?.value?.error ||
    failures[0]?.reason?.message ||
    'Gagal menyimpan evaluasi layanan.';

  return {
    ok: failures.length === 0,
    updated: updateItems.length - failures.length,
    failed: failures.length,
    skipped: items.length - updateItems.length,
    missing: missingEvaluation.length,
    incomplete: incompleteItems.length,
    error: failures.length ? error : '',
  };
}

const resolveYearFromDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return String(date.getFullYear());
  const match = /^(\d{4})/.exec(String(value));
  return match ? match[1] : '';
};

const form = reactive({
  orderNo: '',
  orderCode: '',
  orderNumber: null,
  orderYear: '',
  sampleNo: '',
  date: new Date().toISOString().slice(0, 10),
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  testType: '',
  note: '',
  testItems: [],
  paymentInfo: null,
});

const reviewRows = reactive(makeDefaultReviewRows());
const reviewFiles = computed(
  () => reviewingOrder.value?.paymentInfo?.transferFiles || []
);
const refundFileName = computed(() => refundFile.value?.name || '');

const columns = [
  { field: 'orderNo', title: 'ID Order', className: 'min-w-[150px]' },
  {
    field: 'sampleNo',
    title: 'No Sampel',
    slotName: 'sampleNo',
    className: 'min-w-[140px]',
  },
  {
    field: 'date',
    title: 'Tanggal',
    slotName: 'date',
    className: 'min-w-[140px]',
  },
  {
    field: 'customerName',
    title: 'Pelanggan',
    className: 'hidden md:table-cell min-w-[160px]',
  },
  {
    field: 'status',
    title: 'Status',
    slotName: 'status',
    className: 'min-w-[150px]',
  },
  {
    field: 'testNameSummary',
    title: 'Nama Pengujian',
    slotName: 'testNames',
    className: 'hidden lg:table-cell min-w-[200px]',
  },
  {
    field: 'actions',
    title: 'Aksi',
    slotName: 'actions',
    className: 'text-center',
  },
];

const statusOptions = [
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

// Order tidak bisa dihapus; gunakan cancel agar status menjadi "cancelled".
const cancelableStatuses = new Set([
  'draft',
  'awaiting_review',
  'awaiting_payment',
  'payment_rejected',
  'rejected',
]);

const formatOrderNumberForSample = (orderNumber) => {
  if (orderNumber === null || orderNumber === undefined || orderNumber === '') return '--';
  if (typeof orderNumber === 'number') return String(orderNumber).padStart(3, '0');
  const trimmed = String(orderNumber).trim();
  if (!trimmed) return '--';
  return /^\d+$/.test(trimmed) ? trimmed.padStart(3, '0') : trimmed;
};

const resolveLatestDate = (order) => {
  if (!order) return '';
  const candidates = [
    order.kajiUlangValidatedAt,
    order.paymentInfo?.reviewedAt,
    order.paymentInfo?.paymentDate,
    order.paymentInfo?.paidAt,
    order.updatedAt,
    order.date,
    order.entryDate,
    order.createdAt,
  ];
  let latest = null;
  candidates.forEach((value) => {
    if (!value) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    if (!latest || parsed > latest) {
      latest = parsed;
    }
  });
  if (latest) return latest.toISOString();
  return candidates.find(Boolean) || '';
};

const resolveMonthYearLabel = (dateValue, fallbackYear = '') => {
  if (dateValue) {
    const parsed = new Date(dateValue);
    if (!Number.isNaN(parsed.getTime())) {
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      return `${month}/${parsed.getFullYear()}`;
    }
  }
  const now = new Date();
  const year = fallbackYear || String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${month}/${year}`;
};

const deriveTestCode = (item = {}) => {
  if (item.testCode && String(item.testCode).trim()) return String(item.testCode).trim();
  if (item.testId) return String(item.testId).split('-')[0];
  if (item.testName) return String(item.testName).trim();
  if (item.name) return String(item.name).trim();
  return '--';
};

const sanitizeTestName = (value) => {
  if (!value) return '';
  const normalized = String(value).trim();
  if (!normalized) return '';
  const lower = normalized.toLowerCase();
  if (['pengujian', 'testing', 'machining'].includes(lower)) return '';
  return normalized;
};

const resolveTestName = (item = {}) => {
  if (!item) return '';
  const direct =
    sanitizeTestName(item.testName) ||
    sanitizeTestName(item.test_name) ||
    sanitizeTestName(item.name) ||
    sanitizeTestName(item.service?.test_name) ||
    sanitizeTestName(item.service?.testName) ||
    sanitizeTestName(item.service?.name);
  if (direct) return direct;

  const testId = item.serviceId || item.service_id || item.testId || item.id;
  if (testId) {
    const test =
      typeof testStore.getTestById === 'function'
        ? testStore.getTestById(testId)
        : (testStore.tests || []).find((entry) => entry.id === testId);
    if (test) {
      const fromStore =
        sanitizeTestName(test.name) ||
        sanitizeTestName(test.testName) ||
        sanitizeTestName(test.test_name) ||
        sanitizeTestName(test.code);
      if (fromStore) return fromStore;
    }
  }

  return sanitizeTestName(item.testCategory || item.test_category);
};

const buildTestNameSummary = (items = []) => {
  if (!Array.isArray(items) || !items.length) return '';
  const names = items
    .map((item) => resolveTestName(item))
    .map((name) => (name ? String(name).trim() : ''))
    .filter(Boolean);
  return names.join(', ');
};

const deriveSampleValue = (item = {}) => {
  const value = item.sampleNo !== undefined && item.sampleNo !== null ? String(item.sampleNo).trim() : '';
  if (value) return value;
  if (item.sampleCode) return String(item.sampleCode).trim();
  return '--';
};

const resolveDisplayStatus = (order = {}) => {
  const baseStatus = normalizeOrderStatus(order?.status);
  if (baseStatus) return baseStatus;
  const paymentStatus = normalizeOrderStatus(order?.paymentInfo?.status);
  return paymentStatus || 'draft';
};

const buildSampleCodes = (order = {}) => {
  if (!Array.isArray(order.testItems) || !order.testItems.length) return [];

  // Jika BE sudah memberikan sample_number, pakai apa adanya
  const provided = order.testItems
    .map((item) => {
      const raw =
        (item.sampleNo && String(item.sampleNo).trim()) ||
        (item.sampleCode && String(item.sampleCode).trim());
      return raw || null;
    })
    .filter(Boolean);
  if (provided.length === order.testItems.length) return provided;

  // Fallback: generate kode internal
  const prefix = resolveMonthYearLabel(order.date, order.orderYear);
  const orderSegment = formatOrderNumberForSample(order.orderNumber);
  return order.testItems.map((item, idx) => {
    const code = deriveTestCode(item) || `ITEM-${idx + 1}`;
    const sampleSegment = deriveSampleValue(item);
    return `${prefix}.${orderSegment}/${code}/${sampleSegment}`;
  });
};

  const lockedStatuses = new Set([
    'awaiting_payment',
    'payment_submitted',
    'payment_approved',
    'payment_rejected',
    'testing',
    'completed',
    'refunded',
  ]);
  const refundableStatuses = new Set(['payment_approved', 'testing', 'completed']);

  const tableRows = computed(() =>
    kajiUlangStore.orders
      // Draft tidak masuk tabel kaji ulang.
      .filter(
        (order) =>
          !['draft', 'cancelled'].includes(normalizeOrderStatus(order.status))
      )
      .map((order, index) => {
        const sampleCodes = buildSampleCodes(order);
        const normalizedStatus = normalizeOrderStatus(order.status);
        const isLockedStatus = lockedStatuses.has(normalizedStatus);
        // Konsolidasi status: gunakan status permintaan sebagai satu sumber
        return {
          id: order.id,
          orderNo: order.orderNo,
          __rowKey: order.id || order.orderNo || `row-${index}`,
          sampleNo: sampleCodes.join(', ') || order.sampleNo || '',
          sampleCodes,
          date: resolveLatestDate(order),
          customerName: order.customerName || '',
          status: resolveDisplayStatus(order),
          testItems: order.testItems || [],
          testNameSummary: buildTestNameSummary(order.testItems),
          paymentInfo: order.paymentInfo,
          canReviewPayment: normalizedStatus === 'payment_submitted',
          canOpenForm: !isLockedStatus,
          canPreview: isLockedStatus,
          canMarkTesting: normalizedStatus === 'payment_approved',
          canComplete: normalizedStatus === 'testing',
          canRefund: refundableStatuses.has(normalizedStatus),
          canCancel: cancelableStatuses.has(normalizedStatus),
        };
      })
  );

const tests = computed(() => testStore.tests || []);

onMounted(async () => {
  if (!canViewKajiUlang.value) {
    pushToast({
      tone: 'warning',
      title: 'Akses ditolak',
      message: 'Anda tidak memiliki izin untuk mengakses Kaji Ulang.',
      persist: false,
    });
    router.replace('/dashboard');
    return;
  }
  if (!testStore.tests.length) {
    testStore.fetchAll();
  }
  const { data } = await orderStore.fetchAll();
  (data || []).forEach((order) => {
    kajiUlangStore.upsertFromRequest(order, {
      paymentDetail: order.paymentInfo || null,
    });
  });
});

function resetFormState() {
  showForm.value = false;
  isPreview.value = false;
  resetForm();
  resetRefundState();
}

function resetReviewState() {
  showReviewModal.value = false;
  reviewingOrder.value = null;
  reviewNote.value = '';
}

function resetRefundState() {
  showRefundModal.value = false;
  refundingOrder.value = null;
  refundFile.value = null;
  refundError.value = '';
}

function applyNewFormState() {
  resetReviewState();
  resetRefundState();
  resetForm();
  isPreview.value = false;
  showForm.value = true;
}

function findOrderById(orderId) {
  const target = String(orderId || '').trim().toLowerCase();
  if (!target) return null;
  return (
    kajiUlangStore.orders.find(
      (order) => String(order.orderNo || '').trim().toLowerCase() === target
    ) || null
  );
}

async function resolveOrderById(orderId) {
  const target = String(orderId || '').trim();
  if (!target) return null;
  const existing = findOrderById(target);
  if (existing) return existing;
  const { ok, data } = await orderStore.fetchById(target);
  if (!ok || !data) return null;
  return kajiUlangStore.upsertFromRequest(data, {
    paymentDetail: data.paymentInfo || null,
  });
}

function canReviewPayment(order) {
  return normalizeOrderStatus(order?.status) === 'payment_submitted';
}

  async function openEditById(orderId) {
    const order = await resolveOrderById(orderId);
    if (!order) {
      pushToast({
        tone: 'warning',
        title: 'Order Tidak Ditemukan',
      message: `Order ${orderId || '-'} tidak ditemukan.`,
    });
      clearRouteQuery();
      resetFormState();
      return;
    }
    isPreview.value = false;
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (lockedStatuses.has(normalizedStatus)) {
      pushToast({
        tone: 'warning',
        title: 'Belum Bisa Dibuka',
        message: 'Order sudah terkunci setelah lolos kaji ulang.',
      });
      clearRouteQuery();
      resetFormState();
      return;
    }
  isEditing.value = true;
  lookupError.value = '';
  lookupLoading.value = false;
  applyOrderToForm(order);
    editingOrderId.value = order.id;
    showForm.value = true;
  }

  async function openPreviewById(orderId) {
    const order = await resolveOrderById(orderId);
    if (!order) {
      pushToast({
        tone: 'warning',
        title: 'Order Tidak Ditemukan',
        message: `Order ${orderId || '-'} tidak ditemukan.`,
      });
      clearRouteQuery();
      resetFormState();
      return;
    }
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (!lockedStatuses.has(normalizedStatus)) {
      pushToast({
        tone: 'warning',
        title: 'Preview Belum Tersedia',
        message: 'Order belum lolos kaji ulang.',
      });
      clearRouteQuery();
      resetFormState();
      return;
    }
    isPreview.value = true;
    isEditing.value = false;
    lookupError.value = '';
    lookupLoading.value = false;
    applyOrderToForm(order);
    editingOrderId.value = order.id ?? order.orderNo ?? null;
    showForm.value = true;
  }

async function openPaymentReviewById(orderId) {
  const order = await resolveOrderById(orderId);
  if (!order) {
    pushToast({
      tone: 'warning',
      title: 'Order Tidak Ditemukan',
      message: `Order ${orderId || '-'} tidak ditemukan.`,
    });
    clearRouteQuery();
    resetReviewState();
    return;
  }
  if (!canReviewPayment(order)) {
    pushToast({
      tone: 'warning',
      title: 'Pembayaran Belum Siap',
      message: 'Status order belum bisa direview.',
    });
    clearRouteQuery();
    resetReviewState();
    return;
  }
  if (!order.paymentInfo) {
    pushToast({
      tone: 'warning',
      title: 'Bukti Tidak Ditemukan',
      message: 'Tidak ada bukti pembayaran yang dapat direview.',
    });
    clearRouteQuery();
    resetReviewState();
    return;
  }
  reviewingOrder.value = order;
  reviewNote.value = order.paymentInfo?.reviewNote || '';
  showReviewModal.value = true;
}

watch(
  [routeMode, routeId],
  async ([mode, id]) => {
    if (!mode) {
      resetReviewState();
      resetFormState();
      return;
    }

    if (mode === 'new') {
      applyNewFormState();
      return;
    }

    if (mode === 'edit') {
      resetReviewState();
      resetRefundState();
      if (!id) {
        pushToast({
          tone: 'warning',
          title: 'ID Order Kosong',
          message: 'Masukkan id order pada query untuk membuka form.',
        });
        clearRouteQuery();
        resetFormState();
        return;
      }
      await openEditById(id);
      return;
    }

  if (mode === 'payment') {
    resetFormState();
    if (!id) {
      pushToast({
        tone: 'warning',
        title: 'ID Order Kosong',
        message: 'Masukkan id order pada query untuk review pembayaran.',
      });
      clearRouteQuery();
      resetReviewState();
      return;
    }
    await openPaymentReviewById(id);
    return;
  }

  if (mode === 'preview') {
    resetReviewState();
    resetRefundState();
    if (!id) {
      pushToast({
        tone: 'warning',
        title: 'ID Order Kosong',
        message: 'Masukkan id order pada query untuk preview.',
      });
      clearRouteQuery();
      resetFormState();
      return;
    }
    await openPreviewById(id);
    return;
  }

  resetReviewState();
  resetFormState();
  },
  { immediate: true }
);

function setReviewRows(rows) {
  const source =
    Array.isArray(rows) && rows.length ? rows : makeDefaultReviewRows();
  reviewRows.splice(0, reviewRows.length, ...source.map((row) => ({ ...row })));
}

function applyOrderToForm(order) {
  if (!order) return;
  const derivedYear =
    order.orderYear || resolveYearFromDate(order.date || order.entryDate);
  Object.assign(form, {
    orderNo: order.orderNo || '',
    orderCode: order.orderCode || order.orderDisplay || order.order_code || order.number || '',
    orderNumber: order.orderNumber ?? null,
    orderYear: derivedYear,
    sampleNo: order.sampleNo || '',
    date: order.date || new Date().toISOString().slice(0, 10),
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    customerAddress: order.customerAddress || '',
    testType: order.testType || '',
    note: order.note || '',
    paymentInfo: clonePaymentInfo(order.paymentInfo),
  });
  form.testItems = cloneTestItems(order.testItems || []);
  setReviewRows(order.kajiUlangRows);
}

function resetForm() {
  Object.assign(form, {
    orderNo: '',
    orderCode: '',
    orderNumber: null,
    orderYear: '',
    sampleNo: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    testType: '',
    note: '',
    paymentInfo: null,
  });
  form.testItems = [];
  setReviewRows();
  editingOrderId.value = null;
  isEditing.value = false;
  lookupError.value = '';
  lookupLoading.value = false;
}

function handleAdd() {
  updateRouteQuery({ mode: 'new', id: null });
}

  function handleEdit(row) {
    const order =
      kajiUlangStore.orders.find((o) => o.id === row.id) ||
      kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
    if (!order) return;
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (lockedStatuses.has(normalizedStatus)) {
      pushToast({
        tone: 'warning',
        title: 'Belum Bisa Dibuka',
        message: 'Order sudah terkunci setelah lolos kaji ulang.',
      });
      return;
    }
  updateRouteQuery({ mode: 'edit', id: order.orderNo || order.id });
}

async function cancelOrder(row) {
  if (!row?.orderNo) return;
  if (!row.canCancel) {
    pushToast({
      tone: 'warning',
      title: 'Tidak Bisa Dibatalkan',
      message: 'Status order sudah tidak bisa dibatalkan.',
    });
    return;
  }
  const ok = await openConfirm({
    title: 'Batalkan order?',
    message: `Order ${row.orderNo} akan dibatalkan.`,
    confirmLabel: 'Batalkan',
    variant: 'danger',
  });
  if (!ok) return;
  const result = await orderStore.cancelOrder(row.orderNo);
  if (!result?.ok) {
    pushToast({
      tone: 'error',
      title: 'Gagal Membatalkan',
      message: result?.error || 'Tidak dapat membatalkan order.',
    });
    return;
  }
  const paymentInfo = result?.data?.paymentInfo || row.paymentInfo;
  const cancelPaymentInfo = paymentInfo
    ? { ...paymentInfo, status: 'cancelled' }
    : null;
  kajiUlangStore.updateOrder(row.id ?? row.orderNo, {
    status: 'cancelled',
    paymentInfo: cancelPaymentInfo,
  });
  pushToast({
    tone: 'success',
    title: 'Order Dibatalkan',
    message: `Order ${row.orderNo} sudah dibatalkan.`,
  });
}

async function markTesting(row) {
  if (!row?.orderNo) return;
  const ok = await openConfirm({
    title: 'Mulai pengujian?',
    message: `Order ${row.orderNo || '-'} akan masuk status pengujian.`,
    confirmLabel: 'Mulai',
  });
  if (!ok) return;
  const { ok: updatedOk, error, data } = await orderStore.markTesting(row.orderNo);
  if (!updatedOk) {
    pushToast({
      tone: 'error',
      title: 'Gagal Memulai Uji',
      message: error || 'Tidak dapat memperbarui status pengujian.',
    });
    return;
  }
  const updated = data || {};
  kajiUlangStore.updateOrder(row.id ?? row.orderNo, {
    status: updated.status || 'testing',
    paymentInfo: updated.paymentInfo || row.paymentInfo,
  });
  pushToast({
    tone: 'success',
    title: 'Pengujian Dimulai',
    message: `Order ${row.orderNo || '-'} masuk proses pengujian.`,
  });
}

async function completeTesting(row) {
  if (!row?.orderNo) return;
  const ok = await openConfirm({
    title: 'Selesaikan pengujian?',
    message: `Order ${row.orderNo || '-'} akan ditandai selesai.`,
    confirmLabel: 'Selesai',
  });
  if (!ok) return;
  const { ok: updatedOk, error, data } = await orderStore.completeOrder(row.orderNo);
  if (!updatedOk) {
    pushToast({
      tone: 'error',
      title: 'Gagal Menyelesaikan',
      message: error || 'Tidak dapat menyelesaikan pengujian.',
    });
    return;
  }
  const updated = data || {};
  kajiUlangStore.updateOrder(row.id ?? row.orderNo, {
    status: updated.status || 'completed',
    paymentInfo: updated.paymentInfo || row.paymentInfo,
  });
  pushToast({
    tone: 'success',
    title: 'Pengujian Selesai',
    message: `Order ${row.orderNo || '-'} sudah selesai.`,
  });
}

function openPaymentReview(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order?.paymentInfo) {
    pushToast({
      tone: 'warning',
      title: 'Bukti Tidak Ditemukan',
      message: 'Tidak ada bukti pembayaran yang dapat direview.',
    });
    return;
  }
  updateRouteQuery({ mode: 'payment', id: order.orderNo || order.id });
}

function closeReviewModal() {
  resetReviewState();
  clearRouteQuery();
}

function openRefundModal(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order) {
    pushToast({
      tone: 'warning',
      title: 'Order Tidak Ditemukan',
      message: 'Data refund tidak tersedia.',
    });
    return;
  }
  refundingOrder.value = order;
  refundFile.value = null;
  refundError.value = '';
  showRefundModal.value = true;
}

  function closeRefundModal() {
    resetRefundState();
  }

  function resolveKajiUlangOrder(row) {
    if (!row) return null;
    return (
      kajiUlangStore.orders.find((o) => o.id === row.id) ||
      kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo) ||
      null
    );
  }

  function openPreviewForm(row) {
    const order = resolveKajiUlangOrder(row);
    if (!order) {
      pushToast({
        tone: 'error',
        title: 'Data Tidak Ditemukan',
        message: 'Order kaji ulang tidak tersedia untuk dipreview.',
      });
      return;
    }
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (!lockedStatuses.has(normalizedStatus)) {
      pushToast({
        tone: 'warning',
        title: 'Preview Belum Tersedia',
        message: 'Order belum lolos kaji ulang.',
      });
      return;
    }
    updateRouteQuery({ mode: 'preview', id: order.orderNo || order.id });
  }

async function approvePaymentEvidence() {
  if (!reviewingOrder.value) return;
  const updated = kajiUlangStore.reviewPayment(reviewingOrder.value.id, {
    approved: true,
    reviewer: reviewerName,
    note: reviewNote.value,
  });
  if (updated) {
    const { ok, error } = await orderStore.approvePayment(updated.orderNo);
    if (!ok) {
      pushToast({
        tone: 'error',
        title: 'Gagal Menyetujui Pembayaran',
        message: error || 'Tidak dapat memperbarui status pembayaran.',
      });
      return;
    }
    orderStore.updateLocalOrder(updated.orderNo, {
      status: 'payment_approved',
      paymentInfo: updated.paymentInfo,
    });
    pushToast({
      tone: 'success',
      title: 'Pembayaran Disetujui',
      message: `Order ${updated.orderNo || '-'} siap diteruskan ke proses pengujian.`,
    });
  }
  closeReviewModal();
}

async function rejectPaymentEvidence() {
  if (!reviewingOrder.value) return;
  const confirmed = await openConfirm({
    title: 'Tolak bukti pembayaran?',
    message: 'Permintaan akan dibatalkan jika bukti tidak valid.',
    confirmLabel: 'Tolak',
    variant: 'danger',
  });
  if (!confirmed) return;
  const updated = kajiUlangStore.reviewPayment(reviewingOrder.value.id, {
    approved: false,
    reviewer: reviewerName,
    note: reviewNote.value,
  });
  if (updated) {
    const { ok, error } = await orderStore.rejectPayment(updated.orderNo);
    if (!ok) {
      pushToast({
        tone: 'error',
        title: 'Gagal Menolak Pembayaran',
        message: error || 'Tidak dapat memperbarui status pembayaran.',
      });
      return;
    }
    orderStore.updateLocalOrder(updated.orderNo, {
      status: 'payment_rejected',
      paymentInfo: updated.paymentInfo,
    });
    pushToast({
      tone: 'error',
      title: 'Bukti Ditolak',
      message: `Permintaan ${updated.orderNo || '-'} membutuhkan unggahan ulang bukti pembayaran.`,
    });
  }
  closeReviewModal();
}

function handleRefundFileChange(event) {
  const file = event?.target?.files?.[0] || null;
  refundFile.value = file;
  refundError.value = '';
}

async function submitRefund() {
  if (!refundingOrder.value) return;
  if (!refundFile.value) {
    refundError.value = 'File refund wajib diunggah.';
    return;
  }
  const confirmed = await openConfirm({
    title: 'Proses refund?',
    message: `Refund untuk order ${refundingOrder.value.orderNo || '-'} akan diproses.`,
    confirmLabel: 'Refund',
    variant: 'danger',
  });
  if (!confirmed) return;
  const { ok, error, data } = await orderStore.refundOrder(
    refundingOrder.value.orderNo,
    { file: refundFile.value }
  );
  if (!ok) {
    pushToast({
      tone: 'error',
      title: 'Gagal Refund',
      message: error || 'Tidak dapat memproses refund.',
    });
    return;
  }
  const updated = data || {};
  kajiUlangStore.updateOrder(
    refundingOrder.value.id ?? refundingOrder.value.orderNo,
    {
      status: updated.status || 'refunded',
      paymentInfo: updated.paymentInfo || refundingOrder.value.paymentInfo,
    }
  );
  pushToast({
    tone: 'success',
    title: 'Refund Diproses',
    message: `Order ${refundingOrder.value.orderNo || '-'} sudah refund.`,
  });
  closeRefundModal();
}

async function lookupOrder(orderNo) {
  const query = (orderNo || '').trim();
  if (!query) {
    lookupError.value = 'Masukkan ID Order terlebih dahulu.';
    return;
  }
  lookupLoading.value = true;
  lookupError.value = '';
  try {
    const lower = query.toLowerCase();
    let order =
      kajiUlangStore.orders.find((o) => o.orderNo?.toLowerCase() === lower) ||
      null;

    if (!order) {
      const { ok, data, error } = await orderStore.fetchById(query);
      if (ok && data) {
        order = kajiUlangStore.upsertFromRequest(data, {
          paymentDetail: data.paymentInfo || null,
        });
      } else {
        lookupError.value = error || 'Data permintaan tidak ditemukan.';
        return;
      }
    }

    if (!order) {
      lookupError.value = 'Gagal memuat data order.';
      return;
    }

    applyOrderToForm(order);
    isEditing.value = true;
    editingOrderId.value = order.id;
    showForm.value = true;
    updateRouteQuery({ mode: 'edit', id: order.orderNo || order.id });
  } catch (err) {
    console.error('lookupOrder error', err);
    lookupError.value = 'Terjadi kesalahan saat mencari ID Order.';
  } finally {
    lookupLoading.value = false;
  }
}

async function saveDraft() {
  if (!form.orderNo) {
    pushToast({
      tone: 'warning',
      title: 'ID Order Kosong',
      message: 'Masukkan ID Order terlebih dahulu.',
    });
    return;
  }
  if (!editingOrderId.value) {
    pushToast({
      tone: 'warning',
      title: 'Belum Ada Data',
      message: 'Cari ID Order terlebih dahulu sebelum menyimpan.',
    });
    return;
  }
  kajiUlangStore.updateOrder(editingOrderId.value, {
    orderCode: form.orderCode,
    orderNumber: form.orderNumber,
    orderYear: form.orderYear,
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    customerAddress: form.customerAddress,
    testType: form.testType,
    note: form.note,
    testItems: cloneTestItems(form.testItems),
    paymentInfo: clonePaymentInfo(form.paymentInfo),
  });
  kajiUlangStore.updateReview(editingOrderId.value, {
    rows: reviewRows,
    note: form.note,
  });
  const evaluationResult = await syncServiceEvaluations({ strict: false });
  if (!evaluationResult.ok) {
    pushToast({
      tone: 'warning',
      title: 'Draft Disimpan',
      message:
        evaluationResult.error ||
        'Draft tersimpan, tetapi evaluasi layanan gagal diperbarui.',
    });
    return;
  }
  if (evaluationResult.skipped) {
    pushToast({
      tone: 'warning',
      title: 'Draft Disimpan',
      message: `Draft tersimpan, tetapi ${evaluationResult.skipped} evaluasi belum lengkap sehingga belum dikirim ke server.`,
    });
    return;
  }
  pushToast({
    tone: 'success',
    title: 'Draft Disimpan',
    message: 'Perubahan kaji ulang telah tersimpan sementara.',
  });
}

async function approveReview() {
  if (!form.orderNo) {
    pushToast({
      tone: 'warning',
      title: 'ID Order Kosong',
      message: 'Masukkan ID Order terlebih dahulu.',
    });
    return;
  }
  if (!form.testItems.length) {
    pushToast({
      tone: 'warning',
      title: 'Pengujian Belum Ada',
      message: 'Data pengujian belum tersedia. Cari ID Order yang valid.',
    });
    return;
  }
  if (!isEvaluationComplete(form.testItems)) {
    pushToast({
      tone: 'warning',
      title: 'Evaluasi Belum Lengkap',
      message:
        'Lengkapi evaluasi kaji ulang untuk semua pengujian sebelum meloloskan.',
    });
    return;
  }
  const evaluationResult = await syncServiceEvaluations({ strict: true });
  if (!evaluationResult.ok) {
    pushToast({
      tone: 'error',
      title: 'Gagal Menyimpan Evaluasi',
      message:
        evaluationResult.error ||
        'Evaluasi layanan belum berhasil disimpan ke server.',
    });
    return;
  }
  const invoiceDetail = buildInvoiceDetail();
  if (editingOrderId.value) {
    kajiUlangStore.updateOrder(editingOrderId.value, {
      orderCode: form.orderCode,
      orderNumber: form.orderNumber,
      orderYear: form.orderYear,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      testType: form.testType,
      note: form.note,
      testItems: cloneTestItems(form.testItems),
      paymentInfo: invoiceDetail,
      status: invoiceDetail.status,
    });
    kajiUlangStore.updateReview(editingOrderId.value, {
      rows: reviewRows,
      note: form.note,
      status: invoiceDetail.status,
      validator: 'Manajer Teknis',
    });
  } else {
    const created = kajiUlangStore.addOrder({
      orderNo: form.orderNo,
      orderCode: form.orderCode,
      orderNumber: form.orderNumber,
      orderYear: form.orderYear,
      date: form.date,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      testType: form.testType,
      note: form.note,
      testItems: cloneTestItems(form.testItems),
      status: invoiceDetail.status,
      paymentInfo: invoiceDetail,
    });
    kajiUlangStore.updateReview(created.id, {
      rows: reviewRows,
      note: form.note,
      status: invoiceDetail.status,
      validator: 'Manajer Teknis',
    });
  }
  try {
    const { ok, error } = await orderStore.approveOrder(form.orderNo);
    if (!ok) {
      pushToast({
        tone: 'error',
        title: 'Gagal Menyetujui Permintaan',
        message: error || 'Tidak dapat memperbarui status permintaan.',
      });
    } else {
      orderStore.updateLocalOrder(form.orderNo, {
        status: invoiceDetail.status,
        paymentInfo: invoiceDetail,
      });
    }
  } catch (err) {
    console.error('Gagal sinkron status permintaan', err);
  }
  resetFormState();
  clearRouteQuery();
  pushToast({
    tone: 'success',
    title: 'Draft Kaji Ulang Disimpan',
    message: 'Invoice siap dibagikan ke pelanggan untuk proses pembayaran.',
  });
}

function rejectReview() {
  if (editingOrderId.value) {
    kajiUlangStore.updateReview(editingOrderId.value, {
      rows: reviewRows,
      note: form.note,
      status: 'rejected',
    });
  }
  if (form.orderNo) {
    orderStore.rejectOrder(form.orderNo).then(({ ok, error }) => {
      if (!ok) {
        pushToast({
          tone: 'error',
          title: 'Gagal Menolak Permintaan',
          message: error || 'Tidak dapat memperbarui status permintaan.',
        });
        return;
      }
      orderStore.updateLocalOrder(form.orderNo, {
        status: 'rejected',
      });
    });
  }
  resetFormState();
  clearRouteQuery();
}

function closeForm() {
  resetFormState();
  clearRouteQuery();
}

function formatDateDisplay(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const raw = String(value || '').trim();
    if (raw.length >= 10) {
      const fallback = new Date(raw.slice(0, 10));
      if (!Number.isNaN(fallback.getTime())) {
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(fallback);
      }
    }
    return raw || '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

async function copyId(id) {
  if (!id) return;
  const copied = await copyText(id);
  pushToast({
    tone: copied ? 'success' : 'error',
    title: copied ? 'ID disalin' : 'Gagal menyalin',
    message: copied
      ? `${id} sudah disalin ke clipboard.`
      : 'Tidak dapat menyalin ID, coba lagi atau salin manual.',
    duration: 2500,
    persist: false,
  });
}
</script>
