<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Payment Summary Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
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
          <input v-model="filters.search" type="search" placeholder="Search by reference, description..." class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
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
    <div class="space-y-6">
      <div class="overflow-x-auto bg-white dark:bg-gray-700 rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

          <SortableTableHeader :columns="tableColumns" :sort-by="sortBy" :sort-direction="sortDirection"
            :show-actions-column="false" :show-sl-column="true" @sort="sortByColumn" />

          <!-- Loading State -->

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="reportItems.length"
            :item-name="'payment summary reports'" loading-text="Loading payment summary report..."
            loading-subtext="Fetching payment summary details" :colspan="7" />

          <!-- Empty State -->
          <TableLoadingState v-else-if="reportItems.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'payment summary reports'" empty-icon="fas fa-chart-line"
            empty-title="No payment summary records found" :empty-message="hasActiveFilters
              ? 'No payment summary records match your filter criteria. Try adjusting filters.'
              : 'Apply filters above to view payment summary reports.'" :show-create-button="false"
            @clear-search="resetFilters" :colspan="7" />

          <template v-else v-for="(dealer, dealerIndex) in reportItems" :key="dealer.dealer_id || dealerIndex">
            <!-- Dealer Header Row -->
            <tr class="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <td colspan="7" class="px-6 py-4">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p class="text-base font-semibold text-gray-800 dark:text-white">
                      {{ dealer.dealer_name || 'Unknown Dealer' }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Warehouse: {{ dealer.warehouse_name || 'N/A' }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span><span class="font-medium">Invoices:</span> {{ dealer.total_invoices || 0 }}</span>
                    <span><span class="font-medium">Amount:</span>
                      ৳ {{ formatCurrency(dealer.total_invoice_amount) }}</span>
                    <span><span class="font-medium">Paid:</span> ৳ {{ formatCurrency(dealer.total_paid_amount) }}</span>
                    <span><span class="font-medium">Due:</span> ৳ {{ formatCurrency(dealer.total_due_amount) }}</span>
                  </div>
                </div>
              </td>
            </tr>
            <!-- Invoice Rows -->
            <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(invoice, invoiceIndex) in dealer.invoices" :key="invoice.invoice_no || invoiceIndex"
                class="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <td class="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{{ invoiceIndex + 1 }}</td>
                <td class="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ invoice.invoice_no || 'N/A'
                  }}</td>
                <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(invoice.invoice_date) }}
                </td>
                <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">৳ {{
                  formatNumber(invoice.grand_total) }}</td>
                <td class="px-6 py-3 text-left text-sm text-blue-600 dark:text-blue-400">৳ {{
                  formatNumber(invoice.paid_amount) }}</td>
                <td class="px-6 py-3 text-left text-sm" :class="getDueClass(invoice.due_amount)">৳ {{
                  formatNumber(invoice.due_amount) }}</td>
                <td class="px-6 py-3 text-center text-sm">
                  <span :class="getStatusClass(invoice.status)">{{ formatStatus(invoice.status) }}</span>
                </td>
              </tr>
            </tbody>
          </template>
        </table>
      </div>

      <!-- Summary Section - Only show when data exists -->
      <div v-if="reportItems.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm text-gray-700 dark:text-gray-200">
          <div class="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
            <p class="text-xs uppercase text-gray-500 dark:text-gray-400">Dealers</p>
            <p class="mt-2 text-lg font-semibold">{{ summary.total_dealers }}</p>
          </div>
          <div class="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
            <p class="text-xs uppercase text-gray-500 dark:text-gray-400">Invoices</p>
            <p class="mt-2 text-lg font-semibold">{{ summary.total_invoices }}</p>
          </div>
          <div class="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
            <p class="text-xs uppercase text-gray-500 dark:text-gray-400">Total Amount</p>
            <p class="mt-2 text-lg font-semibold">৳ {{ formatCurrency(summary.total_invoice_amount) }}</p>
          </div>
          <div class="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
            <p class="text-xs uppercase text-gray-500 dark:text-gray-400">Total Due</p>
            <p class="mt-2 text-lg font-semibold">৳ {{ formatCurrency(summary.total_due_amount) }}</p>
          </div>
        </div>
        <div class="mt-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
          <span><span class="font-medium">From:</span> {{ filters.from_date || 'Not specified' }}</span>
          <span><span class="font-medium">To:</span> {{ filters.to_date || 'Not specified' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useDealerStore } from '@/stores/dealerStore';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const dealerStore = useDealerStore();
const warehouseStore = useWarehouseStore();

const loading = ref(false);
const exporting = ref(false);
const reportItems = ref([]);
const summary = reactive({
  total_dealers: 0,
  total_invoices: 0,
  total_invoice_amount: 0,
  total_paid_amount: 0,
  total_due_amount: 0,
});
const toast = useToast();

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

const sortBy = ref(null);
const sortDirection = ref('asc');

const tableColumns = ref([
  {
    key: "invoice_no",
    label: "Invoice No",
    sortable: true,
    type: "varchar"
  },
  {
    key: "invoice_date",
    label: "Date",
    sortable: true,
    type: "date"
  },
  {
    key: "grand_total",
    label: "Amount",
    sortable: true,
    type: "decimal",
    class: "text-right"
  },
  {
    key: "paid_amount",
    label: "Paid",
    sortable: true,
    type: "decimal",
    class: "text-right"
  },
  {
    key: "due_amount",
    label: "Due",
    sortable: true,
    type: "decimal",
    class: "text-right"
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    type: "enum",
    class: "text-center"
  }
]);

const sortByColumn = async (column) => {
  if (!column) return;

  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }

  await fetchReport();
};

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
    if (sortBy.value) params.sort_by = sortBy.value;
    if (sortDirection.value) params.sort_direction = sortDirection.value;

    const response = await axiosClient.get('/dealers/report', { params });
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    reportItems.value = Array.isArray(apiResponse.data?.records) ? apiResponse.data.records : [];
    const reportSummary = apiResponse.data?.summary || {};

    summary.total_dealers = reportSummary.total_dealers || reportItems.value.length;
    summary.total_invoices = reportSummary.total_invoices || reportItems.value.reduce((sum, dealer) => sum + (parseInt(dealer.total_invoices, 10) || 0), 0);
    summary.total_invoice_amount = reportSummary.total_invoice_amount || reportItems.value.reduce((sum, dealer) => sum + (parseFloat(dealer.total_invoice_amount) || 0), 0);
    summary.total_paid_amount = reportSummary.total_paid_amount || reportItems.value.reduce((sum, dealer) => sum + (parseFloat(dealer.total_paid_amount) || 0), 0);
    summary.total_due_amount = reportSummary.total_due_amount || reportItems.value.reduce((sum, dealer) => sum + (parseFloat(dealer.total_due_amount) || 0), 0);
  } catch (error) {
    console.error('Failed to fetch dealers due report:', error);
    toast.error('Failed to fetch dealers due report');
  } finally {
    loading.value = false;
  }
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
  summary.total_dealers = 0;
  summary.total_invoices = 0;
  summary.total_invoice_amount = 0;
  summary.total_paid_amount = 0;
  summary.total_due_amount = 0;
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

    const response = await axiosClient.get(`/dealers/report?${params.toString()}`, {
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

    const response = await axiosClient.get(`/dealers/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dealers-due-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status || 'N/A';
};

const getStatusClass = (status) => {
  const classes = {
    completed: 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paid: 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    partially_paid: 'px-2 py-1 text-xs rounded-full inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
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