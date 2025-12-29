<template>
  <!-- Badge status permintaan/order dengan warna konsisten -->
  <span class="badge" :class="badgeClass">
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const statusMap = {
  draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    ring: 'ring-slate-300',
    label: 'Draft',
  },
  awaiting_review: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    ring: 'ring-cyan-200',
    label: 'Menunggu Kaji Ulang',
  },
  awaiting_payment: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    ring: 'ring-amber-200',
    label: 'Menunggu Pembayaran',
  },
  payment_submitted: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-200',
    label: 'Bukti Pembayaran Dikirim',
  },
  payment_rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-200',
    label: 'Pembayaran Ditolak',
  },
  payment_approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    label: 'Pembayaran Disetujui',
  },
  testing: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-200',
    label: 'Proses Pengujian',
  },
  completed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    ring: 'ring-teal-200',
    label: 'Selesai',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
    label: 'Ditolak',
  },
  refunded: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    ring: 'ring-violet-200',
    label: 'Refund',
  },
  cancelled: {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    ring: 'ring-stone-200',
    label: 'Dibatalkan',
  },
}

const badge = computed(() => {
  const found = statusMap[props.status]
  if (found) return found
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    ring: 'ring-slate-200',
    label: props.status || '-',
  }
})

const badgeClass = computed(
  () => `${badge.value.bg} ${badge.value.text} ring-1 ring-inset ${badge.value.ring}`
)
const text = computed(() => badge.value.label)
</script>

<style scoped>
.badge {
  @apply inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold leading-tight shadow-[0_1px_2px_rgba(0,0,0,0.08)] whitespace-normal break-words text-center;
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .badge {
    @apply w-auto max-w-full;
  }
}
</style>
