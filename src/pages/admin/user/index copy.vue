<template>
  <PageHeader title="Users" description="" />

  <ListPageCart>
    <!-- Filter Bar with All Filters -->
    <FilterBar ref="filterBarRef" :show-create-button="true" create-button-text="Create New"
      :create-permission="['users.create']" :show-search="true" :search-value="searchQuery"
      search-placeholder="Search by name or email..." :show-refresh="true" @create="openCreateModal" @search="handleSearch"
      @refresh="refreshData" />

    <!-- Data Table -->
    <DataTable>
      <!-- Table Header -->
      <template #header>
        <SortableTableHeader :columns="tableColumns" :sort-by="userStore.sortBy"
          :sort-direction="userStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
          :show-checkbox-column="showCheckboxColumn" :items="displayedItems" :selected-ids="selectedUserIds"
          @selection-change="selectedUserIds = $event" @sort="sortByColumn" />
      </template>

      <!-- Loading State -->
      <template #loading>
        <TableLoadingState v-if="userStore.loading" :is-loading="true" :total-items="userStore.totalItems"
          :item-name="'users'" loading-text="Loading users..." loading-subtext="Fetching your user data" />
      </template>

      <!-- Empty State -->
      <template #empty>
        <TableLoadingState v-if="!userStore.loading && userStore.items.length === 0" :is-loading="false" :isEmpty="true"
          :has-search="!!searchQuery" :item-name="'users'" empty-icon="fas fa-users" empty-title="No users found"
          :empty-message="searchQuery ? 'No users match your search criteria.' : 'Get started by creating your first user.'"
          :create-button-text="'Add First User'" @create="openCreateModal" @clear-search="clearSearch" />
      </template>

      <!-- Data Rows -->
      <template #rows>
        <TableRow v-for="(data, index) in displayedItems" :key="data.id" :item="data"
          :row-number="calculateRowNumber(index)" :columns="tableColumns" :show-sl="true" :show-actions="true"
          :show-checkbox-column="showCheckboxColumn" :selected-ids="selectedUserIds"
          :show-view-button="true" :show-dropdown="true" :show-edit-button="true" :show-delete-button="true"
          :view-permission="['users.view']" :edit-permission="['users.update']" :delete-permission="['users.delete']"
          @selection-change="selectedUserIds = $event" @view="viewUser" @edit="editUser" @delete="confirmDelete">

          <!-- Custom Column: Name -->
          <template #column-name="{ item }">
            <ImageTextColumn :item="item" :image-src="item.image" :title="item.name" subtitle-key="email" size="lg"
              shape="circle" />
          </template>

          <!-- Custom Column: Email -->
          <template #column-email="{ item }">
            <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.email || 'N/A' }}</span>
          </template>

          <!-- Custom Column: Roles -->
          <template #column-roles="{ item }">
            <span class="text-sm text-gray-600 dark:text-gray-300">
              {{ data.roles && data.roles.length
                ? data.roles.map((role) => formatRole(role)).join(', ')
                : 'N/A'
              }}
            </span>
          </template>

          <!-- Custom Column: Status -->
          <template #column-status="{ item }">
            <StatusBadge :value="item.status" active-label="Active" inactive-label="Inactive" />
          </template>

          <!-- Custom Action: Toggle Status -->
          <template #actions-before="{ item }">
            <button @click="toggleStatus(item)"
              class="p-1 rounded bg-gray-50 dark:bg-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
              title="Toggle Status">
              <span :class="[
                'relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-300',
                item.status === 1 || item.status === true ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
              ]">
                <span :class="[
                  'inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300',
                  item.status === 1 || item.status === true ? 'translate-x-3.5' : 'translate-x-0.5'
                ]"></span>
              </span>
            </button>
          </template>
        </TableRow>
      </template>

      <!-- Pagination -->
      <template #pagination>
        <div v-if="userStore.pagination.total > 0" class="mt-6">
          <Pagination v-if="userStore.totalItems > 0" :total-items="userStore.totalItems" :per-page="userStore.perPage"
            :current-page="userStore.currentPage" :last-page="userStore.lastPage" :is-loading="userStore.isLoading"
            @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
      </template>
    </DataTable>
  </ListPageCart>

  <!-- Create/Edit Modal -->
  <BaseModal v-if="isModalOpen" :show="isModalOpen" :title="modalMode === 'create' ? 'Create User' : 'Edit User'"
    maxWidth="4xl" @close="closeModal">
    <GlobalForm ref="formRef" :mode="modalMode === 'create' ? 'create' : 'edit'" :loading="loading"
      :focus-first-error="false" :submit-text="modalMode === 'create' ? 'Save' : 'Update'" submit-icon="save"
      @submit="handleSubmit" @cancel="closeModal">
      <GlobalFormSection :columns="2">
        <!-- Profile Image -->
        <!-- Avatar upload — replace old custom block -->
        <BaseFileUpload ref="uploader" v-model="formData.image" label="Profile Image" accept="image/*"
          :max-size="20971520" button-text="Upload Image" />

        <!-- Name -->
        <TextInput v-model="formData.name" label="Name" placeholder="Enter full name" required
          :error="userStore.validationErrors.name" @input="clearValidationError('name')" />

        <!-- Email -->
        <TextInput v-model="formData.email" label="Email" type="email" placeholder="Enter email address" required
          :error="userStore.validationErrors.email" @input="clearValidationError('email')" />

        <!-- Role -->
        <GlobalDropdown v-model="formData.role" label="Role" store-name="roleStore" placeholder="Search roles..."
          value-key="name" label-key="name" :fetch-on-mount="true" :required="true" @change="clearValidationError('role')"
          :error="userStore.validationErrors.role" />

        <!-- Phone -->
        <TextInput v-model="formData.phone" label="Phone" placeholder="Enter phone number"
          :error="userStore.validationErrors.phone" @input="clearValidationError('phone')" />

        <!-- Mobile -->
        <TextInput v-model="formData.mobile" label="Mobile" placeholder="Enter mobile number"
          :error="userStore.validationErrors.mobile" @input="clearValidationError('mobile')" />

        <!-- Address -->
        <TextAreaInput v-model="formData.address" label="Address" placeholder="Enter address"
          :error="userStore.validationErrors.address" @input="clearValidationError('address')" />

        <!-- Status -->
        <RadioInput v-model="formData.status" label="Status" :options="statusOptions" value-key="value" label-key="label"
          layout="status" active-color="green" inactive-color="red" :error="userStore.validationErrors.status" />

        <!-- Password Fields (Only for create or if password reset needed) -->
        <div v-if="modalMode === 'create' || showPasswordFields" class="col-span-1 md:col-span-2 2xl:col-span-3">
          <TextInput v-model="formData.password" label="Password" type="password" placeholder="Enter password"
            :error="userStore.validationErrors.password" @input="clearValidationError('password')" />

          <TextInput v-model="formData.password_confirmation" label="Confirm Password" type="password"
            placeholder="Confirm password" :error="userStore.validationErrors.password_confirmation"
            @input="clearValidationError('password_confirmation')" />
        </div>

        <!-- Global Form Errors -->
        <div v-if="Object.keys(userStore.validationErrors).length > 0"
          class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg col-span-1 md:col-span-2 2xl:col-span-3">
          <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
          <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
            <li v-for="(errors, field) in userStore.validationErrors" :key="field">
              • {{ errors[0] }}
            </li>
          </ul>
        </div> 
      </GlobalFormSection>
    </GlobalForm>
  </BaseModal>

  <!-- View Modal -->
  <GlobalViewModal v-model="showViewModal" :item="viewingUser" title="User Details"
    :display-fields="userViewFields" header-icon-class="fas fa-user text-blue-500 dark:text-blue-400 text-2xl"
    header-icon-bg-class="bg-blue-50 dark:bg-blue-900/30" @close="closeViewModal">
    <template #field-roles="{ item }">
      <span class="text-sm text-gray-900 dark:text-white">
        {{ item.roles && item.roles.length ? item.roles.map((role) => formatRole(role)).join(', ') : 'N/A' }}
      </span>
    </template>

    <template #field-status="{ item }">
      <span :class="[
        'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
        item.status === 1 || item.status === true
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      ]">
        {{ item.status === 1 || item.status === true ? 'Active' : 'Inactive' }}
      </span>
    </template>
  </GlobalViewModal>

  <!-- Delete Confirmation Modal -->
  <GlobalDeleteModal v-model="showDeleteModal" :item="deletingUser" title="Delete User"
    description="Are you sure you want to delete this user? This action cannot be undone."
    :display-fields="deleteDisplayFields" :loading="loading" confirm-text="Delete User" loading-text="Deleting..."
    @confirm="handleDelete" @cancel="closeDeleteModal" />

  <!-- Status Change Confirmation Modal -->
  <BaseModal :show="showStatusChangeModal" title="Change Status" maxWidth="lg" :showClose="false"
    @close="closeStatusChangeModal">
    <div class="px-6 py-3">
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
          <i class="fas fa-exchange-alt text-yellow-600 dark:text-yellow-300 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Change User Status</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to change the status of
          <strong>{{ statusChangingUser?.name || statusChangingUser?.email || 'this user' }}</strong>?
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="closeStatusChangeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="confirmStatusChange" :disabled="userStore.loading" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
          userStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
        ]">
          <span v-if="userStore.loading">
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
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRoleStore } from '@/stores/roleStore';
import BaseModal from '@/components/common/BaseModal.vue';
import GlobalDeleteModal from '@/components/common/GlobalDeleteModal.vue';
import GlobalViewModal from '@/components/common/GlobalViewModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import GlobalDropdown from '@/components/common/GlobalDropdown.vue';
import GlobalForm from '@/components/common/GlobalForm.vue';
import GlobalFormSection from '@/components/common/GlobalFormSection.vue';
import TextInput from '@/components/common/TextInput.vue';
import TextAreaInput from '@/components/common/TextAreaInput.vue';
import RadioInput from '@/components/common/RadioInput.vue';
import BaseFileUpload from '@/components/common/BaseFileUpload.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import ListPageCart from '@/components/common/ListPageCart.vue';
import DataTable from '@/components/common/DataTable.vue';
import TableRow from '@/components/common/TableRow.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ImageTextColumn from '@/components/common/ImageTextColumn.vue';
import PageHeader from '@/components/common/PageHeader.vue';

// ========== STATE AND CONFIGURATION ==========
const userStore = useUserStore();
const roleStore = useRoleStore();

const tableColumns = ref([{
  "key": "id",
  "label": "",
  "sortable": false,
  "type": "false"
},
{
  "key": "name",
  "label": "Name",
  "sortable": true,
  "type": "string"
},
{
  "key": "email",
  "label": "Email",
  "sortable": true,
  "type": "string"
},
{
  "key": "roles",
  "label": "Roles",
  "sortable": true,
  "type": "string"
},
{
  "key": "status",
  "label": "Status",
  "sortable": true,
  "type": "boolean",
  "width": "100px"
}
]);

const statusOptions = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' }
];

const searchQuery = computed({
  get: () => userStore.searchQuery || '',
  set: (value) => { userStore.searchQuery = value; }
});

const filters = computed({
  get: () => userStore.filters || {},
  set: (value) => { userStore.filters = value; }
});

const displayedItems = computed(() => {
  return userStore.items || [];
});
const selectedUserIds = ref([]);
const showCheckboxColumn = true;

const loading = ref(false);
const refresh = ref(false);
const loadingDropdowns = ref(false);

// ========== LIST FUNCTIONALITIES START ==========
const calculateRowNumber = (index) => {
  if (userStore.pagination?.from && userStore.pagination.from > 0) {
    return userStore.pagination.from + index;
  }
  return (userStore.pagination.current_page - 1) * userStore.pagination.per_page + index + 1;
};

const handleSearch = (query) => {
  userStore.search(query);
};

const refreshData = async () => {
  refresh.value = true;
  try {
    searchQuery.value = '';
    userStore.pagination.current_page = 1;
    await userStore.get();
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  userStore.search('');
};

const getData = async () => {
  await userStore.get();
};

const handlePerPageChange = async (newPerPage) => {
  await userStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
  await userStore.paginate(page);
};

const sortByColumn = async ({ column, direction }) => {
  await userStore.sort(column, direction);
};
// ========== LIST FUNCTIONALITIES END ==========

// ========== CREATE / EDIT FORM FUNCTIONALITIES START ==========
const isModalOpen = ref(false);
const formData = ref({
  name: '',
  email: '',
  role: '',
  address: '',
  phone: '',
  mobile: '',
  password: '',
  password_confirmation: '',
  status: 1,
  image: null
});
const currentUser = ref(null);
const modalMode = ref('create');
const showPasswordFields = ref(false);
const formRef = ref(null);

const clearValidationError = (fieldName) => {
  if (userStore.validationErrors && userStore.validationErrors[fieldName]) {
    const updatedErrors = { ...userStore.validationErrors };
    delete updatedErrors[fieldName];
    userStore.validationErrors = updatedErrors;
  }
};

const clearAllValidationErrors = () => {
  userStore.validationErrors = {};
};

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    role: '',
    address: '',
    phone: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    status: 1,
    image: null
  };
  currentUser.value = null;
  showPasswordFields.value = false;
};

const openCreateModal = async () => {
  // Ensure dropdown data is loaded before opening modal
  if (roleStore.items.length === 0) {
    await loadRoles();
  }

  resetForm();
  modalMode.value = 'create';
  showPasswordFields.value = true;
  isModalOpen.value = true;
  clearAllValidationErrors();
};

const editUser = (user) => {
  currentUser.value = user;
  modalMode.value = 'edit';

  let userRole = '';
  if (user.roles && user.roles.length > 0) {
    userRole = typeof user.roles[0] === 'object' ? (user.roles[0].name || user.roles[0].id) : user.roles[0];
  }

  formData.value = {
    name: user.name || '',
    email: user.email || '',
    role: userRole,
    address: user.address || '',
    phone: user.phone || '',
    mobile: user.mobile || '',
    password: '',
    password_confirmation: '',
    status: user.status === 1 || user.status === true ? 1 : 0,
    image: user.image || null
  };

  showPasswordFields.value = true;
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

    if (value === null || value === undefined || value === '') {
      return;
    }

    if (key === 'image') {
      if (value instanceof File || value instanceof Blob) {
        formDataToSend.append(key, value);
      }
      return;
    }

    formDataToSend.append(key, value);
  });

  let result;
  if (modalMode.value === 'create') {
    result = await userStore.create(formDataToSend);
  } else {
    formDataToSend.append('_method', 'PUT');
    result = await userStore.update(currentUser.value.id, formDataToSend);
  }

  if (result && result.success) {
    closeModal();
    getData();
  }
};
// ========== CREATE / EDIT FORM FUNCTIONALITIES END ==========

// ========== VIEW MODAL FUNCTIONALITIES START ==========
const showViewModal = ref(false);
const viewingUser = ref(null);

const userViewFields = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status' },
  { key: 'phone', label: 'Phone' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'address', label: 'Address', fullWidth: true }
];

const viewUser = (user) => {
  viewingUser.value = user;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingUser.value = null;
};
// ========== VIEW MODAL FUNCTIONALITIES END ==========

// ========== DELETE MODAL FUNCTIONALITIES START ==========
const showDeleteModal = ref(false);
const deletingUser = ref(null);

const deleteDisplayFields = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'roles', label: 'Roles' }
];

const confirmDelete = (user) => {
  deletingUser.value = user;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingUser.value = null;
};

const handleDelete = async () => {
  if (deletingUser.value) {
    const result = await userStore.deleteItem(deletingUser.value.id);
    if (result && result.success) {
      closeDeleteModal();
      getData();
    }
  }
};
// ========== DELETE MODAL FUNCTIONALITIES END ==========

// ========== STATUS CHANGE FUNCTIONALITIES START ==========
const showStatusChangeModal = ref(false);
const statusChangingUser = ref(null);

const toggleStatus = (user) => {
  statusChangingUser.value = user;
  showStatusChangeModal.value = true;
};

const closeStatusChangeModal = () => {
  showStatusChangeModal.value = false;
  statusChangingUser.value = null;
};

const confirmStatusChange = async () => {
  if (statusChangingUser.value) {
    try {
      const field = 'status';
      await userStore.toggleStatus(statusChangingUser.value, field);
      closeStatusChangeModal();
      getData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  }
};
// ========== STATUS CHANGE FUNCTIONALITIES END ==========

// ========== HELPERS ==========
const loadRoles = async () => {
  try {
    loadingDropdowns.value = true;
    await Promise.all([
      roleStore.getAll()
    ]);
  } catch (error) {
    console.error('Error loading related data:', error);
  } finally {
    loadingDropdowns.value = false;
  }
};

const formatRole = (text) => {
  return text
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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
