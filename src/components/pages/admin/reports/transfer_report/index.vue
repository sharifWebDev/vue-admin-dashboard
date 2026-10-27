<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Transfer Report</h1>
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

        <!-- From Location Filter -->
        <div>
          <SearchSelect v-model="filters.from_location_id" :options="warehouseFromOptions" label="From Location"
            placeholder="-- All From Locations --" :clearable="true" />
        </div>

        <!-- To Location Filter -->
        <div>
          <SearchSelect v-model="filters.to_location_id" :options="warehouseToOptions" label="To Location"
            placeholder="-- All To Locations --" :clearable="true" />
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
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">

          <SortableTableHeader :columns="tableColumns" :sort-by="sortBy" :sort-direction="sortDirection"
            :show-actions-column="false" :show-sl-column="true" @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="loading" :is-loading="true" :total-items="reportItems.length"
            :item-name="'transfer entries'" loading-text="Loading transfer entries..."
            loading-subtext="Fetching your transfer data" />

          <!-- Empty/Initial State -->
          <TableLoadingState v-else-if="reportItems.length === 0" :is-loading="false" :isEmpty="true"
            :has-search="hasActiveFilters" :item-name="'transfer entries'" empty-icon="fas fa-chart-line"
            empty-title="No transfer entries found" :empty-message="hasActiveFilters
              ? 'No entries match your filter criteria. Try adjusting your filters.'
              : 'Apply filters above to view transfer entries.'" :show-create-button="false"
            @clear-search="resetFilters" />

          <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(item, index) in reportItems" :key="item.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <p class="font-medium">{{ item.reference_no || 'N/A' }}</p>
                <p class="text-xs text-gray-400 mt-1">Movement Date: {{ item.movement_date || 'N/A' }}
                </p>
              </td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                <p>{{ item.from_location_name || 'N/A' }}</p>
                <p class="text-xs text-gray-400 capitalize">Type: {{ item.from_location_type || 'N/A' }}
                </p>
              </td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                <p>{{ item.to_location_name || 'N/A' }}</p>
                <p class="text-xs text-gray-400 capitalize">Type: {{ item.to_location_type || 'N/A' }}
                </p>
              </td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ getTotalItems(item) }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ getTotalQuantity(item) }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                <span :class="{
                  'px-2 py-1 text-xs rounded-full inline-block': true,
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.status === 'completed',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': item.status === 'pending',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': item.status === 'in_transit',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': item.status === 'cancelled'
                }">
                  {{ formatBadge(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer with Summary -->
          <tfoot v-if="reportItems.length > 0"
            class="bg-gray-50 dark:bg-gray-800 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
            <!-- <tr>
              <td colspan="4" class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">Total Quantity:</span>
              </td>
              <td colspan="3" class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ totalQuantity }}
              </td>
            </tr> -->
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="7" class="px-6 py-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <span><span class="font-medium">Total Records:</span> {{ summary.total_movements }}</span>
                  <span><span class="font-medium">Total Items:</span> {{ summary.total_items }}</span>
                  <span><span class="font-medium">Total Quantity:</span> {{ summary.total_quantity }}</span>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';

const warehouseStore = useWarehouseStore();

// State
const loading = ref(false);
const exporting = ref(false);
const reportItems = ref([]);
const summary = reactive({
  total_movements: 0,
  total_items: 0,
  total_quantity: 0,
});
const toast = useToast();

const tableColumns = ref([
  {
    "key": "reference_no",
    "label": "Reference No.",
    "sortable": true,
    "type": "varchar"
  },
  {
    "key": "from_location_name",
    "label": "From Location",
    "sortable": true,
    "type": "varchar"
  },
  {
    "key": "to_location_name",
    "label": "To Location",
    "sortable": true,
    "type": "varchar"
  },
  {
    "key": "items_count",
    "label": "Items",
    "sortable": false,
    "type": "integer"
  },
  {
    "key": "total_quantity",
    "label": "Total Packages",
    "sortable": false,
    "type": "integer"
  },
  {
    "key": "status",
    "label": "Status",
    "sortable": true,
    "type": "enum"
  }
]);

// Filters
const filters = reactive({
  from_location_id: '',
  to_location_id: '',
  from_date: '',
  to_date: '',
  search: ''
});

const hasActiveFilters = computed(() => {
  return filters.from_location_id || filters.to_location_id || filters.from_date || filters.to_date || filters.search;
});

const totalQuantity = computed(() => {
  return summary.total_quantity || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
});

const sortBy = ref(null);
const sortDirection = ref('asc');

const warehouses = computed(() => warehouseStore.items || []);

const warehouseFromOptions = computed(() => {
  return warehouses.value.filter((warehouse) => String(warehouse.id) !== String(filters.to_location_id));
});

const warehouseToOptions = computed(() => {
  return warehouses.value.filter((warehouse) => String(warehouse.id) !== String(filters.from_location_id));
});

watch(() => filters.from_location_id, (fromLocationId) => {
  if (fromLocationId && String(fromLocationId) === String(filters.to_location_id)) {
    filters.to_location_id = '';
  }
});

watch(() => filters.to_location_id, (toLocationId) => {
  if (toLocationId && String(toLocationId) === String(filters.from_location_id)) {
    filters.from_location_id = '';
  }
});

const handleFilterChange = async () => {
  await fetchReport();
};

onMounted(async () => {
  await warehouseStore.getAll();
  await fetchReport();
});

const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.from_location_id) params.from_location_id = filters.from_location_id;
    if (filters.to_location_id) params.to_location_id = filters.to_location_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    params.from_location_type = 'warehouse';
    params.to_location_type = 'warehouse';
    if (sortBy.value) params.sort_by = sortBy.value;
    if (sortDirection.value) params.sort_direction = sortDirection.value;

    const response = await axiosClient.get('/stock-movements/report', { params });
    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    const reportData = apiResponse.data?.data || [];
    reportItems.value = Array.isArray(reportData) ? reportData : [];

    const reportSummary = apiResponse.data?.summary || {};
    summary.total_movements = reportSummary.total_movements || reportItems.value.length;
    summary.total_items = reportSummary.total_items || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.items_count) || 0), 0);
    summary.total_quantity = reportSummary.total_quantity || reportItems.value.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  } catch (error) {
    console.error('Failed to fetch transfer report:', error);
    toast.error('Failed to fetch transfer report');
  } finally {
    loading.value = false;
  }
};

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

const applyFilters = async () => {
  await fetchReport();
};

const resetFilters = async () => {
  filters.from_location_id = '';
  filters.to_location_id = '';
  filters.from_date = '';
  filters.to_date = '';
  filters.search = '';

  reportItems.value = [];
  summary.total_movements = 0;
  summary.total_items = 0;
  summary.total_quantity = 0;
  sortBy.value = null;
  sortDirection.value = 'asc';
};

// Export to PDF
const exportPDF = async () => {
  // if (!filters.from_location_id || !filters.to_location_id) {
  //   toast.error('Please select both from and to locations before exporting');
  //   return;
  // }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.from_location_id) params.append('from_location_id', filters.from_location_id);
    if (filters.to_location_id) params.append('to_location_id', filters.to_location_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('from_location_type', 'warehouse');
    params.append('to_location_type', 'warehouse');
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/stock-movements/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock-movements-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
  // if (!filters.from_location_id || !filters.to_location_id) {
  //   toast.error('Please select both from and to locations before exporting');
  //   return;
  // }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.from_location_id) params.append('from_location_id', filters.from_location_id);
    if (filters.to_location_id) params.append('to_location_id', filters.to_location_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.search) params.append('search', filters.search);
    params.append('export', 'excel');
    params.append('from_location_type', 'warehouse');
    params.append('to_location_type', 'warehouse');

    const response = await axiosClient.get(`/stock-movements/report?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock-movements-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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

const getTotalItems = (item) => {
  return parseInt(item?.items_count || 0, 10);
};

const getTotalQuantity = (item) => {
  return parseFloat(item?.quantity || 0) || 0;
};

const formatBadge = (text) => {
  if (!text) return 'N/A';
  return String(text)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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