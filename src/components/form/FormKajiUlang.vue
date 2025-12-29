<template>
  <!-- Form kaji ulang: lookup order, isi evaluasi, tanda tangan, dan simpan -->
  <div class="flex min-h-screen w-full flex-col bg-slate-50">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Form Kaji Ulang</p>
          <h1 class="text-2xl font-semibold text-slate-900 md:text-3xl">
            {{ isEditing ? 'Ubah Data Kaji Ulang' : 'Tambah Kaji Ulang' }}
          </h1>
          <p class="text-sm text-slate-500">
            Isi evaluasi kaji ulang untuk permintaan dengan status menunggu kaji ulang (awaiting_review).
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
            Masukkan ID order dari permintaan yang ingin dikaji ulang.
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
                {{ displayOrderCode }}
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
          <p class="text-xs text-slate-500">Nomor sampel mengikuti backend dan ditampilkan sebagai referensi.</p>
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
                  <th class="px-4 py-3 text-right font-semibold">Line Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
                <tr v-for="(item, index) in testItems" :key="`uji-${index}`">
                  <td class="px-4 py-3">{{ index + 1 }}</td>
                  <td class="px-4 py-3">{{ resolveTestName(item) || '-' }}</td>
                  <td class="px-4 py-3">
                    <input
                      :value="sampleDisplay(item)"
                      type="text"
                      readonly
                      placeholder="-"
                      class="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-sm text-slate-700"
                    />
                  </td>
                  <td class="px-4 py-3">{{ item.objectName || '-' }}</td>
                  <td class="px-4 py-3 text-right">Rp {{ formatCurrency(item.price) }}</td>
                  <td class="px-4 py-3 text-right">{{ item.quantity || 1 }}</td>
                  <td class="px-4 py-3 text-right">
                    Rp {{ formatCurrency(lineSubtotal(item)) }}
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
                <span class="text-xs text-slate-400">Line Total Rp {{ formatCurrency(lineSubtotal(item)) }}</span>
              </div>
              <p class="text-base font-semibold text-slate-900">{{ resolveTestName(item) || '-' }}</p>
              <p class="text-xs text-slate-500">{{ item.objectName || '-' }}</p>
              <div class="mt-3 flex flex-col gap-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">No Sampel</label>
                <input
                  :value="sampleDisplay(item)"
                  type="text"
                  readonly
                  placeholder="-"
                  class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
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
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Evaluasi Kaji Ulang</h2>
          <p class="text-xs text-slate-500">
            Lengkapi ketersediaan peralatan, personel, waktu, kondisi, dan lab subkontrak per pengujian.
          </p>
        </div>

        <div v-if="testItems.length" class="space-y-3">
          <div
            v-for="(item, idx) in testItems"
            :key="`evaluation-${idx}`"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
          >
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ resolveTestName(item) || `Pengujian ${idx + 1}` }}</p>
                <p class="text-xs text-slate-500">Sampel: {{ item.objectName || sampleDisplay(item) || '-' }}</p>
              </div>
              <div class="text-xs text-slate-500 flex flex-col items-start sm:items-end">
                <span class="font-semibold text-slate-700">No Sampel: {{ sampleDisplay(item) }}</span>
                <span>Metode: {{ resolveMethod(item) }}</span>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Peralatan</label>
                <select
                  v-model="item.evaluation.is_equipment_available"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option :value="null">Pilih hasil</option>
                  <option :value="true">Ada</option>
                  <option :value="false">Tidak Ada</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Personel</label>
                <select
                  v-model="item.evaluation.is_personnel_available"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option :value="null">Pilih hasil</option>
                  <option :value="true">Ada</option>
                  <option :value="false">Tidak Ada</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Waktu</label>
                <select
                  v-model="item.evaluation.is_time_available"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option :value="null">Pilih hasil</option>
                  <option :value="true">Cukup</option>
                  <option :value="false">Tidak Cukup</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Kondisi Sampel</label>
                <select
                  v-model="item.evaluation.is_test_ready"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option :value="null">Pilih hasil</option>
                  <option :value="true">Siap Uji</option>
                  <option :value="false">Prepare Sampel</option>
                </select>
              </div>
              <div class="flex flex-col gap-1 sm:col-span-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Laboratorium Subkontrak</label>
                <select
                  v-model="item.evaluation.is_subcontract_lab_available"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option :value="null">Pilih hasil</option>
                  <option :value="true">Ada</option>
                  <option :value="false">Tidak Ada</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Data pengujian akan tampil setelah ID order ditemukan.
        </p>
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
            Lengkapi evaluasi untuk semua pengujian terlebih dahulu.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Hitung kelengkapan evaluasi per pengujian serta format ringkasan order/pembayaran
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

const evaluationFields = [
// Field evaluasi yang wajib diisi per item
  'is_equipment_available',
  'is_personnel_available',
  'is_time_available',
  'is_test_ready',
  'is_subcontract_lab_available',
]

const evaluationComplete = computed(() => {
 // True jika semua evaluasi terisi
  const items = props.form.testItems || []
  if (!items.length) return false
  return items.every((item) => {
    const ev = item.evaluation || {}
    return evaluationFields.every((field) => ev[field] === true || ev[field] === false)
  })
})

const testItems = computed(() => {
 // Pastikan setiap item punya evaluation object & default
  const items = props.form.testItems || []
  items.forEach((item) => {
    if (item.sampleNo === undefined || item.sampleNo === null) {
      item.sampleNo = ''
    }
    if (!item.evaluation || typeof item.evaluation !== 'object') {
      item.evaluation = {}
    }
    evaluationFields.forEach((field) => {
      if (item.evaluation[field] === undefined) {
        item.evaluation[field] = null
      }
    })
  })
  return items
})
const paymentInfo = computed(() => props.form.paymentInfo || null)
 // Ambil payment info jika ada

const totalCost = computed(() => {
 // Hitung total biaya dari paymentInfo atau akumulasi item
  if (paymentInfo.value?.total != null) return Number(paymentInfo.value.total) || 0
  return testItems.value.reduce((sum, item) => sum + lineSubtotal(item), 0)
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
 // Format nomor urut 3 digit jika numeric
  const number = props.form.orderNumber
  if (number === null || number === undefined || number === '') return '-'
  if (typeof number === 'number') return String(number).padStart(3, '0')
  const trimmed = String(number).trim()
  return /^\d+$/.test(trimmed) ? trimmed.padStart(3, '0') : trimmed
})

const displayOrderCode = computed(() => {
  const candidate =
    props.form.orderCode ||
    props.form.orderDisplay ||
    props.form.number ||
    props.form.orderNumber

  if (candidate === null || candidate === undefined || candidate === '') {
    return formattedOrderNumber.value
  }

  const asText = String(candidate).trim()
  return asText || formattedOrderNumber.value
})

function sampleDisplay(item) {
 // Normalisasi label nomor sampel
  if (!item) return '-'
  const candidate =
    item.sampleCode ||
    item.sample_number ||
    item.sampleNumber ||
    item.sampleNo ||
    ''
  const normalized = String(candidate || '').trim()
  return normalized || '-'
}

const lineSubtotal = (item) => {
 // Nilai total per item
  const direct =
    item.lineTotal ??
    item.line_total ??
    (Number(item.price) || 0) * (Number(item.quantity) || 1)
  return Math.max(0, Number(direct) || 0)
}

const lookupDisabled = computed(() => props.isEditing || !props.form.orderNo || !props.form.orderNo.trim() || props.lookupLoading)
 // Disable lookup ketika editing atau input kosong

const resolveMethod = (item) => {
 // Ambil nama metode uji
  if (!item) return '-'
  const method =
    item.method_name ||
    item.methodName ||
    item.method?.name ||
    item.method ||
    ''
  const text = String(method || '').trim()
  return text || '-'
}

const sanitizeTestName = (value) => {
  if (!value) return ''
  const normalized = String(value).trim()
  if (!normalized) return ''
  const lower = normalized.toLowerCase()
  if (['pengujian', 'testing', 'machining'].includes(lower)) return ''
  return normalized
}

const resolveTestName = (item) => {
  if (!item) return ''
  const direct =
    sanitizeTestName(item.testName) ||
    sanitizeTestName(item.test_name) ||
    sanitizeTestName(item.name) ||
    sanitizeTestName(item.service?.test_name) ||
    sanitizeTestName(item.service?.testName) ||
    sanitizeTestName(item.service?.name)
  if (direct) return direct

  const testId = item.serviceId || item.service_id || item.testId || item.id
  if (testId && Array.isArray(props.tests)) {
    const test = props.tests.find((entry) => entry.id === testId)
    if (test) {
      const fromStore =
        sanitizeTestName(test.name) ||
        sanitizeTestName(test.testName) ||
        sanitizeTestName(test.test_name) ||
        sanitizeTestName(test.code)
      if (fromStore) return fromStore
    }
  }

  return sanitizeTestName(item.testCategory || item.test_category)
}

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
