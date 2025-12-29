<template>
  <!-- Kartu ringkas untuk KPI/angka dengan ikon dinamis berdasarkan tipe -->
  <div class="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
    <div
      class="flex items-center justify-center w-10 h-10 rounded-full"
      :class="iconBgClass"
    >
      <component :is="icon" class="w-6 h-6 text-white" />
    </div>
    <div class="flex-1">
      <p class="text-sm text-gray-500">{{ label }}</p>
      <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  BeakerIcon,
  CheckBadgeIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  type: { type: String, default: 'default' },
});

// Map the type property to an icon component and background class
// Map a status type to an icon and background colour.  Both
// Indonesian and English keys are supported to maintain
// backwards compatibility.  Feel free to adjust the colours or
// icons here to suit your design.
const iconMap = {
  // English keys
  new: { icon: ClipboardDocumentListIcon, bg: 'bg-info' },
  pending: { icon: ClockIcon, bg: 'bg-warning' },
  testing: { icon: BeakerIcon, bg: 'bg-primary' },
  completed: { icon: CheckBadgeIcon, bg: 'bg-success' },
  // Indonesian keys (legacy)
  baru: { icon: ClipboardDocumentListIcon, bg: 'bg-info' },
  menunggu: { icon: ClockIcon, bg: 'bg-warning' },
  dalam_uji: { icon: BeakerIcon, bg: 'bg-primary' },
  selesai: { icon: CheckBadgeIcon, bg: 'bg-success' },
  default: { icon: ClipboardDocumentListIcon, bg: 'bg-info' },
};

const selected = computed(() => iconMap[props.type] ?? iconMap.default);
const icon = computed(() => selected.value.icon);
const iconBgClass = computed(() => selected.value.bg);
</script>
