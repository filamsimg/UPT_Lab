// Router utama: definisi rute, guard auth/permission
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
const CetakOrderPage = () => import('../pages/CetakOrderPage.vue');
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
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiredPermission: 'material_test_orders.index' },
  },
  { path: '/profile', component: ProfilePage },
  { path: '/permintaan', component: PermintaanPage },
  {
    path: '/kaji-ulang',
    component: KajiUlangPage,
    meta: { requiredPermission: 'material_test_orders.index' },
  },
  {
    path: '/cetak-order',
    component: CetakOrderPage,
    meta: { requiredPermission: 'material_test_orders.index' },
  },
  { path: '/layanan', component: LayananPage },
  {
    path: '/laporan-keuangan',
    component: KeuanganPage,
    meta: {
      requiredPermissions: [
        'analytics.index',
        'analytics.summary',
        'analytic.index',
      ],
    },
  },
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

const normalizePermission = (value) => {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
};

const hasAnyPermission = (permissionSet, list = []) =>
  list.some((permission) => {
    const normalized = normalizePermission(permission);
    return normalized && permissionSet.has(normalized);
  });

const hasAllPermissions = (permissionSet, list = []) =>
  list.every((permission) => {
    const normalized = normalizePermission(permission);
    return normalized && permissionSet.has(normalized);
  });

// === ROUTE ACCESS HELPERS ===
const canAccessRoute = (route, permissionSet, isSuperAdmin) => {
  if (!route) return false;
  if (isSuperAdmin) return true;
  const meta = route.meta || {};
  const requiredPermission = meta.requiredPermission;
  if (requiredPermission) {
    const normalized = normalizePermission(requiredPermission);
    if (!normalized || !permissionSet.has(normalized)) {
      return false;
    }
  }

  const requiredPermissions = Array.isArray(meta.requiredPermissions)
    ? meta.requiredPermissions
    : [];
  if (requiredPermissions.length) {
    if (!hasAnyPermission(permissionSet, requiredPermissions)) {
      return false;
    }
  }

  const requiredPermissionsAll = Array.isArray(meta.requiredPermissionsAll)
    ? meta.requiredPermissionsAll
    : [];
  if (requiredPermissionsAll.length) {
    if (!hasAllPermissions(permissionSet, requiredPermissionsAll)) {
      return false;
    }
  }

  return true;
};

const FALLBACK_ROUTES = ['/dashboard', '/permintaan', '/profile'];

const resolveFallbackRoute = (permissionSet, isSuperAdmin) => {
  for (const path of FALLBACK_ROUTES) {
    const route = routes.find((item) => item.path === path);
    if (route && canAccessRoute(route, permissionSet, isSuperAdmin)) {
      return path;
    }
  }
  return '/login';
};
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

  const permissionSet = buildPermissionSet(authStore.currentUser);
  const isSuperAdmin = isSuperAdminUser(authStore.currentUser);
  const redirectToFallback = () => {
    const fallbackRoute = resolveFallbackRoute(permissionSet, isSuperAdmin);
    if (fallbackRoute && fallbackRoute !== to.path) {
      return next(fallbackRoute);
    }
    return next(false);
  };

  if (!isSuperAdmin) {
    const requiredPermission = to.meta?.requiredPermission;
    if (requiredPermission) {
      const normalized = normalizePermission(requiredPermission);
      if (!normalized || !permissionSet.has(normalized)) {
        return redirectToFallback();
      }
    }

    const requiredPermissions = Array.isArray(to.meta?.requiredPermissions)
      ? to.meta.requiredPermissions
      : [];
    if (requiredPermissions.length) {
      if (!hasAnyPermission(permissionSet, requiredPermissions)) {
        return redirectToFallback();
      }
    }

    const requiredPermissionsAll = Array.isArray(
      to.meta?.requiredPermissionsAll
    )
      ? to.meta.requiredPermissionsAll
      : [];
    if (requiredPermissionsAll.length) {
      if (!hasAllPermissions(permissionSet, requiredPermissionsAll)) {
        return redirectToFallback();
      }
    }
  }

  next();
});

export default router;
