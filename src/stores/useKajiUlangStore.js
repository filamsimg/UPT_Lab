import { defineStore } from 'pinia';
import { BE_ORDER_STATUSES, normalizeOrderStatus } from '@/utils/orderStatus';

/**
 * Store untuk modul Kaji Ulang.
 * - Menampung hasil normalisasi permintaan/order menjadi data kaji ulang.
 * - Menjaga status order selaras dengan hasil review pembayaran jika ada.
 * - Tidak memanggil API: fokus di manipulasi state & data binding form kaji ulang.
 */

const BE_STATUSES = BE_ORDER_STATUSES;

// Rapatkan detail pembayaran agar form kaji ulang bisa menampilkan status terbaru
const normalizePaymentDetail = (detail = {}, orderNo = '') => {
  if (!detail) return null;
  const reviewStatus = detail.reviewStatus || '';
  const explicitStatus = normalizeOrderStatus(detail.status);
  const status = explicitStatus
    ? explicitStatus
    : reviewStatus === 'approved'
    ? 'payment_approved'
    : reviewStatus === 'rejected'
    ? 'payment_rejected'
    : 'payment_submitted';

  const mapFile = (item = {}, idx) => ({
    id: item.id || `${orderNo || 'order'}-payment-${idx + 1}`,
    name: item.name || `Lampiran-${idx + 1}`,
    size: item.size || 0,
    type: item.type || 'application/octet-stream',
    previewUrl: item.previewUrl || '',
  });

  const transferFiles = Array.isArray(detail.transferFiles)
    ? detail.transferFiles.filter(Boolean).map(mapFile)
    : [];

  return {
    status,
    reviewStatus,
    total: Number(detail.total) || 0,
    amountPaid: Number(detail.amountPaid) || 0,
    outstanding:
      detail.outstanding != null
        ? Number(detail.outstanding) || 0
        : Math.max(
            (Number(detail.total) || 0) - (Number(detail.amountPaid) || 0),
            0
          ),
    paymentDate: detail.paymentDate || detail.paidAt || '',
    paymentDeadline: detail.paymentDeadline || detail.dueDate || '',
    reviewedBy: detail.reviewedBy || '',
    reviewedAt: detail.reviewedAt || null,
    reviewNote: detail.reviewNote || '',
    transferFiles,
  };
};

// Pastikan status akhir mengikuti prioritas: awaiting_review > payment status > status BE apa adanya
const deriveOrderStatus = (paymentInfo, orderStatus) => {
  const normalized = normalizeOrderStatus(orderStatus);
  const paymentStatus = normalizeOrderStatus(paymentInfo?.status);
  if (normalized === 'awaiting_review') return normalized;
  if (paymentStatus) return paymentStatus;
  if (normalized && BE_STATUSES.includes(normalized)) return normalized;
  return 'awaiting_review';
};

const cloneReviewRows = (rows = []) =>
  rows.map((row) => ({
    topic: row.topic || '',
    result: row.result || '',
  }));

const buildTestNameSummary = (items = []) =>
  (items || [])
    .map((item) => item?.testName || item?.name || '')
    .map((name) => String(name).trim())
    .filter(Boolean)
    .join(', ');

const defaultReviewRows = () => [
  { topic: 'Peralatan', result: '' },
  { topic: 'Personel', result: '' },
  { topic: 'Waktu', result: '' },
  { topic: 'Kondisi', result: '' },
  { topic: 'Laboratorium Subkontrak', result: '' },
];

export const useKajiUlangStore = defineStore('kajiUlang', {
  state: () => ({
    orders: [],
  }),

  actions: {
    clear() {
      this.orders = [];
    },

    /**
     * Tambahkan/ubah data kaji ulang dari payload permintaan/order yang sudah dinormalisasi.
     * Menerima optional paymentDetail untuk override jika BE mengirim entitas pembayaran terpisah.
     */
    upsertFromRequest(request = {}, { paymentDetail = null } = {}) {
      if (!request) return null;
      const paymentInfo = normalizePaymentDetail(
        paymentDetail || request.paymentInfo,
        request.idOrder || request.orderNo || ''
      );

      const testItems = Array.isArray(request.testItems)
        ? request.testItems.map((item) => ({
            ...item,
          }))
        : [];

      const payload = {
        id: request.id || request.idOrder || request.orderNo || '',
        requestId: request.idOrder || request.id || '',
        orderNo: request.idOrder || request.orderNo || '',
        orderCode:
          request.orderCode ||
          request.orderDisplay ||
          request.order_code ||
          request.number ||
          '',
        orderNumber:
          request.orderNumber !== undefined && request.orderNumber !== null
            ? Number(request.orderNumber)
            : null,
        orderYear:
          request.orderYear ||
          (request.entryDate ? String(request.entryDate).slice(0, 4) : ''),
        sampleNo: request.sampleNo || '',
        date: request.entryDate || request.createdAt || '',
        status: deriveOrderStatus(paymentInfo, request.status),
        customerName: request.customerName || '',
        customerPhone: request.phoneNumber || request.customerPhone || '',
        customerAddress: request.address || request.customerAddress || '',
        testType: buildTestNameSummary(testItems),
        note: request.note || '',
        testItems,
        paymentInfo,
        kajiUlangRows: request.kajiUlangRows
          ? cloneReviewRows(request.kajiUlangRows)
          : defaultReviewRows(),
        kajiUlangNote: request.kajiUlangNote || '',
        kajiUlangSignatures: request.kajiUlangSignatures || {
          admin: '',
          customer: request.customerName || '',
        },
        kajiUlangValidatedAt: request.kajiUlangValidatedAt || null,
        kajiUlangValidatedBy: request.kajiUlangValidatedBy || null,
      };

      const idx = this.orders.findIndex(
        (order) =>
          order.requestId === payload.requestId ||
          order.orderNo === payload.orderNo
      );

      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], ...payload };
        return this.orders[idx];
      }

      this.orders.push(payload);
      return payload;
    },

    // Update data umum order kaji ulang (termasuk status & paymentInfo jika dikirim)
    updateOrder(id, updates = {}) {
      const idx = this.orders.findIndex(
        (order) => order.id === id || order.orderNo === id
      );
      if (idx === -1) return;
      const current = this.orders[idx];
      const paymentInfo = updates.paymentInfo
        ? normalizePaymentDetail(updates.paymentInfo, current.orderNo)
        : current.paymentInfo;

      this.orders[idx] = {
        ...current,
        ...updates,
        paymentInfo,
        status: deriveOrderStatus(paymentInfo, updates.status || current.status),
      };
    },

    // Simpan hasil kaji ulang (rows, catatan, tanda tangan, validator)
    updateReview(id, { rows, note, signatures, status, validator } = {}) {
      const idx = this.orders.findIndex(
        (order) => order.id === id || order.orderNo === id
      );
      if (idx === -1) return;
      const current = this.orders[idx];
      this.orders[idx] = {
        ...current,
        kajiUlangRows: rows ? cloneReviewRows(rows) : current.kajiUlangRows,
        kajiUlangNote: typeof note === 'string' ? note : current.kajiUlangNote,
        kajiUlangSignatures: signatures || current.kajiUlangSignatures,
        kajiUlangValidatedAt: validator
          ? new Date().toISOString()
          : current.kajiUlangValidatedAt,
        kajiUlangValidatedBy: validator || current.kajiUlangValidatedBy,
        status: status || current.status,
      };
    },

    // Tandai pembayaran disetujui/ditolak dan ikut memperbarui status order
    reviewPayment(orderId, { approved, reviewer, note } = {}) {
      const idx = this.orders.findIndex(
        (order) => order.id === orderId || order.orderNo === orderId
      );
      if (idx === -1) return null;
      const current = this.orders[idx];
      if (!current.paymentInfo) return current;
      const reviewStatus = approved ? 'approved' : 'rejected';
      const status = approved ? 'payment_approved' : 'payment_rejected';
      const paymentInfo = {
        ...current.paymentInfo,
        status,
        reviewStatus,
        reviewedBy: reviewer || '',
        reviewedAt: new Date().toISOString(),
        reviewNote:
          typeof note === 'string' ? note : current.paymentInfo.reviewNote || '',
      };
      this.orders[idx] = {
        ...current,
        status,
        paymentInfo,
      };
      return this.orders[idx];
    },

    removeOrder(id) {
      const key = String(id || '').trim();
      this.orders = this.orders.filter(
        (order) => order.id !== id && order.orderNo !== key
      );
    },
  },
});
