import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { isSuperAdminUser } from '@/composables/auth/useAuthorization';

const STORAGE_PREFIX = 'uptlab.activityHistory';
const MAX_EVENTS = 200;
const DEFAULT_INCLUDES = ['causer', 'subject'];
const INITIAL_USER_ID = resolveInitialUserId();
const HIDDEN_VIEW_ACTIONS = [/\.index$/i, /\.show$/i];

const ACTION_LABELS = {
  'users.register': 'Registrasi Pengguna',
  'users.reset_password': 'Reset Password',
  'users.verify_email': 'Verifikasi Email',
  'users.login': 'Login',
  'users.logout': 'Logout',
  'users.me': 'Profil Saya',
  'users.update_me_profile': 'Perbarui Profil',
  'users.update_me_password': 'Perbarui Password',
  'users.index': 'Lihat Pengguna',
  'users.show': 'Detail Pengguna',
  'users.store': 'Tambah Pengguna',
  'users.update': 'Perbarui Pengguna',
  'users.toggle_activation': 'Aktif / Nonaktif Pengguna',
  'users.destroy': 'Hapus Pengguna',
  'permissions.index': 'Lihat Permission',
  'roles.index': 'Lihat Role',
  'roles.show': 'Detail Role',
  'roles.store': 'Tambah Role',
  'roles.update': 'Perbarui Role',
  'roles.set_default': 'Atur Role Default',
  'roles.destroy': 'Hapus Role',
  'codes.create_user_register_invitation': 'Kirim Kode Undangan',
  'codes.create_user_email_verification': 'Kirim Kode Verifikasi Email',
  'codes.create_user_reset_password': 'Kirim Kode Reset Password',
};

function resolveInitialUserId() {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage?.getItem('currentUser');
  if (!rawUser) return null;
  try {
    const parsed = JSON.parse(rawUser);
    return parsed?.id ?? null;
  } catch (err) {
    console.warn('[ActivityStore] gagal parsing currentUser', err);
    return null;
  }
}

function safeParse(json, fallback = []) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch (err) {
    console.warn('[ActivityStore] gagal parsing riwayat', err);
    return fallback;
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function storageKey(userId) {
  const suffix = userId ? String(userId) : 'guest';
  return `${STORAGE_PREFIX}.${suffix}`;
}

function toIsoString(value) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function humanizeAction(action) {
  if (!action) return 'Aktivitas';
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const cleaned = action.replace(/\./g, ' / ').replace(/_/g, ' ');
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s\/\s/g, ' · ');
}

function deriveType(action, fallback = 'system') {
  const value = typeof action === 'string' ? action.toLowerCase() : '';
  if (!value) return fallback;
  if (
    value.includes('login') ||
    value.includes('logout') ||
    value.includes('password') ||
    value.includes('verify') ||
    value.includes('register')
  ) {
    return 'login';
  }
  if (value.includes('payment') || value.includes('pay') || value.includes('bayar')) {
    return 'payment';
  }
  if (value.includes('request') || value.includes('order') || value.includes('permintaan')) {
    return 'request';
  }
  return fallback;
}

function shouldHideFromFrontend(entry) {
  const action =
    typeof entry === 'string'
      ? entry
      : entry?.metadata?.action || entry?.action || entry?.type || '';
  if (!action) return false;
  return HIDDEN_VIEW_ACTIONS.some((pattern) => pattern.test(action));
}

function filterVisibleActivities(list = []) {
  return list.filter((item) => !shouldHideFromFrontend(item));
}

function normalizeActivity(entry = {}, context = {}) {
  const action = entry.action || entry.metadata?.action || entry.type || '';
  const type = deriveType(action, entry.type || 'system');
  const causer = entry.causer || entry.metadata?.causer || null;
  const subject = entry.subject || entry.metadata?.subject || null;
  const causerId =
    entry.causer_id ?? entry.user_id ?? entry.userId ?? context.activeUserId ?? null;
  const subjectId = entry.subject_id ?? entry.referenceId ?? null;
  const createdAt = toIsoString(entry.created_at || entry.createdAt || entry.timestamp);
  const ipAddress =
    entry.causer_ip_address ??
    entry.metadata?.causer_ip_address ??
    entry.metadata?.properties?.causer_ip_address ??
    entry.properties?.causer_ip_address ??
    entry.metadata?.ip ??
    entry.properties?.ip ??
    null;

  const causerName =
    entry.metadata?.causerName ||
    causer?.name ||
    causer?.email ||
    entry.causer_name ||
    entry.causer_email ||
    causerId ||
    '';
  const subjectName =
    entry.metadata?.subjectName ||
    subject?.name ||
    subject?.email ||
    entry.subject_name ||
    entry.subject_email ||
    entry.referenceId ||
    subjectId ||
    '';

  return {
    id: entry.id || createId(),
    type,
    title: entry.title || humanizeAction(action),
    description: entry.description || '',
    status: entry.status || 'info',
    referenceId: subjectId,
    userId: causerId,
    metadata: {
      ...entry.metadata,
      causerName,
      subjectName,
      causer,
      subject,
      causer_ip_address: ipAddress,
      ip: ipAddress,
      action,
      properties: entry.properties ?? entry.metadata?.properties ?? null,
    },
    createdAt,
  };
}

function mergeEvents(nextEvents = [], currentEvents = []) {
  const map = new Map();
  [...nextEvents, ...currentEvents].forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_EVENTS);
}

function filterSuperAdmin(entries = [], viewerIsSuperAdmin = false) {
  if (viewerIsSuperAdmin) return entries;
  return entries.filter((item) => {
    const causer = item?.metadata?.causer;
    const subject = item?.metadata?.subject;
    if (causer && isSuperAdminUser(causer)) return false;
    if (subject && isSuperAdminUser(subject)) return false;
    return true;
  });
}

function normalizePagination(payload = {}, fallback = {}) {
  return {
    currentPage: payload.current_page ?? payload.currentPage ?? fallback.currentPage ?? 1,
    perPage: payload.per_page ?? payload.perPage ?? fallback.perPage ?? 10,
    lastPage: payload.last_page ?? payload.lastPage ?? fallback.lastPage ?? 1,
    hasNextPage: payload.has_next_page ?? fallback.hasNextPage ?? false,
    hasPrevPage: payload.has_prev_page ?? fallback.hasPrevPage ?? false,
    totalItems: payload.total_items ?? payload.total ?? fallback.totalItems ?? 0,
  };
}

function buildDateRangeFilter({ dateFrom, dateTo }) {
  if (!dateFrom && !dateTo) return null;
  const from = (dateFrom || dateTo || '').toString().slice(0, 10);
  const to = (dateTo || dateFrom || '').toString().slice(0, 10);
  if (!from && !to) return null;
  return `created_atBETWEEN${from || to},${to || from}`;
}

function buildQueryParams(options = {}) {
  const query = new URLSearchParams();
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 50;
  query.set('page', page);
  query.set('per_page', perPage);

  const includes =
    Array.isArray(options.include) && options.include.length
      ? options.include
      : DEFAULT_INCLUDES;
  includes.filter(Boolean).forEach((inc) => query.append('include', inc));

  const filters = [];
  const allowAll = options.viewerIsSuperAdmin || options.canViewAll;
  const scope = allowAll ? options.scope || 'all' : 'mine';
  const viewerId = options.viewerId ?? options.viewer?.id ?? options.activeUserId ?? null;

  if (scope !== 'all') {
    if (viewerId) filters.push(`causer_id==${viewerId}`);
  } else if (options.filterUserId) {
    filters.push(`causer_id==${options.filterUserId}`);
  }

  const dateFilter = buildDateRangeFilter(options);
  if (dateFilter) filters.push(dateFilter);

  (options.filters || []).forEach((filter) => {
    if (filter) filters.push(filter);
  });

  filters.forEach((filter) => query.append('filter', filter));

  const sort = options.sort ?? '-created_at';
  if (Array.isArray(sort)) {
    sort.filter(Boolean).forEach((value) => query.append('sort', value));
  } else if (sort) {
    query.append('sort', sort);
  }

  const search = typeof options.search === 'string' ? options.search.trim() : '';
  if (search) query.set('search', search);

  return query;
}

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activeUserId: INITIAL_USER_ID,
    events:
      typeof window !== 'undefined'
        ? safeParse(window.localStorage?.getItem(storageKey(INITIAL_USER_ID)) || '[]')
        : [],
    loading: false,
    apiError: '',
    apiStatus: null,
    pagination: {
      currentPage: 1,
      perPage: 50,
      lastPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      totalItems: 0,
    },
  }),

  getters: {
    stats(state) {
      return state.events.reduce(
        (acc, event) => {
          acc.total += 1;
          if (event.type === 'login') acc.login += 1;
          else if (event.type === 'request') acc.request += 1;
          else if (event.type === 'payment') acc.payment += 1;
          else acc.system += 1;
          return acc;
        },
        { total: 0, login: 0, request: 0, payment: 0, system: 0 }
      );
    },
  },

  actions: {
    hydrate() {
      if (typeof window === 'undefined') return;
      this.events = filterVisibleActivities(
        safeParse(window.localStorage?.getItem(storageKey(this.activeUserId)) || '[]', [])
      );
    },

    setActiveUser(userId) {
      const normalized = userId ?? null;
      if (this.activeUserId === normalized) return;
      this.activeUserId = normalized;
      this.hydrate();
    },

    persist() {
      if (typeof window === 'undefined') return;
      this.events = filterVisibleActivities(this.events);
      window.localStorage?.setItem(storageKey(this.activeUserId), JSON.stringify(this.events));
    },

    addEvent(payload = {}) {
      const entry = normalizeActivity({
        ...payload,
        userId: this.activeUserId ?? payload.userId ?? null,
      });
      if (shouldHideFromFrontend(entry)) return null;
      this.events = mergeEvents([entry], this.events);
      this.persist();
      return entry;
    },

    importEvents(list = []) {
      const normalized = list
        .map((item) => normalizeActivity(item, { activeUserId: this.activeUserId }))
        .filter((item) => !shouldHideFromFrontend(item));
      this.events = filterVisibleActivities(mergeEvents(normalized, this.events));
      this.persist();
    },

    clear() {
      this.events = [];
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(storageKey(this.activeUserId));
      }
    },

    async fetchAll(options = {}) {
      return this.fetchActivities({ ...options, scope: options.scope || 'all' });
    },

    async fetchImportant(options = {}) {
      const mergedOptions = { perPage: 50, sort: '-created_at', ...options };
      return this.fetchActivities(mergedOptions);
    },

    async fetchActivities(options = {}) {
      this.loading = true;
      this.apiError = '';
      this.apiStatus = null;
      const viewerId = options.viewerId ?? options.viewer?.id ?? this.activeUserId;
      const viewerIsSuperAdmin =
        options.viewerIsSuperAdmin ?? isSuperAdminUser(options.viewer) ?? false;
      const effectiveOptions = { ...options, viewerId, viewerIsSuperAdmin };

      try {
        const query = buildQueryParams({
          ...effectiveOptions,
          activeUserId: this.activeUserId,
        });
        const endpoint = `/api/v1/activities?${query.toString()}`;
        const res = await api.get(endpoint);
        const payload = res.data?.data ?? res.data ?? {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        const normalized = items.map((item) =>
          normalizeActivity(item, { activeUserId: this.activeUserId })
        );
        const visible = filterSuperAdmin(normalized, viewerIsSuperAdmin);
        const filtered = filterVisibleActivities(visible);
        this.events = filtered;
        this.pagination = normalizePagination(payload, this.pagination);
        this.apiStatus = res.status ?? payload.code ?? 200;
        this.persist();
        return { ok: true, items: filtered, pagination: this.pagination };
      } catch (err) {
        const isNetworkError = err.code === 'ERR_NETWORK' || (!err.response && err.request);
        this.apiStatus =
          err.response?.status ||
          err.response?.data?.code ||
          (isNetworkError ? 'NETWORK_ERROR' : null);
        this.apiError =
          (isNetworkError
            ? 'Tidak dapat terhubung ke server aktivitas. Pastikan BE berjalan atau cek koneksi.'
            : err.response?.data?.message) ||
          err.message ||
          'Gagal memuat aktivitas.';
        return {
          ok: false,
          message: this.apiError,
          errors: err.response?.data?.errors || null,
          status: this.apiStatus,
          network: isNetworkError,
        };
      } finally {
        this.loading = false;
      }
    },
  },
});
