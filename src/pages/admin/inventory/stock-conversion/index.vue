<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Stock
          Conversions
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['stock_conversions.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>

        <!-- Refresh Button Group -->
        <div
          class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1.5 flex-shrink-0">
          <button @click="refreshData" title="Refresh Data"
            class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            :disabled="refresh">
            <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto min-h-[150px]">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="unitConversionStore.sortBy"
            :sort-direction="unitConversionStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="unitConversionStore.loading" :is-loading="true"
            :total-items="unitConversionStore.totalItems" :item-name="'conversions'"
            loading-text="Loading conversion..." loading-subtext="Fetching your conversion data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <!-- Empty State -->
            <TableLoadingState v-if="unitConversionStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'conversions'" empty-icon="fas fa-exchange-alt"
              empty-title="No conversions found"
              :empty-message="searchQuery ? 'No stock conversions match your search criteria.' : 'Get started by creating your first Stock Conversion.'"
              :create-button-text="'Add First Conversion'" @create="openCreateModal" @clear-search="clearSearch" />

            <!-- Data Rows -->
            <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
              class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">

              <!-- Row Number (SL) -->
              <td class="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- Reference No -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ data.reference_no }}</span>
              </td>

              <!-- Product -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ data.product?.name }}
                  </span>
                  <span class="text-[10px] uppercase text-gray-400 font-bold">
                    {{ data.product?.code || 'No Code' }}
                  </span>
                </div>
              </td>

              <!-- Warehouse -->
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ data.warehouse?.name }}</span>
              </td>

              <!-- Source Unit & Qty -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    Qty: {{ data.source_quantity }} ({{ data.source_unit?.name }})
                  </span>
                  <span class="text-[10px] text-gray-400">Rate: {{ data.source_rate }}</span>
                </div>
              </td>

              <!-- Target Unit & Qty -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">
                    Qty: {{ data.target_quantity }} ({{ data.target_unit?.name }})
                  </span>
                  <span class="text-[10px] text-gray-400">Rate: {{ data.target_rate }}</span>
                </div>
              </td>

              <!-- Conversion Date -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ data.conversion_date }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-1">
                  <!-- View Button -->
                  <button @click="viewItem(data)" v-permission="['stock_conversions.view']"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Quick View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <!-- Dropdown Container -->
                  <div class="relative inline-block text-left hidden" v-click-outside="() => data.showDropdown = false"
                    v-permission="['stock_conversions.update', 'stock_conversions.delete']">

                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>

                    <!-- Dropdown Menu (Premium Card Look) -->
                    <div v-if="data.showDropdown"
                      class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false"
                          v-permission="['stock_conversions.update']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                          <i class="fas fa-edit text-amber-500 w-4"></i>
                          <span class="font-medium">Edit Conversion</span>
                        </button>
                      </div>

                      <div class="py-1">
                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['stock_conversions.delete']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <i class="fas fa-trash-alt w-4"></i>
                          <span class="font-medium">Delete Conversion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="unitConversionStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="unitConversionStore.totalItems > 0" :total-items="unitConversionStore.totalItems"
        :per-page="unitConversionStore.perPage" :current-page="unitConversionStore.currentPage"
        :last-page="unitConversionStore.lastPage" :is-loading="unitConversionStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Conversion' : 'Edit Conversion'" maxWidth="2xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="py-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Product Select -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Product <span class="text-red-500">*</span>
          </label>
          <select v-model="formData.product_id" @change="clearValidationError('product_id')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.product_id }">
            <option value="">Select Product</option>
            <option v-for="product in allProducts" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
          <p v-if="unitConversionStore.validationErrors.product_id" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.product_id[0] }}
          </p>
        </div>

        <!-- Warehouse Select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Warehouse <span class="text-red-500">*</span>
          </label>
          <select v-model="formData.warehouse_id" @change="clearValidationError('warehouse_id')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.warehouse_id }">
            <option value="">Select Warehouse</option>
            <option v-for="warehouse in allWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
          <p v-if="unitConversionStore.validationErrors.warehouse_id" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.warehouse_id[0] }}
          </p>
        </div>

        <!-- Conversion Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Conversion Date <span class="text-red-500">*</span>
          </label>
          <input v-model="formData.conversion_date" type="date"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.conversion_date }">
          <p v-if="unitConversionStore.validationErrors.conversion_date" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.conversion_date[0] }}
          </p>
        </div>

        <!-- Source Unit -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Source Unit <span class="text-red-500">*</span>
          </label>
          <select v-model="formData.source_unit_id" @change="clearValidationError('source_unit_id')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.source_unit_id }">
            <option value="">Select Unit</option>
            <option v-for="unit in allUnits" :key="unit.id" :value="unit.id">
              {{ unit.name }}
            </option>
          </select>
          <p v-if="unitConversionStore.validationErrors.source_unit_id" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.source_unit_id[0] }}
          </p>
        </div>

        <!-- Target Unit -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Target Unit <span class="text-red-500">*</span>
          </label>
          <select v-model="formData.target_unit_id" @change="clearValidationError('target_unit_id')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.target_unit_id }">
            <option value="">Select Unit</option>
            <option v-for="unit in allUnits" :key="unit.id" :value="unit.id">
              {{ unit.name }}
            </option>
          </select>
          <p v-if="unitConversionStore.validationErrors.target_unit_id" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.target_unit_id[0] }}
          </p>
        </div>

        <!-- Source Quantity -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Source Quantity <span class="text-red-500">*</span>
          </label>
          <input v-model.number="formData.source_quantity" type="number" step="0.01"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            :class="{ 'border-red-500': unitConversionStore.validationErrors.source_quantity }">
          <p v-if="unitConversionStore.validationErrors.source_quantity" class="text-xs text-red-600 mt-1">
            {{ unitConversionStore.validationErrors.source_quantity[0] }}
          </p>
        </div>

        <!-- Notes -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
          <textarea v-model="formData.notes" rows="2"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
        </div>
      </div>
      <!-- Actions -->
      <div class="md:col-span-2 flex justify-end gap-3 pt-4">
        <button type="button" @click="closeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          Cancel
        </button>

        <button type="submit" :disabled="unitConversionStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm text-white transition',
          unitConversionStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="unitConversionStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
          </span>
          <span v-else> {{ modalMode === 'create' ? 'Create' : 'Update' }} </span>
        </button>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Stock Conversion Details"
    @close="closeViewModal">
    <div class="px-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Reference & Date -->
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase">Reference No</label>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ viewingItem.reference_no }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase">Conversion Date</label>
            <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.conversion_date }}</p>
          </div>
        </div>

        <!-- Product & Warehouse -->
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase">Product</label>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ viewingItem.product?.name }}</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold">{{ viewingItem.product?.code }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase">Warehouse</label>
            <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.warehouse?.name }}</p>
          </div>
        </div>

        <!-- Source Details -->
        <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <label class="text-xs font-medium text-gray-500 uppercase mb-2 block text-indigo-600">Source (From)</label>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Unit:</span>
              <span class="text-sm font-medium">{{ viewingItem.source_unit?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Quantity:</span>
              <span class="text-sm font-medium">{{ viewingItem.source_quantity }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span class="text-sm text-gray-500">Rate:</span>
              <span class="text-sm font-medium">{{ viewingItem.source_rate }}</span>
            </div>
          </div>
        </div>

        <!-- Target Details -->
        <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <label class="text-xs font-medium text-gray-500 uppercase mb-2 block text-emerald-600">Target (To)</label>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Unit:</span>
              <span class="text-sm font-medium">{{ viewingItem.target_unit?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Quantity:</span>
              <span class="text-sm font-medium">{{ viewingItem.target_quantity }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span class="text-sm text-gray-500">Rate:</span>
              <span class="text-sm font-medium">{{ viewingItem.target_rate }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="md:col-span-2">
          <label class="text-xs font-medium text-gray-500 uppercase block mb-1">Notes</label>
          <p
            class="text-sm text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            {{ viewingItem.notes || 'No notes available' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <!-- <button v-permission="['stock_conversions.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Conversion
      </button> -->
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Stock Conversion" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Conversion</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.reference_no || 'this conversion' }}</strong>? This
          action cannot
          be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="unitConversionStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          unitConversionStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="unitConversionStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Conversion</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProdUnitStore } from '@/stores/prodUnitStore.js';
import { useStockConversionStore } from '@/stores/stockConversionStore.js';
import { useProductStore } from '@/stores/productStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "reference_no",
    "label": "Ref No",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "product_id",
    "label": "Product",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "warehouse_id",
    "label": "Warehouse",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "source_unit_id",
    "label": "Source",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "target_unit_id",
    "label": "Target",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "conversion_date",
    "label": "Date",
    "sortable": true,
    "type": "string"
  }
]);

// Initialize stores
const unitConversionStore = useStockConversionStore();
const prodUnitStore = useProdUnitStore();
const productStore = useProductStore();
const warehouseStore = useWarehouseStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data matching API structure
const formData = ref({
  product_id: '',
  warehouse_id: '',
  source_unit_id: '',
  target_unit_id: '',
  source_quantity: null,
  conversion_date: new Date().toISOString().substr(0, 10),
  notes: ''
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const statusChangingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return unitConversionStore.items || [];
});

const allUnits = computed(() => {
  return prodUnitStore.items || [];
});

const allProducts = computed(() => {
  return productStore.items || [];
});

const allWarehouses = computed(() => {
  return warehouseStore.items || [];
});

const calculateRowNumber = (index) => {
  if (unitConversionStore.pagination?.from && unitConversionStore.pagination.from > 0) {
    return unitConversionStore.pagination.from + index;
  }
  return (unitConversionStore.pagination.current_page - 1) * unitConversionStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (unitConversionStore.validationErrors && unitConversionStore.validationErrors[fieldName]) {
    const updatedErrors = { ...unitConversionStore.validationErrors };
    delete updatedErrors[fieldName];
    unitConversionStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  unitConversionStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await unitConversionStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  unitConversionStore.search('');
};

onMounted(async () => {
  getData();
  prodUnitStore.get({ per_page: 100 });
  productStore.get({ per_page: 100 });
  warehouseStore.get({ per_page: 100 });
});

const getData = async () => {
  await unitConversionStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
  } finally {
    refresh.value = false;
  }
}

// Modal functions
const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
  isModalOpen.value = true;
  clearAllValidationErrors();
};

// Edit item function
const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set form data matching API structure
  formData.value = {
    product_id: item.product?.id || item.product_id || '',
    warehouse_id: item.warehouse?.id || item.warehouse_id || '',
    source_unit_id: item.source_unit?.id || item.source_unit_id || '',
    target_unit_id: item.target_unit?.id || item.target_unit_id || '',
    source_quantity: item.source_quantity || null,
    conversion_date: item.conversion_date || new Date().toISOString().substr(0, 10),
    notes: item.notes || ''
  };

  isModalOpen.value = true;
  if (showViewModal.value) showViewModal.value = false;
  clearAllValidationErrors();
};

const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const confirmDelete = (item) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  clearAllValidationErrors();
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingItem.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingItem.value = null;
};

const resetForm = () => {
  formData.value = {
    product_id: '',
    warehouse_id: '',
    source_unit_id: '',
    target_unit_id: '',
    source_quantity: null,
    conversion_date: new Date().toISOString().substr(0, 10),
    notes: ''
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  // Manually build FormData to avoid the baseStore.js preparePayload bug
  Object.keys(formData.value).forEach((key) => {
    let value = formData.value[key];

    // Convert booleans to 1/0 for FormData
    if (typeof value === 'boolean') {
      value = value ? 1 : 0;
    }

    if (value !== null && value !== undefined && value !== '') {
      formDataToSend.append(key, value);
    }
  });

  let result;
  if (modalMode.value === 'create') {
    result = await unitConversionStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await unitConversionStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await unitConversionStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await unitConversionStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await unitConversionStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = unitConversionStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await unitConversionStore.sort(column.key, order);
};

const getUnitIcon = (unitType) => {
  if (!unitType) return 'fa-scale-balanced';

  const type = unitType.toLowerCase();

  // Weight/Mass
  if (type === 'kg' || type === 'gram' || type === 'g' || type === 'mg' || type === 'gm') {
    return 'fa-scale-balanced';
  }

  // Piece / Quantity
  if (type === 'pcs' || type === 'piece' || type === 'unit') {
    return 'fa-box';
  }

  // Liquid
  if (type === 'liter' || type === 'ltr' || type === 'ml' || type === 'milliliter') {
    return 'fa-flask';
  }

  // Length
  if (type === 'meter' || type === 'inch' || type === 'ft') {
    return 'fa-ruler';
  }

  // Bulk / multiple
  if (type === 'dozen' || type === 'pack' || type === 'set') {
    return 'fa-boxes-stacked';
  }

  // Medicine
  if (type === 'tablet' || type === 'capsule') {
    return 'fa-prescription-bottle';
  }

  // Default
  return 'fa-scale-balanced';
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>