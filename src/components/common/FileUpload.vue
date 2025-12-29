<template>
  <!-- Input upload sederhana dengan preview list dan aksi hapus per file -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <input
      type="file"
      multiple
      @change="onFilesSelected"
      class="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
    />
    <ul class="mt-2 space-y-2">
      <li
        v-for="(file, index) in files"
        :key="index"
        class="flex justify-between items-center bg-white border border-gray-200 rounded p-2"
      >
        <span class="text-sm text-gray-700">{{ file.name }}</span>
        <button
          type="button"
          class="text-danger text-xs hover:underline"
          @click="removeFile(index)"
        >
          Hapus
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  label: { type: String, default: 'Upload File' },
  modelValue: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue']);

const files = ref([]);

function onFilesSelected(event) {
  const selected = Array.from(event.target.files);
  files.value = [...files.value, ...selected];
  emit('update:modelValue', files.value);
}

function removeFile(index) {
  files.value.splice(index, 1);
  emit('update:modelValue', files.value);
}
</script>
