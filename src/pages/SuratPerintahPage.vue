<template>
  <!-- Halaman surat perintah kerja / kartu kendali -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Surat Perintah Pengujian</h2>
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6 grid grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Kepada (Teknisi)</label
        >
        <select
          v-model="teknisiId"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        >
          <option :value="null">Pilih teknisi</option>
          <option v-for="user in teknisiUsers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
      <div>
        <p class="text-sm text-gray-500">No Order</p>
        <p class="font-medium">{{ order?.orderNo }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Tanggal</p>
        <p class="font-medium">{{ today }}</p>
      </div>
    </div>

    <!-- Table of tests -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Detail Pengujian</h3>
      <table class="min-w-full text-sm border border-gray-200">
        <thead class="bg-muted">
          <tr>
            <th class="border-b px-2 py-2">No</th>
            <th class="border-b px-2 py-2">Nama Pengujian</th>
            <th class="border-b px-2 py-2">Jumlah Sampel</th>
            <th class="border-b px-2 py-2">Kode Sampel</th>
            <th class="border-b px-2 py-2">Metode Uji</th>
            <th class="border-b px-2 py-2">Peralatan</th>
            <th class="border-b px-2 py-2">Waktu Pengambilan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in spRows"
            :key="index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border-b px-2 py-2 text-center">{{ index + 1 }}</td>
            <td class="border-b px-2 py-2">
              <select
                v-model="row.testId"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              >
                <option :value="null">Pilih</option>
                <option v-for="t in tests" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="number"
                min="1"
                v-model.number="row.quantity"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              />
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="text"
                v-model="row.code"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              />
            </td>
            <td class="border-b px-2 py-2">
              <select
                v-model="row.method"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              >
                <option :value="null">Pilih</option>
                <option v-for="t in tests" :key="t.id" :value="t.method">
                  {{ t.method }}
                </option>
              </select>
            </td>
            <td class="border-b px-2 py-2">
              <select
                v-model="row.equipment"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              >
                <option :value="null">Pilih</option>
                <option v-for="t in tests" :key="t.id" :value="t.equipment">
                  {{ t.equipment }}
                </option>
              </select>
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="datetime-local"
                v-model="row.time"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <button
        class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm"
        @click="addRow"
      >
        Tambah Baris
      </button>
    </div>

    <!-- Signature -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h4 class="font-medium mb-2">Penyelia Uji</h4>
      <input type="file" accept="image/*" @change="onSignatureChange" />
      <img v-if="signature" :src="signature" class="h-16 mt-2" />
    </div>

    <!-- Action -->
    <div class="flex gap-4">
      <button
        class="bg-primary text-white px-4 py-2 rounded-lg"
        @click="terbitkan"
      >
        Terbitkan Surat Perintah
      </button>
    </div>

    <!-- PrintArea for surat perintah -->
    <PrintArea v-if="showLetter">
      <div class="bg-white p-4">
        <h3 class="text-center font-bold text-lg mb-4">
          Surat Perintah Pengujian
        </h3>
        <p><strong>Kepada:</strong> {{ teknisiName }}</p>
        <!-- Use the English orderNo field for printing -->
        <p><strong>No Order:</strong> {{ order?.orderNo }}</p>
        <p><strong>Tanggal:</strong> {{ today }}</p>
        <p class="mt-2"><strong>Rincian Pengujian:</strong></p>
        <table class="min-w-full text-sm border border-gray-200 mt-2">
          <thead class="bg-muted">
            <tr>
              <th class="border-b px-2 py-1">No</th>
              <th class="border-b px-2 py-1">Pengujian</th>
              <th class="border-b px-2 py-1">Jumlah</th>
              <th class="border-b px-2 py-1">Kode Sampel</th>
              <th class="border-b px-2 py-1">Metode</th>
              <th class="border-b px-2 py-1">Peralatan</th>
              <th class="border-b px-2 py-1">Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in spRows"
              :key="index"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="border-b px-2 py-1 text-center">{{ index + 1 }}</td>
              <td class="border-b px-2 py-1">{{ getTestName(row.testId) }}</td>
              <td class="border-b px-2 py-1 text-center">{{ row.quantity }}</td>
              <td class="border-b px-2 py-1">{{ row.code }}</td>
              <td class="border-b px-2 py-1">{{ row.method }}</td>
              <td class="border-b px-2 py-1">{{ row.equipment }}</td>
              <td class="border-b px-2 py-1">{{ row.time }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-8">
          <p><strong>Penyelia Uji:</strong></p>
          <img
            v-if="signature"
            :src="signature"
            alt="Signature"
            class="h-16 mt-2"
          />
        </div>
      </div>
    </PrintArea>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useUserStore } from '@/stores/useUserStore';
import { useTestStore } from '@/stores/useTestStore';

const route = useRoute();
const orderStore = useKajiUlangStore();
const userStore = useUserStore();
const testStore = useTestStore();

const orderId = computed(() => Number(route.query.orderId) || null);
const order = computed(() =>
  orderStore.orders.find((o) => o.id === orderId.value)
);

const teknisiUsers = computed(() =>
  userStore.users.filter((u) => u.role === 'Teknisi')
);
const teknisiId = ref(null);
const teknisiName = computed(
  () => teknisiUsers.value.find((t) => t.id === teknisiId.value)?.name || ''
);

const tests = computed(() => testStore.tests);

const spRows = reactive([
  {
    testId: null,
    quantity: 1,
    code: '',
    method: null,
    equipment: null,
    time: '',
  },
]);

function addRow() {
  spRows.push({
    testId: null,
    quantity: 1,
    code: '',
    method: null,
    equipment: null,
    time: '',
  });
}

function getTestName(id) {
  return tests.value.find((t) => t.id === id)?.name || '';
}

const signature = ref(null);

function onSignatureChange(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    signature.value = r.result;
  };
  r.readAsDataURL(f);
}

const showLetter = ref(false);

const today = new Date().toISOString().substr(0, 10);

function terbitkan() {
  showLetter.value = true;
  // Print after DOM updated
  setTimeout(() => window.print(), 0);
}
</script>
