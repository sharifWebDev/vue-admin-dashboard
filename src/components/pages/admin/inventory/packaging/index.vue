<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Production
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
        <button @click="openCreateModal" v-permission="['packagings.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search & Filters -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Date Range Filters -->
        <div class="flex items-center gap-2">
          <input type="date" v-model="filters.from_date" @change="applyFilters"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none" />
          <span class="text-gray-500 dark:text-gray-400">to</span>
          <input type="date" v-model="filters.to_date" @change="applyFilters"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none" />
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by product, variant..."
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

        <!-- Export Buttons - Show only when data exists -->
        <div v-if="packagingStore.items.length > 0" class="flex justify-end gap-2 mb-4 mt-4">
          <!-- <button @click="exportPDF" :disabled="exporting"
          class="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
          <i class="fas fa-file-pdf mr-2"></i>
          {{ exporting ? 'Exporting...' : 'Export PDF' }}
        </button> -->

          <button @click="exportExcel" :disabled="exporting"
            class="flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
            <i class="fas fa-file-excel mr-2"></i>
            {{ exporting ? 'Exporting...' : 'Export Excel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto min-h-[150px]">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="packagingStore.sortBy"
            :sort-direction="packagingStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="packagingStore.loading" :is-loading="true" :total-items="packagingStore.totalItems"
            :item-name="'production'" loading-text="Loading production..."
            loading-subtext="Fetching your production data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <!-- Empty State -->
            <TableLoadingState v-if="packagingStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'production'" empty-icon="fas fa-boxes"
              empty-title="No production found"
              :empty-message="searchQuery ? 'No production match your search criteria.' : 'Get started by creating your first production.'"
              :create-button-text="'Add First Production'" @create="openCreateModal" @clear-search="clearSearch" />

            <!-- Data Rows -->
            <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
              class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">

              <!-- Row Number (SL) -->
              <td class="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- Product / Variant Info -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <i class="fas fa-box text-gray-500 dark:text-gray-400 text-lg"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ data.product_name || 'N/A' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Variant: {{ data.variant_name || 'N/A' }}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      SKU: {{ data.product_sku || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <!-- Quantity -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ data.quantity || 0 }} {{ data.variant_package_name || '' }}
                  </span>
                </div>
              </td>
              <!-- Packaging Date -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-800 dark:text-gray-200">
                    {{ data.packaging_date }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-1">
                  <!-- View Button -->
                  <button @click="viewItem(data)" v-permission="['packagings.view']"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Quick View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <!-- Dropdown Container -->
                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['packagings.update', 'packagings.delete']">

                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="data.showDropdown"
                      class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['packagings.update']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                          <i class="fas fa-edit text-amber-500 w-4"></i>
                          <span class="font-medium">Edit</span>
                        </button>
                      </div>

                      <div class="py-1">
                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['packagings.delete']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <i class="fas fa-trash-alt w-4"></i>
                          <span class="font-medium">Delete</span>
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

    <div v-if="packagingStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="packagingStore.totalItems > 0" :total-items="packagingStore.totalItems"
        :per-page="packagingStore.perPage" :current-page="packagingStore.currentPage"
        :last-page="packagingStore.lastPage" :is-loading="packagingStore.isLoading" @change-page="handlePageChange"
        @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Production' : 'Edit Production'" maxWidth="2xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="py-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Product -->

        <!-- searchSelect used for product_id-->
        <SearchSelect :options="allProducts" v-model="formData.product_id" :label="'Product'" @change="onProductChange"
          placeholder="Search and select product" :loading="productLoading" :disabled="productLoading"
          :error="packagingStore.validationErrors.product_id" :required="true" />

        <!-- searchSelect used for variant_id -->
        <SearchSelect :options="filteredVariants" v-model="formData.variant_id" :label="'Product Variant'"
          label-key="label" @change="onVariantChange" placeholder="Search and select variant" :loading="variantLoading"
          :disabled="variantLoading" :error="packagingStore.validationErrors.variant_id" :required="true" />

        <!-- searchSelect used for variant_package_id -->
        <SearchSelect :options="filteredPackages" v-model="formData.variant_package_id" label-key="label"
          :label="'Variant Package'" @change="onPackageChange" placeholder="Search and select package"
          :loading="packageLoading" :disabled="packageLoading"
          :error="packagingStore.validationErrors.variant_package_id" :required="true" />


        <!-- Quantity -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Quantity <span class="text-red-500">*</span>
          </label>
          <input v-model.number="formData.quantity" type="number" step="1" min="1" placeholder="Enter quantity"
            @change="clearValidationError('quantity')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': packagingStore.validationErrors.quantity }">
          <p v-if="packagingStore.validationErrors.quantity"
            class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"></path>
            </svg>
            {{ packagingStore.validationErrors.quantity[0] }}
          </p>
        </div>

        <!-- Packaging Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Production Date <span class="text-red-500">*</span>
          </label>
          <input v-model="formData.packaging_date" type="date" @change="clearValidationError('packaging_date')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': packagingStore.validationErrors.packaging_date }">
          <p v-if="packagingStore.validationErrors.packaging_date"
            class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"></path>
            </svg>
            {{ packagingStore.validationErrors.packaging_date[0] }}
          </p>
        </div>

        <!-- Actions - Full Width -->
        <div class="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Cancel
          </button>

          <button type="submit" :disabled="packagingStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm text-white transition',
            packagingStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="packagingStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else> {{ modalMode === 'create' ? 'Create' : 'Update' }} </span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="2xl" title="Production Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <!-- Left Column -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div
              class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <i class="fas fa-box text-gray-500 dark:text-gray-400 text-2xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ viewingItem.product_name || 'N/A' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Variant: {{ viewingItem.variant_name || 'N/A' }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                SKU: {{ viewingItem.product_sku || 'N/A' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</label>
              <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {{ viewingItem.quantity || 0 }}
                <span class="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {{ viewingItem.variant_package_name || '' }}
                </span>
              </p>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Production
                Date</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.packaging_date }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">


          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created
                At</label>
              <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at }}</p>
            </div>
          </div>

          <!-- Product Serials -->
          <!-- <div v-if="viewingItem.product_serials && viewingItem.product_serials.length > 0">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serials</label>
            <div class="mt-2 space-y-1 max-h-32 overflow-y-auto">
              <div v-for="serial in viewingItem.product_serials" :key="serial.id"
                class="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded">
                <span class="font-mono">{{ serial.serial_no }}</span>
                <span v-if="serial.barcode" class="ml-2 text-gray-400">({{ serial.barcode }})</span>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-permission="['packagings.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Production" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Production</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this production? This action cannot be undone.
        </p>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ deletingItem?.product_name }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Variant:</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.variant_name }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Package Type:</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.variant_package_name || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity:</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.quantity || 0 }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Production Date:</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.packaging_date }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="packagingStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          packagingStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="packagingStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePackagingStore } from '@/stores/packagingStore.js';
import { useProductStore } from '@/stores/productStore.js';
import { useProductVariantStore } from '@/stores/productVariantStore.js';
import { useVariantPackageStore } from '@/stores/variantPackageStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';

const refresh = ref(false);
const variantLoading = ref(false);
const packageLoading = ref(false);

const tableColumns = ref([
  {
    "key": "product_name",
    "label": "Product / Variant",
    "sortable": false,
    "type": "string"
  },
  {
    "key": "quantity",
    "label": "Quantity",
    "sortable": true,
    "type": "number"
  },
  {
    "key": "packaging_date",
    "label": "Packaging Date",
    "sortable": true,
    "type": "string"
  }
]);

// Initialize stores
const packagingStore = usePackagingStore();
const productStore = useProductStore();
const productVariantStore = useProductVariantStore();
const variantPackageStore = useVariantPackageStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
const filters = ref({
  from_date: '',
  to_date: ''
});
let searchTimeout = null;

// Form data matching API structure
const formData = ref({
  product_id: '',
  variant_id: '',
  variant_package_id: '',
  quantity: null,
  packaging_date: ''
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return packagingStore.items || [];
});

const allProducts = computed(() => {
  return productStore.items || [];
});

const filteredVariants = computed(() => {
  return productVariantStore.items || [];
});

const filteredPackages = computed(() => {
  return variantPackageStore.items || [];
});

const calculateRowNumber = (index) => {
  if (packagingStore.pagination?.from && packagingStore.pagination.from > 0) {
    return packagingStore.pagination.from + index;
  }
  return (packagingStore.pagination.current_page - 1) * packagingStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (packagingStore.validationErrors && packagingStore.validationErrors[fieldName]) {
    const updatedErrors = { ...packagingStore.validationErrors };
    delete updatedErrors[fieldName];
    packagingStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  packagingStore.validationErrors = {};
};

// Cascading dropdown handlers
const onProductChange = async () => {
  clearValidationError('product_id');
  clearValidationError('variant_id');
  clearValidationError('variant_package_id');

  // Reset dependent fields
  formData.value.variant_id = '';
  formData.value.variant_package_id = '';

  if (formData.value.product_id) {
    variantLoading.value = true;
    try {
      await productVariantStore.getAll({ product_id: formData.value.product_id });
    } finally {
      variantLoading.value = false;
    }
  } else {
    productVariantStore.items = [];
  }
};

const onVariantChange = async () => {
  clearValidationError('variant_id');
  clearValidationError('variant_package_id');

  // Reset package field
  formData.value.variant_package_id = '';

  if (formData.value.variant_id) {
    packageLoading.value = true;
    try {
      await variantPackageStore.getAll({ variant_id: formData.value.variant_id });
    } finally {
      packageLoading.value = false;
    }
  } else {
    variantPackageStore.items = [];
  }
};

const onPackageChange = () => {
  clearValidationError('variant_package_id');
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await applyFilters();
  }, 500);
};

const applyFilters = async () => {
  const params = {
    search: searchQuery.value,
    from_date: filters.value.from_date,
    to_date: filters.value.to_date
  };
  await packagingStore.get(params);
};

const clearSearch = () => {
  searchQuery.value = '';
  filters.value.from_date = '';
  filters.value.to_date = '';
  packagingStore.get();
};

onMounted(async () => {
  await Promise.all([
    getData(),
    productStore.getAll()
  ]);
});

const getData = async () => {
  await packagingStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    clearSearch();
    await getData();
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
  // Reset stores
  productVariantStore.items = [];
  variantPackageStore.items = [];
};

const editItem = async (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';

  // Set form data
  formData.value = {
    product_id: item.product_id || '',
    variant_id: item.variant_id || '',
    variant_package_id: item.variant_package_id || '',
    quantity: item.quantity || null,
    packaging_date: item.packaging_date || ''
  };

  // Load dependent data if product and variant exist
  // if (item.product_id) {
  //   await productVariantStore.getAll({ product_id: item.product_id, per_page: 100 });
  //   if (item.variant_id) {
  //     await variantPackageStore.getAll({ variant_id: item.variant_id, per_page: 100 });
  //   }
  // }

  if (item.product_id) {
    await productVariantStore.getAll();
    if (item.variant_id) {
      await variantPackageStore.getAll();
    }
  }

  isModalOpen.value = true;
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
    variant_id: '',
    variant_package_id: '',
    quantity: null,
    packaging_date: ''
  };
  currentItem.value = null;
  productVariantStore.items = [];
  variantPackageStore.items = [];
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  Object.keys(formData.value).forEach((key) => {
    let value = formData.value[key];

    if (value !== null && value !== undefined && value !== '') {
      formDataToSend.append(key, value);
    }
  });

  let result;
  if (modalMode.value === 'create') {
    result = await packagingStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await packagingStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await packagingStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await packagingStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await packagingStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = packagingStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await packagingStore.sort(column.key, order);
};


const exporting = ref(false);
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
const toast = useToast();
// Export to PDF
const exportPDF = async () => {
  // if (!filters.dealer_id) {
  //   toast.error('Please select a dealer before exporting');
  //   return;
  // }

  exporting.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.from_date) params.append('from_date', filters.value.from_date);
    if (filters.value.to_date) params.append('to_date', filters.value.to_date);
    if (searchQuery.value) params.append('search', searchQuery.value);
    params.append('export', 'pdf');

    const response = await axiosClient.get(`/packagings?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `production-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
    if (filters.value.from_date) params.append('from_date', filters.value.from_date);
    if (filters.value.to_date) params.append('to_date', filters.value.to_date);
    if (searchQuery.value) params.append('search', searchQuery.value);
    params.append('export', 'excel');

    const response = await axiosClient.get(`/packagings?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `production-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>