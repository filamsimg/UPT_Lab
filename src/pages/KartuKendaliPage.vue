<template>
  <!-- Halaman kartu kendali: daftar kartu kendali pekerjaan/lab -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Kartu Kendali Pengujian</h2>
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6 grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-500">No Order</p>
        <p class="font-medium">{{ order?.orderNo }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">No Sampel</p>
        <p class="font-medium">{{ order?.sampleNo }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Komoditi</p>
        <p class="font-medium">{{ order?.commodity }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Parameter Uji</p>
        <p class="font-medium">{{ parameterUji }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Metode Uji</p>
        <p class="font-medium">{{ metodeUji }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-500">Keterangan</p>
        <p class="font-medium">{{ keterangan }}</p>
      </div>
    </div>

    <!-- Timeline -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Progress</h3>
      <div class="flex items-center gap-2 overflow-x-auto">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
        >
          <div
            :class="[
              'w-4 h-4 rounded-full',
              currentStatusIndex >= index ? 'bg-primary' : 'bg-gray-300',
            ]"
          ></div>
          <span
            class="text-xs ml-1 mr-4 whitespace-nowrap"
            :class="{ 'text-primary': currentStatusIndex >= index }"
          >
            {{ step.label }}
          </span>
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-px bg-gray-300"
          ></div>
        </div>
      </div>
    </div>

    <!-- Paraf grid -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
      <h3 class="text-lg font-semibold mb-4">Paraf</h3>
      <table class="min-w-full text-sm border border-gray-200">
        <thead class="bg-muted">
          <tr>
            <th class="border-b px-2 py-2">Tahap</th>
            <th class="border-b px-2 py-2">Tanggal</th>
            <th class="border-b px-2 py-2">Jam</th>
            <th class="border-b px-2 py-2">Paraf</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in parafRows"
            :key="index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border-b px-2 py-2 whitespace-nowrap">
              {{ row.tahap }}
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="date"
                v-model="row.tanggal"
                class="border border-gray-300 rounded-md px-2 py-1"
              />
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="time"
                v-model="row.jam"
                class="border border-gray-300 rounded-md px-2 py-1"
              />
            </td>
            <td class="border-b px-2 py-2">
              <input
                type="file"
                accept="image/*"
                @change="onRowSignatureChange($event, index)"
              />
              <img
                v-if="row.signature"
                :src="row.signature"
                class="h-10 mt-2"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <button
        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        @click="simpan"
      >
        Simpan
      </button>
      <button
        class="bg-primary text-white px-4 py-2 rounded-lg"
        @click="updateStatus"
      >
        Update Status
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
// SignaturePad removed - replaced with simple file input

const route = useRoute();
const orderStore = useKajiUlangStore();

const orderId = computed(() => Number(route.query.orderId) || null);
const order = computed(() =>
  orderStore.orders.find((o) => o.id === orderId.value)
);

// Dummy header details; in a real app, these would come from other pages or store
const parameterUji = 'Parameter A';
const metodeUji = 'Metode X';
const keterangan = 'Contoh keterangan';

// Define timeline steps
const steps = [
  { label: 'Draft' },
  { label: 'Validasi' },
  { label: 'Dalam Uji' },
  { label: 'Selesai' },
];

/*
 * Map order statuses to the index of the progress steps based on
 * material test order statuses from backend.
 */
const statusIndexMap = {
  draft: 0,
  awaiting_review: 0,
  awaiting_payment: 1,
  payment_submitted: 1,
  payment_rejected: 1,
  payment_approved: 2,
  testing: 2,
  completed: 3,
  refunded: 3,
  cancelled: 3,
  rejected: 3,
};

const currentStatusIndex = computed(
  () => statusIndexMap[order.value?.status] ?? 0
);

// Paraf rows with initial structure
const parafRows = reactive([
  { tahap: 'Penerima Sampel', tanggal: '', jam: '', signature: null },
  { tahap: 'Manajer Teknis', tanggal: '', jam: '', signature: null },
  { tahap: 'Penyelia Uji', tanggal: '', jam: '', signature: null },
  { tahap: 'Teknisi', tanggal: '', jam: '', signature: null },
  { tahap: 'Penyelia Uji (verif)', tanggal: '', jam: '', signature: null },
  { tahap: 'Customer', tanggal: '', jam: '', signature: null },
  { tahap: 'Administrasi', tanggal: '', jam: '', signature: null },
  { tahap: 'Kepala Lab', tanggal: '', jam: '', signature: null },
  { tahap: 'Manajer Teknis (final)', tanggal: '', jam: '', signature: null },
  { tahap: 'Administrasi (closing)', tanggal: '', jam: '', signature: null },
]);

function onRowSignatureChange(e, idx) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    parafRows[idx].signature = reader.result;
  };
  reader.readAsDataURL(f);
}

function simpan() {
  // Save progress (dummy)
  console.log('Kartu kendali saved', { parafRows });
  alert('Kartu kendali disimpan (dummy)');
}

function updateStatus() {
  if (order.value) {
    // Move to next status
    const statuses = [
      'draft',
      'awaiting_review',
      'awaiting_payment',
      'payment_submitted',
      'payment_approved',
      'testing',
      'completed',
    ];
    const idx = statuses.indexOf(order.value.status);
    // Pick the next status, capping at the last element
    const nextStatus = statuses[Math.min(idx + 1, statuses.length - 1)];
    orderStore.setStatus(order.value.id, nextStatus);
    alert(`Status diperbarui ke ${nextStatus}`);
  }
}
</script>
