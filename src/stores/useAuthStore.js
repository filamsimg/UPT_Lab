// src/stores/useAuthStore.js
import { defineStore } from 'pinia'
import api from '@/services/apiServices'
import { useActivityStore } from '@/stores/useActivityStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const isString = (value) => typeof value === 'string'

const normalizeString = (value) =>
  isString(value) ? value.trim() : value

const appendIfPresent = (formData, key, value, { trim = true } = {}) => {
  if (value === undefined || value === null) {
    return
  }

  const payload = trim && isString(value) ? value.trim() : value
  if (payload === '' || payload === undefined || payload === null) {
    return
  }

  formData.append(key, payload)
}

const DEFAULT_PROFILE_INCLUDES = ['roles', 'roles.permissions']

const buildProfileUrl = (includeList) => {
  const includes =
    Array.isArray(includeList) && includeList.length
      ? includeList.filter(Boolean)
      : DEFAULT_PROFILE_INCLUDES
  if (!includes.length) return '/api/v1/users/me'
  const query = includes
    .map((item) => `include=${encodeURIComponent(item)}`)
    .join('&')
  return `/api/v1/users/me?${query}`
}

const normalizeRoleIds = (input) => {
  if (!input) return []
  if (Array.isArray(input)) return input
  return [input]
}

const buildProfileFormData = (payload = {}) => {
  const formData = new FormData()

  appendIfPresent(formData, 'name', normalizeString(payload.name))
  appendIfPresent(formData, 'email', normalizeString(payload.email))

  const phone = payload.phone_number ?? payload.phoneNumber ?? payload.phone
  appendIfPresent(formData, 'phone_number', normalizeString(phone))

  const nip =
    payload.employment_identity_number ??
    payload.employmentIdentityNumber ??
    payload.nip
  appendIfPresent(formData, 'employment_identity_number', normalizeString(nip))

  const avatar = payload.avatar ?? payload.avatarFile ?? null
  if (avatar) {
    formData.append('avatar', avatar)
  }

  const roleIdsSource =
    payload.role_ids ??
    payload.roles ??
    (payload.roleId !== undefined ? payload.roleId : undefined)
  normalizeRoleIds(roleIdsSource)
    .map((role) => (typeof role === 'object' ? role.id : role))
    .filter(Boolean)
    .forEach((roleId) => formData.append('role_id', roleId))

  if (payload.is_active !== undefined || payload.isActive !== undefined) {
    const isActive = payload.is_active ?? payload.isActive
    formData.append('is_active', isActive ? 'true' : 'false')
  }

  return formData
}

const buildPasswordFormData = (payload = {}) => {
  const formData = new FormData()
  const currentPassword =
    payload.current_password ?? payload.currentPassword ?? payload.oldPassword
  const newPassword = payload.password ?? payload.newPassword
  const confirmation =
    payload.password_confirmation ??
    payload.passwordConfirmation ??
    payload.passwordConfirm ??
    newPassword

  appendIfPresent(formData, 'current_password', currentPassword, { trim: false })
  appendIfPresent(formData, 'password', newPassword, { trim: false })
  appendIfPresent(formData, 'password_confirmation', confirmation, {
    trim: false,
  })

  return formData
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    authToken: null, // in-memory token (fallback jika backend belum set cookie sesi)
    loading: false,
    initTried: false,
  }),

  actions: {
    sanitizeUser(raw = null) {
      if (!raw || typeof raw !== 'object') return raw
      // Buang field sensitif bila backend masih mengirim
      // eslint-disable-next-line no-unused-vars
      const { password, password_hash, passwordHash, ...rest } = raw
      return rest
    },

    setAuthToken(token) {
      this.authToken = token || null
      if (this.authToken) {
        api.defaults.headers.common.Authorization = `Bearer ${this.authToken}`
      } else {
        delete api.defaults.headers.common.Authorization
      }
    },

    async register(payload = {}) {
      try {
        this.loading = true
        const name = normalizeString(payload.name)
        const email = normalizeString(payload.email)
        const phone = normalizeString(
          payload.phone_number ?? payload.phoneNumber ?? payload.phone
        )
        const password = payload.password
        const passwordConfirmation =
          payload.password_confirmation ??
          payload.passwordConfirmation ??
          payload.passwordConfirm ??
          payload.password
        const invitationCode = normalizeString(
          payload.invitation_code ?? payload.invitationCode ?? payload.code
        )
        const employmentId = normalizeString(
          payload.employment_identity_number ??
            payload.employmentIdentityNumber ??
            payload.employmentId
        )

        const formData = new FormData()
        appendIfPresent(formData, 'name', name)
        appendIfPresent(formData, 'email', email)
        appendIfPresent(formData, 'phone_number', phone)
        appendIfPresent(formData, 'password', password, { trim: false })
        appendIfPresent(formData, 'password_confirmation', passwordConfirmation, {
          trim: false,
        })
        appendIfPresent(formData, 'invitation_code', invitationCode)
        appendIfPresent(formData, 'employment_identity_number', employmentId)

        const res = await api.post('/api/v1/users/register', formData, {
          skipAuthRedirect: true,
        })
        const result = res.data?.data ?? res.data
        return { ok: true, data: result, message: res.data?.message }
      } catch (err) {
        const isNetworkError =
          err.code === 'ERR_NETWORK' || (!err.response && err.request)
        const msg =
          (isNetworkError
            ? 'Tidak dapat terhubung ke server. Periksa koneksi atau jalankan API backend.'
            : err.response?.data?.message) ||
          err.message ||
          'Registrasi gagal. Periksa data Anda dan coba lagi.'
        const errors = err.response?.data?.errors || null
        const status =
          err.response?.status ||
          err.response?.data?.code ||
          (isNetworkError ? 'NETWORK_ERROR' : null)
        return { ok: false, message: msg, errors, status, network: isNetworkError }
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      try {
        this.loading = true
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))
        appendIfPresent(formData, 'password', password, { trim: false })

        const res = await api.post('/api/v1/users/login', formData)

        const { user, token } = res.data.data

        this.setAuthToken(token)
        this.currentUser = this.sanitizeUser(user)

        let hydratedUser = this.currentUser
        try {
          const refreshed = await this.fetchProfile({ force: true })
          if (refreshed) hydratedUser = refreshed
        } catch (refreshErr) {
          console.warn('[AuthStore] gagal memuat profil setelah login', refreshErr)
        }

        const activityStore = useActivityStore()
        const notificationStore = useNotificationStore()
        activityStore.setActiveUser(hydratedUser?.id ?? null)
        notificationStore.setActiveUser(hydratedUser?.id ?? null)
        activityStore.addEvent({
          type: 'login',
          title: 'Login berhasil',
          description: `${hydratedUser?.name || 'Pengguna'} berhasil masuk ke sistem`,
          status: 'success',
          metadata: { email },
        })

        return { ok: true, user: hydratedUser, message: res.data?.message }
      } catch (err) {
        const isNetworkError = err.code === 'ERR_NETWORK' || (!err.response && err.request)
        const msg =
          (isNetworkError
            ? 'Tidak dapat terhubung ke server. Periksa koneksi atau jalankan API backend.'
            : err.response?.data?.message) ||
          err.message ||
          'Login gagal. Periksa email atau password.'
        const errors = err.response?.data?.errors || null
        const status =
          err.response?.status ||
          err.response?.data?.code ||
          (isNetworkError ? 'NETWORK_ERROR' : null)
        return { ok: false, message: msg, errors, status, network: isNetworkError }
      } finally {
        this.loading = false
      }
    },

    async requestPasswordReset({ email }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))

        const res = await api.post(
          '/api/v1/codes/user-reset-password',
          formData,
          { skipAuthRedirect: true }
        )
        const payload = res.data ?? {}
        const apiStatus = typeof payload.status === 'string' ? payload.status.toLowerCase() : ''
        const message =
          payload.message ||
          'Kode reset password berhasil dikirim ke email Anda.'
        const statusCode = res.status ?? payload.code ?? null
        const lowerMsg = typeof message === 'string' ? message.toLowerCase() : ''

        if (apiStatus && apiStatus !== 'success') {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound:
              apiStatus === 'error' &&
              (lowerMsg.includes('tidak ditemukan') ||
                lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar')),
          }
        }

        if (lowerMsg.includes('tidak ditemukan') || lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar')) {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound: true,
          }
        }

        return { ok: true, message, status: statusCode ?? 200 }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal mengirim kode reset password. Periksa email Anda.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        const lowerMsg = typeof msg === 'string' ? msg.toLowerCase() : ''
        return {
          ok: false,
          message: msg,
          errors,
          status,
          notFound:
            status === 404 ||
            lowerMsg.includes('tidak ditemukan') ||
            lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar'),
        }
      }
    },

    async requestEmailVerificationCode({ email }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))

        const res = await api.post(
          '/api/v1/codes/user-email-verification',
          formData,
          { skipAuthRedirect: true }
        )
        const payload = res.data ?? {}
        const apiStatus = typeof payload.status === 'string' ? payload.status.toLowerCase() : ''
        const message =
          payload.message || 'Kode verifikasi email berhasil dikirim.'
        const statusCode = res.status ?? payload.code ?? null
        const lowerMsg = typeof message === 'string' ? message.toLowerCase() : ''

        if (apiStatus && apiStatus !== 'success') {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound:
              apiStatus === 'error' &&
              (lowerMsg.includes('tidak ditemukan') ||
                lowerMsg.includes('tidak terdaftar') ||
                lowerMsg.includes('belum terdaftar')),
          }
        }

        if (
          lowerMsg.includes('tidak ditemukan') ||
          lowerMsg.includes('tidak terdaftar') ||
          lowerMsg.includes('belum terdaftar')
        ) {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound: true,
          }
        }

        return { ok: true, message, status: statusCode ?? 200 }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal mengirim kode verifikasi email. Periksa email Anda.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        const lowerMsg = typeof msg === 'string' ? msg.toLowerCase() : ''
        return {
          ok: false,
          message: msg,
          errors,
          status,
          notFound:
            status === 404 ||
            lowerMsg.includes('tidak ditemukan') ||
            lowerMsg.includes('tidak terdaftar') ||
            lowerMsg.includes('belum terdaftar'),
        }
      }
    },

    async verifyEmail({ email, code }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))
        appendIfPresent(formData, 'code', normalizeString(code))

        const res = await api.post('/api/v1/users/verify-email', formData, {
          skipAuthRedirect: true,
        })
        const payload = res.data ?? {}
        const message =
          payload.message || 'Email berhasil diverifikasi.'
        const data = payload.data ?? null
        return { ok: true, message, data, status: res.status ?? payload.code }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Verifikasi email gagal. Periksa kode yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        const lowerMsg = typeof msg === 'string' ? msg.toLowerCase() : ''
        return {
          ok: false,
          message: msg,
          errors,
          status,
          invalidCode:
            status === 400 ||
            lowerMsg.includes('kode salah') ||
            lowerMsg.includes('kode tidak valid'),
          notFound:
            status === 404 ||
            lowerMsg.includes('tidak ditemukan') ||
            lowerMsg.includes('tidak terdaftar') ||
            lowerMsg.includes('belum terdaftar'),
        }
      }
    },

    async resetPassword({
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))
        appendIfPresent(formData, 'code', normalizeString(code))
        appendIfPresent(formData, 'password', password, { trim: false })
        appendIfPresent(formData, 'password_confirmation', passwordConfirmation, {
          trim: false,
        })

        const res = await api.patch('/api/v1/users/reset-password', formData)
        const message =
          res.data?.message || 'Password berhasil direset. Silakan masuk.'
        return { ok: true, message, data: res.data?.data }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Reset password gagal. Periksa kembali data yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return {
          ok: false,
          message: msg,
          errors,
          status,
          notFound: status === 404 || (typeof msg === 'string' && (msg.toLowerCase().includes('tidak ditemukan') || msg.toLowerCase().includes('tidak terdaftar'))),
        }
      }
    },

    async fetchProfile({ force = false, include, skipAuthRedirect = false } = {}) {
      if (!force && this.currentUser) {
        return this.currentUser
      }

      try {
        this.loading = true
        const url = buildProfileUrl(include)
        const res = await api.get(url, { skipAuthRedirect })
        const payload = res.data?.data ?? res.data
        const user = payload?.user ?? payload
        this.currentUser = this.sanitizeUser(user)
        const activityStore = useActivityStore()
        const notificationStore = useNotificationStore()
        activityStore.setActiveUser(user?.id ?? null)
        notificationStore.setActiveUser(user?.id ?? null)
        return user
      } catch (err) {
        this.currentUser = null
        const activityStore = useActivityStore()
        const notificationStore = useNotificationStore()
        activityStore.setActiveUser(null)
        notificationStore.setActiveUser(null)
        throw err
      } finally {
        this.loading = false
        this.initTried = true
      }
    },

    async updateProfile(payload = {}) {
      if (!this.currentUser?.id) {
        return {
          ok: false,
          message: 'Pengguna belum login. Silakan masuk ulang.',
        }
      }

      try {
        this.loading = true
        const body = buildProfileFormData(payload)
        const res = await api.put('/api/v1/users/me', body)
        const responsePayload = res.data?.data ?? res.data
        const updatedUser = responsePayload?.user ?? responsePayload
        this.currentUser = this.sanitizeUser(updatedUser)

        let latestUser = updatedUser
        try {
          const refreshed = await this.fetchProfile({ force: true })
          if (refreshed) latestUser = refreshed
        } catch (refreshErr) {
          console.warn('[AuthStore] gagal memuat profil setelah pembaruan', refreshErr)
        }

        const activityStore = useActivityStore()
        const notificationStore = useNotificationStore()
        activityStore.setActiveUser(latestUser?.id ?? null)
        notificationStore.setActiveUser(latestUser?.id ?? null)
        activityStore.addEvent({
          type: 'login',
          title: 'Profil diperbarui',
          description: `${latestUser?.name || 'Pengguna'} memperbarui profil`,
          status: 'success',
        })
        return {
          ok: true,
          user: latestUser,
          message: res.data?.message || 'Profil berhasil diperbarui.',
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal memperbarui profil. Periksa kembali data yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return {
          ok: false,
          message: msg,
          errors,
          status,
        }
      } finally {
        this.loading = false
      }
    },

    async updatePassword(payload = {}) {
      if (!this.currentUser?.id) {
        return {
          ok: false,
          message: 'Pengguna belum login. Silakan masuk ulang.',
        }
      }

      try {
        this.loading = true
        const body = buildPasswordFormData(payload)
        const res = await api.patch('/api/v1/users/me/password', body)
        const activityStore = useActivityStore()
        activityStore.addEvent({
          type: 'login',
          title: 'Password diperbarui',
          description: `${this.currentUser?.name || 'Pengguna'} mengganti password`,
          status: 'success',
        })
        return {
          ok: true,
          message: res.data?.message || 'Password berhasil diperbarui.',
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal memperbarui password. Periksa kembali data yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return {
          ok: false,
          message: msg,
          errors,
          status,
        }
      } finally {
        this.loading = false
      }
    },

    async init({ skipIfNoSession = true } = {}) {
      if (this.initTried) return
      // Jika tidak ada token in-memory dan mode skip aktif, lewati fetch profil
      if (skipIfNoSession && !this.authToken) {
        this.initTried = true
        return
      }
      try {
        await this.fetchProfile({ force: true, skipAuthRedirect: true })
      } catch (err) {
        if (!skipIfNoSession) {
          console.warn('Sesi tidak valid atau belum login', err)
        }
        const activityStore = useActivityStore()
        const notificationStore = useNotificationStore()
        activityStore.setActiveUser(null)
        notificationStore.setActiveUser(null)
      } finally {
        this.initTried = true
      }
    },

    async logout() {
      const lastUser = this.currentUser
      const activityStore = useActivityStore()
      const notificationStore = useNotificationStore()
      try {
        await api.delete('/api/v1/users/logout')
      } catch {}
      this.currentUser = null
      this.setAuthToken(null)

      if (lastUser) {
        activityStore.setActiveUser(lastUser.id ?? null)
        activityStore.addEvent({
          type: 'login',
          title: 'Logout',
          description: `${lastUser.name || 'Pengguna'} keluar dari sistem`,
          status: 'info',
          metadata: { email: lastUser.email },
        })
      }
      activityStore.setActiveUser(null)
      notificationStore.setActiveUser(null)
    },
  },
})
