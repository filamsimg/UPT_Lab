<template>
  <!-- Banner notifikasi inline (info/success/error) -->
  <div :class="['rounded-xl px-4 py-3 text-sm font-medium', toneClass]">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tone: {
    type: String,
    default: 'info',
  },
});

const toneClass = computed(() => {
  switch (props.tone) {
    case 'error':
      return 'bg-red-50 border border-red-200 text-red-600';
    case 'success':
      return 'bg-green-50 border border-green-200 text-green-600';
    default:
      return 'bg-primaryLight/10 border border-primaryLight/30 text-primaryDark';
  }
});
</script>
