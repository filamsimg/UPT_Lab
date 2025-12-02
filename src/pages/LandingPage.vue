<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Top nav -->
    <div
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm font-medium text-slate-700 lg:py-6"
      >
        <div class="flex items-center gap-2 text-sky-700">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>UPTD Lab. Perindustrian</span>
        </div>
        <div class="flex items-center gap-4">
          <a
            href="#layanan"
            class="hover:text-sky-700"
            @click.prevent="scrollToSection('layanan')"
            >Layanan</a
          >
          <a
            href="#informasi"
            class="hover:text-sky-700"
            @click.prevent="scrollToSection('informasi')"
            >Profil</a
          >
          <a
            href="#akreditasi"
            class="hover:text-sky-700"
            @click.prevent="scrollToSection('akreditasi')"
            >Akreditasi</a
          >
          <a
            href="#kontak"
            class="hover:text-sky-700"
            @click.prevent="scrollToSection('kontak')"
            >Kontak</a
          >
        </div>
      </div>
    </div>

    <!-- Hero -->
    <header
      class="relative overflow-hidden text-white"
      :style="heroBackgroundStyle"
    >
      <div class="absolute inset-0">
        <div
          class="absolute -left-24 top-12 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl"
        ></div>
        <div
          class="absolute right-10 bottom-0 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl"
        ></div>
      </div>
      <div
        class="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:py-20"
      >
        <div class="flex-1 space-y-6" data-reveal data-reveal-delay="100">
          <p
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            <span
              class="inline-block h-2 w-2 rounded-full bg-emerald-300"
            ></span>
            UPTD Laboratorium Perindustrian Kab. Tegal
          </p>
          <h1
            class="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
          >
            Laboratorium Terakreditasi KAN untuk Pengujian Material &
            Sertifikasi Kompetensi Industri
          </h1>
          <p class="max-w-2xl text-lg text-slate-100/90">
            Mendukung IKM melalui layanan uji material, permesinan/prototipe,
            dan TUK Mandiri BNSP dengan standar ISO/IEC 17025:2017 (LP-396-IDN).
          </p>
          <div
            class="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <RouterLink
              to="/login"
              class="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-600 shadow transition hover:-translate-y-0.5 hover:bg-slate-100 sm:w-56"
            >
              Masuk ke Dashboard
            </RouterLink>
            <a
              href="#cek-order"
              @click.prevent="scrollToSection('cek-order')"
              class="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:w-56"
            >
              Cek Status Order
            </a>
          </div>
          <div class="flex flex-wrap gap-3 text-sm text-white/85">
            <span
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-300"></span>
              ISO/IEC 17025:2017 (KAN) — LP-396-IDN
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-300"></span>
              TUK Mandiri BNSP
            </span>
          </div>
        </div>

        <div class="flex-1 space-y-4" data-reveal data-reveal-delay="180">
          <div
            class="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur"
          >
            <div class="grid grid-cols-2 gap-3 text-sm text-slate-900">
              <div class="rounded-2xl bg-white/90 p-4 shadow">
                <p class="text-xs font-semibold uppercase text-sky-600">
                  Permintaan
                </p>
                <p class="mt-2 text-lg font-semibold">Buat Order Uji</p>
                <p class="mt-1 text-xs text-slate-500">
                  Ajukan uji/machining dengan data sampel yang lengkap.
                </p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow">
                <p class="text-xs font-semibold uppercase text-sky-600">
                  Validasi
                </p>
                <p class="mt-2 text-lg font-semibold">Kaji Ulang Admin</p>
                <p class="mt-1 text-xs text-slate-500">
                  Permintaan dicek dulu sebelum lanjut ke pembayaran.
                </p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow">
                <p class="text-xs font-semibold uppercase text-sky-600">
                  Status
                </p>
                <p class="mt-2 text-lg font-semibold">Status & Pembayaran</p>
                <p class="mt-1 text-xs text-slate-500">
                  Pantau progres/SLA, lanjut pembayaran, dan unggah bukti.
                </p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow">
                <p class="text-xs font-semibold uppercase text-sky-600">
                  Riwayat
                </p>
                <p class="mt-2 text-lg font-semibold">Riwayat Aktivitas</p>
                <p class="mt-1 text-xs text-slate-500">
                  Catatan proses permintaan dan statusnya tetap tersimpan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-24 px-6 py-16">
      <!-- Order checker -->
      <section
        id="cek-order"
        class="section-block mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl ring-1 ring-slate-100/70 lg:mt-12 lg:p-10"
        data-reveal
        data-reveal-delay="150"
      >
        <div class="space-y-2 text-center">
          <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Lacak Status Pesanan Anda
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Masukkan nomor pesanan untuk melihat status pengujian Anda
          </h2>
        </div>

        <form
          @submit.prevent="handleCheckOrder"
          class="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm lg:flex-row lg:items-end lg:gap-4"
          data-reveal
          data-reveal-delay="220"
        >
          <div class="flex flex-1 flex-col gap-2 text-left">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              for="order-id-input"
            >
              Tracking Pesanan
            </label>
            <input
              id="order-id-input"
              v-model="searchId"
              type="text"
              autocomplete="off"
              placeholder="Masukkan nomor pesanan (contoh: 01KBF0AAX5AJKRGAQGJE6G5SYP)"
              class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="isChecking"
          >
            <span v-if="!isChecking">Lacak</span>
            <span v-else class="flex items-center gap-2">
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></span>
              Memeriksa...
            </span>
          </button>
        </form>
        <p v-if="checkError" class="mt-2 text-center text-sm text-rose-600">
          {{ checkError }}
        </p>
        <p
          v-else-if="hasSearched && !checkResult && !isChecking"
          class="mt-2 text-center text-sm text-slate-500"
        >
          Tidak menemukan data untuk ID Order tersebut. Periksa kembali
          penulisan ID atau hubungi petugas layanan.
        </p>

        <transition name="fade">
          <div
            v-if="checkResult"
            class="mt-8 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:p-8"
            data-reveal
            data-reveal-delay="260"
          >
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  ID Order
                </p>
                <p class="mt-1 text-2xl font-semibold text-slate-900">
                  {{ checkResult.idOrder }}
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  Status diperbarui terakhir:
                  {{
                    formatDate(
                      checkResult.updatedAt ||
                        checkResult.createdAt ||
                        checkResult.entryDate
                    )
                  }}
                </p>
              </div>
              <span
                :class="[
                  'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold',
                  statusBadgeClass,
                ]"
              >
                {{ statusLabel }}
              </span>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div
                class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Pemohon
                </p>
                <p class="text-sm font-semibold text-slate-900">
                  {{ checkResult.customerName || '-' }}
                </p>
                <p class="text-xs text-slate-500">
                  {{
                    checkResult.phoneNumber ||
                    checkResult.email ||
                    'Kontak tidak tersedia'
                  }}
                </p>
              </div>
              <div
                class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Tanggal Permintaan
                </p>
                <p class="text-sm font-semibold text-slate-900">
                  {{
                    formatDate(checkResult.entryDate || checkResult.createdAt)
                  }}
                </p>
                <p class="text-xs text-slate-500">
                  Jam layanan: Senin - Jumat 08.00 - 15.30 WIB
                </p>
              </div>
              <div
                class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Paket / Tujuan
                </p>
                <p class="text-sm font-semibold text-slate-900">
                  {{
                    checkResult.workPackage ||
                    checkResult.purpose ||
                    'Belum ditentukan'
                  }}
                </p>
                <p class="text-xs text-slate-500">
                  {{
                    (checkResult.jobCategory &&
                      `Kategori: ${checkResult.jobCategory}`) ||
                    'Kategori belum tercatat'
                  }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-sm font-semibold text-slate-900">Progress Order</p>
              <ol class="mt-4 space-y-4">
                <li
                  v-for="(step, index) in progressSteps"
                  :key="step.key"
                  class="flex gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm"
                >
                  <span
                    :class="[
                      'mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                      stepStateBubble[step.state],
                    ]"
                  >
                    {{ stepIndexLabel(step.key) }}
                  </span>
                  <div>
                    <p
                      class="font-semibold text-slate-900"
                      :class="step.state === 'failed' ? 'text-rose-600' : ''"
                    >
                      {{ step.label }}
                    </p>
                    <p class="text-sm text-slate-600">{{ step.description }}</p>
                  </div>
                </li>
              </ol>
            </div>

            <div
              v-if="checkResult.paymentInfo"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-sm font-semibold text-slate-900">
                Ringkasan Pembayaran
              </p>
              <div class="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Total Tagihan
                  </p>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ formatCurrency(checkResult.paymentInfo.total) }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Sudah Dibayar
                  </p>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ formatCurrency(checkResult.paymentInfo.amountPaid) }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Sisa Tagihan
                  </p>
                  <p
                    class="text-sm font-semibold"
                    :class="
                      checkResult.paymentInfo.outstanding > 0
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    "
                  >
                    {{ formatCurrency(checkResult.paymentInfo.outstanding) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- Profile -->
      <section
        id="informasi"
        class="section-block grid gap-10 lg:grid-cols-[1.1fr,0.9fr]"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="space-y-4">
          <div class="text-center lg:text-left">
            <p
              class="text-sm font-semibold uppercase tracking-wide text-sky-700"
            >
              Profil & Instansi Induk
            </p>
            <h2 class="text-2xl font-semibold text-slate-900">
              UPTD Laboratorium Perindustrian Kabupaten Tegal
            </h2>
          </div>
          <p class="text-base text-slate-700">
            Unit pelaksana teknis daerah yang bergerak di layanan uji mutu
            material dan permesinan di bawah Disperintransnaker Kabupaten Tegal.
            Berkomitmen meningkatkan daya saing IKM melalui produk yang lebih
            andal dan SDM yang tersertifikasi.
          </p>
          <p class="text-base text-slate-700">
            Terakreditasi KAN (ISO/IEC 17025:2017, LP-396-IDN) sejak 2008 dan
            ditetapkan sebagai TUK Mandiri BNSP untuk sertifikasi kompetensi
            bidang logam & mesin.
          </p>
          <div class="flex flex-wrap gap-3 text-sm text-slate-700">
            <span
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-800"
            >
              Akreditasi KAN
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-800"
            >
              TUK Mandiri BNSP
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-800"
            >
              Kepala UPTD: Eko Supriyanto, S.T.
            </span>
          </div>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white shadow-lg">
          <img
            :src="images.profile"
            alt="Laboratorium UPTD"
            class="h-64 w-full rounded-t-3xl object-cover"
          />
          <div class="space-y-3 p-5">
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">
                Terakreditasi KAN
              </p>
              <p class="text-sm text-slate-600">
                Nomor: LP-396-IDN • ISO/IEC 17025:2017 (sejak 2008)
              </p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">
                TUK Mandiri BNSP
              </p>
              <p class="text-sm text-slate-600">
                Lisensi: LSP Logam dan Mesin Indonesia • Sejak 2017
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Services -->
      <section
        id="layanan"
        class="section-block space-y-6"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="space-y-2 text-center">
          <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Layanan Utama
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Uji Material, Permesinan, dan Sertifikasi Kompetensi
          </h2>
        </div>
        <div class="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(service, idx) in services"
            :key="service.title"
            class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            :data-reveal-delay="220 + idx * 40"
            data-reveal
          >
            <div class="h-36 w-full overflow-hidden bg-slate-100">
              <img
                :src="service.image"
                :alt="service.title"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="flex flex-1 flex-col gap-3 p-5">
              <div
                class="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :class="service.dotClass"
                ></span>
                {{ service.title }}
              </div>
              <ul class="flex-1 space-y-2 text-sm text-slate-700">
                <li v-for="item in service.items" :key="item">- {{ item }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- Accreditation -->
      <section
        id="akreditasi"
        class="section-block space-y-6"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="space-y-2 text-center">
          <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Akreditasi & Pengakuan
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Standar mutu dan lisensi resmi
          </h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="(card, idx) in accreditationCards"
            :key="card.title"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            :data-reveal-delay="240 + idx * 40"
            data-reveal
          >
            <img
              :src="card.image"
              :alt="card.title"
              class="h-40 w-full object-cover"
            />
            <div class="space-y-2 p-5">
              <p class="text-sm font-semibold text-slate-900">
                {{ card.title }}
              </p>
              <p class="text-sm text-slate-600">{{ card.description }}</p>
              <p class="text-xs font-semibold text-emerald-600">
                {{ card.badge }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <!-- Contact -->
      <section
        id="kontak"
        class="section-block space-y-6"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="space-y-2 text-center">
          <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Kontak & Lokasi
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Hubungi atau kunjungi kami di LIK “Takaru” Dampyak
          </h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(card, idx) in contactCards"
            :key="card.title"
            class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            :data-reveal-delay="240 + idx * 40"
            data-reveal
          >
            <img
              :src="card.image"
              :alt="card.title"
              class="h-32 w-full object-cover"
            />
            <div class="flex-1 space-y-3 p-5 text-sm text-slate-700">
              <p class="text-base font-semibold text-slate-900">
                {{ card.title }}
              </p>
              <ul class="space-y-1.5">
                <li v-for="line in card.lines" :key="line">{{ line }}</li>
              </ul>
              <div v-if="card.cta" class="pt-2">
                <a
                  :href="card.cta.href"
                  class="text-sky-700 underline hover:text-sky-800"
                  >{{ card.cta.label }}</a
                >
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Gallery -->
      <section
        class="section-block space-y-4"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="text-center">
          <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Galeri Kegiatan
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Dokumentasi kegiatan dan fasilitas
          </h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="(item, idx) in galleryItems"
            :key="idx"
            class="h-28 rounded-xl bg-slate-200"
            :style="{
              backgroundImage: `url(${item})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
            data-reveal
            :data-reveal-delay="240 + idx * 30"
          ></div>
        </div>
      </section>

      <!-- CTA -->
      <section
        class="section-block rounded-3xl bg-gradient-to-r from-slate-900 via-sky-800 to-teal-600 px-8 py-10 text-white shadow-lg"
        data-reveal
        data-reveal-delay="200"
      >
        <div class="grid items-center gap-6 md:grid-cols-[1.5fr,1fr]">
          <div>
            <h3 class="text-2xl font-semibold">
              Siap uji material atau sertifikasi kompetensi?
            </h3>
            <p class="mt-2 text-sm text-slate-100">
              Tim UPTD Laboratorium Perindustrian Kabupaten Tegal siap membantu
              kebutuhan uji material, permesinan, dan sertifikasi. Gunakan
              dashboard untuk proses cepat dan transparan.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <RouterLink
              to="/register"
              class="inline-flex items-center justify-center rounded-lg border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Daftar Akun
            </RouterLink>
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Masuk Sekarang
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-slate-900 py-10 text-slate-300">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <p>&copy; {{ currentYear }} UPT Laboratorium Kabupaten Tegal.</p>
        <p>Didukung oleh Sistem Informasi Dashboard Laboratorium.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from 'vue';
import { RouterLink } from 'vue-router';
import {
  usePermintaanStore,
  requestStatusLabels,
} from '@/stores/usePermintaanStore';

const currentYear = new Date().getFullYear();

// Dummy image paths (ganti dengan aset nyata nanti)
import bgLogin from '@/assets/bg-login.jpg';

const images = {
  profile: bgLogin,
  service1: bgLogin,
  service2: bgLogin,
  service3: bgLogin,
  accreditation1: bgLogin,
  accreditation2: bgLogin,
  contact1: bgLogin,
  contact2: bgLogin,
  contact3: bgLogin,
};

const services = [
  {
    title: 'Pengujian Material',
    dotClass: 'bg-emerald-500',
    image: images.service1,
    items: [
      'Uji tarik dan uji lengkung logam',
      'Uji impact dan kekerasan (Brinell)',
      'Pengujian profil baja (H-beam)',
      'Uji komposisi logam & laju korosi',
      'Uji berat jenis dan struktur mikro',
      'Uji tekan beton',
    ],
  },
  {
    title: 'Permesinan & Prototipe',
    dotClass: 'bg-sky-500',
    image: images.service2,
    items: [
      'Workshop dengan CNC machine',
      'Welding Centre',
      'Pembuatan cetakan (mould & dies)',
      'Permesinan presisi & prototipe',
      'Perancangan desain produk',
    ],
  },
  {
    title: 'Sertifikasi Kompetensi',
    dotClass: 'bg-purple-500',
    image: images.service3,
    items: [
      'TUK Mandiri BNSP',
      'Lisensi LSP Logam dan Mesin Indonesia',
      'Sertifikasi fabrikasi logam',
      'Desain & CAD',
      'Operasi mesin & quality control',
      'Konsultasi kebutuhan sertifikasi',
    ],
  },
];

const accreditationCards = [
  {
    title: 'Akreditasi KAN',
    description: 'Terakreditasi sejak 2008 dengan standar ISO/IEC 17025:2017.',
    badge: 'Nomor: LP-396-IDN',
    image: images.accreditation1,
  },
  {
    title: 'TUK Mandiri BNSP',
    description: 'Ditunjuk sebagai Tempat Uji Kompetensi Mandiri sejak 2017.',
    badge: 'Lisensi: LSP Logam dan Mesin Indonesia',
    image: images.accreditation2,
  },
];

const contactCards = [
  {
    title: 'Informasi Kontak',
    image: images.contact1,
    lines: [
      'Jl. Raya Dampyak KM.4, Komplek LIK “Takaru”',
      'Dampyak, Kec. Kramat, Kab. Tegal',
      'Telepon: (0283) 357437',
      'Email: labperindtgl@gmail.com',
      'Jam: Senin – Jumat, 08.00 – 17.00 WIB',
    ],
  },
  {
    title: 'Website Resmi',
    image: images.contact2,
    lines: [
      'Kunjungi website resmi kami untuk informasi lebih lengkap:',
      'lab.disperinnaker.tegalkab.go.id',
    ],
    cta: {
      href: 'https://lab.disperinnaker.tegalkab.go.id',
      label: 'Buka website',
    },
  },
  {
    title: 'Instansi Induk',
    image: images.contact3,
    lines: [
      'Dinas Perindustrian, Transmigrasi dan Tenaga Kerja',
      'Kepala UPTD: Eko Supriyanto, S.T.',
    ],
  },
];

const galleryItems = Array.from({ length: 6 }).map(() => bgLogin);

const heroBackgroundStyle = {
  backgroundImage:
    'radial-gradient(80% 120% at 30% 30%, rgba(255,255,255,0.12), transparent), linear-gradient(135deg, #0b7ac2 0%, #0c6fb1 40%, #0a5f99 100%)',
};

const permintaanStore = usePermintaanStore();
const searchId = ref('');
const isChecking = ref(false);
const checkResult = ref(null);
const checkError = ref('');
const hasSearched = ref(false);
const revealObserver = ref(null);

const stepStateBubble = {
  done: 'bg-emerald-500',
  current: 'bg-sky-500',
  pending: 'bg-slate-300',
  failed: 'bg-rose-500',
};

const baseSteps = [
  {
    key: 'draft',
    label: 'Permintaan Diterima',
    description:
      'Permintaan berhasil dicatat di sistem dan menunggu proses berikutnya.',
  },
  {
    key: 'pending_payment',
    label: 'Menunggu Pembayaran',
    description:
      'Silakan selesaikan pembayaran sesuai instruksi yang diberikan petugas.',
  },
  {
    key: 'payment_pending_review',
    label: 'Verifikasi Pembayaran',
    description: 'Tim kami sedang memeriksa bukti pembayaran yang diajukan.',
  },
  {
    key: 'payment_verified',
    label: 'Pembayaran Terverifikasi',
    description:
      'Pembayaran sudah diterima dan diverifikasi oleh petugas keuangan.',
  },
  {
    key: 'approved',
    label: 'Permintaan Diproses',
    description:
      'Permintaan Anda diteruskan ke tim teknis untuk diproses lebih lanjut.',
  },
];

const terminalStatuses = ['payment_review_rejected', 'rejected', 'cancelled'];
const statusToStepKey = {
  payment_review_rejected: 'payment_pending_review',
  rejected: 'approved',
  cancelled: 'pending_payment',
};

const specialStatusMap = {
  payment_review_rejected: {
    title: 'Bukti Pembayaran Perlu Diperbaiki',
    message:
      'Bukti pembayaran yang Anda unggah belum dapat kami verifikasi. Silakan unggah ulang bukti pembayaran atau hubungi petugas keuangan untuk konfirmasi lebih lanjut.',
  },
  rejected: {
    title: 'Permintaan Ditolak',
    message:
      'Permintaan Anda tidak dapat kami proses. Mohon hubungi petugas layanan untuk mengetahui alasan penolakan dan langkah selanjutnya.',
  },
  cancelled: {
    title: 'Permintaan Dibatalkan',
    message:
      'Permintaan dibatalkan oleh pemohon atau petugas. Jika ingin melanjutkan, silakan ajukan permintaan baru melalui dashboard.',
  },
};

const formatStatus = (status = '') => {
  if (!status) return '-';
  if (requestStatusLabels[status]) return requestStatusLabels[status];
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const statusLabel = computed(() => formatStatus(checkResult.value?.status));

const statusBadgeClass = computed(() => {
  const status = checkResult.value?.status;
  if (!status) return 'bg-slate-200 text-slate-700';
  if (status === 'approved' || status === 'payment_verified')
    return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending_payment' || status === 'payment_pending_review')
    return 'bg-amber-100 text-amber-700';
  if (
    status === 'rejected' ||
    status === 'payment_review_rejected' ||
    status === 'cancelled'
  )
    return 'bg-rose-100 text-rose-700';
  return 'bg-slate-200 text-slate-700';
});

const progressSteps = computed(() => {
  const result = checkResult.value;
  if (!result) return baseSteps;

  const currentStatus = result.status;
  const steps = baseSteps.map((step) => ({ ...step, state: 'pending' }));

  const resolvedStatus =
    terminalStatuses.includes(currentStatus) && statusToStepKey[currentStatus]
      ? statusToStepKey[currentStatus]
      : currentStatus;

  let found = false;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    if (step.key === resolvedStatus) {
      step.state = terminalStatuses.includes(currentStatus)
        ? 'failed'
        : 'current';
      found = true;
      for (let j = 0; j < i; j += 1) {
        steps[j].state = 'done';
      }
      break;
    }
  }
  if (!found) steps[0].state = 'current';
  return steps;
});

const specialStatus = computed(() => {
  if (!checkResult.value?.status) return null;
  return specialStatusMap[checkResult.value.status] || null;
});

const stepIndexLabel = (key) => {
  const index = baseSteps.findIndex((step) => step.key === key);
  return index === -1 ? '•' : index + 1;
};

const handleCheckOrder = async () => {
  const query = searchId.value.trim();
  hasSearched.value = true;
  checkError.value = '';
  checkResult.value = null;

  if (!query) {
    checkError.value = 'Masukkan ID Order terlebih dahulu.';
    return;
  }

  isChecking.value = true;
  try {
    const { ok, data, error } = await permintaanStore.checkOrderStatus(query);
    if (ok && data) {
      checkResult.value = data;
    } else {
      checkError.value =
        error || 'Tidak menemukan data untuk ID Order tersebut.';
    }
  } catch (err) {
    console.error('Gagal memeriksa order:', err);
    checkError.value =
      'Terjadi kesalahan saat memeriksa status. Silakan coba lagi.';
  } finally {
    isChecking.value = false;
  }
};

const scrollToSection = (targetId) => {
  if (typeof window === 'undefined') return;
  const section = document.getElementById(targetId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const initRevealAnimations = () => {
  if (typeof window === 'undefined') return;
  if (revealObserver.value) {
    revealObserver.value.disconnect();
    revealObserver.value = null;
  }
  const elements = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!elements.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  elements.forEach((el, index) => {
    const delayAttr = el.dataset.revealDelay;
    const delay = delayAttr !== undefined ? Number(delayAttr) : index * 70;
    if (!Number.isNaN(delay)) {
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    }
    observer.observe(el);
  });

  revealObserver.value = observer;
};

onMounted(async () => {
  await nextTick();
  initRevealAnimations();
});

onBeforeUnmount(() => {
  if (revealObserver.value) {
    revealObserver.value.disconnect();
    revealObserver.value = null;
  }
});

watch(
  () => checkResult.value,
  async () => {
    await nextTick();
    initRevealAnimations();
  }
);
</script>

<style scoped>
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}

.section-block {
  scroll-margin-top: 96px;
}
</style>
