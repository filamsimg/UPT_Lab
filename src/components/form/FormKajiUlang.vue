<template>
  <div class="flex min-h-screen w-full flex-col bg-slate-50">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Form Kaji Ulang</p>
          <h1 class="text-2xl font-semibold text-slate-900 md:text-3xl">
            {{ isEditing ? 'Ubah Data Kaji Ulang' : 'Tambah Kaji Ulang' }}
          </h1>
          <p class="text-sm text-slate-500">
            Isi informasi kaji ulang untuk permintaan dengan pembayaran terverifikasi.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="$emit('close')"
        >
          Tutup
        </button>
      </div>

      <div class="border-t border-slate-100 px-4 pb-5 md:px-8">
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">ID Order</label>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="flex w-full items-center gap-2">
            <input
              v-model="form.orderNo"
              :readonly="isEditing"
              type="text"
              placeholder="Contoh: ORD-202501-001"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
            />
            <button
              type="button"
              class="inline-flex shrink-0 items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="lookupDisabled"
              @click="$emit('lookup-order', form.orderNo)"
            >
              {{ lookupLoading ? 'Mencari...' : 'Cari' }}
            </button>
          </div>
          <p v-if="!isEditing" class="text-xs text-slate-500">
            Masukkan ID order dari permintaan dengan status pembayaran terverifikasi.
          </p>
        </div>
        <p v-if="lookupError" class="mt-2 text-xs font-medium text-rose-500">{{ lookupError }}</p>
      </div>
    </header>

    <main class="flex-1 space-y-8 bg-white px-4 py-6 md:px-8 lg:px-12">
      <section class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Permintaan</label>
              <input
                v-model="form.date"
                type="date"
                class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No. Order</label>
              <div class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                {{ formattedOrderNumber }}
              </div>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pemohon</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ form.customerName || '-' }}</p>
              <p class="text-sm text-slate-600">{{ form.customerPhone || '-' }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Alamat Pemohon</p>
              <p class="mt-2 text-sm text-slate-700">
                {{ form.customerAddress || '-' }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p class="text-sm font-semibold text-slate-800">Ringkasan Pembayaran</p>
          <dl class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="flex items-center justify-between rounded-lg bg-white px-3 py-2 font-semibold text-slate-900">
              <dt>Total Biaya</dt>
              <dd>Rp {{ formatCurrency(totalCost) }}</dd>
            </div>
            <div class="flex items-center justify-between px-3 py-2">
              <dt>Telah Dibayar</dt>
              <dd>Rp {{ formatCurrency(amountPaid) }}</dd>
            </div>
            <div class="flex items-center justify-between px-3 py-2">
              <dt>Sisa Pembayaran</dt>
              <dd>Rp {{ formatCurrency(remainingCost) }}</dd>
            </div>
            <div v-if="paymentReviewedAt" class="px-3 py-2 text-xs text-slate-500">
              <p>Disetujui oleh <span class="font-medium text-slate-700">{{ paymentReviewedBy || '-' }}</span></p>
              <p>Diperbarui: {{ formatDatetime(paymentReviewedAt) }}</p>
            </div>
          </dl>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Detail Pengujian</h2>
          <p class="text-xs text-slate-500">Sesuaikan nomor sampel apabila tiap pengujian memiliki nomor berbeda.</p>
        </div>

        <div v-if="testItems.length" class="space-y-4">
          <div class="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">No</th>
                  <th class="px-4 py-3 text-left font-semibold">Nama Pengujian</th>
                  <th class="px-4 py-3 text-left font-semibold">No Sampel</th>
                  <th class="px-4 py-3 text-left font-semibold">Nama Sampel</th>
                  <th class="px-4 py-3 text-right font-semibold">Tarif (Rp)</th>
                  <th class="px-4 py-3 text-right font-semibold">Jumlah</th>
                  <th class="px-4 py-3 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
                <tr v-for="(item, index) in testItems" :key="`uji-${index}`">
                  <td class="px-4 py-3">{{ index + 1 }}</td>
                  <td class="px-4 py-3">{{ item.testName || item.name || '-' }}</td>
                  <td class="px-4 py-3">
                    <input
                      :value="sampleCode(item)"
                      type="text"
                      placeholder="Format kode sampel"
                      class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      @input="(event) => handleSampleInput(event, item)"
                    />
                  </td>
                  <td class="px-4 py-3">{{ item.objectName || '-' }}</td>
                  <td class="px-4 py-3 text-right">Rp {{ formatCurrency(item.price) }}</td>
                  <td class="px-4 py-3 text-right">{{ item.quantity || 1 }}</td>
                  <td class="px-4 py-3 text-right">
                    Rp {{ formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <div
              v-for="(item, index) in testItems"
              :key="`uji-mobile-${index}`"
              class="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
            >
              <div class="flex items-center justify-between pb-2">
                <span class="text-xs font-semibold text-slate-500">Pengujian {{ index + 1 }}</span>
                <span class="text-xs text-slate-400">Subtotal Rp {{ formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1)) }}</span>
              </div>
              <p class="text-base font-semibold text-slate-900">{{ item.testName || item.name || '-' }}</p>
              <p class="text-xs text-slate-500">{{ item.objectName || '-' }}</p>
              <div class="mt-3 flex flex-col gap-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No Sampel</label>
                <input
                  :value="sampleCode(item)"
                  type="text"
                  placeholder="Format kode sampel"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  @input="(event) => handleSampleInput(event, item)"
                />
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs text-slate-500">Tarif</p>
                  <p class="text-sm font-semibold text-slate-900">Rp {{ formatCurrency(item.price) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500">Jumlah</p>
                  <p class="text-sm font-semibold text-slate-900">{{ item.quantity || 1 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Data pengujian akan tampil setelah ID order ditemukan.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Evaluasi Kaji Ulang</h2>
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="min-w-full table-fixed divide-y divide-slate-200 text-sm text-slate-700">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">No</th>
                <th class="px-4 py-3 text-left font-semibold">Perihal</th>
                <th class="px-4 py-3 text-left font-semibold">Hasil</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="px-4 py-3">1.</td>
                <td class="px-4 py-3">Peralatan</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.equipment"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih hasil</option>
                    <option v-for="opt in yesNoOptions" :key="`equip-${opt}`" :value="opt">{{ opt }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">2.</td>
                <td class="px-4 py-3">Personel</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.personnel"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih hasil</option>
                    <option v-for="opt in yesNoOptions" :key="`person-${opt}`" :value="opt">{{ opt }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">3.</td>
                <td class="px-4 py-3">Waktu</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.time"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih hasil</option>
                    <option v-for="opt in yesNoOptions" :key="`time-${opt}`" :value="opt">{{ opt }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">4.</td>
                <td class="px-4 py-3">Kondisi</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.condition"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih hasil</option>
                    <option v-for="opt in conditionOptions" :key="`condition-${opt}`" :value="opt">{{ opt }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">5.</td>
                <td class="px-4 py-3">Laboratorium Subkontrak</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.subcontract"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih hasil</option>
                    <option v-for="opt in yesNoOptions" :key="`subcontract-${opt}`" :value="opt">{{ opt }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">6.</td>
                <td class="px-4 py-3">Metode Uji</td>
                <td class="px-4 py-3">
                  <select
                    v-model="evaluation.method"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Pilih metode</option>
                    <option v-for="method in methodOptions" :key="`method-${method}`" :value="method">
                      {{ method }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Catatan Tambahan</h2>
        <textarea
          v-model="form.note"
          rows="4"
          placeholder="Tambahkan catatan atau rekomendasi lain yang diperlukan."
          class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
        ></textarea>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white px-4 py-4 md:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex h-12 w-full items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:w-auto"
          @click="$emit('save-draft')"
        >
          Simpan Draft
        </button>
        <button
          type="button"
          class="inline-flex h-12 w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 sm:w-auto"
          @click="$emit('tolak')"
        >
          Tolak
        </button>
        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="inline-flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            :disabled="!evaluationComplete"
            @click="$emit('lolos-kaji-ulang')"
          >
            Lolos Kaji Ulang
          </button>
          <p
            v-if="!evaluationComplete"
            class="text-center text-xs font-medium text-rose-500"
          >
            Lengkapi semua hasil evaluasi sebelum melanjutkan.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTestStore } from '@/stores/useTestStore'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  kajiUlangRows: {
    type: Array,
    required: true,
  },
  tests: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  lookupLoading: {
    type: Boolean,
    default: false,
  },
  lookupError: {
    type: String,
    default: '',
  },
})

defineEmits(['save-draft', 'lolos-kaji-ulang', 'tolak', 'close', 'lookup-order'])

const testStore = useTestStore()
const { methods: storeMethods } = storeToRefs(testStore)

onMounted(() => {
  if (!storeMethods.value.length && !testStore.loading) {
    testStore.fetchAll().catch(() => {})
  }
})

const yesNoOptions = ['Ada', 'Tidak']
const conditionOptions = ['Siap Uji', 'Prepare Sampel']
const defaultEvaluation = () => ({
  equipment: '',
  personnel: '',
  time: '',
  condition: '',
  subcontract: '',
  method: '',
})

watch(
  () => props.form,
  (val) => {
    if (val && !val.evaluation) {
      val.evaluation = defaultEvaluation()
    }
  },
  { immediate: true }
)

const evaluation = computed(() => {
  if (!props.form.evaluation) {
    props.form.evaluation = defaultEvaluation()
  }
  return props.form.evaluation
})

const evaluationComplete = computed(() => {
  const target = evaluation.value || {}
  return ['equipment', 'personnel', 'time', 'condition', 'subcontract', 'method'].every((field) => {
    const value = target[field]
    if (typeof value === 'string') return value.trim().length > 0
    return Boolean(value)
  })
})

const normalizeMethodLabel = (method) => {
  if (typeof method === 'string') return method.trim()
  if (!method) return ''
  const label =
    method.name ||
    method.MethodName ||
    method.method ||
    method.title ||
    method.label ||
    ''
  return typeof label === 'string' ? label.trim() : String(label).trim()
}

const methodOptions = computed(() => {
  const storeOptions = (storeMethods.value || []).map(normalizeMethodLabel).filter(Boolean)
  if (storeOptions.length) {
    return Array.from(new Set(storeOptions))
  }
  const fallback = (props.tests || [])
    .map((test) => normalizeMethodLabel(test?.method))
    .filter(Boolean)
  return Array.from(new Set(fallback))
})

const testItems = computed(() => {
  const items = props.form.testItems || []
  items.forEach((item) => {
    ensureTestCode(item)
    if (item.sampleNo === undefined || item.sampleNo === null) {
      item.sampleNo = ''
    }
  })
  return items
})
const paymentInfo = computed(() => props.form.paymentInfo || null)

const totalCost = computed(() => {
  if (paymentInfo.value?.total != null) return Number(paymentInfo.value.total) || 0
  return testItems.value.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 1
    return sum + price * qty
  }, 0)
})

const amountPaid = computed(() => Number(paymentInfo.value?.amountPaid) || 0)
const remainingCost = computed(() => {
  if (paymentInfo.value?.outstanding != null) return Number(paymentInfo.value.outstanding) || 0
  return Math.max(totalCost.value - amountPaid.value, 0)
})
const paymentReviewedAt = computed(() => paymentInfo.value?.reviewedAt || null)
const paymentReviewedBy = computed(() => paymentInfo.value?.reviewedBy || '')

const resolveDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const orderYear = computed(() => {
  if (props.form.orderYear) return String(props.form.orderYear)
  const date = resolveDate(props.form.date)
  return date ? String(date.getFullYear()) : ''
})

const formattedOrderNumber = computed(() => {
  const number = props.form.orderNumber
  if (number === null || number === undefined || number === '') return '-'
  if (typeof number === 'number') return String(number).padStart(3, '0')
  const trimmed = String(number).trim()
  return /^\d+$/.test(trimmed) ? trimmed.padStart(3, '0') : trimmed
})


const monthYearLabel = computed(() => {
  const date = resolveDate(props.form.date)
  if (date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }
  const year = orderYear.value || String(new Date().getFullYear())
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${year}`
})

const ensureTestCode = (item) => {
  if (!item) return '--'
  if (item.testCode && item.testCode.trim()) return item.testCode
  if (item.testId) {
    const base = String(item.testId).split('-')[0]

    item.testCode = base
    return base
  }
  return '--'
}

const sampleCode = (item) => {
  const prefix = monthYearLabel.value
  const orderNo = props.form.orderNumber ? String(props.form.orderNumber) : '--'
  const code = ensureTestCode(item)
  const sampleValue = item && item.sampleNo && String(item.sampleNo).trim()
    ? String(item.sampleNo).trim()
    : '--'
  return `${prefix}.${orderNo}/${code}/${sampleValue}`
}

const handleSampleInput = (event, item) => {
  if (!item || !event?.target) return
  const rawValue = String(event.target.value || '')
  const tailSegment = rawValue.split('/').pop()?.trim() || rawValue.trim()
  const digits = tailSegment.replace(/[^0-9]/g, '')
  if (!digits) {
    item.sampleNo = ''
    event.target.value = sampleCode(item)
    return
  }
  item.sampleNo = digits.padStart(3, '0')
  event.target.value = sampleCode(item)
}

const lookupDisabled = computed(() => props.isEditing || !props.form.orderNo || !props.form.orderNo.trim() || props.lookupLoading)

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })

const formatDatetime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>
