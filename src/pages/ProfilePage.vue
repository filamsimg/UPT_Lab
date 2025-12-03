<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4 text-primary">Profil Saya</h1>

    <div v-if="user" class="bg-white rounded-xl shadow p-6 space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          :src="userAvatar"
          alt="Avatar"
          class="w-20 h-20 rounded-full ring-2 ring-primary/40 object-cover"
        />
        <div>
          <h2 class="text-xl font-semibold text-surfaceDark">{{ user.name }}</h2>
          <p class="text-gray-500">{{ user.email }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primaryDark">
              {{ primaryRoleLabel }}
            </span>
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              :class="accountStatusClass"
            >
              {{ accountStatusLabel }}
            </span>
          </div>
        </div>
      </div>

      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Nomor Telepon</dt>
          <dd class="mt-1 text-gray-700">{{ phoneLabel }}</dd>
        </div>
        <div v-if="showNipField">
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">NIP</dt>
          <dd class="mt-1 text-gray-700">{{ nipLabel }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</dt>
          <dd class="mt-1 flex flex-wrap gap-2 text-gray-700">
            <span
              v-for="role in roleNames"
              :key="role"
              class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primaryDark"
            >
              {{ role }}
            </span>
            <span v-if="!roleNames.length" class="text-gray-400">Belum ada role</span>
          </dd>
        </div>
      </dl>

      <div class="pt-5 flex flex-wrap gap-3">
        <button
          class="px-4 py-2 rounded-lg bg-primary text-white transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
          @click="toggleEditMode"
        >
          {{ editMode ? 'Batal' : 'Edit Profil' }}
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-danger text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>

    <div
      v-if="editMode && user"
      class="bg-white rounded-xl shadow p-6 space-y-4 mt-6 border border-border"
    >
      <h2 class="text-lg font-semibold text-gray-700">Edit Profil</h2>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Foto Profil</label>
        <div class="flex items-center gap-4">
          <img
            :src="previewAvatar || userAvatar"
            alt="Preview"
            class="w-20 h-20 rounded-full ring-2 ring-primary/40 object-cover"
          />
          <input
            type="file"
            accept="image/*"
            class="text-sm"
            @change="handleFileUpload"
          />
        </div>
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Nama Lengkap</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="Nama lengkap"
        />
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="email@uptlab.id"
        />
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Nomor Telepon</label>
        <input
          v-model="form.phone"
          type="tel"
          class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="0812-3456-7890"
        />
      </div>

      <div v-if="showNipField">
        <label class="block text-gray-600 text-sm mb-1">NIP</label>
        <input
          v-model="form.employmentIdentityNumber"
          type="text"
          class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="6404646066XXXXXX"
        />
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Role</label>
        <div class="flex flex-wrap gap-2 rounded-lg border border-dashed border-border px-3 py-2 bg-gray-50">
          <span
            v-for="role in roleNames"
            :key="role"
            class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primaryDark"
          >
            {{ role }}
          </span>
          <span v-if="!roleNames.length" class="text-xs text-gray-400">
            Role ditetapkan oleh admin dan tidak dapat diubah.
          </span>
        </div>
        <p class="mt-1 text-xs text-gray-400">Role ditetapkan oleh administrator.</p>
      </div>

      <div class="border-t border-border pt-4">
        <h3 class="text-md font-semibold text-gray-700 mb-3">Ganti Password</h3>
        <p class="text-xs text-gray-500 mb-4">
          Isi seluruh kolom di bawah ini apabila Anda ingin memperbarui password akun.
        </p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-gray-600 text-sm mb-1">Password Saat Ini</label>
            <input
              v-model="passwordForm.current"
              type="password"
              autocomplete="current-password"
              class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Masukkan password sekarang"
            />
          </div>
          <div>
            <label class="block text-gray-600 text-sm mb-1">Password Baru</label>
            <input
              v-model="passwordForm.new"
              type="password"
              autocomplete="new-password"
              class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div>
            <label class="block text-gray-600 text-sm mb-1">Konfirmasi Password Baru</label>
            <input
              v-model="passwordForm.confirmation"
              type="password"
              autocomplete="new-password"
              class="w-full border border-border rounded-lg px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Ulangi password baru"
            />
          </div>
        </div>
        <p
          v-if="isPasswordDirty && !canChangePassword"
          class="mt-2 text-xs text-red-500"
        >
          {{ passwordErrorMessage }}
        </p>
      </div>

      <div class="pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-auto"
          :disabled="saving"
          @click="cancelEdit"
        >
          Batal
        </button>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          :disabled="saving || !canSave"
          @click="saveProfile"
        >
          <svg
            v-if="saving"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
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
          <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
        </button>
      </div>
    </div>

    <div v-else-if="!user" class="text-gray-500 text-center mt-10">
      Memuat profil...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationCenter } from '@/stores/useNotificationCenter'
import { buildInitialAvatar } from '@/utils/avatar'

const authStore = useAuthStore()
const { currentUser: user } = storeToRefs(authStore)
const { notify } = useNotificationCenter()

const editMode = ref(false)
const saving = ref(false)

const previewAvatar = ref(null)
const avatarFile = ref(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  employmentIdentityNumber: '',
})

const passwordForm = reactive({
  current: '',
  new: '',
  confirmation: '',
})

onMounted(async () => {
  await authStore.init()
})

watch(
  user,
  (value) => {
    if (!value) return
    form.name = value.name || ''
    form.email = value.email || ''
    form.phone = value.phoneNumber || value.phone || value.phone_number || ''
    form.employmentIdentityNumber =
      value.employmentIdentityNumber || value.employment_identity_number || ''
  },
  { immediate: true }
)

const userAvatar = computed(() => {
  const current = user.value
  const directAvatar =
    current?.avatar ||
    current?.avatarUrl ||
    current?.avatar_url ||
    current?.photoUrl
  if (directAvatar) return directAvatar
  return buildInitialAvatar(current?.name || 'SIAPEL User')
})

const formatRole = (value = '') => {
  const normalized = String(value || '')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .toLowerCase()
  if (!normalized) return ''
  return normalized
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const roleNames = computed(() => {
  if (!Array.isArray(user.value?.roles)) return []
  return user.value.roles
    .map((role) => formatRole(role?.name || role?.title || role?.label || role?.slug || role?.code))
    .filter(Boolean)
})

const primaryRoleLabel = computed(() => roleNames.value[0] || 'Role belum ditetapkan')

const accountIsActive = computed(() => {
  const current = user.value || {}
  if (current.isActive !== undefined) return Boolean(current.isActive)
  if (current.is_active !== undefined) return Boolean(current.is_active)
  if (current.deactivatedAt || current.deactivated_at) return false
  if (current.activatedAt || current.activated_at) return true
  return true
})
const accountStatusLabel = computed(() => (accountIsActive.value ? 'Aktif' : 'Tidak Aktif'))
const accountStatusClass = computed(() =>
  accountIsActive.value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
)

const hasCustomerRole = computed(() => {
  if (!Array.isArray(user.value?.roles)) return false
  return user.value.roles.some((role) => {
    const candidate =
      role?.slug || role?.code || role?.name || role?.title || role?.label || ''
    return typeof candidate === 'string' && candidate.toLowerCase() === 'customer'
  })
})

const showNipField = computed(() => !hasCustomerRole.value)

const phoneLabel = computed(
  () => user.value?.phoneNumber || user.value?.phone || user.value?.phone_number || '-'
)
const nipLabel = computed(
  () =>
    showNipField.value
      ? user.value?.employmentIdentityNumber || user.value?.employment_identity_number || '-'
      : '-'
)

const isPasswordDirty = computed(() =>
  Boolean(passwordForm.current || passwordForm.new || passwordForm.confirmation)
)

const canChangePassword = computed(() => {
  if (!isPasswordDirty.value) return true
  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirmation) {
    return false
  }
  if (passwordForm.new.length < 8) return false
  return passwordForm.new === passwordForm.confirmation
})

const passwordErrorMessage = computed(() => {
  if (!isPasswordDirty.value || canChangePassword.value) return ''
  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirmation) {
    return 'Isi seluruh kolom password sebelum menyimpan.'
  }
  if (passwordForm.new.length < 8) {
    return 'Password baru minimal 8 karakter.'
  }
  if (passwordForm.new !== passwordForm.confirmation) {
    return 'Konfirmasi password harus sama persis.'
  }
  return 'Password baru tidak valid.'
})

const canSave = computed(
  () => !!form.name.trim() && !!form.email.trim() && canChangePassword.value
)

const resetForm = () => {
  if (!user.value) return
  form.name = user.value.name || ''
  form.email = user.value.email || ''
  form.phone = user.value.phoneNumber || user.value.phone || user.value.phone_number || ''
  form.employmentIdentityNumber =
    user.value.employmentIdentityNumber || user.value.employment_identity_number || ''
  previewAvatar.value = null
  avatarFile.value = null
  resetPasswordForm()
}

const resetPasswordForm = () => {
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirmation = ''
}

const toggleEditMode = () => {
  if (saving.value) return
  if (editMode.value) {
    cancelEdit()
  } else {
    resetForm()
    editMode.value = true
  }
}

const cancelEdit = () => {
  editMode.value = false
  resetForm()
}

const handleFileUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = () => {
    previewAvatar.value = reader.result
  }
  reader.readAsDataURL(file)
}

watch(
  showNipField,
  (value) => {
    if (!value) {
      form.employmentIdentityNumber = ''
    }
  },
  { immediate: true }
)

const logout = async () => {
  await authStore.logout()
  window.location.href = '/login'
}

const saveProfile = async () => {
  if (!user.value || saving.value) return
  if (!canSave.value) {
    notify({
      tone: 'warning',
      title: 'Form belum lengkap',
      message:
        passwordErrorMessage.value ||
        'Lengkapi data wajib sebelum menyimpan profil.',
      persist: false,
    })
    return
  }

  const passwordDirtyBeforeSave = isPasswordDirty.value

  try {
    saving.value = true

    const roleIds = Array.isArray(user.value.roles)
      ? user.value.roles.map((role) => role.id).filter(Boolean)
      : []

    const phone = form.phone?.trim() || undefined
    const nip = showNipField.value
      ? form.employmentIdentityNumber?.trim() || undefined
      : undefined

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone,
      phone_number: phone,
      employment_identity_number: nip,
      employmentIdentityNumber: nip,
      roles: roleIds,
      role_ids: roleIds,
      isActive: accountIsActive.value,
      is_active: accountIsActive.value,
      avatar: avatarFile.value || undefined,
    }

    const profileResult = await authStore.updateProfile(payload)
    if (!profileResult?.ok) {
      throw new Error(profileResult?.message || 'Gagal menyimpan profil.')
    }

    editMode.value = false
    previewAvatar.value = null
    avatarFile.value = null

    notify({
      tone: 'success',
      title: 'Profil diperbarui',
      message: profileResult?.message || 'Profil berhasil diperbarui.',
      persist: false,
    })

    if (passwordDirtyBeforeSave) {
      try {
        const passwordResult = await authStore.updatePassword({
          current_password: passwordForm.current,
          password: passwordForm.new,
          password_confirmation: passwordForm.confirmation,
        })
        if (!passwordResult?.ok) {
          throw new Error(
            passwordResult?.message || 'Gagal memperbarui password.'
          )
        }
        resetPasswordForm()
        notify({
          tone: 'success',
          title: 'Password diperbarui',
          message: passwordResult?.message || 'Password berhasil diperbarui.',
          persist: false,
        })
      } catch (passwordErr) {
        console.error('Password update failed:', passwordErr)
        notify({
          tone: 'error',
          title: 'Password belum berubah',
          message:
            passwordErr.message ||
            'Profil tersimpan, tetapi gagal memperbarui password.',
          persist: false,
        })
        return
      }
    } else {
      resetPasswordForm()
    }
  } catch (err) {
    console.error('Error saving profile:', err)
    notify({
      tone: 'error',
      title: 'Gagal menyimpan profil',
      message:
        err.message ||
        'Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.',
      persist: false,
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
  border-color: #0d5bd5;
  box-shadow: 0 0 0 1px #0d5bd5;
}
</style>
