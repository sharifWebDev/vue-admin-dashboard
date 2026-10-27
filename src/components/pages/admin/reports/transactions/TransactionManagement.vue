<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">General Ledger
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4">
        <h2 class="text-md font-medium text-gray-700 dark:text-gray-300">Ledger Entries</h2>
      </div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Company filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.company_id" :options="companies" label="Company"
            :selected-item="selectedCompany" placeholder="-- Select Company --" :error="null" required class="mt-2" />
        </div>

        <!-- Chart of Account Filter -->
        <div class="flex flex-col relative w-full sm:w-64"> 
          <SearchSelect  v-model="filters.chart_of_account_id" :options="chartOfAccounts" label="Chart of Account" :disabled="!filters.company_id"
            placeholder="-- Select Account --" :error="null" required class="mt-2" />
        </div>

        <!-- Date Range -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="flex flex-col relative w-full">
            <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
            <input v-model="filters.start_date" type="date" id="fromDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
          </div>
          <div class="flex flex-col relative w-full">
            <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
            <input v-model="filters.end_date" type="date" id="toDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
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
    <div v-if="ledgerStore.items.length > 0" class="flex justify-end gap-2 mb-4">
      <button @click="exportPDF" :disabled="exporting"
        class="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
        <i class="fas fa-file-pdf mr-2"></i>
        Export PDF
      </button>

      <button @click="exportExcel" :disabled="exporting"
        class="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
        <i class="fas fa-file-excel mr-2"></i>
        Export Excel
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-visible">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">

          <SortableTableHeader :columns="tableColumns" :sort-by="ledgerStore.sortBy"
            :sort-direction="ledgerStore.sortDirection" :show-actions-column="false" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="ledgerStore.totalItems"
            :item-name="'ledger entries'" loading-text="Loading ledger entries..."
            loading-subtext="Fetching your ledger data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="ledgerStore.items.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'ledger entries'" empty-icon="fas fa-book"
            empty-title="No ledger entries found" :empty-message="hasActiveFilters
              ? 'No entries match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view ledger entries.'" :show-create-button="false"
            @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in ledgerStore.items" :key="item.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.transaction_no || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.company_name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.branch_name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  item.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    item.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  {{ item.type || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.transaction_date || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(item.opening_balance) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatCurrency(item.debit) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatCurrency(item.credit) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(item.running_balance) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.reference_no || 'N/A' }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                {{ item.description || 'N/A' }}
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="ledgerStore.items.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <tr>
              <td colspan="6" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">Summary:</span>
              </td>
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(summary.opening_balance) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(summary.total_debit) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(summary.total_credit) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(summary.closing_balance) }}
              </td>
              <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <!-- Empty cells for alignment -->
              </td>
            </tr>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="12" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span><span class="font-medium">Opening Balance:</span> {{ formatCurrency(summary.opening_balance)
                    }}</span>
                  <span><span class="font-medium">Total Debit:</span> {{ formatCurrency(summary.total_debit) }}</span>
                  <span><span class="font-medium">Total Credit:</span> {{ formatCurrency(summary.total_credit) }}</span>
                  <span><span class="font-medium">Closing Balance:</span> {{ formatCurrency(summary.closing_balance)
                    }}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="ledgerStore.totalItems > 0" class="mt-6">
      <Pagination :total-items="ledgerStore.totalItems" :per-page="ledgerStore.perPage"
        :current-page="ledgerStore.currentPage" :last-page="ledgerStore.lastPage" :is-loading="loading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore.js';
import { useCompanyStore } from '@/stores/companyStore.js';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';

const selectedCompany = ref(
  localStorage.getItem("user")
    ? Number(JSON.parse(localStorage.getItem("user"))?.company?.id)
    : null
);
// Initialize stores
const ledgerStore = useTransactionStore();
const chartOfAccounts = ref([]);
const companyStore = useCompanyStore();

// State
const loading = ref(false);
const exporting = ref(false);
const companies = ref([]);
const toast = useToast();
const summary = ref({
  total_debit: 0,
  total_credit: 0,
  closing_balance: 0,
  opening_balance: 0
});

const tableColumns = ref([
  {
    "key": "transaction_no",
    "label": "Trans. No",
    "sortable": false,
    "type": "text"
  },
  {
    "key": "company_name",
    "label": "Company",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "branch_name",
    "label": "Branch",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "type",
    "label": "Type",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "transaction_date",
    "label": "Date",
    "sortable": false,
    "type": "date"
  },
  {
    "key": "opening_balance",
    "label": "Opening Balance",
    "sortable": false,
    "type": "number"
  },
  {
    "key": "debit",
    "label": "Debit",
    "sortable": false,
    "type": "number"
  },
  {
    "key": "credit",
    "label": "Credit",
    "sortable": false,
    "type": "number"
  },
  {
    "key": "running_balance",
    "label": "Running Balance",
    "sortable": false,
    "type": "number"
  },
  {
    "key": "reference_no",
    "label": "Reference No.",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "description",
    "label": "Description",
    "sortable": false,
    "type": "string"
  },
]);

// Filters
const filters = reactive({
  company_id: '',
  chart_of_account_id: '',
  start_date: '',
  end_date: '',
  search: ''
});

const hasActiveFilters = computed(() => {
  return filters.company_id || filters.chart_of_account_id || filters.start_date || filters.end_date || filters.search;
});

onMounted(async () => {
  await loadCompanies();
});

const loadCompanies = async () => {
  try {
    await companyStore.getAll();
    companies.value = companyStore.items || [];
  } catch (error) {
    console.error('Error loading companies:', error);
    toast.error('Failed to load companies');
  }
};

const loadChartOfAccounts = async (companyId) => {
  if (!companyId) {
    chartOfAccounts.value = [];
    filters.chart_of_account_id = '';
    return;
  }
  try {
    const response = await axiosClient.get(`/journal-entries/dropdown?company_id=${companyId}`);
    chartOfAccounts.value = response?.data?.data || [];
  } catch (error) {
    chartOfAccounts.value = [];
    toast.error('Failed to load chart of accounts');
  }
};

// Handle company change
const handleCompanyChange = async () => {
  filters.chart_of_account_id = '';

  if (filters.company_id) {
    await loadChartOfAccounts(filters.company_id);
  } else {
    chartOfAccounts.value = [];
  }
};

const applyFilters = async () => {
  if (!filters.chart_of_account_id) {
    toast.error('Please select a chart of account');
    return;
  }

  loading.value = true;
  try {
    const params = {};
    if (filters.company_id) params.company_id = filters.company_id;
    if (filters.chart_of_account_id) params.chart_of_account_id = filters.chart_of_account_id;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.search) params.search = filters.search;

    const response = await ledgerStore.get(params);

    if (response?.data?.summary) {
      summary.value = response.data.summary;
    } else if (response?.summary) {
      summary.value = response.summary;
    } else if (ledgerStore.summary) {
      summary.value = ledgerStore.summary;
    } else {
      calculateSummaryFromItems();
    }
  } catch (error) {
    resetSummary();
  } finally {
    loading.value = false;
  }
};

const calculateSummaryFromItems = () => {
  if (ledgerStore.items.length > 0) {
    const totalDebit = ledgerStore.items.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = ledgerStore.items.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    const lastItem = ledgerStore.items[ledgerStore.items.length - 1];
    const firstItem = ledgerStore.items[0];

    summary.value = {
      total_debit: totalDebit,
      total_credit: totalCredit,
      closing_balance: parseFloat(lastItem?.running_balance) || 0,
      opening_balance: parseFloat(firstItem?.opening_balance) || 0
    };
  } else {
    resetSummary();
  }
};

const resetSummary = () => {
  summary.value = {
    total_debit: 0,
    total_credit: 0,
    closing_balance: 0,
    opening_balance: 0
  };
};

const resetFilters = async () => {
  filters.company_id = '';
  filters.chart_of_account_id = '';
  filters.start_date = '';
  filters.end_date = '';
  filters.search = '';
  chartOfAccounts.value = [];

  if (ledgerStore) {
    if (ledgerStore.items && Array.isArray(ledgerStore.items)) {
      ledgerStore.items.splice(0, ledgerStore.items.length);
    }
    ledgerStore.items = [];
    if (ledgerStore.pagination) {
      ledgerStore.pagination.current_page = 1;
      ledgerStore.pagination.per_page = 10;
      ledgerStore.pagination.total = 0;
      ledgerStore.pagination.last_page = 1;
      ledgerStore.pagination.from = null;
      ledgerStore.pagination.to = null;
    }
    if (ledgerStore.totalItems !== undefined) {
      ledgerStore.totalItems = 0;
    }
  }

  resetSummary();
};

// Export to PDF
const exportPDF = async () => {
  if (!filters.chart_of_account_id) {
    toast.error('Please select a chart of account before exporting');
    return;
  }

  exporting.value = true;
  try {
    // Build query params
    const params = new URLSearchParams();
    if (filters.company_id) params.append('company_id', filters.company_id);
    if (filters.chart_of_account_id) params.append('chart_of_account_id', filters.chart_of_account_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/general-ledgers?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `general-ledger-${new Date().toISOString().split('T')[0]}.pdf`);
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
  if (!filters.chart_of_account_id) {
    toast.error('Please select a chart of account before exporting');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.company_id) params.append('company_id', filters.company_id);
    if (filters.chart_of_account_id) params.append('chart_of_account_id', filters.chart_of_account_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/general-ledgers?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `general-ledger-${new Date().toISOString().split('T')[0]}.xlsx`);
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
  if (ledgerStore.pagination?.from && ledgerStore.pagination.from > 0) {
    return ledgerStore.pagination.from + index;
  }
  return (ledgerStore.pagination?.current_page - 1) * ledgerStore.pagination?.per_page + index + 1;
};

const handlePageChange = async (page) => {
  // Validate that chart_of_account_id is selected
  if (!filters.chart_of_account_id) {
    toast.error('Please select a chart of account first');
    return;
  }

  try {
    loading.value = true;

    // Build params with ALL current filter values
    const params = {
      company_id: filters.company_id || '',
      chart_of_account_id: filters.chart_of_account_id,
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      search: filters.search || ''
    };

    // First update the page in the store
    ledgerStore.pagination.current_page = page;

    // Call get with all filter parameters
    const response = await ledgerStore.get(params);

    // Update summary if available
    if (response?.data?.summary) {
      summary.value = response.data.summary;
    } else if (response?.summary) {
      summary.value = response.summary;
    } else if (ledgerStore.summary) {
      summary.value = ledgerStore.summary;
    } else {
      calculateSummaryFromItems();
    }
  } catch (error) {
    console.error('Error changing page:', error);
    toast.error('Failed to load page');
  } finally {
    loading.value = false;
  }
};

const handlePerPageChange = async (newPerPage) => {
  // Validate that chart_of_account_id is selected
  if (!filters.chart_of_account_id) {
    toast.error('Please select a chart of account first');
    return;
  }

  try {
    loading.value = true;

    // Build params with ALL current filter values
    const params = {
      company_id: filters.company_id || '',
      chart_of_account_id: filters.chart_of_account_id,
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      search: filters.search || ''
    };

    console.log('Per page change params:', params); // Debug log

    // Update per_page and reset to page 1
    ledgerStore.pagination.per_page = newPerPage;
    ledgerStore.pagination.current_page = 1;

    // Call get with all filter parameters
    const response = await ledgerStore.get(params);

    // Update summary if available
    if (response?.data?.summary) {
      summary.value = response.data.summary;
    } else if (response?.summary) {
      summary.value = response.summary;
    } else if (ledgerStore.summary) {
      summary.value = ledgerStore.summary;
    } else {
      calculateSummaryFromItems();
    }
  } catch (error) {
    console.error('Error changing per page:', error);
    toast.error('Failed to update items per page');
  } finally {
    loading.value = false;
  }
};

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '0.00';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

watch(() => filters.company_id, (newCompanyId, oldCompanyId) => {
  if (newCompanyId !== oldCompanyId) {
    handleCompanyChange();
  }
});

watch(() => filters.chart_of_account_id, (newValue, oldValue) => {
  if (newValue !== oldValue && oldValue !== undefined) {
    resetSummary();
  }
});

watch(() => ledgerStore.items, (newItems) => {
  if (newItems.length > 0 && !summary.value.total_debit && !summary.value.total_credit) {
    calculateSummaryFromItems();
  }
}, { deep: true });
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