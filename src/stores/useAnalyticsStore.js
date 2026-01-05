import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const DEFAULT_GROUP = 'month';

const normalizeDateInput = (value) => {
  if (!value) return '';
  return String(value).trim().slice(0, 10);
};

const buildDateFilter = (dateFrom, dateTo) => {
  const from = normalizeDateInput(dateFrom);
  const to = normalizeDateInput(dateTo);
  if (!from && !to) return '';
  const start = from || to;
  const end = to || from;
  return `dateBETWEEN${start},${end}`;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTrend = (entry = {}) => ({
  period: entry?.period || '',
  count: toNumber(entry?.count),
  sum: toNumber(entry?.sum),
});

const resolveErrorMessage = (err, fallback) => {
  const status = err?.response?.status;
  const isNetworkError =
    err?.code === 'ERR_NETWORK' || (!err?.response && err?.request);
  if (status === 401 || status === 403) {
    return 'Anda tidak memiliki izin analytics.';
  }
  return (
    (isNetworkError
      ? 'Tidak dapat terhubung ke server analytics.'
      : err?.response?.data?.message) ||
    err?.message ||
    fallback
  );
};

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    summary: {},
    summaryFilter: '',
    summaryLoading: false,
    summaryError: '',
    summaryStatus: null,
    orderTrends: [],
    trendsParams: {
      group: DEFAULT_GROUP,
      filter: '',
    },
    trendsLoading: false,
    trendsError: '',
    trendsStatus: null,
  }),

  actions: {
    clear() {
      this.summary = {};
      this.summaryFilter = '';
      this.summaryLoading = false;
      this.summaryError = '';
      this.summaryStatus = null;
      this.orderTrends = [];
      this.trendsParams = { group: DEFAULT_GROUP, filter: '' };
      this.trendsLoading = false;
      this.trendsError = '';
      this.trendsStatus = null;
    },

    async fetchSummary({ dateFrom, dateTo, filter, force = false } = {}) {
      const nextFilter = filter || buildDateFilter(dateFrom, dateTo);
      if (
        !force &&
        this.summaryStatus === 200 &&
        this.summaryFilter === nextFilter
      ) {
        return { ok: true, data: this.summary, cached: true };
      }

      this.summaryLoading = true;
      this.summaryError = '';
      this.summaryStatus = null;
      try {
        const query = new URLSearchParams();
        if (nextFilter) query.set('filter', nextFilter);
        const res = await api.get(`/api/v1/analytics/summary?${query.toString()}`);
        this.summary = res.data?.data?.summary || {};
        this.summaryFilter = nextFilter;
        this.summaryStatus = res.status ?? res.data?.code ?? 200;
        return { ok: true, data: this.summary };
      } catch (err) {
        this.summaryError = resolveErrorMessage(
          err,
          'Gagal memuat ringkasan analytics.'
        );
        this.summaryStatus =
          err?.response?.status || err?.response?.data?.code || null;
        return { ok: false, error: this.summaryError, status: this.summaryStatus };
      } finally {
        this.summaryLoading = false;
      }
    },

    async fetchOrderTrends({
      dateFrom,
      dateTo,
      filter,
      group = DEFAULT_GROUP,
      force = false,
    } = {}) {
      const nextFilter = filter || buildDateFilter(dateFrom, dateTo);
      const normalizedGroup = group || DEFAULT_GROUP;
      if (
        !force &&
        this.trendsStatus === 200 &&
        this.trendsParams.filter === nextFilter &&
        this.trendsParams.group === normalizedGroup
      ) {
        return { ok: true, data: this.orderTrends, cached: true };
      }

      this.trendsLoading = true;
      this.trendsError = '';
      this.trendsStatus = null;
      try {
        const query = new URLSearchParams();
        if (nextFilter) query.set('filter', nextFilter);
        if (normalizedGroup) query.set('group', normalizedGroup);
        const res = await api.get(
          `/api/v1/analytics/orders/trends?${query.toString()}`
        );
        const rawTrends = res.data?.data?.order_trends;
        this.orderTrends = Array.isArray(rawTrends)
          ? rawTrends.map((entry) => normalizeTrend(entry))
          : [];
        this.trendsParams = {
          group: normalizedGroup,
          filter: nextFilter,
        };
        this.trendsStatus = res.status ?? res.data?.code ?? 200;
        return { ok: true, data: this.orderTrends };
      } catch (err) {
        this.trendsError = resolveErrorMessage(
          err,
          'Gagal memuat tren analytics.'
        );
        this.trendsStatus =
          err?.response?.status || err?.response?.data?.code || null;
        return { ok: false, error: this.trendsError, status: this.trendsStatus };
      } finally {
        this.trendsLoading = false;
      }
    },
  },
});
