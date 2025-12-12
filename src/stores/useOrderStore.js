import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const statusLabels = {
  draft: 'Draft',
  awaiting_kaji_ulang: 'Menunggu Kaji Ulang',
  pending_payment: 'Menunggu Pembayaran',
  payment_pending_review: 'Menunggu Review Pembayaran',
  payment_verified: 'Pembayaran Terverifikasi',
  payment_review_rejected: 'Bukti Pembayaran Ditolak',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
  in_testing: 'Proses Pengujian',
  completed: 'Selesai',
};

const ensureString = (value, fallback = '') =>
  typeof value === 'string' && value.trim().length ? value.trim() : fallback;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractYear = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return String(date.getFullYear());
  const match = /^(\d{4})/.exec(String(value));
  return match ? match[1] : '';
};

const coerceOrderNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const normalizeTransferFiles = (files = [], orderNo = '') =>
  Array.isArray(files)
    ? files
        .filter(Boolean)
        .map((file, idx) => ({
          id: file.id || `${orderNo || 'order'}-evidence-${idx + 1}`,
          name: file.name || `Lampiran-${idx + 1}`,
          size: toNumber(file.size),
          type: ensureString(file.type) || 'application/octet-stream',
          previewUrl: ensureString(file.previewUrl),
        }))
    : [];

const normalizePaymentInfo = (value = {}, orderNo = '') => {
  if (!value) return null;
  const reviewStatus = ensureString(value.reviewStatus) || 'pending';
  const status =
    ensureString(value.status) ||
    (reviewStatus === 'approved'
      ? 'payment_verified'
      : reviewStatus === 'rejected'
      ? 'payment_review_rejected'
      : 'payment_pending_review');

  return {
    status,
    reviewStatus,
    total: toNumber(value.total),
    amountPaid: toNumber(value.amountPaid),
    outstanding: toNumber(
      value.outstanding ?? (toNumber(value.total) - toNumber(value.amountPaid))
    ),
    paymentDate: value.paymentDate || value.paidAt || '',
    paymentDeadline: value.paymentDeadline || value.dueDate || '',
    reviewedBy: ensureString(value.reviewedBy),
    reviewedAt: value.reviewedAt || '',
    reviewNote: ensureString(value.reviewNote),
    transferFiles: normalizeTransferFiles(value.transferFiles, orderNo),
  };
};

const normalizeTestItem = (item = {}) => {
  const price = toNumber(item.price ?? item.testPrice ?? item.servicePrice, 0);
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const name =
    item.testName ||
    item.name ||
    item.title ||
    item.test_category ||
    item.testCategory ||
    'Pengujian';

  return {
    testId: item.testId || item.id || item.service_id || item.serviceId || '',
    serviceId: item.service_id || item.serviceId || item.testId || item.id || '',
    testName: name,
    testCode:
      item.testCode ||
      item.code ||
      item.service_code ||
      item.serviceCode ||
      '',
    objectName:
      item.objectName ||
      item.sampleName ||
      item.testName ||
      item.name ||
      '',
    unit: ensureString(item.unit),
    price,
    quantity,
    methodId: item.method_id || item.methodId || '',
    machineId: item.machine_id || item.machineId || '',
  };
};

const normalizeOrder = (entry = {}) => {
  const orderNo =
    entry.idOrder ||
    entry.orderNo ||
    entry.order_no ||
    entry.orderId ||
    entry.id ||
    '';
  const entryDate =
    entry.entryDate || entry.date || entry.createdAt || entry.created_at || '';
  const orderYear = entry.orderYear || extractYear(entryDate);
  const orderNumber =
    coerceOrderNumber(entry.orderNumber || entry.order_sequence) || null;
  const status = ensureString(entry.status) || 'draft';
  const paymentInfo = normalizePaymentInfo(entry.paymentInfo, orderNo);

  const rawItems = Array.isArray(entry.testItems || entry.items)
    ? entry.testItems || entry.items
    : [];
  const testItems = rawItems.map((item) => normalizeTestItem(item));

  const addressRel = entry.address || entry.customer_address || null;

  return {
    id: entry.id || orderNo,
    orderNo,
    orderNumber,
    orderYear,
    entryDate,
    status,
    statusLabel: statusLabels[status] || status,
    customerId: entry.customer_id || entry.customerId || '',
    customerName: entry.customerName || entry.customer_name || '',
    customerPhone: entry.phoneNumber || entry.customerPhone || entry.phone || '',
    customerEmail: entry.customerEmail || entry.email || '',
    addressId: entry.address_id || entry.addressId || '',
    address:
      (addressRel && (addressRel.full_address || addressRel.address)) ||
      entry.address ||
      '',
    addressFull:
      (addressRel && (addressRel.full_address || addressRel.address)) ||
      entry.address ||
      '',
    jobCategory: entry.jobCategory || entry.job_category || '',
    workCategoryId:
      entry.work_category_id || entry.workCategoryId || entry.workCategory || '',
    workCategoryName:
      entry.workCategoryName ||
      entry.work_category_name ||
      entry.work_category ||
      '',
    workPackageId:
      entry.work_package_id ||
      entry.workPackageId ||
      entry.work_package ||
      entry.workPackage ||
      '',
    workPackageName:
      entry.workPackageName || entry.work_package_name || entry.workPackage || '',
    purpose: entry.purpose || entry.testCategory || '',
    note: entry.note || '',
    certificateName: entry.certificateName || entry.certificate_name || '',
    paymentInfo,
    testItems,
  };
};

const generateOrderNo = ({ entryDate, orderNumber }) => {
  const date = entryDate ? new Date(entryDate) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const sequence = String(orderNumber || 1).padStart(4, '0');
  return `ORD-${year}${month}-${sequence}`;
};

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),

  getters: {
    getByOrderNo: (state) => (orderNo) =>
      state.orders.find(
        (o) => (o.orderNo || '').toLowerCase() === (orderNo || '').toLowerCase()
      ),
  },

  actions: {
    upsertLocal(entry = {}) {
      const order = normalizeOrder(entry);
      const idx = this.orders.findIndex((o) => o.orderNo === order.orderNo);
      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], ...order };
      } else {
        this.orders.push(order);
      }
      return order;
    },

    async fetchAll() {
      this.loading = true;
      try {
        const res = await api.get('/api/v1/requests');
        const payload = Array.isArray(res.data?.data) ? res.data.data : [];
        this.orders = payload.map((item) => normalizeOrder(item));
        this.error = null;
        return { ok: true, data: this.orders };
      } catch (err) {
        console.warn('[OrderStore] API belum siap, menggunakan dummy data.', err);
        this.error = 'Dummy mode aktif (ORDER belum tersedia).';
        this.orders = this.buildDummyOrders();
        return { ok: true, data: this.orders, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    async fetchById(orderNo) {
      const query = ensureString(orderNo);
      if (!query) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      try {
        const res = await api.get(`/api/v1/requests/${encodeURIComponent(query)}`);
        const order = normalizeOrder(res.data?.data || {});
        if (order.orderNo) this.upsertLocal(order);
        return { ok: Boolean(order.orderNo), data: order };
      } catch (err) {
        const local = this.getByOrderNo(query);
        if (local) return { ok: true, data: local, dummy: true };
        return { ok: false, error: 'Order tidak ditemukan', status: err?.response?.status };
      } finally {
        this.loading = false;
      }
    },

    async createOrder(payload = {}) {
      this.loading = true;
      const draftOrderNumber =
        coerceOrderNumber(payload.orderNumber) || this.orders.length + 1;
      const draftOrderNo = generateOrderNo({
        entryDate: payload.entryDate,
        orderNumber: draftOrderNumber,
      });

      try {
        const res = await api.post('/api/v1/requests', payload);
        const order = normalizeOrder(res.data?.data || {});
        this.upsertLocal(order);
        return { ok: true, data: order };
      } catch (err) {
        console.warn('[OrderStore] createOrder dummy fallback', err);
        const order = normalizeOrder({
          ...payload,
          orderNo: payload.idOrder || draftOrderNo,
          idOrder: payload.idOrder || draftOrderNo,
          orderNumber: payload.orderNumber || draftOrderNumber,
          orderYear: payload.orderYear || extractYear(payload.entryDate),
          status: payload.status || 'draft',
        });
        this.upsertLocal(order);
        return { ok: true, data: order, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    async updateOrder(orderNo, payload = {}) {
      const target = ensureString(orderNo);
      if (!target) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      try {
        const res = await api.put(
          `/api/v1/requests/${encodeURIComponent(target)}`,
          payload
        );
        const order = normalizeOrder(res.data?.data || {});
        this.upsertLocal(order);
        return { ok: true, data: order };
      } catch (err) {
        console.warn('[OrderStore] updateOrder dummy fallback', err);
        const existing = this.getByOrderNo(target) || {};
        const order = normalizeOrder({ ...existing, ...payload, orderNo: target });
        this.upsertLocal(order);
        return { ok: true, data: order, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    async deleteOrder(orderNo) {
      const target = ensureString(orderNo);
      if (!target) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      let dummy = false;
      try {
        await api.delete(`/api/v1/requests/${encodeURIComponent(target)}`);
      } catch (err) {
        console.warn('[OrderStore] deleteOrder dummy fallback', err);
        dummy = true;
      } finally {
        this.loading = false;
      }
      this.orders = this.orders.filter(
        (order) =>
          (order.orderNo || '').toLowerCase() !== target.toLowerCase() &&
          (order.id || '').toLowerCase() !== target.toLowerCase()
      );
      return { ok: true, dummy };
    },

    buildDummyOrders() {
      const seeds = [
        {
          idOrder: 'ORD-202501-001',
          entryDate: '2025-01-04',
          customerName: 'PT Maju Jaya Sejahtera',
          phoneNumber: '021-555-0101',
          address: 'Jl. Merdeka No. 12, Tegal',
          jobCategory: 'Industri',
          workPackage: 'Audit Material',
          status: 'payment_verified',
          testItems: [
            { testId: 'UTK-001', testName: 'Uji Tarik', objectName: 'Besi Beton', quantity: 2, price: 250000 },
            { testId: 'UKH-002', testName: 'Uji Kekerasan', objectName: 'Pelat Baja', quantity: 1, price: 150000 },
          ],
          paymentInfo: {
            status: 'payment_verified',
            reviewStatus: 'approved',
            total: 650000,
            amountPaid: 650000,
            outstanding: 0,
            paymentDate: '2025-01-05T08:30:00Z',
            paymentDeadline: '2025-01-07T00:00:00Z',
            transferFiles: [
              {
                name: 'Bukti-Transfer-ORD-001.png',
                size: 245678,
                type: 'image/png',
                previewUrl:
                  'https://dummyimage.com/600x360/edf2f7/1a202c&text=Bukti+Transfer',
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
          status: 'awaiting_kaji_ulang',
          testItems: [
            { testId: 'UKK-010', testName: 'Uji Komposisi Kimia', objectName: 'Serbuk Aluminium', quantity: 1, price: 375000 },
          ],
          paymentInfo: null,
        },
        {
          idOrder: 'ORD-202501-006',
          entryDate: '2025-01-09',
          customerName: 'PT Sentosa Logam',
          phoneNumber: '021-770099',
          address: 'Jl. Rajawali No. 17, Brebes',
          jobCategory: 'Kontraktor',
          workPackage: 'Proyek Infrastruktur',
          status: 'pending_payment',
          testItems: [
            { testId: 'UKT-015', testName: 'Uji Kekuatan Tekan', objectName: 'Besi Cor', quantity: 1, price: 420000 },
          ],
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
      ];

      return seeds.map((item) => normalizeOrder(item));
    },
  },
});
