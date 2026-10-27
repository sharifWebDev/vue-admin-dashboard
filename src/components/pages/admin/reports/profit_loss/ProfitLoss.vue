<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Profit and Loss Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4">
        <h2 class="text-md font-medium text-gray-700 dark:text-gray-300">Profit and Loss Activities</h2>
      </div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Company filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.company_id" :options="companies" label="Company"
            :selected-item="selectedCompany" placeholder="-- Select Company --" :error="null" required class="mt-2" />
        </div>

        <!-- Branch filter -->
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
            placeholder="Search by account name, code..." class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
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

    <!-- Report Header Info -->
    <div v-if="hasData" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ reportData.company_name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ reportData.date_range }}</p>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Generated: {{ reportData.current_date }}
        </div>
      </div>
    </div>

    <!-- Export Buttons - Show only when data exists -->
    <div v-if="hasData" class="flex justify-end gap-2 mb-4">
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

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-gray-600 mb-4"></i>
        <p class="text-gray-600 dark:text-gray-400">Loading profit and loss data...</p>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="text-center py-12">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
        <i class="fas fa-chart-pie text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No profit and loss data found</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ hasActiveFilters ? 'No entries match your filter criteria. Try adjusting your filters.' : 'Apply filters above to view profit and loss statement.' }}
      </p>
      <button v-if="hasActiveFilters" @click="resetFilters" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
        <i class="fas fa-undo mr-1"></i> Clear filters
      </button>
    </div>

    <!-- Profit and Loss Tables -->
    <div v-else class="space-y-6">
      <!-- Income Accounts Table -->
      <div v-if="reportData.income_accounts?.length > 0" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-green-700 dark:text-green-400">
              Income Accounts
            </h3>
            <span class="text-sm font-medium text-green-700 dark:text-green-400">
              Total Revenue: {{ formatCurrency(reportData.total_revenue) }}
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Name</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="account in reportData.income_accounts" :key="account.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.code }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.name }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-right font-medium">
                  {{ formatCurrency(account.balance) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-green-50 dark:bg-green-900/20 font-semibold">
              <tr>
                <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                  <span class="font-medium">Total Income:</span>
                </td>
                <td class="px-6 py-3 text-sm text-green-600 dark:text-green-400 text-right">
                  {{ formatCurrency(reportData.total_revenue) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Expense Accounts Table -->
      <div v-if="reportData.expense_accounts?.length > 0" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-red-700 dark:text-red-400">
              Expense Accounts
            </h3>
            <span class="text-sm font-medium text-red-700 dark:text-red-400">
              Total Expenses: {{ formatCurrency(reportData.total_expenses) }}
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Name</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="account in reportData.expense_accounts" :key="account.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.code }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.name }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right font-medium">
                  {{ formatCurrency(account.balance) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-red-50 dark:bg-red-900/20 font-semibold">
              <tr>
                <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                  <span class="font-medium">Total Expenses:</span>
                </td>
                <td class="px-6 py-3 text-sm text-red-600 dark:text-red-400 text-right">
                  {{ formatCurrency(reportData.total_expenses) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Summary</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
            <p class="text-lg font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(reportData.total_revenue) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
            <p class="text-lg font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(reportData.total_expenses) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Profit / Loss</p>
            <p class="text-lg font-semibold" :class="getNetClass(reportData.net_profit)">
              {{ formatCurrency(reportData.net_profit) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useCompanyStore } from '@/stores/companyStore.js';
import { useBranchStore } from '@/stores/branchStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';

const selectedCompany = ref(
  localStorage.getItem("user")
    ? Number(JSON.parse(localStorage.getItem("user"))?.company?.id)
    : null
);
// Initialize stores
const companyStore = useCompanyStore();
const branchStore = useBranchStore();

// State
const loading = ref(false);
const exporting = ref(false);
const companies = ref([]);
const toast = useToast();
const reportData = ref({
  income_accounts: [],
  expense_accounts: [],
  total_revenue: 0,
  total_expenses: 0,
  net_profit: 0,
  company_name: '',
  current_date: '',
  date_range: ''
});

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

const hasData = computed(() => {
  return reportData.value.income_accounts?.length > 0 || reportData.value.expense_accounts?.length > 0;
});

const branches = computed(() => branchStore.items || []);

// Watch for company changes to load branches
watch(() => filters.company_id, async (newVal) => {
  filters.branch_id = '';
  if (!newVal) {
    branchStore.items = [];
    return;
  }
  await branchStore.getAll({ company_id: newVal });
});

onMounted(async () => {
  await loadCompanies();
  // Set default dates to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  filters.from_date = firstDay.toISOString().split('T')[0];
  filters.to_date = today.toISOString().split('T')[0];
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
    const params = {
      from_date: filters.from_date,
      to_date: filters.to_date,
      company_id: filters.company_id
    };
    
    if (filters.branch_id) params.branch_id = filters.branch_id;
    if (filters.search) params.search = filters.search;

    const response = await axiosClient.get('/profit-loss/report', { params });
    
    if (response.data?.success && response.data?.data?.data) {
      reportData.value = response.data.data.data;
    } else {
      resetData();
    }
  } catch (error) {
    console.error('Error applying filters:', error);
    toast.error('Failed to fetch profit and loss data');
    resetData();
  } finally {
    loading.value = false;
  }
};

const resetData = () => {
  reportData.value = {
    income_accounts: [],
    expense_accounts: [],
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    company_name: '',
    current_date: '',
    date_range: ''
  };
};

const resetFilters = async () => {
  filters.company_id = '';
  filters.branch_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';
  resetData();
};

// Export to PDF
const exportPDF = async () => {
  if (!filters.company_id) {
    toast.error('Please select a company before exporting');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams({
      from_date: filters.from_date,
      to_date: filters.to_date,
      company_id: filters.company_id,
      export: 'pdf'
    });
    
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosClient.get(`/profit-loss/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `profit-loss-${new Date().toISOString().split('T')[0]}.pdf`);
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
    const params = new URLSearchParams({
      from_date: filters.from_date,
      to_date: filters.to_date,
      company_id: filters.company_id,
      export: 'excel'
    });
    
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosClient.get(`/profit-loss/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `profit-loss-${new Date().toISOString().split('T')[0]}.xlsx`);
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

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const getNetClass = (value) => {
  const numValue = parseFloat(value) || 0;
  return numValue >= 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
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