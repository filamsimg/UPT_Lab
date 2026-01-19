# UPT Lab Dashboard

Dashboard berbasis Vue 3, Vite, dan Tailwind untuk mengelola operasional UPT Laboratorium Perindustrian Kabupaten Tegal. Aplikasi ini memusatkan permintaan pengujian, kaji ulang, data layanan, serta manajemen pengguna dalam satu antarmuka responsif.

## Fitur Utama

- Dashboard: ringkasan status order, tren order selesai, dan aktivitas terbaru.
- Permintaan pengujian: tambah/edit permintaan, pencarian/filter status, input pembayaran, pembatalan.
- Kaji ulang dan pengujian: review bukti bayar, validasi, update status (testing, selesai, refund, batal).
- Cetak order: cari ID order dan cetak dokumen Kaji Ulang, Formulir Pengujian, Permintaan Pengujian.
- Layanan dan tarif: kelola layanan uji, kategori, metode, mesin uji, harga.
- Keuangan dan laporan: ringkasan pendapatan/refund, tren keuangan, filter periode, export CSV.
- Manajemen pengguna: user, role, permission, kode undangan admin, profil, ganti password, verifikasi email.
- Aktivitas dan notifikasi: riwayat aktivitas dan pusat notifikasi.

## Dashboard

- KPI status order: menunggu kaji ulang, menunggu pembayaran, proses pengujian, selesai.
- Grafik tren order selesai: total pendapatan (Rp) dan jumlah order per periode.
- Filter tren: harian, bulanan, tahunan, dan rentang tanggal.
- Aktivitas terbaru: daftar event dengan aktor, aksi, subject, dan IP.

## Teknologi

| Layer     | Stack |
| --------- | ----- |
| Framework | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) |
| Styling   | [Tailwind CSS](https://tailwindcss.com/), Heroicons |
| State     | [Pinia](https://pinia.vuejs.org/) |
| Routing   | [Vue Router 4](https://router.vuejs.org/) |
| HTTP      | [Axios](https://axios-http.com/) |
| Charts    | [Chart.js](https://www.chartjs.org/) |
| Utilities | Custom composables (`src/composables`) |

## Konfigurasi

- `.env` untuk mode dev (`npm run dev`).
- `.env.docker` untuk build Docker (mode docker).
- Semua request frontend memakai prefix `/api` dan akan diproxy ke `VITE_API_URL` saat dev.



## Menjalankan Proyek

```bash
# 1. Pastikan Node.js LTS terpasang
node --version

# 2. Instal dependensi
npm install

# 3. Jalankan server dev (http://localhost:5174)
npm run dev

# 4. Build produksi
npm run build

# 5. Preview hasil build
npm run serve
```

## Docker (Production)

Pastikan `Dockerfile`, `nginx.conf`, dan `docker-compose.yaml` ada di root `Front-end/`.
Nginx mem-proxy `/api` ke `http://host.docker.internal:8080` agar tidak kena CORS. Ubah di `nginx.conf` bila backend berbeda.

### Makefile (disarankan)

```bash
# jalankan dari folder Front-end
make docker-fresh
```

`make docker-fresh` akan menjalankan `docker-down`, `docker-up-build`, lalu `docker-ps` (setara fresh rebuild tanpa hapus cache image).

### Perintah Makefile lain (opsional)

```bash
# jalankan dari folder Front-end
make docker-up
make docker-up-build
make docker-down
make docker-restart
make docker-logs
make docker-ps
```

### Docker Compose (opsional)

```bash
# jalankan dari folder Front-end
docker compose up -d --build
```

Hentikan sementara:

```bash
docker compose stop
```

Jalankan lagi:

```bash
docker compose start
```

Hapus container & network:

```bash
docker compose down
```

Akses: http://localhost:5174

Catatan:
- `VITE_API_URL` dibaca saat build (mode docker) dari `.env.docker`, jadi jika endpoint backend berubah harus rebuild image.
- `host.docker.internal` tersedia di Docker Desktop (Windows/Mac). Di Linux, ganti dengan IP host atau gunakan network yang sama dengan backend.

## Struktur Direktori Penting

```
src/
  assets/
  components/
    charts/OrderTrendsChart.vue
    common/DataTable.vue, Badge.vue, FileUpload.vue
    feedback/ConfirmDialog.vue, NotificationStack.vue
    form/FormPermintaan.vue, FormUser.vue, FormRole.vue
    layout/AppShell.vue
  composables/
  pages/
  router/
  services/
  stores/
  utils/
  App.vue
  main.js
```

## State Management (Pinia)

- `useAuthStore`: login/logout, token, dan current user.
- `useUserStore`, `useRoleStore`, `usePermissionStore`: master pengguna dan akses.
- `usePermintaanStore`, `useKajiUlangStore`, `useOrderStore`, `useTestStore`: alur permintaan dan pengujian.
- `useNotificationStore`, `useNotificationCenter`: notifikasi dan pusat notifikasi.
- `useAnalyticsStore`, `useActivityStore`: data dashboard dan log aktivitas.
- Store lain tersedia di `src/stores`.

## Confirm Dialog (Reusable Validation)

1. Provider dipasang di `components/layout/AppShell.vue` dan `components/feedback/ConfirmDialog.vue` dirender sekali di layout.
2. Consumer cukup memanggil:

```js
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const confirmDialog = useConfirmDialog();
const ok = await confirmDialog({
  title: 'Hapus data?',
  message: 'Tindakan ini tidak dapat dibatalkan.',
  variant: 'danger',
  confirmLabel: 'Hapus',
});
if (!ok) return;
// lanjutkan aksi
```

## Praktik Kode

- Gunakan alias `@` untuk impor dari `src/`.
- Simpan side effect di Pinia store; komponen fokus pada UI dan emit event.
- Manfaatkan utility Tailwind (warna primer di `tailwind.config.js`).

## Testing Manual

1. Login, reset password, dan verifikasi email.
2. Tambah permintaan dan lanjutkan ke pembayaran.
3. Kaji ulang permintaan dan buat surat perintah.
4. Cek log aktivitas dan notifikasi.
5. Uji CRUD pengguna/role/permission.

## Catatan

- Token pengguna disimpan di `localStorage` melalui `src/utils/storage`.
- Dev server mem-proxy `/api` ke `VITE_API_URL`.

## Kontribusi

1. Fork dan clone repo ini.
2. Buat branch fitur: `git checkout -b feat/nama-fitur`.
3. Lakukan perubahan, tambahkan uji manual bila relevan.
4. Push dan buka pull request berisi ringkasan perubahan dan screenshot jika UI berubah.

## Lisensi

Hak cipta tetap milik UPT Laboratorium Perindustrian Kabupaten Tegal. Gunakan contoh ini sebagai referensi internal atau proyek belajar sesuai kebutuhan Anda.
