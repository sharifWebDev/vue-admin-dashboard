<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Warehouse Stock
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">

    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">

      <!-- Right Side: Search -->
      <div class="flex items-end gap-3 lg:w-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-end justify-end gap-4">

          <!-- Warehouse Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Warehouse
            </label>
            <SearchSelect v-model="filters.warehouse_id" :options="warehouseOptions" placeholder="All Warehouses"
              :clearable="true" @change="applyFilters" />
          </div>

          <!-- Product Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product
            </label>
            <SearchSelect v-model="filters.product_id" :options="productOptions" placeholder="All Products"
              :clearable="true" @change="applyFilters" />
          </div>

          <!-- Unit Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <SearchSelect v-model="filters.unit_id" :options="unitOptions" placeholder="All Units" :clearable="true"
              @change="applyFilters" />
          </div>
          <div class="flex items-center gap-2">
            <!-- Search Input -->
            <div class="mt-6 relative">
              <input v-model="searchQuery" @input="handleSearch" type="search"
                placeholder="Search by product or warehouse..."
                class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
              <div class="absolute left-3 top-2.5 text-gray-400">
                <i class="fas fa-search text-base"></i>
              </div>
            </div>

            <!-- Refresh Button -->
            <div class="mt-6">
              <button @click="refreshData" title="Refresh Data"
                class="p-1.5 border px-3 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                :disabled="stockStore.loading">
                <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': stockStore.loading }"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="flex flex-col sm:flex-row gap-4 my-3 justify-end">
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
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative stable">
          <SortableTableHeader :columns="tableColumns" :show-actions-column="true" :show-sl-column="false"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="stockStore.loading" :is-loading="true" :total-items="stockStore.totalItems"
            :item-name="'stock records'" loading-text="Loading warehouse stock..."
            loading-subtext="Fetching your stock data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Empty State -->
            <TableLoadingState v-if="displayedItems.length === 0 && !stockStore.loading" :is-loading="false"
              :isEmpty="true" :has-search="!!searchQuery || hasActiveFilters" :item-name="'stock records'"
              empty-icon="fas fa-boxes" empty-title="No stock records found" :show-create-button="false"
              :empty-message="hasActiveFilters ? 'No stock records match your search criteria.' : 'No stock records available.'"
              :clear-search-text="hasActiveFilters ? 'Clear Filters' : undefined" @clear-search="clearAllFilters" />

            <!-- Data Rows -->
            <template v-else v-for="(warehouse, warehouseIndex) in displayedItems" :key="warehouse.warehouse_id">
              <tr v-for="(product, productIndex) in warehouse.products"
                :key="`${warehouse.warehouse_id}-${product.product_id}-${product.variant_id}`" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
                         dark:even:bg-gray-700 dark:odd:bg-gray-800">
                <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[30px]">
                  {{ calculateRowNumber(warehouseIndex, productIndex) }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ product.product_name }}
                    <p v-if="product.product_sku" class="text-xs text-gray-500 dark:text-gray-400">SKU: {{
                      product.product_sku }}</p>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ warehouse.warehouse_name }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ product.variant_name || 'Default' }}
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span>{{ product.formatted_stock || formatStock(product.packages) }}</span>
                      <button @click="openPackageModal(product)"
                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="View package details">
                        <i class="fas fa-info-circle text-sm"></i>
                      </button>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatTotalStock(product.packages) }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button @click="viewDetails(product, warehouse)" v-permission="['warehouse_stocks.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="stockStore.pagination?.total > 0" class="mt-6">
      <Pagination v-if="stockStore.totalItems > 0" :total-items="stockStore.totalItems" :per-page="stockStore.perPage"
        :current-page="stockStore.currentPage" :last-page="stockStore.lastPage" :is-loading="stockStore.loading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Package Details Modal -->
  <BaseModal v-if="showPackageModal" :show="showPackageModal" title="Package Details" maxWidth="lg"
    @close="closePackageModal">
    <div class="px-6 py-3">
      <div class="mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ selectedProduct?.product_name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Variant: {{ selectedProduct?.variant_name || 'Default' }} | SKU: {{ selectedProduct?.product_sku }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="packageLoading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-500 dark:text-gray-400">Loading package details...</span>
      </div>

      <!-- Package Details -->
      <div v-else-if="packageDetails" class="space-y-4">
        <div v-for="pkg in packageDetails" :key="pkg.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Package Type -->
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Package Type</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-semibold">
                {{ pkg.package_type?.name || 'N/A' }}
              </p>
            </div>

            <!-- Pieces per Package -->
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pieces per Package</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                {{ formatNumber(pkg.pieces_per_package) }}
              </p>
            </div>

            <!-- Barcode -->
            <div v-if="pkg.barcode">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Barcode</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1 font-mono">
                {{ pkg.barcode }}
              </p>
            </div>

            <!-- Label -->
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Label</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                {{ pkg.label || 'N/A' }}
              </p>
            </div>

            <!-- Pricing Information -->
            <div v-if="pkg.regular_price">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Regular Price</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                {{ pkg.regular_price }}
              </p>
            </div>

            <div v-if="pkg.dealer_price">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dealer Price</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                {{ pkg.dealer_price }}
              </p>
            </div>

            <div v-if="pkg.sub_dealer_price">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sub Dealer Price</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                {{ pkg.sub_dealer_price }}
              </p>
            </div>

            <!-- Status -->
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
              <p class="text-sm mt-1">
                <span v-if="pkg.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
                <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Inactive
                </span>
              </p>
            </div>

            <div v-if="pkg.is_default">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Default</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Default Package
                </span>
              </p>
            </div>
          </div>
        </div>

        <div v-if="!packageDetails.length" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          No package details available
        </div>
      </div>

      <div v-else-if="packageError" class="text-center py-8 text-red-600 dark:text-red-400">
        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
        <p>{{ packageError }}</p>
      </div>
    </div>

    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
      <button @click="closePackageModal"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
        Close
      </button>
    </div>
  </BaseModal>

  <!-- Stock Details Modal -->
  <BaseModal v-if="showDetailsModal" :show="showDetailsModal" title="Stock Details" maxWidth="xl"
    @close="closeDetailsModal">
    <div class="px-6 py-3" v-if="selectedProduct">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedProduct.product_name }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedProduct.product_sku || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedWarehouse?.warehouse_name || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Variant</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedProduct.variant_name || 'Default' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Formatted Stock</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedProduct.formatted_stock ||
            formatStock(selectedProduct.packages) }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Stock</label>
          <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{
            formatTotalStock(selectedProduct.packages) }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Package Details</label>
          <div class="mt-1 text-sm text-gray-900 dark:text-white">
            <div v-for="pkg in selectedProduct.packages" :key="pkg.variant_package_id"
              class="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span>{{ pkg.package_type_name }}</span>
              <span>{{ formatNumber(pkg.qty) }} × {{ formatNumber(pkg.pieces_per_package) }} pcs = {{
                formatNumber(pkg.qty
                  * pkg.pieces_per_package) }} pcs</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button @click="closeDetailsModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Close
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useWarehouseStockStore } from '@/stores/warehouseStockStore.js';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import { useProductStore } from '@/stores/productStore.js';
import { useProdUnitStore } from '@/stores/prodUnitStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import axiosClient from '@/axiosClient';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

// Initialize stores
const stockStore = useWarehouseStockStore();
const warehouseStore = useWarehouseStore();
const productStore = useProductStore();
const unitStore = useProdUnitStore();
const exporting = ref(false);

// Filters
const filters = ref({
  warehouse_id: null,
  product_id: null,
  unit_id: null,
  grouped: 1
});

// Search query
const searchQuery = ref('');
let searchTimeout = null;

// Table columns configuration
const tableColumns = ref([
  {
    key: "id",
    label: "S/L",
    sortable: false,
    type: "string"
  }, 
  {
    key: "product_name",
    label: "Product",
    sortable: false,
    type: "string"
  },
  {
    key: "warehouse_name",
    label: "Warehouse",
    sortable: false,
    type: "string"
  },
  {
    key: "variant_name",
    label: "Variant",
    sortable: false,
    type: "string"
  },
  {
    key: "package_info",
    label: "Package Info",
    sortable: false,
    type: "string"
  },
  {
    key: "total_stock",
    label: "Total Stock",
    sortable: false,
    type: "number",
    align: "right"
  },
]);

// Modal states
const showPackageModal = ref(false);
const showDetailsModal = ref(false);
const selectedProduct = ref(null);
const selectedWarehouse = ref(null);
const packageDetails = ref([]);
const packageLoading = ref(false);
const packageError = ref(null);

// Computed properties
const displayedItems = computed(() => {
  return stockStore.items || [];
});

const warehouseOptions = computed(() => {
  const items = warehouseStore.items || [];
  return items.filter(item => item !== undefined && item !== null);
});

const productOptions = computed(() => {
  const items = productStore.items || [];
  return items.filter(item => item !== undefined && item !== null);
});

const unitOptions = computed(() => {
  const items = unitStore.items || [];
  return items.filter(item => item !== undefined && item !== null);
});

const hasActiveFilters = computed(() => {
  return filters.value.warehouse_id || filters.value.product_id || filters.value.unit_id;
});

// Helper functions
const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat().format(value);
};

const formatTotalStock = (packages) => {
  if (!packages || !packages.length) return '0';
  const total = packages.reduce((sum, pkg) => sum + (pkg.pieces_per_package * pkg.qty), 0);
  return formatNumber(total);
};

const formatStock = (packages) => {
  if (!packages || !packages.length) return '0';
  return packages.map(pkg =>
    `${formatNumber(pkg.qty)} ${pkg.package_type_name} (${formatNumber(pkg.pieces_per_package)} pcs each)`
  ).join(', ');
};

const calculateRowNumber = (warehouseIndex, productIndex) => {
  // Calculate total items before this warehouse
  let totalBefore = 0;
  for (let i = 0; i < warehouseIndex; i++) {
    totalBefore += (displayedItems.value[i]?.products?.length || 0);
  }
  return (stockStore.pagination?.current_page - 1) * stockStore.pagination?.per_page + totalBefore + productIndex + 1;
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await stockStore.search(searchQuery.value);
  }, 500);
};

// Filter methods
const applyFilters = async () => {
  await stockStore.filter(filters.value);
};

const clearAllFilters = () => {
  filters.value = {
    warehouse_id: null,
    product_id: null,
    unit_id: null,
    grouped: 1
  };
  getData();
};

const clearSearch = () => {
  searchQuery.value = '';
  getData();
};

// Data fetching
const getData = async () => {
  await stockStore.get({ grouped: 1 });
};

const refreshData = async () => {
  try {
    if (searchQuery.value) {
      clearSearch();
    }
    if (hasActiveFilters.value) {
      clearAllFilters();
    } else {
      await getData();
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
};

const loadRelatedData = () => {
  warehouseStore.getAll();
  productStore.getAll();
  unitStore.getAll();
};

// Export data
const exportPDF = async () => {
  exporting.value = true;
  try {
    const params = new URLSearchParams({
      export: 'pdf',
      search: searchQuery.value || '',
      format: 'pdf',
      ...filters.value
    }).toString();

    const response = await axiosClient.get(`/warehouse-stocks?${params}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'RCCTLBD-warehouse-stocks-report-' + new Date().toISOString().split('T')[0] + '.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    exporting.value = false;
  }
};

// Export to Excel
const exportExcel = async () => {
  exporting.value = true;
  try {
    const params = new URLSearchParams({
      export: 'excel',
      search: searchQuery.value || '',
      format: 'excel',
      ...filters.value
    });

    const response = await axiosClient.get(`/warehouse-stocks?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RCCTLBD-warehouse-stocks-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting Excel:', error);
  } finally {
    exporting.value = false;
  }
};

// Package Modal methods
const openPackageModal = async (product) => {
  if (!product || !product.packages) return;

  selectedProduct.value = product;
  packageLoading.value = true;
  packageError.value = null;
  packageDetails.value = [];
  showPackageModal.value = true;

  try {
    // Fetch details for each variant package
    const packagePromises = product.packages.map(async (pkg) => {
      try {
        const response = await axiosClient.get(`/variant-packages/${pkg.variant_package_id}`);
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        return pkg; // Fallback to original data
      } catch (error) {
        console.error(`Error fetching package ${pkg.variant_package_id}:`, error);
        return pkg; // Fallback to original data on individual error
      }
    });

    const results = await Promise.all(packagePromises);
    packageDetails.value = results.filter(pkg => pkg !== null && pkg !== undefined);
  } catch (error) {
    console.error('Error fetching package details:', error);
    packageError.value = 'Failed to load package details. Please try again.';
    packageDetails.value = product.packages; // Fallback to original data
  } finally {
    packageLoading.value = false;
  }
};

const closePackageModal = () => {
  showPackageModal.value = false;
  selectedProduct.value = null;
  packageDetails.value = [];
  packageError.value = null;
  packageLoading.value = false;
};

// View details
const viewDetails = (product, warehouse) => {
  selectedProduct.value = product;
  selectedWarehouse.value = warehouse;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedProduct.value = null;
  selectedWarehouse.value = null;
};

// Pagination methods
const handlePerPageChange = async (newPerPage) => {
  await stockStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await stockStore.paginate(page);
};

// Sorting
const sortByColumn = async (column) => {
  // const order = stockStore.sortDirection === 'asc' ? 'desc' : 'asc';
  // await stockStore.sort(column, order);
  // console.log(column);
};

// Lifecycle hooks
onMounted(async () => {
  await getData();
  loadRelatedData();
});

// Watch for filter changes
watch(() => filters.value.warehouse_id, () => applyFilters());
watch(() => filters.value.product_id, () => applyFilters());
watch(() => filters.value.unit_id, () => applyFilters());
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.btn {
  transition: all 0.3s ease;
}
 
</style>