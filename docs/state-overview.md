# Pemetaan store dan alur (Permintaan, Order, Kaji Ulang)

Dokumen ini merangkum tanggung jawab tiap store dan bentuk data yang dikonsumsi komponen. Gunakan sebagai pegangan ketika menambah field, status baru, atau menghubungkan ke endpoint backend.

## Status yang dipakai bersama
- draft, awaiting_review, awaiting_payment, payment_submitted, payment_rejected, payment_approved, testing, completed, rejected, cancelled, refunded
- Label tampilan tersimpan di `requestStatusLabels` (public) dan `statusLabels` (internal).

## usePermintaanStore (`src/stores/usePermintaanStore.js`)
- Peran: cek status permintaan berbasis `idOrder` untuk halaman publik tracking.
- API: `GET /api/v1/material-test-orders/:id?include=work_category,ordered_services.evaluation,medias`.
- Normalisasi: `normalizeOrderToRequest` meratakan snake_case/camelCase dan mengekstrak `material_test_order` jika bersarang.
- Shape data yang dikembalikan: `{ idOrder, entryDate, customerName, phoneNumber, email, address, jobCategory, workPackage, purpose, testItems[{ testId, testName, objectName, quantity, price, testCode, unit }], status, createdAt, updatedAt, paymentInfo }`.
- Error handling: tidak melempar error; UI membaca `{ ok, data|error, status }`.

## useOrderStore (`src/stores/useOrderStore.js`)
- Peran: sumber utama Material Test Order di dashboard (create, fetch, cache, update status).
- Normalisasi:
  - `normalizeOrder` meratakan payload BE (atau `material_test_order` bersarang) ke shape tunggal agar tabel/form tidak perlu banyak kondisi.
  - `normalizePaymentInfo` memastikan status pembayaran konsisten (`payment_submitted|payment_approved|payment_rejected`) meski BE mengirim `reviewStatus`.
  - `normalizeTestItem` dan `normalizeTransferFiles` menjaga harga/kuantitas menjadi number dan memberi fallback nama.
- Shape order di state: `{ id, orderNo, orderNumber, orderCode/orderDisplay, orderYear, entryDate, status, statusLabel, customerId, customerName, customerPhone, customerEmail, addressId, address/addressFull, jobCategory, workCategoryId/Name, workPackageId/Name, purpose, note, certificateName, paymentInfo, testItems[], medias[], orderUsers[] }`.
- Payload ke BE saat create: `buildMaterialTestOrderPayload` hanya mengirim field yang valid (work_category_id, work_package_name, applicant_xxx, recipient_name, entered_at, status, owner_user_ids, ordered_services[ {service_id, sample_name, quantity} ])`.
- Alur utama:
  1) `fetchAll` / `fetchById` mengisi cache lalu mengembalikan hasil normalisasi.
  2) `createOrder` kirim payload, lalu (opsional) upload dokumen pendukung ke `/medias`, kemudian refresh detail.
  3) `updateOrder` saat ini hanya mendukung update `status`; jika endpoint BE belum ada, state diupdate lokal supaya UI tetap jalan.
  4) `deleteOrder` belum tersedia di BE (mengembalikan NOT_IMPLEMENTED).

## useKajiUlangStore (`src/stores/useKajiUlangStore.js`)
- Peran: menampung data kaji ulang yang diturunkan dari permintaan/order yang sudah dinormalisasi; tidak memanggil API.
- Normalisasi: `upsertFromRequest` menerima request/order + optional `paymentDetail`, menurunkan status lewat `deriveOrderStatus` (prioritas payment status > status BE > awaiting_review).
- Shape kaji ulang di state: `{ id, requestId, orderNo, orderCode, orderNumber, orderYear, sampleNo, date, status, customerName, customerPhone, customerAddress, testType, note, testItems[], paymentInfo, kajiUlangRows[ { topic, result } ], kajiUlangNote, kajiUlangSignatures{ admin, customer }, kajiUlangValidatedAt, kajiUlangValidatedBy }`.
- Operasi utama:
  - `updateOrder` memutakhirkan data umum + paymentInfo (dinormalisasi ulang).
  - `updateReview` menyimpan hasil kaji ulang (rows, catatan, tanda tangan) serta validator.
  - `reviewPayment` menyetel status pembayaran disetujui/ditolak dan ikut mengubah status order.

## NotificationStack (`src/components/feedback/NotificationStack.vue`)
- Komponen presentational untuk toast stack.
- Props `items`: array `{ id, title, message, tone }` dengan `tone` salah satu `info|success|warning|error` (default `info`).
- Emit `dismiss` dengan `id` ketika tombol tutup ditekan; state list biasanya dipegang di parent/store.

## Siklus kerja cepat
- Tracking publik: `usePermintaanStore.checkOrderStatus(idOrder)` -> tampilkan `data.testItems` dan `status` dengan label dari `requestStatusLabels`.
- Input order internal: bentuk payload form -> `useOrderStore.createOrder(payload)` -> jika perlu upload dokumen pendukung lewat field `supportingFile`.
- Update status di dashboard: panggil `useOrderStore.updateOrder(orderNo, { status })`; jika backend belum siap, state akan diperbarui lokal.
- Kaji ulang: hasil `normalizeOrderToRequest` / `normalizeOrder` dikirim ke `useKajiUlangStore.upsertFromRequest`, kemudian pakai `updateReview` atau `reviewPayment` untuk menyimpan hasil evaluasi.

## Query-based routing (Permintaan & Kaji Ulang)
- Tujuan: URL selalu merepresentasikan order yang sedang dibuka tanpa membuat route baru.
- Pola: `?mode=new|edit|payment|preview&id=<ORDER_NO>&doc=request|invoice`.
- Halaman terkait: `src/pages/PermintaanPage.vue`, `src/pages/KajiUlangPage.vue`.
- Perilaku:
  - `mode=new` membuka form kosong.
  - `mode=edit&id=...` membuka form edit berdasarkan `orderNo`.
  - `mode=payment&id=...` membuka modal pembayaran/review bukti.
  - `mode=preview&id=...` membuka preview permintaan (opsional `doc=request|invoice`) - hanya di Permintaan.
  - Tutup form/modal akan menghapus `mode`/`id`/`doc` dari query.

## Query-based routing (Manajemen Pengguna)
- Tujuan: deep-link form pengguna/role tanpa route baru.
- Pola:
  - Users: `?mode=new|edit&id=<USER_ID>` di `src/pages/UsersPage.vue`.
  - Roles: `?mode=new|edit&id=<ROLE_ID>` di `src/pages/RolesPage.vue`.
- Perilaku: mode `new` membuka form kosong, `edit` membuka form edit by id, tutup modal menghapus query.
