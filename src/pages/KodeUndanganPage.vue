<template>
  <div class="space-y-6">
    <div
      v-if="!canManageInvites"
      class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
    >
      <p class="text-base font-semibold">Akses ditolak</p>
      <p class="mt-1">
        Anda tidak memiliki izin untuk mengelola kode undangan. Hubungi administrator jika membutuhkan akses users.store.
      </p>
    </div>

    <template v-else>
    <header class="flex flex-col gap-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-primaryLight">
        Manajemen Pengguna
      </p>
      <h1 class="text-2xl font-semibold text-surfaceDark">
        Kode Undangan Admin
      </h1>
      <p class="text-sm text-gray-500 max-w-2xl">
        Hasilkan kode undangan satu kali pakai untuk dibagikan kepada calon admin. Kode
        muncul segera setelah dibuat dan tidak tersimpan ketika halaman disegarkan.
      </p>
    </header>

    <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-5 sm:p-6">
      <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div class="flex-1 space-y-2">
              <label class="text-sm font-medium text-gray-700">Role tujuan</label>
            <select
              v-model="form.roleId"
              class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner transition focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100"
            >
              <option value="" disabled>
                {{
                  roleOptions.length
                    ? 'Pilih role penerima kode'
                    : 'Belum ada role yang tersedia'
                }}
              </option>
              <option
                v-for="option in roleOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
          </div>

          <form class="flex flex-col gap-2" @submit.prevent="handleGenerate">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary/50 hover:text-primary transition sm:w-auto"
                :disabled="isLoadingRoles"
                @click="handleRefresh"
              >
                <ArrowPathIcon class="h-4 w-4" />
                <span class="hidden sm:inline">Segarkan Role</span>
              </button>
              <button
                type="submit"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="isGenerateDisabled"
              >
                <PlusIcon class="h-4 w-4" />
                <span>Buat Kode</span>
              </button>
            </div>
            <div class="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primaryDark">
              Kode berlaku selama 24 jam, hanya bisa digunakan sekali, dan akan hilang dari halaman ini ketika Anda menutup atau menyegarkan tab.
            </div>
          </form>
        </div>

        <p
          v-if="successMessage"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700 sm:px-4"
        >
          {{ successMessage }}
        </p>
        <p
          v-if="errorMessage || formError"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700 sm:px-4"
        >
          {{ formError || errorMessage }}
        </p>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
        <h2 class="text-base font-semibold text-gray-800">
          Kode Terakhir
        </h2>
      </div>
      <div class="p-4 sm:p-6">
        <div
          v-if="!latestCode"
          class="flex flex-col items-center gap-3 py-16 text-center text-gray-500"
        >
          <svg
            class="h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 7.5l7.5 7.5m0 0L21 7.5M10.5 15L3 22.5M10.5 15l7.5 7.5"
            />
          </svg>
          <p class="text-base font-medium text-gray-700">
            Belum ada kode pada sesi ini.
          </p>
          <p class="text-sm max-w-md">
            Setelah Anda klik <span class="font-semibold">Buat Kode</span>, kode akan muncul di sini untuk segera disalin.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div class="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase text-primaryLight">
                  Kode undangan siap pakai
                </p>
                <p class="font-mono text-2xl font-semibold text-primaryDark tracking-widest">
                  {{ latestCode.code }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition"
                @click="copyLatestCode"
              >
                <DocumentDuplicateIcon class="h-4 w-4" />
                Salin Kode
              </button>
            </div>

            <dl class="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
              <div class="space-y-1">
                <dt class="text-gray-500">Role penerima</dt>
                <dd class="font-medium text-gray-800">
                  {{ latestCode.roleName || latestCode.roleId || '-' }}
                </dd>
              </div>
              <div class="space-y-1">
                <dt class="text-gray-500">Kedaluwarsa</dt>
                <dd class="font-medium text-gray-800">
                  {{ formatDate(latestCode.expiresAt) }}
                </dd>
              </div>
              <div class="space-y-1">
                <dt class="text-gray-500">Limit penggunaan</dt>
                <dd class="font-medium text-gray-800">
                  {{ latestCode.usageLimit || 1 }} kali
                </dd>
              </div>
              <div class="space-y-1">
                <dt class="text-gray-500">Status</dt>
                <dd>
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                      statusClass(latestCode.status, latestCode.expiresAt),
                    ]"
                  >
                    {{ statusLabel(latestCode.status, latestCode.expiresAt) }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          
        </div>
      </div>
    </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ArrowPathIcon, DocumentDuplicateIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { useKodeUndanganStore } from '@/stores/useKodeUndanganStore';
import { useRoleStore } from '@/stores/useRoleStore';
import { useAuthorization } from '@/composables/auth/useAuthorization';
import { useNotificationCenter } from '@/stores/useNotificationCenter';
import { copyText } from '@/utils/copyText';

const kodeUndanganStore = useKodeUndanganStore();
const roleStore = useRoleStore();
const { hasPermission } = useAuthorization();
const { notify } = useNotificationCenter();

const form = reactive({
  roleId: '',
});

const latestCode = computed(() => kodeUndanganStore.latestCode);
const canManageInvites = computed(() => hasPermission('users.store'));
const isLoadingRoles = computed(() => roleStore.loading);
const isSaving = computed(() => kodeUndanganStore.saving);
const errorMessage = computed(() => kodeUndanganStore.error);
const formError = ref('');
const successMessage = ref('');

const roleOptions = computed(() =>
  roleStore.roles.map((role) => ({
    id: role.id,
    name: role.name,
  }))
);

const isGenerateDisabled = computed(
  () =>
    !canManageInvites.value ||
    !form.roleId ||
    isSaving.value ||
    !roleOptions.value.length
);

onMounted(async () => {
  if (!canManageInvites.value) return;
  await roleStore.fetchRoles({ perPage: 100 });
});

async function handleRefresh() {
  if (!canManageInvites.value) return;
  formError.value = '';
  successMessage.value = '';
  await roleStore.fetchRoles({ perPage: 100 });
}

async function handleGenerate() {
  if (!canManageInvites.value) return;
  formError.value = '';
  successMessage.value = '';
  if (!form.roleId) {
    formError.value = 'Pilih role penerima kode terlebih dahulu.';
    return;
  }
  const selectedRole =
    roleOptions.value.find((option) => option.id === form.roleId) || null;
  try {
    const result = await kodeUndanganStore.generateKodeUndangan({
      role_id: form.roleId,
      role_name: selectedRole?.name ?? '',
    });
    successMessage.value = result.message || 'Kode undangan berhasil dibuat.';
  } catch (err) {
    formError.value = err.message || 'Gagal membuat kode undangan.';
    return;
  }
  form.roleId = '';
}

async function copyLatestCode() {
  if (!canManageInvites.value) return;
  if (!latestCode.value) return;
  const copied = await copyText(latestCode.value.code);
  notify({
    tone: copied ? 'success' : 'error',
    title: copied ? 'Kode disalin' : 'Gagal menyalin',
    message: copied
      ? `${latestCode.value.code} sudah disalin ke clipboard.`
      : 'Tidak dapat menyalin kode, salin secara manual.',
    duration: 2500,
    persist: false,
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusClass(status, expiresAt) {
  if (status === 'revoked') return 'bg-rose-100 text-rose-700';
  if (status === 'inactive') return 'bg-gray-200 text-gray-600';
  if (expiresAt && isExpired(expiresAt)) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function statusLabel(status, expiresAt) {
  if (status === 'revoked') return 'Dicabut';
  if (status === 'inactive') return 'Tidak aktif';
  if (expiresAt && isExpired(expiresAt)) return 'Kedaluwarsa';
  return 'Aktif';
}

function isExpired(expiresAt) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}
</script>
