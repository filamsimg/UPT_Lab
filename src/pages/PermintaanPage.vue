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
        <!-- Tombol hapus massal -->
        <button
          v-if="selectedRows.length"
          @click="deleteSelected"
          class="w-full rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 sm:w-auto"
        >
          Hapus Terpilih ({{ selectedRows.length }})
        </button>
      </div>

      <div class="overflow-x-auto md:overflow-visible">
        <DataTable
          :columns="columns"
          :rows="tableRows"
          :page-size="10"
          searchable
          filterable
          selectable
          :status-options="requestStatusOptions"
          row-key="__rowKey"
          scroll-body-on-mobile
          body-scroll-height="55vh"
          @update:selected="selectedRows = $event"
        >
          <template #idOrder="{ value }">
            <span class="block text-sm text-gray-700 break-all">
              {{ value || '-' }}
            </span>
          </template>
          <template #orderNumber="{ row }">
            <span class="text-sm text-gray-700">
              {{ formatOrderNumber(row) }}
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
                  {{ item.testName || resolveTestName(item) }}
                  <span class="text-gray-500">({{ item.quantity }})</span>
                </span>
              </template>
              <span v-else class="text-xs text-gray-400">
                {{ row.testCategory || '-' }}
              </span>
            </div>
          </template>

          <template #status="{ value }">
            <div class="w-full">
              <Badge :status="value" class="w-full justify-center" />
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
                class="p-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-800"
                @click="deleteRequest(row)"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
              <button
                v-if="canOpenPayment(row)"
                class="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 hover:text-amber-800"
                @click="openPaymentModal(row)"
                title="Input Pembayaran"
              >
                <BanknotesIcon class="w-5 h-5" />
              </button>
              <button
                class="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                :title="canPrint(row) ? 'Preview & Cetak' : 'Cetak tersedia setelah pembayaran terverifikasi'"
                :disabled="!canPrint(row)"
                @click="openPreviewModal(row)"
              >
                <EyeIcon class="w-5 h-5" />
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

    <transition name="fade">
      <div
        v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
      >
        <div
          class="relative w-[98vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        >
          <button
            class="absolute right-4 top-4 text-gray-500 transition hover:text-gray-700"
            @click="closePreviewModal"
          >
            <span class="sr-only">Tutup</span>
            ✕
          </button>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              :src="logoDinas"
              alt="Logo Dinas Kabupaten Tegal"
              class="h-16 w-16 object-contain"
            />
            <div>
              <h3 class="text-xl font-semibold text-surfaceDark">
                Preview Permintaan & Invoice
              </h3>
              <p class="text-sm text-gray-500">
                Tinjau seluruh informasi sebelum mencetak dokumen resmi.
              </p>
            </div>
          </div>
          <div class="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 class="text-sm font-semibold text-surfaceDark uppercase tracking-wide">
                Detail Permintaan
              </h4>
              <dl class="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <dt class="text-xs uppercase text-gray-500">ID Order</dt>
                  <dd>{{ previewRequest?.idOrder || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase text-gray-500">Nomor Order</dt>
                  <dd>{{ formatOrderNumber(previewRequest) }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase text-gray-500">Tanggal Masuk</dt>
                  <dd>{{ formatFullDate(previewRequest?.entryDate) }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase text-gray-500">Status</dt>
                  <dd>{{ translateStatus(previewRequest?.status) }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase text-gray-500">Customer</dt>
                  <dd>{{ previewRequest?.customerName || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase text-gray-500">Kontak</dt>
                  <dd>{{ previewRequest?.phoneNumber || '-' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-xs uppercase text-gray-500">Alamat</dt>
                  <dd>{{ previewRequest?.address || '-' }}</dd>
                </div>
              </dl>
              <div class="mt-5">
                <h5 class="text-xs font-semibold uppercase text-gray-500">
                  Detail Pengujian
                </h5>
                <div class="mt-2 space-y-3">
                  <article
                    v-for="(item, idx) in previewRequest?.testItems || []"
                    :key="`preview-test-${idx}`"
                    class="rounded-lg border border-gray-200 bg-white p-3 text-sm"
                  >
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>Pengujian {{ idx + 1 }}</span>
                      <span>{{ item.quantity }} x</span>
                    </div>
                    <p class="mt-1 font-semibold text-surfaceDark">
                      {{ item.testName || resolveTestName(item) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ item.objectName || '-' }}
                    </p>
                    <p class="mt-1 text-sm text-gray-700">
                      Tarif: {{ formatCurrency(item.price) }}
                    </p>
                  </article>
                  <p
                    v-if="!(previewRequest?.testItems || []).length"
                    class="text-xs text-gray-500"
                  >
                    Belum ada detail pengujian.
                  </p>
                </div>
              </div>
            </section>

            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="text-sm font-semibold text-surfaceDark uppercase tracking-wide">
                Ringkasan Pembayaran
              </h4>
              <div
                class="mt-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700"
              >
                <div class="flex items-center justify-between">
                  <span>Total Tagihan</span>
                  <strong>{{ formatCurrency(previewTotals.total) }}</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span>Pembayaran Diterima</span>
                  <strong>{{ formatCurrency(previewTotals.paid) }}</strong>
                </div>
                <div class="flex items-center justify-between text-amber-700">
                  <span>Sisa Pembayaran</span>
                  <strong>{{ formatCurrency(previewTotals.outstanding) }}</strong>
                </div>
              </div>
              <div class="mt-4 space-y-2 text-xs text-gray-500">
                <p>
                  Status saat ini: <strong>{{ translateStatus(previewRequest?.status) }}</strong>
                </p>
                <p>
                  Batas pembayaran mengikuti ketentuan invoice. Sample uji harap dikirim setelah
                  pembayaran dan bukti dikonfirmasi.
                </p>
              </div>
            </section>
          </div>

          <div
            class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
          >
            <button
              class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 sm:w-auto"
              @click="closePreviewModal"
            >
              Tutup
            </button>
            <button
              class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 sm:w-auto"
              @click="printFromPreview('request')"
            >
              Cetak Permintaan
            </button>
            <button
              class="w-full rounded-md bg-primary text-white px-4 py-2 text-sm font-semibold transition hover:bg-primaryDark sm:w-auto"
              @click="printFromPreview('invoice')"
            >
              Cetak Invoice
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePermintaanStore } from '@/stores/usePermintaanStore';
import { useTestStore } from '@/stores/useTestStore';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XCircleIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline';
import FormPermintaan from '@/components/form/FormPermintaan.vue';
import FormPayment from '@/components/form/FormPayment.vue';
import Badge from '@/components/common/Badge.vue';
import DataTable from '../components/common/DataTable.vue';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import {
  buildPermintaanPrintHtml,
  formatCurrency,
  formatFullDate,
  translateStatus,
} from '@/utils/printTemplates';
import logoDinas from '@/assets/LOGO DINAS KAB TEGAL.png';

const store = usePermintaanStore();
const testStore = useTestStore();
const showModal = ref(false);
const showPaymentModal = ref(false);
const showPreviewModal = ref(false);
const isEdit = ref(false);
const selectedRequest = ref(null);
const selectedRows = ref([]);
const paymentContext = ref(null);
const previewRequest = ref(null);
const openConfirm = useConfirmDialog();
const { notify } = useNotificationCenter();
const sampleShipmentMessage =
  'Bukti pembayaran telah dikirim. Admin akan mereview sebelum melanjutkan proses pengujian.';

onMounted(() => {
  store.fetchAll();
  if (!testStore.tests.length) {
    testStore.fetchAll();
  }
});

// === DataTable columns ===
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
    title: 'No. Order',
    className: 'md:min-w-[120px]',
  },
  { field: 'entryDate', title: 'Tanggal Masuk' },
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
    title: 'Jenis Pengujian',
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
  { value: 'awaiting_kaji_ulang', label: 'Menunggu Kaji Ulang' },
  { value: 'pending_payment', label: 'Menunggu Pembayaran' },
  { value: 'payment_pending_review', label: 'Menunggu Review Pembayaran' },
  { value: 'payment_verified', label: 'Pembayaran Terverifikasi' },
  { value: 'payment_review_rejected', label: 'Bukti Pembayaran Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const tableRows = computed(() =>
  (store.requestList ?? []).map((row, index) => ({
    ...row,
    __rowKey: row.idOrder ? `${row.idOrder}-${index}` : `row-${index}`,
  }))
);

const previewTotals = computed(() => {
  const row = previewRequest.value;
  if (!row) {
    return { total: 0, paid: 0, outstanding: 0 };
  }
  const items = row.testItems || [];
  const total = items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);
    return sum + quantity * price;
  }, 0);
  const paid = Number(row.paymentInfo?.amountPaid || 0);
  const outstanding = Math.max(0, total - paid);
  return { total, paid, outstanding };
});

// === Modal logic ===
function openAddModal() {
  isEdit.value = false;
  selectedRequest.value = {
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

  showModal.value = true;
}

function openEditModal(item) {
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

function canOpenPayment(row) {
  if (!row) return false;
  const allowedStatuses = ['pending_payment', 'payment_review_rejected'];
  return (
    allowedStatuses.includes(row.status) && Array.isArray(row.testItems) && row.testItems.length > 0
  );
}

function openPaymentModal(row) {
  if (!canOpenPayment(row)) return;
  paymentContext.value = {
    orderId: row.idOrder,
    customerName: row.customerName,
    entryDate: row.entryDate,
    rows: buildPaymentRows(row.testItems),
  };
  showPaymentModal.value = true;
}

function buildPaymentRows(items = []) {
  return (items || []).map((item) => {
    const test =
      typeof testStore.getTestById === 'function'
        ? testStore.getTestById(item.testId)
        : (testStore.tests || []).find((t) => t.id === item.testId);
    return {
      testId: item.testId || test?.id || null,
      testName: item.testName || test?.name || test?.testCategory || '',
      objectName:
        item.objectName ||
        item.testName ||
        test?.testCategory ||
        test?.name ||
        '',
      quantity: item.quantity ?? 1,
      price: Number(item.price ?? test?.price ?? 0),
    };
  });
}

async function handleFormSubmit(payload) {
  const data = payload?.data || {};
  let savedData = null;

  if (isEdit.value) {
    await store.updateRequest(data.idOrder, data);
    savedData =
      store.requestList.find((req) => req.idOrder === data.idOrder) || data;
  } else {
    const { data: created } = await store.addRequest(data);
    savedData = created || data;
  }

  showModal.value = false;
  selectedRequest.value = null;
  isEdit.value = false;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  paymentContext.value = null;
}

function closeModal() {
  showModal.value = false;
  selectedRequest.value = null;
  isEdit.value = false;
}

async function deleteRequest(item) {
  const ok = await openConfirm({
    title: 'Hapus permintaan?',
    message: `Permintaan ${item.idOrder} akan dihapus permanen.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  await store.deleteRequest(item.idOrder);
}

async function deleteSelected() {
  if (!selectedRows.value.length) return;
  const ok = await openConfirm({
    title: 'Hapus permintaan terpilih?',
    message: `${selectedRows.value.length} permintaan akan dihapus permanen.`,
    confirmLabel: 'Hapus Semua',
    variant: 'danger',
  });
  if (!ok) return;
  for (const row of selectedRows.value) {
    await store.deleteRequest(row.idOrder);
  }
  selectedRows.value = [];
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

function resolveTestName(detail) {
  if (!detail) return '-';
  if (detail.testName) return detail.testName;
  const testId = detail.testId;
  if (!testId) return '-';
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : testStore.tests.find((t) => t.id === testId);
  return (
    test?.name ||
    test?.testCategory ||
    [test?.category, test?.code].filter(Boolean).join(' - ') ||
    test?.code ||
    testId
  );
}

async function handlePaymentSaved(detail) {
  const paymentStatus = 'payment_pending_review';
  const paymentInfo = {
    ...detail,
    status: paymentStatus,
    reviewStatus: detail.reviewStatus || 'pending',
  };
  await store.updateRequest(detail.orderId, {
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

function canPrint(row) {
  if (!row) return false;
  const printableStatuses = ['payment_verified', 'completed', 'done'];
  return printableStatuses.includes(row.status);
}

function openPreviewModal(row) {
  previewRequest.value = row || null;
  showPreviewModal.value = Boolean(row);
}

function closePreviewModal() {
  showPreviewModal.value = false;
  previewRequest.value = null;
}

function printFromPreview(type) {
  if (!previewRequest.value) return;
  printDocument(previewRequest.value, type);
}

function printDocument(row, type = 'request') {
  if (!row) return;
  const title = type === 'invoice' ? 'Invoice Pembayaran' : 'Permintaan Pengujian';
  const html = buildPermintaanPrintHtml(row, type, {
    logoSrc: logoDinas,
    title,
  });
  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) {
    alert('Tidak dapat membuka jendela cetak. Izinkan pop-up pada browser Anda.');
    return;
  }
  try {
    printWindow.document.open('text/html', 'replace');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        console.warn('Gagal memicu dialog print', err);
      }
    };
    if ('onload' in printWindow) {
      printWindow.onload = () => {
        triggerPrint();
      };
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
    alert('Terjadi kesalahan saat menyiapkan dokumen cetak.');
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
