<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Laporan</h2>
    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="block text-sm mb-1">Periode Awal</label>
        <input type="date" v-model="filters.start" class="border border-gray-300 rounded-md px-3 py-2 w-full" />
      </div>
      <div>
        <label class="block text-sm mb-1">Periode Akhir</label>
        <input type="date" v-model="filters.end" class="border border-gray-300 rounded-md px-3 py-2 w-full" />
      </div>
      <div>
        <label class="block text-sm mb-1">Status</label>
        <select v-model="filters.status" class="border border-gray-300 rounded-md px-3 py-2 w-full">
          <option value="">Semua</option>
          <option value="draft">Draft</option>
          <option value="awaiting_review">Menunggu Kaji Ulang</option>
          <option value="awaiting_payment">Menunggu Pembayaran</option>
          <option value="payment_submitted">Bukti Pembayaran Dikirim</option>
          <option value="payment_approved">Pembayaran Disetujui</option>
          <option value="testing">Dalam Uji</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>
    <!-- Export button -->
    <div class="mb-4 flex justify-end">
      <button class="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm" @click="exportCsv">
        Export CSV
      </button>
    </div>
    <!-- Report table -->
    <EasyDataTable
      :columns="columns"
      :rows="filteredRows"
      :searchable="true"
      :sortable="true"
      :paginated="true"
      :pageSize="10"
    />
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import DataTable from '@/components/common/DataTable.vue';

const orderStore = useKajiUlangStore();
const customerStore = useCustomerStore();

// Define columns for report
// Kolom laporan
const columns = [
  { key: 'orderNo', label: 'No Order' },
  { key: 'customerName', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Tanggal' },
  { key: 'total', label: 'Total (Rp)' },
  { key: 'paid', label: 'Dibayar' },
];

// Filters for reporting
// Filter laporan (tanggal/status)
const filters = reactive({ start: '', end: '', status: '' });

// Flatten orders with customer names and computed paid/unpaid
// Normalisasi order -> baris laporan
const rows = computed(() => {
  return orderStore.orders.map((o) => {
    const cust = customerStore.customers.find((c) => c.id === o.customerId);
    return {
      orderNo: o.orderNo,
      customerName: cust?.name || '',
      status: o.status,
      date: o.date,
      total: o.total.toLocaleString('id-ID'),
      paid: o.remaining > 0 ? 'Belum Lunas' : 'Lunas',
    };
  });
});

// Apply filters to rows
// Terapkan filter periode/status
const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const dateOk = (!filters.start || row.date >= filters.start) && (!filters.end || row.date <= filters.end);
    const statusOk = filters.status ? row.status === filters.status : true;
    return dateOk && statusOk;
  });
});

// Export CSV sederhana dari filteredRows
function exportCsv() {
  const header = columns.map((c) => c.label).join(',');
  const csvRows = filteredRows.value.map((r) => [r.orderNo, r.customerName, r.status, r.date, r.total, r.paid].join(','));
  const csvContent = [header, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'laporan.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

