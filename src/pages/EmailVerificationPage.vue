<template>
  <!-- Verifikasi email: kirim & validasi kode -->
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primaryLight/10 via-white to-primaryDark/10 px-4 py-10"
  >
    <div class="w-full max-w-md bg-white shadow-2xl rounded-[36px] p-10 space-y-8">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-semibold text-primaryDark">Verifikasi Email</h1>
        <p class="text-sm text-gray-500">
          Masukkan email dan kode verifikasi 6 digit yang kami kirimkan untuk mengaktifkan akun Anda.
        </p>
      </div>

      <form @submit.prevent="handleVerification" class="space-y-5">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            :readonly="emailLocked"
            type="email"
            placeholder="nama@gmail.com"
            class="w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight disabled:bg-gray-100"
          />
          <p v-if="formErrors.email" class="text-xs text-red-500 font-medium">
            {{ formErrors.email }}
          </p>
          <button
            v-if="emailLocked"
            type="button"
            class="text-xs font-semibold text-primaryLight hover:text-primaryDark transition"
            @click="unlockEmail"
          >
            Gunakan email lain
          </button>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Kode Verifikasi</label>
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

        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Cek folder spam jika email tidak ditemukan.</span>
          <button
            type="button"
            class="font-semibold text-primaryLight hover:text-primaryDark transition disabled:opacity-50"
            :disabled="sending || cooldown > 0"
            @click="sendVerificationCode()"
          >
            <span v-if="sending">Mengirim...</span>
            <span v-else-if="cooldown > 0">Kirim ulang ({{ cooldown }}s)</span>
            <span v-else>Kirim kode</span>
          </button>
        </div>

        <button
          type="submit"
          :disabled="verifying"
          class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!verifying">Verifikasi</span>
          <span v-else>Memproses...</span>
        </button>
      </form>

      <AlertBanner v-if="errorMessage" tone="error">
        {{ errorMessage }}
      </AlertBanner>
      <AlertBanner v-else-if="successMessage" tone="success">
        {{ successMessage }}
      </AlertBanner>

      <div class="text-center text-sm text-gray-500 space-y-1">
        <p>
          Salah email? <button class="text-primaryLight hover:text-primaryDark font-semibold" @click="goToRegister">Daftar ulang</button>
        </p>
        <p>
          Sudah verifikasi? <button class="text-primaryLight hover:text-primaryDark font-semibold" @click="goToLogin">Masuk sekarang</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import AlertBanner from '@/components/feedback/AlertBanner.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const PENDING_VERIFICATION_KEY = 'pendingVerificationEmail';

const email = ref(typeof route.query.email === 'string' ? route.query.email : ''); // Email diambil dari query jika ada
const emailLocked = ref(route.query.lock === '1' && !!email.value); // Lock input email jika berasal dari query (lock=1)
const code = ref('');
const formErrors = reactive({
  email: '',
  code: '',
});
const errorMessage = ref(''); // Pesan error/verifikasi
const successMessage = ref('');
const sending = ref(false); // Status kirim kode
const verifying = ref(false); // Status verifikasi kode
const cooldown = ref(0); // Countdown kirim ulang kode
let cooldownTimer = null;
let redirectTimer = null;

watch(
  () => route.query.email,
  (value) => {
    if (typeof value === 'string' && value.trim()) {
      email.value = value;
      emailLocked.value = route.query.lock === '1';
    }
  }
);

watch(
  () => route.query.lock,
  (value) => {
    emailLocked.value = value === '1' && !!email.value.trim();
  }
);

// Bersihkan timer cooldown
function clearCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  cooldown.value = 0;
}

// Mulai hitung mundur kirim ulang kode
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

function unlockEmail() {
  emailLocked.value = false;
}

// Panggil API kirim kode verifikasi
async function sendVerificationCode({ auto = false } = {}) {
  if (sending.value) return;
  errorMessage.value = '';
  if (!auto) {
    successMessage.value = '';
  }
  const trimmed = email.value.trim();
  formErrors.email = trimmed ? '' : 'Email wajib diisi.';
  if (!trimmed) {
    errorMessage.value = 'Harap masukkan email yang terdaftar.';
    return;
  }
  sending.value = true;
  const res = await authStore.requestEmailVerificationCode({ email: trimmed });
  sending.value = false;
  if (res.ok) {
    successMessage.value = res.message || 'Kode verifikasi dikirim ke email Anda.';
    errorMessage.value = '';
    startCooldown();
  } else {
    errorMessage.value = res.message || 'Gagal mengirim kode verifikasi.';
    successMessage.value = '';
    if (res.errors?.email?.length) {
      [formErrors.email] = res.errors.email;
    } else if (res.notFound && !formErrors.email) {
      formErrors.email = res.message || 'Email belum terdaftar.';
    }
  }
}

// Verifikasi kode lalu redirect ke login
async function handleVerification() {
  errorMessage.value = '';
  successMessage.value = '';
  const trimmedEmail = email.value.trim();
  const trimmedCode = code.value.trim();
  formErrors.email = trimmedEmail ? '' : 'Email wajib diisi.';
  formErrors.code = trimmedCode ? '' : 'Kode verifikasi wajib diisi.';
  if (formErrors.email || formErrors.code) {
    errorMessage.value = 'Harap lengkapi data verifikasi.';
    return;
  }

  verifying.value = true;
  const res = await authStore.verifyEmail({
    email: trimmedEmail,
    code: trimmedCode,
  });
  verifying.value = false;
  if (res.ok) {
    const baseMessage = res.message || 'Email berhasil diverifikasi.';
    successMessage.value = `${baseMessage} Mengalihkan ke halaman login...`;
    errorMessage.value = '';
    code.value = '';
    clearCooldown();
    const normalized = trimmedEmail.toLowerCase();
    const pendingEmail =
      (localStorage.getItem(PENDING_VERIFICATION_KEY) || '').toLowerCase();
    if (pendingEmail && normalized && pendingEmail === normalized) {
      localStorage.removeItem(PENDING_VERIFICATION_KEY);
    }
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
    redirectTimer = setTimeout(() => {
      router.push({
        path: '/login',
        query: { email: trimmedEmail, verified: '1' },
      });
    }, 1400);
  } else {
    errorMessage.value = res.message || 'Verifikasi email gagal.';
    if (res.errors?.email?.length) {
      [formErrors.email] = res.errors.email;
    } else if (res.notFound && !formErrors.email) {
      formErrors.email = res.message || 'Email belum terdaftar.';
    }
    if (res.errors?.code?.length) {
      [formErrors.code] = res.errors.code;
    } else if (res.invalidCode && !formErrors.code) {
      formErrors.code = res.message || 'Kode verifikasi tidak valid.';
    }
  }
}

function goToLogin() {
  const queryEmail = email.value.trim();
  if (queryEmail) {
    router.push({ path: '/login', query: { email: queryEmail } });
  } else {
    router.push('/login');
  }
}

function goToRegister() {
  router.push('/register');
}

onMounted(() => {
  if (route.query.auto === '1' && email.value.trim()) {
    sendVerificationCode({ auto: true });
  }
});

onBeforeUnmount(() => {
  clearCooldown();
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
});
</script>

