<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Raw
                    Materials</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <!-- Left Side: Create Button -->
            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="openCreateModal" v-permission="['raw_materials.create']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>Create New</span>
                </button>
            </div>

            <!-- Right Side: Search -->
            <div class="flex items-center gap-3 w-full lg:w-auto">
                <!-- Search Input -->
                <div class="relative flex-1 min-w-0 max-w-md">
                    <input v-model="searchQuery" @input="handleSearch" type="search" placeholder="Search by name..."
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
                    <SortableTableHeader :columns="tableColumns" :sort-by="rawMaterialStore.sortBy"
                        :sort-direction="rawMaterialStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State - Inside table body -->
                    <TableLoadingState v-if="rawMaterialStore.loading" :is-loading="true"
                        :total-items="rawMaterialStore.totalItems" :item-name="'raw materials'"
                        loading-text="Loading raw materials..." loading-subtext="Fetching your raw material data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <!-- Empty State -->
                        <TableLoadingState v-if="rawMaterialStore.items.length === 0" :is-loading="false"
                            :isEmpty="true" :has-search="!!searchQuery" :item-name="'raw materials'"
                            empty-icon="fas fa-cubes" empty-title="No raw materials found"
                            :empty-message="searchQuery ? 'No raw materials match your search criteria.' : 'Get started by creating your first raw material.'"
                            :create-button-text="'Add First Raw Material'" @create="openCreateModal"
                            @clear-search="clearSearch" />

                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0 h-12 w-12">
                                        <img v-if="data.image_url" :src="data.image_url" :alt="data.name"
                                            class="h-12 w-auto rounded-md object-cover">
                                        <div v-else
                                            class="h-12 w-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                            <i class="fas fa-cube text-gray-400"></i>
                                        </div>
                                    </div>
                                    <div class="flex flex-col">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ data.name || 'N/A' }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ data.measurement_unit ? data.measurement_unit?.name : '-' }}
                                ({{ data.measurement_unit ? data.measurement_unit?.symbol : '-' }})
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ data.standard_cost }}
                            </td>
                            <td class="px-6 py-1 md:py-2 lg:py-3 text-right text-sm font-medium relative">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewRawMaterial(data)" v-permission="['raw_materials.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <div class="relative inline-block text-left"
                                        v-click-outside="() => data.showDropdown = false"
                                        v-permission="['raw_materials.update', 'raw_materials.delete']">
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
                                                <button @click="editRawMaterial(data); data.showDropdown = false"
                                                    v-permission="['raw_materials.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>

                                                <button @click="confirmDelete(data); data.showDropdown = false"
                                                    v-permission="['raw_materials.delete']"
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

        <div v-if="rawMaterialStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="rawMaterialStore.totalItems > 0" :total-items="rawMaterialStore.totalItems"
                :per-page="rawMaterialStore.perPage" :current-page="rawMaterialStore.currentPage"
                :last-page="rawMaterialStore.lastPage" :is-loading="rawMaterialStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal v-if="isModalOpen" :show="isModalOpen"
        :title="modalMode === 'create' ? 'Create Raw Material' : 'Edit Raw Material'" maxWidth="2xl"
        @close="closeModal">
        <form @submit.prevent="handleSubmit" class="px-2 py-3">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <!-- Image -->
                <div class="col-span-1 lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material
                        Image</label>
                    <div class="flex items-center space-x-4">
                        <div v-if="previewImage" class="relative">
                            <img :src="previewImage" alt="Material Preview"
                                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                            <button @click="removeImage" type="button"
                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        </div>
                        <div v-else-if="currentRawMaterial?.image" class="relative">
                            <img :src="currentRawMaterial.image" :alt="currentRawMaterial.name"
                                class="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                            <button @click="removeImage" type="button"
                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        </div>
                        <div>
                            <label for="raw-material-image"
                                class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center">
                                <i class="fas fa-upload mr-2"></i>
                                {{ currentRawMaterial?.image || previewImage ? 'Change Image' : 'Upload Image' }}
                            </label>
                            <input id="raw-material-image" type="file" accept="image/*" @change="handleImageUpload"
                                class="hidden">
                        </div>
                    </div>
                    <p v-if="rawMaterialStore.validationErrors.image"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ rawMaterialStore.validationErrors.image[0] }}
                    </p>
                </div>

                <!-- Name -->
                <div class="col-span-1 lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <input v-model="formData.name" type="text" placeholder="Enter material name"
                        @change="clearValidationError('name')"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                        :class="{ 'border-red-500': rawMaterialStore.validationErrors.name }">
                    <p v-if="rawMaterialStore.validationErrors.name"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ rawMaterialStore.validationErrors.name[0] }}
                    </p>
                </div>

                <!-- Unit -->
                <div class="col-span-1 lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <select v-model="formData.measurement_unit_id" @change="clearValidationError('measurement_unit_id')"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                        :class="{ 'border-red-500': rawMaterialStore.validationErrors.measurement_unit_id }">
                        <option value="">Select a unit</option>
                        <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
                    </select>
                    <p v-if="rawMaterialStore.validationErrors.measurement_unit_id"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ rawMaterialStore.validationErrors.measurement_unit_id[0] }}
                    </p>
                </div>

                <!-- Standard Cost -->
                <div class="col-span-1 md:col-span-3 2xl:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Cost <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <div class="relative">
                        <span
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">৳</span>
                        <input v-model="formData.standard_cost" type="number" step="0.01" min="0"
                            placeholder="Enter standard cost" @change="clearValidationError('standard_cost')"
                            class="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                            :class="{ 'border-red-500': rawMaterialStore.validationErrors.standard_cost }">
                    </div>
                    <p v-if="rawMaterialStore.validationErrors.standard_cost"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ rawMaterialStore.validationErrors.standard_cost[0] }}
                    </p>
                </div>
                <!-- Form Actions -->
                <div class="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2 2xl:col-span-3">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="rawMaterialStore.loading" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                        rawMaterialStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="rawMaterialStore.loading">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
                        </span>
                        <span v-else>{{ modalMode === 'create' ? 'Create' : 'Update' }}</span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>

    <!-- View Modal -->
    <BaseModal v-if="viewingRawMaterial" :show="showViewModal" maxWidth="xl" title="Raw Material Details"
        @close="closeViewModal">
        <div class="px-6 py-3">
            <div class="text-center mb-6">
                <div v-if="viewingRawMaterial.image_url" class="mb-4">
                    <img :src="viewingRawMaterial.image_url" :alt="viewingRawMaterial.name"
                        class="h-32 w-32 rounded-lg mx-auto object-cover">
                </div>
                <div v-else
                    class="h-32 w-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-cube text-gray-400 text-3xl"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ viewingRawMaterial.name }}</h2>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</label>
                    <p class="text-sm text-gray-900 dark:text-white">
                        {{ viewingRawMaterial.measurement_unit ? viewingRawMaterial.measurement_unit?.name : '-' }}
                        ({{ viewingRawMaterial.measurement_unit ? viewingRawMaterial.measurement_unit?.symbol : '-' }})
                    </p>
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Standard Cost</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ viewingRawMaterial.standard_cost
                        }}</p>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                Close
            </button>
            <button @click="editRawMaterial(viewingRawMaterial)"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                Edit
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Raw Material" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Raw Material</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete <strong>{{ deletingRawMaterial?.name }}</strong>? This action cannot
                    be
                    undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="rawMaterialStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    rawMaterialStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="rawMaterialStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Raw Material</span>
                </button>
            </div>
        </div>
    </BaseModal>


</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRawMaterialStore } from '@/stores/rawMaterialStore';
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
        "label": "Name",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "unit",
        "label": "Unit",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "standard_cost",
        "label": "Standard Cost",
        "sortable": true,
        "type": "number"
    }
]);

// Initialize stores
const rawMaterialStore = useRawMaterialStore();
const unitStore = useProdMeasurementUnitStore();

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
    measurement_unit_id: '',
    standard_cost: '',
    image: null
});

const currentRawMaterial = ref(null);
const viewingRawMaterial = ref(null);
const deletingRawMaterial = ref(null);
const statusChangingRawMaterial = ref(null);
const modalMode = ref('create');
const previewImage = ref(null);

const loadingDropdowns = ref(false);

const displayedItems = computed(() => {
    return rawMaterialStore.items || [];
});

const units = computed(() => {
    return unitStore.items || [];
});

const calculateRowNumber = (index) => {
    if (rawMaterialStore.pagination?.from && rawMaterialStore.pagination.from > 0) {
        return rawMaterialStore.pagination.from + index;
    }
    return (rawMaterialStore.pagination.current_page - 1) * rawMaterialStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
    if (rawMaterialStore.validationErrors[fieldName]) {
        const updatedErrors = { ...rawMaterialStore.validationErrors };
        delete updatedErrors[fieldName];
        rawMaterialStore.validationErrors = updatedErrors;
    }
};

const clearAllValidationErrors = () => {
    rawMaterialStore.validationErrors = {};
};

const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await rawMaterialStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    rawMaterialStore.search('');
};

onMounted(async () => {
    getData();
    loadRelatedData();
});

const getData = async () => {
    await rawMaterialStore.get();
};

const refreshData = async () => {
    refresh.value = true;
    try {
        clearSearch();
    } finally {
        refresh.value = false;
    }
};

const loadRelatedData = async () => {
    try {
        loadingDropdowns.value = true;
        await unitStore.getAll();
    } catch (error) {
        console.error('Error loading related data:', error);
    } finally {
        loadingDropdowns.value = false;
    }
};

// Modal functions
const openCreateModal = async () => {
    if (units.value.length === 0) {
        await loadRelatedData();
    }

    resetForm();
    modalMode.value = 'create';
    isModalOpen.value = true;
    clearAllValidationErrors();
};

const editRawMaterial = async (rawMaterial) => {
    if (units.value.length === 0) {
        await loadRelatedData();
    }

    currentRawMaterial.value = rawMaterial;
    modalMode.value = 'edit';

    formData.value = {
        name: rawMaterial.name || '',
        measurement_unit_id: rawMaterial.measurement_unit?.id || '',
        standard_cost: rawMaterial.standard_cost || '',
        image: null
    };

    previewImage.value = rawMaterial.image_url || null;
    isModalOpen.value = true;
    clearAllValidationErrors();
};

const viewRawMaterial = (rawMaterial) => {
    viewingRawMaterial.value = rawMaterial;
    showViewModal.value = true;
};

const confirmDelete = (rawMaterial) => {
    deletingRawMaterial.value = rawMaterial;
    showDeleteModal.value = true;
};

const toggleStatus = (rawMaterial) => {
    statusChangingRawMaterial.value = rawMaterial;
    showStatusChangeModal.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    clearAllValidationErrors();
};

const closeViewModal = () => {
    showViewModal.value = false;
    viewingRawMaterial.value = null;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingRawMaterial.value = null;
};

const closeStatusChangeModal = () => {
    showStatusChangeModal.value = false;
    statusChangingRawMaterial.value = null;
};

const resetForm = () => {
    formData.value = {
        name: '',
        measurement_unit_id: '',
        standard_cost: '',
        image: null
    };
    currentRawMaterial.value = null;
    previewImage.value = null;
};

// Image upload
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

// CRUD operations
const handleSubmit = async () => {
    clearAllValidationErrors();

    const formDataToSend = new FormData();

    for (const key in formData.value) {
        const value = formData.value[key];

        if (value === null || value === undefined || value === '') {
            continue;
        }

        if (key === 'image' && value instanceof File) {
            formDataToSend.append(key, value);
        } else {
            formDataToSend.append(key, value);
        }
    }

    let result;
    if (modalMode.value === 'create') {
        result = await rawMaterialStore.create(formDataToSend);
    } else {
        formDataToSend.append('_method', 'PUT');
        result = await rawMaterialStore.update(currentRawMaterial.value.id, formDataToSend);
    }

    if (result && result.success) {
        closeModal();
        getData();
    }
};

const handleDelete = async () => {
    if (deletingRawMaterial.value) {
        const result = await rawMaterialStore.deleteItem(deletingRawMaterial.value.id);
        if (result.success) {
            closeDeleteModal();
            getData();
        }
    }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await rawMaterialStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await rawMaterialStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = rawMaterialStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await rawMaterialStore.sort(column, order);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>