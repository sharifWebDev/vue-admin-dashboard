<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
          Products
        </h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">

      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-1/2 lg:w-1/3">
        <button @click="openCreateModal" v-permission="['products.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row justify-end items-end gap-4">
        <div class="sm:col-span-1 flex items-end gap-2 w-full">
          <div class="relative flex-grow">
            <input v-model="searchQuery" @input="handleSearch" type="search"
              placeholder="Search by product name or SKU..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all" />
            <div class="absolute left-3 top-2.5 text-gray-400">
              <i class="fas fa-search text-base"></i>
            </div>
          </div>

          <button @click="refreshData" title="Refresh Data"
            class="flex-shrink-0 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            :disabled="refresh">
            <i class="fas fa-sync-alt" :class="{ 'animate-spin': refresh }"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
      <div class="overflow-x-auto min-h-[150px]">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
          <SortableTableHeader :columns="tableColumns" :sort-by="productStore.sortBy"
            :sort-direction="productStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <TableLoadingState v-if="productStore.loading" :is-loading="true" :total-items="productStore.totalItems"
            :item-name="'products'" loading-text="Loading products..." loading-subtext="Fetching your product data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <TableLoadingState v-if="productStore.items.length === 0 && !productStore.loading" :is-loading="false"
              :isEmpty="true" :has-search="!!searchQuery" :item-name="'products'" empty-icon="fas fa-boxes"
              empty-title="No products found"
              :empty-message="searchQuery ? 'No products match your search criteria.' : 'Get started by creating your first Product.'"
              :create-button-text="'Add First Product'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
              class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[30px]">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center space-x-3">
                  <img v-if="data.image_url" :src="data.image_url" :alt="data.name"
                    class="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                  <div v-else
                    class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    <i class="fas fa-box text-gray-500 dark:text-gray-400 text-lg"></i>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ data.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      SKU: {{ data.sku || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                <span :class="[
                  data.is_active === 1 || data.is_active === true
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                ]">
                  {{ data.is_active === 1 || data.is_active === true ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewItem(data)" v-permission="['products.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => (data.showDropdown = false)"
                    v-permission="['products.update', 'products.delete']">
                    <button @click="data.showDropdown = !data.showDropdown"
                      class="p-1.5 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Actions">
                      <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                    </button>

                    <div v-if="data.showDropdown"
                      class="absolute right-0 z-[100] w-44 mt-2 origin-top-right rounded-md shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none">
                      <div class="py-1">
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['products.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <button @click="confirmDelete(data); data.showDropdown = false"
                          v-permission="['products.delete']"
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

    <div v-if="productStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="productStore.totalItems > 0" :total-items="productStore.totalItems"
        :per-page="productStore.perPage" :current-page="productStore.currentPage" :last-page="productStore.lastPage"
        :is-loading="productStore.isLoading" @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Product' : 'Edit Product'"
    maxWidth="2xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 gap-4">

        <!-- Profile Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
          <div class="flex items-center space-x-4">
            <div v-if="previewImage" class="relative">
              <img :src="previewImage" alt="Profile Preview"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div v-else-if="formData.image" class="relative">
              <img :src="formData.image" alt="Product Image"
                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
              <button @click="removeImage" type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div>
              <label for="product-image"
                class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                {{ formData.image || previewImage ? 'Change Image' : 'Upload Image' }}
              </label>
              <input id="product-image" type="file" accept="image/*" @change="handleImageUpload" class="hidden">
            </div>
          </div>
          <p v-if="productStore.validationErrors.image" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productStore.validationErrors.image[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter product name"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': productStore.validationErrors.name }" />
          <p v-if="productStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productStore.validationErrors.name[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.sku" type="text" placeholder="Enter SKU (e.g., PRD-001)"
            @change="clearValidationError('sku')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': productStore.validationErrors.sku }" />
          <p v-if="productStore.validationErrors.sku" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productStore.validationErrors.sku[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div class="flex items-center space-x-6">
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="1" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600" />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="formData.is_active" type="radio" :value="0" @change="clearValidationError('is_active')"
                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600" />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
            </label>
          </div>
          <p v-if="productStore.validationErrors.is_active" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ productStore.validationErrors.is_active[0] }}
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Cancel
          </button>

          <button type="submit" :disabled="productStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm text-white transition',
            productStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700',
          ]">
            <span v-if="productStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>
              {{ modalMode === 'create' ? 'Create Product' : 'Update Product' }}
            </span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="2xl" title="Product Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-col items-center mb-4">
          <div v-if="viewingItem.image_url" class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-4">
            <img :src="viewingItem.image_url" :alt="viewingItem.name" class="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
          </div>
          <div v-else class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-4">
            <i class="fas fa-box text-gray-500 dark:text-gray-400 text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ viewingItem.name }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            SKU: {{ viewingItem.sku || 'N/A' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Status</label>
            <span :class="[
              'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
              viewingItem.is_active === 1 || viewingItem.is_active === true
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
            ]">
              {{ viewingItem.is_active === 1 || viewingItem.is_active === true ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="text-center">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.created_at || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button v-permission="['products.update']" @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Product
      </button>
    </div>
  </BaseModal>

  <BaseModal :show="showDeleteModal" title="Delete Product" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Product</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete
          <strong>{{ deletingItem?.name || 'this item' }}</strong>? This action cannot be undone.
        </p>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ deletingItem?.name }}</span>
          </div>
          <div class="flex items-center space-x-3 mt-1">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU:</span>
            <span class="text-sm font-mono text-gray-900 dark:text-white">{{ deletingItem?.sku || 'N/A' }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="productStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          productStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700',
        ]">
          <span v-if="productStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Product</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const refresh = ref(false);
const previewImage = ref(null);

const tableColumns = ref([
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    type: 'string',
  },
  {
    key: 'is_active',
    label: 'Status',
    sortable: true,
    type: 'boolean',
    width: '100px',
  },
]);

// Initialize store
const productStore = useProductStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data
const formData = ref({
  image: null,
  name: '',
  sku: '',
  is_active: 1
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return productStore.items || [];
});

const calculateRowNumber = (index) => {
  if (productStore.pagination?.from && productStore.pagination.from > 0) {
    return productStore.pagination.from + index;
  }
  return (productStore.pagination.current_page - 1) * productStore.pagination.per_page + index + 1;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  formData.value.image = file;
  previewImage.value = URL.createObjectURL(file);
};

const removeImage = () => {
  formData.value.image = null;
  previewImage.value = null;
};

const clearValidationError = (fieldName) => {
  if (productStore.validationErrors && productStore.validationErrors[fieldName]) {
    const updatedErrors = { ...productStore.validationErrors };
    delete updatedErrors[fieldName];
    productStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  productStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await productStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  productStore.search('');
};

onMounted(async () => {
  await getData();
});

const getData = async () => {
  await productStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    searchQuery.value = '';
    await productStore.clearFilters();
  } finally {
    refresh.value = false;
  }
};

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

  formData.value = {
    name: item.name || '',
    sku: item.sku || '',
    is_active: item.is_active === 1 || item.is_active === true ? 1 : 0
  };

  previewImage.value = item.image_url || null;
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
    sku: '',
    is_active: 1
  };
  currentItem.value = null;
  previewImage.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  if (formData.value.image) {
    formDataToSend.append('image', formData.value.image);
  }
  formDataToSend.append('name', formData.value.name);
  formDataToSend.append('sku', formData.value.sku);
  formDataToSend.append('is_active', formData.value.is_active);

  let result;
  if (modalMode.value === 'create') {
    result = await productStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await productStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    await getData();
  }
};

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await productStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      await getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await productStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await productStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = productStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await productStore.sort(column, order);
};

</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>