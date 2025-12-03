<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Form Permintaan</p>
        <h1 class="text-xl font-semibold text-slate-900 md:text-2xl">
          {{ isEdit ? 'Ubah Permintaan' : 'Permintaan Baru' }}
        </h1>
        <p class="text-sm text-slate-500">
          Isi data permintaan dan rincian pengujian. Simpan untuk meneruskan ke kaji ulang.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:w-auto"
          @click="$emit('cancel')"
        >
          Tutup
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 px-4 py-5 md:px-6 lg:px-8">
      <!-- Informasi utama -->
      <section class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">ID Order</label>
            <input
              v-model="form.idOrder"
              type="text"
              readonly
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Akan diisi otomatis setelah permintaan disimpan"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No. Order</label>
            <input
              :value="orderNumberDisplay"
              type="text"
              readonly
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Otomatis setelah simpan"
            />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Customer</label>
            <input
              v-model="form.customerName"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Nama pemohon"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Sertifikasi / Laporan Atas Nama</label>
            <input
              v-model="form.certificateName"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Nama yang dicantumkan pada sertifikat/laporan"
            />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No Telepon</label>
            <input
              v-model="form.phoneNumber"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="No kontak"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Jenis Pekerjaan</label>
            <select
              v-model="form.jobCategory"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option disabled value="">Pilih kategori</option>
              <option>Pendidikan</option>
              <option>IKM</option>
              <option>Industri</option>
              <option>Lainnya</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Alamat</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="Alamat lengkap"
          ></textarea>
        </div>
      </section>

      <!-- Detail Pengujian -->
      <section class="space-y-3">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Detail Pengujian</h2>
            <p class="text-xs text-slate-500">Tambah jenis uji dan sesuaikan data sampel.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
            @click="addTestItem"
          >
            + Tambah Jenis Pengujian
          </button>
        </div>

        <div v-if="testOptions.length" class="space-y-4">
          <div v-if="!form.testItems.length" class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
            Belum ada pengujian yang dipilih.
          </div>

          <div
            v-for="(item, index) in form.testItems"
            :key="`test-${index}`"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
          >
            <div class="grid gap-3 md:grid-cols-[5fr_3fr_2fr_2fr_2fr_auto] md:items-end">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cari Pengujian
                </label>
                <input
                  :list="`test-search-${index}`"
                  v-model="item.selectedLabel"
                  @change="handleTestSelection(index)"
                  @blur="handleTestBlur(index)"
                  type="text"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Ketik minimal 3 huruf untuk mencari pengujian..."
                />
                <datalist :id="`test-search-${index}`">
                  <option
                    v-for="opt in testOptions"
                    :key="opt.value"
                    :value="opt.label"
                  />
                </datalist>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nama Objek Uji
                </label>
                <input
                  v-model="item.objectName"
                  type="text"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="cth. Beton Kolom A"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tarif (Rp)
                </label>
                <input
                  v-model="item.price"
                  type="text"
                  readonly
                  class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-right text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="0"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Satuan
                </label>
                <input
                  v-model="item.unit"
                  type="text"
                  readonly
                  class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="-"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jumlah Sampel
                </label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-right text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="1"
                />
              </div>
              <div class="flex items-end justify-end">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  @click="removeTestItem(index)"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between border-t border-dashed pt-3 text-xs text-slate-600">
              <span class="text-slate-500">
                Pilih pengujian dari daftar agar tarif terisi otomatis.
              </span>
              <span class="font-semibold text-slate-800">
                Subtotal: Rp {{ formatCurrency(itemSubtotal(item)) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Data pengujian belum tersedia. Tambah pengujian di halaman layanan terlebih dahulu.
        </div>
      </section>

      <!-- Informasi tambahan -->
      <section class="space-y-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Paket Pekerjaan</label>
          <input
            v-model="form.workPackage"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="cth. Proyek pembangunan gedung"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan (jika layanan tidak ada di daftar)</label>
          <textarea
            v-model="form.note"
            rows="3"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="Jelaskan kebutuhan khusus atau layanan yang belum terdaftar."
          ></textarea>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Dokumen Pendukung (opsional)</label>
          <div class="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3">
            <input
              type="file"
              class="w-full text-sm"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              @change="handleFileChange"
            />
            <div v-if="form.supportingFileName" class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700">
              <span class="truncate">{{ form.supportingFileName }}</span>
              <button
                type="button"
                class="text-rose-600 font-semibold hover:text-rose-700"
                @click="clearFile"
              >
                Hapus
              </button>
            </div>
            <p class="text-[11px] text-slate-500">Format: PDF/JPG/PNG/DOC, opsional untuk memperjelas permintaan.</p>
          </div>
        </div>
      </section>

      <!-- Aksi -->
      <div class="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <button
          type="button"
          class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
          @click="$emit('cancel')"
        >
          Batal
        </button>
        <button
          type="submit"
          class="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          :disabled="!canSave"
        >
          {{ isEdit ? 'Simpan Perubahan' : 'Kirim Permintaan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useTestStore } from '@/stores/useTestStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const testStore = useTestStore();
const currentYear = new Date().getFullYear();
const isEditMode = computed(() => props.isEdit);

const statusLabels = {
  draft: 'Draft',
  awaiting_kaji_ulang: 'Menunggu Kaji Ulang',
  pending_payment: 'Menunggu Pembayaran',
  payment_pending_review: 'Menunggu Review Pembayaran',
  payment_verified: 'Pembayaran Terverifikasi',
  payment_review_rejected: 'Bukti Pembayaran Ditolak',
  cancelled: 'Dibatalkan',
};

const testOptions = computed(() =>
  (testStore.tests || []).map((test) => {
    const segments = [
      test.name || test.testCategory || null,
      test.code || null,
    ].filter(Boolean);
    const label =
      segments.length > 0
        ? segments.join(' - ')
        : test.name || test.testCategory || 'Pengujian';
    return {
      value: test.id,
      label,
      price: Number(test.price ?? 0),
      unit: test.unit || '',
      code: test.code || '',
    };
  })
);

onMounted(() => {
  if (!testStore.tests.length && !testStore.loading) {
    testStore.fetchAll();
  }
});

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function extractYear(dateStr) {
  if (!dateStr) return String(currentYear);
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getFullYear());
  }
  const match = /^(\d{4})/.exec(dateStr);
  return match ? match[1] : String(currentYear);
}

function translateStatus(value) {
  return statusLabels[value] || value || '-';
}

const defaultForm = () => {
  const entryDate = todayString();
  const orderYear = extractYear(entryDate);
  return {
    idOrder: '',
    orderNumber: null,
    orderYear,
    entryDate,
    customerName: '',
    phoneNumber: '',
    address: '',
    purpose: '',
    testCategory: '',
    jobCategory: '',
    workPackage: '',
    certificateName: '',
    note: '',
    supportingFile: null,
    supportingFileName: '',
    testItems: [],
    status: 'draft',
  };
};

const form = ref(defaultForm());

const orderNumberDisplay = computed(() => {
  const number = form.value.orderNumber;
  if (number === null || number === undefined || number === '') {
    return '';
  }
  return String(number);
});

function updateOrderMetadata(entryDate) {
  const year = extractYear(entryDate);
  form.value.orderYear = year;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const inheritedYear = extractYear(val.entryDate || todayString());
      form.value = {
        ...defaultForm(),
        ...val,
        orderYear: val.orderYear || inheritedYear,
        orderNumber: val.orderNumber ?? null,
        testItems: (val.testItems || []).map((item) => ({
          testId: item.testId || '',
          selectedLabel: item.testName || resolveTestName(item.testId) || '',
          quantity: item.quantity ?? 1,
          objectName: item.objectName || '',
          price:
            item.price !== undefined && item.price !== null
              ? String(item.price)
              : '',
          unit: item.unit || resolveTestUnit(item.testId) || '',
          testCode: item.testCode || resolveTestCode(item.testId) || '',
          manualPrice: Boolean(item.manualPrice),
        })),
        certificateName: val.certificateName || val.certificate_name || '',
        note: val.note || '',
        supportingFile: val.supportingFile || null,
        supportingFileName: val.supportingFileName || val.supporting_file_name || '',
      };
    } else {
      form.value = defaultForm();
    }
    updateOrderMetadata(form.value.entryDate);
  },
  { immediate: true }
);

watch(
  () => testOptions.value.length,
  (len) => {
    if (len && !isEditMode.value && form.value.testItems.length === 0) {
      addTestItem();
    }
  },
  { immediate: true }
);

function addTestItem() {
  form.value.testItems.push({
    testId: '',
    selectedLabel: '',
    quantity: 1,
    objectName: '',
    price: '',
    unit: '',
    testCode: '',
    manualPrice: false,
  });
}

function removeTestItem(index) {
  form.value.testItems.splice(index, 1);
}

function resolveTestName(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  if (!test) return 'Pengujian';
  return (
    test.name ||
    test.testCategory ||
    [test.category, test.code].filter(Boolean).join(' - ') ||
    test.code ||
    'Pengujian'
  );
}

function resolveTestUnit(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  return test?.unit || '';
}

function resolveTestCode(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  return test?.code || '';
}

function handleTestSelection(index) {
  const item = form.value.testItems[index];
  if (!item) return;
  const label = (item.selectedLabel || '').trim();
  const option = testOptions.value.find(
    (opt) => opt.label.toLowerCase() === label.toLowerCase()
  );
  if (!option) {
    item.testId = '';
    item.price = '';
    item.unit = '';
    item.manualPrice = false;
    return;
  }
  item.price = '';
  item.unit = '';
  item.manualPrice = false;
  applyOptionToItem(item, option);
}

function handleTestBlur(index) {
  const item = form.value.testItems[index];
  if (!item) return;
  if (!item.testId) {
    handleTestSelection(index);
  }
}

function applyOptionToItem(item, option) {
  item.testId = option.value;
  item.selectedLabel = option.label;
  if (
    !item.manualPrice &&
    option.price !== undefined &&
    option.price !== null
  ) {
    item.price = String(option.price);
  }
  item.unit = option.unit || resolveTestUnit(option.value) || '';
  item.testCode = option.code || resolveTestCode(option.value) || '';
}

watch(
  testOptions,
  () => {
    form.value.testItems.forEach((item) => {
      if (!item.testId) return;
      const option = testOptions.value.find((opt) => opt.value === item.testId);
      if (option) applyOptionToItem(item, option);
      else if (!item.unit) item.unit = resolveTestUnit(item.testId) || '';
    });
  },
  { deep: true }
);

watch(
  () => form.value.testItems,
  (items) => {
    items.forEach((item) => {
      item.quantity = Math.max(1, Number(item.quantity) || 1);
      if (item.testId && !item.selectedLabel) {
        item.selectedLabel = resolveTestName(item.testId);
      }
      if (item.testId && !item.testCode) {
        item.testCode = resolveTestCode(item.testId);
      }
    });
  },
  { deep: true }
);

watch(
  () => form.value.entryDate,
  (newDate) => {
    if (!newDate) return;
    updateOrderMetadata(newDate);
  }
);

const normalizedTestItems = computed(() =>
  form.value.testItems
    .filter((item) => item.testId)
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price) || 0);
      const testName = resolveTestName(item.testId);
      const testCode = item.testCode || resolveTestCode(item.testId) || '';
      return {
        testId: item.testId,
        testName,
        testCode,
        objectName: item.objectName?.trim() || testName,
        price,
        quantity,
        unit: item.unit || resolveTestUnit(item.testId) || '',
      };
    })
);

const canSave = computed(() => {
  const hasCustomer = Boolean(
    form.value.customerName && form.value.customerName.trim()
  );
  return hasCustomer && normalizedTestItems.value.length > 0;
});

function itemSubtotal(item) {
  return (
    Math.max(0, Number(item.price) || 0) *
    Math.max(1, Number(item.quantity) || 1)
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function buildPayload() {
  const testItems = normalizedTestItems.value;
  const summary = testItems.length
    ? testItems.map((item) => `${item.testName} (${item.quantity})`).join(', ')
    : form.value.testCategory || form.value.purpose || '';

  const {
    idOrder,
    orderNumber,
    orderYear,
    entryDate,
    customerName,
    phoneNumber,
    address,
    jobCategory,
    workPackage,
    status,
    certificateName,
    note,
    supportingFile,
    supportingFileName,
  } = form.value;

  return {
    idOrder,
    orderNumber: orderNumber ? Number(orderNumber) : null,
    orderYear: orderYear || extractYear(entryDate),
    entryDate,
    customerName,
    phoneNumber,
    address,
    jobCategory,
    workPackage,
    certificateName,
    note,
    supportingFile,
    supportingFileName,
    status: status || 'draft',
    purpose: summary,
    testCategory: summary,
    testItems,
  };
}

async function submitWith() {
  if (!canSave.value) return;
  const confirmed = await openConfirm({
    title: isEditMode.value
      ? 'Simpan perubahan permintaan?'
      : 'Simpan permintaan baru?',
    message: 'Pastikan informasi permintaan sudah lengkap sebelum melanjutkan.',
    confirmLabel: 'Simpan',
  });
  if (!confirmed) return;
  const payload = buildPayload();
  if (!isEditMode.value || payload.status === 'draft') {
    payload.status = 'awaiting_kaji_ulang';
  }
  emit('submit', { action: 'save', data: payload });
}

function handleSubmit() {
  submitWith();
}

function handleFileChange(event) {
  const file = event?.target?.files?.[0] || null;
  if (file) {
    form.value.supportingFile = file;
    form.value.supportingFileName = file.name;
  } else {
    clearFile();
  }
}

function clearFile() {
  form.value.supportingFile = null;
  form.value.supportingFileName = '';
}
</script>
