// Store test/services: data pengujian untuk dropdown/list
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

function normalizeId(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : ''
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return ''
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
    ensureString(entry.method_name) ||
    ensureString(entry.methodName) ||
    ensureString(entry.test_method) ||
    ensureString(entry.method) ||
    method?.name ||
    ''
  const machineName =
    ensureString(entry.machine_name) || machine?.name || ensureString(entry.equipment)

  const rawName =
    ensureString(entry.test_name) ||
    ensureString(entry.testName) ||
    ensureString(entry.name) ||
    ensureString(entry.service_name) ||
    ensureString(entry.serviceName) ||
    ensureString(entry.testCategory) ||
    ensureString(entry.title)

  const name = rawName || ''

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
  const machineId = normalizeId(
    payload.machine_id ?? payload.machineId ?? payload.equipment
  )
  const methodId = normalizeId(payload.method_id ?? payload.methodId ?? payload.method)

  const body = {
    service_type:
      payload.service_type ||
      payload.serviceType ||
      payload.category ||
      payload.serviceCategory ||
      '',
    service_code: payload.service_code || payload.serviceCode || payload.code || '',
    unit: payload.unit || '',
    price: toNumber(payload.price, 0),
    test_name:
      payload.test_name ||
      payload.testName ||
      payload.name ||
      payload.service_name ||
      payload.serviceName ||
      '',
  }

  if (machineId) body.machine_id = machineId
  if (methodId) body.method_id = methodId

  return body
}

function resolveMachineEntity(payload = {}) {
  const data = payload?.data ?? payload ?? {}
  return (
    data.material_test_machine ||
    data.materialTestMachine ||
    data.machine ||
    payload.material_test_machine ||
    payload.materialTestMachine ||
    payload.machine ||
    data
  )
}

function resolveMethodEntity(payload = {}) {
  const data = payload?.data ?? payload ?? {}
  return (
    data.material_test_method ||
    data.materialTestMethod ||
    data.method ||
    payload.material_test_method ||
    payload.materialTestMethod ||
    payload.method ||
    data
  )
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

    async addMachine(name, description) {
      const MachineName = ensureString(typeof name === 'string' ? name.trim() : name)
      const MachineDescription = ensureString(
        typeof description === 'string' ? description.trim() : description
      )
      if (!MachineName) return
      try {
        const body = { name: MachineName }
        if (MachineDescription) body.description = MachineDescription
        const res = await api.post('/api/v1/material-test-machines', body)
        const entity = resolveMachineEntity(res.data ?? {})
        const created = normalizeMachine(entity || {})
        if (!created.id && entity?.id) created.id = entity.id
        if (!created.name) created.name = MachineName
        if (!created.description && MachineDescription) created.description = MachineDescription
        this.machines = this.machines.filter((m) => m && (m.id || m.name))
        this.machines.push(created)
        return { ok: true, data: created }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menambahkan mesin.'
        throw err
      }
    },

    async updateMachine(payload = {}) {
      const id = payload.id || payload.machine_id || payload.machineId
      if (!id) return { ok: false, error: 'ID mesin tidak ditemukan' }
      const MachineName = ensureString(payload.name || payload.machine_name || payload.machineName)
      if (!MachineName) return { ok: false, error: 'Nama mesin uji wajib diisi.' }
      const MachineDescription =
        typeof payload.description === 'string' ? payload.description.trim() : ''
      try {
        const body = { name: MachineName, description: MachineDescription }
        const res = await api.put(`/api/v1/material-test-machines/${id}`, body)
        const entity = resolveMachineEntity(res.data ?? {})
        const updated = normalizeMachine(entity || {})
        if (!updated.id) updated.id = id
        if (!updated.name) updated.name = MachineName
        if (!updated.description && MachineDescription) updated.description = MachineDescription
        const idx = this.machines.findIndex((m) => m.id === id)
        if (idx !== -1) this.machines[idx] = updated
        else this.machines.push(updated)
        this.machines = this.machines.filter((m) => m && (m.id || m.name))
        return { ok: true, data: updated }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal memperbarui mesin.'
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

    async addMethod(name, description) {
      const MethodName = ensureString(typeof name === 'string' ? name.trim() : name)
      const MethodDescription = ensureString(
        typeof description === 'string' ? description.trim() : description
      )
      if (!MethodName) return
      try {
        const body = { name: MethodName }
        if (MethodDescription) body.description = MethodDescription
        const res = await api.post('/api/v1/material-test-methods', body)
        const entity = resolveMethodEntity(res.data ?? {})
        const created = normalizeMethod(entity || {})
        if (!created.id && entity?.id) created.id = entity.id
        if (!created.name) created.name = MethodName
        if (!created.description && MethodDescription) created.description = MethodDescription
        this.methods = this.methods.filter((m) => m && (m.id || m.name))
        this.methods.push(created)
        return { ok: true, data: created }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal menambahkan metode.'
        throw err
      }
    },

    async updateMethod(payload = {}) {
      const id = payload.id || payload.method_id || payload.methodId
      if (!id) return { ok: false, error: 'ID metode tidak ditemukan' }
      const MethodName = ensureString(payload.name || payload.method_name || payload.methodName)
      if (!MethodName) return { ok: false, error: 'Nama metode uji wajib diisi.' }
      const MethodDescription =
        typeof payload.description === 'string' ? payload.description.trim() : ''
      try {
        const body = { name: MethodName, description: MethodDescription }
        const res = await api.put(`/api/v1/material-test-methods/${id}`, body)
        const entity = resolveMethodEntity(res.data ?? {})
        const updated = normalizeMethod(entity || {})
        if (!updated.id) updated.id = id
        if (!updated.name) updated.name = MethodName
        if (!updated.description && MethodDescription) updated.description = MethodDescription
        const idx = this.methods.findIndex((m) => m.id === id)
        if (idx !== -1) this.methods[idx] = updated
        else this.methods.push(updated)
        this.methods = this.methods.filter((m) => m && (m.id || m.name))
        return { ok: true, data: updated }
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Gagal memperbarui metode.'
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
