<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
        Validasi Manajer Teknis
      </h2>
      <p class="text-sm text-gray-500">
        Cari ID Order (min. 5 karakter), pilih, lalu cetak form validasi.
      </p>
    </header>

    <!-- Pencarian Order -->
    <section class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label class="block text-sm font-medium text-gray-700 mb-2" for="search">
        Cari ID / No Order
      </label>
      <input
        id="search"
        v-model.trim="searchTerm"
        type="text"
        placeholder="Contoh: 01K8W atau ORD-20"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <p class="mt-2 text-xs text-gray-500">
        Ketik minimal 5 huruf/angka untuk menampilkan daftar order.
      </p>

      <div
        v-if="showSuggestions"
        class="mt-3 rounded-lg border border-gray-200 bg-gray-50"
      >
        <template v-if="filteredOrders.length">
          <button
            v-for="order in filteredOrders"
            :key="order.id"
            class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-primary/5"
            @click="selectOrder(order)"
          >
            <div>
              <p class="font-semibold text-surfaceDark">
                {{ order.orderNo || '-' }}
              </p>
              <p class="text-xs text-gray-500">
                ID: {{ order.id }} - Permintaan: {{ order.requestId || '-' }}
              </p>
            </div>
            <span class="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary">
              {{ order.status || 'draft' }}
            </span>
          </button>
        </template>
        <p v-else class="px-3 py-2 text-sm text-gray-500">
          Tidak ada order yang cocok.
        </p>
      </div>
    </section>

    <!-- Detail Order -->
    <section
      v-if="selectedOrder"
      class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBox label="ID Order" :value="selectedOrder.id" />
        <InfoBox label="No Order" :value="selectedOrder.orderNo || '-'" />
        <InfoBox label="Tanggal" :value="formatDate(selectedOrder.date)" />
        <InfoBox label="Komoditi / Benda Uji" :value="commodity" />
      </div>

      <div class="overflow-auto">
        <table class="min-w-full text-sm border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="border-b px-3 py-2 text-left">No</th>
              <th class="border-b px-3 py-2 text-left">Jenis Pengujian</th>
              <th class="border-b px-3 py-2 text-left">Jumlah Sampel</th>
              <th class="border-b px-3 py-2 text-left">Kode Sampel</th>
              <th class="border-b px-3 py-2 text-left">Metode Uji</th>
              <th class="border-b px-3 py-2 text-left">Waktu Pengambilan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in testItems"
              :key="index"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="border-b px-3 py-2">{{ index + 1 }}</td>
              <td class="border-b px-3 py-2">
                {{ item.testName || item.name || '-' }}
              </td>
              <td class="border-b px-3 py-2">{{ item.quantity || 0 }}</td>
              <td class="border-b px-3 py-2">
                {{ resolveSampleCode(selectedOrder, item, index) }}
              </td>
              <td class="border-b px-3 py-2">
                {{ item.method || item.methodName || item.testMethod || '-' }}
              </td>
              <td class="border-b px-3 py-2">
                {{ item.collectionTime || item.collectionDate || '-' }}
              </td>
            </tr>
            <tr v-if="!testItems.length">
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

      <div class="grid gap-6 sm:grid-cols-2">
        <SignatureBox title="Manajer Teknis" :name="managerTeknis" />
        <SignatureBox title="Penerima Sampel Uji" :name="penerimaSampel" />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          :disabled="!selectedOrder"
          @click="printSelected"
        >
          Print
        </button>
      </div>
    </section>

    <p v-else class="text-sm text-gray-500">
      Silakan pilih order untuk melihat detail validasi.
    </p>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, ref } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { buildValidasiPrintHtml } from '@/utils/printTemplates';
import logoDinas from '@/assets/LOGO DINAS KAB TEGAL.png';

const orderStore = useKajiUlangStore();
const searchTerm = ref('');
const selectedOrder = ref(null);

const InfoBox = defineComponent({
  name: 'InfoBox',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: '' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'rounded-lg border border-gray-200 bg-gray-50 p-3' }, [
        h('p', { class: 'text-xs text-gray-500' }, props.label || 'Label'),
        h(
          'p',
          { class: 'text-sm font-semibold text-surfaceDark' },
          props.value || '-'
        ),
      ]);
  },
});

const SignatureBox = defineComponent({
  name: 'SignatureBox',
  props: {
    title: { type: String, default: '' },
    name: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          class:
            'rounded-lg border border-dashed border-gray-300 p-4 text-center',
        },
        [
          h(
            'p',
            { class: 'text-sm font-semibold text-surfaceDark mb-10' },
            props.title || '-'
          ),
          h(
            'p',
            { class: 'text-sm font-medium text-gray-700' },
            props.name || '________________'
          ),
        ]
      );
  },
});

const showSuggestions = computed(() => searchTerm.value.trim().length >= 5);
const filteredOrders = computed(() => {
  if (!showSuggestions.value) return [];
  const term = searchTerm.value.trim().toLowerCase();
  return orderStore.orders.filter((order) => {
    const values = [
      order.orderNo,
      order.requestId,
      order.sampleNo,
      order.id?.toString(),
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());
    return values.some((val) => val.includes(term));
  });
});

const testItems = computed(() =>
  Array.isArray(selectedOrder.value?.testItems)
    ? selectedOrder.value.testItems
    : []
);

const commodity = computed(() => resolveCommodity(selectedOrder.value));
const managerTeknis = computed(
  () => selectedOrder.value?.kajiUlangValidatedBy || 'Manajer Teknis'
);
const penerimaSampel = computed(
  () => selectedOrder.value?.sampleReceiver || 'Penerima Sampel Uji'
);

function selectOrder(order) {
  selectedOrder.value = order;
  searchTerm.value =
    order.orderNo || order.requestId || order.sampleNo || String(order.id);
}

function resolveCommodity(order) {
  if (!order) return '-';
  return (
    order.commodity ||
    order.objectName ||
    order.testItems?.[0]?.objectName ||
    order.testType ||
    'Tidak ada data'
  );
}

function formatSampleCode(order, item, index) {
  const date = order?.date || order?.entryDate || new Date().toISOString();
  const parsedDate = new Date(date);
  const monthYear = Number.isNaN(parsedDate.getTime())
    ? `${String(new Date().getMonth() + 1).padStart(2, '0')}/${
        new Date().getFullYear()
      }`
    : `${String(parsedDate.getMonth() + 1).padStart(2, '0')}/${
        parsedDate.getFullYear()
      }`;

  const orderSegment = order?.orderNumber
    ? String(order.orderNumber).padStart(3, '0')
    : '--';
  const testCode = getTestCode(item, index);
  const sampleSegment = item?.sampleNo || item?.sampleCode || '--';

  return `${monthYear}.${orderSegment}/${testCode}/${sampleSegment}`;
}

function getTestCode(item, index) {
  if (!item) return `ITEM-${index + 1}`;
  if (item.testCode) {
    const [code] = String(item.testCode).split('-');
    return code || `ITEM-${index + 1}`;
  }
  if (item.testId) {
    const [code] = String(item.testId).split('-');
    return code || item.testId;
  }
  if (item.code) {
    const [code] = String(item.code).split('-');
    return code || `ITEM-${index + 1}`;
  }
  return `ITEM-${index + 1}`;
}

function resolveSampleCode(order, item, index) {
  if (!order || !item) return '-';
  return (
    item.sampleNo ||
    item.sampleCode ||
    formatSampleCode(order, item, index) ||
    '-'
  );
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function printSelected() {
  if (!selectedOrder.value) return;
  const html = buildValidasiPrintHtml(selectedOrder.value, {
    logoSrc: logoDinas,
  });

  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) {
    alert('Tidak dapat membuka jendela cetak. Izinkan pop-up pada browser Anda.');
    return;
  }

  try {
    printWindow.document.open('text/html', 'replace');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        console.warn('Gagal memicu dialog print', err);
      }
    };

    if ('onload' in printWindow) {
      printWindow.onload = triggerPrint;
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
    console.error('Tidak dapat menyiapkan dokumen cetak', err);
    alert('Terjadi kesalahan saat menyiapkan dokumen cetak.');
  }
}
</script>
