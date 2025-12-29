// Store notifikasi per-user (riwayat)
import { defineStore } from 'pinia';

const STORAGE_PREFIX = 'uptlab.notifications';
const MAX_NOTIFICATIONS = 150;
const INITIAL_USER_ID = resolveInitialUserId();

function resolveInitialUserId() {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage?.getItem('currentUser');
  if (!rawUser) return null;
  try {
    const parsed = JSON.parse(rawUser);
    return parsed?.id ?? null;
  } catch (err) {
    console.warn('[NotificationStore] gagal parsing currentUser', err);
    return null;
  }
}

function safeParse(json, fallback = []) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch (err) {
    console.warn('[NotificationStore] gagal parsing notifikasi', err);
    return fallback;
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStorageKey(userId) {
  const suffix = userId ? String(userId) : 'guest';
  return `${STORAGE_PREFIX}.${suffix}`;
}

function normalizeNotification(entry = {}) {
  const createdAt =
    entry.createdAt instanceof Date
      ? entry.createdAt.toISOString()
      : entry.createdAt || new Date().toISOString();
  return {
    id: entry.id || createId(),
    title: entry.title || 'Notifikasi',
    message: entry.message || '',
    tone: entry.tone || 'info',
    status: entry.status || 'info',
    referenceId: entry.referenceId || null,
    metadata: entry.metadata || {},
    link: entry.link || null,
    readAt: entry.readAt || null,
    userId: entry.userId ?? null,
    createdAt,
  };
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    activeUserId: INITIAL_USER_ID,
    items:
      typeof window !== 'undefined'
        ? safeParse(
            window.localStorage?.getItem(getStorageKey(INITIAL_USER_ID)) || '[]',
          )
        : [],
  }),

  getters: {
    unreadCount(state) {
      return state.items.reduce((acc, item) => acc + (item.readAt ? 0 : 1), 0);
    },
  },

  actions: {
    hydrate() {
      if (typeof window === 'undefined') return;
      this.items = safeParse(
        window.localStorage?.getItem(getStorageKey(this.activeUserId)) || '[]',
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
        JSON.stringify(this.items),
      );
    },

    addNotification(payload = {}) {
      const entry = normalizeNotification({
        ...payload,
        userId: this.activeUserId ?? payload.userId ?? null,
      });
      this.items = [entry, ...this.items]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, MAX_NOTIFICATIONS);
      this.persist();
      return entry;
    },

    markAsRead(id) {
      const index = this.items.findIndex((item) => item.id === id);
      if (index === -1) return;
      if (!this.items[index].readAt) {
        this.items[index] = {
          ...this.items[index],
          readAt: new Date().toISOString(),
        };
        this.persist();
      }
    },

    markAllAsRead() {
      let changed = false;
      this.items = this.items.map((item) => {
        if (item.readAt) return item;
        changed = true;
        return { ...item, readAt: new Date().toISOString() };
      });
      if (changed) this.persist();
    },

    remove(id) {
      const before = this.items.length;
      this.items = this.items.filter((item) => item.id !== id);
      if (this.items.length !== before) {
        this.persist();
      }
    },

    clear() {
      this.items = [];
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(getStorageKey(this.activeUserId));
      }
    },
  },
});
