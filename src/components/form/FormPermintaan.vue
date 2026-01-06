<template>
  <!-- Form permintaan pengujian: data pemohon, paket kerja, daftar uji -->
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div
      class="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6"
    >
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
        >
          Form Permintaan
        </p>
        <h1 class="text-xl font-semibold text-slate-900 md:text-2xl">
          {{ isEdit ? 'Ubah Permintaan' : 'Permintaan Baru' }}
        </h1>
        <p class="text-sm text-slate-500">
          Isi data permintaan dan rincian pengujian. Simpan sebagai draft atau
          kirim untuk diteruskan ke kaji ulang.
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

    <form
      @submit.prevent="handleSubmit"
      class="space-y-6 px-4 py-5 md:px-6 lg:px-8"
    >
      <!-- Informasi utama -->
      <section
        class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
      >
        <div v-if="showOwnerField" class="grid gap-3 sm:grid-cols-1">
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Owner (Customer)
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.ownerDisplay"
                :list="ownerDataListId"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                placeholder="Cari nama user..."
                :readonly="isReadOnlyMode"
                :disabled="isReadOnlyMode"
                @input="handleOwnerInput"
                @change="handleOwnerSelection"
                @blur="handleOwnerBlur"
              />
              <button
                v-if="
                  !isReadOnlyMode &&
                  (form.ownerDisplay || form.ownerSelections.length)
                "
                type="button"
                class="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                @click="clearOwner"
              >
                Bersihkan
              </button>
            </div>
            <datalist :id="ownerDataListId">
              <option
                v-for="opt in ownerOptions"
                :key="opt.value"
                :value="opt.label"
              />
            </datalist>
            <div
              v-if="form.ownerSelections.length"
              class="flex flex-wrap gap-2 pt-1"
            >
              <div
                v-for="(owner, index) in form.ownerSelections"
                :key="`${owner.id || owner.label || 'owner'}-${index}`"
                class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
              >
                <span class="max-w-[220px] truncate">{{ owner.label }}</span>
                <button
                  v-if="!isReadOnlyMode"
                  type="button"
                  class="font-semibold text-rose-600 hover:text-rose-700"
                  @click="removeOwner(index)"
                >
                  Hapus
                </button>
              </div>
            </div>
            <p class="text-[11px] text-slate-500">
              Pilih satu atau lebih owner agar order dapat diakses customer.
              Kosongkan jika akun customer belum ada atau akan ditambahkan
              belakangan.
            </p>
            <p
              v-if="ownerLoading"
              class="text-[11px] font-medium text-slate-500"
            >
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
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >Nama Pemohon</label
              >
              <input
                v-model="form.customerName"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Nama pemohon"
                :readonly="
                  isReadOnlyMode || (isCustomerUser && !canManageCustomerData)
                "
              />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >Email Customer</label
            >
            <input
              v-model="form.customerEmail"
              type="email"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Email customer"
              :readonly="
                isReadOnlyMode || (isCustomerUser && !canManageCustomerData)
              "
            />
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >Nama Perusahaan</label
            >
            <input
              v-model="form.companyName"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Nama perusahaan/instansi"
              :readonly="
                isReadOnlyMode || (isCustomerUser && !canManageCustomerData)
              "
            />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >No Telepon</label
            >
            <input
              v-model="form.phoneNumber"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="No kontak"
              :readonly="
                isReadOnlyMode || (isCustomerUser && !canManageCustomerData)
              "
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >Jenis Pekerjaan</label
            >
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
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >Alamat lengkap</label
          >
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="Alamat lengkap Pemohon"
            :readonly="
              isReadOnlyMode || Boolean(form.addressId)
            "
          ></textarea>
          <p v-if="form.addressId" class="text-[11px] text-emerald-600">
            Alamat berasal dari data customer.
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-3">
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-800"
            >
              Sertifikat Atas Nama
            </p>
            <p class="text-[11px] text-slate-500">
              Isi jika berbeda dari nama pemohon.
            </p>
          </div>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >Nama</label
              >
              <input
                v-model="form.certificateName"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Nama pada sertifikat"
                :readonly="isReadOnlyMode"
              />
            </div>
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >Alamat Lengkap
              </label>
              <textarea
                v-model="form.certificateAddress"
                rows="2"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Alamat pada sertifikat"
                :readonly="isReadOnlyMode"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Detail Pengujian -->
      <section class="space-y-3">
        <div
          class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              Detail Pengujian
            </h2>
            <p class="text-xs text-slate-500">
              Tambah pengujian dan sesuaikan data sampel.
            </p>
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
          <div
            v-if="!form.testItems.length"
            class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500"
          >
            Belum ada pengujian yang dipilih.
          </div>

          <div
            v-for="(item, index) in form.testItems"
            :key="`test-${index}`"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
          >
            <div class="overflow-x-auto">
              <div
                class="grid w-full min-w-full gap-3 md:grid-cols-[5fr_3fr_2fr_2fr_2fr_auto] md:items-end"
              >
                <div class="flex flex-col gap-1">
                  <label
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
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
                  <label
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Nama Sampel
                  </label>
                  <input
                    v-model="item.objectName"
                    type="text"
                    class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    placeholder="cth. Beton"
                    :readonly="isReadOnlyMode"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
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
                  <label
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
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
                  <label
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
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
            </div>
            <div
              class="flex flex-wrap items-center justify-between border-t border-dashed pt-3 text-xs text-slate-600"
            >
              <span class="text-slate-500">
                Pilih pengujian dari daftar agar tarif terisi otomatis.
              </span>
              <span class="font-semibold text-slate-800">
                Line Total: Rp {{ formatCurrency(itemSubtotal(item)) }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500"
        >
          Data pengujian belum tersedia. Tambah pengujian di halaman layanan
          terlebih dahulu.
        </div>
      </section>

      <!-- Informasi tambahan -->
      <section class="space-y-3">
        <div class="flex flex-col gap-1">
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >Paket Pekerjaan</label
          >
          <input
            v-model="form.workPackage"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            placeholder="cth. Proyek pembangunan gedung"
            :readonly="isReadOnlyMode"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Catatan
            <span
              class="text-[11px] font-semibold normal-case tracking-normal"
              :class="isManualMode ? 'text-rose-600' : 'text-slate-400'"
            >
              ({{
                isManualMode
                  ? 'wajib jika layanan tidak ada di daftar'
                  : 'opsional'
              }})
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
            Karena layanan tidak dipilih, catatan dan dokumen pendukung
            diperlukan agar admin dapat menindaklanjuti. Dokumen dapat diunggah
            setelah permintaan tersimpan.
          </p>
        </div>

        <div v-if="showSupportingDocs" class="flex flex-col gap-1">
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Dokumen Pendukung
            <span
              class="text-[11px] font-semibold normal-case tracking-normal"
              :class="isManualMode ? 'text-rose-600' : 'text-slate-400'"
            >
              ({{
                isManualMode
                  ? 'wajib jika layanan tidak ada di daftar'
                  : 'opsional'
              }})
            </span>
          </label>
          <div
            class="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3"
          >
            <input
              type="file"
              class="w-full text-sm"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              @change="handleFileChange"
              :disabled="isReadOnlyMode"
            />
            <div v-if="hasSelectedSupportingFiles" class="space-y-2">
              <div
                v-for="(file, index) in form.supportingFiles"
                :key="`supporting-${index}`"
                class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700"
              >
                <span class="truncate">{{ file.name }}</span>
                <button
                  v-if="!isReadOnlyMode"
                  type="button"
                  class="text-rose-600 font-semibold hover:text-rose-700"
                  @click="removeSupportingFile(index)"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div
              v-if="existingSupportingDocs.length"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
            >
              <p class="text-[11px] text-slate-500">Dokumen tersimpan</p>
              <ul class="mt-1 space-y-1">
                <li
                  v-for="doc in existingSupportingDocs"
                  :key="doc.id || doc.file_name || doc.fileName || doc.name"
                  class="truncate"
                >
                  <a
                    v-if="resolveMediaUrl(doc)"
                    :href="resolveMediaUrl(doc)"
                    target="_blank"
                    rel="noopener"
                    class="text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    {{ resolveMediaLabel(doc) }}
                  </a>
                  <span v-else>{{ resolveMediaLabel(doc) }}</span>
                </li>
              </ul>
            </div>
            <p class="text-[11px] text-slate-500">
              Format: PDF/JPG/PNG/DOC.
              {{
                isManualMode
                  ? 'Wajib dilampirkan jika layanan tidak ada di daftar.'
                  : 'Opsional.'
              }}
            </p>
          </div>
        </div>
      </section>

      <!-- Aksi -->
      <div
        class="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3"
      >
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
import { normalizeOrderStatus } from '@/utils/orderStatus';

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

const showOwnerField = computed(
  () => !isCustomerUser.value && canLookupUsers.value
);

const ownerOptions = ref([]);
const ownerLoading = ref(false);
const ownerError = ref('');
const ownerTouched = ref(false);
const ownerDataListId = `owner-search-${Math.random()
  .toString(36)
  .slice(2, 8)}`;

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
    companyName: '',
    phoneNumber: '',
    address: '',
    addressId: '',
    purpose: '',
    testCategory: '',
    jobCategory: '',
    workCategoryId: '',
    workPackage: '',
    certificateName: '',
    certificateAddress: '',
    note: '',
    supportingFile: null,
    supportingFileName: '',
    supportingFiles: [],
    supportingFileNames: [],
    medias: [],
    testItems: [],
    ownerUserIds: [],
    ownerSelections: [],
    ownerDisplay: '',
    status: 'draft',
  };
};

const form = ref(defaultForm());

const allowedSupportingStatuses = new Set(['draft', 'awaiting_review']);

const normalizedStatus = computed(
  () => normalizeOrderStatus(form.value.status) || 'draft'
);

const showSupportingDocs = computed(
  () =>
    isEditMode.value && allowedSupportingStatuses.has(normalizedStatus.value)
);

const existingSupportingDocs = computed(() => {
  const items = Array.isArray(form.value.medias) ? form.value.medias : [];
  return items.filter((media) => isSupportingMedia(media));
});

const hasSelectedSupportingFiles = computed(
  () =>
    Array.isArray(form.value.supportingFiles) &&
    form.value.supportingFiles.length > 0
);

const hasSupportingDocs = computed(
  () =>
    hasSelectedSupportingFiles.value || existingSupportingDocs.value.length > 0
);

function updateOrderMetadata(entryDate) {
  const year = extractYear(entryDate);
  form.value.orderYear = year;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const inheritedYear = extractYear(val.entryDate || todayString());
      const ownerSelections = resolveOwnerSelections(val);
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
        certificateAddress:
          val.certificateAddress ||
          val.certificate_address ||
          val.recipientFullAddress ||
          val.recipient_full_address ||
          '',
        customerId: val.customerId || val.customer_id || '',
        companyName:
          val.companyName ||
          val.company_name ||
          val.applicantCompanyName ||
          val.applicant_company_name ||
          '',
        customerEmail:
          val.customerEmail || val.customer_email || val.email || '',
        addressId: val.addressId || val.address_id || '',
        note: val.note || '',
        supportingFile: val.supportingFile || null,
        supportingFileName:
          val.supportingFileName || val.supporting_file_name || '',
        supportingFiles: [],
        supportingFileNames: [],
        medias: Array.isArray(val.medias) ? val.medias : [],
        ownerUserIds: ownerSelections.map((owner) => owner.id),
        ownerSelections,
        ownerDisplay: '',
      };
    } else {
      form.value = defaultForm();
    }
    ownerTouched.value = false;
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
  return test.name || test.code || test.id || testId || 'Pengujian';
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
  if (!showOwnerField.value || isReadOnlyMode.value) return true;
  const display = (form.value.ownerDisplay || '').trim();
  return !display;
});

const canSave = computed(() => {
  // Validasi minimal data pemohon
  const hasCustomer = Boolean(
    form.value.customerName && form.value.customerName.trim()
  );
  const hasWorkCategory = Boolean(
    form.value.workCategoryId && String(form.value.workCategoryId).trim()
  );
  const hasApplicantEmail = Boolean(
    form.value.customerEmail && form.value.customerEmail.trim()
  );
  const hasApplicantPhone = Boolean(
    form.value.phoneNumber && String(form.value.phoneNumber).trim()
  );
  const hasApplicantAddress = Boolean(
    form.value.address && form.value.address.trim()
  );
  const hasServices = normalizedTestItems.value.length > 0;
  const hasManualNote = Boolean(form.value.note && form.value.note.trim());
  const hasSupportingDocsValue = hasSupportingDocs.value;
  const shouldRequireSupportingDocs =
    isManualMode.value && showSupportingDocs.value;

  if (!ownerSelectionValid.value) return false;

  if (
    !hasCustomer ||
    !hasWorkCategory ||
    !hasApplicantEmail ||
    !hasApplicantPhone ||
    !hasApplicantAddress
  ) {
    return false;
  }

  if (!hasServices) {
    if (!hasManualNote) return false;
    if (shouldRequireSupportingDocs && !hasSupportingDocsValue) return false;
  }

  return true;
});

function itemSubtotal(item) {
  const lineTotal =
    item.lineTotal ??
    item.line_total ??
    Math.max(0, Number(item.price) || 0) *
      Math.max(1, Number(item.quantity) || 1);
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
    companyName,
    customerEmail,
    phoneNumber,
    addressId,
    address,
    workCategoryId,
    workPackage,
    status,
    certificateName,
    certificateAddress,
    note,
  } = form.value;

  const entryDateSafe = form.value.entryDate || todayString();
  const supportingFiles = Array.isArray(form.value.supportingFiles)
    ? form.value.supportingFiles.filter(Boolean)
    : [];
  const supportingFileNames = supportingFiles
    .map((file) => (file?.name ? String(file.name) : ''))
    .filter(Boolean);

  const ownerIdsFromSelections = Array.isArray(form.value.ownerSelections)
    ? form.value.ownerSelections.map((item) => item.id).filter(Boolean)
    : [];
  const ownerIdsFallback = Array.isArray(form.value.ownerUserIds)
    ? form.value.ownerUserIds.filter(Boolean)
    : [];
  const baseOwnerIds = ownerIdsFromSelections.length
    ? ownerIdsFromSelections
    : ownerIdsFallback;
  const authUserId = resolveAuthUserId(authUser.value);
  const resolvedOwnerIds = dedupeOwnerIds(
    !showOwnerField.value &&
      isCustomerUser.value &&
      !isEditMode.value &&
      authUserId
      ? [...baseOwnerIds, authUserId]
      : baseOwnerIds
  );
  const includeOwnerIds = showOwnerField.value
    ? isEditMode.value
      ? ownerTouched.value
      : resolvedOwnerIds.length > 0
    : !isEditMode.value && isCustomerUser.value && resolvedOwnerIds.length > 0;

  const payload = {
    idOrder,
    orderNumber: orderNumber ? Number(orderNumber) : null,
    orderYear: orderYear || extractYear(entryDateSafe),
    entryDate: entryDate || entryDateSafe,
    customerId,
    customerName,
    companyName,
    customerEmail,
    phoneNumber,
    addressId,
    address,
    workCategoryId,
    workPackage,
    certificateName,
    certificateAddress,
    note,
    supportingFiles,
    supportingFileNames,
    supportingFile: supportingFiles[0] || null,
    supportingFileName: supportingFileNames[0] || '',
    status: status || 'draft',
    purpose: summary,
    testCategory: summary,
    testItems,
  };
  if (includeOwnerIds) {
    payload.ownerUserIds = resolvedOwnerIds;
  }
  return payload;
}

async function submitWith() {
  if (!canSave.value) return;
  return submitWithStatus('awaiting_review');
}

function handleSubmit() {
  submitWith();
}

async function submitWithStatus(status) {
  const nextStatus =
    typeof status === 'string' && status.trim() ? status.trim() : 'draft';
  const confirmed = await openConfirm({
    title:
      nextStatus === 'draft'
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
  emit('submit', {
    action: nextStatus === 'draft' ? 'draft' : 'submit',
    data: payload,
  });
}

function handleSaveDraft() {
  // Emit draft tanpa memaksa validasi lanjut
  submitWithStatus('draft');
}

function handleFileChange(event) {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) return;
  form.value.supportingFiles = [...form.value.supportingFiles, ...files];
  const first = form.value.supportingFiles[0] || null;
  form.value.supportingFile = first;
  form.value.supportingFileName = first?.name || '';
  if (event?.target) {
    event.target.value = '';
  }
}

function removeSupportingFile(index) {
  form.value.supportingFiles.splice(index, 1);
  const first = form.value.supportingFiles[0] || null;
  form.value.supportingFile = first;
  form.value.supportingFileName = first?.name || '';
}

function isSupportingMedia(media = {}) {
  const collection = String(media.collection_name || media.collectionName || '')
    .trim()
    .toLowerCase();
  if (!collection) return true;
  if (collection.includes('payment') || collection.includes('refund'))
    return false;
  return true;
}

function resolveMediaLabel(media = {}) {
  return (
    media.name ||
    media.file_name ||
    media.fileName ||
    media.filename ||
    'Dokumen Pendukung'
  );
}

function resolveMediaUrl(media = {}) {
  return media.file_url || media.fileUrl || '';
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

function normalizeOwnerId(value) {
  return String(value || '').trim();
}

function dedupeOwnerIds(ids = []) {
  const seen = new Set();
  const result = [];
  ids.forEach((id) => {
    const normalized = normalizeOwnerId(id);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
}

function dedupeOwnerSelections(items = []) {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    const id = normalizeOwnerId(item?.id || item?.value || item);
    if (!id || seen.has(id)) return;
    const label = String(item?.label || item?.name || id).trim() || id;
    seen.add(id);
    result.push({ id, label });
  });
  return result;
}

function setOwnerSelections(items, markTouched = false) {
  const next = dedupeOwnerSelections(items);
  form.value.ownerSelections = next;
  form.value.ownerUserIds = next.map((item) => item.id);
  if (markTouched) ownerTouched.value = true;
}

function addOwnerSelection(entry) {
  if (!entry) return false;
  const id = normalizeOwnerId(entry?.id || entry?.value || entry);
  if (!id) return false;
  const label = String(entry?.label || entry?.name || id).trim() || id;
  const next = dedupeOwnerSelections([
    ...(Array.isArray(form.value.ownerSelections)
      ? form.value.ownerSelections
      : []),
    { id, label },
  ]);
  const changed = next.length !== form.value.ownerSelections.length;
  form.value.ownerSelections = next;
  form.value.ownerUserIds = next.map((item) => item.id);
  if (changed) ownerTouched.value = true;
  return changed;
}

function removeOwner(index) {
  const current = Array.isArray(form.value.ownerSelections)
    ? form.value.ownerSelections
    : [];
  const next = current.filter((_, idx) => idx !== index);
  setOwnerSelections(next, true);
}

function resolveOwnerSelections(val = {}) {
  const orderUsers = Array.isArray(val.orderUsers || val.order_users)
    ? val.orderUsers || val.order_users
    : [];
  const ownerEntries = orderUsers.filter(
    (item) =>
      String(item?.type || '')
        .trim()
        .toLowerCase() === 'owner'
  );
  const selections = ownerEntries
    .map((item) => {
      const id = normalizeOwnerId(
        item?.userId || item?.user_id || item?.user?.id
      );
      if (!id) return null;
      const label = item?.user ? buildOwnerLabel(item.user) : id;
      return { id, label };
    })
    .filter(Boolean);
  if (selections.length) return dedupeOwnerSelections(selections);

  const ownerIdsRaw =
    val.ownerUserIds ||
    val.owner_user_ids ||
    val.ownerUserId ||
    val.owner_user_id ||
    [];
  const ownerIds = Array.isArray(ownerIdsRaw) ? ownerIdsRaw : [ownerIdsRaw];
  return dedupeOwnerSelections(ownerIds.map((id) => ({ id })));
}

function resolveAuthUserId(user) {
  return normalizeOwnerId(user?.id || user?.user_id || user?.userId);
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
    const selectedIds = new Set(
      Array.isArray(form.value.ownerSelections)
        ? form.value.ownerSelections.map((item) => item.id)
        : []
    );
    const mapped = items
      .map((user) => ({
        value: String(user.id || '').trim(),
        label: buildOwnerLabel(user),
        raw: user,
        isCustomer: isCustomerCandidate(user),
      }))
      .filter((item) => item.value && !selectedIds.has(item.value));
    const customers = mapped.filter((item) => item.isCustomer);
    const nonCustomers = mapped.filter((item) => !item.isCustomer);
    ownerOptions.value = customers.length
      ? [...customers, ...nonCustomers]
      : mapped;
  } catch (err) {
    if (currentSeq !== ownerSearchSequence) return;
    ownerOptions.value = [];
    ownerError.value =
      err?.response?.data?.message || err?.message || 'Gagal mencari user.';
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
  if (isReadOnlyMode.value) return;
  setOwnerSelections([], true);
  form.value.ownerDisplay = '';
  ownerOptions.value = [];
  ownerError.value = '';
}

function handleOwnerInput() {
  if (!showOwnerField.value || isReadOnlyMode.value) return;
  ownerError.value = '';
  const query = String(form.value.ownerDisplay || '').trim();
  if (!query) {
    ownerOptions.value = [];
    return;
  }
  scheduleOwnerSearch(query);
}

function handleOwnerSelection() {
  if (!showOwnerField.value) return;
  const label = String(form.value.ownerDisplay || '').trim();
  if (!label) {
    ownerError.value = '';
    return;
  }

  const found = ownerOptions.value.find(
    (opt) => String(opt.label).trim().toLowerCase() === label.toLowerCase()
  );
  if (found?.value) {
    addOwnerSelection(found);
    form.value.ownerDisplay = '';
    ownerOptions.value = [];
    ownerError.value = '';
    return;
  }

  // Fallback: izinkan tempel ID langsung (ULID).
  if (/^[0-9A-HJKMNP-TV-Z]{20,}$/i.test(label)) {
    addOwnerSelection({ id: label, label });
    form.value.ownerDisplay = '';
    ownerOptions.value = [];
    ownerError.value = '';
    return;
  }

  ownerError.value = '';
}

function handleOwnerBlur() {
  if (!showOwnerField.value) return;
  handleOwnerSelection();
}
</script>
