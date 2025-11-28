<template>
  <div class="space-y-5">
    <div
      v-if="!canViewPermissions"
      class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
    >
      <p class="text-base font-semibold">Akses ditolak</p>
      <p class="mt-1">
        Anda tidak memiliki izin permissions.index sehingga halaman manajemen permission tidak dapat dibuka.
      </p>
    </div>

    <template v-else>
      <header
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
      <div>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
          Manajemen Permission
        </h2>
        <p class="text-sm text-gray-500">
          Definisikan izin granular untuk mengontrol fitur yang dapat diakses
          pengguna.
        </p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        <button
          class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
          @click="refreshPermissions"
        >
          <ArrowPathIcon
            :class="[
              'h-5 w-5',
              permissionStore.loading
                ? 'animate-spin text-primary'
                : 'text-gray-500',
            ]"
          />
          Muat Ulang
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Total Permission
        </p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ permissionStore.pagination.totalItems }}
        </p>
        <p class="text-xs text-gray-400">Jumlah permission yang tersedia.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Terakhir Diperbarui
        </p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ lastRefreshedLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Gunakan tombol muat ulang untuk sinkron.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Filter Aktif</p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ activeFilterLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Gunakan pencarian untuk memfilter data.
        </p>
      </article>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
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
              placeholder="Cari permission berdasarkan nama atau deskripsi..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
        <p v-if="permissionStore.error" class="text-xs text-red-500">
          {{ permissionStore.error }}
        </p>
      </div>

      <div
        v-if="permissionStore.loading"
        class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500"
      >
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data permission...
      </div>
      <div v-else>
        <DataTable
          :columns="columns"
          :rows="rows"
          :searchable="false"
          :filterable="false"
          :showPagination="false"
          :no-data-text="noDataText"
        >
          <template #description="{ value }">
            <span class="text-sm text-gray-700">
              {{ value || '-' }}
            </span>
          </template>

        </DataTable>

        <div
          class="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Halaman
            <span class="font-semibold text-gray-800">{{
              permissionStore.pagination.currentPage
            }}</span>
            dari
            <span class="font-semibold text-gray-800">{{
              permissionStore.pagination.lastPage
            }}</span>
            ({{ rows.length }} permission ditampilkan)
          </p>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!permissionStore.pagination.hasPrevPage"
              @click="changePage(permissionStore.pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!permissionStore.pagination.hasNextPage"
              @click="changePage(permissionStore.pagination.currentPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </section>

    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import DataTable from '@/components/common/DataTable.vue';
import { usePermissionStore } from '@/stores/usePermissionStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
const permissionStore = usePermissionStore();
const { hasPermission } = useAuthorization();

const canViewPermissions = computed(() => hasPermission('permissions.index'));

const columns = [
  { field: 'name', title: 'Nama Permission' },
  { field: 'description', title: 'Deskripsi', slotName: 'description' },
];

const searchTerm = ref('');
const initialized = ref(false);
const lastRefreshedAt = ref(null);
let debounceTimer = null;

const rows = computed(() => permissionStore.permissions);

const noDataText = computed(() => {
  if (permissionStore.search) {
    return 'Permission tidak ditemukan untuk kata kunci tersebut.';
  }
  return 'Belum ada permission yang terdaftar.';
});

const activeFilterLabel = computed(() =>
  permissionStore.search ? `Cari: "${permissionStore.search}"` : 'Tidak ada'
);

const lastRefreshedLabel = computed(() => {
  if (!lastRefreshedAt.value) return 'Belum pernah';
  return formatDate(lastRefreshedAt.value);
});

watch(searchTerm, (value) => {
  if (!canViewPermissions.value) return;
  permissionStore.setSearch(value);
  if (!initialized.value) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    permissionStore.fetchPermissions({
      page: 1,
      search: value,
    });
  }, 400);
});

onMounted(async () => {
  if (!canViewPermissions.value) return;
  await permissionStore.fetchPermissions();
  lastRefreshedAt.value = new Date();
  initialized.value = true;
});

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function refreshPermissions() {
  if (!canViewPermissions.value) return;
  await permissionStore.fetchPermissions({
    page: permissionStore.pagination.currentPage,
    search: permissionStore.search,
  });
  lastRefreshedAt.value = new Date();
}

async function changePage(page) {
  if (!canViewPermissions.value) return;
  await permissionStore.changePage(page);
  lastRefreshedAt.value = new Date();
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

