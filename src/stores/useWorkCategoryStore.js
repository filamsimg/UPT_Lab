import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const normalizeCategory = (entry = {}) => ({
  id: entry.id || entry.work_category_id || entry.code || '',
  name: entry.name || entry.title || entry.category || '',
  description: entry.description || '',
});

export const useWorkCategoryStore = defineStore('workCategory', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      const page = params.page ?? 1;
      const perPage = params.perPage ?? 100;
      const search =
        typeof params.search === 'string' ? params.search.trim() : '';
      try {
        const query = new URLSearchParams();
        query.set('page', page);
        query.set('per_page', perPage);
        if (search) query.set('search', search);
        const res = await api.get(`/api/v1/material-test-work-categories?${query.toString()}`);
        const payload = res.data?.data ?? res.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeCategory(item))
          : [];
        this.categories = items;
        this.error = null;
        return { ok: true, data: items };
      } catch (err) {
        this.categories = [];
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          'Gagal memuat jenis pekerjaan.';
        return { ok: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
  },
});
