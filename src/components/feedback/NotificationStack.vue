<template>
  <transition-group
    tag="div"
    name="toast"
    class="pointer-events-none fixed inset-x-0 top-16 sm:top-18 z-[1100] flex flex-col items-center gap-3 px-4 sm:items-end"
  >
    <article
      v-for="item in items"
      :key="item.id"
      class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5"
    >
      <div :class="['h-1 w-full', toneAccent(item.tone)]" />
      <div class="flex gap-3 p-4">
        <div
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-xl text-white',
            toneBadge(item.tone),
          ]"
        >
          <component :is="toneIcon(item.tone)" class="h-5 w-5" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-surfaceDark">
            {{ item.title }}
          </p>
          <p class="mt-1 text-xs text-gray-600">
            {{ item.message }}
          </p>
        </div>
        <button
          class="text-gray-400 transition hover:text-gray-600"
          @click="$emit('dismiss', item.id)"
        >
          <span class="sr-only">Tutup</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </article>
  </transition-group>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/solid';

const props = defineProps({
  items: { type: Array, default: () => [] },
});

defineEmits(['dismiss']);

function toneAccent(tone) {
  switch (tone) {
    case 'success':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-400';
    case 'error':
      return 'bg-rose-500';
    default:
      return 'bg-sky-500';
  }
}

function toneBadge(tone) {
  switch (tone) {
    case 'success':
      return 'bg-emerald-500/20 text-emerald-600';
    case 'warning':
      return 'bg-amber-400/20 text-amber-500';
    case 'error':
      return 'bg-rose-500/20 text-rose-500';
    default:
      return 'bg-sky-500/20 text-sky-500';
  }
}

function toneIcon(tone) {
  switch (tone) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'error':
      return XCircleIcon;
    default:
      return InformationCircleIcon;
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
</style>
