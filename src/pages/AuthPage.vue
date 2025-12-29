<template>
  <!-- Halaman auth gabungan: login & register toggle -->
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primaryLight/10 via-white to-primaryDark/10 px-4 py-10"
  >
    <div
      class="relative w-full max-w-5xl bg-white shadow-2xl rounded-[48px] overflow-hidden md:min-h-[640px]"
    >
      <!-- Desktop / tablet layout -->
      <div class="hidden h-full md:block">
        <div
          class="absolute inset-0 flex w-[200%] transition-transform duration-[650ms] ease-in-out"
          :class="isRegister ? '-translate-x-1/2' : 'translate-x-0'"
        >
          <!-- Sign In -->
          <section
            class="basis-1/2 flex-shrink-0 px-10 pt-12 pb-16 flex flex-col justify-start transition-all duration-[650ms] ease-in-out relative z-20"
            :class="
              isRegister
                ? 'opacity-0 scale-95 pointer-events-none'
                : 'opacity-100 scale-100 pointer-events-auto'
            "
          >
            <div class="w-full max-w-sm mr-auto">
              <header class="text-left">
                <p
                  class="text-xs font-semibold tracking-wide text-primaryLight uppercase"
                >
                  Selamat Datang
                </p>
                <h2 class="text-3xl font-semibold text-primaryDark mt-1">
                  Masuk
                </h2>
                <p class="mt-3 text-sm text-gray-500 leading-relaxed">
                  Masuk menggunakan email dan password Anda untuk melanjutkan
                  pengelolaan dashboard.
                </p>
              </header>

              <form
                novalidate
                @submit.prevent="handleLogin"
                class="mt-6 space-y-6"
              >
                <FormField
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  v-model="loginEmail"
                  :error="formErrors.login.email"
                />
                <FormPasswordField
                  label="Password"
                  placeholder="Masukkan password"
                  v-model="loginPassword"
                  :revealed="showLoginPassword"
                  :error="formErrors.login.password"
                  @toggle="showLoginPassword = !showLoginPassword"
                />

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="!isLoading">Masuk</span>
                  <span v-else>Memproses...</span>
                </button>
                <div class="text-right">
                  <button
                    type="button"
                    class="text-sm font-medium text-primaryLight hover:text-primaryDark transition disabled:opacity-50"
                    @click="goToResetPassword"
                  >
                    Lupa password?
                  </button>
                </div>
                <p class="text-xs text-gray-500 text-right">
                  Tidak menerima email verifikasi?
                  <button
                    type="button"
                    class="font-semibold text-primaryLight hover:text-primaryDark transition disabled:opacity-50 ml-1"
                    @click="openEmailVerificationFromLogin"
                  >
                    Verifikasi email
                  </button>
                </p>
              </form>

              <AlertBanner v-if="loginError" tone="error" class="mt-3">
                {{ loginError }}
              </AlertBanner>
              <AlertBanner v-else-if="loginInfo" tone="success" class="mt-6">
                {{ loginInfo }}
              </AlertBanner>
            </div>
          </section>

          <!-- Sign Up -->
          <section
            class="basis-1/2 flex-shrink-0 px-10 pt-12 pb-16 flex flex-col justify-start transition-all duration-[650ms] ease-in-out overflow-y-auto relative z-20"
            :class="
              isRegister
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            "
          >
            <div class="w-full max-w-sm ml-auto pr-1 mt-6">
              <header class="text-left">
                <p
                  class="text-xs font-semibold tracking-wide text-primaryLight uppercase"
                >
                  Akun Baru
                </p>
                <h2 class="text-3xl font-semibold text-primaryDark mt-1">
                  Daftar
                </h2>
                <p class="mt-3 text-sm text-gray-500 leading-relaxed">
                  Isi informasi berikut untuk membuat akun dan nikmati seluruh
                  fitur dashboard.
                </p>
              </header>

              <form
                novalidate
                @submit.prevent="handleRegister"
                class="mt-6 space-y-3"
              >
                <FormField
                  label="Nama"
                  placeholder="Nama lengkap"
                  v-model="registerName"
                  :error="formErrors.register.name"
                />
                <FormField
                  label="Email"
                  type="email"
                  placeholder="nama@gmail.com"
                  v-model="registerEmail"
                  :error="formErrors.register.email"
                />
                <FormField
                  label="No Telepon"
                  type="tel"
                  inputmode="tel"
                  placeholder="08xxxxxxxxxx"
                  v-model="registerPhone"
                  :error="formErrors.register.phone"
                />
                <FormPasswordField
                  label="Password"
                  placeholder="Buat password"
                  v-model="registerPassword"
                  :revealed="showRegisterPassword"
                  :error="formErrors.register.password"
                  @toggle="showRegisterPassword = !showRegisterPassword"
                />
                <FormPasswordField
                  label="Konfirmasi Password"
                  placeholder="Ulangi password"
                  v-model="registerConfirmPassword"
                  :revealed="showRegisterConfirmPassword"
                  :error="formErrors.register.confirmPassword"
                  @toggle="
                    showRegisterConfirmPassword = !showRegisterConfirmPassword
                  "
                />
                <label
                  class="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600"
                >
                  <input
                    v-model="registerUseKodeUndangan"
                    type="checkbox"
                    class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/60"
                  />
                  <span class="leading-5"> Saya memiliki kode undangan </span>
                </label>
                <p class="text-xs text-gray-500 px-1">
                  Tidak punya kode? Biarkan opsi ini tidak dicentang dan Anda
                  tetap bisa daftar.
                </p>
                <FormField
                  v-if="registerUseKodeUndangan"
                  label="Kode Undangan"
                  placeholder="Masukkan kode undangan"
                  v-model="registerKodeUndangan"
                  :error="formErrors.register.kodeUndangan"
                />
                <FormField
                  v-if="registerUseKodeUndangan"
                  label="NIP"
                  placeholder="Masukkan NIP"
                  v-model="registerEmploymentId"
                  :error="formErrors.register.employmentId"
                />
                <button
                  v-if="registerUseKodeUndangan"
                  type="button"
                  class="text-xs font-semibold text-primaryLight hover:text-primaryDark transition px-1"
                  @click="disableInvitationMode"
                >
                  Daftar tanpa kode undangan
                </button>

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="!isLoading">Daftar</span>
                  <span v-else>Memproses...</span>
                </button>
              </form>

              <AlertBanner v-if="registerError" tone="error" class="mt-6">
                {{ registerError }}
              </AlertBanner>
              <AlertBanner
                v-else-if="registerSuccess"
                tone="success"
                class="mt-6"
              >
                {{ registerSuccess }}
              </AlertBanner>
            </div>
          </section>
        </div>

        <div
          class="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-br from-primaryLight to-primaryDark text-white transition-transform duration-700 ease-in-out flex flex-col items-center justify-center text-center px-10 overflow-hidden z-10"
          :class="
            isRegister
              ? 'translate-x-0 rounded-l-[48px] rounded-r-[48px]'
              : 'translate-x-full rounded-l-[48px] rounded-r-[48px]'
          "
        >
          <div
            class="pointer-events-none absolute top-1/2 -translate-y-1/2 w-[260px] h-[260px] bg-white/20 rounded-full blur-3xl opacity-70 transition-all duration-700"
            :class="isRegister ? 'right-[-80px]' : 'left-[-80px]'"
          ></div>

          <transition name="fade" mode="out-in">
            <div v-if="!isRegister" key="cta-register" class="space-y-6">
              <h3 class="text-2xl font-semibold">Welcome!</h3>
              <p class="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
                Belum punya akun? Daftar sekarang untuk mulai menggunakan semua
                fitur dashboard kami.
              </p>
              <button
                type="button"
                class="mt-4 border border-white/60 text-white font-medium px-10 py-3 rounded-full hover:bg-white hover:text-primaryDark transition pointer-events-auto"
                @click="switchToRegister"
              >
                Daftar
              </button>
            </div>
            <div v-else key="cta-login" class="space-y-6">
              <h3 class="text-2xl font-semibold">Welcome Back!</h3>
              <p class="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
                Sudah punya akun? Masuk untuk melanjutkan pengelolaan dashboard
                Anda.
              </p>
              <button
                type="button"
                class="mt-4 border border-white/60 text-white font-medium px-10 py-3 rounded-full hover:bg-white hover:text-primaryDark transition pointer-events-auto"
                @click="switchToLogin"
              >
                Masuk
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Mobile layout -->
      <div class="md:hidden relative z-10 px-6 py-10 space-y-8">
        <div
          class="flex justify-center gap-3 bg-primaryLight/10 rounded-full p-1"
        >
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-full transition"
            :class="
              !isRegister
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark text-white shadow-md'
                : 'text-primaryDark'
            "
            @click="switchToLogin"
          >
            Masuk
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-full transition"
            :class="
              isRegister
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark text-white shadow-md'
                : 'text-primaryDark'
            "
            @click="switchToRegister"
          >
            Daftar
          </button>
        </div>

        <transition name="mobile-switch" mode="out-in">
          <div v-if="!isRegister" key="mobile-login" class="space-y-6">
            <header class="text-center space-y-2">
              <h2 class="text-2xl font-semibold text-primaryDark">Masuk</h2>
              <p class="text-sm text-gray-500">
                Masuk menggunakan email dan password Anda.
              </p>
            </header>

            <form novalidate @submit.prevent="handleLogin" class="space-y-3">
              <FormField
                label="Email"
                type="email"
                placeholder="nama@gmail.com"
                v-model="loginEmail"
                :error="formErrors.login.email"
              />
              <FormPasswordField
                label="Password"
                placeholder="Masukkan password"
                v-model="loginPassword"
                :revealed="showLoginPassword"
                :error="formErrors.login.password"
                @toggle="showLoginPassword = !showLoginPassword"
              />
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Masuk</span>
                <span v-else>Memproses...</span>
              </button>
              <div class="text-center">
                <button
                  type="button"
                  class="text-sm font-medium text-primaryLight hover:text-primaryDark transition disabled:opacity-50"
                  @click="goToResetPassword"
                >
                  Lupa password?
                </button>
              </div>
              <p class="text-xs text-gray-500 text-center">
                Tidak menerima email verifikasi?
                <button
                  type="button"
                  class="font-semibold text-primaryLight hover:text-primaryDark transition disabled:opacity-50 ml-1"
                  @click="openEmailVerificationFromLogin"
                >
                  Verifikasi email
                </button>
              </p>
            </form>

            <AlertBanner v-if="loginError" tone="error">
              {{ loginError }}
            </AlertBanner>
            <AlertBanner v-else-if="loginInfo" tone="success">
              {{ loginInfo }}
            </AlertBanner>
          </div>

          <div v-else key="mobile-register" class="space-y-6">
            <header class="text-center space-y-2">
              <h2 class="text-2xl font-semibold text-primaryDark">Daftar</h2>
              <p class="text-sm text-gray-500">
                Buat akun baru untuk mengakses dashboard.
              </p>
            </header>

            <form novalidate @submit.prevent="handleRegister" class="space-y-3">
              <FormField
                label="Nama"
                placeholder="Nama lengkap"
                v-model="registerName"
                :error="formErrors.register.name"
              />
              <FormField
                label="Email"
                type="email"
                placeholder="nama@gmail.com"
                v-model="registerEmail"
                :error="formErrors.register.email"
              />
              <FormField
                label="No Telepon"
                type="tel"
                inputmode="tel"
                placeholder="08xxxxxxxxxx"
                v-model="registerPhone"
                :error="formErrors.register.phone"
              />
              <FormPasswordField
                label="Password"
                placeholder="Buat password"
                v-model="registerPassword"
                :revealed="showRegisterPassword"
                :error="formErrors.register.password"
                @toggle="showRegisterPassword = !showRegisterPassword"
              />
              <FormPasswordField
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                v-model="registerConfirmPassword"
                :revealed="showRegisterConfirmPassword"
                :error="formErrors.register.confirmPassword"
                @toggle="
                  showRegisterConfirmPassword = !showRegisterConfirmPassword
                "
              />
              <label
                class="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600"
              >
                <input
                  v-model="registerUseKodeUndangan"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/60"
                />
                <span class="leading-5"> Saya memiliki kode undangan. </span>
              </label>
              <p class="text-xs text-gray-500 px-1">
                Tidak punya kode? Biarkan opsi ini tidak dicentang dan Anda
                tetap bisa daftar.
              </p>
              <FormField
                v-if="registerUseKodeUndangan"
                label="Kode Undangan"
                placeholder="Masukkan kode undangan"
                v-model="registerKodeUndangan"
                :error="formErrors.register.kodeUndangan"
              />
              <FormField
                v-if="registerUseKodeUndangan"
                label="NIP"
                placeholder="Masukkan NIP"
                v-model="registerEmploymentId"
                :error="formErrors.register.employmentId"
              />
              <button
                v-if="registerUseKodeUndangan"
                type="button"
                class="text-xs font-semibold text-primaryLight hover:text-primaryDark transition px-1"
                @click="disableInvitationMode"
              >
                Daftar tanpa kode undangan
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Daftar</span>
                <span v-else>Memproses...</span>
              </button>
            </form>

            <AlertBanner v-if="registerError" tone="error">
              {{ registerError }}
            </AlertBanner>
            <AlertBanner v-else-if="registerSuccess" tone="success">
              {{ registerSuccess }}
            </AlertBanner>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  defineComponent,
  h,
  reactive,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import AlertBanner from '@/components/feedback/AlertBanner.vue';
import {
  EyeIcon as OutlineEyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const AUTH_ROUTE_DELAY = 380;
const PENDING_VERIFICATION_KEY = 'pendingVerificationEmail';
let pendingRouteSync = null;

// Toggle tampilan login vs register
const isRegister = ref(route.meta.authMode === 'register');
// Toggle tampilan login/daftar

const loginEmail = ref('');
const loginPassword = ref('');
const showLoginPassword = ref(false);
// Pesan error login yang ditampilkan di AlertBanner
const loginError = ref('');
const loginInfo = ref('');
// Kumpulan error untuk login & register
const formErrors = reactive({
  // Kumpulan error per form (login/register)
  login: {
    email: '',
    password: '',
  },
  register: {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    kodeUndangan: '',
    employmentId: '',
  },
});

const registerName = ref('');
const registerEmail = ref('');
const registerPhone = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
// Mode registrasi dengan/ tanpa kode undangan
const registerUseKodeUndangan = ref(false);
const registerKodeUndangan = ref('');
const registerEmploymentId = ref('');
const showRegisterPassword = ref(false);
const showRegisterConfirmPassword = ref(false);
const registerError = ref('');
const registerSuccess = ref('');

const isLoading = computed(() => authStore.loading);

watch(
  () => route.query.email,
  (value) => {
    if (typeof value === 'string' && value.trim()) {
      loginEmail.value = value;
    }
  },
  { immediate: true }
);

watch(
  () => route.query.verified,
  (value) => {
    if (value === '1' || value === 'true') {
      loginInfo.value = 'Email berhasil diverifikasi. Silakan masuk.';
    }
  },
  { immediate: true }
);

watch(
  () => route.meta.authMode,
  (mode) => {
    if (route.meta?.layout !== 'auth') retudrn;
    const shouldRegister = mode === 'register';
    if (isRegister.value !== shouldRegister) {
      isRegister.value = shouldRegister;
    }
  }
);

watch(
  () => route.meta.layout,
  (layout) => {
    if (layout !== 'auth' && isRegister.value) {
      isRegister.value = false;
    }
  }
);

watch(isRegister, (value, oldValue) => {
  if (value === oldValue) return;
  if (route.meta?.layout !== 'auth') return;
  loginError.value = '';
  if (value) {
    loginInfo.value = '';
  }
  registerError.value = '';
  registerSuccess.value = '';

  const currentMode = route.meta.authMode;
  const targetPath = value ? '/register' : '/login';
  if (
    (value && currentMode !== 'register') ||
    (!value && currentMode !== 'login')
  ) {
    scheduleAuthRoute(targetPath);
  }
});

watch(registerUseKodeUndangan, (value) => {
  if (value) return;
  registerKodeUndangan.value = '';
  formErrors.register.kodeUndangan = '';
  registerEmploymentId.value = '';
  formErrors.register.employmentId = '';
});

// Reset field yang terkait kode undangan
function disableInvitationMode() {
  if (!registerUseKodeUndangan.value) return;
  registerUseKodeUndangan.value = false;
}

// Navigasi ke halaman reset password
function goToResetPassword() {
  // Navigasi ke halaman reset password
  const trimmed = loginEmail.value.trim();
  const query = trimmed ? { email: trimmed } : undefined;
  if (query) {
    router.push({ path: '/reset-password', query });
  } else {
    router.push('/reset-password');
  }
}

function navigateToEmailVerification({
  email = '',
  autoSend = false,
  lockEmail = false,
} = {}) {
  const query = {};
  const trimmed = typeof email === 'string' ? email.trim() : '';
  if (trimmed) {
    query.email = trimmed;
    if (lockEmail) {
      query.lock = '1';
    }
  }
  if (autoSend) {
    query.auto = '1';
  }
  const hasQuery = Object.keys(query).length > 0;
  if (hasQuery) {
    router.push({ path: '/verify-email', query });
  } else {
    router.push('/verify-email');
  }
}

// Arahkan ke verifikasi email dari layar login
function openEmailVerificationFromLogin() {
  // Buka halaman verifikasi email dari login
  navigateToEmailVerification({
    email: loginEmail.value,
    lockEmail: !!loginEmail.value.trim(),
  });
}

onBeforeUnmount(() => {
  if (pendingRouteSync) {
    clearTimeout(pendingRouteSync);
    pendingRouteSync = null;
  }
});

// Proses login via authStore + fetch profile
async function handleLogin() {
  loginError.value = '';
  loginInfo.value = '';
  formErrors.login.email = loginEmail.value.trim() ? '' : 'Email wajib diisi.';
  formErrors.login.password = loginPassword.value.trim()
    ? ''
    : 'Password wajib diisi.';

  if (formErrors.login.email || formErrors.login.password) {
    loginError.value = 'Harap lengkapi data login Anda.';
    return;
  }

  const trimmedEmail = loginEmail.value.trim();
  const normalizedEmail = trimmedEmail.toLowerCase();
  const pendingEmail = (
    localStorage.getItem(PENDING_VERIFICATION_KEY) || ''
  ).toLowerCase();
  if (pendingEmail && normalizedEmail && pendingEmail === normalizedEmail) {
    loginError.value =
      'Email Anda belum diverifikasi. Silakan masukkan kode yang dikirim ke email.';
    navigateToEmailVerification({
      email: trimmedEmail,
      lockEmail: true,
      autoSend: true,
    });
    return;
  }

  const res = await authStore.login({
    email: trimmedEmail,
    password: loginPassword.value,
  });
  if (res.ok) {
    resetErrors();
    if (pendingEmail && pendingEmail === normalizedEmail) {
      localStorage.removeItem(PENDING_VERIFICATION_KEY);
    }
    if (route.path !== '/dashboard') {
      await router.push('/dashboard');
    } else {
      await router.replace('/dashboard');
    }
    await nextTick();
  } else {
    loginError.value = res.message || 'Email atau password salah.';
    if (res.errors?.email?.length) {
      [formErrors.login.email] = res.errors.email;
    }
    if (res.errors?.password?.length) {
      [formErrors.login.password] = res.errors.password;
    }
    if (res.status === 401) {
      const fallback = res.message || 'Email atau password salah.';
      if (!formErrors.login.email) {
        formErrors.login.email = fallback;
      }
      if (!formErrors.login.password) {
        formErrors.login.password = fallback;
      }
    }
  }
}

function applyInvitationMessage(message) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  let applied = false;
  if (normalized.includes('kode undangan')) {
    if (!formErrors.register.kodeUndangan) {
      formErrors.register.kodeUndangan = message;
    }
    applied = true;
  }
  if (
    normalized.includes('nip') ||
    normalized.includes('identitas') ||
    normalized.includes('employment')
  ) {
    if (!formErrors.register.employmentId) {
      formErrors.register.employmentId = message;
    }
    applied = true;
  }
  return applied;
}

function applyGeneralMessageToField(message) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  const setIfEmpty = (field) => {
    if (!formErrors.register[field]) {
      formErrors.register[field] = message;
      return true;
    }
    return false;
  };
  if (normalized.includes('nama')) return setIfEmpty('name');
  if (normalized.includes('email')) return setIfEmpty('email');
  if (normalized.includes('telepon') || normalized.includes('phone'))
    return setIfEmpty('phone');
  if (normalized.includes('konfirmasi')) {
    let applied = setIfEmpty('confirmPassword');
    if (!formErrors.register.password) {
      formErrors.register.password = message;
      applied = true;
    }
    return applied;
  }
  if (normalized.includes('password')) return setIfEmpty('password');
  return false;
}

// Proses registrasi (opsional kode undangan/NIP)
async function handleRegister() {
  registerError.value = '';
  registerSuccess.value = '';
  formErrors.register.name = registerName.value.trim()
    ? ''
    : 'Nama wajib diisi.';
  formErrors.register.email = registerEmail.value.trim()
    ? ''
    : 'Email wajib diisi.';
  formErrors.register.phone = registerPhone.value.trim()
    ? ''
    : 'Nomor telepon wajib diisi';
  formErrors.register.password = registerPassword.value.trim()
    ? ''
    : 'Password wajib diisi.';
  formErrors.register.confirmPassword = registerConfirmPassword.value.trim()
    ? ''
    : 'Konfirmasi password wajib diisi.';

  if (!formErrors.register.phone) {
    if (!/^(0|\+?\d)\d{8,15}$/.test(registerPhone.value.trim())) {
      formErrors.register.phone = 'Nomor telepon tidak valid.';
    } else {
      formErrors.register.phone = '';
    }
  }

  if (registerUseKodeUndangan.value) {
    formErrors.register.kodeUndangan = registerKodeUndangan.value.trim()
      ? ''
      : 'Kode undangan wajib diisi.';
    formErrors.register.employmentId = registerEmploymentId.value.trim()
      ? ''
      : 'NIP wajib diisi.';
  } else {
    formErrors.register.kodeUndangan = '';
    formErrors.register.employmentId = '';
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    registerError.value = 'Password dan konfirmasi password tidak sama.';
    formErrors.register.password = 'Pastikan password sama.';
    formErrors.register.confirmPassword = 'Pastikan password sama.';
    return;
  }

  if (
    formErrors.register.name ||
    formErrors.register.email ||
    formErrors.register.password ||
    formErrors.register.confirmPassword ||
    formErrors.register.phone ||
    formErrors.register.kodeUndangan ||
    formErrors.register.employmentId
  ) {
    registerError.value = 'Harap lengkapi data yang diperlukan.';
    return;
  }

  const usingInvitation = registerUseKodeUndangan.value;
  const trimmedName = registerName.value.trim();
  const trimmedEmail = registerEmail.value.trim();
  const trimmedPhone = registerPhone.value.trim();
  const trimmedInvitation = usingInvitation
    ? registerKodeUndangan.value.trim()
    : undefined;
  const trimmedEmployment = usingInvitation
    ? registerEmploymentId.value.trim()
    : undefined;

  const registerPayload = {
    name: trimmedName,
    email: trimmedEmail,
    password: registerPassword.value,
    password_confirmation: registerConfirmPassword.value,
    phone_number: trimmedPhone,
  };

  if (usingInvitation) {
    registerPayload.invitation_code = trimmedInvitation;
    registerPayload.employment_identity_number = trimmedEmployment;
  }

  const res = await authStore.register(registerPayload);

  if (res.ok) {
    registerSuccess.value =
      res.message || 'Registrasi berhasil. Silakan masuk.';
    loginEmail.value = trimmedEmail;
    loginPassword.value = registerPassword.value;
    registerName.value = trimmedName;
    registerEmail.value = trimmedEmail;
    registerPhone.value = trimmedPhone;
    registerUseKodeUndangan.value = false;
    registerKodeUndangan.value = '';
    registerEmploymentId.value = '';
    localStorage.setItem(PENDING_VERIFICATION_KEY, trimmedEmail.toLowerCase());
    navigateToEmailVerification({
      email: trimmedEmail,
      lockEmail: true,
      autoSend: true,
    });
    resetErrors();
  } else {
    registerError.value = res.message || 'Registrasi gagal. Coba lagi.';
    const { errors, status } = res;
    if (errors?.name?.length) {
      [formErrors.register.name] = errors.name;
    }
    if (errors?.email?.length) {
      [formErrors.register.email] = errors.email;
    }
    if (errors?.password?.length) {
      [formErrors.register.password] = errors.password;
    }
    if (errors?.password_confirmation?.length) {
      [formErrors.register.confirmPassword] = errors.password_confirmation;
      if (!formErrors.register.password) {
        [formErrors.register.password] = errors.password_confirmation;
      }
    }
    if (errors?.phone_number?.length) {
      [formErrors.register.phone] = errors.phone_number;
    }
    if (usingInvitation && errors?.invitation_code?.length) {
      [formErrors.register.kodeUndangan] = errors.invitation_code;
    }
    if (usingInvitation && errors?.employment_identity_number?.length) {
      [formErrors.register.employmentId] = errors.employment_identity_number;
    }
    if (!errors && typeof res.message === 'string' && res.message) {
      let handled = false;
      if (usingInvitation && [400, 404].includes(status)) {
        handled = applyInvitationMessage(res.message);
      }
      if (!handled) {
        handled = applyGeneralMessageToField(res.message);
      }
      if (!handled && status === 422 && !formErrors.register.email) {
        formErrors.register.email = res.message;
      }
    }
  }
}

function scheduleAuthRoute(path) {
  if (pendingRouteSync) {
    clearTimeout(pendingRouteSync);
    pendingRouteSync = null;
  }
  if (router.currentRoute.value.path === path) return;
  pendingRouteSync = setTimeout(() => {
    if (router.currentRoute.value.path !== path) {
      router.replace(path);
    }
    pendingRouteSync = null;
  }, AUTH_ROUTE_DELAY);
}

function switchToRegister() {
  if (route.meta?.layout !== 'auth') return;
  isRegister.value = true;
  resetErrors();
  scheduleAuthRoute('/register');
}

function switchToLogin() {
  if (route.meta?.layout !== 'auth') return;
  isRegister.value = false;
  resetErrors();
  scheduleAuthRoute('/login');
}

function resetErrors() {
  formErrors.login.email = '';
  formErrors.login.password = '';
  formErrors.register.name = '';
  formErrors.register.email = '';
  formErrors.register.phone = '';
  formErrors.register.password = '';
  formErrors.register.confirmPassword = '';
  formErrors.register.kodeUndangan = '';
  formErrors.register.employmentId = '';
  loginError.value = '';
  registerError.value = '';
  registerSuccess.value = '';
}

const FormField = defineComponent({
  props: {
    modelValue: String,
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text',
    },
    inputmode: {
      type: String,
      default: undefined,
    },
    error: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (event) => emit('update:modelValue', event.target.value);
    return () =>
      h('div', { class: 'space-y-2' }, [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700' },
          props.label
        ),
        h('input', {
          class:
            'w-full rounded-xl px-4 py-3 shadow-sm focus:outline-none transition-all ' +
            (props.error
              ? 'border border-red-400 focus:ring-2 focus:ring-red-300'
              : 'border border-gray-200 focus:ring-2 focus:ring-primaryLight'),
          type: props.type,
          placeholder: props.placeholder,
          value: props.modelValue,
          inputmode: props.inputmode,
          readonly: props.readonly,
          onInput,
        }),
        props.error
          ? h('p', { class: 'text-xs text-red-500 font-medium' }, props.error)
          : null,
      ]);
  },
});

const FormPasswordField = defineComponent({
  props: {
    modelValue: String,
    label: String,
    placeholder: String,
    error: {
      type: String,
      default: '',
    },
    revealed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'toggle'],
  setup(props, { emit }) {
    const onInput = (event) => emit('update:modelValue', event.target.value);
    return () =>
      h('div', { class: 'space-y-2' }, [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700' },
          props.label
        ),
        h('div', { class: 'relative' }, [
          h('input', {
            class:
              'w-full rounded-xl px-4 py-3 shadow-sm focus:outline-none transition-all pr-12 ' +
              (props.error
                ? 'border border-red-400 focus:ring-2 focus:ring-red-300'
                : 'border border-gray-200 focus:ring-2 focus:ring-primaryLight'),
            type: props.revealed ? 'text' : 'password',
            placeholder: props.placeholder,
            value: props.modelValue,
            required: true,
            onInput,
          }),
          h(
            'button',
            {
              type: 'button',
              class:
                'absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition',
              onClick: () => emit('toggle'),
              'aria-label': 'Tampilkan password',
            },
            [
              h(props.revealed ? EyeSlashIcon : OutlineEyeIcon, {
                class: 'w-5 h-5',
              }),
            ]
          ),
        ]),
        props.error
          ? h('p', { class: 'text-xs text-red-500 font-medium' }, props.error)
          : null,
      ]);
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.mobile-switch-enter-active,
.mobile-switch-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.mobile-switch-enter-from,
.mobile-switch-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
