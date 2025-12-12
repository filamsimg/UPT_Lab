import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { useActivityStore } from '@/stores/useActivityStore';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';

function extractYear(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return String(date.getFullYear());
  const match = /^(\d{4})/.exec(String(value));
  return match ? match[1] : null;
}

function coerceOrderNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalizeRequestEntry(entry = {}) {
  const rawItems = Array.isArray(entry.testItems) ? entry.testItems : [];
  const testItems = rawItems
    .filter(Boolean)
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price ?? item.testPrice ?? 0));
      const objectName =
        item.objectName ||
        item.testName ||
        item.name ||
        item.title ||
        '';
      return {
        testId: item.testId || item.id || '',
        testName:
          item.testName ||
          item.name ||
          item.title ||
          item.label ||
          '',
        objectName,
        price,
        quantity,
        unit: item.unit || '',
        testCode: item.testCode || item.code || '',
      };
    });

  const aggregated =
    testItems.length > 0
      ? testItems
          .map((item) => `${item.testName || item.testId || 'Pengujian'} (${item.quantity})`)
          .join(', ')
      : '';

  const entryDate = entry.entryDate || entry.createdAt || null;
  const orderYear = entry.orderYear || extractYear(entryDate);
  const orderNumber = coerceOrderNumber(entry.orderNumber ?? entry.order_sequence);

  return {
    ...entry,
    status: entry.status || 'draft',
    workPackage: entry.workPackage || '',
    testItems,
    testCategory: aggregated || entry.testCategory || entry.purpose || '',
    purpose: entry.purpose || aggregated,
    orderNumber,
    orderYear,
  };
}

export const requestStatusLabels = {
  draft: 'Draft',
  awaiting_kaji_ulang: 'Menunggu Kaji Ulang',
  pending_payment: 'Menunggu Pembayaran',
  payment_pending_review: 'Menunggu Review Pembayaran',
  payment_verified: 'Pembayaran Terverifikasi',
  payment_review_rejected: 'Bukti Pembayaran Ditolak',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
};

function deriveTypeByStatus(status = '') {
  if (!status) return 'request';
  if (status.includes('payment')) return 'payment';
  return 'request';
}

function logRequestEvent({ request, status, title, description, statusLevel = 'info' }) {
  const activityStore = useActivityStore();
  if (!activityStore) return;
  const eventType = status ? deriveTypeByStatus(status) : 'request';
  activityStore.addEvent({
    type: eventType,
    title: title || `Permintaan ${request?.idOrder || ''}`.trim(),
    description:
      description ||
      `${request?.customerName || 'Pemohon'} - ${requestStatusLabels[status] || status || 'Aktivitas'}`,
    status: statusLevel,
    referenceId: request?.idOrder || null,
    metadata: {
      status,
      customer: request?.customerName || '',
    },
  });
}

function createDummyRequests() {
  const entries = [
    {
      idOrder: '01K8WJ96E56HTJCC9CJ97MM78P',
      entryDate: '2025-01-04',
      customerName: 'PT Maju Jaya Sejahtera',
      phoneNumber: '021-555-0101',
      address: 'Jl. Merdeka No. 12, Tegal',
      jobCategory: 'Industri',
      workPackage: 'Audit Material',
      testItems: [
        {
          testId: 'UTK-001',
          testName: 'Uji Tarik',
          objectName: 'Besi Beton',
          quantity: 2,
          price: 250000,
        },
        {
          testId: 'UKH-002',
          testName: 'Uji Kekerasan',
          objectName: 'Pelat Baja',
          quantity: 1,
          price: 150000,
        },
      ],
      status: 'payment_verified',
      paymentInfo: {
        status: 'payment_verified',
        reviewStatus: 'approved',
        total: 650000,
        amountPaid: 650000,
        outstanding: 0,
        paymentDate: '2025-01-05T08:30:00Z',
        paymentDeadline: '2025-01-07T00:00:00Z',
        reviewedBy: 'Admin Pembayaran',
        reviewedAt: '2025-01l-05T09:00:00Z',
        reviewNote: 'Bukti transfer jelas dan sesuai nominal.',
        transferFiles: [
          {
            id: '01K8WJ96E56HTJCC9CJ97MM78P-evidence-1',
            name: 'Bukti-Transfer-ORD-001.png',
            size: 245678,
            type: 'image/png',
            previewUrl: 'https://dummyimage.com/600x360/edf2f7/1a202c&text=Bukti+Transfer',
          },
        ],
      },
    },
    {
      idOrder: 'ORD-202501-004',
      entryDate: '2025-01-08',
      customerName: 'CV Sinar Terang Abadi',
      phoneNumber: '0283-778899',
      address: 'Jl. Sawo No. 8, Slawi',
      jobCategory: 'Kontraktor',
      workPackage: 'Proyek Gedung',
      testItems: [
        {
          testId: 'UKK-010',
          testName: 'Uji Komposisi Kimia',
          objectName: 'Serbuk Aluminium',
          quantity: 1,
          price: 375000,
        },
      ],
      status: 'awaiting_kaji_ulang',
      paymentInfo: null,
    },
    {
      idOrder: '01K8WJ96E56HTJCC9CJ97MM78P',
      entryDate: '2025-01-09',
      customerName: 'PT Sentosa Logam',
      phoneNumber: '021-770099',
      address: 'Jl. Rajawali No. 17, Brebes',
      jobCategory: 'Kontraktor',
      workPackage: 'Proyek Infrastruktur',
      testItems: [
        {
          testId: 'UKT-015',
          testName: 'Uji Kekuatan Tekan',
          objectName: 'Besi Cor',
          quantity: 1,
          price: 420000,
        },
      ],
      status: 'pending_payment',
      paymentInfo: {
        status: 'pending_payment',
        reviewStatus: 'invoice_ready',
        total: 420000,
        amountPaid: 0,
        outstanding: 420000,
        paymentDeadline: '2025-01-13T00:00:00Z',
        transferFiles: [],
      },
    },
    {
      idOrder: '01K8WJ96E56HTJCC9CJ97MM78P',
      entryDate: '2025-01-10',
      customerName: 'CV Cahaya Mandiri',
      phoneNumber: '0812-9988-7766',
      address: 'Jl. Mawar No. 5, Tegal',
      jobCategory: 'UMKM',
      workPackage: 'Sertifikasi Produk',
      testItems: [
        {
          testId: 'UPH-021',
          testName: 'Uji pH',
          objectName: 'Sampel Minuman',
          quantity: 3,
          price: 90000,
        },
      ],
      status: 'pending_payment',
    },
    {
      idOrder: '01K8WJ96E56HTJCC9CJ97MM78P',
      entryDate: '2025-01-12',
      customerName: 'UD Sentosa Teknik',
      phoneNumber: '0857-4455-8899',
      address: 'Jl. Kenanga No. 3, Adiwerna',
      jobCategory: 'Internal',
      workPackage: 'Peremajaan Alat',
      testItems: [
        {
          testId: 'CAL-030',
          testName: 'Kalibrasi Alat Ukur',
          objectName: 'Alat Ukur Tekanan',
          quantity: 1,
          price: 180000,
        },
      ],
      status: 'draft',
    },
  ];

  const normalized = entries.map((entry) => normalizeRequestEntry(entry));
  const counters = {};
  return normalized.map((entry) => {
    const year = entry.orderYear || extractYear(entry.entryDate) || String(new Date().getFullYear());
    counters[year] = Math.max(counters[year] || 0, coerceOrderNumber(entry.orderNumber) || 0);
    if (!entry.orderNumber) {
      counters[year] += 1;
    }
    const orderNumber = entry.orderNumber || counters[year];
    counters[year] = Math.max(counters[year], orderNumber);
    return {
      ...entry,
      orderYear: year,
      orderNumber,
      testItems: (entry.testItems || []).map((item) => ({
        ...item,
        testCode: item.testCode || (item.testId ? String(item.testId).split('-')[0] : ''),
      })),
    };
  });
}

/**
 * Store permintaan pelanggan sebelum masuk proses kaji ulang.
 * Siap terhubung dengan API namun tetap aman dengan fallback dummy.
 */
export const usePermintaanStore = defineStore('request', {
  state: () => ({
    requestList: [],
    loading: false,
    error: null,
    orderNumberCache: {},
  }),

  actions: {
    rebuildOrderNumberCache() {
      const cache = {};
      this.requestList.forEach((request) => {
        const year = request.orderYear || extractYear(request.entryDate);
        const number = coerceOrderNumber(request.orderNumber);
        if (!year || !number) return;
        cache[year] = Math.max(cache[year] || 0, number);
      });
      this.orderNumberCache = cache;
    },

    peekNextOrderNumber(dateOrYear) {
      const year = extractYear(dateOrYear) || String(new Date().getFullYear());
      const cached = this.orderNumberCache[year] || 0;
      let countInYear = 0;
      const maxInList = this.requestList.reduce((max, request) => {
        const requestYear = request.orderYear || extractYear(request.entryDate);
        if (requestYear === year) {
          countInYear += 1;
        }
        const number = coerceOrderNumber(request.orderNumber);
        if (requestYear === year && number && number > max) {
          return number;
        }
        return max;
      }, 0);
      const baseline = Math.max(cached, maxInList, countInYear);
      return baseline + 1;
    },

    assignOrderIdentifiers(data = {}) {
      const entryDate = data.entryDate || new Date().toISOString().slice(0, 10);
      const orderYear = data.orderYear || extractYear(entryDate) || String(new Date().getFullYear());
      let orderNumber = coerceOrderNumber(data.orderNumber);
      if (!orderNumber) {
        orderNumber = this.peekNextOrderNumber(entryDate);
      }
      const idOrder = data.idOrder || this.generateOrderId({ entryDate, orderNumber });
      this.orderNumberCache[orderYear] = Math.max(this.orderNumberCache[orderYear] || 0, orderNumber);
      return {
        ...data,
        idOrder,
        orderNumber,
        orderYear,
      };
    },

    /** Fetch semua permintaan (API atau fallback dummy) */
    async fetchAll() {
      this.loading = true;
      try {
        const res = await api.get('/api/v1/requests');
        const remote = Array.isArray(res.data?.data) ? res.data.data : [];
        this.requestList = remote.map((entry) => normalizeRequestEntry(entry));
        this.rebuildOrderNumberCache();
        this.error = null;
        const kajiUlangStore = useKajiUlangStore();
        this.requestList.forEach((request) => {
          kajiUlangStore.upsertFromRequest(request, {
            paymentDetail: request.paymentInfo || null,
          });
        });
      } catch (err) {
        console.warn('[PermintaanStore] API belum tersedia, memakai dummy data.');
        this.error = 'Dummy mode aktif (API belum terhubung).';
        const dummyRequests = createDummyRequests();
        this.requestList = dummyRequests;
        this.rebuildOrderNumberCache();
        const kajiUlangStore = useKajiUlangStore();
        dummyRequests.forEach((request) => {
          kajiUlangStore.upsertFromRequest(request, {
            paymentDetail: request.paymentInfo || null,
          });
        });
      } finally {
        this.loading = false;
      }
    },

    /** Tambah permintaan baru */
    async addRequest(data) {
      this.loading = true;
      const payload = this.assignOrderIdentifiers({ ...data });
      try {
        const res = await api.post('/api/v1/requests', payload);
        const newData = normalizeRequestEntry(res.data.data);
        if (!newData.orderNumber) {
          newData.orderNumber = payload.orderNumber || null;
        }
        if (!newData.orderYear) {
          newData.orderYear = payload.orderYear || extractYear(payload.entryDate);
        }
        this.requestList.push(newData);
        this.rebuildOrderNumberCache();
        const kajiUlangStore = useKajiUlangStore();
        kajiUlangStore.upsertFromRequest(newData, {
          paymentDetail: newData.paymentInfo || null,
        });
        logRequestEvent({
          request: newData,
          status: newData.status,
          title: 'Permintaan baru dibuat',
          description: `${newData.customerName || 'Pemohon'} membuat permintaan ${newData.idOrder || ''}`,
          statusLevel: 'success',
        });
        return { ok: true, data: newData };
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, simpan ke dummy store.');
        const newData = normalizeRequestEntry({
          ...payload,
          status: payload.status || 'draft',
          createdAt: new Date().toISOString(),
        });
        this.requestList.push(newData);
        this.rebuildOrderNumberCache();
        const kajiUlangStore = useKajiUlangStore();
        kajiUlangStore.upsertFromRequest(newData, {
          paymentDetail: newData.paymentInfo || null,
        });
        logRequestEvent({
          request: newData,
          status: newData.status,
          title: 'Permintaan dicatat lokal',
          description: `${newData.customerName || 'Pemohon'} membuat permintaan (offline) ${newData.idOrder || ''}`,
          statusLevel: 'warning',
        });
        return { ok: true, data: newData, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    /** Update permintaan */
    async updateRequest(idOrder, payload) {
      let updated = null;
      let dummy = false;
      try {
        const res = await api.put(`/api/v1/requests/${idOrder}`, payload);
        updated = normalizeRequestEntry(res.data.data);
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, update dummy store.');
        dummy = true;
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) {
          updated = normalizeRequestEntry({
            ...this.requestList[idx],
            ...payload,
          });
        }
      }

      if (updated) {
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) {
          this.requestList[idx] = updated;
        } else {
          this.requestList.push(updated);
        }
        this.rebuildOrderNumberCache();

        const kajiUlangStore = useKajiUlangStore();
        kajiUlangStore.upsertFromRequest(updated, {
          paymentDetail: updated.paymentInfo || null,
        });

        if (payload?.status) {
          logRequestEvent({
            request: updated,
            status: payload.status,
            title: dummy ? 'Status permintaan diperbarui (offline)' : 'Status permintaan diperbarui',
            statusLevel: dummy ? 'warning' : 'success',
          });
        }
      }

      return { ok: true, data: updated, dummy };
    },

    /** Hapus permintaan */
    async deleteRequest(idOrder) {
      let dummy = false;
      try {
        await api.delete(`/api/v1/requests/${idOrder}`);
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, hapus dari dummy store.');
        dummy = true;
      }
      this.requestList = this.requestList.filter((r) => r.idOrder !== idOrder);
      this.rebuildOrderNumberCache();
      const kajiUlangStore = useKajiUlangStore();
      kajiUlangStore.removeOrder(idOrder);
      return dummy ? { ok: true, dummy: true } : { ok: true };
    },

    /** Tandai permintaan disetujui */
    approveRequest(idOrder) {
      const item = this.requestList.find((r) => r.idOrder === idOrder);
      if (item) {
        item.status = 'approved';
        logRequestEvent({
          request: item,
          status: 'approved',
          title: 'Permintaan disetujui',
          statusLevel: 'success',
        });
      }
    },

    /** Generate ID Order otomatis */
    generateOrderId({ entryDate, orderNumber } = {}) {
      const date = entryDate ? new Date(entryDate) : new Date();
      const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
      const year = validDate.getFullYear();
      const month = String(validDate.getMonth() + 1).padStart(2, '0');
      const sequence = String(orderNumber || this.peekNextOrderNumber(validDate)).padStart(4, '0');
      return `ORD-${year}${month}-${sequence}`;
    },

    /** Cari berdasarkan ID (case-insensitive, minimal 8 karakter) */
    searchById(query) {
      if (!query || query.length < 8) return [];
      const q = query.toLowerCase();
      return this.requestList.filter((r) =>
        r.idOrder?.toLowerCase().includes(q)
      );
    },

    /** Alias untuk kompatibilitas lama */
    searchPermintaanById(query) {
      return this.searchById(query);
    },

    /** Cari status order publik berdasarkan ID */
    async checkOrderStatus(idOrder) {
      const query = (idOrder || '').trim();
      if (!query) {
        return { ok: false, error: 'ID Order harus diisi.' };
      }

      this.loading = true;
      try {
        const res = await api.get(`/api/v1/requests/${encodeURIComponent(query)}`, {
          skipAuthRedirect: true,
        });
        const data = normalizeRequestEntry(res.data?.data || {});
        if (data?.idOrder) {
          const idx = this.requestList.findIndex((r) => r.idOrder === data.idOrder);
          if (idx !== -1) {
            this.requestList[idx] = data;
          } else {
            this.requestList.push(data);
          }
          return { ok: true, data };
        }
        return { ok: false, error: 'Data permintaan tidak ditemukan.' };
      } catch (err) {
        const localMatch = this.requestList.find(
          (r) => r.idOrder?.toLowerCase() === query.toLowerCase()
        );
        if (localMatch) {
          return { ok: true, data: localMatch, dummy: true };
        }

        let message = 'Gagal memuat status permintaan. Silakan coba lagi.';
        const status = err?.response?.status;
        if (status === 404) {
          message = 'ID Order tidak ditemukan.';
        } else if (status === 401) {
          message = 'Tidak memiliki akses untuk melihat status ini.';
        }
        return { ok: false, error: message, status };
      } finally {
        this.loading = false;
      }
    },
  },
});
