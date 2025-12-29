<template>
  <!-- Halaman keuangan: ringkasan pembayaran/tagihan -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Keuangan</h2>
    <!-- Export button -->
    <div class="mb-4 flex justify-end">
      <button
        class="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm"
        @click="exportCsv"
      >
        Export CSV
      </button>
    </div>
    <!-- Finance table -->
    <EasyDataTable
      :columns="columns"
      :rows="rows"
      :searchable="true"
      :sortable="true"
      :paginated="true"
      :pageSize="10"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import DataTable from '@/components/common/DataTable.vue'; 

const orderStore = useKajiUlangStore();
const customerStore = useCustomerStore();

// Define finance table columns
const columns = [
  { key: 'orderNo', label: 'No Order' },
  { key: 'customerName', label: 'Customer' },
  { key: 'total', label: 'Total (Rp)' },
  { key: 'downPayment', label: 'Uang Muka (Rp)' },
  { key: 'remaining', label: 'Sisa (Rp)' },
  { key: 'status', label: 'Status' },
];

// Flatten orders with customer names
const rows = computed(() => {
  return orderStore.orders.map((o) => {
    const cust = customerStore.customers.find((c) => c.id === o.customerId);
    return {
      ...o,
      customerName: cust?.name || '',
      total: o.total.toLocaleString('id-ID'),
      downPayment: o.downPayment.toLocaleString('id-ID'),
      remaining: o.remaining.toLocaleString('id-ID'),
    };
  });
});

// Simple CSV export.  Generates a CSV string and triggers a file download.
function exportCsv() {
  const header = columns.map((c) => c.label).join(',');
  const csvRows = rows.value.map((r) => {
    return [r.orderNo, r.customerName, r.total, r.downPayment, r.remaining, r.status].join(',');
  });
  const csvContent = [header, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'keuangan.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

