<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Measurement
          Units</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['measurement_units.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name or symbol..."
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
          <SortableTableHeader :columns="tableColumns" :sort-by="measurementUnitStore.sortBy"
            :sort-direction="measurementUnitStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="measurementUnitStore.loading" :is-loading="true"
            :total-items="measurementUnitStore.totalItems" :item-name="'units'"
            loading-text="Loading measurement units..." loading-subtext="Fetching your measurement unit data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <!-- Empty State -->
            <TableLoadingState v-if="measurementUnitStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'units'" empty-icon="fas fa-ruler"
              empty-title="No measurement units found"
              :empty-message="searchQuery ? 'No measurement units match your search criteria.' : 'Get started by creating your first Measurement Unit.'"
              :show-create-button="false" @clear-search="clearSearch" />

            <!-- Data Rows -->
            <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
              class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">

              <!-- Row Number (SL) -->
              <td class="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {{ calculateRowNumber(index) }}
              </td>

              <!-- Unit Name -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <i :class="['fa-solid', getUnitIcon(data.symbol), 'text-gray-500 dark:text-gray-400 text-lg']"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ data.name }}
                    </div>
                    <div class="text-[10px] uppercase text-gray-400 font-bold">
                      {{ data.symbol }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Symbol -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                    {{ data.symbol }}
                  </span>
                  <span class="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    Symbol
                  </span>
                </div>
              </td>
              <!-- Status Badge (Polaris Style) -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  data.is_active === true
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                  'px-2.5 py-1 inline-flex text-[11px] leading-4 font-bold uppercase tracking-wide rounded-md border border-transparent'
                ]">
                  <span class="mr-1.5 flex h-1.5 w-1.5 items-center justify-center">
                    <span :class="[
                      data.is_active === true ? 'bg-emerald-500' : 'bg-gray-400',
                      'h-1.5 w-1.5 rounded-full'
                    ]"></span>
                  </span>
                  {{ data.is_active === true ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-1">
                  <!-- View Button -->
                  <button @click="viewItem(data)" v-permission="['measurement_units.view']"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Quick View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <!-- Dropdown Container -->
                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['measurement_units.update', 'measurement_units.delete']">

                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <div v-if="data.showDropdown"
                      class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false"
                          v-permission="['measurement_units.update']"
                          class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                          <i class="fas fa-edit text-amber-500 w-4"></i>
                          <span class="font-medium">Edit</span>
                        </button>
                      </div>

                      <div class="py-1">
                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['measurement_units.delete']"
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

    <div v-if="measurementUnitStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="measurementUnitStore.totalItems > 0" :total-items="measurementUnitStore.totalItems"
        :per-page="measurementUnitStore.perPage" :current-page="measurementUnitStore.currentPage"
        :last-page="measurementUnitStore.lastPage" :is-loading="measurementUnitStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Measurement Unit' : 'Edit Measurement Unit'" maxWidth="lg"
    @close="closeModal">
    <form @submit.prevent="handleSubmit" class="py-3">
      <div class="grid grid-cols-1 gap-4">
        <!-- Unit Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Unit Name <span class="text-red-500">*</span>
          </label>
          <input v-model="formData.name" type="text" placeholder="e.g., Gram, Kilogram, Liter"
            @input="clearValidationError('name')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': measurementUnitStore.validationErrors.name }">
          <p v-if="measurementUnitStore.validationErrors.name"
            class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"></path>
            </svg>
            {{ measurementUnitStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Symbol -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Symbol <span class="text-red-500">*</span>
          </label>
          <input v-model="formData.symbol" type="text" placeholder="e.g., g, kg, l, ml"
            @input="clearValidationError('symbol')"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': measurementUnitStore.validationErrors.symbol }">
          <p v-if="measurementUnitStore.validationErrors.symbol"
            class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"></path>
            </svg>
            {{ measurementUnitStore.validationErrors.symbol[0] }}
          </p>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div class="flex items-center space-x-6">
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="true" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="false"
                @change="clearValidationError('is_active')"
                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
            </label>
          </div>
          <p v-if="measurementUnitStore.validationErrors.is_active" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ measurementUnitStore.validationErrors.is_active[0] }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Cancel
          </button>

          <button type="submit" :disabled="measurementUnitStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm text-white transition',
            measurementUnitStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="measurementUnitStore.loading">
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
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="lg" title="Measurement Unit Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div
              class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <i
                :class="['fa-solid', getUnitIcon(viewingItem.symbol), 'text-gray-500 dark:text-gray-400 text-2xl']"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ viewingItem.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">{{ viewingItem.symbol }}</p>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
            <div class="mt-1">
              <span :class="[
                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                viewingItem.is_active === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              ]">
                {{ viewingItem.is_active === true ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-permission="['measurement_units.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Unit
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Measurement Unit" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Measurement Unit</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.name || 'this unit' }}</strong>? This action cannot
          be undone.
        </p>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Unit:</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ deletingItem?.name }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Symbol:</span>
            <span class="text-sm font-mono text-gray-900 dark:text-white">{{ deletingItem?.symbol }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="measurementUnitStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          measurementUnitStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="measurementUnitStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Unit</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProdMeasurementUnitStore } from '@/stores/prodMeasurementUnitStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "name",
    "label": "Unit Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "symbol",
    "label": "Symbol",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "is_active",
    "label": "Status",
    "sortable": true,
    "type": "boolean",
    "width": "100px"
  }
]);

// Initialize store
const measurementUnitStore = useProdMeasurementUnitStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data matching API structure
const formData = ref({
  name: '',
  symbol: '',
  is_active: true
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return measurementUnitStore.items || [];
});

const calculateRowNumber = (index) => {
  if (measurementUnitStore.pagination?.from && measurementUnitStore.pagination.from > 0) {
    return measurementUnitStore.pagination.from + index;
  }
  return (measurementUnitStore.pagination.current_page - 1) * measurementUnitStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (measurementUnitStore.validationErrors && measurementUnitStore.validationErrors[fieldName]) {
    const updatedErrors = { ...measurementUnitStore.validationErrors };
    delete updatedErrors[fieldName];
    measurementUnitStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  measurementUnitStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await measurementUnitStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  measurementUnitStore.search('');
};

onMounted(async () => {
  getData();
});

const getData = async () => {
  await measurementUnitStore.get();
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
    name: item.name || '',
    symbol: item.symbol || '',
    is_active: item.is_active === true || item.is_active === 1
  };

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
    name: '',
    symbol: '',
    is_active: true
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

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
    result = await measurementUnitStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await measurementUnitStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await measurementUnitStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await measurementUnitStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await measurementUnitStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = measurementUnitStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await measurementUnitStore.sort(column.key, order);
};

const getUnitIcon = (symbol) => {
  if (!symbol) return 'fa-scale-balanced';

  const type = symbol.toLowerCase();

  // Weight/Mass
  if (type === 'kg' || type === 'g' || type === 'mg' || type === 'gm') {
    return 'fa-scale-balanced';
  }

  // Piece / Quantity
  if (type === 'pcs' || type === 'piece' || type === 'pc' || type === 'unit') {
    return 'fa-box';
  }

  // Liquid
  if (type === 'l' || type === 'ltr' || type === 'liter' || type === 'ml' || type === 'milliliter') {
    return 'fa-flask';
  }

  // Length
  if (type === 'm' || type === 'meter' || type === 'inch' || type === 'ft') {
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

  // Time
  if (type === 'h' || type === 'hr' || type === 'hour' || type === 'min' || type === 'sec') {
    return 'fa-clock';
  }

  // Temperature
  if (type === '°c' || type === 'c' || type === '°f' || type === 'f') {
    return 'fa-temperature-half';
  }

  // Area
  if (type === 'm²' || type === 'sqm' || type === 'ft²') {
    return 'fa-vector-square';
  }

  // Volume
  if (type === 'm³' || type === 'cu' || type === 'ft³') {
    return 'fa-cube';
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