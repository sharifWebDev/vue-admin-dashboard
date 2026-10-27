<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                    Activity Log
                </h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row flex-wrap justify-start items-start lg:items-center mb-4 lg:mb-6 gap-4"> 

            <!-- Right Side: Search & Filters -->
            <div class="flex flex-col sm:flex-row justify-end flex-wrap gap-4 w-full lg:w-auto items-start sm:items-end"> 
                <!-- Company filter -->
                <!-- <div class="flex flex-col relative w-full sm:w-64 lg:w-[12rem]">
                    <SearchSelect v-model="filters.company_id" :options="companies" label="Company"
                        :selected-item="selectedCompany" placeholder="-- Select Company --" :error="null"
                        class="mt-2" />
                </div> -->

                <!-- Branch Filter -->
                <!-- <div class="flex flex-col relative w-full sm:w-64 lg:w-[12rem]">
                    <SearchSelect v-model="filters.branch_id" :options="branches" label="Branch"
                        :disabled="!filters.company_id" placeholder="-- Select Branch --" :error="null" class="mt-2" />
                </div> -->

                <!-- User filter -->
                <div class="flex flex-col relative w-full sm:w-64 lg:w-[12rem]">
                    <SearchSelect v-model="filters.user_id" :options="users" label="User"
                        placeholder="-- Select User --" :error="null" class="mt-2" />
                </div>

                <!-- Action Type Filter -->
                <div class="flex flex-col relative w-full sm:w-48 hidden">
                    <label class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Action</label>
                    <select v-model="filters.action"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150">
                        <option value="">All Actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>

                <!-- Transaction Type Filter -->
                <div class="flex flex-col relative w-full sm:w-48 hidden">
                    <label class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Transaction Type</label>
                    <select v-model="filters.transaction_type"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150">
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <!-- Date Range -->
                <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div class="flex flex-col relative w-full">
                        <label for="fromDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From
                            Date</label>
                        <input v-model="filters.from_date" type="date" id="fromDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
                    </div>
                    <div class="flex flex-col relative w-full">
                        <label for="toDate" class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To
                            Date</label>
                        <input v-model="filters.to_date" type="date" id="toDate" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
              transition-all duration-150" />
                    </div>
                </div>

                <!-- Search Input -->
                <div class="relative w-full sm:w-64 lg:w-[12rem]">
                    <input v-model="filters.search" @keyup.enter="applyFilters" type="search"
                        placeholder="Search by user, description..." class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             outline-none transition-all duration-150 shadow-sm" />
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <i class="fas fa-search text-base"></i>
                    </div>
                </div>

                <!-- Filter Action Buttons -->
                <div class="flex gap-2  sm:w-64 lg:w-[12rem]">
                    <button @click="applyFilters" :disabled="loading"
                        class="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
                        <i class="fas fa-filter mr-2"></i>
                        Apply
                    </button>

                    <button @click="resetFilters" :disabled="loading"
                        class="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <i class="fas fa-undo mr-2"></i>
                        Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- Export Buttons - Show only when data exists -->
        <div v-if="activityLogsStore.items.length > 0" class="flex justify-end gap-2 mb-4 hidden">
            <button @click="exportPDF" :disabled="exporting"
                class="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
                <i class="fas fa-file-pdf mr-2"></i>
                Export PDF
            </button>

            <button @click="exportExcel" :disabled="exporting"
                class="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50">
                <i class="fas fa-file-excel mr-2"></i>
                Export Excel
            </button>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">

                    <SortableTableHeader :columns="tableColumns" :sort-by="activityLogsStore.sortBy"
                        :sort-direction="activityLogsStore.sortDirection" :show-actions-column="false"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="loading" :is-loading="true" :total-items="activityLogsStore.totalItems"
                        :item-name="'activity logs'" loading-text="Loading activity logs..."
                        loading-subtext="Fetching your activity data" />

                    <!-- Empty/Initial State -->
                    <TableLoadingState v-else-if="activityLogsStore.items.length === 0" :is-loading="false"
                        :isEmpty="true" :has-search="hasActiveFilters" :item-name="'activity logs'"
                        empty-icon="fas fa-history" empty-title="No activity logs found" :empty-message="hasActiveFilters
                            ? 'No logs match your filter criteria. Try adjusting your filters.'
                            : 'Apply filters above to view activity logs.'" :show-create-button="false"
                        @clear-search="resetFilters" />

                    <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="(item, index) in activityLogsStore.items" :key="item.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
             dark:even:bg-gray-700 dark:odd:bg-gray-800">
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ item.user?.name || 'N/A' }}
                            </td> 
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span :class="[
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    item.action === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        item.action === 'updated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            item.action === 'deleted' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                ]">
                                    {{ item.action || 'N/A' }}
                                </span>
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span :class="[
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    item.transaction_type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        item.transaction_type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                ]">
                                    {{ item.transaction_type || 'N/A' }}
                                </span>
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ item.subject_name || 'N/A' }}
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ formatDate(item.created_at) }}
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {{ item.description || 'N/A' }}
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <button @click="viewDetails(item)"
                                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="activityLogsStore.totalItems > 0" class="mt-6">
            <Pagination :total-items="activityLogsStore.totalItems" :per-page="activityLogsStore.perPage"
                :current-page="activityLogsStore.currentPage" :last-page="activityLogsStore.lastPage"
                :is-loading="loading" @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>

        <!-- Details Modal -->
        <div v-if="showDetailsModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div
                class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div
                    class="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Activity Details</h3>
                    <button @click="showDetailsModal = false"
                        class="text-gray-400 hover:text-gray-500 focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Information</h4>
                            <div class="space-y-2">
                                <p><span class="font-medium">Name:</span> {{ selectedItem?.user?.name }}</p>
                                <p><span class="font-medium">Email:</span> {{ selectedItem?.user?.email }}</p>
                                <p><span class="font-medium">IP Address:</span> {{ selectedItem?.ip_address }}</p>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Transaction
                                Information</h4>
                            <div class="space-y-2">
                                <p><span class="font-medium">Subject:</span> {{ selectedItem?.subject_name }}</p>
                                <p><span class="font-medium">Action:</span> {{ selectedItem?.action }}</p>
                                <p><span class="font-medium">Type:</span> {{ selectedItem?.transaction_type }}</p>
                                <p><span class="font-medium">Date:</span> {{ formatDate(selectedItem?.created_at) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Changed Fields</h4>
                        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="field in selectedItem?.changed_fields" :key="field"
                                    class="border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <p class="font-medium text-sm text-gray-700 dark:text-gray-300">{{
                                        formatFieldName(field) }}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span class="text-green-600 dark:text-green-400">New: {{
                                            getFieldValue(selectedItem?.new_values, field) }}</span>
                                        <span v-if="selectedItem?.old_values"
                                            class="text-red-600 dark:text-red-400 ml-2">
                                            Old: {{ getFieldValue(selectedItem?.old_values, field) }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            {{ selectedItem?.description }}
                        </p>
                    </div>

                    <div class="mt-6">
                        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Agent</h4>
                        <p
                            class="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 break-all">
                            {{ selectedItem?.user_agent }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useActivityLogsStore } from '@/stores/activityLogsStore.js';
import { useCompanyStore } from '@/stores/companyStore.js';
import { useBranchStore } from '@/stores/branchStore.js';
import { useUserStore } from '@/stores/userStore.js';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
import SearchSelect from '@/components/common/SearchSelect.vue';

const selectedCompany = ref(
    localStorage.getItem("user")
        ? Number(JSON.parse(localStorage.getItem("user"))?.company?.id)
        : null
);

// Initialize stores
const activityLogsStore = useActivityLogsStore();
const companyStore = useCompanyStore();
const branchStore = useBranchStore();
const userStore = useUserStore();

// State
const loading = ref(false);
const exporting = ref(false);
const companies = ref([]);
const branches = ref([]);
const users = ref([]);
const toast = useToast();
const showDetailsModal = ref(false);
const selectedItem = ref(null);

const tableColumns = ref([
    {
        "key": "user_name",
        "label": "User",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "action",
        "label": "Action",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "transaction_type",
        "label": "Transaction Type",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "subject_name",
        "label": "Subject",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "created_at",
        "label": "Date",
        "sortable": true,
        "type": "date"
    },
    {
        "key": "description",
        "label": "Description",
        "sortable": false,
        "type": "string"
    },
    {
        "key": "actions",
        "label": "Actions",
        "sortable": false,
        "type": "actions"
    }
]);

// Filters
const filters = reactive({
    company_id: '',
    branch_id: '',
    user_id: '',
    action: '',
    transaction_type: '',
    from_date: '',
    to_date: '',
    search: ''
});

const hasActiveFilters = computed(() => {
    return filters.company_id || filters.branch_id || filters.user_id || filters.action || filters.transaction_type ||
        filters.from_date || filters.to_date || filters.search;
});

onMounted(async () => {
    await activityLogsStore.get();
    await loadCompanies();
    await loadUsers();
});

const loadCompanies = async () => {
    try {
        await companyStore.getAll();
        companies.value = companyStore.items || [];
    } catch (error) {
        console.error('Error loading companies:', error);
        toast.error('Failed to load companies');
    }
};

const loadBranches = async (companyId) => {
    if (!companyId) {
        branches.value = [];
        filters.branch_id = '';
        return;
    }
    try {
        await branchStore.getAll({ company_id: companyId });
        branches.value = branchStore.items || [];
    } catch (error) {
        branches.value = [];
        toast.error('Failed to load branches');
    }
};

const loadUsers = async (companyId = null, branchId = null) => {
    try {
        let params = {};

        if (companyId) {
            params.company_id = companyId;
            await loadBranches(companyId);
        }

        if (branchId) {
            params.branch_id = branchId;
        }

        if (Object.keys(params).length > 0) {
            await userStore.getAll(params);
        } else {
            await userStore.getAll();
        }

        users.value = userStore.items || [];
    } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
    }
};

// Handle company change
const handleCompanyChange = async () => {
    filters.branch_id = '';
    filters.user_id = '';

    if (filters.company_id) {
        await loadBranches(filters.company_id);
        await loadUsers(filters.company_id, null);
    } else {
        branches.value = [];
        users.value = [];
    }
};

const handleBranchChange = async () => {
    filters.user_id = '';

    if (filters.branch_id) {
        await loadUsers(filters.company_id || null, filters.branch_id);
    } else if (filters.company_id) {
        await loadUsers(filters.company_id, null);
    } else {
        await loadUsers();
    }
};

const applyFilters = async () => {
    loading.value = true;
    try {
        const params = {};
        if (filters.company_id) params.company_id = filters.company_id;
        if (filters.branch_id) params.branch_id = filters.branch_id;
        if (filters.user_id) params.user_id = filters.user_id;
        if (filters.action) params.action = filters.action;
        if (filters.transaction_type) params.transaction_type = filters.transaction_type;
        if (filters.from_date) params.from_date = filters.from_date;
        if (filters.to_date) params.to_date = filters.to_date;
        if (filters.search) params.search = filters.search;

        await activityLogsStore.get(params);
    } catch (error) {
        console.error('Error applying filters:', error);
        toast.error('Failed to load activity logs');
    } finally {
        loading.value = false;
    }
};

const resetFilters = async () => {
    filters.company_id = '';
    filters.branch_id = '';
    filters.user_id = '';
    filters.action = '';
    filters.transaction_type = '';
    filters.from_date = '';
    filters.to_date = '';
    filters.search = '';
    await applyFilters();
};

// Export to PDF
const exportPDF = async () => {
    exporting.value = true;
    try {
        const params = new URLSearchParams();
        if (filters.company_id) params.append('company_id', filters.company_id);
        if (filters.branch_id) params.append('branch_id', filters.branch_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.search) params.append('search', filters.search);
        params.append('export', 'pdf');

        const response = await axiosClient.get(`/activity-logs?${params.toString()}`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('PDF exported successfully');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Failed to export PDF');
    } finally {
        exporting.value = false;
    }
};

// Export to Excel
const exportExcel = async () => {
    exporting.value = true;
    try {
        const params = new URLSearchParams();
        if (filters.company_id) params.append('company_id', filters.company_id);
        if (filters.branch_id) params.append('branch_id', filters.branch_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.search) params.append('search', filters.search);
        params.append('export', 'excel');

        const response = await axiosClient.get(`/activity-logs?${params.toString()}`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Excel exported successfully');
    } catch (error) {
        console.error('Error exporting Excel:', error);
        toast.error('Failed to export Excel');
    } finally {
        exporting.value = false;
    }
};

const calculateRowNumber = (index) => {
    if (activityLogsStore.pagination?.from && activityLogsStore.pagination.from > 0) {
        return activityLogsStore.pagination.from + index;
    }
    return (activityLogsStore.pagination?.current_page - 1) * activityLogsStore.pagination?.per_page + index + 1;
};

const handlePageChange = async (page) => {
    try {
        loading.value = true;
        const params = {
            company_id: filters.company_id || '',
            branch_id: filters.branch_id || '',
            user_id: filters.user_id || '',
            action: filters.action || '',
            transaction_type: filters.transaction_type || '',
            from_date: filters.from_date || '',
            to_date: filters.to_date || '',
            search: filters.search || ''
        };

        activityLogsStore.pagination.current_page = page;
        await activityLogsStore.get(params);
    } catch (error) {
        console.error('Error changing page:', error);
        toast.error('Failed to load page');
    } finally {
        loading.value = false;
    }
};

const handlePerPageChange = async (newPerPage) => {
    try {
        loading.value = true;
        const params = {
            company_id: filters.company_id || '',
            branch_id: filters.branch_id || '',
            user_id: filters.user_id || '',
            action: filters.action || '',
            transaction_type: filters.transaction_type || '',
            from_date: filters.from_date || '',
            to_date: filters.to_date || '',
            search: filters.search || ''
        };

        activityLogsStore.pagination.per_page = newPerPage;
        activityLogsStore.pagination.current_page = 1;
        await activityLogsStore.get(params);
    } catch (error) {
        console.error('Error changing per page:', error);
        toast.error('Failed to update items per page');
    } finally {
        loading.value = false;
    }
};

const sortByColumn = async (column) => {
    try {
        loading.value = true;
        const params = {
            sort_by: column.key,
            sort_direction: activityLogsStore.sortDirection === 'asc' ? 'desc' : 'asc',
            ...filters
        };
        await activityLogsStore.get(params);
    } catch (error) {
        console.error('Error sorting:', error);
        toast.error('Failed to sort data');
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return date;
};

const formatFieldName = (field) => {
    return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getFieldValue = (values, field) => {
    if (!values) return 'N/A';
    return values[field] || 'N/A';
};

const viewDetails = (item) => {
    selectedItem.value = item;
    showDetailsModal.value = true;
};

watch(() => filters.company_id, (newCompanyId, oldCompanyId) => {
    if (newCompanyId !== oldCompanyId) {
        handleCompanyChange();
    }
});

watch(() => filters.branch_id, (newBranchId, oldBranchId) => {
    if (newBranchId !== oldBranchId) {
        handleBranchChange();
    }
});

</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

button:disabled {
    cursor: not-allowed;
}

.fa-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>