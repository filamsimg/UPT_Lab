<template>
  <!-- Form permintaan pengujian: data pemohon, paket kerja, daftar uji -->
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Form Permintaan</p>
        <h1 class="text-xl font-semibold text-slate-900 md:text-2xl">
          {{ isEdit ? 'Ubah Permintaan' : 'Permintaan Baru' }}
        </h1>
        <p class="text-sm text-slate-500">
          Isi data permintaan dan rincian pengujian. Simpan sebagai draft atau kirim untuk diteruskan ke kaji ulang.
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
        <div v-if="showOwnerField" class="grid gap-3 sm:grid-cols-1">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Owner (Customer)
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.ownerDisplay"
                :list="ownerDataListId"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                placeholder="Cari nama customer..."
                :readonly="isReadOnlyMode"
                :disabled="isReadOnlyMode"
                @input="handleOwnerInput"
                @change="handleOwnerSelection"
                @blur="handleOwnerBlur"
              />
              <button
                v-if="!isReadOnlyMode && (form.ownerDisplay || form.ownerUserId)"
                type="button"
                class="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                @click="clearOwner"
              >
                Hapus
              </button>
            </div>
            <datalist :id="ownerDataListId">
              <option
                v-for="opt in ownerOptions"
                :key="opt.value"
                :value="opt.label"
              />
            </datalist>
            <p class="text-[11px] text-slate-500">
              Pilih owner agar order dapat diakses customer. Kosongkan jika owner mengikuti akun pembuat.
            </p>
            <p v-if="ownerLoading" class="text-[11px] font-medium text-slate-500">
              Mencari user...
            </p>
            <p v-if="ownerError" class="text-[11px] font-medium text-rose-600">
              {{ ownerError }}
            </p>
            <p
              v-if="!ownerSelectionValid && !isReadOnlyMode"
              class="text-[11px] font-medium text-rose-600"
            >
              Pilih user dari daftar agar ID owner tersimpan.
            </p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Pemohon</label>
            <input
              v-model="form.customerName"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Nama pemohon"
              :readonly="isReadOnlyMode || (isCustomerUser && !canManageCustomerData)"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Customer</label>
            <input
              v-model="form.customerEmail"
              type="email"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Email customer"
              :readonly="isReadOnlyMode || (isCustomerUser && !canManageCustomerData)"
            />
          </div>
        </div>

        

        <div class="grid gap-3 sm:grid-cols-1">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Sertifikasi / Laporan Atas Nama</label>
            <input
              v-model="form.certificateName"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Nama yang dicantumkan pada sertifikat/laporan"
              :readonly="isReadOnlyMode"
            />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No Telepon</label>
            <input
              v-model="form.phoneNumber"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="No kontak"
              :readonly="isReadOnlyMode || (isCustomerUser && !canManageCustomerData)"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Masuk</label>
            <input
              v-model="form.entryDate"
              type="date"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              :readonly="isReadOnlyMode"
            />
            <p class="text-[11px] text-slate-500">Default hari ini (bisa diubah).</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Jenis Pekerjaan</label>
            <select
              v-model="form.workCategoryId"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              :disabled="isReadOnlyMode"
            >
              <option value="">Pilih kategori</option>
              <option
                v-for="cat in workCategoryOptions"
                :key="cat.value"
                :value="cat.value"
              >
                {{ cat.label }}
              </option>
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
            :readonly="isReadOnlyMode || Boolean(form.addressId) || (isCustomerUser && !canManageCustomerData)"
          ></textarea>
          <p v-if="form.addressId" class="text-[11px] text-emerald-600">
            Alamat berasal dari data customer.
          </p>
        </div>
      </section>

      <!-- Detail Pengujian -->
      <section class="space-y-3">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Detail Pengujian</h2>
            <p class="text-xs text-slate-500">Tambah pengujian dan sesuaikan data sampel.</p>
          </div>
          <button
            v-if="!isReadOnlyMode"
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
            @click="addTestItem"
          >
            + Tambah Pengujian
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
                  :disabled="isReadOnlyMode"
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
                  Nama Sampel
                </label>
                <input
                  v-model="item.objectName"
                  type="text"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="cth. Beton Kolom A"
                  :readonly="isReadOnlyMode"
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
                  :disabled="isReadOnlyMode"
                />
              </div>
              <div class="flex items-end justify-end">
                <button
                  v-if="!isReadOnlyMode"
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
                Line Total: Rp {{ formatCurrency(itemSubtotal(item)) }}
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
            :readonly="isReadOnlyMode"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catatan
            <span
              class="text-[11px] font-semibold normal-case tracking-normal"
              :class="isManualMode ? 'text-rose-600' : 'text-slate-400'"
            >
              ({{ isManualMode ? 'wajib jika layanan tidak ada di daftar' : 'opsional' }})
            </span>
          </label>
          <textarea
            v-model="form.note"
            rows="3"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="Jelaskan kebutuhan khusus atau layanan yang belum terdaftar."
            :readonly="isReadOnlyMode"
          ></textarea>
          <p v-if="isManualMode" class="text-[11px] font-medium text-rose-600">
            Karena layanan tidak dipilih, catatan dan dokumen pendukung diperlukan agar admin dapat menindaklanjuti.
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dokumen Pendukung
            <span
              class="text-[11px] font-semibold normal-case tracking-normal"
              :class="isManualMode ? 'text-rose-600' : 'text-slate-400'"
            >
              ({{ isManualMode ? 'wajib jika layanan tidak ada di daftar' : 'opsional' }})
            </span>
          </label>
          <div class="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3">
            <input
              type="file"
              class="w-full text-sm"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              @change="handleFileChange"
              :disabled="isReadOnlyMode"
            />
            <div v-if="form.supportingFileName" class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700">
              <span class="truncate">{{ form.supportingFileName }}</span>
              <button
                v-if="!isReadOnlyMode"
                type="button"
                class="text-rose-600 font-semibold hover:text-rose-700"
                @click="clearFile"
              >
                Hapus
              </button>
            </div>
            <p class="text-[11px] text-slate-500">
              Format: PDF/JPG/PNG/DOC. {{ isManualMode ? 'Wajib dilampirkan jika layanan tidak ada di daftar.' : 'Opsional.' }}
            </p>
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
          v-if="!isReadOnlyMode"
          type="button"
          class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          :disabled="!canSave"
          @click="handleSaveDraft"
        >
          Simpan Draft
        </button>
        <button
          v-if="!isReadOnlyMode"
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
import { useWorkCategoryStore } from '@/stores/useWorkCategoryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import api from '@/services/apiServices';
import { useAuthorization } from '@/composables/auth/useAuthorization';

// Form permintaan pengujian: mengisi data pemohon, paket kerja, dan ordered_services untuk dikirim ke BE
const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const testStore = useTestStore();
const workCategoryStore = useWorkCategoryStore();
const authStore = useAuthStore();
const { hasAnyPermission } = useAuthorization();
const currentYear = new Date().getFullYear();
const isEditMode = computed(() => props.isEdit);
const isReadOnlyMode = computed(() => Boolean(props.readOnly));

const statusLabels = {
 // Label status untuk badge
  draft: 'Draft',
  awaiting_review: 'Menunggu Kaji Ulang',
  awaiting_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Pembayaran Dikirim',
  payment_rejected: 'Bukti Pembayaran Ditolak',
  payment_approved: 'Pembayaran Disetujui',
  testing: 'Proses Pengujian',
  completed: 'Selesai',
  refunded: 'Refund',
  cancelled: 'Dibatalkan',
  rejected: 'Ditolak',
};

const testOptions = computed(() =>
 // Opsi pencarian pengujian dari store
  (testStore.tests || []).map((test) => {
      const segments = [test.name || null, test.code || null].filter(Boolean);
      const label =
        segments.length > 0
          ? segments.join(' - ')
          : test.name || test.code || 'Pengujian';
    return {
      value: test.id,
      label,
      price: Number(test.price ?? 0),
      unit: test.unit || '',
      code: test.code || '',
    };
  })
);

const workCategoryOptions = computed(() =>
  (workCategoryStore.categories || []).map((cat) => ({
    value: cat.id,
    label: cat.name || 'Kategori',
  }))
);

const authUser = computed(() => authStore.currentUser || null);
const userRoles = computed(() =>
  Array.isArray(authUser.value?.roles)
    ? authUser.value.roles
        .map((role) =>
          typeof role === 'string'
            ? role
            : role?.slug || role?.code || role?.name || ''
        )
        .filter(Boolean)
    : []
);
const isCustomerUser = computed(() =>
  userRoles.value.some(
    (role) => String(role).trim().toLowerCase() === 'customer'
  )
);
const canManageCustomerData = computed(() =>
  typeof authStore.hasAny === 'function'
    ? authStore.hasAny([
        'customers.store',
        'customers.update',
        'customers.index',
        'addresses.store',
        'addresses.update',
        'addresses.index',
      ])
    : false
);

const canLookupUsers = computed(() =>
  hasAnyPermission('users.index', 'users.show', 'user.read', 'users.read')
);

const showOwnerField = computed(() => !isCustomerUser.value && canLookupUsers.value);

const ownerOptions = ref([]);
const ownerLoading = ref(false);
const ownerError = ref('');
const ownerDataListId = `owner-search-${Math.random().toString(36).slice(2, 8)}`;

let ownerSearchTimeout = null;
let ownerSearchSequence = 0;

onMounted(() => {
  if (!testStore.tests.length && !testStore.loading) {
    testStore.fetchAll();
  }
  if (!workCategoryStore.categories.length && !workCategoryStore.loading) {
    workCategoryStore.fetchAll({ perPage: 200 });
  }
  if (isCustomerUser.value && authUser.value) {
    form.value.customerName = authUser.value.name || form.value.customerName;
    form.value.customerEmail = authUser.value.email || form.value.customerEmail;
    const phone =
      authUser.value.phone_number ||
      authUser.value.phoneNumber ||
      authUser.value.phone;
    if (phone) form.value.phoneNumber = phone;
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
    customerId: '',
    customerEmail: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    addressId: '',
    purpose: '',
    testCategory: '',
    jobCategory: '',
    workCategoryId: '',
    workPackage: '',
    certificateName: '',
    note: '',
    supportingFile: null,
    supportingFileName: '',
    testItems: [],
    ownerUserId: '',
    ownerDisplay: '',
    status: 'draft',
  };
};

const form = ref(defaultForm());

function updateOrderMetadata(entryDate) {
  const year = extractYear(entryDate);
  form.value.orderYear = year;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const inheritedYear = extractYear(val.entryDate || todayString());
      const orderUsers = Array.isArray(val.orderUsers || val.order_users)
        ? val.orderUsers || val.order_users
        : [];
      const ownerEntry = orderUsers.find(
        (item) => String(item?.type || '').trim().toLowerCase() === 'owner'
      );
      const ownerUserId =
        ownerEntry?.userId ||
        ownerEntry?.user_id ||
        ownerEntry?.user?.id ||
        val.ownerUserId ||
        val.owner_user_id ||
        '';
      const ownerLabelFromUser = ownerEntry?.user?.name
        ? `${ownerEntry.user.name}${ownerEntry.user.email ? ` — ${ownerEntry.user.email}` : ''}`
        : '';
      form.value = {
        ...defaultForm(),
        ...val,
        orderYear: val.orderYear || inheritedYear,
        orderNumber: val.orderNumber ?? null,
        workCategoryId:
          val.workCategoryId ||
          val.work_category_id ||
          val.workCategory ||
          val.work_category ||
          '',
        testItems: (val.testItems || []).map((item) => ({
          testId: item.testId || '',
          selectedLabel: item.testName || resolveTestName(item.testId) || '',
          quantity: item.quantity ?? 1,
          objectName:
            item.objectName ||
            item.sampleName ||
            item.sample_name ||
            item.testName ||
            '',
          price:
            item.price !== undefined && item.price !== null
              ? String(item.price)
              : '',
          unit: item.unit || resolveTestUnit(item.testId) || '',
          testCode: item.testCode || resolveTestCode(item.testId) || '',
          manualPrice: Boolean(item.manualPrice),
        })),
        certificateName: val.certificateName || val.certificate_name || '',
        customerId: val.customerId || val.customer_id || '',
        customerEmail: val.customerEmail || val.customer_email || val.email || '',
        addressId: val.addressId || val.address_id || '',
        note: val.note || '',
        supportingFile: val.supportingFile || null,
        supportingFileName: val.supportingFileName || val.supporting_file_name || '',
        ownerUserId: ownerUserId || '',
        ownerDisplay: val.ownerDisplay || ownerLabelFromUser || '',
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
    if (!test) return testId || 'Pengujian';
    return (
      test.name ||
      test.code ||
      test.id ||
      testId ||
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
    updateOrderMetadata(newDate || todayString());
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
      const sampleName =
        (item.objectName && item.objectName.trim()) ||
        item.sample_name ||
        item.sampleName ||
        testName;
      return {
        testId: item.testId,
        testName,
        testCode,
        objectName: sampleName,
        price,
        quantity,
        unit: item.unit || resolveTestUnit(item.testId) || '',
      };
    })
);

const isManualMode = computed(() => normalizedTestItems.value.length === 0);

const ownerSelectionValid = computed(() => {
  if (!showOwnerField.value) return true;
  const display = (form.value.ownerDisplay || '').trim();
  if (!display) return true;
  return Boolean(form.value.ownerUserId);
});

const canSave = computed(() => {
 // Validasi minimal data pemohon
  const hasCustomer = Boolean(form.value.customerName && form.value.customerName.trim());
  const hasWorkCategory = Boolean(form.value.workCategoryId && String(form.value.workCategoryId).trim());
  const hasApplicantEmail = Boolean(form.value.customerEmail && form.value.customerEmail.trim());
  const hasApplicantPhone = Boolean(form.value.phoneNumber && String(form.value.phoneNumber).trim());
  const hasApplicantAddress = Boolean(form.value.address && form.value.address.trim());
  const hasServices = normalizedTestItems.value.length > 0;
  const hasManualNote = Boolean(form.value.note && form.value.note.trim());
  const hasSupportingFile = Boolean(form.value.supportingFile);

  if (!ownerSelectionValid.value) return false;

  if (!hasCustomer || !hasWorkCategory || !hasApplicantEmail || !hasApplicantPhone || !hasApplicantAddress) {
    return false;
  }

  return hasServices || (hasManualNote && hasSupportingFile);
});

function itemSubtotal(item) {
  const lineTotal =
    item.lineTotal ??
    item.line_total ??
    (Math.max(0, Number(item.price) || 0) *
      Math.max(1, Number(item.quantity) || 1));
  return Math.max(0, Number(lineTotal) || 0);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function buildPayload() {
 // Bentuk payload untuk BE (ordered_services, applicant info)
  const testItems = normalizedTestItems.value;
  const summary = testItems.length
    ? testItems.map((item) => `${item.testName} (${item.quantity})`).join(', ')
    : form.value.testCategory || form.value.purpose || '';

  const {
    idOrder,
    orderNumber,
    orderYear,
    entryDate,
    customerId,
    customerName,
    customerEmail,
    phoneNumber,
    addressId,
    address,
    workCategoryId,
    workPackage,
    status,
    certificateName,
    note,
    supportingFile,
    supportingFileName,
    ownerUserId,
  } = form.value;

  const entryDateSafe = form.value.entryDate || todayString();

  return {
    idOrder,
    orderNumber: orderNumber ? Number(orderNumber) : null,
    orderYear: orderYear || extractYear(entryDateSafe),
    entryDate: entryDate || entryDateSafe,
    customerId,
    customerName,
    customerEmail,
    phoneNumber,
    addressId,
    address,
    workCategoryId,
    workPackage,
    certificateName,
    note,
    supportingFile,
    supportingFileName,
    ownerUserId,
    status: status || 'draft',
    purpose: summary,
    testCategory: summary,
    testItems,
  };
}

async function submitWith() {
  if (!canSave.value) return;
  return submitWithStatus('awaiting_review');
}

function handleSubmit() {
  submitWith();
}

async function submitWithStatus(status) {
  const nextStatus = typeof status === 'string' && status.trim() ? status.trim() : 'draft';
  const confirmed = await openConfirm({
    title: nextStatus === 'draft'
      ? 'Simpan sebagai draft?'
      : isEditMode.value
      ? 'Simpan perubahan permintaan?'
      : 'Kirim permintaan?',
    message:
      nextStatus === 'draft'
        ? 'Draft akan tersimpan dan bisa dikirim belakangan.'
        : 'Pastikan informasi permintaan sudah lengkap sebelum dikirim ke kaji ulang.',
    confirmLabel: nextStatus === 'draft' ? 'Simpan Draft' : 'Kirim',
  });
  if (!confirmed) return;

  const payload = buildPayload();
  payload.status = nextStatus;
  emit('submit', { action: nextStatus === 'draft' ? 'draft' : 'submit', data: payload });
}

function handleSaveDraft() {
 // Emit draft tanpa memaksa validasi lanjut
  submitWithStatus('draft');
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

function normalizeUserRoleName(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function isCustomerCandidate(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role) => {
    const raw =
      typeof role === 'string'
        ? role
        : role?.slug || role?.code || role?.name || '';
    return normalizeUserRoleName(String(raw)) === 'customer';
  });
}

function buildOwnerLabel(user) {
  const name = String(user?.name || '').trim();
  const email = String(user?.email || '').trim();
  if (name && email) return `${name} — ${email}`;
  return name || email || String(user?.id || '').trim();
}

async function searchOwners(keyword) {
  const query = String(keyword || '').trim();
  if (!query || query.length < 2) {
    ownerOptions.value = [];
    ownerError.value = '';
    ownerLoading.value = false;
    return;
  }

  ownerLoading.value = true;
  ownerError.value = '';
  const currentSeq = ++ownerSearchSequence;

  try {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('per_page', '10');
    params.set('search', query);
    params.append('include', 'roles');

    const res = await api.get(`/api/v1/users?${params.toString()}`);
    if (currentSeq !== ownerSearchSequence) return;

    const payload = res.data?.data ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const mapped = items.map((user) => ({
      value: user.id,
      label: buildOwnerLabel(user),
      raw: user,
      isCustomer: isCustomerCandidate(user),
    }));
    const customers = mapped.filter((item) => item.isCustomer);
    ownerOptions.value = customers.length ? customers : mapped;
  } catch (err) {
    if (currentSeq !== ownerSearchSequence) return;
    ownerOptions.value = [];
    ownerError.value =
      err?.response?.data?.message ||
      err?.message ||
      'Gagal mencari user.';
  } finally {
    if (currentSeq === ownerSearchSequence) {
      ownerLoading.value = false;
    }
  }
}

function scheduleOwnerSearch(keyword) {
  if (ownerSearchTimeout) {
    clearTimeout(ownerSearchTimeout);
    ownerSearchTimeout = null;
  }
  ownerSearchTimeout = setTimeout(() => {
    searchOwners(keyword);
  }, 350);
}

function clearOwner() {
  form.value.ownerUserId = '';
  form.value.ownerDisplay = '';
  ownerOptions.value = [];
  ownerError.value = '';
}

function handleOwnerInput() {
  if (!showOwnerField.value || isReadOnlyMode.value) return;
  ownerError.value = '';
  const query = String(form.value.ownerDisplay || '').trim();
  if (!query) {
    form.value.ownerUserId = '';
    ownerOptions.value = [];
    return;
  }
  form.value.ownerUserId = '';
  scheduleOwnerSearch(query);
}

function handleOwnerSelection() {
  if (!showOwnerField.value) return;
  const label = String(form.value.ownerDisplay || '').trim();
  if (!label) {
    form.value.ownerUserId = '';
    ownerError.value = '';
    return;
  }

  const found = ownerOptions.value.find(
    (opt) => String(opt.label).trim().toLowerCase() === label.toLowerCase()
  );
  if (found?.value) {
    form.value.ownerUserId = found.value;
    form.value.ownerDisplay = found.label;
    ownerError.value = '';
    return;
  }

  // Fallback: izinkan tempel ID langsung (ULID).
  if (/^[0-9A-HJKMNP-TV-Z]{20,}$/i.test(label)) {
    form.value.ownerUserId = label;
    ownerError.value = '';
    return;
  }

  form.value.ownerUserId = '';
}

function handleOwnerBlur() {
  if (!showOwnerField.value) return;
  handleOwnerSelection();
}
</script>
