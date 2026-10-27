<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Product
          Categories</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
      <!-- Left Side: Create Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="openCreateModal" v-permission="['product_categories.create']"
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
      <div class="overflow-visible">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="productCategoryStore.sortBy"
            :sort-direction="productCategoryStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State -->
          <TableLoadingState v-if="productCategoryStore.loading" :is-loading="true"
            :total-items="productCategoryStore.totalItems" :item-name="'categories'"
            loading-text="Loading categories..." loading-subtext="Fetching your product category data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="productCategoryStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'categories'" empty-icon="fas fa-tags"
              empty-title="No categories found"
              :empty-message="searchQuery ? 'No categories match your search criteria.' : 'Get started by creating your first product category.'"
              :create-button-text="'Add First Category'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="fas fa-tag text-gray-400"></i>
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
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewItem(data)" v-permission="['product_categories.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['product_categories.update', 'product_categories.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false"
                          v-permission="['product_categories.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['product_categories.delete']"
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

    <div v-if="productCategoryStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="productCategoryStore.totalItems > 0" :total-items="productCategoryStore.totalItems"
        :per-page="productCategoryStore.perPage" :current-page="productCategoryStore.currentPage"
        :last-page="productCategoryStore.lastPage" :is-loading="productCategoryStore.isLoading"
        @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Product Category' : 'Edit Product Category'" maxWidth="2xl"
    @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        
        <!-- Category Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter category name"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': productCategoryStore.validationErrors.name }">
          <p v-if="productCategoryStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productCategoryStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Code -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
          <input v-model="formData.code" type="text" placeholder="Enter category code"
            @change="clearValidationError('code')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': productCategoryStore.validationErrors.code }">
          <p v-if="productCategoryStore.validationErrors.code" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productCategoryStore.validationErrors.code[0] }}
          </p>
        </div>

        <!-- Inventory Account Selection -->
        <!-- <SearchSelect v-model="formData.inventory_account_id" :options="chartOfAccountStoreItems"
          label="Inventory Account" :selected-item="selectedInventoryAccount"
          placeholder="-- Select Inventory Account --"
          :error="productCategoryStore.validationErrors?.inventory_account_id" /> -->

        <!-- COGS Account Selection -->
        <!-- <SearchSelect v-model="formData.cogs_account_id" :options="chartOfAccountStoreItems" label="COGS Account"
          :selected-item="selectedCogsAccount" placeholder="-- Select COGS Account --"
          :error="productCategoryStore.validationErrors?.cogs_account_id" /> -->

        <!-- Sales Account Selection -->
        <!-- <SearchSelect v-model="formData.sales_account_id" :options="chartOfAccountStoreItems" label="Sales Account"
          :selected-item="selectedSalesAccount" placeholder="-- Select Sales Account --"
          :error="productCategoryStore.validationErrors?.sales_account_id" /> -->

        <!-- Global Form Errors -->
        <div v-if="Object.keys(productCategoryStore.validationErrors).length > 0"
          class="md:col-span-2 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in productCategoryStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div>

        <!-- Form Actions -->
        <div class="md:col-span-2 flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="productCategoryStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            productCategoryStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="productCategoryStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Category' : 'Update Category' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Product Category Details"
    @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-2 2xl:col-span-2 flex flex-col items-center mb-4">
            <div class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <i class="fas fa-tags text-gray-400 text-3xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">{{ viewingItem.name }}</h2>
            <p class="text-gray-600 dark:text-gray-400">Code: {{ viewingItem.code || 'N/A' }}</p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">#{{ viewingItem.id }}</p>
          </div> 

          <!-- <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Inventory Account</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ viewingItem.inventory_account ? `${viewingItem.inventory_account.code} -
              ${viewingItem.inventory_account.name}` : 'N/A' }}
            </p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">COGS Account</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ viewingItem.cogs_account ? `${viewingItem.cogs_account.code} - ${viewingItem.cogs_account.name}` :
              'N/A' }}
            </p>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales Account</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ viewingItem.sales_account ? `${viewingItem.sales_account.code} - ${viewingItem.sales_account.name}` :
              'N/A' }}
            </p>
          </div> -->

          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.updated_at || 'N/A' }}</p>
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
      <button v-permission="['product_categories.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Category
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Product Category" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Product Category</h3>
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
        <button @click="handleDelete" :disabled="productCategoryStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          productCategoryStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="productCategoryStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Category</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductCategoryStore } from '@/stores/productCategoryStore'; 
import { useChartOfAccountStore } from '@/stores/chartOfAccountStore.js';
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
    "label": "Category Name",
    "sortable": true,
    "type": "string"
  } 
]);

// Initialize stores
const productCategoryStore = useProductCategoryStore(); 
const chartOfAccountStore = useChartOfAccountStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
 
const chartOfAccountStoreItems = computed(() => {
  const items = chartOfAccountStore.items || [];
  return Array.isArray(items) ? items.filter(Boolean) : [];
});

// Form data
const formData = ref({ 
  name: '',
  code: '',
  inventory_account_id: '',
  cogs_account_id: '',
  sales_account_id: ''
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

// Selected items for SearchSelect display
const selectedInventoryAccount = ref(null);
const selectedCogsAccount = ref(null);
const selectedSalesAccount = ref(null);

const displayedItems = computed(() => {
  return productCategoryStore.items || [];
});

const calculateRowNumber = (index) => {
  if (productCategoryStore.pagination?.from && productCategoryStore.pagination.from > 0) {
    return productCategoryStore.pagination.from + index;
  }
  return (productCategoryStore.pagination.current_page - 1) * productCategoryStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (productCategoryStore.validationErrors[fieldName]) {
    const updatedErrors = { ...productCategoryStore.validationErrors };
    delete updatedErrors[fieldName];
    productCategoryStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  productCategoryStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await productCategoryStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  productCategoryStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    productCategoryStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  getData();
});

const getData = async () => {
  await productCategoryStore.get(); 
  await chartOfAccountStore.getAll();
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
    inventory_account_id: item.inventory_account_id || '',
    cogs_account_id: item.cogs_account_id || '',
    sales_account_id: item.sales_account_id || ''
  };

  // Set selected items for SearchSelect display
  if (item.inventory_account) {
    selectedInventoryAccount.value = {
      id: item.inventory_account.id,
      code: item.inventory_account.code,
      name: item.inventory_account.name
    };
  }
  if (item.cogs_account) {
    selectedCogsAccount.value = {
      id: item.cogs_account.id,
      code: item.cogs_account.code,
      name: item.cogs_account.name
    };
  }
  if (item.sales_account) {
    selectedSalesAccount.value = {
      id: item.sales_account.id,
      code: item.sales_account.code,
      name: item.sales_account.name
    };
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
    name: '',
    code: '',
    inventory_account_id: '',
    cogs_account_id: '',
    sales_account_id: ''
  };
  selectedInventoryAccount.value = null;
  selectedCogsAccount.value = null;
  selectedSalesAccount.value = null;
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  for (const key in formData.value) {
    const value = formData.value[key];

    // Skip null, undefined, or empty string values
    if (value === null || value === undefined || value === '') {
      continue;
    }

    formDataToSend.append(key, value);
  }

  let result;
  if (modalMode.value === 'create') {
    result = await productCategoryStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await productCategoryStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await productCategoryStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await productCategoryStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await productCategoryStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = productCategoryStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await productCategoryStore.sort(column, order);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>