<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
  >
    <div
      class="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
    >
      <div class="mb-5 flex items-center justify-between border-b pb-2">
        <h3 class="text-xl font-semibold text-primaryDark">{{ title }}</h3>
        <button
          class="text-gray-400 transition hover:text-gray-700"
          type="button"
          @click="$emit('close')"
        >
          <span class="sr-only">Tutup</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">{{ nameLabel }}</label>
          <input
            v-model="form.name"
            :disabled="isSubmitting"
            :placeholder="namePlaceholder"
            class="rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-primaryLight focus:ring-2 focus:ring-primaryLight disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">{{ descriptionLabel }}</label>
          <textarea
            v-model="form.description"
            :disabled="isSubmitting"
            :placeholder="descriptionPlaceholder"
            rows="3"
            class="rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-primaryLight focus:ring-2 focus:ring-primaryLight disabled:cursor-not-allowed disabled:bg-gray-100"
          ></textarea>
        </div>

        <div class="flex justify-end border-t pt-2">
          <button
            :disabled="isSubmitting"
            type="submit"
            class="rounded-lg bg-gradient-to-r from-primaryLight to-primaryDark px-4 py-2 text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Tambah Data' },
  nameLabel: { type: String, default: 'Nama' },
  namePlaceholder: { type: String, default: '' },
  descriptionLabel: { type: String, default: 'Deskripsi' },
  descriptionPlaceholder: { type: String, default: '' },
  submitLabel: { type: String, default: 'Tambah' },
  submitAction: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  initialValue: { type: Object, default: null },
  resetOnSuccess: { type: Boolean, default: true },
  closeOnSuccess: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const form = reactive({
  name: '',
  description: '',
})
const submitting = ref(false)
const isSubmitting = computed(() => props.loading || submitting.value)

async function handleSubmit() {
  const name = toCleanString(form.name)
  if (!name) {
    alert('Nama wajib diisi.')
    return
  }
  const description = toCleanString(form.description)
  if (typeof props.submitAction !== 'function') return

  submitting.value = true
  try {
    const result = await props.submitAction({ name, description })
    if (result && result.ok === false) {
      alert(result.error || 'Gagal menyimpan data.')
      return
    }
    if (props.closeOnSuccess) {
      emit('close')
      return
    }
    if (props.resetOnSuccess) {
      form.name = ''
      form.description = ''
    }
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || 'Gagal menyimpan data.'
    alert(message)
  } finally {
    submitting.value = false
  }
}

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function applyInitialValue(value) {
  form.name = toCleanString(value?.name || value?.title || '')
  form.description = toCleanString(value?.description || '')
}

watch(
  () => props.initialValue,
  (value) => {
    applyInitialValue(value)
  },
  { immediate: true }
)
</script>
