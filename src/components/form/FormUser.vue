<template>
  <!-- Form user: tambah/ubah akun, assign role, dan status aktif -->
  <div class="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          v-model="form.name"
          type="text"
          required
          autocomplete="name"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="Nama lengkap pengguna"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="email@uptlab.id"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">
          Password
          <span v-if="isEdit" class="text-xs font-normal text-gray-500">
            (kosongkan jika tidak diganti)
          </span>
        </label>
        <input
          v-model="form.password"
          :required="!isEdit"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="Minimal 8 karakter"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">No. Telepon</label>
        <input
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="0812-3456-7890"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">NIP</label>
        <input
          v-model="form.employmentIdentityNumber"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="6404646066XXXXXX"
        />
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <label class="text-sm font-medium text-gray-700">Role</label>
      <div
        v-if="roles.length"
        class="grid grid-cols-1 gap-2 md:grid-cols-2"
      >
        <label
          v-for="role in roles"
          :key="role.id"
          class="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-primary/50"
        >
          <input
            v-model="form.roles"
            type="checkbox"
            :value="role.id"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
          />
          <span>{{ role.name }}</span>
        </label>
      </div>
      <p v-else class="text-sm text-gray-500">
        Belum ada data role. Tambahkan role terlebih dahulu di halaman Role Management.
      </p>
    </div>

    <div class="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <div>
        <p class="text-sm font-medium text-gray-700">Status Akun</p>
        <p class="text-xs text-gray-500">Nonaktifkan pengguna untuk menghentikan akses login.</p>
      </div>
      <label class="relative inline-flex cursor-pointer items-center">
        <input
          v-model="form.isActive"
          type="checkbox"
          class="peer sr-only"
        />
        <div
          class="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40"
        ></div>
        <div
          class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"
        ></div>
      </label>
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
        <span>{{ isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna' }}</span>
      </button>
    </div>
  </form>
  </div>
</template>

<script setup>
  import { computed, reactive, watch } from 'vue';
  import { useConfirmDialog } from '@/stores/useConfirmDialog';
  
  // Form user: tambah/ubah akun, assign role, dan toggle aktif
  const props = defineProps({
  modelValue: { type: Object, default: () => null },
  roles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  employmentIdentityNumber: '',
  roles: [],
  isActive: true,
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      form.name = '';
      form.email = '';
      form.password = '';
      form.phone = '';
      form.employmentIdentityNumber = '';
      form.roles = [];
      form.isActive = true;
      return;
    }

    form.name = value.name || '';
    form.email = value.email || '';
    form.password = '';
    form.phone = value.phone || value.phone_number || '';
    form.employmentIdentityNumber =
      value.employmentIdentityNumber || value.employment_identity_number || '';
    form.roles = Array.isArray(value.roles) ? value.roles.map((role) => role.id) : [];
    form.isActive = value.isActive ?? true;
  },
  { immediate: true }
);

const canSubmit = computed(() => {
  // Validasi minimal nama+email; password wajib saat create
  if (!form.name || !form.email) return false;
  if (!props.isEdit && !form.password) return false;
  return true;
});

async function handleSubmit() {
  // Konfirmasi saat edit; emit payload bersih
  if (!canSubmit.value) return;
  const confirmed = await openConfirm({
    title: props.isEdit ? 'Simpan perubahan pengguna?' : 'Tambah pengguna baru?',
    message: 'Pastikan seluruh informasi pengguna sudah benar sebelum melanjutkan.',
    confirmLabel: props.isEdit ? 'Simpan' : 'Tambah',
  });
  if (!confirmed) return;
  const name = form.name.trim();
  const email = form.email.trim();
  const password = form.password || undefined;
  const phoneNumber = form.phone?.trim() || undefined;
  const employmentIdentityNumber = form.employmentIdentityNumber?.trim() || undefined;
  const roleIds = Array.isArray(form.roles) ? [...form.roles] : [];

  emit('submit', {
    name,
    email,
    password,
    phone: phoneNumber,
    phone_number: phoneNumber,
    employment_identity_number: employmentIdentityNumber,
    employmentIdentityNumber,
    roles: roleIds,
    role_ids: roleIds,
    isActive: form.isActive,
    is_active: form.isActive,
  });
}
</script>

