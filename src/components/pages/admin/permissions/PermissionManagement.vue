<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Permissions
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
        <button @click="openCreateModal" v-permission="['permissions.create']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>Create New</span>
        </button>
      </div>

      <!-- Right Side: Search -->
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div class="relative flex-grow max-w-md">
          <input v-model="searchQuery" @input="handleSearch" type="search"
            placeholder="Search by name, title or group..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-base"></i>
          </div>
        </div>
        <div
          class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1">
          <button @click="refreshData" class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
          <SortableTableHeader :columns="tableColumns" :sort-by="permissionStore.sortBy"
            :sort-direction="permissionStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
            @sort="sortByColumn" />

          <!-- Loading State - Inside table body -->
          <TableLoadingState v-if="permissionStore.loading" :is-loading="true" :total-items="permissionStore.totalItems"
            :item-name="'permissions'" loading-text="Loading permissions..."
            loading-subtext="Fetching your permission data" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

            <!-- Empty State -->
            <TableLoadingState v-if="permissionStore.items.length === 0" :is-loading="false" :isEmpty="true"
              :has-search="!!searchQuery" :item-name="'permissions'" empty-icon="fas fa-users"
              empty-title="No permissions found"
              :empty-message="searchQuery ? 'No permissions match your search criteria.' : 'Get started by creating your first permission.'"
              :create-button-text="'Add First Permission'" @create="openCreateModal" @clear-search="clearSearch" />

            <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.name || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.title || 'N/A' }}
              </td>
              <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ data.group || 'N/A' }}
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium relative">
                <div class="flex items-center justify-end gap-2">

                  <button @click="viewItem(data)" v-permission="['permissions.view']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>

                  <div class="relative inline-block text-left" v-click-outside="() => data.showDropdown = false"
                    v-permission="['permissions.update', 'permissions.delete']">
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
                        <button @click="editItem(data); data.showDropdown = false" v-permission="['permissions.update']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                          <i class="fas fa-edit text-yellow-500"></i>
                          Edit
                        </button>

                        <!-- <button @click="confirmDelete(data); data.showDropdown = false" v-permission="['permissions.delete']"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                          <i class="fas fa-trash"></i>
                          Delete
                        </button> -->
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

    <div v-if="permissionStore.pagination.total > 0" class="mt-6">
      <Pagination v-if="permissionStore.totalItems > 0" :total-items="permissionStore.totalItems"
        :per-page="permissionStore.perPage" :current-page="permissionStore.currentPage"
        :last-page="permissionStore.lastPage" :is-loading="permissionStore.isLoading" @change-page="handlePageChange"
        @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen"
    :title="modalMode === 'create' ? 'Create Permission' : 'Edit Permission'" maxWidth="4xl" @close="closeModal">
    <form @submit.prevent="handleSubmit" class="px-6 py-3">
      <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.name" type="text" placeholder="Enter permission name (e.g., users.create)"
            @change="clearValidationError('name')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': permissionStore.validationErrors.name }">
          <p v-if="permissionStore.validationErrors.name" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ permissionStore.validationErrors.name[0] }}
          </p>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.title" type="text" placeholder="Enter display title (e.g., Create Users)"
            @change="clearValidationError('title')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': permissionStore.validationErrors.title }">
          <p v-if="permissionStore.validationErrors.title" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ permissionStore.validationErrors.title[0] }}
          </p>
        </div>

        <!-- Group -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group <span
              class="text-xs text-red-500 dark:text-red-500"> *</span></label>
          <input v-model="formData.group" type="text" placeholder="Enter group name (e.g., Users, Companies, etc.)"
            @change="clearValidationError('group')"
            class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': permissionStore.validationErrors.group }">
          <p v-if="permissionStore.validationErrors.group" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ permissionStore.validationErrors.group[0] }}
          </p>
        </div>

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

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="permissionStore.loading" :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
            permissionStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
          ]">
            <span v-if="permissionStore.loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
            </span>
            <span v-else>{{ modalMode === 'create' ? 'Create Permission' : 'Update Permission' }}</span>
          </button>
        </div>
      </div>
    </form>
  </BaseModal>

  <!-- View Modal -->
  <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="xl" title="Permission Details" @close="closeViewModal">
    <div class="px-6 py-3">
      <div class="text-center mb-6">
        <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-key text-gray-400 text-2xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ viewingItem.title }}</h2>
        <p class="text-gray-600 dark:text-gray-400">{{ viewingItem.name }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4"> 
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Group</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.group || 'N/A' }}</p>
        </div>
        <div class="col-span-1">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.name || 'N/A' }}</p>
        </div>
        <div class="col-span-1">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.title || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</label>
          <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.created_at || 'N/A' }}</p>
        </div> 
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeViewModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Close
      </button>
      <button @click="editItem(viewingItem)"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
        Edit Permission
      </button>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal :show="showDeleteModal" title="Delete Permission" maxWidth="lg" :showClose="false"
    @close="closeDeleteModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Permission</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{{ deletingItem?.title || deletingItem?.name || 'this permission'
            }}</strong>? This action cannot be
          undone.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="handleDelete" :disabled="permissionStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          permissionStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        ]">
          <span v-if="permissionStore.loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Deleting...
          </span>
          <span v-else>Delete Permission</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePermissionStore } from '@/stores/permissionStore.js';

import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';

const refresh = ref(false);
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

// Initialize stores
const permissionStore = usePermissionStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;

// Form data
const formData = ref({
  name: '',
  title: '',
  group: ''
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const displayedItems = computed(() => {
  return permissionStore.items || [];
});

const calculateRowNumber = (index) => {
  if (permissionStore.pagination?.from && permissionStore.pagination.from > 0) {
    return permissionStore.pagination.from + index;
  }
  return (permissionStore.pagination.current_page - 1) * permissionStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
  if (permissionStore.validationErrors[fieldName]) {
    const updatedErrors = { ...permissionStore.validationErrors };
    delete updatedErrors[fieldName];
    permissionStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  permissionStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    await permissionStore.search(searchQuery.value);
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  permissionStore.search('');
};

watch(searchQuery, (newValue) => {
  if (newValue === '') {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    permissionStore.search('');
  }
  handleSearch();
  clearAllValidationErrors();
});

onMounted(async () => {
  getData();
});

const getData = async () => {
  await permissionStore.get();
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
    title: '',
    group: ''
  };
  currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
  clearAllValidationErrors();

  const formDataToSend = new FormData();

  for (const key in formData.value) {
    const value = formData.value[key];

    if (value === null || value === undefined || value === '') {
      continue;
    }

    formDataToSend.append(key, value);
  }

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

const handleDelete = async () => {
  if (deletingItem.value) {
    const result = await permissionStore.deleteItem(deletingItem.value.id);
    if (result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
  await permissionStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await permissionStore.paginate(page);
};

const sortByColumn = async (column) => {
  const order = permissionStore.sortDirection === 'asc' ? 'desc' : 'asc';
  await permissionStore.sort(column, order);
};
</script>

<style scoped>
input,
select,
textarea {
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>