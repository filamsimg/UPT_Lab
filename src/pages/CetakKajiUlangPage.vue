<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
        Cetak Kaji Ulang
      </h2>
      <p class="text-sm text-gray-500">
        Cari ID order, pilih, lalu cetak formulir kaji ulang.
      </p>
    </header>

    <section class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label
        class="block text-sm font-medium text-gray-700 mb-2"
        for="search"
      >
        Cari ID Order
      </label>
      <input
        id="search"
        v-model="searchTerm"
        type="text"
        placeholder="Contoh: 01KENW3HWK3BEV7DKEQ6CTA9NA"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <p class="mt-2 text-xs text-gray-500">
        Ketik minimal 5 karakter untuk menampilkan daftar order yang sudah
        lolos kaji ulang.
      </p>

      <div
        v-if="isReadyToSearch"
        class="mt-3 rounded-lg border border-gray-200 bg-gray-50"
      >
        <template v-if="filteredOrders.length">
          <button
            v-for="order in filteredOrders"
            :key="order.orderNo || order.id"
            type="button"
            class="flex w-full flex-col items-start justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-primary/5 sm:flex-row sm:items-center"
            @click="selectOrder(order)"
          >
            <div class="min-w-0">
              <p class="font-semibold text-surfaceDark">
                {{ order.orderNo || '-' }}
              </p>
              <p class="text-xs text-gray-500 break-words">
                ID: {{ order.id || '-' }} - Pemohon: {{ order.customerName || '-' }}
              </p>
            </div>
            <span
              class="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary sm:shrink-0"
            >
              {{ resolveStatusLabel(order) }}
            </span>
          </button>
        </template>
        <p v-else class="px-3 py-2 text-sm text-gray-500">
          Tidak ada order yang cocok.
        </p>
      </div>
    </section>

    <section v-if="selectedOrder" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p class="text-xs text-gray-500">ID Order</p>
          <p class="text-sm font-semibold text-surfaceDark break-words">
            {{ selectedOrder.orderNo || selectedOrder.id || '-' }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p class="text-xs text-gray-500">Nomor Order</p>
          <p class="text-sm font-semibold text-surfaceDark break-words">
            {{ selectedOrder.orderCode || selectedOrder.orderDisplay || '-' }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p class="text-xs text-gray-500">Tanggal</p>
          <p class="text-sm font-semibold text-surfaceDark break-words">
            {{ formatDisplayDate(selectedOrder.entryDate || selectedOrder.date) }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p class="text-xs text-gray-500">Pemohon</p>
          <p class="text-sm font-semibold text-surfaceDark break-words">
            {{ selectedOrder.customerName || '-' }}
          </p>
        </div>
      </div>

      <div class="space-y-3 sm:hidden">
        <article
          v-for="(item, index) in selectedItems"
          :key="`uji-card-${index}`"
          class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs text-gray-500">Pengujian #{{ index + 1 }}</p>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Qty {{ item.quantity || 1 }}
            </span>
          </div>
          <p class="mt-1 text-sm font-semibold text-surfaceDark break-words">
            {{ resolveTestName(item) || '-' }}
          </p>
          <div class="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div class="col-span-2">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Nama Sampel
              </p>
              <p class="text-sm text-surfaceDark break-words">
                {{ item.objectName || '-' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Kode Sampel
              </p>
              <p class="text-sm text-surfaceDark break-words">
                {{ resolveSampleCode(item) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Metode Uji
              </p>
              <p class="text-sm text-surfaceDark break-words">
                {{ resolveMethod(item) }}
              </p>
            </div>
          </div>
        </article>
        <div
          v-if="!selectedItems.length"
          class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500"
        >
          Tidak ada data pengujian.
        </div>
      </div>

      <div class="hidden overflow-auto sm:block">
        <table class="min-w-full text-sm border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="border-b px-3 py-2 text-left">No</th>
              <th class="border-b px-3 py-2 text-left">Nama Pengujian</th>
              <th class="border-b px-3 py-2 text-left">Jumlah</th>
              <th class="border-b px-3 py-2 text-left">Nama Sampel</th>
              <th class="border-b px-3 py-2 text-left">Kode Sampel</th>
              <th class="border-b px-3 py-2 text-left">Metode Uji</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in selectedItems"
              :key="`uji-${index}`"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="border-b px-3 py-2">{{ index + 1 }}</td>
              <td class="border-b px-3 py-2">
                {{ resolveTestName(item) || '-' }}
              </td>
              <td class="border-b px-3 py-2">{{ item.quantity || 1 }}</td>
              <td class="border-b px-3 py-2">{{ item.objectName || '-' }}</td>
              <td class="border-b px-3 py-2">{{ resolveSampleCode(item) }}</td>
              <td class="border-b px-3 py-2">{{ resolveMethod(item) }}</td>
            </tr>
            <tr v-if="!selectedItems.length">
              <td
                class="border-b px-3 py-3 text-center text-gray-500"
                colspan="6"
              >
                Tidak ada data pengujian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end">
        <button
          class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          @click="printKajiUlang"
        >
          Cetak Formulir
        </button>
      </div>
    </section>

    <p v-else class="text-sm text-gray-500">
      Silakan pilih order untuk melihat detail cetak.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '@/stores/useOrderStore';
import { useTestStore } from '@/stores/useTestStore';
import { buildKajiUlangPrintHtml } from '@/utils/printTemplates';
import { normalizeOrderStatus, toOrderStatusLabel } from '@/utils/orderStatus';
import logoDinas from '@/assets/LOGO DINAS KAB TEGAL.webp';

const orderStore = useOrderStore();
const testStore = useTestStore();
const searchTerm = ref('');
const selectedOrder = ref(null);
const allowedStatuses = new Set([
  'awaiting_payment',
  'payment_submitted',
  'payment_approved',
  'payment_rejected',
  'testing',
  'completed',
]);
const allowedStatusLabels = new Set(
  Array.from(allowedStatuses, (status) =>
    toOrderStatusLabel(status).toLowerCase()
  )
);

onMounted(() => {
  if (!orderStore.orders.length) {
    orderStore.fetchAll();
  }
  if (!testStore.tests.length) {
    testStore.fetchTests({ perPage: 200, skipLoading: true });
  }
});

const isReadyToSearch = computed(
  () => searchTerm.value.trim().length >= 5
);

const approvedOrders = computed(() =>
  (orderStore.orders || []).filter((order) => {
    const normalized = normalizeOrderStatus(order.status);
    if (allowedStatuses.has(normalized)) return true;
    const label =
      order.statusLabel || toOrderStatusLabel(order.status) || '';
    return allowedStatusLabels.has(String(label).toLowerCase());
  })
);

const filteredOrders = computed(() => {
  if (!isReadyToSearch.value) return [];
  const query = searchTerm.value.trim().toLowerCase();
  return approvedOrders.value.filter((order) => {
    const values = [
      order.orderNo,
      order.orderCode,
      order.orderDisplay,
      order.id,
      order.sampleNo,
      order.customerName,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return values.some((value) => value.includes(query));
  });
});

const selectedItems = computed(() => selectedOrder.value?.testItems || []);

function selectOrder(order) {
  selectedOrder.value = order;
  searchTerm.value = order.orderNo || order.orderCode || '';
}

function formatDisplayDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function resolveTestName(item = {}) {
  return (
    item.testName ||
    item.test_name ||
    item.name ||
    item.service?.test_name ||
    item.service?.testName ||
    item.service?.name ||
    ''
  );
}

function resolveSampleCode(item = {}) {
  return item.sampleNo || item.sampleCode || '-';
}

function resolveMethod(item = {}) {
  const candidates = [
    item.methodName,
    item.method_name,
    item.method?.name,
    item.method?.method_name,
    item.method?.MethodName,
    item.method?.title,
    item.method?.label,
    item.method?.code,
    item.method,
    item.service?.method_name,
    item.service?.methodName,
    item.service?.method?.name,
    item.service?.method?.method_name,
    item.service?.method?.MethodName,
    item.service?.method?.title,
    item.service?.method?.label,
    item.service?.method?.code,
    item.service?.method,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const text = candidate.trim();
      if (text) return text;
    }
    if (typeof candidate === 'number') return String(candidate);
  }
  const testId =
    item.serviceId ||
    item.service_id ||
    item.testId ||
    item.test_id ||
    item.orderedServiceId ||
    item.ordered_service_id ||
    item.id ||
    '';
  if (testId) {
    const test = (testStore.tests || []).find((entry) => entry.id === testId);
    if (test) {
      const fallback =
        test.methodName ||
        test.method_name ||
        test.test_method ||
        test.method?.name ||
        test.method?.method_name ||
        test.method?.MethodName ||
        test.method?.title ||
        test.method?.label ||
        test.method?.code ||
        test.method ||
        '';
      if (typeof fallback === 'string') {
        const fallbackText = fallback.trim();
        if (fallbackText) return fallbackText;
      }
    }
  }
  return '-';
}

function resolveStatusLabel(order) {
  if (!order) return '-';
  return (
    order.statusLabel ||
    toOrderStatusLabel(order.status) ||
    order.status ||
    '-'
  );
}

function printKajiUlang() {
  if (!selectedOrder.value) return;
  const html = buildKajiUlangPrintHtml(selectedOrder.value, {
    logoSrc: logoDinas,
    tests: testStore.tests,
  });
  openPrintWindow(html);
}

function openPrintWindow(html) {
  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) {
    alert('Tidak dapat membuka jendela cetak. Izinkan pop-up pada browser Anda.');
    return;
  }
  try {
    printWindow.document.open('text/html', 'replace');
    printWindow.document.write(html);
    printWindow.document.close();
    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        console.warn('Gagal memicu dialog print', err);
      }
    };
    if ('onload' in printWindow) {
      printWindow.onload = () => triggerPrint();
    } else {
      setTimeout(triggerPrint, 300);
    }
    printWindow.onafterprint = () => {
      try {
        printWindow.close();
      } catch (err) {
        console.warn('Gagal menutup jendela cetak', err);
      }
    };
  } catch (err) {
    console.error('Tidak dapat menulis konten ke jendela cetak', err);
    alert('Terjadi kesalahan saat menyiapkan dokumen cetak.');
  }
}
</script>
