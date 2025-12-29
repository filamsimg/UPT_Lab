import { defineStore } from 'pinia';
import api from '@/services/apiServices';

// Store manajemen pengguna: fetch/filter/pagination, CRUD, toggle aktivasi.

function normalizeRole(entry = {}) {
  if (!entry) return null;
  const id = entry.id || entry.slug || entry.code || entry.name;
  const name = entry.name || entry.title || entry.label || 'Role';
  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter(Boolean)
    : [];
  return { id, name, permissions };
}

function normalizeUser(entry = {}) {
  // Ratakan field snake/camel + agregasi role/permission dan status aktif
  const roles = Array.isArray(entry.roles)
    ? entry.roles.map((role) => normalizeRole(role)).filter(Boolean)
    : [];

  const aggregatedPermissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter(Boolean)
    : roles.flatMap((role) => role.permissions || []);

  const createdAt = entry.created_at || entry.createdAt || entry.created || '';
  const updatedAt = entry.updated_at || entry.updatedAt || entry.updated || '';
  const activatedAt = entry.activated_at || entry.activatedAt || null;
  const deactivatedAt = entry.deactivated_at || entry.deactivatedAt || null;
  const lastLoginAt =
    entry.last_login_at || entry.lastLoginAt || entry.lastSeen || '';

  const phoneNumber = entry.phone_number || entry.phone || entry.phoneNumber || '';
  const employmentIdentityNumber =
    entry.employment_identity_number || entry.employmentIdentityNumber || '';

  const isActive =
    entry.is_active ??
    entry.active ??
    (entry.status ? entry.status === 'active' : null) ??
    (deactivatedAt ? false : activatedAt ? true : null);

  return {
    id: entry.id || `user-${Math.random().toString(36).slice(2, 10)}`,
    name: entry.name || entry.full_name || 'Pengguna',
    email: entry.email || entry.username || '',
    phone: phoneNumber,
    phoneNumber,
    avatar: entry.avatar_url || entry.avatar || null,
    employmentIdentityNumber,
    roles,
    roleNames: roles.length ? roles.map((r) => r.name).join(', ') : '-',
    permissions: aggregatedPermissions,
    isActive,
    createdAt,
    updatedAt,
    activatedAt,
    deactivatedAt,
    lastLoginAt,
  };
}

function buildUserFormData(payload = {}) {
  const formData = new FormData();
  const appendIfFilled = (key, value, { allowEmptyString = false } = {}) => {
    if (value === undefined || value === null) return;
    if (!allowEmptyString && typeof value === 'string' && value.trim() === '') return;
    formData.append(key, value);
  };

  appendIfFilled('name', payload.name);
  appendIfFilled('email', payload.email);
  if (payload.password !== undefined) {
    appendIfFilled('password', payload.password, { allowEmptyString: true });
  }

  appendIfFilled('avatar', payload.avatar ?? payload.avatarFile ?? null);

  const phoneNumber =
    payload.phone_number ?? payload.phoneNumber ?? payload.phone ?? null;
  appendIfFilled('phone_number', phoneNumber);

  appendIfFilled(
    'employment_identity_number',
    payload.employment_identity_number ?? payload.employmentIdentityNumber
  );

  const rawRoleIds = Array.isArray(payload.role_ids)
    ? payload.role_ids
    : Array.isArray(payload.roles)
    ? payload.roles
    : payload.role_id
    ? [payload.role_id]
    : [];
  rawRoleIds
    .map((role) => (typeof role === 'object' ? role.id : role))
    .filter(Boolean)
    .forEach((roleId) => formData.append('role_id', roleId));

  if (payload.is_active !== undefined || payload.isActive !== undefined) {
    const isActive = payload.is_active ?? payload.isActive;
    formData.append('is_active', isActive ? 'true' : 'false');
  }

  return formData;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
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
    filters: {
      search: '',
      roleId: '',
      status: '',
    },
  }),

  getters: {
    roleOptions(state) {
      const map = new Map();
      state.users.forEach((user) => {
        user.roles.forEach((role) => {
          if (!map.has(role.id)) map.set(role.id, role);
        });
      });
      return Array.from(map.values());
    },
  },

  actions: {
    // Ambil daftar pengguna; jika filter client-side dibutuhkan, backend diambil semua halaman dulu
    async fetchUsers(params = {}) {
      this.loading = true;
      const page = params.page ?? this.pagination.currentPage ?? 1;
      const basePerPage = params.perPage ?? this.pagination.perPage ?? 10;
      const rawSearch = params.search ?? this.filters.search ?? '';
      const searchTerm = typeof rawSearch === 'string' ? rawSearch.trim() : '';
      const hasSearch = Boolean(searchTerm);
      const rawRoleId = params.roleId ?? this.filters.roleId ?? '';
      const roleFilter = typeof rawRoleId === 'string' ? rawRoleId.trim() : '';
      const hasRoleFilter = Boolean(roleFilter);
      const rawStatus = params.status ?? this.filters.status ?? '';
      const statusFilter = typeof rawStatus === 'string' ? rawStatus.trim() : '';
      const hasStatusFilter = Boolean(statusFilter);
      const needsClientFilter = hasSearch || hasRoleFilter || hasStatusFilter;
      const knownTotal = this.pagination.totalItems || 0;
      const effectivePerPage = needsClientFilter
        ? Math.max(knownTotal, basePerPage, 10)
        : basePerPage;
      const requestPage = needsClientFilter ? 1 : Math.max(page, 1);

      const buildQuery = (pageNumber) => {
        const query = new URLSearchParams();
        query.set('page', pageNumber);
        query.set('per_page', effectivePerPage);
        if (!hasSearch && searchTerm) query.set('search', searchTerm);
        if (!needsClientFilter && hasRoleFilter) query.set('role_id', roleFilter);
        if (!needsClientFilter && hasStatusFilter) query.set('status', statusFilter);
        ['roles', 'roles.permissions'].forEach((include) =>
          query.append('include', include)
        );
        return query;
      };

      const fetchPage = async (pageNumber) => {
        const query = buildQuery(pageNumber);
        const endpoint = `/api/v1/users?${query.toString()}`;
        const response = await api.get(endpoint);
        return response.data?.data ?? {};
      };

      try {
        const firstPayload = await fetchPage(requestPage);
        let items = Array.isArray(firstPayload.items)
          ? firstPayload.items.map((item) => normalizeUser(item))
          : [];
        let totalItems =
          firstPayload.total_items ?? firstPayload.total ?? items.length;

        if (needsClientFilter) {
          const lastPage =
            firstPayload.last_page ?? firstPayload.total_pages ?? requestPage;
          for (let nextPage = requestPage + 1; nextPage <= lastPage; nextPage += 1) {
            const nextPayload = await fetchPage(nextPage);
            if (Array.isArray(nextPayload.items)) {
              items = items.concat(
                nextPayload.items.map((entry) => normalizeUser(entry))
              );
            }
            const nextTotal = nextPayload.total_items ?? nextPayload.total ?? null;
            if (typeof nextTotal === 'number') {
              totalItems = nextTotal;
            }
          }

          let filtered = items;
          if (hasSearch) {
            const keyword = searchTerm.toLowerCase();
            filtered = filtered.filter((user) => {
              const nameMatch = user.name?.toLowerCase().includes(keyword);
              const emailMatch = user.email?.toLowerCase().includes(keyword);
              return Boolean(nameMatch || emailMatch);
            });
          }
          if (hasRoleFilter) {
            filtered = filtered.filter((user) =>
              Array.isArray(user.roles) &&
              user.roles.some((role) => role.id === roleFilter)
            );
          }
          if (hasStatusFilter) {
            if (statusFilter === 'active' || statusFilter === 'inactive') {
              filtered = filtered.filter((user) => {
                const isActive = Boolean(user.isActive);
                return statusFilter === 'active' ? isActive : !isActive;
              });
            }
          }

          this.users = filtered;
          this.pagination = {
            currentPage: 1,
            perPage: basePerPage,
            lastPage: filtered.length ? Math.max(1, Math.ceil(filtered.length / basePerPage)) : 1,
            totalItems,
            hasNextPage: false,
            hasPrevPage: false,
          };
          this.filters.search = searchTerm;
          this.filters.roleId = roleFilter;
          this.filters.status = statusFilter;
          this.error = null;
          return;
        }

        this.users = items;
        this.pagination = {
          currentPage: firstPayload.current_page ?? requestPage,
          perPage: firstPayload.per_page ?? effectivePerPage,
          lastPage:
            firstPayload.last_page ?? firstPayload.total_pages ?? firstPayload.next_page ?? requestPage,
          totalItems,
          hasNextPage: firstPayload.has_next_page ?? Boolean(firstPayload.next_page),
          hasPrevPage: firstPayload.has_prev_page ?? Boolean(firstPayload.prev_page),
        };
        this.filters.search = searchTerm;
        this.filters.roleId = roleFilter;
        this.filters.status = statusFilter;
        this.error = null;
      } catch (err) {
        console.error('[UserStore] Gagal memuat data dari API', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data pengguna dari API.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchUsers();
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return;
      await this.fetchUsers({ page });
    },

    setSearch(value) {
      this.filters.search = value;
    },

    setRoleFilter(roleId) {
      this.filters.roleId = roleId;
    },

    setStatusFilter(status) {
      this.filters.status = status;
    },

    async createUser(payload) {
      this.saving = true;
      try {
        const body = buildUserFormData(payload);
        const response = await api.post('/api/v1/users', body);
        const apiData = response.data?.data ?? response.data;
        const created = normalizeUser(apiData?.user ?? apiData);
        if (this.pagination.currentPage === 1) {
          this.users = [created, ...this.users.filter((u) => u.id !== created.id)];
        }
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.error('[UserStore] API create user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async updateUser(id, payload) {
      this.saving = true;
      try {
        const body = buildUserFormData(payload);
        const response = await api.put(`/api/v1/users/${id}`, body);
        const apiData = response.data?.data ?? response.data;
        const updated = normalizeUser(apiData?.user ?? apiData);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx] = updated;
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.error('[UserStore] API update user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async removeUser(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/users/${id}`);
        this.users = this.users.filter((user) => user.id !== id);
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.error('[UserStore] API delete user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async toggleActive(id, isActive) {
      return this.updateUser(id, { is_active: isActive });
    },

    async toggleActivation(id) {
      this.saving = true;
      try {
        const res = await api.patch(`/api/v1/users/${id}/activation/toggle`);
        const payload = res.data?.data ?? res.data;
        const updated = normalizeUser(payload?.user ?? payload);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx] = updated;
        await this.fetchUsers({ page: this.pagination.currentPage });
        return {
          ok: true,
          data: updated,
          message: res.data?.message || 'Status pengguna berhasil diperbarui.',
        };
      } catch (err) {
        console.error('[UserStore] toggle activation gagal', err);
        const message =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui status pengguna.';
        return {
          ok: false,
          message,
          errors: err.response?.data?.errors || null,
          status: err.response?.status || err.response?.data?.code || null,
        };
      } finally {
        this.saving = false;
      }
    },
  },
});
