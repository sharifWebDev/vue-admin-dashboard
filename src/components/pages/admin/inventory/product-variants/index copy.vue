<template>
  <PageHeader title="Product Variants" description="" />

  <ListPageCart>
    <!-- Filter Bar with All Filters -->
    <FilterBar ref="filterBarRef" :show-create-button="true" create-button-text="Create New"
      :create-permission="['product_variants.create']" :show-search="true" :search-value="searchQuery"
      @update:search-value="searchQuery = $event" search-placeholder="Search by name, SKU, or barcode..."
      :show-refresh="true" @create="openCreateModal" @search="handleSearch" @refresh="refreshData">
      <!-- Left Side: Additional Actions -->
      <template #left-actions> </template>

      <!-- Right Side: All Filters and Actions -->
      <template #right-actions>
        <!-- Product Filter -->
        <GlobalDropdown v-model="filters.product_id" :label="false" :ai-suggestions="true" store-name="productStore" placeholder="All Products"
          value-key="id" label-key="name" :fetch-on-mount="true" class="min-w-[200px]" @change="applyFilters" />
        </template>
    </FilterBar>

    <!-- Active Filters Summary -->
    <ActiveFilterBar :filters="filters" :search-query="searchQuery" :badges="activeFilterBadges"
      @remove-filter="removeFilter" @clear-search="clearSearch" @clear-all="removeAllFilters" />

    <!-- Data Table -->
    <DataTable>
      <!-- Table Header -->
      <template #header>
        <SortableTableHeader :columns="tableColumns" :sort-by="productVariantStore.sortBy"
          :sort-direction="productVariantStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
          @sort="sortByColumn" />
      </template>

      <!-- Loading State -->
      <template #loading>
        <TableLoadingState v-if="productVariantStore.loading" :is-loading="true"
          :total-items="productVariantStore.totalItems" :item-name="'product variants'"
          loading-text="Loading product variants..." loading-subtext="Fetching your product variant data" />
      </template>

      <!-- Empty State -->
      <template #empty>
        <TableLoadingState v-if="!productVariantStore.loading && productVariantStore.items.length === 0"
          :is-loading="false" :isEmpty="true" :has-search="!!searchQuery" :item-name="'product variants'"
          empty-icon="fas fa-cubes" empty-title="No product variants found"
          :empty-message="searchQuery ? 'No product variants match your search criteria.' : 'Get started by creating your first Product Variant.'"
          :create-button-text="'Add First Variant'" @create="openCreateModal" @clear-search="clearSearch" />
      </template>

      <!-- Data Rows -->
      <template #rows>
        <TableRow v-for="(data, index) in displayedItems" :key="data.id" :item="data"
          :row-number="calculateRowNumber(index)" :columns="tableColumns" :show-sl="true" :show-actions="true"
          :show-view-button="true" :show-dropdown="true" :show-edit-button="true" :show-delete-button="true"
          :view-permission="['product_variants.view']" :edit-permission="['product_variants.update']"
          :delete-permission="['product_variants.delete']" @view="viewItem" @edit="editItem" @delete="confirmDelete">
          <!-- Custom Column: Product Name with Icon -->
          <template #column-product_name="{ item }">
            <ImageTextColumn :item="item" :image-src="item.image_url" :title="item.name" subtitle-key="sku" size="lg"
              shape="circle" />
          </template>

          <!-- Custom Column: SKU & Barcode -->
          <template #column-sku="{ item }">
            <div class="flex flex-col space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">SKU:</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ item.sku || '-' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Barcode:</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ item.barcode || '-' }}</span>
              </div>
            </div>
          </template>

          <!-- Custom Column: Quantity -->
          <template #column-quantity="{ item }">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.quantity || 0 }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ item.measurement_unit?.symbol || item.measurement_unit?.name || 'Unit' }}
              </span>
            </div>
          </template>

          <!-- Custom Column: is_active -->
          <template #column-is_active="{ item }">
            <StatusBadge :value="item.is_active" active-label="Active" inactive-label="Inactive" />
          </template>

          <!-- <template #dropdown-items="{ item, closeDropdown }">
            <button v-if="item.status === 'pending'" v-permission="['product_variants.update']"
              @click="duplicateItem(item); closeDropdown()"
              class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
              <i class="fas fa-copy text-blue-500 w-4"></i>
              <span class="font-medium">Duplicate</span>
            </button>
          </template> -->
        </TableRow>
      </template>

      <!-- Pagination -->
      <template #pagination>
        <div v-if="productVariantStore.pagination.total > 0" class="mt-6">
          <Pagination v-if="productVariantStore.totalItems > 0" :total-items="productVariantStore.totalItems"
            :per-page="productVariantStore.perPage" :current-page="productVariantStore.currentPage"
            :last-page="productVariantStore.lastPage" :is-loading="productVariantStore.isLoading"
            @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
      </template>
    </DataTable>
  </ListPageCart>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Product Variant' : 'Edit Product Variant'" maxWidth="3xl"
    @close="closeModal">

    <GlobalForm ref="formRef" :mode="modalMode === 'create' ? 'create' : 'edit'" :loading="loading"
      :focus-first-error="false"
      :submit-text="modalMode === 'create' ? 'Save' : 'Update'" submit-icon="save" @submit="handleSubmit"
      @cancel="closeModal">

      <GlobalFormSection :columns="3">
        <GlobalDropdown v-model="formData.product_id" v-model:hiddenId="hiddenProductId" label="Product"
          @change="clearValidationError('product_id')" store-name="productStore" placeholder="Search products..."
          value-key="id" label-key="name" :fetch-on-mount="true" :required="true"
          :error="productVariantStore.validationErrors.product_id" required />

        <TextInput v-model="formData.name" label="Variant Name" placeholder="e.g., 1kg, 500ml, Large"
          :error="productVariantStore.validationErrors.name" required @input="clearValidationError('name')" />

        <NumberInput v-model="formData.quantity" label="Quantity" :min="1" :step="1" :required="true"
          @input="clearValidationError('quantity')" placeholder="Enter quantity"
          :error="productVariantStore.validationErrors.quantity" />

        <GlobalDropdown v-model="formData.measurement_unit_id" v-model:hiddenId="hiddenProductId"
          label="Measurement Unit" store-name="prodMeasurementUnitStore" placeholder="Search Measurement Unit..."
          value-key="id" label-key="label" :fetch-on-mount="true" :required="true"
          :error="productVariantStore.validationErrors.measurement_unit_id"
          @change="clearValidationError('measurement_unit_id')" />

        <!-- SKU -->
        <TextInput v-model="formData.sku" label="SKU" placeholder="e.g., RICE-1KG"
          :error="productVariantStore.validationErrors.sku" required @input="clearValidationError('sku')"
          :required="true" />

        <!-- barcode -->
        <TextInput v-model="formData.barcode" label="Barcode" placeholder="Enter barcode (optional)"
          :error="productVariantStore.validationErrors.barcode" @input="clearValidationError('barcode')" />

        <!-- status -->
        <RadioInput v-model="formData.is_active" label="Status"
          :options="[{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }]" value-key="value"
          label-key="label" layout="status" active-color="green" inactive-color="red"
          :error="productVariantStore.validationErrors?.is_active" />
      </GlobalFormSection>
    </GlobalForm>
  </BaseModal>

  <GlobalViewModal v-model="showViewModal" :item="viewingItem" title="Product Variant Details"
    :display-fields="variantViewFields" :show-status="true" status-key="is_active"
    header-icon-class="fas fa-cube text-blue-500 dark:text-blue-400 text-2xl"
    header-icon-bg-class="bg-blue-50 dark:bg-blue-900/30" @edit="editItem" @close="closeViewModal">
  </GlobalViewModal>

  <GlobalDeleteModal v-model="showDeleteModal" :item="deletingItem" title="Delete Product Variant"
    description="Are you sure you want to delete this product variant? This action cannot be undone."
    :display-fields="deleteDisplayFields" :loading="loading" confirm-text="Delete Variant" loading-text="Deleting..."
    @confirm="handleDelete" @cancel="closeDeleteModal">
  </GlobalDeleteModal>

</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue';
import { useProductVariantStore } from '@/stores/productVariantStore.js';
import { useProductStore } from '@/stores/productStore';
import BaseModal from '@/components/common/BaseModal.vue';
import GlobalDeleteModal from '@/components/common/GlobalDeleteModal.vue';
import GlobalViewModal from '@/components/common/GlobalViewModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import GlobalDropdown from '@/components/common/GlobalDropdown.vue';
import GlobalForm from '@/components/common/GlobalForm.vue';
import GlobalFormSection from '@/components/common/GlobalFormSection.vue';
import TextInput from '@/components/common/TextInput.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import RadioInput from '@/components/common/RadioInput.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import ListPageCart from '@/components/common/ListPageCart.vue';
import DataTable from '@/components/common/DataTable.vue';
import TableRow from '@/components/common/TableRow.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ImageTextColumn from '@/components/common/ImageTextColumn.vue';
import ActiveFilterBar from '@/components/common/ActiveFilterBar.vue';

// ========== STATE AND CONFIGURATION ==========
const productVariantStore = useProductVariantStore();
const productStore = useProductStore();

// List state
const refresh = ref(false);
const filterBarRef = ref(null);
const tableColumns = ref([
  {
    "key": "product_name",
    "label": "Product / Variant",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "sku",
    "label": "SKU & Barcode",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "quantity",
    "label": "Quantity",
    "sortable": true,
    "type": "number"
  },
  {
    "key": "is_active",
    "label": "Status",
    "sortable": true,
    "type": "boolean",
    "width": "100px"
  }
]);

const searchQuery = computed({
  get: () => productVariantStore.searchQuery || '',
  set: (value) => { productVariantStore.searchQuery = value; }
});

const filters = computed({
  get: () => productVariantStore.filters || {},
  set: (value) => { productVariantStore.filters = value; }
});

const displayedItems = computed(() => productVariantStore.items || []);
const products = computed(() => productStore.items || []);
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '' && value !== null && value !== undefined) || searchQuery.value !== '';
});

const loading = ref(false);

// Other state currently used by the page
const form = reactive({
  quantity: 1,
  price: 0,
  discount: 0
});

const errors = reactive({
  quantity: null,
  price: null,
  discount: null
});

// ========== LIST FUNCTIONALITIES START ==========
const calculateRowNumber = (index) => {
  if (productVariantStore.pagination?.from && productVariantStore.pagination.from > 0) {
    return productVariantStore.pagination.from + index;
  }
  return (productVariantStore.pagination.current_page - 1) * productVariantStore.pagination.per_page + index + 1;
};

const handleSearch = () => {
  productVariantStore.search(searchQuery.value);
};

const applyFilters = async () => {
  const filterParams = {};
  if (filters.value.product_id) filterParams.product_id = filters.value.product_id;
  await productVariantStore.filter(filterParams);
};

const removeFilter = async (filterKey) => {
  const newFilters = { ...filters.value };
  delete newFilters[filterKey];
  filters.value = newFilters;
  await productVariantStore.filter(newFilters);
};

const removeAllFilters = async () => {
  refresh.value = true;
  try {
    filters.value = {};
    searchQuery.value = '';
    await productVariantStore.clearFilters();
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  productVariantStore.search('');
};

const getProductName = (id) => {
  if (!id) return '';
  const product = products.value.find(item => item.id === id);
  return product?.name || id;
};

const activeFilterBadges = [
  {
    key: 'product_id',
    label: 'Product',
    class: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    format: (value) => getProductName(value)
  }
];

const getData = async () => {
  await productVariantStore.get();
};

const refreshData = async () => {
  refresh.value = true;
  try {
    await productVariantStore.clearFilters();
  } finally {
    refresh.value = false;
  }
};

const handlePerPageChange = async (newPerPage) => {
  await productVariantStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await productVariantStore.paginate(page);
};

const sortByColumn = async ({ column, direction }) => {
  await productVariantStore.sort(column, direction);
};

onMounted(async () => {
  await getData();
});
// ========== LIST FUNCTIONALITIES END ==========

// ========== CREATE / EDIT FORM FUNCTIONALITIES START ==========
const isModalOpen = ref(false);
const formData = ref({
  product_id: '',
  name: '',
  quantity: null,
  measurement_unit_id: '',
  barcode: '',
  sku: '',
  is_active: true
});
const currentItem = ref(null);
const modalMode = ref('create');
const hiddenProductId = ref(null);

const clearValidationError = (fieldName) => {
  if (productVariantStore.validationErrors && productVariantStore.validationErrors[fieldName]) {
    const updatedErrors = { ...productVariantStore.validationErrors };
    delete updatedErrors[fieldName];
    productVariantStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  productVariantStore.validationErrors = {};
};

const resetForm = () => {
  formData.value = {
    product_id: '',
    name: '',
    quantity: null,
    measurement_unit_id: '',
    barcode: '',
    sku: '',
    is_active: true
  };
  currentItem.value = null;
};

const openCreateModal = () => {
  resetForm();
  modalMode.value = 'create';
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const editItem = (item) => {
  currentItem.value = item;
  modalMode.value = 'edit';
  formData.value = {
    product_id: item.product_id || '',
    name: item.name || '',
    quantity: item.quantity || null,
    measurement_unit_id: item.measurement_unit_id || '',
    barcode: item.barcode || '',
    sku: item.sku || '',
    is_active: item.is_active === true || item.is_active === 1
  };
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  clearAllValidationErrors();
};

const handleSubmit = async () => {
  clearAllValidationErrors();
  const formDataToSend = new FormData();

  Object.keys(formData.value).forEach((key) => {
    let value = formData.value[key];
    if (typeof value === 'boolean') {
      value = value ? 1 : 0;
    }
    if (value !== null && value !== undefined && value !== '') {
      formDataToSend.append(key, value);
    }
  });

  loading.value = true;
  try {
    let result;
    if (modalMode.value === 'create') {
      result = await productVariantStore.create(formDataToSend);
    } else {
      formDataToSend.append('_method', 'PUT');
      result = await productVariantStore.update(currentItem.value.id, formDataToSend);
    }
    if (result?.success) {
      closeModal();
      getData();
    }
  } catch (error) {
    console.error('Submit failed:', error);
  } finally {
    loading.value = false;
  }
};
// ========== CREATE / EDIT FORM FUNCTIONALITIES END ==========

// ========== VIEW MODAL FUNCTIONALITIES START ==========
const showViewModal = ref(false);
const viewingItem = ref(null);

const variantViewFields = [
  { key: 'product.name', label: 'Product' },
  { key: 'name', label: 'Variant Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'measurement_unit.name', label: 'Measurement Unit' }
];

const viewItem = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingItem.value = null;
};
// ========== VIEW MODAL FUNCTIONALITIES END ==========

// ========== DELETE MODAL FUNCTIONALITIES START ==========
const showDeleteModal = ref(false);
const deletingItem = ref(null);

const deleteDisplayFields = [
  { key: 'name', label: 'Variant' },
  { key: 'product.name', label: 'Product' },
  { key: 'sku', label: 'SKU' }
];

const confirmDelete = (item) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingItem.value = null;
};

const handleDelete = async () => {
  loading.value = true;
  try {
    if (deletingItem.value) {
      const result = await productVariantStore.deleteItem(deletingItem.value.id);
      if (result && result?.success) {
        closeDeleteModal();
        getData();
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
// ========== DELETE MODAL FUNCTIONALITIES END ==========
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>