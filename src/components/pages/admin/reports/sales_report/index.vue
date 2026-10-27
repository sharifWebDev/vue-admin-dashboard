<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Sales Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4"></div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Dealer filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.dealer_id" :options="dealers" label="Customer" placeholder="-- Select Customer --"
            :error="null" required class="mt-2" />
        </div>
        <!-- warehouse filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.warehouse_id" :options="warehouses" label="Warehouse"
            placeholder="-- Select Warehouse --" :error="null" required class="mt-2" />
        </div>

        <!-- Date Range -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="flex flex-col relative w-full">
            <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
            <input v-model="filters.from_date" type="date" id="fromDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
          </div>
          <div class="flex flex-col relative w-full">
            <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
            <input v-model="filters.to_date" type="date" id="toDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <input v-model="filters.search" @keyup.enter="applyFilters" type="search"
            placeholder="Search by reference, description..." class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             outline-none transition-all duration-150 shadow-sm" />
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
    <div v-if="reportItems.length > 0" class="flex justify-end gap-2 mb-4">
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
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">

          <SortableTableHeader :columns="tableColumns" :sort-by="saleStore.sortBy"
            :sort-direction="saleStore.sortDirection" :show-actions-column="false" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="reportItems.length"
            :item-name="'sales sales entries'" loading-text="Loading sales sales entries..."
            loading-subtext="Fetching your sales data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="reportItems.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'sales entries'" empty-icon="fas fa-chart-line"
            empty-title="No sales entries found" :empty-message="hasActiveFilters
              ? 'No entries match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view sales entries.'" :show-create-button="false"
            @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in reportItems" :key="item.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.invoice_no || 'N/A'
                  }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Date: {{
                  formatDate(item.invoice_date) }}</p>
              </td>
              <td class="px-6 py-3">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ item.dealer_name || 'Walk-in Customer' }}</p>
              </td>
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                ৳ {{ formatNumber(item.subtotal) }}
              </td>
              <td class="px-6 py-3 text-left text-sm text-green-600 dark:text-green-400">
                ৳ {{ formatNumber(item.discount_amount) }}
              </td>
              <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                ৳ {{ formatNumber(item.vat_amount) }}
              </td>
              <td class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                ৳ {{ formatNumber(item.grand_total) }}
              </td>
              <td class="px-6 py-3 text-left text-sm text-blue-600 dark:text-blue-400">
                ৳ {{ formatNumber(item.paid_amount) }}
              </td>
              <td class="px-6 py-3 text-left text-sm" :class="getDueClass(item.due_amount)">
                ৳ {{ formatNumber(item.due_amount) }}
              </td>
              <td class="px-6 py-3 text-center">
                <span :class="getStatusClass(item.status)">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="reportItems.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">

            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="10" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span><span class="font-medium">Total Invoices:</span> {{ summary.total_invoices }}</span>
                  <span><span class="font-medium">Total Amount:</span> {{ formatCurrency(totalAmount) }}</span>
                  <span><span class="font-medium">From Date:</span> {{ filters.from_date || 'Not specified' }}</span>
                  <span><span class="font-medium">To Date:</span> {{ filters.to_date || 'Not specified' }}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useSaleReportStore } from '@/stores/saleReportStore.js';
import { useDealerStore } from '@/stores/dealerStore';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';

// Initialize stores 
const saleStore = useSaleReportStore();
const dealerStore = useDealerStore();
const warehouseStore = useWarehouseStore();

// State
const loading = ref(false);
const exporting = ref(false);
const reportItems = ref([]);
const summary = reactive({
  total_invoices: 0,
  subtotal: 0,
  discount_amount: 0,
  vat_amount: 0,
  grand_total: 0,
  paid_amount: 0,
  due_amount: 0,
});
const toast = useToast();

// Table columns configuration
const tableColumns = ref([
  {
    "key": "invoice_no",
    "label": "Invoice Info",
    "sortable": true,
    "type": "varchar"
  },
  {
    "key": "dealer_name",
    "label": "Customer",
    "sortable": true,
    "type": "varchar"
  },
  {
    "key": "subtotal",
    "label": "Subtotal",
    "sortable": true,
    "type": "decimal",
    "class": "text-right"
  },
  {
    "key": "total_discount",
    "label": "Discount",
    "sortable": true,
    "type": "decimal"
  },
  {
    "key": "vat_amount",
    "label": "VAT",
    "sortable": true,
    "type": "decimal",
    "class": "text-right"
  },
  {
    "key": "grand_total",
    "label": "Grand Total",
    "sortable": true,
    "type": "decimal",
    "class": "text-right"
  },
  {
    "key": "paid_amount",
    "label": "Paid",
    "sortable": true,
    "type": "decimal",
    "class": "text-right"
  },
  {
    "key": "due_amount",
    "label": "Due",
    "sortable": false,
    "type": "decimal",
    "class": "text-right"
  },
  {
    "key": "payment_status",
    "label": "Status",
    "sortable": true,
    "type": "enum"
  }
]);

// Filters
const filters = reactive({
  dealer_id: '',
  warehouse_id: '',
  from_date: '',
  to_date: '',
  search: ''
});

const hasActiveFilters = computed(() => {
  return filters.dealer_id || filters.warehouse_id || filters.from_date || filters.to_date || filters.search;
});

const totalAmount = computed(() => {
  return summary.grand_total || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.grand_total) || 0), 0);
});

const warehouses = computed(() => warehouseStore.items || []);
const dealers = computed(() => dealerStore.items || []);

const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.dealer_id) params.dealer_id = filters.dealer_id;
    if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    if (saleStore.sortBy) params.sort_by = saleStore.sortBy;
    if (saleStore.sortDirection) params.sort_direction = saleStore.sortDirection;

    const response = await axiosClient.get('/sales-invoices/report', { params });
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    reportItems.value = Array.isArray(apiResponse.data?.data) ? apiResponse.data.data : [];
    const reportSummary = apiResponse.data?.summary || {};
    summary.total_invoices = reportSummary.total_invoices || reportItems.value.length;
    summary.subtotal = reportSummary.subtotal || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    summary.discount_amount = reportSummary.discount_amount || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);
    summary.vat_amount = reportSummary.vat_amount || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.vat_amount) || 0), 0);
    summary.grand_total = reportSummary.grand_total || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.grand_total) || 0), 0);
    summary.paid_amount = reportSummary.paid_amount || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
    summary.due_amount = reportSummary.due_amount || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.due_amount) || 0), 0);
  } catch (error) {
    console.error('Failed to fetch sales report:', error);
    toast.error('Failed to fetch sales report');
  } finally {
    loading.value = false;
  }
};

const sortByColumn = async (column) => {
  if (!column) return;

  if (saleStore.sortBy === column) {
    saleStore.sortDirection = saleStore.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    saleStore.sortBy = column;
    saleStore.sortDirection = 'asc';
  }

  await fetchReport();
};


onMounted(async () => {
  await dealerStore.getAll();
  await warehouseStore.getAll();
  await fetchReport();
});

const applyFilters = async () => {
  await fetchReport();
};

const resetFilters = async () => {
  filters.dealer_id = '';
  filters.warehouse_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';

  reportItems.value = [];
  summary.total_invoices = 0;
  summary.subtotal = 0;
  summary.discount_amount = 0;
  summary.vat_amount = 0;
  summary.grand_total = 0;
  summary.paid_amount = 0;
  summary.due_amount = 0;
  saleStore.sortBy = null;
  saleStore.sortDirection = 'asc';
};

// Export to PDF
const exportPDF = async () => {
  // if (!filters.dealer_id) {
  //   toast.error('Please select a dealer before exporting');
  //   return;
  // }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.dealer_id) params.append('dealer_id', filters.dealer_id);
    if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/sales-invoices/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
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

// Export to Excel
const exportExcel = async () => {
  // if (!filters.dealer_id) {
  //   toast.error('Please select a dealer before exporting');
  //   return;
  // }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.dealer_id) params.append('dealer_id', filters.dealer_id);
    if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/sales-invoices/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
  return index + 1;
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0.00';
  const num = Number(value);
  return Number.isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return date;
};

const formatStatus = (status) => {
  const statusMap = {
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status || 'N/A';
};

const getStatusClass = (status) => {
  const classes = {
    completed: 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'px-2 py-1 text-xs rounded-full inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    cancelled: 'px-2 py-1 text-xs rounded-full inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[status] || 'px-2 py-1 text-xs rounded-full inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const getDueClass = (dueAmount) => {
  if (dueAmount === 0 || dueAmount === '0' || dueAmount === 0.0) return 'text-green-600 dark:text-green-400';
  return 'text-red-600 dark:text-red-400 font-semibold';
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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