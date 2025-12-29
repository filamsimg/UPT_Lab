// Composable helper untuk memeriksa permission berbasis useAuthStore
import { computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

function normalizePermissionName(value) {
// Normalisasi nama permission (string/objek) ke lowercase
  if (value == null) return null;
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'object') {
    const raw =
      value.name ??
      value.identifier ??
      value.slug ??
      value.code ??
      value.id;
    if (raw == null) return null;
    return String(raw).trim().toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function normalizeRoleName(value) {
// Normalisasi nama role untuk deteksi super admin
  if (typeof value !== 'string') return null;
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function isSuperAdminUser(user) {
  if (!user) return false;
  if (user.is_super_admin ?? user.isSuperAdmin) return true;

  const roleCandidates = [];
  if (typeof user.role === 'string') roleCandidates.push(user.role);
  if (typeof user.role_name === 'string') roleCandidates.push(user.role_name);
  if (typeof user.roleName === 'string') roleCandidates.push(user.roleName);
  if (Array.isArray(user.roles)) {
    user.roles.forEach((role) => {
      if (typeof role?.slug === 'string') roleCandidates.push(role.slug);
      if (typeof role?.code === 'string') roleCandidates.push(role.code);
      if (typeof role?.name === 'string') roleCandidates.push(role.name);
    });
  }

  return roleCandidates.some(
    (candidate) => normalizeRoleName(candidate) === 'super_admin'
  );
}

export function buildPermissionSet(user) {
// Bangun set permission unik dari user + roles
  const set = new Set();
  if (!user) return set;

  const append = (entry) => {
    const normalized = normalizePermissionName(entry);
    if (normalized) set.add(normalized);
  };

  const directPermissions = user.permission_names || user.permissionNames;
  if (Array.isArray(directPermissions)) {
    directPermissions.forEach(append);
  }

  const rawPermissions = user.permissions;
  if (Array.isArray(rawPermissions)) {
    rawPermissions.forEach(append);
  }

  if (Array.isArray(user.roles)) {
    user.roles.forEach((role) => {
      if (Array.isArray(role?.permissions)) {
        role.permissions.forEach(append);
      }
      if (Array.isArray(role?.permission_names)) {
        role.permission_names.forEach(append);
      }
    });
  }

  return set;
}

export function useAuthorization() {
  const authStore = useAuthStore();

  const permissionSet = computed(() =>
  // Set permission hasil buildPermissionSet
    buildPermissionSet(authStore.currentUser)
  );
  const superAdmin = computed(() => isSuperAdminUser(authStore.currentUser));
  // Flag jika super admin selalu lolos

  const hasPermission = (name) => {
  // Cek satu permission (super admin bypass)
    const normalized = normalizePermissionName(name);
    if (!normalized) return false;
    if (superAdmin.value) return true;
    return permissionSet.value.has(normalized);
  };

  const hasAnyPermission = (...names) => {
  // Cek salah satu permission dari list/array
    for (const entry of names) {
      if (Array.isArray(entry)) {
        if (entry.some((permission) => hasPermission(permission))) return true;
      } else if (hasPermission(entry)) {
        return true;
      }
    }
    return false;
  };

  const permissions = computed(() => new Set(permissionSet.value));

  return {
    hasPermission,
    hasAnyPermission,
    permissions,
    isSuperAdmin: superAdmin,
  };
}
