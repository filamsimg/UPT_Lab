<template>
  <div class="space-y-5">
    <header
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primaryLight">
        Daftar Layanan
      </p>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">Layanan & Tarif</h2>
        <p class="text-sm text-gray-500">
          Kelola daftar layanan pengujian, mesin, dan metode agar tim selalu menggunakan referensi terbaru.
        </p>
      </div>
    </header>

    <!-- === DAFTAR LAYANAN === -->
    <div class="bg-white rounded-xl shadow-md p-5">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h3 class="text-lg font-semibold text-surfaceDark">Daftar Layanan</h3>
          <p class="text-sm text-gray-500">
          </p>
        </div>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon
              class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari layanan, kode, metode, atau mesin..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
            @click="refreshTests"
          >
            <ArrowPathIcon
              :class="['h-5 w-5', testStore.loading ? 'animate-spin text-primary' : 'text-gray-500']"
            />
            Muat Ulang
          </button>
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="openCreate"
          >
            + Tambah Daftar Layanan
          </button>
        </div>
      </div>

      <p v-if="testStore.error" class="mb-3 text-sm text-red-600">
        {{ testStore.error }}
      </p>

      <div
        v-if="testStore.loading"
        class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500"
      >
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data layanan...
      </div>
      <div v-else>
        <DataTable
          :columns="testColumns"
          :rows="rows"
          :pageSize="10"
          :filterable="false"
          :showPagination="false"
          :no-data-text="noDataText"
          scroll-body-on-mobile
          body-scroll-height="55vh"
          class="rounded-md"
        >
          <template #serviceCategoryLabel="{ value }">
            <span class="block text-center text-sm font-medium text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #code="{ value }">
            <span class="block text-center text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #name="{ value }">
            <span class="block text-center text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #unit="{ value }">
            <span class="block text-center text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #price="{ value }">
            <span class="block text-center font-semibold text-surfaceDark">
              Rp {{ formatCurrency(value) }}
            </span>
          </template>

          <template #methodName="{ value }">
            <span class="block text-center text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #machineName="{ value }">
            <span class="block text-center text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #actions="{ row }">
            <div class="flex w-full items-center justify-center gap-2">
              <button
                class="p-1.5 rounded-md hover:bg-blue-50 text-primary hover:text-primaryDark transition"
                @click="editTest(row)"
              >
                <PencilIcon class="w-5 h-5 inline" />
              </button>
              <button
                class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
                @click="removeTest(row.id)"
              >
                <TrashIcon class="w-5 h-5 inline" />
              </button>
            </div>
          </template>
        </DataTable>

        <div
          class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-700"
        >
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <span>Tampilkan</span>
              <select
                v-model.number="perPageSelection"
                class="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                @change="changePerPage(perPageSelection)"
              >
                <option
                  v-for="option in perPageOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
              <span>baris</span>
            </label>
            <p class="text-sm text-gray-500">
              Menampilkan
              <span class="font-medium text-gray-700">{{ startEntry }}</span>
              -
              <span class="font-medium text-gray-700">{{ endEntry }}</span>
              dari
              <span class="font-medium text-gray-700">{{ totalItems }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!pagination.hasPrevPage"
              @click="changePage(pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <span class="text-sm text-gray-500">
              Halaman
              <span class="font-semibold text-gray-800">{{ pagination.currentPage }}</span>
              dari
              <span class="font-semibold text-gray-800">{{ pagination.lastPage }}</span>
            </span>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!pagination.hasNextPage"
              @click="changePage(pagination.currentPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- === MODAL FORM TAMBAH / EDIT === -->
    <FormLayanan
      v-if="showModal"
      :categories="categories"
      :methods="methods"
      :machines="machines"
      :editData="editData"
      @close="closeModal"
      @save="handleSaveTest"
    />

    <FormMasterItem
      v-if="showMachineModal"
      :title="machineModalTitle"
      name-label="Nama Mesin Uji"
      name-placeholder="Nama mesin uji"
      description-label="Deskripsi Mesin Uji"
      description-placeholder="Deskripsi singkat mesin uji"
      :submit-label="machineSubmitLabel"
      :submit-action="handleSaveMachine"
      :loading="machineSaving"
      :initial-value="machineEditData"
      :reset-on-success="machineModalMode === 'add'"
      :close-on-success="machineModalMode === 'edit'"
      @close="closeMachineModal"
    />

    <FormMasterItem
      v-if="showMethodModal"
      :title="methodModalTitle"
      name-label="Nama Metode Uji"
      name-placeholder="Nama metode uji"
      description-label="Deskripsi Metode Uji"
      description-placeholder="Deskripsi singkat metode uji"
      :submit-label="methodSubmitLabel"
      :submit-action="handleSaveMethod"
      :loading="methodSaving"
      :initial-value="methodEditData"
      :reset-on-success="methodModalMode === 'add'"
      :close-on-success="methodModalMode === 'edit'"
      @close="closeMethodModal"
    />

    <!-- === MESIN UJI === -->
    <div class="bg-white rounded-xl shadow-md p-5 mb-8">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Mesin Uji</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="openMachineModal"
          >
            + Tambah Mesin Uji
          </button>
        </div>
      </div>

      <DataTable
        :columns="machineColumns"
        :rows="machineItems"
        :filterable="false"
        :showPagination="true"
        :pageSize="10"
        scroll-body-on-mobile
        body-scroll-height="40vh"
        class="rounded-md"
      >
        <template #index="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value ?? '-' }}
          </span>
        </template>
        <template #name="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value || '-' }}
          </span>
        </template>
        <template #description="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value || '-' }}
          </span>
        </template>
        <template #actions="{ row, index }">
          <div class="flex w-full items-center justify-center gap-2">
            <button
              class="p-1.5 rounded-md hover:bg-blue-50 text-primary hover:text-primaryDark transition"
              @click="openMachineEdit(row)"
            >
              <PencilIcon class="w-5 h-5 inline" />
            </button>
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMachine(row.id || index)"
            >
              <TrashIcon class="w-5 h-5 inline" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- === METODE UJI === -->
    <div class="bg-white  rounded-xl shadow-md p-5">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Metode Uji</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="openMethodModal"
          >
            + Tambah Metode Uji
          </button>
        </div>
      </div>

      <DataTable
        :columns="methodColumns"
        :rows="methodItems"
        :filterable="false"
        :showPagination="true"
        :pageSize="10"
        scroll-body-on-mobile
        body-scroll-height="40vh"
        class="rounded-md"
      >
        <template #index="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value ?? '-' }}
          </span>
        </template>
        <template #name="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value || '-' }}
          </span>
        </template>
        <template #description="{ value }">
          <span class="block text-center text-sm text-gray-700">
            {{ value || '-' }}
          </span>
        </template>
        <template #actions="{ row, index }">
          <div class="flex w-full items-center justify-center gap-2">
            <button
              class="p-1.5 rounded-md hover:bg-blue-50 text-primary hover:text-primaryDark transition"
              @click="openMethodEdit(row)"
            >
              <PencilIcon class="w-5 h-5 inline" />
            </button>
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMethod(row.id || index)"
            >
              <TrashIcon class="w-5 h-5 inline" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { ArrowPathIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import DataTable from '@/components/common/DataTable.vue'
import FormLayanan from '@/components/form/FormLayanan.vue'
import FormMasterItem from '@/components/form/FormMasterItem.vue'
import { useTestStore } from '@/stores/useTestStore'
import { useConfirmDialog } from '@/stores/useConfirmDialog'
import { useNotificationCenter } from '@/stores/useNotificationCenter'

const testStore = useTestStore()
const openConfirm = useConfirmDialog()
const { notify } = useNotificationCenter()

const categories = [
  { value: 'Testing', label: 'Pengujian' },
  { value: 'Machining', label: 'Machining' },
]

const tests = computed(() => testStore.tests)
const machines = computed(() => testStore.machines)
const methods = computed(() => testStore.methods)

const showModal = ref(false)
const editData = ref(null)
const searchTerm = ref('')
const initialized = ref(false)
let debounceTimer = null
const perPageOptions = [10, 25, 50, 100]
const perPageSelection = ref(testStore.pagination?.perPage || perPageOptions[0])
const showMachineModal = ref(false)
const showMethodModal = ref(false)
const machineSaving = ref(false)
const methodSaving = ref(false)
const machineModalMode = ref('add')
const methodModalMode = ref('add')
const machineEditData = ref(null)
const methodEditData = ref(null)

const testColumns = [
  { field: 'serviceCategoryLabel', title: 'Jenis Layanan', slotName: 'serviceCategoryLabel', isSortable: true, className: 'text-left md:text-center' },
  { field: 'code', title: 'Kode', isSortable: true, className: 'text-left md:text-center' },
  { field: 'name', title: 'Nama Pengujian', isSortable: true, className: 'text-left md:text-center' },
  { field: 'unit', title: 'Satuan', className: 'text-left md:text-center' },
  { field: 'price', title: 'Tarif', slotName: 'price', isSortable: true, className: 'text-left md:text-center' },
  { field: 'methodName', title: 'Metode Uji', className: 'text-left md:text-center' },
  { field: 'machineName', title: 'Mesin Uji', className: 'text-left md:text-center' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', sortable: false, className: 'text-left md:text-center' },
]

const machineColumns = [
  { field: 'index', title: 'No', className: 'w-20 text-left md:text-center' },
  { field: 'name', title: 'Nama Mesin', className: 'text-left md:text-center' },
  { field: 'description', title: 'Deskripsi', className: 'hidden sm:table-cell text-left md:text-center' },
  { field: 'actions', title: 'Aksi', className: 'md:min-w-[120px] text-left md:text-center', slotName: 'actions', sortable: false },
]

const methodColumns = [
  { field: 'index', title: 'No', className: 'w-20 text-left md:text-center' },
  { field: 'name', title: 'Nama Metode', className: 'text-left md:text-center' },
  { field: 'description', title: 'Deskripsi', className: 'hidden sm:table-cell text-left md:text-center' },
  { field: 'actions', title: 'Aksi', className: 'md:min-w-[120px] text-left md:text-center', slotName: 'actions', sortable: false },
]

// Data layanan yang ditampilkan
const rows = computed(() =>
  (tests.value || []).map((item) => ({
    ...item,
    name: item.name || '',
    methodName: item.methodName || item.method?.name || '',
    machineName: item.machineName || item.machine?.name || '',
    serviceCategoryLabel:
      item.serviceCategoryLabel ||
      (item.serviceType === 'Testing' ? 'Pengujian' : item.serviceType) ||
      'Layanan',
  }))
)

const machineItems = computed(() =>
  machines.value.map((m, i) => ({
    id: m.id || m.machine_id || m.machineId || '',
    index: i + 1,
    name: m.name || m,
    description: m.description || '',
  }))
)

const methodItems = computed(() =>
  methods.value.map((m, i) => ({
    id: m.id || m.method_id || m.methodId || '',
    index: i + 1,
    name: m.name || m,
    description: m.description || '',
  }))
)

const pagination = computed(() => testStore.pagination)
const currentPerPage = computed(() => normalizePerPage(perPageSelection.value || pagination.value.perPage))
const totalItems = computed(() => {
  const total = Number(pagination.value?.totalItems)
  return Number.isFinite(total) ? total : rows.value.length
})
const startEntry = computed(() => {
  if (!totalItems.value) return 0
  return (pagination.value.currentPage - 1) * currentPerPage.value + 1
})
const endEntry = computed(() => {
  if (!totalItems.value) return 0
  return Math.min(pagination.value.currentPage * currentPerPage.value, totalItems.value)
})

const noDataText = computed(() =>
  searchTerm.value
    ? 'Layanan tidak ditemukan untuk kata kunci tersebut.'
    : 'Belum ada layanan yang terdaftar.'
)

const machineModalTitle = computed(() =>
  machineModalMode.value === 'edit' ? 'Edit Mesin Uji' : 'Tambah Mesin Uji'
)
const methodModalTitle = computed(() =>
  methodModalMode.value === 'edit' ? 'Edit Metode Uji' : 'Tambah Metode Uji'
)
const machineSubmitLabel = computed(() =>
  machineModalMode.value === 'edit' ? 'Perbarui' : 'Tambah'
)
const methodSubmitLabel = computed(() =>
  methodModalMode.value === 'edit' ? 'Perbarui' : 'Tambah'
)

watch(searchTerm, (value) => {
  testStore.setSearch(value)
  if (!initialized.value) return
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    testStore.fetchTests({ page: 1, search: value, perPage: currentPerPage.value })
  }, 400)
})

watch(
  () => pagination.value.perPage,
  (perPage) => {
    perPageSelection.value = normalizePerPage(perPage)
  },
  { immediate: true }
)

onMounted(async () => {
  await testStore.fetchAll()
  initialized.value = true
})

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveServiceName(...sources) {
  for (const source of sources) {
    if (!source) continue
    const name = toCleanString(
      source.name ||
        source.test_name ||
        source.testName ||
        source.service_name ||
        source.serviceName
    )
    if (name) return name
  }
  return ''
}

function validateServicePayload(payload = {}) {
  const name = resolveServiceName(payload)
  const category = toCleanString(
    payload.category ||
      payload.service_type ||
      payload.serviceType ||
      payload.serviceCategory
  )
  const code = toCleanString(payload.code || payload.service_code || payload.serviceCode)
  const methodId = payload.method || payload.method_id || payload.methodId
  const machineId = payload.equipment || payload.machine_id || payload.machineId

  if (!name) return 'Nama pengujian wajib diisi.'
  if (!category || !code || !methodId || !machineId) {
    return 'Mohon lengkapi data layanan (nama, jenis, kode, metode, dan mesin).'
  }
  if (payload.isEdit) {
    const id = payload.id || payload.service_id || payload.serviceId
    if (!id) return 'ID layanan tidak ditemukan.'
  }
  return ''
}

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function openCreate() {
  editData.value = null
  showModal.value = true
}

function editTest(test) {
  editData.value = { ...test }
  showModal.value = true
}

// Simpan create/update ke store
async function handleSaveTest(payload) {
  const validationError = validateServicePayload(payload)
  if (validationError) {
    notify({
      tone: 'warning',
      title: 'Validasi gagal',
      message: validationError,
      persist: false,
    })
    return
  }

  const isEditMode = Boolean(payload?.isEdit)
  try {
    const result = isEditMode
      ? await testStore.updateTest(payload)
      : await testStore.addTest(payload)

    if (result?.ok === false) {
      throw new Error(result.error || 'Gagal menyimpan layanan.')
    }

    const serviceName = resolveServiceName(payload, result?.data) || 'Layanan'
    notify({
      tone: 'success',
      title: isEditMode ? 'Layanan diperbarui' : 'Layanan ditambahkan',
      message: `${serviceName} berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`,
      persist: false,
    })
    showModal.value = false
    editData.value = null
    await refreshTests()
  } catch (err) {
    const message = getErrorMessage(
      err,
      isEditMode ? 'Gagal memperbarui layanan.' : 'Gagal menambahkan layanan.'
    )
    notify({
      tone: 'error',
      title: isEditMode ? 'Gagal memperbarui layanan' : 'Gagal menambahkan layanan',
      message,
      persist: false,
    })
  }
}

async function removeTest(id) {
  if (!id) {
    notify({
      tone: 'warning',
      title: 'ID layanan kosong',
      message: 'Pilih layanan yang akan dihapus.',
      persist: false,
    })
    return
  }
  const target = (tests.value || []).find(
    (item) => String(item?.id || '') === String(id)
  )
  const serviceName = resolveServiceName(target)
  const ok = await openConfirm({
    title: 'Hapus layanan?',
    message: serviceName
      ? `Layanan ${serviceName} akan dihapus permanen.`
      : 'Layanan ini akan dihapus permanen.',
    confirmLabel: 'Hapus',
    variant: 'danger',
  })
  if (!ok) return
  try {
    await testStore.removeTest(id)
    notify({
      tone: 'success',
      title: 'Layanan dihapus',
      message: serviceName
        ? `${serviceName} berhasil dihapus.`
        : 'Layanan berhasil dihapus.',
      persist: false,
    })
  } catch (err) {
    const message = getErrorMessage(err, 'Gagal menghapus layanan.')
    notify({
      tone: 'error',
      title: 'Gagal menghapus layanan',
      message,
      persist: false,
    })
  }
}

async function refreshTests() {
  await testStore.fetchTests({
    page: pagination.value.currentPage,
    search: searchTerm.value,
    perPage: currentPerPage.value,
  })
}

async function changePage(page) {
  if (page < 1) return
  await testStore.fetchTests({
    page,
    search: searchTerm.value,
    perPage: currentPerPage.value,
  })
}

async function changePerPage(perPage) {
  const normalized = normalizePerPage(perPage)
  if (normalized === normalizePerPage(pagination.value.perPage)) return
  perPageSelection.value = normalized
  await testStore.fetchTests({
    page: 1,
    search: searchTerm.value,
    perPage: normalized,
  })
}

function normalizePerPage(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : perPageOptions[0]
}

// === Mesin ===
async function handleSaveMachine({ name, description }) {
  const cleanedName = typeof name === 'string' ? name.trim() : ''
  const cleanedDescription = typeof description === 'string' ? description.trim() : ''
  if (!cleanedName) {
    return { ok: false, error: 'Nama mesin uji wajib diisi.' }
  }
  machineSaving.value = true
  try {
    if (machineModalMode.value === 'edit') {
      const id = machineEditData.value?.id
      if (!id) return { ok: false, error: 'ID mesin tidak ditemukan.' }
      const result = await testStore.updateMachine({
        id,
        name: cleanedName,
        description: cleanedDescription,
      })
      return result || { ok: true }
    }
    const result = await testStore.addMachine(cleanedName, cleanedDescription)
    return result || { ok: true }
  } catch (err) {
    return {
      ok: false,
      error:
        err?.response?.data?.message ||
        err?.message ||
        (machineModalMode.value === 'edit'
          ? 'Gagal memperbarui mesin.'
          : 'Gagal menambahkan mesin.'),
    }
  } finally {
    machineSaving.value = false
  }
}
function removeMachine(idx) {
  testStore.removeMachine(idx)
}

// === Metode ===
async function handleSaveMethod({ name, description }) {
  const cleanedName = typeof name === 'string' ? name.trim() : ''
  const cleanedDescription = typeof description === 'string' ? description.trim() : ''
  if (!cleanedName) {
    return { ok: false, error: 'Nama metode uji wajib diisi.' }
  }
  methodSaving.value = true
  try {
    if (methodModalMode.value === 'edit') {
      const id = methodEditData.value?.id
      if (!id) return { ok: false, error: 'ID metode tidak ditemukan.' }
      const result = await testStore.updateMethod({
        id,
        name: cleanedName,
        description: cleanedDescription,
      })
      return result || { ok: true }
    }
    const result = await testStore.addMethod(cleanedName, cleanedDescription)
    return result || { ok: true }
  } catch (err) {
    return {
      ok: false,
      error:
        err?.response?.data?.message ||
        err?.message ||
        (methodModalMode.value === 'edit'
          ? 'Gagal memperbarui metode.'
          : 'Gagal menambahkan metode.'),
    }
  } finally {
    methodSaving.value = false
  }
}
function removeMethod(idx) {
  testStore.removeMethod(idx)
}

function closeModal() {
  showModal.value = false
  editData.value = null
}

function openMachineModal() {
  machineModalMode.value = 'add'
  machineEditData.value = null
  showMachineModal.value = true
}

function closeMachineModal() {
  showMachineModal.value = false
  machineModalMode.value = 'add'
  machineEditData.value = null
}

function openMachineEdit(row) {
  if (!row?.id) return
  machineModalMode.value = 'edit'
  machineEditData.value = {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
  }
  showMachineModal.value = true
}

function openMethodModal() {
  methodModalMode.value = 'add'
  methodEditData.value = null
  showMethodModal.value = true
}

function closeMethodModal() {
  showMethodModal.value = false
  methodModalMode.value = 'add'
  methodEditData.value = null
}

function openMethodEdit(row) {
  if (!row?.id) return
  methodModalMode.value = 'edit'
  methodEditData.value = {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
  }
  showMethodModal.value = true
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
