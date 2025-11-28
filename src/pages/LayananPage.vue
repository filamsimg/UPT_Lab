<template>
  <div class="space-y-5">
    <header
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
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
            + Tambah Pengujian
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
            <span class="text-sm font-medium text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

          <template #price="{ value }">
            <span class="font-semibold text-surfaceDark">
              Rp {{ formatCurrency(value) }}
            </span>
          </template>

          <template #actions="{ row }">
            <div class="flex justify-left gap-2">
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
          class="flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Halaman
            <span class="font-semibold text-gray-800">{{ pagination.currentPage }}</span>
            dari
            <span class="font-semibold text-gray-800">{{ pagination.lastPage }}</span>
            ({{ rows.length }} layanan ditampilkan)
          </p>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!pagination.hasPrevPage"
              @click="changePage(pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
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

    <!-- === MESIN UJI === -->
    <div class="bg-white rounded-xl shadow-md p-5 mb-8">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Mesin Uji</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <input
            v-model="newMachine"
            placeholder="Nama mesin uji"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-64"
          />
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="addMachine"
          >
            Tambah
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
        <template #actions="{ row, index }">
          <div class="justify-left">
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMachine(index)"
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
          <input
            v-model="newMethod"
            placeholder="Nama metode uji"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-64"
          />
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="addMethod"
          >
            Tambah
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
        <template #actions="{ row, index }">
          <div class="justify-left">
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMethod(index)"
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
import { useTestStore } from '@/stores/useTestStore'

const testStore = useTestStore()

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

const testColumns = [
  { field: 'serviceCategoryLabel', title: 'Jenis Layanan', slotName: 'serviceCategoryLabel', isSortable: true },
  { field: 'code', title: 'Kode', isSortable: true },
  { field: 'name', title: 'Nama Pengujian', isSortable: true },
  { field: 'unit', title: 'Satuan' },
  { field: 'price', title: 'Tarif', slotName: 'price', isSortable: true },
  { field: 'methodName', title: 'Metode Uji' },
  { field: 'machineName', title: 'Mesin Uji' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', sortable: false },
]

const machineColumns = [
  { field: 'index', title: 'No', className: 'w-20 text-left' },
  { field: 'name', title: 'Nama Mesin' },
  { field: 'description', title: 'Deskripsi', className: 'hidden sm:table-cell' },
  { field: 'actions', title: 'Aksi', className: 'w-20 text-left', slotName: 'actions', sortable: false },
]

const methodColumns = [
  { field: 'index', title: 'No', className: 'w-20 text-left' },
  { field: 'name', title: 'Nama Metode' },
  { field: 'description', title: 'Deskripsi', className: 'hidden sm:table-cell' },
  { field: 'actions', title: 'Aksi', className: 'w-20 text-left', slotName: 'actions', sortable: false },
]

const rows = computed(() =>
  (tests.value || []).map((item) => ({
    ...item,
    name: item.name || item.testCategory || item.methodName || item.code,
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
    index: i + 1,
    name: m.name || m,
    description: m.description || '',
  }))
)

const methodItems = computed(() =>
  methods.value.map((m, i) => ({
    index: i + 1,
    name: m.name || m,
    description: m.description || '',
  }))
)

const pagination = computed(() => testStore.pagination)

const noDataText = computed(() =>
  searchTerm.value
    ? 'Layanan tidak ditemukan untuk kata kunci tersebut.'
    : 'Belum ada layanan yang terdaftar.'
)

watch(searchTerm, (value) => {
  testStore.setSearch(value)
  if (!initialized.value) return
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    testStore.fetchTests({ page: 1, search: value })
  }, 400)
})

onMounted(async () => {
  await testStore.fetchAll()
  initialized.value = true
})

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function openCreate() {
  editData.value = null
  showModal.value = true
}

function editTest(test) {
  editData.value = { ...test }
  showModal.value = true
}

async function handleSaveTest(payload) {
  if (payload.isEdit) await testStore.updateTest(payload)
  else await testStore.addTest(payload)
  showModal.value = false
  editData.value = null
  await refreshTests()
}

async function removeTest(id) {
  if (!id) return
  await testStore.removeTest(id)
}

async function refreshTests() {
  await testStore.fetchTests({
    page: pagination.value.currentPage,
    search: searchTerm.value,
  })
}

async function changePage(page) {
  if (page < 1) return
  await testStore.fetchTests({
    page,
    search: searchTerm.value,
  })
}

// === Mesin ===
const newMachine = ref('')
async function addMachine() {
  if (!newMachine.value.trim()) return
  await testStore.addMachine(newMachine.value)
  newMachine.value = ''
}
function removeMachine(idx) {
  testStore.removeMachine(idx)
}

// === Metode ===
const newMethod = ref('')
async function addMethod() {
  if (!newMethod.value.trim()) return
  await testStore.addMethod(newMethod.value)
  newMethod.value = ''
}
function removeMethod(idx) {
  testStore.removeMethod(idx)
}

function closeModal() {
  showModal.value = false
  editData.value = null
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
