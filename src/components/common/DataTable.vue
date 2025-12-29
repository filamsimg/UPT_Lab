<template>
  <!-- Tabel generik dengan search/filter optional, sorting, selection, dan slot kolom -->
  <div class="w-full space-y-4 ">
    <div
      v-if="searchable || filterable"
      class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4"
    >
      <div
        v-if="searchable"
        class="relative w-full min-w-[220px] sm:flex-1 sm:min-w-[240px]"
      >
        <MagnifyingGlassIcon
          class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="searchTerm"
          :placeholder="searchPlaceholder"
          type="text"
          class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30 sm:text-base"
        />
      </div>

      <div
        v-if="filterable"
        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
      >
        <label class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 sm:px-3 sm:py-2">
          <CalendarIcon class="h-5 w-5 text-gray-400" />
          <input
            v-model="selectedDate"
            type="date"
            class="min-w-[160px] border-0 p-0 text-sm text-gray-700 outline-none focus:ring-0"
          />
        </label>

        <label class="relative">
          <select
            v-model="selectedStatus"
            class="min-w-[150px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30 sm:px-3 sm:py-2 appearance-none"
          >
            <option
              v-for="option in normalizedStatusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        class="overflow-x-auto dt-body-wrapper"
        :class="getBodyWrapperClasses()"
        :style="getBodyWrapperStyle()"
      >
        <table class="dt-table w-full min-w-full border-separate border-spacing-0 text-left lg:min-w-[720px]">
          <thead :class="getTheadClasses()">
            <tr>
              <th
                v-if="selectable"
                :class="getSelectionHeaderClasses()"
              >
                <input
                  :checked="allFilteredSelected"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                  @change="toggleSelectAll($event.target.checked)"
                />
              </th>
              <th
                v-for="column in columns"
                :key="column.field ?? column.title"
                :class="getHeaderCellClasses(column)"
              >
                <button
                  v-if="isColumnSortable(column)"
                  type="button"
                  class="flex w-full items-center justify-start gap-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 transition focus:outline-none hover:text-primary"
                  @click="toggleSort(column.field)"
                >
                  <span>{{ column.title }}</span>
                  <ChevronUpDownIcon
                    class="h-4 w-4 text-gray-400 transition"
                    :class="{
                      'rotate-180 text-primary': sortConfig.field === column.field && sortConfig.direction === 'desc',
                      'text-primary': sortConfig.field === column.field && sortConfig.direction === 'asc',
                    }"
                  />
                </button>
                <span
                  v-else
                  class="text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {{ column.title }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="!paginatedRows.length"
              class="border-t"
            >
              <td
                :colspan="columns.length + (selectable ? 1 : 0)"
                class="px-4 py-6 text-center text-sm text-gray-500"
              >
                {{ noDataText }}
              </td>
            </tr>
            <tr
              v-for="(row, rowIndex) in paginatedRows"
              :key="getRowKey(row, rowIndex)"
              :class="getRowClasses()"
            >
              <td
                v-if="selectable"
                :class="getSelectionCellClasses()"
              >
                <span
                  v-if="isStackMode"
                  class="text-xs font-medium uppercase text-gray-500 md:hidden"
                >
                  Pilih
                </span>
                <input
                  :checked="isRowSelected(row, rowIndex)"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                  @change="toggleRow($event.target.checked, row, rowIndex)"
                />
              </td>
              <td
                v-for="(column, columnIndex) in columns"
                :key="`${column.field}-${columnIndex}`"
                :class="getCellClasses(column)"
              >
                <span
                  v-if="shouldShowMobileLabel(column)"
                  class="block text-[0.65rem] font-semibold uppercase tracking-widest text-gray-500/90 md:hidden"
                >
                  {{ column.title }}
                </span>
                <template
                  v-if="hasSlot(column.slotName || column.field)"
                >
                  <slot
                    :name="column.slotName || column.field"
                    :row="row"
                    :value="resolveValue(row, column.field)"
                    :index="(currentPage - 1) * effectivePageSize + rowIndex"
                  />
                </template>
                <template v-else>
                  <p
                    v-if="isStackMode"
                    class="text-sm font-medium text-slate-700"
                  >
                    {{ formatCell(resolveValue(row, column.field)) }}
                  </p>
                  <span v-else>
                    {{ formatCell(resolveValue(row, column.field)) }}
                  </span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="showPagination"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-3 py-2 text-sm text-gray-600 sm:px-4 sm:py-3"
      >
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <span>Tampilkan</span>
            <select
              v-model="pageSizeSelection"
              class="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
              <option
                v-for="option in normalizedPageSizeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span>baris</span>
          </label>
          <p class="text-sm text-gray-500">
            Menampilkan
            <span class="font-medium text-gray-700">{{ startEntry }}</span>
            -
            <span class="font-medium text-gray-700">{{ endEntry }}</span>
            dari
            <span class="font-medium text-gray-700">{{ processedRows.length }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === 1 || totalPages === 0"
            @click="currentPage--"
          >
            Sebelumnya
          </button>
          <span class="text-sm text-gray-500">
            Halaman <span class="font-semibold text-gray-700">{{ totalPages ? currentPage : 0 }}</span> dari {{ totalPages }}
          </span>
          <button
            class="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, useSlots } from 'vue';
import {
  CalendarIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100, 'all'],
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchField: {
    type: String,
    default: 'idOrder',
  },
  searchPlaceholder: {
    type: String,
    default: 'Cari berdasarkan order Id Order...',
  },
  filterable: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [
      { value: '', label: 'Semua Status' },
      { value: 'draft', label: 'Draft' },
      { value: 'awaiting_review', label: 'Menunggu Kaji Ulang' },
      { value: 'awaiting_payment', label: 'Menunggu Pembayaran' },
      { value: 'payment_submitted', label: 'Bukti Pembayaran Dikirim' },
      { value: 'payment_rejected', label: 'Bukti Pembayaran Ditolak' },
      { value: 'payment_approved', label: 'Pembayaran Disetujui' },
      { value: 'testing', label: 'Proses Pengujian' },
      { value: 'completed', label: 'Selesai' },
      { value: 'refunded', label: 'Refund' },
      { value: 'cancelled', label: 'Dibatalkan' },
      { value: 'rejected', label: 'Ditolak' },
    ],
  },
  dateField: {
    type: String,
    default: 'entryDate',
  },
  statusField: {
    type: String,
    default: 'status',
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  noDataText: {
    type: String,
    default: 'Data tidak tersedia',
  },
  rowKey: {
    type: String,
    default: '',
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  scrollBodyOnMobile: {
    type: Boolean,
    default: false,
  },
  bodyScrollHeight: {
    type: String,
    default: '65vh',
  },
  bodyWrapperClass: {
    type: [String, Array, Object],
    default: '',
  },
});

const emit = defineEmits(['update:selected']);
const slots = useSlots();

const searchTerm = ref('');
const selectedStatus = ref('');
const selectedDate = ref('');
const currentPage = ref(1);
const sortConfig = ref({ field: null, direction: 'asc' });
const internalPageSize = ref(
  Number.isFinite(props.pageSize) && props.pageSize > 0 ? props.pageSize : 10,
);
const selectedKeySet = ref(new Set());
const isMobile = ref(false);
const isStackMode = computed(() => isMobile.value);

const normalizedStatusOptions = computed(() => {
  if (!props.statusOptions?.length) {
    return [
      { value: '', label: 'Semua Status' },
      { value: 'draft', label: 'Draft' },
      { value: 'awaiting_review', label: 'Menunggu Kaji Ulang' },
      { value: 'awaiting_payment', label: 'Menunggu Pembayaran' },
      { value: 'payment_submitted', label: 'Bukti Pembayaran Dikirim' },
      { value: 'payment_rejected', label: 'Bukti Pembayaran Ditolak' },
      { value: 'payment_approved', label: 'Pembayaran Disetujui' },
      { value: 'testing', label: 'Proses Pengujian' },
      { value: 'completed', label: 'Selesai' },
      { value: 'refunded', label: 'Refund' },
      { value: 'cancelled', label: 'Dibatalkan' },
      { value: 'rejected', label: 'Ditolak' },
    ];
  }
  return props.statusOptions;
});

const normalizedPageSizeOptions = computed(() => {
  const fallback = [10, 25, 50, 100, 'all'];
  const raw =
    props.pageSizeOptions && props.pageSizeOptions.length
      ? props.pageSizeOptions
      : fallback;

  const seen = new Set();
  const options = raw
    .map((option) => {
      if (typeof option === 'object' && option !== null) {
        const rawValue =
          option.value === 'all'
            ? 'all'
            : String(
                Number.isFinite(option.value)
                  ? option.value
                  : option.value ?? option.label ?? '',
              );
        const value = rawValue === 'all' ? 'all' : String(rawValue);
        const label =
          option.label ??
          (value === 'all' ? 'Semua' : String(option.value ?? option.label ?? ''));
        return { value, label };
      }
      if (option === 'all') {
        return { value: 'all', label: 'Semua' };
      }
      const numeric = Number(option);
      const value = Number.isFinite(numeric) && numeric > 0 ? String(numeric) : String(option);
      return { value, label: String(option) };
    })
    .filter((option) => {
      if (option.value == null || option.value === '') return false;
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });

  const currentValue = internalPageSize.value === 'all'
    ? 'all'
    : String(internalPageSize.value);

  if (!options.some((option) => option.value === currentValue)) {
    options.push(
      currentValue === 'all'
        ? { value: 'all', label: 'Semua' }
        : { value: currentValue, label: currentValue },
    );
  }

  return options;
});

function updateIsMobile() {
  if (typeof window === 'undefined') {
    isMobile.value = false;
    return;
  }
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const pageSizeSelection = computed({
  get() {
    return internalPageSize.value === 'all'
      ? 'all'
      : String(internalPageSize.value);
  },
  set(value) {
    if (value === 'all') {
      internalPageSize.value = 'all';
      return;
    }
    const parsed = Number(value);
    internalPageSize.value =
      Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  },
});

const processedRows = computed(() => {
  const rows = props.rows ?? [];
  return rows.filter((row) => {
    const matchesSearch = !props.searchable || !searchTerm.value
      ? true
      : String(resolveValue(row, props.searchField) ?? '')
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase());

    const matchesStatus = !props.filterable || !selectedStatus.value
      ? true
      : resolveValue(row, props.statusField) === selectedStatus.value;

    const matchesDate = !props.filterable || !selectedDate.value
      ? true
      : normalizeDate(resolveValue(row, props.dateField)) === selectedDate.value;

    return matchesSearch && matchesStatus && matchesDate;
  });
});

const sortedRows = computed(() => {
  const { field, direction } = sortConfig.value;
  if (!field) return processedRows.value;
  const sorted = [...processedRows.value].sort((a, b) => {
    const aValue = resolveValue(a, field);
    const bValue = resolveValue(b, field);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? -1 : 1;
    if (bValue == null) return direction === 'asc' ? 1 : -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    if (aString < bString) return direction === 'asc' ? -1 : 1;
    if (aString > bString) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
});

const effectivePageSize = computed(() => {
  if (!props.showPagination) {
    if (internalPageSize.value === 'all') {
      return sortedRows.value.length || 1;
    }
    return Number.isFinite(internalPageSize.value)
      ? Math.max(1, internalPageSize.value)
      : Math.max(1, props.pageSize || 10);
  }

  if (internalPageSize.value === 'all') {
    return sortedRows.value.length || 1;
  }
  return Math.max(
    1,
    Number.isFinite(internalPageSize.value) && internalPageSize.value > 0
      ? internalPageSize.value
      : props.pageSize || 10,
  );
});

const totalPages = computed(() => {
  if (!props.showPagination) {
    return sortedRows.value.length ? 1 : 0;
  }
  const total = sortedRows.value.length;
  if (!total) return 0;
  if (internalPageSize.value === 'all') return 1;
  return Math.max(1, Math.ceil(total / effectivePageSize.value));
});

const paginatedRows = computed(() => {
  if (!props.showPagination) return sortedRows.value;
  if (internalPageSize.value === 'all') return sortedRows.value;
  const start = (currentPage.value - 1) * effectivePageSize.value;
  return sortedRows.value.slice(start, start + effectivePageSize.value);
});

const startEntry = computed(() => {
  if (!sortedRows.value.length) return 0;
  return (currentPage.value - 1) * effectivePageSize.value + 1;
});

const endEntry = computed(() => {
  const end = currentPage.value * effectivePageSize.value;
  return Math.min(end, sortedRows.value.length);
});

watch([searchTerm, selectedStatus, selectedDate, () => internalPageSize.value], () => {
  currentPage.value = 1;
});

watch(totalPages, (value) => {
  if (!value) {
    currentPage.value = 1;
    return;
  }
  if (currentPage.value > value) {
    currentPage.value = value;
  }
});

watch(
  () => props.pageSize,
  (value) => {
    if (!Number.isFinite(value) || value <= 0) return;
    if (internalPageSize.value === 'all') return;
    internalPageSize.value = value;
  },
);

watch(
  () => props.rows,
  () => {
    const validKeys = new Set(
      (props.rows ?? []).map((row, index) => getRowKey(row, index)),
    );
    const next = new Set(
      [...selectedKeySet.value].filter((key) => validKeys.has(key)),
    );
    if (next.size !== selectedKeySet.value.size) {
      selectedKeySet.value = next;
    }
  },
  { deep: true },
);

const selectedRows = computed(() =>
  (props.rows ?? []).filter((row) => selectedKeySet.value.has(getRowKey(row))),
);

watch(
  selectedRows,
  (rows) => {
    if (props.selectable) {
      emit('update:selected', rows);
    }
  },
  { deep: true },
);

const allFilteredKeys = computed(() =>
  processedRows.value.map((row, index) => getRowKey(row, index)),
);

const allFilteredSelected = computed(
  () =>
    allFilteredKeys.value.length > 0 &&
    allFilteredKeys.value.every((key) => selectedKeySet.value.has(key)),
);

function toggleSort(field) {
  if (!field) return;
  if (sortConfig.value.field === field) {
    sortConfig.value = {
      field,
      direction: sortConfig.value.direction === 'asc' ? 'desc' : 'asc',
    };
  } else {
    sortConfig.value = { field, direction: 'asc' };
  }
}

function toggleSelectAll(checked) {
  if (!props.selectable) return;
  if (!checked) {
    selectedKeySet.value = new Set();
    return;
  }
  selectedKeySet.value = new Set(allFilteredKeys.value);
}

function toggleRow(checked, row, rowIndex) {
  const key = getRowKey(row, rowIndex);
  const next = new Set(selectedKeySet.value);
  if (checked) next.add(key);
  else next.delete(key);
  selectedKeySet.value = next;
}

function isRowSelected(row, rowIndex) {
  return selectedKeySet.value.has(getRowKey(row, rowIndex));
}

function getRowKey(row, index) {
  if (props.rowKey && row?.[props.rowKey] != null) {
    return row[props.rowKey];
  }
  if (row?.idOrder != null) return row.idOrder;
  if (row?.id != null) return row.id;
  if (row?.code != null) return row.code;
  if (row?.index != null) return row.index;
  const originalIndex = (props.rows ?? []).indexOf(row);
  if (originalIndex !== -1) return originalIndex;
  return index ?? originalIndex ?? 0;
}

function resolveValue(row, field) {
  if (!field) return null;
  return field.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), row);
}

function normalizeDate(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    return value.length > 10 ? value.slice(0, 10) : value;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return '';
}

function formatCell(value) {
  if (value == null || value === '') return '-';
  if (value instanceof Date) {
    return value.toLocaleDateString('id-ID');
  }
  return value;
}

function hasSlot(name) {
  if (!name) return false;
  return Boolean(slots[name]);
}

function isColumnSortable(column) {
  if (!column || !column.field) return false;
  if (Object.prototype.hasOwnProperty.call(column, 'sortable')) {
    return column.sortable !== false;
  }
  if (Object.prototype.hasOwnProperty.call(column, 'isSortable')) {
    return column.isSortable !== false;
  }
  return true;
}

function getCellClasses(column) {
  const baseClasses = ['dt-cell'];
  if (isStackMode.value) {
    baseClasses.push(
      'block',
      'w-full',
      'space-y-1.5',
      'rounded-xl',
      'bg-white/80',
      'px-3',
      'py-2.5',
      'shadow-sm',
      'ring-1',
      'ring-gray-100',
      'md:w-auto',
      'md:space-y-0',
      'md:rounded-none',
      'md:bg-transparent',
      'md:px-4',
      'md:py-3',
      'md:shadow-none',
      'md:ring-0',
      'whitespace-normal',
      'break-words',
    );
  } else {
    baseClasses.push(
      'px-3',
      'py-2',
      'border-b',
      'border-gray-100',
      'align-middle',
      'md:px-4',
      'md:py-3',
      'table-cell',
    );
  }
  if (column?.className) {
    baseClasses.push(column.className);
  }
  return baseClasses;
}

function shouldShowMobileLabel(column) {
  if (!isStackMode.value) return false;
  if (!column?.title) return false;
  if (column?.showMobileLabel === false) return false;
  if (column?.className?.includes('hidden')) return false;
  return true;
}

function getRowClasses() {
  const classes = [
    'border-b border-gray-100 text-sm text-gray-700 transition md:border-0 md:hover:bg-gray-50',
  ];
  if (isStackMode.value) {
    classes.unshift('block space-y-2 rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/80 p-4 shadow-[0_6px_20px_rgba(15,23,42,0.08)] mb-4');
    classes.push('md:table-row md:space-y-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:mb-0');
  } else {
    classes.unshift('table-row');
  }
  return classes;
}

function getSelectionCellClasses() {
  if (isStackMode.value) {
    return [
      'flex',
      'items-center',
      'justify-between',
      'gap-3',
      'w-full',
      'px-3',
      'py-2',
      'rounded-xl',
      'border',
      'border-gray-100',
      'bg-white',
      'md:table-cell',
      'md:w-12',
      'md:max-w-[48px]',
      'md:min-w-[32px]',
      'md:px-3',
      'md:py-3',
      'md:rounded-none',
      'md:border-0',
      'md:bg-transparent',
    ];
  }
  return [
    'table-cell',
    'align-middle',
    'text-center',
    'px-2',
    'py-2',
    'md:px-3',
    'md:py-3',
    'w-12',
    'max-w-[48px]',
    'min-w-[32px]',
  ];
}

function getTheadClasses() {
  const classes = ['bg-gray-50 bg-muted text-xs uppercase tracking-wide text-gray-500'];
  if (isStackMode.value) {
    classes.unshift('hidden');
    classes.push('md:table-header-group');
  } else {
    classes.unshift('table-header-group');
  }
  return classes;
}

function getHeaderCellClasses(column) {
  const classes = ['dt-header-cell', 'px-3 py-2 font-semibold text-left md:px-4 md:py-3'];
  if (isStackMode.value) {
    classes.unshift('hidden');
    classes.push('md:table-cell');
  } else {
    classes.unshift('table-cell');
  }
  if (column?.className) {
    classes.push(column.className);
  }
  return classes;
}

function getSelectionHeaderClasses() {
  const classes = [
    'dt-header-cell',
    'bg-gray-100 px-2 py-2 text-center md:px-3 md:py-3 w-12 max-w-[48px] min-w-[32px]',
  ];
  if (isStackMode.value) {
    classes.unshift('hidden');
    classes.push('md:table-cell');
  } else {
    classes.unshift('table-cell');
  }
  return classes;
}

function getBodyWrapperClasses() {
  const classes = [];
  if (props.scrollBodyOnMobile) {
    classes.push('dt-body-scroll');
  }
  if (props.bodyWrapperClass) {
    classes.push(props.bodyWrapperClass);
  }
  return classes;
}

function getBodyWrapperStyle() {
  if (!props.scrollBodyOnMobile) return null;
  return {
    '--dt-body-max-height': props.bodyScrollHeight,
  };
}
</script>

<style scoped>
.dt-body-wrapper {
  --dt-body-max-height: none;
}

.dt-body-scroll {
  overflow-y: auto;
  max-height: var(--dt-body-max-height);
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
  .dt-body-scroll {
    max-height: none;
    overflow-y: visible;
  }
}

.dt-table {
  table-layout: fixed;
  width: 100%;
}

.dt-cell,
.dt-header-cell {
  word-break: break-word;
  overflow-wrap: anywhere;
}

td.sticky-col {
  @apply bg-white;
}

th.sticky-col {
  @apply bg-gray-50;
}
</style>
