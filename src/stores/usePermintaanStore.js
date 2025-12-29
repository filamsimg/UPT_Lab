import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { normalizeOrderStatus } from '@/utils/orderStatus';

/**
 * Store publik untuk pengecekan status permintaan (material test order)
 * berdasarkan ID order yang dimasukkan pengguna. Fokusnya adalah merapikan
 * payload backend menjadi shape minimal yang dibutuhkan halaman tracking.
 */

export const requestStatusLabels = {
  draft: 'Draft',
  awaiting_review: 'Menunggu Kaji Ulang',
  awaiting_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Pembayaran Dikirim',
  payment_rejected: 'Bukti Pembayaran Ditolak',
  payment_approved: 'Pembayaran Disetujui',
  testing: 'Proses Pengujian',
  completed: 'Selesai',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
  refunded: 'Refund',
};

const ensureString = (value, fallback = '') =>
  typeof value === 'string' && value.trim().length ? value.trim() : fallback;

// Terima respons yang bisa saja sudah diratakan atau masih bersarang di bawah material_test_order
const unwrapMaterialTestOrder = (payload) => {
  const data = payload && typeof payload === 'object' ? payload : {};
  const material = data.material_test_order || data.materialTestOrder;
  if (material && typeof material === 'object') return material;
  return data;
};

/**
 * Ratakan payload order dari backend ke bentuk yang dipakai layar pengecekan status.
 * - Menyediakan fallback jika beberapa field kosong.
 * - Menyatukan nama properti snake_case & camelCase.
 */
const normalizeOrderToRequest = (payload = {}) => {
  const order = unwrapMaterialTestOrder(payload);

  const rawServices = Array.isArray(order.ordered_services || order.orderedServices)
    ? order.ordered_services || order.orderedServices
    : [];
  const testItems = rawServices
    .filter(Boolean)
    .map((svc) => ({
      testId:
        svc.service_id ||
        svc.serviceId ||
        svc.service?.id ||
        svc.service?.service_id ||
        svc.service?.serviceId ||
        '',
      testName: ensureString(svc.test_name || svc.testName) || '',
      objectName: ensureString(svc.sample_name || svc.sampleName) || '',
      quantity: Number(svc.quantity ?? 1) || 1,
      price: Number(svc.price ?? 0) || 0,
      testCode: ensureString(svc.service_code || svc.serviceCode) || '',
      unit: ensureString(svc.unit) || '',
    }));

  const purpose = ensureString(order.applicant_note) ||
    (testItems.length
      ? testItems
          .map((item) => `${item.objectName || item.testId || 'Pengujian'} (${item.quantity})`)
          .join(', ')
      : '');

  return {
    idOrder: order.id || '',
    entryDate:
      order.entered_at ||
      order.enteredAt ||
      order.created_at ||
      order.createdAt ||
      '',
    customerName: order.applicant_name || order.applicantName || '',
    phoneNumber:
      order.applicant_phone_number || order.applicantPhoneNumber || '',
    email: order.applicant_email || order.applicantEmail || '',
    address:
      order.applicant_full_address || order.applicantFullAddress || '',
    jobCategory: order.work_category?.name || '',
    workPackage: order.work_package_name || order.workPackageName || '',
    purpose,
    testItems,
    status: normalizeOrderStatus(order.status),
    createdAt: order.created_at || order.createdAt || '',
    updatedAt: order.updated_at || order.updatedAt || '',
    paymentInfo: null,
  };
};

export const usePermintaanStore = defineStore('request', {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Ambil status permintaan berdasarkan ID order yang dimasukkan user.
     * Mengembalikan { ok, data|error, status } tanpa melempar error agar mudah dipakai di UI.
     */
    async checkOrderStatus(idOrder) {
      const query = ensureString(idOrder);
      if (!query) {
        return { ok: false, error: 'ID Order harus diisi.' };
      }

      this.loading = true;
      try {
        const includes = new URLSearchParams();
        includes.append('include', 'work_category');
        includes.append('include', 'ordered_services.evaluation');
        includes.append('include', 'medias');

        const res = await api.get(
          `/api/v1/material-test-orders/${encodeURIComponent(query)}?${includes.toString()}`,
          { skipAuthRedirect: true }
        );

        const data = normalizeOrderToRequest(res.data?.data || {});
        if (data?.idOrder) {
          this.error = null;
          return { ok: true, data };
        }

        this.error = 'Data permintaan tidak ditemukan.';
        return { ok: false, error: this.error };
      } catch (err) {
        const status = err?.response?.status;
        let message = 'Gagal memuat status permintaan. Silakan coba lagi.';
        if (status === 404) {
          message = 'ID Order tidak ditemukan.';
        } else if (status === 401) {
          message = 'Tidak memiliki akses untuk melihat status ini.';
        }
        this.error = message;
        return { ok: false, error: message, status };
      } finally {
        this.loading = false;
      }
    },
  },
});
