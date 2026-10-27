<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Expense
          Statement Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4">
        <h2 class="text-md font-medium text-gray-700 dark:text-gray-300">Expense Entries</h2>
      </div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Company filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.company_id" :options="companies" label="Company"
            :selected-item="selectedCompany" placeholder="-- Select Company --" :error="null" required class="mt-2" />
        </div>


        <!-- branch filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.branch_id" :options="branches" :disabled="!filters.company_id" label="Branch"
            placeholder="-- Select Branch --" :error="null" class="mt-2" /> 
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
    <div v-if="expenseStore.items.length > 0" class="flex justify-end gap-2 mb-4">
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

          <SortableTableHeader :columns="tableColumns" :sort-by="expenseStore.sortBy"
            :sort-direction="expenseStore.sortDirection" :show-actions-column="false" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="expenseStore.totalItems"
            :item-name="'expense entries'" loading-text="Loading expense entries..."
            loading-subtext="Fetching your expense data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="expenseStore.items.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'expense entries'" empty-icon="fas fa-chart-line"
            empty-title="No expense entries found" :empty-message="hasActiveFilters
              ? 'No entries match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view expense entries.'" :show-create-button="false"
            @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in expenseStore.items" :key="item.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.company_name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.branch_name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.expense_date || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.chart_of_account?.code || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.chart_of_account?.name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.cash_bank_account?.name || 'N/A' }}
              </td>
              <td
                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                {{ formatCurrency(item.amount) }}
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
          <tfoot v-if="expenseStore.items.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <tr>
              <td colspan="7" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">Total Expense:</span>
              </td>
              <td class="px-6 py-3 text-sm text-red-600 dark:text-red-400 font-bold">
                {{ formatCurrency(totalAmount) }}
              </td>
              <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <!-- Empty cells for alignment -->
              </td>
            </tr>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="10" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span><span class="font-medium">Total Records:</span> {{ expenseStore.totalItems }}</span>
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

    <!-- Pagination -->
    <div v-if="expenseStore.totalItems > 0" class="mt-6">
      <Pagination :total-items="expenseStore.totalItems" :per-page="expenseStore.perPage"
        :current-page="expenseStore.currentPage" :last-page="expenseStore.lastPage" :is-loading="loading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useExpenseStatementStore } from '@/stores/expenseStatementStore.js';
import { useCompanyStore } from '@/stores/companyStore.js';
import { useBranchStore } from '@/stores/branchStore.js';
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
const expenseStore = useExpenseStatementStore();
const companyStore = useCompanyStore();
const branchStore = useBranchStore();

// State
const loading = ref(false);
const exporting = ref(false);
const companies = ref([]);
const toast = useToast();

const tableColumns = ref([
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
    "key": "expense_date",
    "label": "Expense Date",
    "sortable": false,
    "type": "date"
  },
  {
    "key": "account_code",
    "label": "Account Code",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "account_name",
    "label": "Account Name",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "cash_bank_account",
    "label": "Cash/Bank Account",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "amount",
    "label": "Amount",
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
  branch_id: '',
  from_date: '',
  to_date: '',
  search: ''
});

const hasActiveFilters = computed(() => {
  return filters.company_id || filters.branch_id || filters.from_date || filters.to_date || filters.search;
});
const branches = computed(() => branchStore.items || []);

const totalAmount = computed(() => {
  if (expenseStore.items.length > 0) {
    return expenseStore.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }
  return 0;
});

watch(() => filters.company_id, async (newVal) => {
  filters.branch_id = '';
  if (!newVal) {
    branchStore.items = [];
    filters.branch_id = '';
    return;
  }
  await branchStore.getAll({ company_id: newVal });
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

const applyFilters = async () => {
  if (!filters.company_id) {
    toast.error('Please select a company');
    return;
  }

  loading.value = true;
  try {
    const params = {};
    if (filters.company_id) params.company_id = filters.company_id;
    if (filters.branch_id) params.branch_id = filters.branch_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;

    await expenseStore.get(params);
  } catch (error) {
    console.error('Error applying filters:', error);
    toast.error('Failed to fetch expense data');
  } finally {
    loading.value = false;
  }
};

const resetFilters = async () => {
  filters.company_id = '';
  filters.branch_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';

  if (expenseStore) {
    if (expenseStore.items && Array.isArray(expenseStore.items)) {
      expenseStore.items.splice(0, expenseStore.items.length);
    }
    expenseStore.items = [];
    if (expenseStore.pagination) {
      expenseStore.pagination.current_page = 1;
      expenseStore.pagination.per_page = 10;
      expenseStore.pagination.total = 0;
      expenseStore.pagination.last_page = 1;
      expenseStore.pagination.from = null;
      expenseStore.pagination.to = null;
    }
    if (expenseStore.totalItems !== undefined) {
      expenseStore.totalItems = 0;
    }
  }
};

// Export to PDF
const exportPDF = async () => {
  if (!filters.company_id) {
    toast.error('Please select a company before exporting');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.company_id) params.append('company_id', filters.company_id);
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/expenses/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
  if (!filters.company_id) {
    toast.error('Please select a company before exporting');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.company_id) params.append('company_id', filters.company_id);
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/expenses/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
  if (expenseStore.pagination?.from && expenseStore.pagination.from > 0) {
    return expenseStore.pagination.from + index;
  }
  return (expenseStore.pagination?.current_page - 1) * expenseStore.pagination?.per_page + index + 1;
};

const handlePerPageChange = async (newPerPage) => {
  await expenseStore.changePerPage(newPerPage);
  if (hasActiveFilters.value && filters.company_id) {
    await applyFilters();
  }
};

const handlePageChange = async (page) => {
  await expenseStore.paginate(page);
  if (hasActiveFilters.value && filters.company_id) {
    await applyFilters();
  }
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