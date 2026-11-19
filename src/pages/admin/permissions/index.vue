<template>
  <PageHeader title="Permissions" description="" />

  <ListPageCart>
    <!-- Filter Bar with All Filters -->
    <FilterBar ref="filterBarRef" :show-create-button="true" create-button-text="Create New"
      :create-permission="['permissions.create']" :show-search="true" :search-value="searchQuery"
      search-placeholder="Search by name, title or group..." :show-refresh="true" @create="openCreateModal" @search="handleSearch"
      @refresh="refreshData" />

    <!-- Data Table -->
    <DataTable>
      <!-- Table Header -->
      <template #header>
        <SortableTableHeader :columns="tableColumns" :sort-by="permissionStore.sortBy"
          :sort-direction="permissionStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
          @sort="sortByColumn" />
      </template>

      <!-- Loading State -->
      <template #loading>
        <TableLoadingState v-if="permissionStore.loading" :is-loading="true" :total-items="permissionStore.totalItems"
          :item-name="'permissions'" loading-text="Loading permissions..." loading-subtext="Fetching your permission data" />
      </template>

      <!-- Empty State -->
      <template #empty>
        <TableLoadingState v-if="!permissionStore.loading && permissionStore.items.length === 0" :is-loading="false" :isEmpty="true"
          :has-search="!!searchQuery" :item-name="'permissions'" empty-icon="fas fa-users" empty-title="No permissions found"
          :empty-message="searchQuery ? 'No permissions match your search criteria.' : 'Get started by creating your first permission.'"
          :create-button-text="'Add First Permission'" @create="openCreateModal" @clear-search="clearSearch" />
      </template>

      <!-- Data Rows -->
      <template #rows>
        <TableRow v-for="(data, index) in displayedItems" :key="data.id" :item="data"
          :row-number="calculateRowNumber(index)" :columns="tableColumns" :show-sl="true" :show-actions="true"
          :show-view-button="true" :show-dropdown="true" :show-edit-button="true" :show-delete-button="true"
          :view-permission="['permissions.view']" :edit-permission="['permissions.update']" :delete-permission="['permissions.delete']"
          @view="viewItem" @edit="editItem" @delete="confirmDelete">
          <!-- Custom Column: Name -->
          <template #column-name="{ item }">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.name || 'N/A' }}</span>
          </template>

          <!-- Custom Column: Title -->
          <template #column-title="{ item }">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.title || 'N/A' }}</span>
          </template>

          <!-- Custom Column: Group -->
          <template #column-group="{ item }">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.group || 'N/A' }}</span>
          </template>
        </TableRow>
      </template>

      <!-- Pagination -->
      <template #pagination>
        <div v-if="permissionStore.pagination.total > 0" class="mt-6">
          <Pagination v-if="permissionStore.totalItems > 0" :total-items="permissionStore.totalItems" :per-page="permissionStore.perPage"
            :current-page="permissionStore.currentPage" :last-page="permissionStore.lastPage" :is-loading="permissionStore.isLoading"
            @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
      </template>
    </DataTable>
  </ListPageCart>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Permission' : 'Edit Permission'"
    maxWidth="4xl" @close="closeModal">
    <GlobalForm ref="formRef" :mode="modalMode === 'create' ? 'create' : 'edit'" :loading="loading"
      :focus-first-error="false" :submit-text="modalMode === 'create' ? 'Save' : 'Update'" submit-icon="save"
      @submit="handleSubmit" @cancel="closeModal">
      <GlobalFormSection :columns="2">
        <!-- Name -->
        <TextInput v-model="formData.name" label="Name" placeholder="Enter permission name (e.g., users.create)" required
          :error="permissionStore.validationErrors.name" @input="clearValidationError('name')" />

        <!-- Title -->
        <TextInput v-model="formData.title" label="Title" placeholder="Enter display title (e.g., Create Users)" required
          :error="permissionStore.validationErrors.title" @input="clearValidationError('title')" />

        <!-- Group -->
        <TextInput v-model="formData.group" label="Group" placeholder="Enter group name (e.g., Users, Companies, etc.)" required
          :error="permissionStore.validationErrors.group" @input="clearValidationError('group')" />

        <!-- Global Form Errors -->
        <div v-if="Object.keys(permissionStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in permissionStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div> 
      </GlobalFormSection>
    </GlobalForm>
  </BaseModal>

  <!-- View Modal -->
  <GlobalViewModal v-model="showViewModal" :item="viewingItem" title="Permission Details"
    :display-fields="permissionViewFields" header-icon-class="fas fa-key text-purple-500 dark:text-purple-400 text-2xl"
    header-icon-bg-class="bg-purple-50 dark:bg-purple-900/30" @close="closeViewModal">
    <template #field-group="{ item }">
      <span class="text-sm text-gray-900 dark:text-white">{{ item.group || 'N/A' }}</span>
    </template>
  </GlobalViewModal>

  <!-- Delete Confirmation Modal -->
  <GlobalDeleteModal v-model="showDeleteModal" :item="deletingItem" title="Delete Permission"
    description="Are you sure you want to delete this permission? This action cannot be undone."
    :display-fields="deleteDisplayFields" :loading="loading" confirm-text="Delete Permission" loading-text="Deleting..."
    @confirm="handleDelete" @cancel="closeDeleteModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePermissionStore } from '@/stores/permissionStore';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import GlobalDeleteModal from '@/components/common/GlobalDeleteModal.vue';
import GlobalViewModal from '@/components/common/GlobalViewModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import GlobalForm from '@/components/common/GlobalForm.vue';
import GlobalFormSection from '@/components/common/GlobalFormSection.vue';
import TextInput from '@/components/common/TextInput.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import ListPageCart from '@/components/common/ListPageCart.vue';
import DataTable from '@/components/common/DataTable.vue';
import TableRow from '@/components/common/TableRow.vue';

// ========== STATE AND CONFIGURATION ==========
const permissionStore = usePermissionStore();

const tableColumns = ref([
  {
    "key": "name",
    "label": "Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "title",
    "label": "Title",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "group",
    "label": "Group",
    "sortable": true,
    "type": "string"
  }
]);

const searchQuery = computed({
  get: () => permissionStore.searchQuery || '',
  set: (value) => { permissionStore.searchQuery = value; }
});

const filters = computed({
  get: () => permissionStore.filters || {},
  set: (value) => { permissionStore.filters = value; }
});

const displayedItems = computed(() => {
  return permissionStore.items || [];
});

const loading = ref(false);

// ========== LIST FUNCTIONALITIES START ==========
const calculateRowNumber = (index) => {
  if (permissionStore.pagination?.from && permissionStore.pagination.from > 0) {
    return permissionStore.pagination.from + index;
  }
  return (permissionStore.pagination.current_page - 1) * permissionStore.pagination.per_page + index + 1;
};

const handleSearch = (query) => {
  permissionStore.search(query);
};

const refreshData = async () => {
  refresh.value = true;
  try {
    searchQuery.value = '';
    permissionStore.pagination.current_page = 1;
    await permissionStore.get();
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  permissionStore.search('');
};

const getData = async () => {
  await permissionStore.get();
};

const handlePerPageChange = async (newPerPage) => {
  await permissionStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await permissionStore.paginate(page);
};

const sortByColumn = async ({ column, direction }) => {
  await permissionStore.sort(column, direction);
};
// ========== LIST FUNCTIONALITIES END ==========

// ========== CREATE / EDIT FORM FUNCTIONALITIES START ==========
const isModalOpen = ref(false);
const formData = ref({
  name: '',
  title: '',
  group: ''
});
const currentItem = ref(null);
const modalMode = ref('create');
const formRef = ref(null);
const refresh = ref(false);

const clearValidationError = (fieldName) => {
  if (permissionStore.validationErrors && permissionStore.validationErrors[fieldName]) {
    const updatedErrors = { ...permissionStore.validationErrors };
    delete updatedErrors[fieldName];
    permissionStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  permissionStore.validationErrors = {};
};

const resetForm = () => {
  formData.value = {
    name: '',
    title: '',
    group: ''
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
    name: item.name || '',
    title: item.title || '',
    group: item.group || ''
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
    const value = formData.value[key];

    if (value === null || value === undefined || value === '') {
      return;
    }

    formDataToSend.append(key, value);
  });

  let result;
  if (modalMode.value === 'create') {
    result = await permissionStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await permissionStore.update(currentItem.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};
// ========== CREATE / EDIT FORM FUNCTIONALITIES END ==========

// ========== VIEW MODAL FUNCTIONALITIES START ==========
const showViewModal = ref(false);
const viewingItem = ref(null);

const permissionViewFields = [
  { key: 'name', label: 'Name' },
  { key: 'title', label: 'Title' },
  { key: 'group', label: 'Group' },
  { key: 'created_at', label: 'Created At' }
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
  { key: 'name', label: 'Name' },
  { key: 'group', label: 'Group' }
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
  if (deletingItem.value) {
    const result = await permissionStore.deleteItem(deletingItem.value.id);
    if (result && result.success) {
      closeDeleteModal();
      getData();
    }
  }
};
// ========== DELETE MODAL FUNCTIONALITIES END ==========

onMounted(async () => {
  await getData();
});
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>
