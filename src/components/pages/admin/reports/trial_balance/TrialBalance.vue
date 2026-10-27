<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Trial Balance
          Report</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Title -->
      <div class="flex flex-col sm:flex-row gap-4">
        <h2 class="text-md font-medium text-gray-700 dark:text-gray-300">Account Balances</h2>
      </div>

      <!-- Right Side: Search & Date Filters -->
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Company filter -->
        <div class="flex flex-col relative w-full sm:w-64">
          <SearchSelect v-model="filters.company_id" :options="companies" label="Company"
            :selected-item="selectedCompany" placeholder="-- Select Company --" :error="null" required class="mt-2" />
        </div>

        <!-- Date Range -->
        <!-- As of Date -->
        <div class="flex flex-col relative w-full sm:w-64">
          <label for="asOfDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">As of Date</label>
          <input v-model="filters.as_of_date" type="date" id="asOfDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
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
    <div v-if="items.length > 0" class="flex justify-end gap-2 mb-4">
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

          <SortableTableHeader :columns="tableColumns" :sort-by="sortBy" :sort-direction="sortDirection"
            :show-actions-column="false" :show-sl-column="true" @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="totalItems" :item-name="'accounts'"
            loading-text="Loading trial balance..." loading-subtext="Fetching account balances" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="items.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'accounts'" empty-icon="fas fa-balance-scale"
            empty-title="No trial balance data found" :empty-message="hasActiveFilters
              ? 'No accounts match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view trial balance.'" :show-create-button="false"
            @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in items" :key="item.code" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ item.name || 'N/A' }} {{ item.code ? `(${item.code})` : '' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  item.type === 'asset' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    item.type === 'liability' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      item.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          item.type === 'equity' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  {{ item.type || 'N/A' }}
                </span>
              </td>
              <td
                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                {{ formatCurrency(item.debit) }}
              </td>
              <td
                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                {{ formatCurrency(item.credit) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm font-medium"
                :class="[item.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
                {{ formatCurrency(item.balance) }}
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="items.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <tr>
              <td colspan="4" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">Totals:</span>
              </td>
              <td class="px-6 py-3 text-sm text-green-600 dark:text-green-400 font-bold">
                {{ formatCurrency(summary.total_debit) }}
              </td>
              <td class="px-6 py-3 text-sm text-red-600 dark:text-red-400 font-bold">
                {{ formatCurrency(summary.total_credit) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                <!-- Empty cell for alignment -->
              </td>
            </tr>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="7" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span>
                    <span class="font-medium">Trial Balance Status:</span>
                    <span
                      :class="summary.is_balanced ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      {{ summary.is_balanced ? 'Balanced ✓' : 'Not Balanced ✗' }}
                    </span>
                  </span>
                  <span><span class="font-medium">Total Debit:</span> {{ formatCurrency(summary.total_debit) }}</span>
                  <span><span class="font-medium">Total Credit:</span> {{ formatCurrency(summary.total_credit) }}</span>
                  <span><span class="font-medium">Difference:</span>
                    <span :class="getDifferenceClass">
                      {{ formatCurrency(Math.abs(summary.total_debit - summary.total_credit)) }}
                    </span>
                  </span>
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
import { useCompanyStore } from '@/stores/companyStore.js';
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
const items = ref([]);
const companyStore = useCompanyStore();

// State
const loading = ref(false);
const exporting = ref(false);
const companies = ref([]);
const toast = useToast();
const summary = ref({
  total_debit: 0,
  total_credit: 0,
  is_balanced: false
});

const tableColumns = ref([
  {
    "key": "name",
    "label": "Account Name",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "type",
    "label": "Account Type",
    "sortable": false,
    "type": "string"
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
    "key": "balance",
    "label": "Balance",
    "sortable": false,
    "type": "number"
  }
]);

// Filters
const filters = reactive({
  company_id: '',
  as_of_date: '',
  end_date: ''
});

const hasActiveFilters = computed(() => {
  return filters.company_id || filters.as_of_date;
});

const getDifferenceClass = computed(() => {
  const diff = Math.abs(summary.value.total_debit - summary.value.total_credit);
  return diff === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
});

onMounted(async () => {
  await loadCompanies();

  const today = new Date();
  filters.as_of_date = today.toISOString().split('T')[0];
});

const loadCompanies = async () => {
  await companyStore.getAll();
  companies.value = companyStore.items || [];
};

const applyFilters = async () => {
  if (!filters.company_id) {
    toast.error('Please select a company');
    return;
  }

  loading.value = true;

  try {
    const response = await axiosClient.get('/trial-balances', {
      params: filters
    });

    items.value = response?.data?.data?.data || [];

    summary.value = response?.data?.data?.summary || {
      total_debit: 0,
      total_credit: 0,
      is_balanced: false
    };

  } catch (error) {
    resetSummary();
    toast.error('Failed to load trial balance data');
  } finally {
    loading.value = false;
  }
};

const resetSummary = () => {
  summary.value = {
    total_debit: 0,
    total_credit: 0,
    is_balanced: false
  };
};

const resetFilters = () => {
  filters.company_id = '';
  filters.as_of_date = '';
  filters.end_date = '';
  items.value = [];
  resetSummary();
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
    if (filters.as_of_date) params.append('as_of_date', filters.as_of_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/trial-balances?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trial-balance-${new Date().toISOString().split('T')[0]}.pdf`);
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
    if (filters.as_of_date) params.append('as_of_date', filters.as_of_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/trial-balances?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trial-balance-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Excel exported successfully');
  } catch (error) {
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

const sortByColumn = (column) => {
  if (!column.sortable) return;

  if (sortBy.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column.key;
    sortDirection.value = 'asc';
  }

  items.value.sort((a, b) => {
    const aVal = a[column.key];
    const bVal = b[column.key];

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
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