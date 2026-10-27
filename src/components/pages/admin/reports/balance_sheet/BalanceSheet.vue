<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Balance Sheet Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4">
        <h2 class="text-md font-medium text-gray-700 dark:text-gray-300">Balance Sheet Statement</h2>
      </div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Company filter -->
        <div class="flex flex-col relative w-full sm:w-64"> 
          <SearchSelect v-model="filters.company_id" :options="companies" label="Company" :selected-item="selectedCompany"
            placeholder="-- Select Company --" :error="null" required class="mt-2" />
        </div>

        <!-- Branch filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.branch_id" :options="branches" :disabled="!filters.company_id" label="Branch"
            placeholder="-- Select Branch --" :error="null" class="mt-2" /> 
        </div>

        <!-- As of Date -->
        <div class="flex flex-col relative w-full sm:w-64">
          <label for="asOfDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">As of Date</label>
          <input v-model="filters.as_of" type="date" id="asOfDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
        </div>

        <!-- Search Input -->
        <!-- <div class="relative w-full sm:w-64">
          <input v-model="filters.search" @keyup.enter="applyFilters" type="search"
            placeholder="Search by account name, code..." class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             outline-none transition-all duration-150 shadow-sm" />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div> -->

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
        <p class="text-gray-600 dark:text-gray-400">Loading balance sheet data...</p>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" class="text-center py-12">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
        <i class="fas fa-balance-scale text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No balance sheet data found</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ hasActiveFilters ? 'No entries match your filter criteria. Try adjusting your filters.' : 'Apply filters above to view balance sheet statement.' }}
      </p>
      <button v-if="hasActiveFilters" @click="resetFilters" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
        <i class="fas fa-undo mr-1"></i> Clear filters
      </button>
    </div>

    <!-- Balance Sheet Tables -->
    <div v-else class="space-y-6">
      <!-- Assets Table -->
      <div v-if="reportData.asset_accounts" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Assets
            </h3>
            <span class="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Assets: {{ formatCurrency(reportData.total_assets) }}
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
            <tbody v-if="reportData.asset_accounts.length > 0" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="account in reportData.asset_accounts" :key="account.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.code }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.name }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 text-right font-medium">
                  {{ formatCurrency(account.balance) }}
                </td>
              </tr>
            </tbody>
            <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td colspan="3" class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                  No asset accounts found.
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-blue-50 dark:bg-blue-900/20 font-semibold">
              <tr>
                <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                  <span class="font-medium">Total Assets:</span>
                </td>
                <td class="px-6 py-3 text-sm text-blue-600 dark:text-blue-400 text-right">
                  {{ formatCurrency(reportData.total_assets) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Liabilities Table -->
      <div v-if="reportData.liability_accounts" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
              Liabilities
            </h3>
            <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Total Liabilities: {{ formatCurrency(reportData.total_liabilities) }}
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
            <tbody v-if="reportData.liability_accounts.length > 0" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
             
              <tr v-for="account in reportData.liability_accounts" :key="account.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.code }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.name }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 text-right font-medium">
                  {{ formatCurrency(account.balance) }}
                </td>
              </tr>
            </tbody>
            <tbody v-if="reportData.liability_accounts.length === 0" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td colspan="3" class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                  No liability accounts found.
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-yellow-50 dark:bg-yellow-900/20 font-semibold">
              <tr>
                <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                  <span class="font-medium">Total Liabilities:</span>
                </td>
                <td class="px-6 py-3 text-sm text-yellow-600 dark:text-yellow-400 text-right">
                  {{ formatCurrency(reportData.total_liabilities) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Equity Table -->
      <div v-if="reportData.equity_accounts" class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-400">
              Equity
            </h3>
            <span class="text-sm font-medium text-purple-700 dark:text-purple-400">
              Total Equity: {{ formatCurrency(reportData.total_equity) }}
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
            <tbody v-if="reportData.equity_accounts.length > 0"  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Regular Equity Accounts -->
              <tr v-for="account in reportData.equity_accounts" :key="account.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.code }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ account.name }}</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400 text-right font-medium">
                  {{ formatCurrency(account.balance) }}
                </td>
              </tr>
              
              <!-- Period Profit/Loss -->
              <tr v-if="reportData.period_profit_loss !== 0" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">--</td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Retained Earnings / Current Period Profit/Loss
                </td>
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-right font-medium"
                    :class="getProfitLossClass(reportData.period_profit_loss)">
                  {{ formatCurrency(reportData.period_profit_loss) }}
                </td>
              </tr>
            </tbody>
            <tbody v-if="reportData.equity_accounts.length === 0" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td colspan="3" class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                  No equity accounts found.
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-purple-50 dark:bg-purple-900/20 font-semibold">
              <tr>
                <td colspan="2" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                  <span class="font-medium">Total Equity:</span>
                </td>
                <td class="px-6 py-3 text-sm text-purple-600 dark:text-purple-400 text-right">
                  {{ formatCurrency(reportData.total_equity) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


       

      <!-- Summary Section with Accounting Equation -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Accounting Equation</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
           
            <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Liabilities</p>
              <p class="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{{ formatCurrency(reportData.total_liabilities) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Equity</p>
              <p class="text-lg font-semibold text-purple-600 dark:text-purple-400">{{ formatCurrency(reportData.total_equity) }}</p>
            </div>
          

          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Assets</p>
            <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">{{ formatCurrency(reportData.total_assets) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">=</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Liabilities + Equity</p>
            <p class="text-lg font-semibold" :class="getLiabilityEquityClass(reportData.total_liabilities_and_equity)">
              {{ formatCurrency(reportData.total_liabilities_and_equity) }}
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p v-if="reportData.total_assets !== reportData.total_liabilities_and_equity" class="text-md text-red-500 dark:text-red-400 mb-1">Not Balanced</p>
            <p v-else class="text-md text-green-500 dark:text-green-400 mb-1">Balanced</p>
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
  asset_accounts: [],
  liability_accounts: [],
  equity_accounts: [],
  total_assets: 0,
  total_liabilities: 0,
  total_equity: 0,
  period_profit_loss: 0,
  total_liabilities_and_equity: 0,
  company_name: '',
  current_date: '',
  date_range: ''
});

// Filters
const filters = reactive({
  company_id: '',
  branch_id: '',
  as_of: '',
  search: ''
});

const hasActiveFilters = computed(() => {
  return filters.company_id || filters.branch_id || filters.as_of || filters.search;
});

const hasData = computed(() => {
  return reportData.value.asset_accounts?.length > 0 || 
         reportData.value.liability_accounts?.length > 0 || 
         reportData.value.equity_accounts?.length > 0 ||
         reportData.value.period_profit_loss !== 0;
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
  // Set default as of date to today
  const today = new Date();
  filters.as_of = today.toISOString().split('T')[0];
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
      as_of: filters.as_of,
      company_id: filters.company_id
    };
    
    if (filters.branch_id) params.branch_id = filters.branch_id;
    if (filters.search) params.search = filters.search;

    const response = await axiosClient.get('/balance-sheets/report', { params });
    
    if (response.data?.success && response.data?.data?.data) {
      reportData.value = response.data.data.data;
    } else {
      resetData();
    }
  } catch (error) {
    console.error('Error applying filters:', error);
    toast.error('Failed to fetch balance sheet data');
    resetData();
  } finally {
    loading.value = false;
  }
};

const resetData = () => {
  reportData.value = {
    asset_accounts: [],
    liability_accounts: [],
    equity_accounts: [],
    total_assets: 0,
    total_liabilities: 0,
    total_equity: 0,
    period_profit_loss: 0,
    total_liabilities_and_equity: 0,
    company_name: '',
    current_date: '',
    date_range: ''
  };
};

const resetFilters = async () => {
  filters.company_id = '';
  filters.branch_id = '';
  filters.as_of = '';
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
      as_of: filters.as_of,
      company_id: filters.company_id,
      export: 'pdf'
    });
    
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosClient.get(`/balance-sheets/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `balance-sheet-${new Date().toISOString().split('T')[0]}.pdf`);
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
      as_of: filters.as_of,
      company_id: filters.company_id,
      export: 'excel'
    });
    
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosClient.get(`/balance-sheets/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `balance-sheet-${new Date().toISOString().split('T')[0]}.xlsx`);
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

const getProfitLossClass = (value) => {
  const numValue = parseFloat(value) || 0;
  return numValue >= 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
};

const getLiabilityEquityClass = (value) => {
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