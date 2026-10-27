<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Supplier Statement
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters -->
    <div class="flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center mb-4 gap-4">
      <div class="flex flex-col sm:flex-row gap-4"></div>

      <div class="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto items-start sm:items-end">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <!-- Supplier Filter -->
          <div class="flex flex-col relative w-full min-w-[200px]">
            <SearchSelect v-model="filters.supplier_id" :options="suppliers" label="Supplier"
              placeholder="-- Select Supplier --" :error="null" @change="applyFilters" />
          </div>

          <!-- Date From -->
          <div class="flex flex-col relative w-full">
            <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
            <input v-model="filters.date_from" type="date" id="fromDate" @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150 focus:ring-2 focus:ring-gray-500 focus:border-transparent" />
          </div>

          <!-- Date To -->
          <div class="flex flex-col relative w-full">
            <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
            <input v-model="filters.date_to" type="date" id="toDate" @change="applyFilters"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150 focus:ring-2 focus:ring-gray-500 focus:border-transparent" />
          </div>
        </div>

        <div class="flex gap-2"> 
          <button @click="resetFilters" :disabled="loading"
            class="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
            <i class="fas fa-undo mr-2"></i>
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Supplier Summary Cards -->
    <div v-if="supplierData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">Supplier</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">{{ supplierData.supplier_name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ supplierData.company_name }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
            <i class="fas fa-user text-blue-600 dark:text-blue-300"></i>
          </div>
        </div>
      </div>

      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">Opening Balance</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">৳ {{
              formatCurrency(supplierData.opening_balance) }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <i class="fas fa-play text-green-600 dark:text-green-300"></i>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Debit (Purchases)</p>
            <p class="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">৳ {{
              formatCurrency(supplierData.total_debit) }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center">
            <i class="fas fa-arrow-down text-yellow-600 dark:text-yellow-300"></i>
          </div>
        </div>
      </div>

      <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Credit (Payments)</p>
            <p class="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">৳ {{
              formatCurrency(supplierData.total_credit) }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
            <i class="fas fa-arrow-up text-red-600 dark:text-red-300"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Closing Balance Card -->
    <div v-if="supplierData" class="mb-6 p-4 rounded-lg border-2"
      :class="supplierData.closing_balance >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Balance</p>
          <p class="text-2xl font-bold"
            :class="supplierData.closing_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            ৳ {{ formatCurrency(supplierData.closing_balance) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ supplierData.date_from ? `From: ${formatDate(supplierData.date_from)}` : 'All Time' }}
            {{ supplierData.date_to ? `To: ${formatDate(supplierData.date_to)}` : '' }}
          </span>
          <div class="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <i class="fas fa-calculator text-gray-600 dark:text-gray-300 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Buttons -->
    <!-- <div v-if="transactions.length > 0" class="flex justify-end gap-2 mb-4">
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
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                SL
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reference No
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Work Order
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Debit (Purchase)
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Credit (Payment)
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Balance
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>

          <!-- Loading State -->
          <tbody v-if="loading">
            <tr>
              <td colspan="9" class="text-center py-8">
                <div class="flex justify-center items-center">
                  <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
                  <span class="text-gray-500 dark:text-gray-400">Loading transactions...</span>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Empty State -->
          <tbody v-else-if="transactions.length === 0">
            <tr>
              <td colspan="9" class="text-center py-8">
                <div class="flex flex-col items-center">
                  <i class="fas fa-exchange-alt text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                  <p class="text-gray-500 dark:text-gray-400">No transactions found</p>
                  <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {{ filters.supplier_id ? 'No transactions for this supplier' :
                     'Please select a supplier to view transactions' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Data Rows -->
          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(transaction, index) in transactions" :key="transaction.id"
              class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap">
                <span :class="getTransactionBadgeClass(transaction.type)">
                  {{ formatTransactionType(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                #{{ transaction.reference_no }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ transaction.work_order_id || '-' }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-medium">
                {{ transaction.debit > 0 ? '৳ ' + formatCurrency(transaction.debit) : '-' }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-medium">
                {{ transaction.credit > 0 ? '৳ ' + formatCurrency(transaction.credit) : '-' }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-semibold"
                :class="transaction.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                ৳ {{ formatCurrency(transaction.balance) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                {{ transaction.note || '-' }}
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="transactions.length > 0 && supplierData"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <tr>
              <td colspan="5" class="px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span><span class="font-medium">Total Transactions:</span> {{ transactions.length }}</span>
                  <span><span class="font-medium">Supplier:</span> {{ supplierData.supplier_name }}</span>
                </div>
              </td>
              <td class="px-6 py-3 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                ৳ {{ formatCurrency(supplierData.total_debit) }}
              </td>
              <td class="px-6 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                ৳ {{ formatCurrency(supplierData.total_credit) }}
              </td>
              <td class="px-6 py-3 text-right text-sm font-semibold"
                :class="supplierData.closing_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                ৳ {{ formatCurrency(supplierData.closing_balance) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useToast } from "vue-toastification";
import axiosClient from '@/axiosClient';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import { useSupplierStore } from '@/stores/supplierStore.js';

const supplierStore = useSupplierStore();
const suppliers = computed(() => supplierStore.items || []);
const toast = useToast();

// State
const loading = ref(false);
const exporting = ref(false);
const supplierData = ref(null);
const transactions = ref([]);

// Filters
const filters = reactive({
  date_from: '',
  date_to: '',
  supplier_id: ''
});

// Fetch report data
const fetchReport = async () => {
  if (!filters.supplier_id) {
    supplierData.value = null;
    transactions.value = [];
    return;
  }

  loading.value = true;
  try {
    const params = {};
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;

    const response = await axiosClient.get(`suppliers/${filters.supplier_id}/statement`, { params });
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    const data = apiResponse.data;
    supplierData.value = {
      supplier_id: data.supplier_id,
      supplier_name: data.supplier_name,
      company_name: data.company_name,
      date_from: data.date_from,
      date_to: data.date_to,
      opening_balance: data.opening_balance || 0,
      total_debit: data.total_debit || 0,
      total_credit: data.total_credit || 0,
      closing_balance: data.closing_balance || 0
    };

    transactions.value = data.transactions || [];

  } catch (error) {
    console.error('Failed to fetch supplier statement:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch supplier statement');
    supplierData.value = null;
    transactions.value = [];
  } finally {
    loading.value = false;
  }
};

// Apply filters
const applyFilters = async () => {
  await fetchReport();
};

// Reset filters
const resetFilters = async () => {
  filters.date_from = '';
  filters.date_to = '';
  filters.supplier_id = '';
  supplierData.value = null;
  transactions.value = [];
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

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format transaction type
const formatTransactionType = (type) => {
  const typeMap = {
    'purchase': 'Purchase',
    'payment': 'Payment',
    'return': 'Return',
    'refund': 'Refund'
  };
  return typeMap[type] || type || 'N/A';
};

// Get transaction badge class
const getTransactionBadgeClass = (type) => {
  const classes = {
    'purchase': 'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'payment': 'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'return': 'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'refund': 'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  };
  return classes[type] || 'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// Export PDF
const exportPDF = async () => {
  if (!filters.supplier_id) {
    toast.warning('Please select a supplier first');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/suppliers/${filters.supplier_id}/statement?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `supplier-statement-${supplierData.value?.supplier_name || 'export'}-${new Date().toISOString().split('T')[0]}.pdf`);
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

// Export Excel
const exportExcel = async () => {
  if (!filters.supplier_id) {
    toast.warning('Please select a supplier first');
    return;
  }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/suppliers/${filters.supplier_id}/statement?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `supplier-statement-${supplierData.value?.supplier_name || 'export'}-${new Date().toISOString().split('T')[0]}.xlsx`);
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

// Watch for supplier_id changes to auto-fetch
watch(() => filters.supplier_id, (newVal) => {
  if (newVal) {
    fetchReport();
  } else {
    supplierData.value = null;
    transactions.value = [];
  }
});

// Load data on mount
onMounted(async () => {
  await supplierStore.getAll();
  // Optionally load first supplier automatically
  // if (suppliers.value.length > 0) {
  //   filters.supplier_id = suppliers.value[0].id;
  //   await fetchReport();
  // }
});
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

/* Truncate text */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card hover effects */
.rounded-lg {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
}
</style>