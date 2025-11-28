import { defineStore } from 'pinia'
import api from '@/services/apiServices'

const DEFAULT_PAGINATION = {
  currentPage: 1,
  perPage: 10,
  lastPage: 1,
  totalItems: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

function ensureString(value, fallback = '') {
  return typeof value === 'string' && value.trim().length ? value : fallback
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeMachine(entry = {}) {
  const id =
    ensureString(entry.id) ||
    ensureString(entry.machine_id) ||
    ensureString(entry.code) ||
    ''

  return {
    id,
    name:
      ensureString(entry.name) ||
      ensureString(entry.machineName) ||
      ensureString(entry.title) ||
      id,
    description: ensureString(entry.description),
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  }
}

function normalizeMethod(entry = {}) {
  const id =
    ensureString(entry.id) ||
    ensureString(entry.method_id) ||
    ensureString(entry.code) ||
    ''

  return {
    id,
    name:
      ensureString(entry.name) ||
      ensureString(entry.methodName) ||
      ensureString(entry.title) ||
      id,
    description: ensureString(entry.description),
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  }
}

function normalizeService(entry = {}) {
  const machine = entry.machine ? normalizeMachine(entry.machine) : null
  const method = entry.method ? normalizeMethod(entry.method) : null
  const id =
    ensureString(entry.id) ||
    ensureString(entry.service_id) ||
    ensureString(entry.ulid) ||
    ensureString(entry.uuid) ||
    ''
  const serviceType =
    ensureString(entry.service_type) ||
    ensureString(entry.serviceType) ||
    ensureString(entry.category)
  const code =
    ensureString(entry.service_code) ||
    ensureString(entry.serviceCode) ||
    ensureString(entry.code)
  const methodName =
    ensureString(entry.method_name) || method?.name || ensureString(entry.name)
  const machineName =
    ensureString(entry.machine_name) || machine?.name || ensureString(entry.equipment)

  const name =
    ensureString(entry.name) ||
    ensureString(entry.testCategory) ||
    methodName ||
    code ||
    'Layanan'

  const testCategory = ensureString(entry.test_category) || name
  const serviceLabel =
    serviceType?.toLowerCase() === 'testing'
      ? 'Pengujian'
      : serviceType?.toLowerCase() === 'machining'
      ? 'Machining'
      : serviceType || 'Layanan'

  return {
    id,
    serviceType,
    serviceCategory: serviceType,
    serviceCategoryLabel: serviceLabel,
    category: serviceType,
    code,
    serviceCode: code,
    name,
    testCategory,
    unit: ensureString(entry.unit),
    price: toNumber(entry.price, 0),
    methodId: ensureString(entry.method_id) || ensureString(entry.methodId) || method?.id || '',
    methodName,
    methodDescription: method?.description || ensureString(entry.method_description),
    method,
    machineId: ensureString(entry.machine_id) || ensureString(entry.machineId) || machine?.id || '',
    machineName,
    machineDescription: machine?.description || ensureString(entry.machine_description),
    equipment: machineName,
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  }
}

function resolvePagination(payload = {}, fallback = DEFAULT_PAGINATION) {
  return {
    currentPage: payload.current_page ?? payload.currentPage ?? fallback.currentPage ?? 1,
    perPage: payload.per_page ?? payload.perPage ?? fallback.perPage ?? 10,
    lastPage: payload.last_page ?? payload.lastPage ?? fallback.lastPage ?? 1,
    totalItems: payload.total_items ?? payload.total ?? fallback.totalItems ?? 0,
    hasNextPage: payload.has_next_page ?? payload.next_page !== null ?? fallback.hasNextPage ?? false,
    hasPrevPage: payload.has_prev_page ?? payload.prev_page !== null ?? fallback.hasPrevPage ?? false,
  }
}

function buildServicePayload(payload = {}) {
  return {
    service_type:
      payload.service_type ||
      payload.serviceType ||
      payload.category ||
      payload.serviceCategory ||
      '',
    service_code: payload.service_code || payload.serviceCode || payload.code || '',
    machine_id: payload.machine_id || payload.machineId || payload.equipment || '',
    method_id: payload.method_id || payload.methodId || payload.method || '',
    unit: payload.unit || '',
    price: toNumber(payload.price, 0),
    name: payload.name || payload.testCategory || '',
  }
}

export const useTestStore = defineStore('test', {
  state: () => ({
    tests: [],
    machines: [],
    methods: [],
    loading: false,
    machinesLoading: false,
    methodsLoading: false,
    saving: false,
    error: null,
    pagination: { ...DEFAULT_PAGINATION },
    search: '',
  }),

  getters: {
    getTestById: (state) => (id) => state.tests.find((t) => t.id === id),
  },

  actions: {
    async fetchTests(params = {}) {
      const skipLoading = Boolean(params.skipLoading)
      const page = params.page ?? this.pagination.currentPage ?? 1
      const perPage = params.perPage ?? this.pagination.perPage ?? 10
      const rawSearch = params.search ?? this.search ?? ''
      const searchTerm = typeof rawSearch === 'string' ? rawSearch.trim() : ''

      if (!skipLoading) this.loading = true
      const query = new URLSearchParams()
      query.set('page', Math.max(page, 1))
      query.set('per_page', perPage)
      query.append('include', 'machine')
      query.append('include', 'method')
      if (searchTerm) query.set('search', searchTerm)

      try {
        const endpoint = `/api/v1/material-test-services?${query.toString()}`
        const res = await api.get(endpoint)
        const payload = res.data?.data ?? res.data ?? {}
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeService(item))
          : []
        this.tests = items
        this.pagination = resolvePagination(payload, this.pagination)
        this.search = searchTerm
        this.error = null
        return { ok: true, data: items, pagination: this.pagination }
      } catch (err) {
        this.tests = []
        this.pagination = { ...DEFAULT_PAGINATION, perPage }
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          'Gagal memuat data layanan.'
        return { ok: false, error: this.error }
      } finally {
        if (!skipLoading) this.loading = false
      }
    },

    async fetchMachines(params = {}) {
      const skipLoading = Boolean(params.skipLoading)
      const page = params.page ?? 1
      const perPage = params.perPage ?? 100
      const searchTerm =
        typeof params.search === 'string' ? params.search.trim() : ''

      if (!skipLoading) this.machinesLoading = true
      const query = new URLSearchParams()
      query.set('page', Math.max(page, 1))
      query.set('per_page', perPage)
      if (searchTerm) query.set('search', searchTerm)

      try {
        const endpoint = `/api/v1/material-test-machines?${query.toString()}`
        const res = await api.get(endpoint)
        const payload = res.data?.data ?? res.data ?? {}
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeMachine(item))
          : []
        this.machines = items
        return { ok: true, data: items }
      } catch (err) {
        this.machines = []
        return { ok: false, error: err?.response?.data?.message || err?.message || 'Gagal memuat mesin' }
      } finally {
        if (!skipLoading) this.machinesLoading = false
      }
    },

    async fetchMethods(params = {}) {
      const skipLoading = Boolean(params.skipLoading)
      const page = params.page ?? 1
      const perPage = params.perPage ?? 100
      const searchTerm =
        typeof params.search === 'string' ? params.search.trim() : ''

      if (!skipLoading) this.methodsLoading = true
      const query = new URLSearchParams()
      query.set('page', Math.max(page, 1))
      query.set('per_page', perPage)
      if (searchTerm) query.set('search', searchTerm)

      try {
        const endpoint = `/api/v1/material-test-methods?${query.toString()}`
        const res = await api.get(endpoint)
        const payload = res.data?.data ?? res.data ?? {}
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeMethod(item))
          : []
        this.methods = items
        return { ok: true, data: items }
      } catch (err) {
        this.methods = []
        return { ok: false, error: err?.response?.data?.message || err?.message || 'Gagal memuat metode' }
      } finally {
        if (!skipLoading) this.methodsLoading = false
      }
    },

    async fetchAll(params = {}) {
      this.loading = true
      try {
        const [serviceRes] = await Promise.all([
          this.fetchTests({ ...params, skipLoading: true }),
          this.fetchMachines({ skipLoading: true, perPage: 200 }),
          this.fetchMethods({ skipLoading: true, perPage: 200 }),
        ])
        return serviceRes
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      return this.fetchTests()
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return
      await this.fetchTests({ page })
    },

    setSearch(value) {
      this.search = value
    },

    async addTest(payload) {
      this.saving = true
      const body = buildServicePayload(payload)
      try {
        const res = await api.post('/api/v1/material-test-services', body)
        const apiData = res.data?.data ?? res.data ?? {}
        const created = normalizeService(
          apiData.material_test_service ?? apiData.service ?? apiData
        )
        this.tests = [created, ...this.tests.filter((t) => t.id !== created.id)]
        await this.fetchTests({ page: this.pagination.currentPage })
        return { ok: true, data: created }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menambahkan layanan.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async updateTest(payload) {
      const id = payload.id || payload.service_id || payload.serviceId
      if (!id) return { ok: false, error: 'ID layanan tidak ditemukan' }
      this.saving = true
      const body = buildServicePayload(payload)
      try {
        const res = await api.put(`/api/v1/material-test-services/${id}`, body)
        const apiData = res.data?.data ?? res.data ?? {}
        const updated = normalizeService(
          apiData.material_test_service ?? apiData.service ?? apiData
        )
        const idx = this.tests.findIndex((t) => t.id === id)
        if (idx !== -1) this.tests[idx] = updated
        await this.fetchTests({ page: this.pagination.currentPage })
        return { ok: true, data: updated }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal memperbarui layanan.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async removeTest(id) {
      if (!id) return { ok: false, error: 'ID layanan tidak ditemukan' }
      this.saving = true
      try {
        await api.delete(`/api/v1/material-test-services/${id}`)
        this.tests = this.tests.filter((t) => t.id !== id)
        await this.fetchTests({ page: this.pagination.currentPage })
        return { ok: true }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menghapus layanan.'
        throw err
      } finally {
        this.saving = false
      }
    },

    async addMachine(name) {
      const MachineName = ensureString(name)
      if (!MachineName) return
      try {
        const res = await api.post('/api/v1/material-test-machines', { name: MachineName })
        const created = normalizeMachine(res.data?.data ?? res.data ?? { name: MachineName })
        this.machines.push(created)
        return { ok: true, data: created }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menambahkan mesin.'
        throw err
      }
    },

    async removeMachine(indexOrId) {
      const candidate =
        typeof indexOrId === 'number'
          ? this.machines[indexOrId]
          : this.machines.find((m) => m.id === indexOrId)
      const id = candidate?.id || indexOrId
      if (!id) return { ok: false, error: 'ID mesin tidak ditemukan' }
      try {
        await api.delete(`/api/v1/material-test-machines/${id}`)
        this.machines = this.machines.filter((m) => m.id !== id)
        return { ok: true }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menghapus mesin.'
        throw err
      }
    },

    async addMethod(name) {
      const MethodName = ensureString(name)
      if (!MethodName) return
      try {
        const res = await api.post('/api/v1/material-test-methods', { name: MethodName })
        const created = normalizeMethod(res.data?.data ?? res.data ?? { name: MethodName })
        this.methods.push(created)
        return { ok: true, data: created }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menambahkan metode.'
        throw err
      }
    },

    async removeMethod(indexOrId) {
      const candidate =
        typeof indexOrId === 'number'
          ? this.methods[indexOrId]
          : this.methods.find((m) => m.id === indexOrId)
      const id = candidate?.id || indexOrId
      if (!id) return { ok: false, error: 'ID metode tidak ditemukan' }
      try {
        await api.delete(`/api/v1/material-test-methods/${id}`)
        this.methods = this.methods.filter((m) => m.id !== id)
        return { ok: true }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menghapus metode.'
        throw err
      }
    },
  },
})
