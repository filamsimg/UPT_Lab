// Store kode undangan: generate/validasi kode registrasi
import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INVITATION_CODE_TYPE = 'user_register_invitation';
const CODE_GENERATE_ENDPOINT = '/api/v1/codes/user-register-invitation';
const LOCAL_CODE_PREFIX = 'INV-LOCAL';

function normalizeKodeUndangan(entry = {}) {
  const payload = entry.code ?? entry;
  const meta = payload.meta ?? entry.meta ?? {};
  const fallbackCode = `${LOCAL_CODE_PREFIX}-${Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase()}`;

  const code =
    payload.value ||
    payload.code ||
    payload.invitation_code ||
    payload.token ||
    entry.value ||
    entry.code ||
    fallbackCode;

  return {
    id: payload.id || entry.id || payload.ulid || code,
    code,
    type: payload.type || entry.type || INVITATION_CODE_TYPE,
    usageLimit:
      payload.usage_limit ??
      payload.usageLimit ??
      entry.usage_limit ??
      entry.usageLimit ??
      1,
    usedCount:
      payload.used_count ??
      payload.usedCount ??
      entry.used_count ??
      entry.usedCount ??
      0,
    status:
      payload.status ||
      entry.status ||
      (payload.used_at || entry.used_at ? 'inactive' : 'active'),
    note: payload.note || entry.note || payload.description || entry.description || '',
    expiresAt:
      payload.expired_at ||
      payload.expires_at ||
      entry.expired_at ||
      entry.expires_at ||
      meta.expired_at ||
      null,
    createdAt:
      payload.created_at ||
      entry.created_at ||
      payload.createdAt ||
      entry.createdAt ||
      payload.created ||
      entry.created ||
      new Date().toISOString(),
    roleId:
      payload.role_id ||
      entry.role_id ||
      payload.roleId ||
      entry.roleId ||
      payload.role?.id ||
      entry.role?.id ||
      meta.role_id ||
      null,
    roleName:
      payload.role_name ||
      entry.role_name ||
      payload.roleName ||
      entry.roleName ||
      payload.role?.name ||
      entry.role?.name ||
      meta.role_name ||
      '',
  };
}

function toApiDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return null;
  // Backend expects local (WIB) timestamp; shift UTC by +7 hours
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const iso = shifted.toISOString().replace('T', ' ').replace('Z', '');
  const [datePart, timePart = '00:00:00'] = iso.split(' ');
  const trimmedTime = timePart.split('.')[0];
  return `${datePart} ${trimmedTime}`;
}

export const useKodeUndanganStore = defineStore('kodeUndangan', {
  state: () => ({
    latestCode: null,
    saving: false,
    error: null,
  }),

  actions: {
    async generateKodeUndangan(payload = {}) {
      this.saving = true;
      try {
        const expiresAt =
          payload.expired_at ??
          payload.expires_at ??
          toApiDateTime(new Date(Date.now() + ONE_DAY_MS));
        const roleId = payload.role_id ?? payload.roleId ?? null;
        const formData = new FormData();
        if (roleId) formData.append('role_id', roleId);
        if (expiresAt) formData.append('expired_at', expiresAt);
        if (payload.note ?? payload.description) {
          formData.append('note', payload.note ?? payload.description);
        }
        const response = await api.post(CODE_GENERATE_ENDPOINT, formData);
        const raw = response.data ?? {};
        const data = raw.data ?? raw;
        const created = normalizeKodeUndangan(data.code ?? data);
        if (!created.roleName) {
          created.roleName =
            payload.role_name ?? payload.roleName ?? payload.role_label ?? '';
        }
        this.latestCode = created;
        this.error = null;
        return {
          ok: true,
          data: created,
          message: raw.message || 'Kode undangan berhasil dibuat.',
        };
      } catch (err) {
        console.warn('[KodeUndanganStore] API generate gagal.', err);
        const apiMessage =
          err.response?.data?.message ||
          err.message ||
          'Gagal membuat kode undangan melalui API.';
        this.error = apiMessage;
        this.latestCode = null;
        throw new Error(apiMessage);
      } finally {
        this.saving = false;
      }
    },

    clearLatest() {
      this.latestCode = null;
      this.error = null;
    },
  },
});
