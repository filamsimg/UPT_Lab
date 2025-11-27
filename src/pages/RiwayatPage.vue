<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-2">
      <p class="text-sm uppercase tracking-wide text-gray-500">Monitoring</p>
      <h1 class="text-2xl font-semibold text-surfaceDark">Riwayat Aktivitas Sistem</h1>
      <p class="text-sm text-gray-500">
        Lacak status login, pembuatan permintaan, dan update pembayaran terbaru yang terjadi di aplikasi.
      </p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Total Aktivitas</p>
        <p class="mt-2 text-3xl font-semibold text-primaryDark">{{ stats.total }}</p>
        <p class="text-xs text-gray-500">Seluruh event yang tersimpan.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Login</p>
        <p class="mt-2 text-3xl font-semibold text-emerald-600">{{ stats.login }}</p>
        <p class="text-xs text-gray-500">Riwayat pengguna masuk / keluar.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Permintaan</p>
        <p class="mt-2 text-3xl font-semibold text-sky-600">{{ stats.request }}</p>
        <p class="text-xs text-gray-500">Penambahan & perubahan status permintaan.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Pembayaran</p>
        <p class="mt-2 text-3xl font-semibold text-amber-600">{{ stats.payment }}</p>
        <p class="text-xs text-gray-500">Update status pembayaran permintaan.</p>
      </article>
    </section>

    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
            :class="[
              activeFilter === filter.value
                ? 'border-primary bg-primary/10 text-primaryDark'
                : 'border-gray-200 text-gray-600 hover:border-primary/40',
            ]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary/40"
            @click="refreshEvents"
          >
            <ArrowPathIcon class="h-4 w-4" />
            Segarkan
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-danger/30 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10"
            :disabled="!hasEvents"
            @click="clearHistory"
          >
            <TrashIcon class="h-4 w-4" />
            Bersihkan
          </button>
        </div>
      </div>

      <div
        v-if="showErrorBanner"
        class="mx-4 mt-3 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
      >
        <span>
          {{ apiError }}
          · menampilkan data tersimpan. Coba klik Segarkan atau cek backend.
        </span>
        <button
          type="button"
          class="text-xs font-semibold text-amber-800 hover:text-amber-900"
          @click="dismissError"
        >
          Tutup
        </button>
      </div>

      <div v-if="!hasEvents" class="flex flex-col items-center gap-3 px-6 py-16 text-center text-gray-500">
        <ClockIcon class="h-10 w-10 text-gray-400" />
        <p class="text-base font-medium text-gray-700">Belum ada riwayat</p>
        <p class="text-sm max-w-md">
          Aktivitas akan otomatis terekam ketika pengguna login, membuat permintaan, atau memperbarui status pembayaran.
        </p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="group in groupedEvents"
          :key="group.date"
          class="flex flex-col gap-4 px-4 py-6 sm:px-6"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
              {{ group.label }}
            </span>
            <span class="text-xs text-gray-400">{{ group.items.length }} aktivitas</span>
          </div>

          <ol class="relative border-s border-gray-200 pl-6">
            <li
              v-for="event in group.items"
              :key="event.id"
              class="mb-8 last:mb-0"
            >
              <span
                class="absolute -start-1.5 flex h-3 w-3 items-center justify-center rounded-full border bg-white"
                :class="typeConfig[event.type]?.dot"
              ></span>
              <div class="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-surfaceDark">{{ event.title }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="statusClass(event.status)"
                  >
                    {{ statusLabel(event.status) }}
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="typeConfig[event.type]?.badge"
                  >
                    {{ typeConfig[event.type]?.label || 'Sistem' }}
                  </span>
                  <span class="text-xs text-gray-400">{{ formatTime(event.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ event.description }}</p>
                <div v-if="event.referenceId" class="text-xs text-gray-500">
                  Referensi: <span class="font-mono text-gray-700">{{ event.referenceId }}</span>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowPathIcon, ClockIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useActivityStore } from '@/stores/useActivityStore'
import { useConfirmDialog } from '@/stores/useConfirmDialog'

const filters = [
  { value: 'all', label: 'Semua' },
  { value: 'login', label: 'Login' },
  { value: 'request', label: 'Permintaan' },
  { value: 'payment', label: 'Pembayaran' },
]

const typeConfig = {
  login: {
    label: 'Login',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'border-emerald-200 bg-emerald-500/80',
  },
  request: {
    label: 'Permintaan',
    badge: 'bg-sky-100 text-sky-700',
    dot: 'border-sky-200 bg-sky-500/80',
  },
  payment: {
    label: 'Pembayaran',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'border-amber-200 bg-amber-500/80',
  },
  system: {
    label: 'Sistem',
    badge: 'bg-gray-100 text-gray-600',
    dot: 'border-gray-200 bg-gray-400/80',
  },
}

const activityStore = useActivityStore()
const openConfirm = useConfirmDialog()
const activeFilter = ref('all')
const errorDismissed = ref(false)

onMounted(async () => {
  activityStore.hydrate()
  await activityStore.fetchImportant?.({
    perPage: 50,
    include: ['causer', 'subject'],
  })
})

const stats = computed(() => activityStore.stats)
const apiError = computed(() => activityStore.apiError)
const showErrorBanner = computed(() => apiError.value && !errorDismissed.value)

const hasEvents = computed(() => activityStore.events.length > 0)

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return activityStore.events
  return activityStore.events.filter((event) => event.type === activeFilter.value)
})

const groupedEvents = computed(() => {
  const map = new Map()
  filteredEvents.value.forEach((event) => {
    const key = formatDateKey(event.createdAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(event)
  })

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      label: formatReadableDate(date),
      items: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    }))
})

async function refreshEvents() {
  errorDismissed.value = false
  await activityStore.fetchImportant?.({
    perPage: 50,
    include: ['causer', 'subject'],
  })
  if (!activityStore.events.length) {
    activityStore.hydrate()
  }
}

function dismissError() {
  errorDismissed.value = true
}

async function clearHistory() {
  if (!hasEvents.value) return
  const ok = await openConfirm({
    title: 'Hapus riwayat?',
    message: 'Semua aktivitas yang tersimpan akan dihapus permanen.',
    confirmLabel: 'Hapus',
    variant: 'danger',
  })
  if (ok) activityStore.clear()
}

function statusClass(status) {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700'
    case 'warning':
      return 'bg-amber-100 text-amber-700'
    case 'error':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function statusLabel(status) {
  if (status === 'success') return 'Berhasil'
  if (status === 'warning') return 'Perlu Tinjauan'
  if (status === 'error') return 'Gagal'
  return 'Info'
}

function formatDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'invalid'
  return date.toISOString().slice(0, 10)
}

function formatReadableDate(value) {
  if (value === 'invalid') return 'Tanggal tidak valid'
  const date = new Date(value)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(date)
}

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}
</script>
