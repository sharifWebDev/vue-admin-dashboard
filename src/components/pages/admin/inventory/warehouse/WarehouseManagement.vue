<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Warehouse</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['warehouses.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex items-center gap-3 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-0 max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name or code..."
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
          <SortableTableHeader :columns="tableColumns" :sort-by="warehouseStore.sortBy"
            :sort-direction="warehouseStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="warehouseStore.loading" :is-loading="true" :total-items="warehouseStore.totalItems"
            :item-name="'warehouses'" loading-text="Loading warehouses..."
            loading-subtext="Fetching your warehouse data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="warehouseStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'warehouses'" empty-icon="fas fa-warehouse"
              empty-title="No warehouses found"
              :empty-message="searchQuery ? 'No warehouses match your search criteria.' : 'Get started by creating your first warehouse.'"
              :create-button-text="'Add First Warehouse'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="fas fa-warehouse text-gray-400"></i>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Code: {{ data.code || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.location || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="[
                  data.is_active === 1 || data.is_active === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                ]">
                  {{ data.is_active === 1 || data.is_active === true ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewItem(data)" v-permission="['warehouses.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['warehouses.update', 'warehouses.delete']">
                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-1.5 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Actions">
                      <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                    </button>

                    <div v-if="data.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                      origin-top-right rounded-md shadow-xl
                      bg-white dark:bg-gray-800
                      ring-1 ring-black ring-opacity-5
                      divide-y divide-gray-100 dark:divide-gray-700
                      focus:outline-none">

                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['warehouses.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['warehouses.delete']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                          <i class="fas fa-trash"></i>
                          Delete
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

    <div v-if="warehouseStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="warehouseStore.totalItems > 0" :total-items="warehouseStore.totalItems"
        :per-page="warehouseStore.perPage" :current-page="warehouseStore.currentPage"
        :last-page="warehouseStore.lastPage" :is-loading="warehouseStore.isLoading" @change-page="handlePageChange"
        @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Warehouse' : 'Edit Warehouse'" maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-4">

        <!-- Warehouse Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter warehouse name"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': warehouseStore.validationErrors.name }">
          <p v-if="warehouseStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ warehouseStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Code -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.code" type="text" placeholder="Enter warehouse code"
            @change="clearValidationError('code')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': warehouseStore.validationErrors.code }">
          <p v-if="warehouseStore.validationErrors.code" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ warehouseStore.validationErrors.code[0] }}
          </p>
        </div>


        <!-- location -->
        <div class="xl:col-span-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <textarea v-model="formData.location" rows="3" placeholder="Enter location"
            @change="clearValidationError('location')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': warehouseStore.validationErrors.location }"></textarea>
          <p v-if="warehouseStore.validationErrors.location" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ warehouseStore.validationErrors.location[0] }}
          </p>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div class="flex items-center space-x-6">
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="1" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="0" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
            </label>
          </div>
          <p v-if="warehouseStore.validationErrors.is_active" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ warehouseStore.validationErrors.is_active[0] }}
          </p>
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(warehouseStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in warehouseStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="warehouseStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            warehouseStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="warehouseStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Warehouse' : 'Update Warehouse' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Warehouse Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-2 2xl:col-span-2 flex flex-col items-center mb-4">
            <div class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <i class="fas fa-warehouse text-gray-400 text-3xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">{{ viewingItem.name }}</h2>
            <p class="text-gray-600 dark:text-gray-400">Code: {{ viewingItem.code || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.location || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
            <div class="mt-1">
              <span :class="[
                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                viewingItem.is_active === 1 || viewingItem.is_active === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              ]">
                {{ viewingItem.is_active === 1 || viewingItem.is_active === true ? 'Active' : 'Inactive' }}
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
      <button v-permission="['warehouses.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Warehouse
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Warehouse" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Warehouse</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.name || deletingItem?.code || 'this item'
          }}</strong>? This action cannot be undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="warehouseStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          warehouseStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="warehouseStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Warehouse</span>
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Status Change Confirmation Modal -->
  <BaseModal :show="showStatusChangeModal" title="Change Status" maxWidth="lg" :showClose="false"
    @close="closeStatusChangeModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
          <i class="fas fa-exchange-alt text-yellow-600 dark:text-yellow-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Change Warehouse Status</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change the status of
          <strong>{{ statusChangingItem?.name || statusChangingItem?.code || 'this item' }}</strong>
          to
          <strong>
            <span :class="[
              statusChangingItem?.is_active === 1 || statusChangingItem?.is_active === true
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            ]">
              {{ statusChangingItem?.is_active === 1 || statusChangingItem?.is_active === true ? 'Inactive' : 'Active'
              }}
            </span>
          </strong>?
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeStatusChangeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="confirmStatusChange" :disabled="warehouseStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          warehouseStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="warehouseStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Updating...
          </span>
          <span v-else>Confirm Change</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';


const refresh = ref(false);

const tableColumns = ref([
  {
    "key": "name",
    "label": "Warehouse Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "location",
    "label": "Location",
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

// Initialize stores
const warehouseStore = useWarehouseStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showStatusChangeModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;


// Form data
const formData = ref({
  name: '',
  code: '',
  location: '',
  is_active: 1
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const statusChangingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return warehouseStore.items || [];
});

const calculateRowNumber = (index) => {
  if (warehouseStore.pagination?.from && warehouseStore.pagination.from > 0) {
    return warehouseStore.pagination.from + index;
  }
  return (warehouseStore.pagination.current_page - 1) * warehouseStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (warehouseStore.validationErrors[fieldName]) {
    const updatedErrors = { ...warehouseStore.validationErrors };
    delete updatedErrors[fieldName];
    warehouseStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  warehouseStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await warehouseStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  warehouseStore.search('');
};

onMounted(async () => {
  getData();
});

const getData = async () => {
  await warehouseStore.get();
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

  // Set form data
  formData.value = {
    name: item.name || '',
    code: item.code || '',
    location: item.location || '',
    is_active: item.is_active === 1 || item.is_active === true ? 1 : 0
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

const toggleStatus = (item, field) => {
  statusChangingItem.value = item;
  showStatusChangeModal.value = true;
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

const closeStatusChangeModal = () => {
  showStatusChangeModal.value = false;
  statusChangingItem.value = null;
};

const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    location: '',
    is_active: 1
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  for (const key in formData.value) {
    const value = formData.value[key];

    // Skip null, undefined, or empty string values for all fields except status (which can be 0)
    if (value === null || value === undefined) {
      continue;
    }

    // For string fields, skip empty strings
    if (typeof value === 'string' && value === '') {
      continue;
    }

    formDataToSend.append(key, value);
  }

  let result;
  if (modalMode.value === 'create') {
    result = await warehouseStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await warehouseStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await warehouseStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

const confirmStatusChange = async () => {
  if (statusChangingItem.value) {
    try {
      const field = 'is_active';
      await warehouseStore.toggleStatus(statusChangingItem.value, field);
      closeStatusChangeModal();
      getData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await warehouseStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await warehouseStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = warehouseStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await warehouseStore.sort(column, order);
};

const handlePhoneInput = (fieldName, e) => {
  let value = e.target.value;

  // Remove everything except digits and +
  value = value.replace(/[^0-9+]/g, '');

  // Allow only one + and only at the beginning
  if (value.includes('+')) {
    value = value.replace(/\+/g, '');
    value = '+' + value;
  }

  // Optional: limit total length (including +)
  value = value.slice(0, 15);

  e.target.value = value;

  // Store as STRING
  formData.value[fieldName] = value;
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>