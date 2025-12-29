<template>
  <!-- Form permission: tambah/ubah permission dan deskripsi -->
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div v-if="form.id" class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-700">ID Permission</label>
      <input
        :value="form.id"
        type="text"
        readonly
        class="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-mono text-gray-700 focus:outline-none"
      />
      <p class="text-xs text-gray-500">
        ID disediakan oleh sistem backend dan tidak dapat diubah dari sini.
      </p>
    </div>
    <div v-else class="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
      ID permission akan dihasilkan otomatis oleh backend setelah data disimpan.
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-700">Nama Permission</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
        placeholder="cth. Kelola Pengguna"
      />
    </div>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
        @click="$emit('cancel')"
      >
        Batal
      </button>
      <button
        type="submit"
        :disabled="loading || !canSubmit"
        class="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <svg
          v-if="loading"
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
          ></path>
        </svg>
        <span>{{ isEdit ? 'Simpan Perubahan' : 'Tambah Permission' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
  import { computed, reactive, watch } from 'vue';
  import { useConfirmDialog } from '@/stores/useConfirmDialog';
  
  // Form permission: input nama, slug, deskripsi dan konfirmasi simpan
  const props = defineProps({
  modelValue: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const form = reactive({
  id: '',
  name: '',
  description: '',
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      form.id = '';
      form.name = '';
      form.description = '';
      return;
    }
    form.id = value.id || value.identifier || '';
    form.name = value.name || '';
    form.description = value.description || '';
  },
  { immediate: true }
);

const canSubmit = computed(() => Boolean(form.name));

async function handleSubmit() {
  if (!canSubmit.value) return;
  const confirmed = await openConfirm({
    title: props.isEdit ? 'Simpan perubahan permission?' : 'Tambah permission baru?',
    message: 'Pastikan nama permission sudah sesuai standar penamaan.',
    confirmLabel: props.isEdit ? 'Simpan' : 'Tambah',
  });
  if (!confirmed) return;
  const payload = {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
  };
  emit('submit', payload);
}
</script>

