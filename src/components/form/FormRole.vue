<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-700">Nama Role</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
        placeholder="cth. Supervisor Lab"
      />
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Permission</label>
        <button
          v-if="form.permissions.length && permissionOptions.length"
          type="button"
          class="text-xs font-semibold text-primary hover:text-primaryDark"
          @click="selectAll(false)"
        >
          Bersihkan
        </button>
      </div>

      <div
        v-if="permissionOptions.length"
        class="max-h-56 space-y-3 overflow-y-auto rounded-md border border-gray-200 p-3"
      >
        <div
          v-for="group in groupedPermissions"
          :key="group.category"
          class="space-y-2"
        >
          <div class="flex items-center justify-between">
            <h4
              class="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {{ group.categoryLabel }}
            </h4>
            <button
              type="button"
              class="text-xs font-medium text-primary hover:text-primaryDark"
              @click="toggleGroupSelection(group.permissionIds)"
            >
              {{
                isGroupFullyChecked(group.permissionIds)
                  ? 'Batalkan'
                  : 'Pilih Semua'
              }}
            </button>
          </div>
          <div
            class="space-y-1 rounded-md border border-gray-100 bg-gray-50 p-2"
          >
            <label
              v-for="permission in group.items"
              :key="permission.id"
              class="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 text-sm hover:bg-white"
            >
              <input
                v-model="form.permissions"
                type="checkbox"
                :value="permission.id"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
              />
              <span class="flex-1">
                <span class="font-medium text-gray-700">{{
                  permission.name
                }}</span>
                <span
                  v-if="permission.description"
                  class="block text-xs text-gray-500"
                >
                  {{ permission.description }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">
        Belum ada data permission. Silakan tambahkan permission baru terlebih
        dahulu.
      </p>
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
        :disabled="loading || !form.name"
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
        <span>{{ isEdit ? 'Simpan Perubahan' : 'Tambah Role' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const props = defineProps({
  modelValue: { type: Object, default: () => null },
  permissionOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const form = reactive({
  name: '',
  description: '',
  permissions: [],
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      form.name = '';
      form.description = '';
      form.permissions = [];
      return;
    }
    form.name = value.name || '';
    form.description = value.description || '';
    form.permissions = Array.isArray(value.permissions)
      ? value.permissions.map((permission) => permission.id)
      : [];
  },
  { immediate: true }
);

const groupedPermissions = computed(() => {
  if (!props.permissionOptions.length) return [];
  const groups = new Map();

  props.permissionOptions.forEach((permission) => {
    const category = permission.category || 'general';
    if (!groups.has(category)) {
      groups.set(category, { category, items: [] });
    }
    groups.get(category).items.push(permission);
  });

  return Array.from(groups.values()).map((group) => ({
    category: group.category,
    categoryLabel: group.category
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    items: group.items,
    permissionIds: group.items.map((item) => item.id),
  }));
});

function selectAll(state) {
  if (!state) {
    form.permissions = [];
    return;
  }
  form.permissions = props.permissionOptions.map((permission) => permission.id);
}

function toggleGroupSelection(permissionIds) {
  const allSelected = isGroupFullyChecked(permissionIds);
  if (allSelected) {
    form.permissions = form.permissions.filter(
      (id) => !permissionIds.includes(id)
    );
    return;
  }
  const set = new Set(form.permissions);
  permissionIds.forEach((id) => set.add(id));
  form.permissions = Array.from(set);
}

function isGroupFullyChecked(permissionIds) {
  return permissionIds.every((id) => form.permissions.includes(id));
}

async function handleSubmit() {
  if (!form.name) return;
  const confirmed = await openConfirm({
    title: props.isEdit ? 'Simpan perubahan role?' : 'Tambah role baru?',
    message: 'Pastikan daftar permission sudah sesuai sebelum melanjutkan.',
    confirmLabel: props.isEdit ? 'Simpan' : 'Tambah',
  });
  if (!confirmed) return;
  const lockedSuperAdmin =
    normalizeRoleKey(props.modelValue?.slug || props.modelValue?.code || props.modelValue?.name) === 'super_admin';
  const rawName = props.modelValue?.name || form.name;
  emit('submit', {
    name: lockedSuperAdmin ? rawName : formatRoleName(form.name),
    description: form.description?.trim() || undefined,
    permission_ids: form.permissions,
  });
}

function normalizeRoleKey(value = '') {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function formatRoleName(raw = '') {
  const normalized = String(raw || '')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .toLowerCase();
  if (!normalized) return '';
  return normalized
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
</script>

