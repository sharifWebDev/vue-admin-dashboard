<template>
  <PageHeader title="Roles" description="" />

  <ListPageCart>
    <!-- Filter Bar with All Filters -->
    <FilterBar ref="filterBarRef" :show-create-button="true" create-button-text="Create New"
      :create-permission="['roles.create']" :show-search="true" :search-value="searchQuery"
      search-placeholder="Search by name..." :show-refresh="true" @create="openCreateModal" @search="handleSearch"
      @refresh="refreshData" />

    <!-- Data Table -->
    <DataTable>
      <!-- Table Header -->
      <template #header>
        <SortableTableHeader :columns="tableColumns" :sort-by="roleStore.sortBy"
          :sort-direction="roleStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
          @sort="sortByColumn" />
      </template>

      <!-- Loading State -->
      <template #loading>
        <TableLoadingState v-if="roleStore.loading" :is-loading="true" :total-items="roleStore.totalItems"
          :item-name="'roles'" loading-text="Loading roles..." loading-subtext="Fetching your role data" />
      </template>

      <!-- Empty State -->
      <template #empty>
        <TableLoadingState v-if="!roleStore.loading && roleStore.items.length === 0" :is-loading="false" :isEmpty="true"
          :has-search="!!searchQuery" :item-name="'roles'" empty-icon="fas fa-users" empty-title="No roles found"
          :empty-message="searchQuery ? 'No roles match your search criteria.' : 'Get started by creating your first role.'"
          :create-button-text="'Add First Role'" @create="openCreateModal" @clear-search="clearSearch" />
      </template>

      <!-- Data Rows -->
      <template #rows>
        <TableRow v-for="(data, index) in displayedItems" :key="data.id" :item="data"
          :row-number="calculateRowNumber(index)" :columns="tableColumns" :show-sl="true" :show-actions="true"
          :show-view-button="true" :show-dropdown="true" :show-edit-button="true" :show-delete-button="true"
          :view-permission="['roles.view']" :edit-permission="['roles.update']" :delete-permission="['roles.delete']"
          @view="viewItem" @edit="editItem" @delete="confirmDelete">

          <!-- Custom Column: Name -->
          <template #column-name="{ item }">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.name || 'N/A' }}</span>
          </template>

          <!-- Custom Column: Permissions -->
          <template #column-permissions="{ item }">
            <div class="flex flex-wrap gap-1">
              <span v-if="item.permissions && item.permissions.length > 0"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ item.permissions.length }} permission{{ item.permissions.length !== 1 ? 's' : '' }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-500 text-xs">No permissions</span>
            </div>
          </template>

          <!-- Custom Action: Assign Permissions -->
          <template #actions-before="{ item }">
            <button @click="openAssignPermissionsModal(item)" class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1.5 rounded bg-purple-50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              title="Assign Permissions">
              <i class="fas fa-key"></i>
            </button>
          </template>
        </TableRow>
      </template>

      <!-- Pagination -->
      <template #pagination>
        <div v-if="roleStore.pagination.total > 0" class="mt-6">
          <Pagination v-if="roleStore.totalItems > 0" :total-items="roleStore.totalItems" :per-page="roleStore.perPage"
            :current-page="roleStore.currentPage" :last-page="roleStore.lastPage" :is-loading="roleStore.isLoading"
            @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
      </template>
    </DataTable>
  </ListPageCart>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create Role' : 'Edit Role'"
    maxWidth="4xl" @close="closeModal">
    <GlobalForm ref="formRef" :mode="modalMode === 'create' ? 'create' : 'edit'" :loading="loading"
      :focus-first-error="false" :submit-text="modalMode === 'create' ? 'Save' : 'Update'" submit-icon="save"
      @submit="handleSubmit" @cancel="closeModal">
      <GlobalFormSection :columns="1">
        <TextInput v-model="formData.name" label="Name" placeholder="Enter role name" required
          :error="roleStore.validationErrors.name" @input="clearValidationError('name')" />
      </GlobalFormSection>
    </GlobalForm>
  </BaseModal>

  <!-- View Modal -->
  <GlobalViewModal v-model="showViewModal" :item="viewingItem" title="Role Details"
    :display-fields="roleViewFields" header-icon-class="fas fa-user-shield text-purple-500 dark:text-purple-400 text-2xl"
    header-icon-bg-class="bg-purple-50 dark:bg-purple-900/30" @close="closeViewModal">
    <template #field-permissions="{ item }">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.permissions ? item.permissions.length : 0 }}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400">permission{{ (item.permissions?.length || 0) !== 1 ? 's' : '' }}</span>
      </div>
    </template>
  </GlobalViewModal>

  <!-- Assign Permissions Modal -->
  <BaseModal v-if="assigningPermissionsItem" :show="showAssignPermissionsModal" title="Assign Permissions"
    maxWidth="7xl" @close="closeAssignPermissionsModal">
    <div class="py-1">
      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Assign permissions to role: <span class="font-semibold text-gray-800 dark:text-white">{{
            assigningPermissionsItem.name }}</span>
        </p>
      </div>

      <!-- Search and Select All Controls -->
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="relative flex-grow max-w-sm">
          <input v-model="permissionSearch" type="search" placeholder="Search permissions..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all focus:shadow-sm text-sm" />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <i class="fas fa-search text-sm"></i>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="toggleSelectAll"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
            <i class="fas" :class="isAllSelected ? 'fa-check-square' : 'fa-square'"></i>
            {{ isAllSelected ? 'Deselect All' : 'Select All' }}
          </button>
        </div>
      </div>

      <!-- Loading State for Permissions -->
      <div v-if="permissionsLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-500 dark:text-blue-400 mb-3"></i>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading permissions...</p>
      </div>

      <!-- Permission Groups -->
      <div v-else-if="filteredPermissionGroups"
        class="max-h-[52vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(group, groupName) in filteredPermissionGroups" :key="groupName"
          class="mb-4 last:mb-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <!-- Group Header with Checkbox -->
          <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input type="checkbox" :checked="isGroupSelected(groupName)" @change="toggleGroup(groupName)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 h-4 w-4" />
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ groupName }}</h3>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedCountInGroup(groupName) }} / {{ group.length }} selected
              </span>
            </div>
          </div>

          <!-- Permissions Grid -->
          <div class="p-3 bg-white dark:bg-gray-900">
            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-0">
              <div v-for="permission in group" :key="permission.id"
                class="flex items-center gap-1 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                <input type="checkbox" :id="`perm-${permission.id}`" :value="permission.id"
                  v-model="selectedPermissions"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 h-4 w-4" />
                <label :for="`perm-${permission.id}`"
                  class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2 flex-grow">
                  <span class="truncate">{{ permission.title || permission.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!permissionsLoading"
        class="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <i class="fas fa-key text-gray-300 dark:text-gray-600 text-4xl mb-3"></i>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ permissionSearch ? 'No permissions found matching your search.' : 'No permissions available.' }}
        </p>
      </div>

      <!-- Summary -->
      <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Total selected: <span class="font-semibold text-gray-800 dark:text-white">{{ selectedPermissions.length
                }}</span>
              out of <span class="font-semibold">{{ allPermissions.length }}</span> permissions
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button @click="clearSelection"
              class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1">
              <i class="fas fa-times"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Global Form Errors -->
      <div v-if="Object.keys(roleStore.validationErrors).length > 0"
        class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
        <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
          <li v-for="(errors, field) in roleStore.validationErrors" :key="field">
            • {{ errors[0] }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
      <button type="button" @click="closeAssignPermissionsModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Cancel
      </button>
      <button @click="handleAssignPermissions" :disabled="roleStore.loading || permissionsLoading" :class="[
        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
        (roleStore.loading || permissionsLoading) ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
      ]">
        <span v-if="roleStore.loading || permissionsLoading">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          {{ roleStore.loading ? 'Assigning...' : 'Loading...' }}
        </span>
        <span v-else>
          <i class="fas fa-key mr-2"></i>
          Assign Permissions
        </span>
      </button>
    </div>
  </BaseModal>

   <!-- Delete Confirmation Modal -->
  <GlobalDeleteModal v-model="showDeleteModal" :item="deletingItem" title="Delete Role"
    description="Are you sure you want to delete this role? This action cannot be undone."
    :display-fields="deleteDisplayFields" :loading="roleStore.loading" confirm-text="Delete Role"
    loading-text="Deleting..." @confirm="handleDelete" @cancel="closeDeleteModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoleStore } from '@/stores/roleStore.js';
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
import axiosClient from '@/axiosClient';

// ========== STATE AND CONFIGURATION ==========
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();

const tableColumns = ref([
  {
    "key": "name",
    "label": "Name",
    "sortable": true,
    "type": "string"
  },
  {
    "key": "permissions",
    "label": "Permissions",
    "sortable": false,
    "type": "string"
  }
]);

const searchQuery = computed({
  get: () => roleStore.searchQuery || '',
  set: (value) => { roleStore.searchQuery = value; }
});

const filters = computed({
  get: () => roleStore.filters || {},
  set: (value) => { roleStore.filters = value; }
});

const displayedItems = computed(() => {
  return roleStore.items || [];
});

const loading = ref(false);
const refresh = ref(false);

// ========== LIST FUNCTIONALITIES START ==========
const calculateRowNumber = (index) => {
  if (roleStore.pagination?.from && roleStore.pagination.from > 0) {
    return roleStore.pagination.from + index;
  }
  return (roleStore.pagination.current_page - 1) * roleStore.pagination.per_page + index + 1;
};

const handleSearch = (query) => {
  roleStore.search(query);
};

const refreshData = async () => {
  refresh.value = true;
  try {
    searchQuery.value = '';
    roleStore.pagination.current_page = 1;
    await roleStore.get();
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  roleStore.search('');
};

const getData = async () => {
  await roleStore.get();
};

const handlePerPageChange = async (newPerPage) => {
  await roleStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await roleStore.paginate(page);
};

const sortByColumn = async ({ column, direction }) => {
  await roleStore.sort(column, direction);
};
// ========== LIST FUNCTIONALITIES END ==========

// ========== CREATE / EDIT FORM FUNCTIONALITIES START ==========
const isModalOpen = ref(false);
const formData = ref({
  name: ''
});
const currentItem = ref(null);
const modalMode = ref('create');
const formRef = ref(null);

const clearValidationError = (fieldName) => {
  if (roleStore.validationErrors && roleStore.validationErrors[fieldName]) {
    const updatedErrors = { ...roleStore.validationErrors };
    delete updatedErrors[fieldName];
    roleStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  roleStore.validationErrors = {};
};

const resetForm = () => {
  formData.value = {
    name: ''
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
    name: item.name || ''
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

    if (value !== null && value !== undefined && value !== '') {
      formDataToSend.append(key, value);
    }
  });

  let result;
  if (modalMode.value === 'create') {
    result = await roleStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await roleStore.update(currentItem.value.id, formDataToSend);
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

const roleViewFields = [
  { key: 'name', label: 'Role Name' },
  { key: 'permissions', label: 'Permissions' }
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
  { key: 'name', label: 'Name' }
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
    const result = await roleStore.deleteItem(deletingItem.value.id);
    if (result && result.success) {
      closeDeleteModal();
      getData();
    }
  }
};

// ========== ASSIGN PERMISSIONS FUNCTIONALITIES START ==========
const showAssignPermissionsModal = ref(false);
const assigningPermissionsItem = ref(null);
const selectedPermissions = ref([]);
const allPermissions = ref([]);
const permissionsLoading = ref(false);
const permissionSearch = ref('');

const groupedPermissions = computed(() => {
  if (!viewingItem.value || !viewingItem.value.permissions) {
    return {};
  }

  const groups = {};
  viewingItem.value.permissions.forEach((permission) => {
    const group = permission.group || 'General';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
  });

  return groups;
});

const permissionGroups = computed(() => {
  const groups = {};
  allPermissions.value.forEach((permission) => {
    const group = permission.group || 'General';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
  });

  return groups;
});

const filteredPermissionGroups = computed(() => {
  if (!permissionSearch.value) {
    return permissionGroups.value;
  }

  const searchTerm = permissionSearch.value.toLowerCase();
  const filteredGroups = {};

  Object.entries(permissionGroups.value).forEach(([groupName, permissions]) => {
    const filteredPermissions = permissions.filter((permission) =>
      permission.name.toLowerCase().includes(searchTerm) ||
      (permission.title && permission.title.toLowerCase().includes(searchTerm)) ||
      groupName.toLowerCase().includes(searchTerm)
    );

    if (filteredPermissions.length > 0) {
      filteredGroups[groupName] = filteredPermissions;
    }
  });

  return filteredGroups;
});

const isAllSelected = computed(() => {
  return allPermissions.value.length > 0 &&
    selectedPermissions.value.length === allPermissions.value.length;
});

const openAssignPermissionsModal = async (item) => {
  assigningPermissionsItem.value = item;

  await loadAllPermissions();

  if (item.permissions && item.permissions.length > 0) {
    selectedPermissions.value = item.permissions.map((p) => p.id);
  } else {
    selectedPermissions.value = [];
  }

  permissionSearch.value = '';
  showAssignPermissionsModal.value = true;
};

const loadAllPermissions = async () => {
  permissionsLoading.value = true;
  try {
    const response = await permissionStore.getAll();
    allPermissions.value = response.data;
  } catch (error) {
    console.error('Error loading permissions:', error);
    allPermissions.value = [];
  } finally {
    permissionsLoading.value = false;
  }
};

const closeAssignPermissionsModal = () => {
  showAssignPermissionsModal.value = false;
  assigningPermissionsItem.value = null;
  selectedPermissions.value = [];
  allPermissions.value = [];
  permissionSearch.value = '';
};

const isGroupSelected = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  if (groupPermissions.length === 0) return false;

  return groupPermissions.every((permission) =>
    selectedPermissions.value.includes(permission.id)
  );
};

const selectedCountInGroup = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  return groupPermissions.filter((permission) =>
    selectedPermissions.value.includes(permission.id)
  ).length;
};

const toggleGroup = (groupName) => {
  const groupPermissions = permissionGroups.value[groupName] || [];
  const allSelected = isGroupSelected(groupName);

  if (allSelected) {
    // Deselect all in group
    selectedPermissions.value = selectedPermissions.value.filter((permId) =>
      !groupPermissions.some((p) => p.id === permId)
    );
  } else {
    // Select all in group
    const newSelected = [...selectedPermissions.value];
    groupPermissions.forEach((permission) => {
      if (!newSelected.includes(permission.id)) {
        newSelected.push(permission.id);
      }
    });
    selectedPermissions.value = newSelected;
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all
    selectedPermissions.value = [];
  } else {
    // Select all
    selectedPermissions.value = allPermissions.value.map((p) => p.id);
  }
};

const clearSelection = () => {
  selectedPermissions.value = [];
};

const handleAssignPermissions = async () => {
  if (!assigningPermissionsItem.value) return;

  const payload = selectedPermissions.value;

  const result = await assignPermissions(
    assigningPermissionsItem.value.id,
    payload
  );

  if (result && result.success) {
    closeAssignPermissionsModal();
    await getData();
  }
};

const assignPermissions = async (roleId, permissionsArray) => {
  try {
    const apiUrl = `/roles/${roleId}/permissions`;

    const response = await axiosClient.post(apiUrl, {
      permissions: permissionsArray
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response.data };
  } finally {
    permissionsLoading.value = false;
  }
};
// ========== ASSIGN PERMISSIONS FUNCTIONALITIES END ==========

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
