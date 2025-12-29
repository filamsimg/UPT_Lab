<template>
  <!-- Reset password: input email/kode/password baru -->
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primaryLight/10 via-white to-primaryDark/10 px-4 py-10"
  >
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-[36px] p-10 space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-semibold text-primaryDark">Reset Password</h1>
        <p class="text-sm text-gray-500">
          {{ stageDescription }}
        </p>
      </div>

      <form
        v-if="stage === 'request'"
        @submit.prevent="handleResetRequest"
        class="space-y-5"
      >
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="nama@gmail.com"
            class="w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
          />
          <p v-if="formErrors.email" class="text-xs text-red-500 font-medium">
            {{ formErrors.email }}
          </p>
        </div>
        <button
          type="submit"
          :disabled="loading || cooldown > 0"
          class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Mengirim...</span>
          <span v-else-if="cooldown > 0">Tunggu {{ cooldown }} dtk</span>
          <span v-else>Kirim Kode Reset</span>
        </button>
      </form>

      <form
        v-else-if="stage === 'verify'"
        @submit.prevent="handleResetConfirm"
        class="space-y-5"
      >
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            readonly
            class="w-full rounded-xl border px-4 py-3 shadow-sm bg-gray-100 focus:outline-none"
          />
          <p v-if="formErrors.email" class="text-xs text-red-500 font-medium">
            {{ formErrors.email }}
          </p>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Kode Reset</label>
          <input
            v-model="code"
            inputmode="numeric"
            maxlength="6"
            placeholder="Masukkan kode 6 digit"
            class="w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
          />
          <p v-if="formErrors.code" class="text-xs text-red-500 font-medium">
            {{ formErrors.code }}
          </p>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Password Baru</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Buat password baru"
            class="w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
          />
          <p v-if="formErrors.password" class="text-xs text-red-500 font-medium">
            {{ formErrors.password }}
          </p>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Konfirmasi Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Ulangi password baru"
            class="w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight"
          />
          <p v-if="formErrors.confirmPassword" class="text-xs text-red-500 font-medium">
            {{ formErrors.confirmPassword }}
          </p>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Cek folder spam jika email tidak ditemukan.</span>
          <button
            type="button"
            class="font-semibold text-primaryLight hover:text-primaryDark transition disabled:opacity-50"
            :disabled="loading || cooldown > 0"
            @click="resendResetCode"
          >
            <span v-if="loading">Mengirim...</span>
            <span v-else-if="cooldown > 0">Kirim ulang ({{ cooldown }}s)</span>
            <span v-else>Kirim ulang kode</span>
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Reset Password</span>
          <span v-else>Memproses...</span>
        </button>
      </form>

      <div v-else class="space-y-5">
        <AlertBanner tone="success">
          {{ successMessage || 'Password berhasil direset. Silakan masuk menggunakan password baru.' }}
        </AlertBanner>
        <button
          type="button"
          class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition"
          @click="goToLogin"
        >
          Kembali ke login
        </button>
      </div>

      <AlertBanner
        v-if="errorMessage"
        tone="error"
      >
        {{ errorMessage }}
      </AlertBanner>
      <AlertBanner
        v-else-if="successMessage && stage !== 'success'"
        tone="success"
      >
        {{ successMessage }}
      </AlertBanner>

      <div class="text-center text-sm text-gray-500">
        Ingin buat akun baru?
        <button class="text-primaryLight hover:text-primaryDark font-semibold" @click="goToRegister">
          Daftar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import AlertBanner from '@/components/feedback/AlertBanner.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const stage = ref('request');
const email = ref(typeof route.query.email === 'string' ? route.query.email : '');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const formErrors = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
});
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const cooldown = ref(0);
let cooldownTimer = null;

watch(
  () => route.query.email,
  (value) => {
    if (typeof value === 'string') {
      email.value = value;
    }
  }
);

const stageDescription = computed(() => {
  switch (stage.value) {
    case 'verify':
      return 'Masukkan kode reset yang dikirim ke email Anda lalu atur password baru.';
    case 'success':
      return 'Password Anda berhasil direset. Silakan masuk menggunakan password baru.';
    default:
      return 'Masukkan email terdaftar untuk menerima kode reset password.';
  }
});

function clearCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  cooldown.value = 0;
}

function startCooldown() {
  clearCooldown();
  cooldown.value = 60;
  cooldownTimer = setInterval(() => {
    if (cooldown.value <= 1) {
      clearCooldown();
    } else {
      cooldown.value -= 1;
    }
  }, 1000);
}

function resetFormState() {
  formErrors.email = '';
  formErrors.code = '';
  formErrors.password = '';
  formErrors.confirmPassword = '';
  errorMessage.value = '';
  successMessage.value = '';
}

async function handleResetRequest() {
  resetFormState();
  const trimmedEmail = email.value.trim();
  formErrors.email = trimmedEmail ? '' : 'Email wajib diisi.';
  if (!trimmedEmail) {
    errorMessage.value = 'Harap masukkan email yang terdaftar.';
    return;
  }

  loading.value = true;
  const res = await authStore.requestPasswordReset({ email: trimmedEmail });
  loading.value = false;

  if (res.ok) {
    stage.value = 'verify';
    successMessage.value = res.message || 'Kode reset password telah dikirim.';
    errorMessage.value = '';
    startCooldown();
  } else {
    errorMessage.value = res.message || 'Gagal mengirim kode reset password.';
    successMessage.value = '';
    if (res.errors?.email?.length) {
      [formErrors.email] = res.errors.email;
    } else if (res.notFound && !formErrors.email) {
      formErrors.email = res.message || 'Email belum terdaftar.';
    }
  }
}

function resendResetCode() {
  if (cooldown.value > 0 || loading.value) return;
  handleResetRequest();
}

async function handleResetConfirm() {
  resetFormState();
  const trimmedEmail = email.value.trim();
  const trimmedCode = code.value.trim();
  const password = newPassword.value;
  const confirmation = confirmPassword.value;

  formErrors.email = trimmedEmail ? '' : 'Email wajib diisi.';
  formErrors.code = trimmedCode ? '' : 'Kode reset password wajib diisi.';
  formErrors.password = password ? '' : 'Password baru wajib diisi.';
  formErrors.confirmPassword = confirmation ? '' : 'Konfirmasi password wajib diisi.';

  if (password && confirmation && password !== confirmation) {
    const msg = 'Password baru dan konfirmasi harus sama.';
    formErrors.password = msg;
    formErrors.confirmPassword = msg;
  }

  if (
    formErrors.email ||
    formErrors.code ||
    formErrors.password ||
    formErrors.confirmPassword
  ) {
    errorMessage.value = 'Periksa kembali data reset password Anda.';
    return;
  }

  loading.value = true;
  const res = await authStore.resetPassword({
    email: trimmedEmail,
    code: trimmedCode,
    password,
    password_confirmation: confirmation,
  });
  loading.value = false;

  if (res.ok) {
    stage.value = 'success';
    successMessage.value = res.message || 'Password berhasil direset.';
    errorMessage.value = '';
    clearCooldown();
  } else {
    errorMessage.value = res.message || 'Reset password gagal.';
    const { errors, status } = res;
    if (errors?.email?.length) {
      [formErrors.email] = errors.email;
    }
    if (errors?.code?.length) {
      [formErrors.code] = errors.code;
    } else if (!errors && status === 400 && res.message) {
      formErrors.code = res.message;
    }
    if (errors?.password?.length) {
      [formErrors.password] = errors.password;
    }
    if (errors?.password_confirmation?.length) {
      [formErrors.confirmPassword] = errors.password_confirmation;
      if (!formErrors.password) {
        [formErrors.password] = errors.password_confirmation;
      }
    }
  }
}

function goToLogin() {
  router.push('/login');
}

function goToRegister() {
  router.push('/register');
}

onBeforeUnmount(() => {
  clearCooldown();
});
</script>

