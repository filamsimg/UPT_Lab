import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import {
  buildPermissionSet,
  isSuperAdminUser,
} from '@/composables/auth/useAuthorization';
import DashboardPage from '../pages/DashboardPage.vue';

// Lazy-load pages
const LandingPage = () => import('../pages/LandingPage.vue');
const PermintaanPage = () => import('../pages/PermintaanPage.vue');
const KajiUlangPage = () => import('../pages/KajiUlangPage.vue');
const ValidasiPage = () => import('../pages/ValidasiPage.vue');
const KartuKendaliPage = () => import('../pages/KartuKendaliPage.vue');
const SuratPerintahPage = () => import('../pages/SuratPerintahPage.vue');
const LayananPage = () => import('../pages/LayananPage.vue');
const AuthPage = () => import('../pages/AuthPage.vue');
const ResetPasswordPage = () => import('../pages/ResetPasswordPage.vue');
const EmailVerificationPage = () =>
  import('../pages/EmailVerificationPage.vue');
const KeuanganPage = () => import('../pages/KeuanganPage.vue');
const LaporanPage = () => import('../pages/LaporanPage.vue');
const UsersPage = () => import('../pages/UsersPage.vue');
const RolesPage = () => import('../pages/RolesPage.vue');
const PermissionsPage = () => import('../pages/PermissionsPage.vue');
const ProfilePage = () => import('../pages/ProfilePage.vue');
const ActivityPage = () => import('../pages/ActivityPage.vue');
const KodeUndanganPage = () => import('../pages/KodeUndanganPage.vue');

const routes = [
  { path: '/', component: LandingPage, meta: { layout: 'public' } },

  {
    path: '/login',
    component: AuthPage,
    meta: { layout: 'auth', authMode: 'login' },
  },
  {
    path: '/register',
    component: AuthPage,
    meta: { layout: 'auth', authMode: 'register' },
  },
  {
    path: '/reset-password',
    component: ResetPasswordPage,
    meta: { layout: 'auth', authMode: 'reset-password' },
  },
  {
    path: '/verify-email',
    component: EmailVerificationPage,
    meta: { layout: 'auth', authMode: 'verify-email' },
  },
  { path: '/dashboard', component: DashboardPage },
  { path: '/profile', component: ProfilePage },
  { path: '/permintaan', component: PermintaanPage },
  { path: '/kaji-ulang', component: KajiUlangPage },
  { path: '/validasi', component: ValidasiPage },
  { path: '/kartu-kendali', component: KartuKendaliPage },
  { path: '/surat-perintah', component: SuratPerintahPage },
  { path: '/layanan', component: LayananPage },
  { path: '/laporan-keuangan', component: KeuanganPage },
  { path: '/laporan', component: LaporanPage },
  { path: '/activity', component: ActivityPage },
  {
    path: '/users',
    component: UsersPage,
    meta: { requiredPermission: 'users.index' },
  },
  {
    path: '/roles',
    component: RolesPage,
    meta: { requiredPermission: 'roles.index' },
  },
  {
    path: '/permissions',
    component: PermissionsPage,
    meta: { requiredPermission: 'permissions.index' },
  },
  {
    path: '/kode-undangan',
    component: KodeUndanganPage,
    meta: { requiredPermission: 'users.store' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// === NAVIGATION GUARD ===
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Izinkan halaman dengan layout khusus tanpa autentikasi
  const publicLayouts = ['auth', 'print', 'public'];
  const isPublic = to.matched.some((record) =>
    publicLayouts.includes(record.meta?.layout)
  );
  if (isPublic) {
    return next();
  }

  if (!authStore.currentUser && !authStore.loading) {
    try {
      await authStore.init();
    } catch (err) {
      console.warn('Gagal sinkronisasi pengguna saat navigasi', err);
    }
  }

  if (!authStore.currentUser) {
    return next('/login');
  }

  const requiredPermission = to.meta?.requiredPermission;
  if (requiredPermission) {
    const permissionSet = buildPermissionSet(authStore.currentUser);
    const normalized = requiredPermission.trim().toLowerCase();
    if (
      !isSuperAdminUser(authStore.currentUser) &&
      !permissionSet.has(normalized)
    ) {
      return next('/dashboard');
    }
  }

  next();
});

export default router;
