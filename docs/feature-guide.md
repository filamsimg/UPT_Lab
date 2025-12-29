# Feature guide: Landing page, authentication, manajemen pengguna

Panduan ringkas agar pengembang baru cepat memahami alur tiga fitur publik/awal: landing page, autentikasi, dan manajemen pengguna internal.

## Landing page (public)
- Lokasi: `src/pages/LandingPage.vue`.
- Peran: halaman publik dengan hero, layanan, profil, akreditasi, kontak, galeri, dan CTA login/registrasi.
- Cek status order:
  - Input ID order lalu memanggil `usePermintaanStore.checkOrderStatus`.
  - Hasil normalisasi berasal dari `normalizeOrderToRequest` (`src/stores/usePermintaanStore.js`).
  - Progress bar memakai `baseSteps` dan status map (`terminalStatuses`, `specialStatusMap`) untuk menandai gagal/batal/refund.
  - Format label status mengambil `requestStatusLabels`.
- Animasi reveal: attribute `data-reveal` diobservasi `IntersectionObserver`; di-`watch` ulang ketika hasil pencarian berubah.
- CTA navigasi: scroll ke section via `scrollToSection`, `RouterLink` ke `/login` dan `/register`.

## Autentikasi
- Store utama: `src/stores/useAuthStore.js`.
  - Menyimpan token di localStorage (`uptlab.authToken`) + header Authorization.
  - Persist currentUser di localStorage (`currentUser`), sanitasi field sensitif.
  - Endpoint utama:
    - `POST /api/v1/users/login` → simpan token + `currentUser`, lalu refresh profil `GET /api/v1/users/me?include=roles,roles.permissions`.
    - `POST /api/v1/users/register` untuk daftar (opsional `invitation_code`).
    - `DELETE /api/v1/users/logout` untuk keluar (best-effort).
    - Reset/verify email: `POST /api/v1/codes/user-reset-password`, `POST /api/v1/codes/user-email-verification`, `POST /api/v1/users/verify-email`, `PATCH /api/v1/users/reset-password`.
    - Update profil/password: `PUT /api/v1/users/me`, `PATCH /api/v1/users/me/password`.
  - Permission helper:
    - `collectPermissions` dari role → dipakai oleh `hasPermission` dan `hasAny`.
    - `useAuthorization` composable memakai helper ini untuk guard UI (lihat UsersPage).
- Routing halaman terkait:
  - `src/pages/AuthPage.vue` (login/register), `ResetPasswordPage.vue`, `EmailVerificationPage.vue`, `KodeUndanganPage.vue` (undangan), `ProfilePage.vue` untuk update profil/password.
  - Pastikan `useAuthStore.init()` dipanggil pada bootstrap (lihat `main.js`/router guard) agar `currentUser` diisi sebelum guard dijalankan.

## Manajemen pengguna (dashboard)
- Halaman: `src/pages/UsersPage.vue`.
- Store: `useUserStore` (`src/stores/useUserStore.js`) + `useRoleStore` untuk opsi role.
- Izin:
  - `hasPermission('users.index')` untuk akses halaman.
  - `users.store` (tambah), `users.update` (edit/toggle aktif), `users.destroy` (hapus).
- Data flow:
  - `onMounted` → fetch role (perPage 100) + fetch users (perPage mengikuti pagination).
  - Pencarian/filters:
    - Search dan filter role/status di-`watch`; memanggil `userStore.fetchUsers` dengan query backend atau filter client-side bila BE belum dukung filter.
    - Pagination: `changePage`, `changePerPage` memanggil `fetchUsers` dengan parameter terbaru.
  - CRUD:
    - Create/update memakai `FormUser` (modal). Body disusun `buildUserFormData` (FormData dengan `role_id`, avatar, is_active).
    - Delete: konfirmasi via `useConfirmDialog`, lalu `userStore.removeUser`.
    - Toggle aktif/nonaktif: `userStore.toggleActivation` (PATCH `/api/v1/users/:id/activation/toggle`); jika gagal, data di-refresh ulang.
  - Notifikasi: `useNotificationCenter.notify` untuk success/error toast; `useConfirmDialog` untuk konfirmasi hapus.
- Normalisasi user:
  - `normalizeUser` merapikan roles, permissions, flag aktif, timestamp (`createdAt`, `updatedAt`, `activatedAt`, `deactivatedAt`, `lastLoginAt`) dan menyatukan nama-nama field (snake/camel).
  - Pagination state: `pagination{ currentPage, perPage, lastPage, totalItems, hasNextPage, hasPrevPage }`; filters tersimpan di store agar sinkron dengan UI.

## Quick start mengubah/menambah fitur
- Tambah section baru di landing: cukup sisipkan di `LandingPage.vue`, tambahkan `data-reveal` jika ingin ikut animasi.
- Integrasi login lain (mis. OAuth): implementasi di `useAuthStore.login`, pastikan `setAuthToken` dan `fetchProfile` tetap dipanggil.
- Menambah field pengguna:
  - Perluas `FormUser` untuk inputnya.
  - Tambahkan mapping di `buildUserFormData` dan `normalizeUser`.
  - Sesuaikan kolom `columns`/slot di `UsersPage.vue` bila field ingin ditampilkan.
- Menambah permission baru: pastikan backend mengirim permission di include `roles.permissions`; UI bisa dicek dengan `hasPermission('<perm>')`.
