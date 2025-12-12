import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const normalizeCustomer = (entry = {}) => {
  const address = entry.address || entry.customer_address || null;
  return {
    id: entry.id || entry.customer_id || '',
    name: entry.name || '',
    type: entry.type || '',
    phoneNumber: entry.phone_number || entry.phoneNumber || '',
    email: entry.email || '',
    addressId: entry.address_id || entry.addressId || '',
    addressFull:
      (address && (address.full_address || address.address)) ||
      entry.full_address ||
      '',
    address,
  };
};

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAll(params = {}) {
      const page = params.page ?? 1;
      const perPage = params.perPage ?? 100;
      const includeAddress =
        params.includeAddress !== undefined ? params.includeAddress : true;
      const search =
        typeof params.search === 'string' ? params.search.trim() : '';

      this.loading = true;
      try {
        const query = new URLSearchParams();
        query.set('page', page);
        query.set('per_page', perPage);
        if (includeAddress) query.append('include', 'address');
        if (search) query.set('search', search);
        const res = await api.get(`/api/v1/customers?${query.toString()}`);
        const payload = res.data?.data ?? res.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeCustomer(item))
          : [];
        this.customers = items;
        this.error = null;
        return { ok: true, data: items };
      } catch (err) {
        this.customers = [];
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          'Gagal memuat daftar pelanggan.';
        return { ok: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
  },
});
