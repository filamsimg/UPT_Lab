<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-fadeIn border border-gray-100"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-5 border-b pb-2">
        <h3 class="text-xl font-semibold text-primaryDark">
          {{ isEdit ? 'Edit Daftar Layanan' : 'Tambah Daftar Layanan' }}
        </h3>
        <button
          class="text-gray-400 hover:text-gray-700 transition"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Jenis Pengujian -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Jenis Pengujian</label>
          <select
            v-model="form.category"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          >
            <option value="" disabled>Pilih jenis</option>
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Kode -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Kode</label>
          <input
            v-model="form.code"
            placeholder="Misal: UTK"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          />
        </div>

        <!-- Nama Pengujian -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Nama Pengujian</label>
          <input
            v-model="form.name"
            placeholder="Misal: Uji Tarik"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          />
        </div>

        <!-- Satuan -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Satuan</label>
          <input
            v-model="form.unit"
            placeholder="Misal: Sampel, Jam"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          />
        </div>

        <!-- Tarif -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Tarif (Rp)</label>
          <input
            v-model.number="form.price"
            type="number"
            placeholder="Contoh: 150000"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          />
        </div>

        <!-- Metode Uji -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">Metode Uji</label>
          <select
            v-model="form.method"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          >
            <option value="" disabled>Pilih Metode</option>
            <option
              v-for="m in methods"
              :key="m.id || m"
              :value="m.id || m"
            >
              {{ m.name || m }}
            </option>
          </select>
        </div>

        <!-- Mesin Uji -->
        <div class="flex flex-col col-span-2">
          <label class="text-sm text-gray-600 mb-1">Mesin Uji</label>
          <select
            v-model="form.equipment"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primaryLight focus:border-primaryLight outline-none"
          >
            <option value="" disabled>Pilih Mesin</option>
            <option
              v-for="m in machines"
              :key="m.id || m"
              :value="m.id || m"
            >
              {{ m.name || m }}
            </option>
          </select>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 pt-2 border-t">
        <button
          class="px-4 py-2 rounded-lg text-gray-600 border hover:bg-gray-100 transition"
          @click="$emit('close')"
        >
          Batal
        </button>
        <button
          class="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primaryLight to-primaryDark shadow-md hover:opacity-90 transition"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Perbarui' : 'Simpan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  methods: { type: Array, default: () => [] },
  machines: { type: Array, default: () => [] },
  editData: Object, 
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  id: null,
  category: '',
  code: '',
  name: '',
  unit: '',
  price: 0,
  method: '',
  equipment: '',
})

const categoryOptions = computed(() => {
  const options = props.categories?.length
    ? props.categories
    : ['Testing', 'Machining']
  return options.map((item) =>
    typeof item === 'object'
      ? { value: item.value ?? item.label ?? '', label: item.label ?? item.value ?? '' }
      : { value: item, label: item }
  ).filter((item) => item.value)
})

// Cek apakah sedang mode edit
const isEdit = computed(() => !!props.editData)

// Watcher: isi form saat editData berubah
watch(
  () => props.editData,
  (val) => {
    if (val) {
      Object.assign(form, {
        id: val.id ?? null,
        category: val.serviceType || val.category || val.serviceCategory || '',
        code: val.serviceCode || val.code || '',
        name: val.name || val.testCategory || '',
        unit: val.unit || '',
        price: val.price ?? 0,
        method: val.methodId || val.method_id || val.method?.id || '',
        equipment: val.machineId || val.machine_id || val.machine?.id || '',
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  Object.assign(form, {
    id: null,
    category: '',
    code: '',
    name: '',
    unit: '',
    price: 0,
    method: '',
    equipment: '',
  })
}

function handleSubmit() {
  if (!form.category || !form.code || !form.method || !form.equipment) {
    alert('Mohon lengkapi data layanan (jenis, kode, metode, dan mesin).')
    return
  }
  emit('save', {
    ...form,
    isEdit: isEdit.value,
    service_type: form.category,
    service_code: form.code,
    method_id: form.method,
    machine_id: form.equipment,
    serviceType: form.category,
    serviceCode: form.code,
    methodId: form.method,
    machineId: form.equipment,
    price: toNumber(form.price, 0),
  })
  resetForm()
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
</style>
