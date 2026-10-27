<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Raw Material Inventory Usages Report
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center mb-4 gap-4">
      <div class="flex flex-col sm:flex-row gap-4"></div>

      <div class="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Warehouse filter -->
        <div class="flex flex-col relative w-full sm:w-56">
          <SearchSelect v-model="filters.warehouse_id" :options="warehouses" label="Warehouse"
            placeholder="-- Select Warehouse --" :error="null" required class="mt-2" />
        </div>

        <!-- Date Range -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="flex flex-col relative w-full">
            <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
            <input v-model="filters.from_date" type="date" id="fromDate"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150" />
          </div>
          <div class="flex flex-col relative w-full">
            <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
            <input v-model="filters.to_date" type="date" id="toDate"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150" />
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <input v-model="filters.search" @keyup.enter="applyFilters" type="search"
            placeholder="Search by reference, material..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all duration-150 shadow-sm" />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>

        <!-- Filter Action Buttons -->
        <div class="flex gap-2">
          <button @click="applyFilters" :disabled="loading"
            class="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
            <i class="fas fa-filter mr-2"></i>
            Apply
          </button>

          <button @click="resetFilters" :disabled="loading"
            class="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
            <i class="fas fa-undo mr-2"></i>
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Export Buttons - Show only when data exists -->
    <!-- <div v-if="reportItems.length > 0" class="flex justify-end gap-2 mb-4">
      <button @click="exportPDF" :disabled="exporting"
        class="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
        <i class="fas fa-file-pdf mr-2"></i>
        {{ exporting ? 'Exporting...' : 'Export PDF' }}
      </button>

      <button @click="exportExcel" :disabled="exporting"
        class="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
        <i class="fas fa-file-excel mr-2"></i>
        {{ exporting ? 'Exporting...' : 'Export Excel' }}
      </button>
    </div> -->

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="usageStore.sortBy"
            :sort-direction="usageStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="reportItems.length"
            :item-name="'raw material usages'" loading-text="Loading raw material usages..."
            loading-subtext="Fetching your usage data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="reportItems.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'raw material usages'" empty-icon="fas fa-boxes"
            empty-title="No raw material usages found" :empty-message="hasActiveFilters
                ? 'No entries match your filter criteria. Try adjusting your filters.'
                : 'Apply filters above to view raw material usages.'
              " :show-create-button="false" @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in reportItems" :key="item.reference_no"
              class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <!-- SL -->
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- Reference No + Date -->
              <td class="px-6 py-3 whitespace-nowrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.reference_no || 'N/A' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Date: {{ formatDate(item.usage_date) }}
                </p>
              </td>

              <!-- Warehouse -->
              <td class="px-6 py-3">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ item.warehouse?.name || 'N/A' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ item.warehouse?.code || '' }}
                </p>
              </td>

              <!-- Total Items -->
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                {{ item.total_items || 0 }}
              </td>

              <!-- Total Qty -->
              <td class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatNumber(item.total_qty) }}
              </td>

              <!-- Materials Summary -->
              <td class="px-6 py-3">
                <div v-if="item.usages && item.usages.length">
                  <div v-for="usage in item.usages" :key="usage.id" class="text-sm text-gray-900 dark:text-white">
                    <span class="font-medium">{{ usage.raw_material?.name || 'N/A' }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({{ formatNumber(usage.qty_used) }}
                      {{ usage.raw_material?.measurement_unit?.symbol || '' }})
                    </span>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400">—</span>
              </td>

              <!-- Note -->
              <td class="px-6 py-3 text-left text-sm text-gray-500 dark:text-gray-400">
                {{ item.usages?.[0]?.note || '—' }}
              </td>

              <!-- Created By -->
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                {{ item.usages?.[0]?.creator?.name || 'N/A' }}
              </td>

              <!-- Actions: Per-row Export Invoice (only this row shows exporting state) -->
              <td class="px-6 py-3 text-center whitespace-nowrap">
                <button @click="exportInvoice(item.reference_no)" :disabled="rowExporting === item.reference_no"
                  class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  :title="rowExporting === item.reference_no ? 'Exporting...' : 'Export Invoice PDF'">
                  <i class="fas mr-1" :class="rowExporting === item.reference_no ? 'fa-spinner' : 'fa-file-pdf'"></i>
                  <span>{{ rowExporting === item.reference_no ? 'Exporting...' : 'Export' }}</span>
                </button>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="reportItems.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="9" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span>
                    <span class="font-medium">Total Groups:</span> {{ summary.total_groups }}
                  </span>
                  <span>
                    <span class="font-medium">Total Items:</span> {{ summary.total_items }}
                  </span>
                  <span>
                    <span class="font-medium">Total Qty:</span> {{ formatNumber(summary.total_qty) }}
                  </span>
                  <span>
                    <span class="font-medium">From Date:</span>
                    {{ filters.from_date || 'Not specified' }}
                  </span>
                  <span>
                    <span class="font-medium">To Date:</span>
                    {{ filters.to_date || 'Not specified' }}
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="reportItems.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing
            <span class="font-medium text-gray-900 dark:text-white">{{ showingFrom }}</span>
            to
            <span class="font-medium text-gray-900 dark:text-white">{{ showingTo }}</span>
            of
            <span class="font-medium text-gray-900 dark:text-white">{{ pagination.total }}</span>
            entries
          </span>

          <div class="flex items-center gap-2">
            <label for="perPage" class="text-sm">Per page:</label>
            <select id="perPage" v-model.number="pagination.per_page" @change="changePerPage"
              class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button @click="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1 || loading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-left"></i>
          </button>

          <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :disabled="loading"
            class="px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-50" :class="page === pagination.current_page
                ? 'bg-gray-700 text-white border-gray-700 dark:bg-gray-600 dark:border-gray-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ">
            {{ page }}
          </button>

          <button @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page || loading"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRawMaterialInventoryUsageReportStore } from '@/stores/rawMaterialInventoryUsageReportStore.js';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from 'vue-toastification';
import SearchSelect from '@/components/common/SearchSelect.vue';

// Initialize stores
const usageStore = useRawMaterialInventoryUsageReportStore();
const warehouseStore = useWarehouseStore();

// State
const loading = ref(false);
const exporting = ref(false);
const rowExporting = ref(null); // holds reference_no of the row currently exporting
const reportItems = ref([]);
const summary = reactive({
  total_groups: 0,
  total_items: 0,
  total_qty: 0,
});
const toast = useToast();

// Pagination state
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
});

// Table columns configuration
const tableColumns = ref([
  { key: 'reference_no', label: 'Reference Info', sortable: true, type: 'varchar' },
  { key: 'warehouse', label: 'Warehouse', sortable: true, type: 'varchar' },
  { key: 'total_items', label: 'Items', sortable: true, type: 'number', class: 'text-right' },
  { key: 'total_qty', label: 'Total Qty', sortable: true, type: 'decimal', class: 'text-right' },
  { key: 'materials', label: 'Materials', sortable: false, type: 'varchar' },
  { key: 'note', label: 'Note', sortable: false, type: 'varchar' },
  { key: 'created_by', label: 'Created By', sortable: false, type: 'varchar' },
]);

// Filters
const filters = reactive({
  warehouse_id: '',
  from_date: '',
  to_date: '',
  search: '',
});

const hasActiveFilters = computed(() => {
  return (
    filters.warehouse_id ||
    filters.from_date ||
    filters.to_date ||
    filters.search
  );
});

const warehouses = computed(() => warehouseStore.items || []);

// Pagination computed helpers
const showingFrom = computed(() => {
  if (pagination.total === 0) return 0;
  return (pagination.current_page - 1) * pagination.per_page + 1;
});

const showingTo = computed(() => {
  const to = pagination.current_page * pagination.per_page;
  return to > pagination.total ? pagination.total : to;
});

const visiblePages = computed(() => {
  const total = pagination.last_page;
  const current = pagination.current_page;
  const pages = [];
  const maxVisible = 5;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > total) {
    end = total;
    start = end - maxVisible + 1;
  }

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
    };
    if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    if (usageStore.sortBy) params.sort_by = usageStore.sortBy;
    if (usageStore.sortDirection) params.sort_direction = usageStore.sortDirection;

    const response = await axiosClient.get(
      '/raw-material-inventory/usage/grouped-by-reference',
      { params }
    );
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    reportItems.value = Array.isArray(apiResponse.data?.data)
      ? apiResponse.data.data
      : [];

    const meta = apiResponse.data?.meta || apiResponse.data;
    pagination.current_page = meta?.current_page || 1;
    pagination.last_page = meta?.last_page || 1;
    pagination.per_page = meta?.per_page || pagination.per_page;
    pagination.total = meta?.total || apiResponse.data?.total_groups || reportItems.value.length;

    summary.total_groups = apiResponse.data?.total_groups || pagination.total;
    summary.total_items = apiResponse.data?.total_items || 0;
    summary.total_qty = apiResponse.data?.total_qty || 0;
  } catch (error) {
    console.error('Failed to fetch raw material usages report:', error);
    toast.error('Failed to fetch raw material usages report');
  } finally {
    loading.value = false;
  }
};

const sortByColumn = async (column) => {
  if (!column) return;

  if (usageStore.sortBy === column) {
    usageStore.sortDirection = usageStore.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    usageStore.sortBy = column;
    usageStore.sortDirection = 'asc';
  }

  pagination.current_page = 1;
  await fetchReport();
};

const goToPage = async (page) => {
  if (page < 1 || page > pagination.last_page) return;
  if (page === pagination.current_page) return;
  pagination.current_page = page;
  await fetchReport();
};

const changePerPage = async () => {
  pagination.current_page = 1;
  await fetchReport();
};

onMounted(async () => {
  await fetchReport();
  await warehouseStore.getAll();
});

const applyFilters = async () => {
  pagination.current_page = 1;
  await fetchReport();
};

const resetFilters = async () => {
  filters.warehouse_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';

  reportItems.value = [];
  summary.total_groups = 0;
  summary.total_items = 0;
  summary.total_qty = 0;
  usageStore.sortBy = null;
  usageStore.sortDirection = 'asc';

  pagination.current_page = 1;
  pagination.last_page = 1;
  pagination.total = 0;

  await fetchReport();
};

// ─────────────────────────────────────────────────────────────
// Per-row Export Invoice PDF
// GET /api/v1/raw-material-inventory/usage/{reference_no}/download-pdf
// Only the clicked row shows the "Exporting..." state.
// ─────────────────────────────────────────────────────────────
const exportInvoice = async (referenceNo) => {
  if (!referenceNo) {
    toast.error('Reference number is missing');
    return;
  }
  // Prevent double-click on the same row
  if (rowExporting.value === referenceNo) return;

  rowExporting.value = referenceNo;
  try {
    const response = await axiosClient.get(
      `/raw-material-inventory/usage/${referenceNo}/download-pdf`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `raw-material-usage-${referenceNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(`Invoice ${referenceNo} exported successfully`);
  } catch (error) {
    console.error(`Error exporting invoice ${referenceNo}:`, error);
    toast.error(`Failed to export invoice ${referenceNo}`);
  } finally {
    // Only reset if it's still this row (safety)
    if (rowExporting.value === referenceNo) {
      rowExporting.value = null;
    }
  }
};

// Export All to PDF
const exportPDF = async () => {
  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'pdf');

    const response = await axiosClient.get(
      `/raw-material-inventory/usage/grouped-by-reference?${params.toString()}`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `raw-material-usage-report-${new Date().toISOString().split('T')[0]}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('PDF exported successfully');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Failed to export PDF');
  } finally {
    exporting.value = false;
  }
};

// Export All to Excel
const exportExcel = async () => {
  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'excel');

    const response = await axiosClient.get(
      `/raw-material-inventory/usage/grouped-by-reference?${params.toString()}`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `raw-material-usage-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Excel exported successfully');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    toast.error('Failed to export Excel');
  } finally {
    exporting.value = false;
  }
};

const calculateRowNumber = (index) => {
  return (pagination.current_page - 1) * pagination.per_page + index + 1;
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0.00';
  const num = Number(value);
  return Number.isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

button:disabled {
  cursor: not-allowed;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>