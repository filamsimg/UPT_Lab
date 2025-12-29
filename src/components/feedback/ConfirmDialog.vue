<template>
  <!-- Dialog konfirmasi reusable; di-trigger via useConfirmDialog -->
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
      @click.self="$emit('cancel')"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-surfaceDark">
            {{ title }}
          </h3>
          <p v-if="message" class="text-sm text-gray-600">
            {{ message }}
          </p>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
            @click="$emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="w-full rounded-md px-4 py-2 text-sm font-semibold text-white transition sm:w-auto"
            :class="confirmClass"
            @click="$emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Ya' },
  cancelLabel: { type: String, default: 'Batal' },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger'].includes(value),
  },
});

const confirmClass = computed(() => {
  if (props.variant === 'danger') {
    return 'bg-danger hover:bg-danger/90';
  }
  return 'bg-gradient-to-r from-primaryLight to-primaryDark hover:opacity-90';
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
