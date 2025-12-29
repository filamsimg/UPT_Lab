<template>
  <!-- Row helper untuk label + kontrol form agar konsisten di layout -->
  <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
    <label :for="forId" class="sm:w-48 text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  forId: { type: String, default: undefined },
});
</script>
