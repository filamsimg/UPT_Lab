<template>
  <div class="space-y-5">
    <div
      v-if="!canViewRoles"
      class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
    >
      <p class="text-base font-semibold">Akses ditolak</p>
      <p class="mt-1">
        Anda tidak memiliki izin roles.index sehingga halaman manajemen role tidak tersedia.
      </p>
    </div>

    <template v-else>
      <header
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
      <div>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
          Manajemen Role
        </h2>
        <p class="text-sm text-gray-500">
          Kelompokkan akses pengguna dengan role dan permission yang fleksibel.
        </p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        <button
          class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
          @click="refreshRoles"
        >
          <ArrowPathIcon
            :class="[
              'h-5 w-5',
              roleStore.loading ? 'animate-spin text-primary' : 'text-gray-500',
            ]"
          />
          Muat Ulang
        </button>
        <button
          v-if="canCreateRole"
          class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          @click="openCreateForm"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Role
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Total Role</p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ roleStore.pagination.totalItems }}
        </p>
        <p class="text-xs text-gray-400">Jumlah role terdaftar di sistem.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Permission Terdaftar
        </p>
        <p class="mt-2 text-2xl font-semibold text-primaryDark">
          {{ permissionOptions.length }}
        </p>
        <p class="text-xs text-gray-400">
          Gunakan permission untuk membatasi akses.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Role Populer</p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ topRoleLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Role dengan jumlah pengguna terbanyak.
        </p>
      </article>
    </section>

    <section
      class="rounded-xl border border-gray-200 bg-white shadow-sm px-3 sm:px-4"
    >
      <div
        class="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon
              class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari role berdasarkan nama..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
        <div class="flex flex-col items-start text-xs sm:items-end">
          <p v-if="roleStore.error" class="text-red-500">
            {{ roleStore.error }}
          </p>
          <p v-else-if="defaultSuccess" class="text-emerald-600">
            {{ defaultSuccess }}
          </p>
          <p v-else-if="defaultWarning" class="text-amber-600">
            {{ defaultWarning }}
          </p>
        </div>
      </div>

      <div
        v-if="roleStore.loading"
        class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500"
      >
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data role...
      </div>
      <div v-else class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :rows="rows"
          :searchable="false"
          :filterable="false"
          :showPagination="false"
          :no-data-text="noDataText"
        >
          <template #roleName="{ row }">
            <span class="text-sm font-semibold text-surfaceDark">
              {{ formatRoleLabel(row.name) }}
            </span>
          </template>
          <template #permissions="{ row }">
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="permission in limitedPermissions(row.permissions)"
                :key="permission.id"
                class="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
              >
                {{ permission.name }}
              </span>
              <span
                v-if="row.permissionCount > maxPermissionChip"
                class="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600"
              >
                +{{ row.permissionCount - maxPermissionChip }} lagi
              </span>
              <span v-if="!row.permissionCount" class="text-xs text-gray-400"
                >Belum ada permission</span
              >
            </div>
          </template>
          <template #defaultStatus="{ row }">
            <span
              v-if="row.isDefault"
              class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              Default
            </span>
            <button
              v-else-if="canSetDefault(row)"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5 transition"
              :disabled="roleStore.saving"
              @click="handleSetDefault(row)"
            >
              Jadikan default
            </button>
            <span
              v-else
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500"
            >
              <span class="h-2 w-2 rounded-full bg-gray-300"></span>
              Tidak didukung
            </span>
          </template>

          <template #timeline="{ row }">
            <div class="space-y-1 text-xs text-gray-600">
              <p>
                Dibuat:
                <span class="font-medium text-gray-700">
                  {{ formatDate(row.createdAt) }}
                </span>
              </p>
              <p>
                Diperbarui:
                <span class="font-medium text-gray-700">
                  {{ formatDate(row.updatedAt) }}
                </span>
              </p>
            </div>
          </template>

          <template #actions="{ row }">
            <div class="flex gap-3">
              <button
                v-if="canUpdateRole"
                class="rounded-md inline-flex items-center gap-1 p-1.5 text-primary transition hover:bg-primary/10"
                title="Edit role"
                @click="openEditForm(row)"
              >
                <PencilSquareIcon class="h-4 w-4" />
                Edit
              </button>
              <button
                v-if="canDeleteRole"
                class="rounded-md inline-flex items-center gap-1 p-1.5 text-danger transition hover:bg-danger/10"
                title="Hapus role"
                @click="handleDelete(row)"
              >
                <TrashIcon class="h-4 w-4" />
                Hapus
              </button>
            </div>
          </template>
        </DataTable>

        <div
          class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600"
        >
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <span>Tampilkan</span>
              <select
                v-model.number="perPageSelection"
                class="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                @change="changePerPage(perPageSelection)"
              >
                <option
                  v-for="option in perPageOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
              <span>baris</span>
            </label>
            <p class="text-sm text-gray-500">
              Menampilkan
              <span class="font-medium text-gray-700">{{ startEntry }}</span>
              -
              <span class="font-medium text-gray-700">{{ endEntry }}</span>
              dari
              <span class="font-medium text-gray-700">{{ totalItems }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!roleStore.pagination.hasPrevPage"
              @click="changePage(roleStore.pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <span class="text-sm text-gray-500">
              Halaman
              <span class="font-semibold text-gray-800">{{ roleStore.pagination.currentPage }}</span>
              dari
              <span class="font-semibold text-gray-800">{{ roleStore.pagination.lastPage }}</span>
            </span>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!roleStore.pagination.hasNextPage"
              @click="changePage(roleStore.pagination.currentPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </section>

    <transition name="fade">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      >
        <div
          class="relative w-[95%] md:w-[600px] rounded-2xl bg-white p-4 shadow-xl"
        >
          <button
            class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
            @click="closeForm"
          >
            <span class="sr-only">Tutup</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h3 class="mb-4 text-lg font-semibold text-surfaceDark">
            {{ isEdit ? 'Edit Role' : 'Tambah Role' }}
          </h3>
          <FormRole
            :model-value="selectedRole"
            :permission-options="permissionOptions"
            :loading="roleStore.saving"
            :is-edit="isEdit"
            @cancel="closeForm"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </transition>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import DataTable from '@/components/common/DataTable.vue';
import FormRole from '@/components/form/FormRole.vue';
import { useRoleStore } from '@/stores/useRoleStore';
import { usePermissionStore } from '@/stores/usePermissionStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { useAuthorization } from '@/composables/auth/useAuthorization';

const roleStore = useRoleStore();
const permissionStore = usePermissionStore();
const openConfirm = useConfirmDialog();
const { notify } = useNotificationCenter();
const { hasPermission } = useAuthorization();

const canViewRoles = computed(() => hasPermission('roles.index'));
const canCreateRole = computed(() => hasPermission('roles.store'));
const canUpdateRole = computed(() => hasPermission('roles.update'));
const canDeleteRole = computed(() => hasPermission('roles.destroy'));

const columns = [
  { field: 'name', title: 'Nama Role', slotName: 'roleName' },
  
  { field: 'permissions', title: 'Permission', slotName: 'permissions' },
  {
    field: 'default',
    title: 'Default',
    slotName: 'defaultStatus',
    className: 'w-32 text-left',
  },
  { field: 'timeline', title: 'Riwayat', slotName: 'timeline' },
  {
    field: 'actions',
    title: 'Aksi',
    slotName: 'actions',
    className: 'text-left',
  },
];

const searchTerm = ref('');
const showForm = ref(false);
const selectedRole = ref(null);
const isEdit = ref(false);
const initialized = ref(false);
const maxPermissionChip = 3;
let debounceTimer = null;
const defaultWarning = ref('');
const defaultSuccess = ref('');
const DEFAULT_ELIGIBLE_NAMES = ['customer'];
const perPageOptions = [10, 25, 50, 100];
const perPageSelection = ref(roleStore.pagination?.perPage || perPageOptions[0]);

function clearActionMessage() {}

const rows = computed(() => roleStore.roles);
const currentDefaultRole = computed(() =>
  roleStore.roles.find((role) => role.isDefault)
);

const permissionOptions = computed(() => {
  if (permissionStore.permissions.length) return permissionStore.permissions;
  return roleStore.permissionPool;
});

const noDataText = computed(() => {
  if (roleStore.search)
    return 'Role tidak ditemukan untuk kata kunci tersebut.';
  return 'Belum ada role yang terdaftar.';
});

function canSetDefault(role) {
  if (!role?.name || !canUpdateRole.value) return false;
  return DEFAULT_ELIGIBLE_NAMES.includes(role.name.toLowerCase());
}

const topRoleLabel = computed(() => {
  if (!roleStore.roles.length) return 'Belum tersedia';
  const sorted = [...roleStore.roles].sort((a, b) => b.userCount - a.userCount);
  const top = sorted[0];
  const nameLabel = formatRoleLabel(top?.name || '') || top?.name || 'Tidak diketahui';
  if (!top?.userCount) return `${nameLabel} (0 pengguna)`;
  return `${nameLabel} (${top.userCount} pengguna)`;
});

const totalItems = computed(() => {
  const total = Number(roleStore.pagination?.totalItems);
  return Number.isFinite(total) ? total : rows.value.length;
});
const currentPerPage = computed(() =>
  normalizePerPage(perPageSelection.value || roleStore.pagination.perPage)
);
const startEntry = computed(() => {
  if (!totalItems.value) return 0;
  return (roleStore.pagination.currentPage - 1) * currentPerPage.value + 1;
});
const endEntry = computed(() => {
  if (!totalItems.value) return 0;
  return Math.min(roleStore.pagination.currentPage * currentPerPage.value, totalItems.value);
});

watch(searchTerm, (value) => {
  clearActionMessage();
  if (!canViewRoles.value) return;
  roleStore.setSearch(value);
  if (!initialized.value) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    roleStore.fetchRoles({ page: 1, search: value, perPage: currentPerPage.value });
  }, 400);
});

watch(
  () => roleStore.pagination.perPage,
  (perPage) => {
    perPageSelection.value = normalizePerPage(perPage);
  },
  { immediate: true }
);

onMounted(async () => {
  clearActionMessage();
  if (!canViewRoles.value) return;
  await Promise.all([
    permissionStore.fetchPermissions({ perPage: 200 }),
    roleStore.fetchRoles({ perPage: currentPerPage.value }),
  ]);
  initialized.value = true;
});

function formatRoleLabel(value) {
  if (!value) return '';
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function limitedPermissions(list = []) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, maxPermissionChip);
}

async function refreshRoles() {
  clearActionMessage();
  if (!canViewRoles.value) return;
  defaultWarning.value = '';
  defaultSuccess.value = '';
  await roleStore.fetchRoles({
    page: roleStore.pagination.currentPage,
    search: roleStore.search,
    perPage: currentPerPage.value,
  });
}

async function changePage(page) {
  clearActionMessage();
  if (!canViewRoles.value) return;
  await roleStore.fetchRoles({
    page,
    search: roleStore.search,
    perPage: currentPerPage.value,
  });
}

function openCreateForm() {
  clearActionMessage();
  if (!canViewRoles.value) return;
  if (!canCreateRole.value) return;
  selectedRole.value = null;
  isEdit.value = false;
  showForm.value = true;
}

function openEditForm(role) {
  clearActionMessage();
  if (!canViewRoles.value) return;
  if (!canUpdateRole.value) return;
  selectedRole.value = { ...role };
  isEdit.value = true;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  selectedRole.value = null;
  isEdit.value = false;
}

async function handleSubmit(payload) {
  clearActionMessage();
  if (!canViewRoles.value) return;
  try {
    if (isEdit.value && selectedRole.value) {
      if (!canUpdateRole.value) return;
      await roleStore.updateRole(selectedRole.value.id, payload);
      notify({
        tone: 'success',
        title: 'Role diperbarui',
        message: `Role ${payload.name || selectedRole.value.name} berhasil diperbarui.`,
        persist: false,
      });
    } else {
      if (!canCreateRole.value) return;
      const result = await roleStore.createRole(payload);
      const roleName = payload.name || result?.data?.name || 'Role';
      notify({
        tone: 'success',
        title: 'Role dibuat',
        message: `Role ${roleName} berhasil dibuat.`,
        persist: false,
      });
    }
    roleStore.error = null;
    closeForm();
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Gagal menyimpan role. Silakan coba lagi.';
    notify({
      tone: 'error',
      title: 'Gagal menyimpan role',
      message,
      persist: false,
    });
  }
}

async function handleDelete(role) {
  if (!canViewRoles.value) return;
  if (!canDeleteRole.value) return;
  if (!role?.id) return;
  clearActionMessage();
  defaultWarning.value = '';
  defaultSuccess.value = '';
  if (role.isDefault) {
    defaultWarning.value =
      `Role ${role.name} adalah role default dan tidak dapat dihapus. ` +
      'Tetapkan role lain sebagai default terlebih dahulu.';
    return;
  }
  const ok = await openConfirm({
    title: 'Hapus role?',
    message: `Role ${role.name} beserta pengaturan izinnya akan dihapus.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  try {
    await roleStore.removeRole(role.id);
    notify({
      tone: 'success',
      title: 'Role dihapus',
      message: `Role ${role.name} berhasil dihapus.`,
      persist: false,
    });
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Gagal menghapus role. Silakan coba lagi.';
    defaultWarning.value = message;
    notify({
      tone: 'error',
      title: 'Gagal menghapus role',
      message,
      persist: false,
    });
  }
}

async function handleSetDefault(role) {
  if (!canViewRoles.value) return;
  if (!canUpdateRole.value) return;
  if (!role?.id || role.isDefault || !canSetDefault(role)) return;
  defaultWarning.value = '';
  defaultSuccess.value = '';

  const currentDefault =
    currentDefaultRole.value && currentDefaultRole.value.id !== role.id
      ? currentDefaultRole.value
      : null;

  const message = currentDefault
    ? `Role ${currentDefault.name} akan digantikan oleh ${role.name} sebagai default. Lanjutkan?`
    : `Tetapkan ${role.name} sebagai role default?`;

  const ok = await openConfirm({
    title: 'Tetapkan role default?',
    message,
    confirmLabel: 'Ya, tetapkan',
    variant: 'primary',
  });
  if (!ok) return;

  try {
    const result = await roleStore.setDefaultRole(role.id);
    defaultSuccess.value = result.message || `Role ${role.name} kini menjadi default.`;
  } catch (err) {
    defaultWarning.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal menetapkan role default.';
  }
}

async function changePerPage(perPage) {
  const normalized = normalizePerPage(perPage);
  if (normalized === normalizePerPage(roleStore.pagination.perPage)) return;
  perPageSelection.value = normalized;
  await roleStore.fetchRoles({
    page: 1,
    search: roleStore.search,
    perPage: normalized,
  });
}

function normalizePerPage(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : perPageOptions[0];
}
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

