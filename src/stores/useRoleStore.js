// Store role: CRUD role dan assign permissions
import { defineStore } from 'pinia';
import api from '@/services/apiServices';

function normalizePermission(entry = {}) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    return {
      id: entry,
      name: entry
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      identifier: entry,
    };
  }

  const id = entry.id || entry.identifier || entry.code || entry.slug || entry.name;
  const name = entry.name || entry.title || entry.label || id || 'Permission';
  const category = entry.category || entry.module || 'general';
  return {
    id,
    name,
    identifier: entry.identifier || id,
    category,
    description: entry.description || '',
  };
}

function normalizeRole(entry = {}) {
  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.map((perm) => normalizePermission(perm)).filter(Boolean)
    : [];

  const userCount = Array.isArray(entry.users)
    ? entry.users.length
    : Number(entry.user_count ?? entry.users_count ?? entry.users ?? 0);

  return {
    id: entry.id || entry.slug || entry.name,
    name: (entry.name || 'Role').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: entry.description || '',
    isDefault:
      entry.is_default ?? entry.default ?? entry.isDefault ?? entry.default_role ?? false,
    permissions,
    userCount,
    permissionCount: entry.permission_count ?? permissions.length,
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  };
}

function buildRoleFormData(payload = {}) {
  const formData = new FormData();
  if (payload.name) formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);

  const permissionIds = (
    Array.isArray(payload.permission_ids)
      ? payload.permission_ids
      : Array.isArray(payload.permissions)
      ? payload.permissions
      : payload.permission_id !== undefined
      ? Array.isArray(payload.permission_id)
        ? payload.permission_id
        : [payload.permission_id]
      : []
  )
    .map((permission) => (typeof permission === 'object' ? permission.id : permission))
    .filter(Boolean);

  permissionIds.forEach((permissionId) => formData.append('permission_id', permissionId));

  if (payload.is_default !== undefined || payload.isDefault !== undefined) {
    const isDefault = payload.is_default ?? payload.isDefault;
    formData.append('is_default', isDefault ? 'true' : 'false');
  }

  return formData;
}

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    loading: false,
    saving: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    search: '',
  }),

  getters: {
    permissionPool(state) {
      const map = new Map();
      state.roles.forEach((role) => {
        role.permissions.forEach((permission) => {
          if (!map.has(permission.id)) map.set(permission.id, permission);
        });
      });
      return Array.from(map.values());
    },
  },

  actions: {
    async fetchRoles(params = {}) {
      this.loading = true;
      const page = params.page ?? this.pagination.currentPage ?? 1;
      const basePerPage = params.perPage ?? this.pagination.perPage ?? 10;
      const rawSearch = params.search ?? this.search ?? '';
      const searchTerm = typeof rawSearch === 'string' ? rawSearch.trim() : '';
      const hasSearch = Boolean(searchTerm);
      const knownTotal = this.pagination.totalItems || 0;
      const effectivePerPage = hasSearch
        ? Math.max(knownTotal, basePerPage, 10)
        : basePerPage;
      const requestPage = hasSearch ? 1 : Math.max(page, 1);

      const fetchPage = async (pageNumber) => {
        const query = new URLSearchParams();
        query.set('page', pageNumber);
        query.set('per_page', effectivePerPage);
        if (!hasSearch && searchTerm) query.set('search', searchTerm);
        ['permissions', 'users'].forEach((include) => query.append('include', include));
        const endpoint = `/api/v1/roles?${query.toString()}`;
        const response = await api.get(endpoint);
        return response.data?.data ?? {};
      };

      try {
        const firstPayload = await fetchPage(requestPage);
        let items = Array.isArray(firstPayload.items)
          ? firstPayload.items.map((item) => normalizeRole(item))
          : [];
        let totalItems = firstPayload.total_items ?? firstPayload.total ?? items.length;

        if (hasSearch) {
          const lastPage = firstPayload.last_page ?? firstPayload.total_pages ?? requestPage;
          for (let nextPage = requestPage + 1; nextPage <= lastPage; nextPage += 1) {
            const nextPayload = await fetchPage(nextPage);
            if (Array.isArray(nextPayload.items)) {
              items = items.concat(
                nextPayload.items.map((entry) => normalizeRole(entry))
              );
            }
            const nextTotal = nextPayload.total_items ?? nextPayload.total ?? null;
            if (typeof nextTotal === 'number') {
              totalItems = nextTotal;
            }
          }
          const keyword = searchTerm.toLowerCase();
          const filtered = items.filter((role) =>
            role.name?.toLowerCase().includes(keyword)
          );
          this.roles = filtered;
          this.pagination = {
            currentPage: 1,
            perPage: basePerPage,
            lastPage: 1,
            totalItems,
            hasNextPage: false,
            hasPrevPage: false,
          };
          this.search = searchTerm;
          this.error = null;
          return;
        }

        this.roles = items;
        this.pagination = {
          currentPage: firstPayload.current_page ?? requestPage,
          perPage: firstPayload.per_page ?? effectivePerPage,
          lastPage: firstPayload.last_page ?? firstPayload.total_pages ?? requestPage,
          totalItems,
          hasNextPage: firstPayload.has_next_page ?? false,
          hasPrevPage: firstPayload.has_prev_page ?? false,
        };
        this.search = searchTerm;
        this.error = null;
      } catch (err) {
        console.error('[RoleStore] Gagal memuat data dari API', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data role dari API.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchRoles();
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return;
      await this.fetchRoles({ page });
    },

    setSearch(value) {
      this.search = value;
    },

    // Ambil detail role untuk mendukung deep-link form edit.
    async fetchById(id) {
      const target = String(id || '').trim();
      if (!target) {
        return { ok: false, error: 'Role id kosong.' };
      }
      try {
        const query = new URLSearchParams();
        ['permissions', 'users'].forEach((include) => query.append('include', include));
        const endpoint = `/api/v1/roles/${encodeURIComponent(target)}?${query.toString()}`;
        const response = await api.get(endpoint);
        const payload = response.data?.data ?? response.data ?? {};
        const normalized = normalizeRole(payload.role ?? payload);
        const idx = this.roles.findIndex((role) => role.id === normalized.id);
        if (idx !== -1) this.roles[idx] = normalized;
        else this.roles.unshift(normalized);
        return { ok: true, data: normalized };
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data role.';
        return { ok: false, error: message, status: err.response?.status || null };
      }
    },

    async createRole(payload) {
      this.saving = true;
      try {
        const body = buildRoleFormData(payload);
        const response = await api.post('/api/v1/roles', body);
        const apiData = response.data?.data ?? response.data;
        const created = normalizeRole(apiData?.role ?? apiData);
        if (this.pagination.currentPage === 1) {
          this.roles = [created, ...this.roles.filter((role) => role.id !== created.id)];
        }
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.error('[RoleStore] API create role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan role.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async updateRole(id, payload) {
      this.saving = true;
      try {
        const body = buildRoleFormData(payload);
        const response = await api.put(`/api/v1/roles/${id}`, body);
        const apiData = response.data?.data ?? response.data;
        const updated = normalizeRole(apiData?.role ?? apiData);
        const idx = this.roles.findIndex((role) => role.id === id);
        if (idx !== -1) this.roles[idx] = updated;
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.error('[RoleStore] API update role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui role.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async removeRole(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/roles/${id}`);
        this.roles = this.roles.filter((role) => role.id !== id);
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.error('[RoleStore] API delete role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus role.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async assignPermissions(roleId, permissionIds = []) {
      try {
        await api.post(`/api/v1/roles/${roleId}/permissions`, {
          permission_ids: permissionIds,
        });
        const idx = this.roles.findIndex((role) => role.id === roleId);
        if (idx !== -1) {
          this.roles[idx].permissions = permissionIds.map((id) =>
            normalizePermission({ id })
          );
          this.roles[idx].permissionCount = permissionIds.length;
        }
        return { ok: true };
      } catch (err) {
        console.error('[RoleStore] API assign permissions gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui permission role.';
        throw err;
      }
    },

    async setDefaultRole(id) {
      this.saving = true;
      try {
        const response = await api.patch(`/api/v1/roles/${id}/set-default`);
        const payload = response.data?.data ?? response.data ?? {};
        const updated = normalizeRole(payload.role ?? payload);
        this.roles = this.roles.map((role) => {
          if (role.id === updated.id) return { ...role, ...updated, isDefault: true };
          return { ...role, isDefault: false };
        });
        this.error = null;
        return {
          ok: true,
          data: updated,
          message: response.data?.message || 'Role berhasil dijadikan default.',
        };
      } catch (err) {
        console.error('[RoleStore] API set default gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menetapkan role default.';
        throw err;
      } finally {
        this.saving = false;
      }
    },
  },
});
