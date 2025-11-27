import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const STORAGE_PREFIX = 'uptlab.activityHistory';
const MAX_EVENTS = 200;
const INITIAL_USER_ID = resolveInitialUserId();
const DEFAULT_INCLUDES = ['causer', 'subject'];

const LOGIN_ACTIONS = ['users.login', 'users.logout'];
const DEFAULT_ACTION_FILTERS = [...LOGIN_ACTIONS];
const REQUEST_KEYWORDS = ['request', 'permintaan', 'order', 'orders'];
const PAYMENT_KEYWORDS = ['payment', 'pembayaran', 'invoice', 'billing'];

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

function getStorageKey(userId) {
  const suffix = userId ? String(userId) : 'guest';
  return `${STORAGE_PREFIX}.${suffix}`;
}

function normalizeEvent(entry = {}) {
  return {
    id: entry.id || createId(),
    type: entry.type || 'system',
    title: entry.title || 'Aktivitas',
    description: entry.description || '-',
    status: entry.status || 'info',
    referenceId: entry.referenceId || null,
    metadata: entry.metadata || {},
    userId: entry.userId || null,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function normalizeFromApi(entry = {}) {
  const createdAt = entry.created_at || entry.createdAt || null;
  const action = entry.action || '';
  const description = entry.description || '';
  const causer = entry.causer || {};
  const subject = entry.subject || {};

  const type = mapActionToType(action);
  if (!type) return null;

  const title =
    description ||
    (type === 'login'
      ? 'Aktivitas login'
      : type === 'payment'
      ? 'Aktivitas pembayaran'
      : 'Aktivitas permintaan');

  return normalizeEvent({
    id: entry.id,
    type,
    title,
    description:
      description ||
      [causer.name, subject.name].filter(Boolean).join(' - ') ||
      action,
    status: 'success',
    referenceId: entry.subject_id || entry.causer_id || null,
    metadata: {
      action,
      causerType: entry.causer_type || null,
      subjectType: entry.subject_type || null,
      causerName: causer.name || causer.email || null,
      subjectName: subject.name || subject.email || null,
    },
    userId: entry.causer_id || null,
    createdAt: createdAt || new Date().toISOString(),
  });
}

function mapActionToType(action = '') {
  if (!action) return null;
  const lower = String(action).toLowerCase();
  if (LOGIN_ACTIONS.includes(lower) || lower.includes('login')) return 'login';
  if (PAYMENT_KEYWORDS.some((kw) => lower.includes(kw))) return 'payment';
  if (REQUEST_KEYWORDS.some((kw) => lower.includes(kw))) return 'request';
  return null;
}

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    apiLoading: false,
    apiError: null,
    activeUserId: INITIAL_USER_ID,
    events:
      typeof window !== 'undefined'
        ? safeParse(
            window.localStorage?.getItem(
              getStorageKey(INITIAL_USER_ID)
            ) || '[]'
          )
        : [],
    loading: false,
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
    buildQuery(params = {}) {
      const query = new URLSearchParams();
      const page =
        Number(params.page ?? params.currentPage ?? 1) || 1;
      const perPage =
        Number(params.perPage ?? params.per_page ?? 50) || 50;
      query.set('page', Math.max(1, page));
      query.set('per_page', Math.max(1, perPage));

      const includes =
        params.include ?? params.includes ?? DEFAULT_INCLUDES;
      (Array.isArray(includes) ? includes : DEFAULT_INCLUDES)
        .filter(Boolean)
        .forEach((include) => query.append('include', include));

      // Batasi action penting di server jika disediakan dari caller
      const actionFilters = params.actions ?? DEFAULT_ACTION_FILTERS;
      if (Array.isArray(actionFilters) && actionFilters.length) {
        actionFilters.forEach((act) => {
          if (act) query.append('filter', `action==${act}`);
        });
      }

      // Urutkan terbaru
      query.append('sort', '-created_at');
      return query;
    },

    async fetchImportant(params = {}) {
      this.apiLoading = true;
      this.apiError = null;
      try {
        const query = this.buildQuery(params);
        const endpoint = `/api/v1/activities?${query.toString()}`;
        const res = await api.get(endpoint);
        const payload = res.data?.data ?? {};
        const items = Array.isArray(payload.items) ? payload.items : [];

        const normalized = items
          .map((item) => normalizeFromApi(item))
          .filter(Boolean);

        this.activities = normalized;
        this.events = normalized;
        this.persist();

        return { ok: true, data: normalized };
      } catch (err) {
        this.apiError =
          err.response?.data?.message ||
          err.message ||
          'Gagal mengambil aktivitas penting.';
        return {
          ok: false,
          message: this.apiError,
          errors: err.response?.data?.errors || null,
          status: err.response?.status || err.response?.data?.code || null,
        };
      } finally {
        this.apiLoading = false;
      }
    },

    async fetchAll(params = {}) {
      return this.fetchImportant(params);
    },

    hydrate() {
      if (typeof window === 'undefined') return;
      this.events = safeParse(
        window.localStorage?.getItem(getStorageKey(this.activeUserId)) || '[]'
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
      window.localStorage?.setItem(
        getStorageKey(this.activeUserId),
        JSON.stringify(this.events)
      );
    },

    addEvent(payload = {}) {
      const event = normalizeEvent({
        ...payload,
        userId: this.activeUserId ?? payload.userId ?? null,
      });
      this.events = [event, ...this.events]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, MAX_EVENTS);
      this.persist();
      return event;
    },

    importEvents(list = []) {
      const normalized = list.map((item) =>
        normalizeEvent({
          ...item,
          userId: this.activeUserId ?? item.userId ?? null,
        })
      );
      const combined = [...normalized, ...this.events];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        uniqueMap.set(item.id, item);
      });
      this.events = Array.from(uniqueMap.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, MAX_EVENTS);
      this.persist();
    },

    clear() {
      this.events = [];
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(getStorageKey(this.activeUserId));
      }
    },
  },
});
