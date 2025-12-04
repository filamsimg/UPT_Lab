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
      <DataTable
        :columns="columns"
        :rows="tableRows"
        searchable
        filterable
        search-field="orderNo"
        status-field="status"
        date-field="date"
        :status-options="statusOptions"
        scroll-body-on-mobile
        body-scroll-height="55vh"
      >
        <template #sampleNo="{ row }">
          <div class="text-sm text-gray-700">
            <template v-if="row.sampleCodes && row.sampleCodes.length">
              <p v-for="code in row.sampleCodes" :key="`${row.id}-sample-${code}`">
                {{ code }}
              </p>
            </template>
            <span v-else>-</span>
          </div>
        </template>
        <template #date="{ value }">
          <span class="text-sm text-gray-700">{{
            formatDateDisplay(value)
          }}</span>
        </template>
        <template #orderNo="{ value }">
          <button
            type="button"
            class="w-full text-left text-sm text-blue-600 underline hover:text-blue-800"
            @click="copyId(value)"
          >
            {{ value || '-' }}
          </button>
        </template>
        <template #status="{ value }">
          <Badge :status="value" />
        </template>
        <!-- Kolom review pembayaran dihilangkan; hanya gunakan status -->
        <template #actions="{ row }">
          <div class="flex justify-center gap-2 text-surfaceDark">
            <button
              class="rounded-md bg-slate-50 p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
              @click="printKajiUlang(row)"
              title="Cetak Berita Acara"
            >
              <PrinterIcon class="h-5 w-5" />
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
              v-if="row.canDelete"
              class="rounded-md bg-red-50 p-1.5 text-danger transition hover:bg-red-100 hover:text-red-700"
              @click="handleDelete(row)"
              title="Hapus Data"
            >
              <TrashIcon class="h-5 w-5" />
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
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import Badge from '@/components/common/Badge.vue';
import FormKajiUlang from '@/components/form/FormKajiUlang.vue';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XCircleIcon,
  PrinterIcon,
} from '@heroicons/vue/24/outline';
import logoDinas from '@/assets/LOGO DINAS KAB TEGAL.png';
import { buildKajiUlangPrintHtml } from '@/utils/printTemplates';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useTestStore } from '@/stores/useTestStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { usePermintaanStore } from '@/stores/usePermintaanStore';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { copyText } from '@/utils/copyText';

const kajiUlangStore = useKajiUlangStore();
const testStore = useTestStore();
const openConfirm = useConfirmDialog();
const permintaanStore = usePermintaanStore();
const { notify } = useNotificationCenter();
const pushToast = (options = {}) =>
  notify({
    duration: options.duration ?? 4500,
    ...options,
  });

const showForm = ref(false);
const editingOrderId = ref(null);
const isEditing = ref(false);
const lookupLoading = ref(false);
const lookupError = ref('');
const showReviewModal = ref(false);
const reviewingOrder = ref(null);
const reviewNote = ref('');
const reviewerName = 'Admin';

const makeDefaultReviewRows = () => [
  { topic: 'Peralatan', result: '' },
  { topic: 'Personel', result: '' },
  { topic: 'Waktu', result: '' },
  { topic: 'Kondisi', result: '' },
  { topic: 'Laboratorium Subkontrak', result: '' },
];

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
  const allowedStatuses = ['payment_pending_review', 'payment_verified'];
  const statusCandidate = baseInfo.status || 'pending_payment';
  const status = allowedStatuses.includes(statusCandidate)
    ? statusCandidate
    : 'pending_payment';
  const amountPaid = Math.max(0, Number(baseInfo.amountPaid) || 0);
  const total = baseInfo.total ?? computedTotal;
  const outstanding =
    baseInfo.outstanding ?? Math.max(total - amountPaid, 0);
  return {
    ...baseInfo,
    status,
    reviewStatus:
      status === 'pending_payment'
        ? 'invoice_ready'
        : baseInfo.reviewStatus || 'pending',
    total,
    amountPaid,
    outstanding,
    transferFiles: baseInfo.transferFiles || [],
    testRows: items,
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

const columns = [
  { field: 'orderNo', title: 'ID Order', className: 'min-w-[150px]' },
  {
    field: 'sampleNo',
    title: 'Sample No',
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
    field: 'testType',
    title: 'Jenis Pengujian',
    className: 'hidden lg:table-cell min-w-[160px]',
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
  { value: 'awaiting_kaji_ulang', label: 'Menunggu Kaji Ulang' },
  { value: 'pending_payment', label: 'Menunggu Pembayaran' },
  { value: 'payment_pending_review', label: 'Menunggu Review Pembayaran' },
  { value: 'payment_verified', label: 'Pembayaran Terverifikasi' },
  { value: 'payment_review_rejected', label: 'Bukti Pembayaran Ditolak' },
  { value: 'in_testing', label: 'Proses Pengujian' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'rejected', label: 'Ditolak' },
];

const formatOrderNumberForSample = (orderNumber) => {
  if (orderNumber === null || orderNumber === undefined || orderNumber === '') return '--';
  if (typeof orderNumber === 'number') return String(orderNumber).padStart(3, '0');
  const trimmed = String(orderNumber).trim();
  if (!trimmed) return '--';
  return /^\d+$/.test(trimmed) ? trimmed.padStart(3, '0') : trimmed;
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

const deriveSampleValue = (item = {}) => {
  const value = item.sampleNo !== undefined && item.sampleNo !== null ? String(item.sampleNo).trim() : '';
  if (value) return value;
  if (item.sampleCode) return String(item.sampleCode).trim();
  return '--';
};

const buildSampleCodes = (order = {}) => {
  if (!Array.isArray(order.testItems) || !order.testItems.length) return [];
  const prefix = resolveMonthYearLabel(order.date, order.orderYear);
  const orderSegment = formatOrderNumberForSample(order.orderNumber);
  return order.testItems.map((item, idx) => {
    const code = deriveTestCode(item) || `ITEM-${idx + 1}`;
    const sampleSegment = deriveSampleValue(item);
    return `${prefix}.${orderSegment}/${code}/${sampleSegment}`;
  });
};

const tableRows = computed(() =>
  kajiUlangStore.orders
    .filter((order) => order.status !== 'cancelled')
    .map((order) => {
      const sampleCodes = buildSampleCodes(order);
      // Konsolidasi status: gunakan status permintaan sebagai satu sumber
      return {
        id: order.id,
        orderNo: order.orderNo,
        sampleNo: sampleCodes.join(', ') || order.sampleNo || '',
        sampleCodes,
        date: order.date || '',
        customerName: order.customerName || '',
        status: order.status,
        testType: order.testType || '-',
        paymentInfo: order.paymentInfo,
        canReviewPayment: order.status === 'payment_pending_review',
        canOpenForm: !['completed', 'in_testing', 'payment_verified'].includes(order.status),
        canDelete: !['in_testing', 'completed'].includes(order.status),
      };
    })
);

const tests = computed(() => testStore.tests || []);

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
  resetForm();
  showForm.value = true;
}

function handleEdit(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order) return;
  if (['payment_verified', 'completed', 'in_testing'].includes(order.status)) {
    pushToast({
      tone: 'warning',
      title: 'Belum Bisa Dibuka',
      message: 'Order sudah terkunci karena pembayaran selesai.',
    });
    return;
  }
  isEditing.value = true;
  lookupError.value = '';
  lookupLoading.value = false;
  applyOrderToForm(order);
  editingOrderId.value = order.id;
  showForm.value = true;
}

async function handleDelete(row) {
  const ok = await openConfirm({
    title: 'Hapus data kaji ulang?',
    message: `Data kaji ulang untuk order ${row.orderNo} akan dihapus.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  kajiUlangStore.removeOrder(row.id ?? row.orderNo);
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
  reviewingOrder.value = order;
  reviewNote.value = order.paymentInfo.reviewNote || '';
  showReviewModal.value = true;
}

function closeReviewModal() {
  reviewingOrder.value = null;
  reviewNote.value = '';
  showReviewModal.value = false;
}

function printKajiUlang(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order) {
    pushToast({
      tone: 'error',
      title: 'Data Tidak Ditemukan',
      message: 'Order kaji ulang tidak tersedia untuk dicetak.',
    });
    return;
  }
  const html = buildKajiUlangPrintHtml(order, {
    logoSrc: logoDinas,
    title:
      order.status === 'rejected' || order.status === 'cancelled'
        ? 'Berita Acara Kaji Ulang (Ditolak)'
        : 'Berita Acara Kaji Ulang',
  });
  openPrintWindow(html);
}

async function approvePaymentEvidence() {
  if (!reviewingOrder.value) return;
  const updated = kajiUlangStore.reviewPayment(reviewingOrder.value.id, {
    approved: true,
    reviewer: reviewerName,
    note: reviewNote.value,
  });
  if (updated) {
    await permintaanStore.updateRequest(updated.orderNo, {
      status: 'payment_verified',
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
    await permintaanStore.updateRequest(updated.orderNo, {
      status: 'payment_review_rejected',
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
      let request =
        permintaanStore.requestList.find(
          (r) => r.idOrder?.toLowerCase() === lower
        ) || null;

      if (!request) {
        const { ok, data, error } = await permintaanStore.checkOrderStatus(
          query
        );
        if (ok && data) {
          request = data;
        } else {
          lookupError.value = error || 'Data permintaan tidak ditemukan.';
          return;
        }
      }

      order = kajiUlangStore.upsertFromRequest(request, {
        paymentDetail: request.paymentInfo || null,
      });
    }

    if (!order) {
      lookupError.value = 'Gagal memuat data order.';
      return;
    }

    applyOrderToForm(order);
    editingOrderId.value = order.id;
    showForm.value = true;
  } catch (err) {
    console.error('lookupOrder error', err);
    lookupError.value = 'Terjadi kesalahan saat mencari ID Order.';
  } finally {
    lookupLoading.value = false;
  }
}

function saveDraft() {
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
  const invoiceDetail = buildInvoiceDetail();
  if (editingOrderId.value) {
    kajiUlangStore.updateOrder(editingOrderId.value, {
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
      status: 'pending_validation',
      validator: 'Manajer Teknis',
    });
  } else {
    const created = kajiUlangStore.addOrder({
      orderNo: form.orderNo,
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
      status: 'pending_validation',
      validator: 'Manajer Teknis',
    });
  }
  try {
    await permintaanStore.updateRequest(form.orderNo, {
      status: invoiceDetail.status,
      paymentInfo: invoiceDetail,
    });
  } catch (err) {
    console.error('Gagal sinkron status permintaan', err);
  }
  showForm.value = false;
  resetForm();
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
  showForm.value = false;
  resetForm();
}

function closeForm() {
  showForm.value = false;
  resetForm();
}

function openPrintWindow(html) {
  if (!html) return;
  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) {
    pushToast({
      tone: 'error',
      title: 'Cetak Diblokir',
      message: 'Izinkan pop-up pada browser Anda untuk mencetak dokumen.',
    });
    return;
  }
  try {
    printWindow.document.open('text/html', 'replace');
    printWindow.document.write(html);
    printWindow.document.close();
    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        console.warn('Gagal memicu dialog cetak', err);
      }
    };
    if ('onload' in printWindow) {
      printWindow.onload = () => triggerPrint();
    } else {
      setTimeout(triggerPrint, 300);
    }
    printWindow.onafterprint = () => {
      try {
        printWindow.close();
      } catch (err) {
        console.warn('Gagal menutup jendela cetak', err);
      }
    };
  } catch (err) {
    console.error('Tidak dapat menulis konten ke jendela cetak', err);
    pushToast({
      tone: 'error',
      title: 'Gagal Mencetak',
      message: 'Terjadi kesalahan saat menyiapkan dokumen cetak.',
    });
  }
}

function formatDateDisplay(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
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
