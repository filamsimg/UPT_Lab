// Store/composable dialog konfirmasi global (provide/inject)
import { inject, provide, reactive } from 'vue';

const CONFIRM_DIALOG_KEY = Symbol('CONFIRM_DIALOG');

export function provideConfirmDialog() {
  const state = reactive({
    open: false,
    title: 'Konfirmasi',
    message: '',
    confirmLabel: 'Ya',
    cancelLabel: 'Batal',
    variant: 'primary',
    resolve: null,
  });

  function open(options = {}) {
    return new Promise((resolve) => {
      state.title = options.title || 'Konfirmasi';
      state.message = options.message || 'Apakah Anda yakin ingin melanjutkan?';
      state.confirmLabel = options.confirmLabel || 'Ya';
      state.cancelLabel = options.cancelLabel || 'Batal';
      state.variant = options.variant || 'primary';
      state.open = true;
      state.resolve = resolve;
    });
  }

  function close(result) {
    state.open = false;
    const resolver = state.resolve;
    state.resolve = null;
    resolver?.(result);
  }

  function confirm() {
    close(true);
  }

  function cancel() {
    close(false);
  }

  provide(CONFIRM_DIALOG_KEY, open);

  return {
    state,
    confirm,
    cancel,
    open,
  };
}

export function useConfirmDialog() {
  const open = inject(CONFIRM_DIALOG_KEY);
  if (!open) {
    throw new Error('Confirm dialog has not been provided. Call provideConfirmDialog() in a parent component.');
  }
  return open;
}
