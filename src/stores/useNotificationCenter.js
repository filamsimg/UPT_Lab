// Store pusat notifikasi/toast (enqueue/dequeue)
import { inject, provide, reactive } from 'vue';
import { useNotificationStore } from './useNotificationStore';

const NOTIFICATION_CENTER_KEY = Symbol('NOTIFICATION_CENTER');

export function provideNotificationCenter() {
  const persistentStore = useNotificationStore();
  const state = reactive({
    queue: [],
  });

  function dismiss(id) {
    const index = state.queue.findIndex((item) => item.id === id);
    if (index === -1) return;
    const [item] = state.queue.splice(index, 1);
    if (item?.timer) {
      clearTimeout(item.timer);
    }
  }

  function clearAll() {
    while (state.queue.length) {
      const item = state.queue.pop();
      if (item?.timer) clearTimeout(item.timer);
    }
  }

  function notify(options = {}) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tone = options.tone || 'info';
    const duration =
      typeof options.duration === 'number' && options.duration >= 0
        ? options.duration
        : 5000;
    const entry = {
      id,
      title: options.title || defaultTitle(tone),
      message: options.message || '',
      tone,
      duration,
      timer: null,
      createdAt: new Date(),
    };
    state.queue.push(entry);
    if (duration > 0) {
      entry.timer = setTimeout(() => dismiss(id), duration);
    }
    if (options.persist !== false && persistentStore) {
      persistentStore.addNotification({
        id,
        title: entry.title,
        message: entry.message,
        tone,
        referenceId: options.referenceId || null,
        metadata: options.metadata || {},
        link: options.link || null,
        createdAt: entry.createdAt,
      });
    }
    return id;
  }

  provide(NOTIFICATION_CENTER_KEY, {
    state,
    notify,
    dismiss,
    clearAll,
  });

  return {
    state,
    notify,
    dismiss,
    clearAll,
  };
}

export function useNotificationCenter() {
  const ctx = inject(NOTIFICATION_CENTER_KEY);
  if (!ctx) {
    throw new Error(
      'Notification center has not been provided. Call provideNotificationCenter() in a parent component.',
    );
  }
  return ctx;
}

function defaultTitle(tone) {
  switch (tone) {
    case 'success':
      return 'Berhasil';
    case 'warning':
      return 'Perhatian';
    case 'error':
      return 'Terjadi Kesalahan';
    default:
      return 'Notifikasi';
  }
}
