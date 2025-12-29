export const BE_ORDER_STATUSES = [
  'draft',
  'awaiting_review',
  'awaiting_payment',
  'payment_submitted',
  'payment_rejected',
  'payment_approved',
  'testing',
  'completed',
  'refunded',
  'cancelled',
  'rejected',
];

export const ORDER_STATUS_ALIASES = {
  awaiting_kaji_ulang: 'awaiting_review',
  ready_for_kaji_ulang: 'awaiting_review',
  pending_validation: 'awaiting_review',
  pending_payment: 'awaiting_payment',
  payment_pending_review: 'payment_submitted',
  payment_verified: 'payment_approved',
  payment_review_rejected: 'payment_rejected',
  in_testing: 'testing',
  approved: 'awaiting_payment',
  payment_received: 'payment_approved',
  done: 'completed',
  new: 'draft',
};

export const ORDER_STATUS_LABELS = {
  draft: 'Draft',
  awaiting_review: 'Menunggu Kaji Ulang',
  awaiting_payment: 'Menunggu Pembayaran',
  payment_submitted: 'Bukti Pembayaran Dikirim',
  payment_rejected: 'Bukti Pembayaran Ditolak',
  payment_approved: 'Pembayaran Disetujui',
  testing: 'Proses Pengujian',
  completed: 'Selesai',
  refunded: 'Refund',
  cancelled: 'Dibatalkan',
  rejected: 'Ditolak',
};

export const normalizeOrderStatus = (value) => {
  if (!value) return '';
  const key = String(value).trim().toLowerCase();
  if (!key) return '';
  return ORDER_STATUS_ALIASES[key] || key;
};

export const toOrderStatusLabel = (value) => {
  const normalized = normalizeOrderStatus(value);
  return ORDER_STATUS_LABELS[normalized] || normalized || '-';
};
