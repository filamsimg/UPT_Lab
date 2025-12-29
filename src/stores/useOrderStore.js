import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { useActivityStore } from '@/stores/useActivityStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ORDER_STATUS_LABELS, normalizeOrderStatus } from '@/utils/orderStatus';

/**
 * Store utama untuk Material Test Order (bagian internal dashboard).
 * Tanggung jawab:
 * - normalisasi payload BE <-> FE agar komponen form & tabel konsisten,
 * - caching data order di memory (Pinia state),
 * - fallback update lokal jika endpoint BE belum tersedia.
 */

const statusLabels = ORDER_STATUS_LABELS;

const ensureString = (value, fallback = '') =>
  typeof value === 'string' && value.trim().length ? value.trim() : fallback;

const toText = (value, fallback = '') => {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const ORDER_ACTIVITY_MAP = {
  create: {
    action: 'orders.create',
    title: 'Permintaan dibuat',
    type: 'request',
    status: 'success',
  },
  update: {
    action: 'orders.update',
    title: 'Permintaan diperbarui',
    type: 'request',
    status: 'info',
  },
  approve: {
    action: 'orders.review_approved',
    title: 'Kaji ulang disetujui',
    type: 'request',
    status: 'success',
  },
  reject: {
    action: 'orders.review_rejected',
    title: 'Kaji ulang ditolak',
    type: 'request',
    status: 'error',
  },
  cancel: {
    action: 'orders.cancel',
    title: 'Permintaan dibatalkan',
    type: 'request',
    status: 'warning',
  },
  'submit-payment': {
    action: 'orders.payment_submitted',
    title: 'Bukti pembayaran dikirim',
    type: 'payment',
    status: 'info',
  },
  'approve-payment': {
    action: 'orders.payment_approved',
    title: 'Pembayaran disetujui',
    type: 'payment',
    status: 'success',
  },
  'reject-payment': {
    action: 'orders.payment_rejected',
    title: 'Pembayaran ditolak',
    type: 'payment',
    status: 'error',
  },
  test: {
    action: 'orders.testing',
    title: 'Pengujian dimulai',
    type: 'request',
    status: 'info',
  },
  complete: {
    action: 'orders.completed',
    title: 'Pengujian selesai',
    type: 'request',
    status: 'success',
  },
  refund: {
    action: 'orders.refund',
    title: 'Refund diproses',
    type: 'payment',
    status: 'warning',
  },
};

const resolveOrderReference = (order = {}) => {
  const primary =
    ensureString(order.orderNo) ||
    ensureString(order.idOrder) ||
    ensureString(order.orderId) ||
    toText(order.id);
  if (primary) return primary;
  const fallback =
    ensureString(order.orderDisplay) ||
    ensureString(order.orderCode);
  if (fallback) return fallback;
  return toText(order.orderNumber, '');
};

const resolveOrderSubjectName = (order = {}) =>
  ensureString(order.orderDisplay) ||
  ensureString(order.orderCode) ||
  resolveOrderReference(order);

const resolveOrderStatusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);
  return statusLabels[normalized] || normalized || '';
};

const buildOrderActivityDescription = (order = {}) => {
  const reference = resolveOrderReference(order);
  const customer = ensureString(order.customerName);
  const statusLabel = resolveOrderStatusLabel(order.status);
  const parts = [];
  if (reference) parts.push(`Permintaan ${reference}`);
  if (customer) parts.push(`Pemohon: ${customer}`);
  if (statusLabel) parts.push(`Status: ${statusLabel}`);
  return parts.length ? parts.join(' | ') : 'Aktivitas permintaan';
};

const recordOrderActivity = (order, actionKey, overrides = {}) => {
  const config = ORDER_ACTIVITY_MAP[actionKey];
  if (!config || !order) return;
  const reference = resolveOrderReference(order);
  if (!reference) return;
  try {
    const activityStore = useActivityStore();
    const authStore = useAuthStore();
    const currentUser = authStore?.currentUser || null;
    if (currentUser?.id != null) {
      activityStore.setActiveUser(currentUser.id);
    }
    const statusLabel = resolveOrderStatusLabel(order.status);
    const subjectName = resolveOrderSubjectName(order) || reference;
    const causer =
      currentUser && (currentUser.id || currentUser.email)
        ? {
            id: currentUser.id ?? '',
            name:
              ensureString(currentUser.name) ||
              ensureString(currentUser.email) ||
              toText(currentUser.id, ''),
            email: ensureString(currentUser.email),
          }
        : null;

    activityStore.addEvent({
      action: overrides.action || config.action,
      type: overrides.type || config.type,
      title: overrides.title || config.title,
      description:
        overrides.description || buildOrderActivityDescription(order),
      status: overrides.status || config.status,
      referenceId: reference,
      causer,
      metadata: {
        source: 'frontend',
        module: 'order',
        orderNo: ensureString(order.orderNo) || reference,
        orderId: toText(order.id || order.orderId || order.idOrder, reference),
        orderDisplay:
          ensureString(order.orderDisplay) || ensureString(order.orderCode),
        orderStatus: normalizeOrderStatus(order.status),
        orderStatusLabel: statusLabel,
        customerName: ensureString(order.customerName),
        subjectName,
        ...overrides.metadata,
      },
    });
  } catch (err) {
    console.warn('[OrderStore] gagal mencatat aktivitas', err);
  }
};

const sanitizeTestName = (value) => {
  const text = ensureString(value);
  if (!text) return '';
  const lower = text.toLowerCase();
  if (['pengujian', 'testing', 'machining'].includes(lower)) return '';
  return text;
};

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
        .map((file, idx) => {
          const name =
            ensureString(file.name) ||
            ensureString(file.file_name) ||
            ensureString(file.filename) ||
            ensureString(file.title) ||
            `Lampiran-${idx + 1}`;
          const previewUrl =
            ensureString(file.previewUrl) ||
            ensureString(file.file_url) ||
            ensureString(file.url) ||
            '';
          const type =
            ensureString(file.type) ||
            ensureString(file.mime_type) ||
            ensureString(file.mimetype) ||
            'application/octet-stream';
          const size = toNumber(
            file.size ?? file.file_size ?? file.filesize,
            0
          );
          return {
            id: file.id || file.media_id || `${orderNo || 'order'}-evidence-${idx + 1}`,
            name,
            size,
            type,
            previewUrl,
          };
        })
    : [];

// Normalisasi detail pembayaran agar FE tidak bergantung pada struktur BE yang mungkin berubah
const normalizePaymentInfo = (value = {}, orderNo = '') => {
  if (!value) return null;
  const reviewStatus = ensureString(value.reviewStatus) || '';
  const explicitStatus = normalizeOrderStatus(value.status);
  const status = explicitStatus
    ? explicitStatus
    : reviewStatus === 'approved'
    ? 'payment_approved'
    : reviewStatus === 'rejected'
    ? 'payment_rejected'
    : 'payment_submitted';

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

const sumTestItemsTotal = (items = []) =>
  (items || []).reduce((total, item) => {
    const price = toNumber(item.price ?? item.servicePrice ?? item.testPrice, 0);
    const quantity = Math.max(1, toNumber(item.quantity, 1));
    return total + price * quantity;
  }, 0);

const isPaymentProofMedia = (media = {}) => {
  const collection = ensureString(media.collection_name || media.collectionName).toLowerCase();
  return collection.includes('payment');
};

const extractPaymentProofFiles = (medias = [], orderNo = '') => {
  if (!Array.isArray(medias)) return [];
  const paymentMedias = medias.filter((media) => isPaymentProofMedia(media));
  return normalizeTransferFiles(paymentMedias, orderNo);
};

const normalizeTestItem = (item = {}) => {
  const price = toNumber(item.price ?? item.testPrice ?? item.servicePrice, 0);
  const quantity = Math.max(1, toNumber(item.quantity, 1));
  const serviceName =
    item.service?.test_name ||
    item.service?.testName ||
    item.service?.name ||
    item.service?.service_name ||
    item.service?.title ||
    '';
  const name =
    sanitizeTestName(item.testName) ||
    sanitizeTestName(item.test_name) ||
    sanitizeTestName(item.service_name) ||
    sanitizeTestName(item.serviceName) ||
    sanitizeTestName(item.name) ||
    sanitizeTestName(item.title) ||
    sanitizeTestName(serviceName) ||
    sanitizeTestName(item.test_category) ||
    sanitizeTestName(item.testCategory) ||
    '';

  const resolvedServiceId =
    item.service_id ||
    item.serviceId ||
    item.service?.id ||
    item.service?.service_id ||
    item.service?.serviceId ||
    item.testId ||
    '';
  const orderedServiceId =
    item.ordered_service_id ||
    item.orderedServiceId ||
    item.id ||
    '';

  return {
    orderedServiceId,
    testId: resolvedServiceId || item.testId || '',
    serviceId: resolvedServiceId,
    testName: name,
    testCode:
      item.testCode ||
      item.code ||
      item.service_code ||
      item.serviceCode ||
      '',
    objectName:
      item.objectName ||
      item.sample_name ||
      item.sampleName ||
      item.testName ||
      item.name ||
      '',
    unit: ensureString(item.unit),
    price,
    quantity,
    lineTotal: toNumber(item.line_total ?? item.lineTotal ?? price * quantity, 0),
    methodId: item.method_id || item.methodId || '',
    methodName:
      item.method_name ||
      item.methodName ||
      item.method?.name ||
      item.method?.MethodName ||
      item.method ||
      '',
    machineId: item.machine_id || item.machineId || '',
    // Simpan nomor sampel dari BE (sample_number/sample_code) sebagai sampleCode + alias sampleNo
    sampleCode:
      ensureString(item.sample_number) ||
      ensureString(item.sampleNumber) ||
      ensureString(item.sample_code) ||
      ensureString(item.sampleCode),
    sampleNo:
      ensureString(item.sample_number) ||
      ensureString(item.sampleNumber) ||
      ensureString(item.sample_code) ||
      ensureString(item.sampleCode),
    evaluation: item.evaluation || null,
  };
};

/**
 * Ratakan payload order (termasuk yang bersarang dalam material_test_order) ke shape FE tunggal.
 * Field snake_case dan camelCase disatukan untuk mengurangi kondisi di komponen.
 */
const normalizeOrder = (entry = {}) => {
  const materialTestOrder = entry.material_test_order || entry.materialTestOrder;
  if (materialTestOrder && typeof materialTestOrder === 'object') {
    entry = materialTestOrder;
  }

  const orderUsersRaw = Array.isArray(entry.order_users || entry.orderUsers)
    ? entry.order_users || entry.orderUsers
    : [];
  const orderUsers = orderUsersRaw
    .filter(Boolean)
    .map((item) => ({
      roleId: item.role_id || item.roleId || '',
      userId: item.user_id || item.userId || '',
      type: ensureString(item.type),
      user: item.user && typeof item.user === 'object'
        ? {
            id: item.user.id || '',
            name: ensureString(item.user.name),
            email: ensureString(item.user.email),
          }
        : null,
    }));

  const orderNo =
    entry.idOrder ||
    entry.orderNo ||
    entry.order_no ||
    entry.orderId ||
    entry.id ||
    '';

  const orderCode =
    ensureString(entry.number) ||
    ensureString(entry.order_code) ||
    ensureString(entry.orderCode) ||
    ensureString(entry.orderDisplay) ||
    '';
  const entryDate =
    entry.entered_at ||
    entry.enteredAt ||
    entry.entryDate ||
    entry.date ||
    entry.createdAt ||
    entry.created_at ||
    '';
  const orderYear = entry.orderYear || extractYear(entryDate);
  const orderNumber =
    coerceOrderNumber(entry.orderNumber || entry.order_sequence) || null;
  const status = normalizeOrderStatus(entry.status) || 'draft';

  const rawItems = Array.isArray(entry.ordered_services || entry.orderedServices)
    ? entry.ordered_services || entry.orderedServices
    : Array.isArray(entry.testItems || entry.items)
    ? entry.testItems || entry.items
    : [];
  const testItems = rawItems.map((item) => normalizeTestItem(item));
  const computedTotal = sumTestItemsTotal(testItems);
  const orderTotal = toNumber(
    entry.total ?? entry.total_amount ?? entry.sub_total ?? entry.subTotal,
    computedTotal
  );
  const paymentProofFiles = extractPaymentProofFiles(entry.medias, orderNo);
  const assumedPaidStatuses = [
    'payment_submitted',
    'payment_approved',
    'payment_rejected',
  ];
  let paymentInfo = normalizePaymentInfo(entry.paymentInfo, orderNo);
  if (!paymentInfo && (paymentProofFiles.length || orderTotal > 0)) {
    const amountPaid = assumedPaidStatuses.includes(status) ? orderTotal : 0;
    paymentInfo = normalizePaymentInfo(
      {
        status,
        total: orderTotal,
        amountPaid,
        outstanding: Math.max(0, orderTotal - amountPaid),
        transferFiles: paymentProofFiles,
      },
      orderNo
    );
  } else if (paymentInfo) {
    const next = { ...paymentInfo };
    if (paymentProofFiles.length && !next.transferFiles?.length) {
      next.transferFiles = paymentProofFiles;
    }
    if (!next.total && orderTotal > 0) {
      const amountPaid = assumedPaidStatuses.includes(status)
        ? orderTotal
        : next.amountPaid;
      next.total = orderTotal;
      next.amountPaid = amountPaid;
      next.outstanding = Math.max(0, orderTotal - (amountPaid || 0));
    }
    paymentInfo = next;
  }

  const addressRel = entry.address || entry.customer_address || null;

  return {
    id: entry.id || orderNo,
    orderNo,
    orderNumber,
    orderCode,
    orderDisplay: orderCode,
    orderYear,
    entryDate,
    status,
    statusLabel: statusLabels[status] || status,
    customerId: entry.customer_id || entry.customerId || '',
    customerName:
      entry.customerName || entry.customer_name || entry.applicant_name || '',
    customerPhone:
      entry.phoneNumber ||
      entry.customerPhone ||
      entry.phone ||
      entry.applicant_phone_number ||
      '',
    customerEmail:
      entry.customerEmail || entry.email || entry.applicant_email || '',
    addressId: entry.address_id || entry.addressId || '',
    address:
      (addressRel && (addressRel.full_address || addressRel.address)) ||
      entry.address ||
      entry.applicant_full_address ||
      '',
    addressFull:
      (addressRel && (addressRel.full_address || addressRel.address)) ||
      entry.address ||
      entry.applicant_full_address ||
      '',
    jobCategory: entry.jobCategory || entry.job_category || '',
    workCategoryId:
      entry.work_category_id || entry.workCategoryId || entry.workCategory || '',
    workCategoryName:
      entry.workCategoryName ||
      entry.work_category_name ||
      entry.work_category?.name ||
      entry.work_category ||
      '',
    workPackageId:
      entry.work_package_id ||
      entry.workPackageId ||
      entry.work_package ||
      entry.workPackage ||
      '',
    workPackageName:
      entry.workPackageName ||
      entry.work_package_name ||
      entry.work_package?.name ||
      entry.workPackage ||
      entry.work_package ||
      '',
    purpose: entry.purpose || entry.testCategory || '',
    note: entry.note || entry.applicant_note || '',
    certificateName:
      entry.certificateName ||
      entry.certificate_name ||
      entry.recipient_name ||
      '',
    paymentInfo,
    testItems,
    medias: Array.isArray(entry.medias) ? entry.medias : [],
    orderUsers,
  };
};

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const formatDateTimeForBE = (dateValue, defaultTime = '09:00:00') => {
  // Accept Date, string YYYY-MM-DD, or any parseable date
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    const iso = dateValue.toISOString();
    return `${iso.slice(0, 10)} ${defaultTime}`;
  }
  const text = ensureString(dateValue);
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);
  if (match) return `${match[1]} ${defaultTime}`;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    const iso = parsed.toISOString();
    return `${iso.slice(0, 10)} ${defaultTime}`;
  }
  const today = todayDateOnly();
  return `${today} ${defaultTime}`;
};

// Backend menginginkan "YYYY-MM-DD HH:mm:ss"; fungsi ini menerima Date/string dan memastikan format itu.
const formatEnteredAt = (rawDate) => {
  const value = ensureString(rawDate);
  if (!value) return `${todayDateOnly()} 00:00:00`;

  // Prefer YYYY-MM-DD (from date input)
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (match) return `${match[1]} 00:00:00`;

  // Fallback: try parsing any valid date string
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    // Convert to "YYYY-MM-DD HH:MM:SS" in local time for backend
    const iso = parsed.toISOString();
    const datePart = iso.slice(0, 10);
    const timePart = iso.slice(11, 19);
    return `${datePart} ${timePart}`;
  }

  // Last resort: fallback to today
  return `${todayDateOnly()} 00:00:00`;
};

const buildMaterialTestOrderBasePayload = (payload = {}) => {
  const testItems = Array.isArray(payload.testItems) ? payload.testItems : [];
  const orderedServices = testItems
    .filter((item) => item && (item.serviceId || item.service_id || item.testId))
    .map((item) => {
      const serviceId = item.serviceId || item.service_id || item.testId || '';
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const sampleName =
        ensureString(item.objectName) ||
        ensureString(item.sample_name) ||
        ensureString(item.sampleName) ||
        ensureString(item.testName) ||
        'Sampel';
      return {
        service_id: serviceId,
        sample_name: sampleName,
        quantity,
      };
    });

  const ownerIdsRaw =
    payload.owner_user_ids ??
    payload.ownerUserIds ??
    payload.owner_user_id ??
    payload.ownerUserId ??
    [];
  const ownerIdsProvided =
    Object.prototype.hasOwnProperty.call(payload, 'owner_user_ids') ||
    Object.prototype.hasOwnProperty.call(payload, 'ownerUserIds') ||
    Object.prototype.hasOwnProperty.call(payload, 'owner_user_id') ||
    Object.prototype.hasOwnProperty.call(payload, 'ownerUserId');

  const ownerUserIds = Array.isArray(ownerIdsRaw)
    ? ownerIdsRaw.map((id) => ensureString(id)).filter(Boolean)
    : ensureString(ownerIdsRaw)
    ? [ensureString(ownerIdsRaw)]
    : [];

  const applicantName =
    payload.applicant_name || payload.customerName || payload.customer_name || '';
  const recipientName =
    payload.recipient_name ||
    payload.certificateName ||
    payload.certificate_name ||
    applicantName;

  const rawDate =
    payload.entered_at ||
    payload.entryDate ||
    payload.date ||
    todayDateOnly();
  const enteredAt = formatDateTimeForBE(rawDate);

  return {
    work_category_id:
      ensureString(payload.work_category_id || payload.workCategoryId),
    work_package_name:
      payload.work_package_name || payload.workPackageName || payload.workPackage || '',
    applicant_name: applicantName,
    applicant_phone_number:
      payload.applicant_phone_number ||
      payload.phoneNumber ||
      payload.customerPhone ||
      payload.phone ||
      '',
    applicant_email:
      payload.applicant_email || payload.customerEmail || payload.email || '',
    applicant_full_address:
      payload.applicant_full_address || payload.address || payload.customerAddress || '',
    applicant_note:
      payload.applicant_note || payload.note || '',
    recipient_name: recipientName,
    entered_at: enteredAt,
    ...((ownerIdsProvided || ownerUserIds.length)
      ? { owner_user_ids: ownerUserIds }
      : {}),
    ...(orderedServices.length ? { ordered_services: orderedServices } : {}),
  };
};

/**
 * Bangun payload minimal yang diterima endpoint create material-test-order.
 * - Filter hanya item pengujian yang memiliki serviceId.
 * - Pastikan tanggal dan status sudah tervalidasi sebelum dikirim.
 */
const buildMaterialTestOrderPayload = (payload = {}) => {
  const base = buildMaterialTestOrderBasePayload(payload);
  const allowedStatuses = ['draft', 'awaiting_review'];
  const statusCandidate = normalizeOrderStatus(payload.status) || 'draft';
  const status = allowedStatuses.includes(statusCandidate)
    ? statusCandidate
    : 'draft';
  return {
    ...base,
    status,
  };
};

const buildMaterialTestOrderUpdatePayload = (payload = {}) => {
  const base = buildMaterialTestOrderBasePayload(payload);
  const allowedStatuses = ['draft', 'awaiting_review'];
  const statusCandidate = normalizeOrderStatus(payload.status);
  if (!statusCandidate || !allowedStatuses.includes(statusCandidate)) {
    return base;
  }
  return {
    ...base,
    status: statusCandidate,
  };
};

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Cari order dari cache lokal berdasar orderNo (case-insensitive)
    getByOrderNo: (state) => (orderNo) =>
      state.orders.find(
        (o) => (o.orderNo || '').toLowerCase() === (orderNo || '').toLowerCase()
      ),
  },

  actions: {
    /**
     * Simpan order ke cache lokal (insert/update) setelah dinormalisasi.
     * Dipakai oleh hampir semua aksi agar shape state konsisten.
     */
    upsertLocal(entry = {}) {
      const order = normalizeOrder(entry);
      const idx = this.orders.findIndex((o) => o.orderNo === order.orderNo);
      if (idx !== -1) {
        const current = this.orders[idx];
        const next = { ...current, ...order };
        if (!order.testItems?.length && current.testItems?.length) {
          next.testItems = current.testItems;
        }
        if (!order.medias?.length && current.medias?.length) {
          next.medias = current.medias;
        }
        if (!order.orderUsers?.length && current.orderUsers?.length) {
          next.orderUsers = current.orderUsers;
        }
        if (!order.paymentInfo && current.paymentInfo) {
          next.paymentInfo = current.paymentInfo;
        }
        this.orders[idx] = next;
        return next;
      }
      this.orders.push(order);
      return order;
    },

    updateLocalOrder(orderNo, updates = {}) {
      const target = ensureString(orderNo);
      if (!target) return null;
      const existing = this.getByOrderNo(target) || { orderNo: target };
      const merged = { ...existing, ...updates, orderNo: target };
      return this.upsertLocal(merged);
    },

    async fetchAll() {
      this.loading = true;
      try {
        const query = new URLSearchParams();
        query.set('page', '1');
        query.set('per_page', '200');
      query.append('include', 'order_users.user');
      query.append('include', 'work_category');
      query.append('include', 'ordered_services.evaluation');
      query.append('include', 'ordered_services.service');
      query.append('include', 'medias');
        query.set('sort', 'created_at');
        const res = await api.get(`/api/v1/material-test-orders?${query.toString()}`);
        const payload = res.data?.data ?? {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        this.orders = items.map((item) => normalizeOrder(item));
        this.error = null;
        return { ok: true, data: this.orders };
      } catch (err) {
        console.warn('[OrderStore] fetchAll gagal', err);
        const status = err?.response?.status;
        this.error = 'Gagal memuat data order dari backend.';
        // Jangan hapus cache lama; kembalikan apa adanya agar halaman lain masih bisa pakai data lokal
        return { ok: false, data: this.orders, error: this.error, status };
      } finally {
        this.loading = false;
      }
    },

    async fetchById(orderNo) {
      const query = ensureString(orderNo);
      if (!query) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      try {
        const includes = new URLSearchParams();
      includes.append('include', 'order_users.user');
      includes.append('include', 'work_category');
      includes.append('include', 'ordered_services.evaluation');
      includes.append('include', 'ordered_services.service');
      includes.append('include', 'medias');
        const res = await api.get(
          `/api/v1/material-test-orders/${encodeURIComponent(query)}?${includes.toString()}`
        );
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
      const supportingFile = payload.supportingFile || null;

      try {
        const body = buildMaterialTestOrderPayload(payload);
        const res = await api.post('/api/v1/material-test-orders', body);
        const order = normalizeOrder(res.data?.data || {});
        if (order.orderNo) this.upsertLocal(order);
        recordOrderActivity(order, 'create');

        if (supportingFile && order.orderNo) {
          try {
            const formData = new FormData();
            formData.append('name', 'Dokumen Pendukung');
            formData.append('file', supportingFile);
            await api.post(
              `/api/v1/material-test-orders/${encodeURIComponent(order.orderNo)}/medias`,
              formData
            );
            const refreshed = await this.fetchById(order.orderNo);
            return { ok: true, data: refreshed.data || order };
          } catch (uploadErr) {
            console.warn('[OrderStore] gagal upload dokumen pendukung', uploadErr);
          }
        }

        if (order.orderNo) {
          try {
            const refreshed = await this.fetchById(order.orderNo);
            return { ok: true, data: refreshed.data || order };
          } catch {}
        }

        return { ok: true, data: order };
      } catch (err) {
        console.warn('[OrderStore] createOrder gagal', err);
        const status = err?.response?.status;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Gagal membuat order.';
        this.error = message;
        return {
          ok: false,
          error: message,
          status,
          details: err?.response?.data || null,
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update data order via PUT (full payload).
     */
    async updateOrder(orderNo, payload = {}) {
      const target = ensureString(orderNo);
      if (!target) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      const supportingFile = payload?.supportingFile || null;
      try {
        const updateBody = buildMaterialTestOrderUpdatePayload(payload);
        if (!Object.keys(updateBody).length) {
          return { ok: false, error: 'Payload update kosong.' };
        }

        const encoded = encodeURIComponent(target);
        const res = await api.put(`/api/v1/material-test-orders/${encoded}`, updateBody);
        const updated = normalizeOrder(res?.data?.data || {});
        if (updated.orderNo) this.upsertLocal(updated);
        recordOrderActivity(updated, 'update');

        if (supportingFile && updated.orderNo) {
          try {
            const formData = new FormData();
            formData.append(
              'name',
              payload.supportingFileName || 'Dokumen Pendukung'
            );
            formData.append('file', supportingFile);
            await api.post(
              `/api/v1/material-test-orders/${encodeURIComponent(updated.orderNo)}/medias`,
              formData
            );
            const refreshed = await this.fetchById(updated.orderNo);
            return { ok: true, data: refreshed.data || updated };
          } catch (uploadErr) {
            console.warn('[OrderStore] gagal upload dokumen pendukung', uploadErr);
          }
        }

        return { ok: true, data: updated };
      } catch (err) {
        console.warn('[OrderStore] updateOrder gagal', err);
        const status = err?.response?.status;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Gagal memperbarui order.';
        this.error = message;
        return { ok: false, error: message, status, details: err?.response?.data || null };
      } finally {
        this.loading = false;
      }
    },

    async _runStatusAction(orderNo, action, { formData } = {}) {
      const target = ensureString(orderNo);
      if (!target) return { ok: false, error: 'OrderNo kosong' };
      this.loading = true;
      try {
        const encoded = encodeURIComponent(target);
        const url = `/api/v1/material-test-orders/${encoded}/${action}`;
        const res = formData ? await api.patch(url, formData) : await api.patch(url);
        const updated = normalizeOrder(res?.data?.data || {});
        if (updated.orderNo) this.upsertLocal(updated);
        recordOrderActivity(updated, action);
        return { ok: true, data: updated };
      } catch (err) {
        const status = err?.response?.status;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Gagal memperbarui status order.';
        this.error = message;
        return { ok: false, error: message, status, details: err?.response?.data || null };
      } finally {
        this.loading = false;
      }
    },

    async approveOrder(orderNo) {
      return this._runStatusAction(orderNo, 'approve');
    },

    async rejectOrder(orderNo) {
      return this._runStatusAction(orderNo, 'reject');
    },

    async cancelOrder(orderNo) {
      return this._runStatusAction(orderNo, 'cancel');
    },

    async submitPayment(orderNo, { file } = {}) {
      if (!file) {
        return { ok: false, error: 'File bukti pembayaran wajib diunggah.' };
      }
      const formData = new FormData();
      formData.append('file', file);
      return this._runStatusAction(orderNo, 'submit-payment', { formData });
    },

    async approvePayment(orderNo) {
      return this._runStatusAction(orderNo, 'approve-payment');
    },

    async rejectPayment(orderNo) {
      return this._runStatusAction(orderNo, 'reject-payment');
    },

    async markTesting(orderNo) {
      return this._runStatusAction(orderNo, 'test');
    },

    async completeOrder(orderNo) {
      return this._runStatusAction(orderNo, 'complete');
    },

    async refundOrder(orderNo, { file } = {}) {
      if (!file) {
        return { ok: false, error: 'File refund wajib diunggah.' };
      }
      const formData = new FormData();
      formData.append('file', file);
      return this._runStatusAction(orderNo, 'refund', { formData });
    },

    async deleteOrder(orderNo) {
      const target = ensureString(orderNo);
      if (!target) return { ok: false, error: 'OrderNo kosong' };
      // BE tidak menyediakan DELETE order; gunakan cancel agar status berubah ke "cancelled".
      console.warn('[OrderStore] deleteOrder dialihkan ke cancelOrder.');
      return this.cancelOrder(target);
    },

  },
});
