<template>
  <!-- Form pembayaran: input total, bukti transfer, status review -->
  <div
    class="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    @click.self="handleClose"
  >
    <div class="relative flex h-full w-full max-h-full flex-col bg-white shadow-2xl sm:h-auto sm:w-[95vw] sm:max-w-4xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden">
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500">Invoice Pembayaran</p>
          <h3 class="text-lg font-semibold text-surfaceDark">
            Permintaan {{ formattedOrderId }}
          </h3>
        </div>
        <button
          class="text-gray-500 hover:text-gray-700 transition"
          @click="handleClose"
        >
          <span class="sr-only">Tutup</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 pb-28 space-y-6 sm:px-6 sm:py-6 sm:pb-10">
        <div class="grid gap-6 md:grid-cols-[2fr_1fr]">
          <section class="space-y-4">
            <div class="hidden rounded-xl border border-gray-200 overflow-hidden md:block">
              <table class="min-w-full text-sm">
                <thead class="bg-muted text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th class="px-3 py-2 text-center">No</th>
                    <th class="px-3 py-2 text-left">Nama Pengujian</th>
                    <th class="px-3 py-2 text-left">Nama Sampel</th>
                    <th class="px-3 py-2 text-right">Biaya Satuan</th>
                    <th class="px-3 py-2 text-right">Jumlah</th>
                    <th class="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in testRows"
                    :key="`payment-row-${index}`"
                    class="odd:bg-white even:bg-gray-50"
                  >
                    <td class="px-3 py-2 text-center">{{ index + 1 }}</td>
                    <td class="px-3 py-2 font-medium text-gray-700">
                      {{ row.testName || '-' }}
                    </td>
                    <td class="px-3 py-2 text-gray-600">
                      {{ row.objectName || '-' }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700">
                      Rp {{ formatCurrency(row.price) }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700">
                      {{ row.quantity }}
                    </td>
                    <td class="px-3 py-2 text-right font-semibold text-surfaceDark">
                      Rp {{ formatCurrency(rowSubtotal(row)) }}
                    </td>
                  </tr>
                  <tr v-if="!testRows.length">
                    <td colspan="6" class="px-3 py-4 text-center text-sm text-gray-500">
                      Belum ada data pengujian untuk permintaan ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="space-y-3 md:hidden">
              <article
                v-for="(row, index) in testRows"
                :key="`payment-card-${index}`"
                class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div class="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                  <span>Pengujian {{ index + 1 }}</span>
                  <span class="font-semibold text-surfaceDark">Rp {{ formatCurrency(rowSubtotal(row)) }}</span>
                </div>
                <div class="mt-2 space-y-1">
                  <p class="text-sm font-semibold text-surfaceDark">
                    {{ row.testName || '-' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ row.objectName || '-' }}
                  </p>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div class="flex flex-col rounded-lg bg-gray-50 p-2">
                    <span class="text-[11px] uppercase text-gray-500">Biaya</span>
                    <span class="text-sm font-semibold text-surfaceDark">Rp {{ formatCurrency(row.price) }}</span>
                  </div>
                  <div class="flex flex-col rounded-lg bg-gray-50 p-2 text-right">
                    <span class="text-[11px] uppercase text-gray-500">Jumlah</span>
                    <span class="text-sm font-semibold text-surfaceDark">{{ row.quantity }}</span>
                  </div>
                </div>
              </article>
              <div
                v-if="!testRows.length"
                class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500"
              >
                Belum ada data pengujian untuk permintaan ini.
              </div>
            </div>

            <div class="flex flex-col gap-2 text-sm text-gray-600 sm:items-end">
              <div class="flex flex-col gap-2 rounded-xl bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:bg-transparent sm:p-0">
                <span>Total Pengujian</span>
                <span class="font-semibold text-surfaceDark">
                  Rp {{ formatCurrency(grandTotal) }}
                </span>
              </div>
            </div>
          </section>

          <aside class="space-y-4">
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 text-sm text-gray-600">
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span class="text-gray-500">Customer</span>
                <span class="font-semibold text-surfaceDark">
                  {{ customerNameDisplay || '-' }}
                </span>
              </div>
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span class="text-gray-500">Tanggal Permintaan</span>
                <span class="font-medium">{{ formattedEntryDate }}</span>
              </div>
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span class="text-gray-500">Batas Pembayaran</span>
                <span class="font-semibold text-danger">
                  {{ paymentDeadline.label }}
                </span>
              </div>
            </div>

            <div class="rounded-xl border border-gray-200 p-4 space-y-3 text-sm text-gray-600">
              <h4 class="text-sm font-semibold text-surfaceDark">Instruksi Pembayaran</h4>
              <div
                v-for="(account, idx) in bankAccounts"
                :key="`bank-${idx}`"
                class="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1"
              >
                <p class="text-xs text-gray-500 uppercase tracking-wide">{{ account.bank }}</p>
                <p class="text-base font-semibold text-surfaceDark">{{ account.number }}</p>
                <p class="text-xs text-gray-500">a.n {{ account.name }}</p>
              </div>
              <div class="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-primaryDark">
                Scan QRIS pada aplikasi perbankan Anda untuk pembayaran cepat.
              </div>
            </div>

            <div class="rounded-xl bg-white border border-gray-200 p-4 space-y-3 text-sm text-gray-600">
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Total Tagihan</span>
                <span class="font-semibold text-surfaceDark">
                  Rp {{ formatCurrency(grandTotal) }}
                </span>
              </div>
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span>Sisa Pembayaran</span>
                <span class="font-semibold" :class="outstanding > 0 ? 'text-danger' : 'text-emerald-600'">
                  Rp {{ formatCurrency(outstanding) }}
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div class="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div>
            <h4 class="text-sm font-semibold text-surfaceDark mb-2">Upload Bukti Pembayaran</h4>
            <p class="text-xs text-gray-500 mb-3">
              Unggah bukti transfer dalam format PDF, PNG, atau JPG (maksimal 5MB).
            </p>
            <FileUpload v-model="transferFiles" />
          </div>
          <div class="rounded-xl border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
            <h4 class="text-sm font-semibold text-surfaceDark">Catatan</h4>
            <p>
              Setelah bukti pembayaran dikirim, tim admin akan melakukan verifikasi maksimal dalam 1x24 jam
              sebelum permintaan diproses lebih lanjut.
            </p>
            <p>
              Bila pembayaran melewati batas waktu, permintaan dapat dibatalkan secara otomatis oleh sistem.
            </p>
          </div>
        </div>

      </div>
      <div class="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 sm:w-auto"
            @click="handleClose"
          >
            Tutup
          </button>
          <button
            class="w-full rounded-md bg-primary text-white px-4 py-2 text-sm font-semibold transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="!canConfirmPayment"
            @click="savePayment"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import FileUpload from '@/components/common/FileUpload.vue';
  import { useConfirmDialog } from '@/stores/useConfirmDialog';
  
  // Form pembayaran: normalisasi bukti transfer, hitung outstanding, dan emit payload
  const props = defineProps({
  tests: { type: Array, default: () => [] },
  orderId: { type: String, default: '' },
  initialRows: { type: Array, default: () => [] },
  customerName: { type: String, default: '' },
  entryDate: { type: String, default: '' },
});

const emit = defineEmits(['close', 'payment-saved']);
const openConfirm = useConfirmDialog();

const testRows = ref([]);
 // Daftar item pengujian yang ditagihkan
const transferFiles = ref([]);
 // File bukti transfer yang diupload
const amountPaid = ref(0);

const bankAccounts = [
  { bank: 'Bank Jateng', number: '1234 5678 90', name: 'UPT Lab Tegal' },
  { bank: 'BRI', number: '0099 8877 6655', name: 'UPT Lab Tegal' },
];

const formattedOrderId = computed(() => props.orderId || '-');
  // Tampilkan orderNo/number fallback

const formattedEntryDate = computed(() => formatDate(props.entryDate));
  // Tanggal permintaan yang diformat

const paymentDeadline = computed(() => {
  // Hitung tenggat tampil (label + isOverdue)
  const base = props.entryDate ? new Date(props.entryDate) : new Date();
  const deadline = new Date(base.getTime());
  deadline.setDate(deadline.getDate() + 2);
  return {
    label: formatDate(deadline.toISOString()),
    iso: deadline.toISOString(),
  };
});

watch(
  () => props.initialRows,
  (rows) => {
    applyInitialRows(Array.isArray(rows) ? rows : []);
  },
  { immediate: true, deep: true },
);

function applyInitialRows(rows = []) {
  const prepared = rows.map((row) => normalizeRow(row));
  testRows.value = prepared;
  transferFiles.value = [];
  amountPaid.value = prepared.reduce((sum, row) => sum + rowSubtotal(row), 0);
}

function normalizeRow(row = {}) {
  const test = findTest(row.testId);
  const quantity = Math.max(1, Number(row.quantity) || 1);
  const price = Math.max(0, Number(row.price ?? test?.price ?? 0));
  const lineTotal = Number(
    row.lineTotal ??
      row.line_total ??
      price * quantity
  ) || 0;
  const testName =
    row.testName ||
    test?.name ||
    test?.code ||
    'Pengujian';
  return {
    testId: row.testId || test?.id || null,
    testName,
    objectName: row.objectName || row.testName || test?.name || test?.code || '',
    price,
    quantity,
    lineTotal,
  };
}

function findTest(id) {
  if (!id) return null;
  return props.tests?.find((test) => test.id === id) || null;
}

function rowSubtotal(row) {
  const direct =
    row.lineTotal ??
    row.line_total ??
    Math.max(0, Number(row.price) || 0) * Math.max(1, Number(row.quantity) || 1);
  return Math.max(0, Number(direct) || 0);
}

function serializeTransferFiles() {
  return transferFiles.value.map((file, idx) => {
    if (!file) return null;
    // Keep already-serialized entries as-is
    if (typeof file === 'object' && !('lastModified' in file) && file.previewUrl) {
      return { ...file };
    }
    if (file instanceof File) {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: `${file.name || 'file'}-${file.size || 0}-${file.lastModified || Date.now()}-${idx}`,
        name: file.name || `Lampiran-${idx + 1}`,
        size: file.size || 0,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified || Date.now(),
        previewUrl,
      };
    }
    return {
      ...file,
      previewUrl: file.previewUrl || '',
    };
  }).filter(Boolean);
}

const grandTotal = computed(() =>
  testRows.value.reduce((sum, row) => sum + rowSubtotal(row), 0),
);

const outstanding = computed(() =>
  // Outstanding dihitung dari total - paid, tidak negatif
  Math.max(0, grandTotal.value - Math.max(0, Number(amountPaid.value) || 0)),
);

const customerNameDisplay = computed(() => props.customerName);
  // Nama customer fallback dari modelValue

const canConfirmPayment = computed(() => {
  return amountPaid.value > 0 && transferFiles.value.length > 0;
});

function normalizeAmount() {
  amountPaid.value = Math.max(0, Number(amountPaid.value) || 0);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function savePayment() {
  normalizeAmount();
  const confirmed = await openConfirm({
    title: 'Konfirmasi pembayaran?',
    message: 'Status permintaan akan diperbarui menjadi bukti pembayaran dikirim.',
    confirmLabel: 'Simpan Pembayaran',
  });
  if (!confirmed) return;
  const detail = {
    orderId: props.orderId,
    status: 'payment_submitted',
    total: grandTotal.value,
    amountPaid: amountPaid.value,
    outstanding: outstanding.value,
    paymentDeadline: paymentDeadline.value.iso,
    paymentDate: new Date().toISOString(),
    testRows: testRows.value.map((row) => ({ ...row })),
    transferFiles: serializeTransferFiles(),
    transferFilesRaw: transferFiles.value,
    reviewStatus: 'pending',
  };
  emit('payment-saved', detail);
  handleClose();
}

function handleClose() {
  // Emit close setelah mengosongkan state upload
  emit('close');
}
</script>
