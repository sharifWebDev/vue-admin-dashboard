<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Customer Payment List</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search (Single Row) -->
        <div class="flex flex-col lg:flex-row justify-between items-end gap-4 mb-4">
            <!-- Left Side: Create Button -->
            <div class="flex items-center">
                <button @click="openCreatePayment" v-permission="['payments.apply_dealer']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap">
                    <i class="fas fa-plus"></i>
                    <span>New Payment</span>
                </button>
            </div>

            <!-- Right Side: Filter Bar (Aligned End) -->
            <div class="flex flex-wrap items-end justify-end gap-3 w-full lg:w-auto">
                <!-- Dealer Filter -->
                <div class="w-full sm:w-48">
                    <SearchSelect v-model="filters.dealer_id" :options="dealerStoreItems" label="Customer"
                        placeholder="-- All Customer --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- From Date Filter -->
                <div class="w-full sm:w-40 md:w-48">
                    <DateInput v-model="filters.from_date" label="From Date" :clearable="true"
                        @update:model-value="handleFilterChange" />
                </div>

                <!-- To Date Filter -->
                <div class="w-full sm:w-40 md:w-48">
                    <DateInput v-model="filters.to_date" label="To Date" required :clearable="true"
                        @update:model-value="handleFilterChange" />

                </div>

                <!-- Search & Refresh Group -->
                <div class="flex items-center gap-2 w-full lg:w-auto">
                    <div class="relative flex-grow min-w-[240px] max-w-md">
                        <input v-model="searchQuery" @input="handleSearch" type="search"
                            placeholder="Search by dealer name..."
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search text-base"></i>
                        </div>
                    </div>

                    <button @click="refreshData" :disabled="refresh"
                        class="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        <i class="fas fa-sync-alt text-sm" :class="{ 'animate-spin': refresh }"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="paymentStore.sortBy"
                        :sort-direction="paymentStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
                        @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="paymentStore.loading" :is-loading="true"
                        :total-items="paymentStore.totalItems" :item-name="'customer payments'"
                        loading-text="Loading customer payments..."
                        loading-subtext="Fetching your customer payments data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Empty State -->
                        <TableLoadingState v-if="paymentStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :item-name="'customer payments'" empty-icon="fas fa-credit-card"
                            empty-title="No customer payments found"
                            :empty-message="searchQuery ? 'No customer payments match your search criteria.' : 'Get started by creating your first customer payment.'"
                            :show-create-button="false" @clear-search="clearSearch" />

                        <tr v-else v-for="(payment, index) in displayedItems" :key="payment.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ payment.dealer_company || '-' }}   
                                </span>
                                <span v-if="payment.dealer_name" class="text-xs text-gray-500 dark:text-gray-400">    
                                    ({{ payment.dealer_name }})
                                </span>
                            </td>
                            <td class="px-6 py-3">
                                <p class="text-sm text-gray-900 dark:text-white">
                                    {{ payment.payment_method?.account_name || 'N/A' }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    A/C: {{ payment.payment_method?.acc_number || '' }}
                                </p>
                            </td>
                            <td class="px-6 py-3 text-left text-sm text-gray-900 dark:text-white">
                                ৳{{ formatNumber(payment.amount_paid) }}
                            </td>
                            <!-- <td class="px-6 py-3 text-left text-sm text-green-600 dark:text-green-400">
                                ৳{{ formatNumber(payment.amount_applied) }}
                            </td> -->
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ formatDate(payment.payment_date) }}
                            </td>
                            <td class="px-6 py-3 text-left text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewPayment(payment)" v-permission="['payments.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <div class="relative inline-block text-left"
                                        v-click-outside="() => payment.showDropdown = false"
                                        v-permission="['payments.update', 'payments.delete']">
                                        <button @click="payment.showDropdown = !payment.showDropdown"
                                            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Actions">
                                            <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                                        </button>

                                        <div v-if="payment.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700">
                                            <div class="py-1">
                                                <button @click="editPayment(payment); payment.showDropdown = false"
                                                    v-permission="['payments.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>
                                                <button @click="confirmDelete(payment); payment.showDropdown = false"
                                                    v-permission="['payments.delete']"
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

        <!-- Pagination -->
        <div v-if="paymentStore.pagination && paymentStore.pagination.total > 0" class="mt-6">
            <Pagination :total-items="paymentStore.pagination.total" :per-page="paymentStore.pagination.per_page"
                :current-page="paymentStore.pagination.current_page" :last-page="paymentStore.pagination.last_page"
                :is-loading="paymentStore.loading" @change-page="handlePageChange"
                @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- View Payment Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="3xl" title="Payment Details"
        @close="closeViewModal">
        <!-- Loading State -->
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>

        <!-- Content -->
        <div v-else-if="viewingPayment" class="px-6 py-4">
            <!-- Header Information -->
            <div class="mb-6 pb-4">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4"> 
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment
                                Date</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                                formatDate(viewingPayment.payment_date)
                                }}</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Amount Paid</label>
                            <p
                                class="text-sm text-gray-900 dark:text-white mt-1 font-semibold text-blue-600 dark:text-blue-400">
                                ৳{{ formatNumber(viewingPayment.amount_paid) }}
                            </p>
                        </div> 
                    </div>
                </div>
            </div>

            <!-- Customer & Payment Information -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-user mr-2"></i>Customer & Payment Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {{ viewingPayment.dealer_name || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Company</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ viewingPayment.dealer_company || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {{ viewingPayment.payment_method?.account_name || '-' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Account: {{ viewingPayment.payment_method?.acc_number || 'N/A' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            Type: {{ viewingPayment.payment_method?.account_type || 'N/A' }}
                        </p>
                    </div>
                </div>
            </div>
            <!-- Reference Note -->
            <div v-if="viewingPayment.reference_note" class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-sticky-note mr-2"></i>Note
                </h3>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p class="text-sm text-gray-900 dark:text-white">{{ viewingPayment.reference_note }}</p>
                </div>
            </div>

            <!-- Allocations -->
            <div class="mb-6" v-if="viewingPayment.allocations && viewingPayment.allocations.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-receipt mr-2"></i>Invoice Allocations ({{ viewingPayment.allocations.length }})
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    #</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Invoice No</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Date</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Amount Paid</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Remaining Due</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            <tr v-for="(allocation, index) in viewingPayment.allocations" :key="allocation.invoice_id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {{ allocation.invoice_no }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {{ formatDate(allocation.invoice_date) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-green-600 dark:text-green-400 text-right">
                                    ৳{{ formatNumber(allocation.amount_applied) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-right"
                                    :class="allocation.remaining_due === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                    ৳{{ formatNumber(allocation.remaining_due) }}
                                    <span v-if="allocation.remaining_due === 0" class="ml-1 text-xs">(Paid)</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="!viewLoading && !viewingPayment" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load payment details</p>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Payment" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Payment</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this payment from <strong>
                        {{ deletingPayment?.dealer_name || 'this customer' }}</strong>?
                    This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="paymentStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    paymentStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="paymentStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Payment</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Edit Payment Modal -->
    <BaseModal :show="showEditModal" title="Edit Payment" maxWidth="md" @close="closeEditModal">
        <div class="px-6 py-4">
            <div class="space-y-4">
                <!-- Dealer Info (Read-only) -->
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Customer</label>
                    <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {{ editPaymentData.dealer_name || 'N/A' }}
                    </p>
                    <p v-if="editPaymentData.dealer_company" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ editPaymentData.dealer_company }}
                    </p>
                </div>

                <!-- Amount Paid -->
                <NumberInput v-model="editPaymentData.amount_paid" label="Payment Amount" type="number" :min="1"
                    :step="0.01" placeholder="Enter amount" :required="true" :error="paymentErrors.amount_paid"
                    name="amount_paid" />

                <!-- Payment Method -->
                <SearchSelect v-model="editPaymentData.payment_method_id" :options="accounts" label="Account"
                    placeholder="Select Account" :required="true" :error="paymentErrors.payment_method_id"
                    name="payment_method_id" />

                <!-- Payment Date -->
                <TextInput v-model="editPaymentData.payment_date" label="Payment Date" type="date" :required="true"
                    :error="paymentErrors.payment_date" name="payment_date" />

                <!-- Reference Note -->
                <TextInput v-model="editPaymentData.reference_note" label="Reference Note" type="text"
                    placeholder="Enter reference note (optional)" name="reference_note" />
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button @click="closeEditModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="submitEditPayment" :disabled="paymentLoading"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    <i v-if="paymentLoading" class="fas fa-spinner fa-spin"></i>
                    {{ paymentLoading ? 'Updating...' : 'Update Payment' }}
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import DateInput from '@/components/common/DateInput.vue';
import { useCustomerPaymentStore } from '@/stores/customerPaymentStore.js';
import { useDealerStore } from '@/stores/dealerStore';
import { useCashBankAccountStore } from '@/stores/cashBankAccountStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';

const toast = useToast();
const viewLoading = ref(false);
const refresh = ref(false);
const paymentLoading = ref(false);

// Store references
const paymentStore = useCustomerPaymentStore();
const dealerStore = useDealerStore();
const cashBankAccountStore = useCashBankAccountStore();
const router = useRouter();

// Accounts for payment method dropdown
const accounts = computed(() => {
    const items = cashBankAccountStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.account_name || item.name
    })).filter(item => item !== undefined && item !== null);
});

// Table columns configuration
const tableColumns = ref([
    {
        "key": "dealer_name",
        "label": "Customer",
        "sortable": true,
        "type": "varchar",
    },
    {
        "key": "payment_method",
        "label": "Payment Method",
        "sortable": false,
        "type": "varchar",
    },
    {
        "key": "amount_paid",
        "label": "Amount Paid",
        "sortable": true,
        "type": "decimal",
        "class": "text-left",
        "align": "left"
    },
    // {
    //     "key": "amount_applied",
    //     "label": "Amount Applied",
    //     "sortable": true,
    //     "type": "decimal",
    //     "class": "text-left",
    //     "align": "left"
    // },
    {
        "key": "payment_date",
        "label": "Payment Date",
        "sortable": true,
        "type": "date",
        "class": "text-left",
        "align": "left"
    }
]);

// Filter state
const filters = ref({
    dealer_id: null,
    from_date: '',
    to_date: ''
});

// Modal states
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showEditModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

// Current items
const viewingPayment = ref(null);
const deletingPayment = ref(null);

// Edit payment data
const editPaymentData = ref({
    id: null,
    dealer_id: null,
    dealer_name: '',
    dealer_company: '',
    amount_paid: 0,
    payment_method_id: '',
    payment_date: '',
    reference_note: ''
});

const paymentErrors = ref({});

// Computed properties
const dealerStoreItems = computed(() => {
    const items = dealerStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.name || item.dealer_name
    })).filter(item => item !== undefined && item !== null);
});

const displayedItems = computed(() => {
    return paymentStore.items || [];
});

const calculateRowNumber = (index) => {
    if (paymentStore.pagination?.from && paymentStore.pagination.from > 0) {
        return paymentStore.pagination.from + index;
    }
    return (paymentStore.pagination?.current_page - 1) * (paymentStore.pagination?.per_page || 10) + index + 1;
};

// Helper functions
const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return date;
};

// Filter handlers
const handleFilterChange = () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }

    filterTimeout = setTimeout(async () => {
        const filterParams = {};

        if (filters.value.dealer_id) {
            filterParams.dealer_id = filters.value.dealer_id;
        }
        if (filters.value.from_date) {
            filterParams.from_date = filters.value.from_date;
        }
        if (filters.value.to_date) {
            filterParams.to_date = filters.value.to_date;
        }

        await paymentStore.get(filterParams);
    }, 400);
};

// Search with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await paymentStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    paymentStore.search('');
};

const clearAllFilters = () => {
    filters.value = {
        dealer_id: null,
        from_date: '',
        to_date: ''
    };
    handleFilterChange();
};

// Lifecycle
onMounted(async () => {
    await Promise.all([
        getData(),
        loadRelatedData()
    ]);
});

const getData = async () => {
    await paymentStore.get();
};

const refreshData = async () => {
    refresh.value = true;
    try {
        if (searchQuery.value) {
            clearSearch();
        }
        if (Object.keys(filters.value).length > 0) {
            clearAllFilters();
        }
        await getData();
    } catch (error) {
        toast.error('Failed to refresh data');
    } finally {
        refresh.value = false;
    }
};

const loadRelatedData = async () => {
    await Promise.all([
        dealerStore.getAll(),
        cashBankAccountStore.getAll()
    ]);
};

// Navigation functions
const openCreatePayment = () => {
    router.push('/customer-payment');
};

// Edit payment - opens modal with payment data
const editPayment = (payment) => {
    // Populate edit data with payment details
    editPaymentData.value = {
        id: payment.id,
        dealer_id: payment.dealer_id,
        dealer_name: payment.dealer_name || '',
        dealer_company: payment.dealer_company || '',
        amount_paid: payment.amount_paid || 0,
        payment_method_id: payment.payment_method?.id || '',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        reference_note: payment.reference_note || ''
    };
    paymentErrors.value = {};
    showEditModal.value = true;
};

// Close edit modal
const closeEditModal = () => {
    showEditModal.value = false;
    editPaymentData.value = {
        id: null,
        dealer_id: null,
        dealer_name: '',
        dealer_company: '',
        amount_paid: 0,
        payment_method_id: '',
        payment_date: '',
        reference_note: ''
    };
    paymentErrors.value = {};
};

// Submit edit payment
const submitEditPayment = async () => {
    // Validate payment
    let isValid = true;
    paymentErrors.value = {};

    if (!editPaymentData.value.amount_paid || editPaymentData.value.amount_paid <= 0) {
        paymentErrors.value.amount_paid = 'Please enter a valid payment amount';
        isValid = false;
    }

    if (!editPaymentData.value.payment_method_id) {
        paymentErrors.value.payment_method_id = 'Payment method is required';
        isValid = false;
    }

    if (!editPaymentData.value.payment_date) {
        paymentErrors.value.payment_date = 'Payment date is required';
        isValid = false;
    }

    if (!isValid) {
        const firstErrorField = Object.keys(paymentErrors.value)[0];
        if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) element.focus();
        }
        return;
    }

    paymentLoading.value = true;
    try {
        // Build payload
        const payload = {
            dealer_id: editPaymentData.value.dealer_id,
            amount_paid: parseFloat(editPaymentData.value.amount_paid),
            payment_method_id: editPaymentData.value.payment_method_id,
            payment_date: editPaymentData.value.payment_date,
            reference_note: editPaymentData.value.reference_note || ''
        };

        // Send update to API
        const response = await axiosClient.put(`/dealer-payments/${editPaymentData.value.id}`, payload);

        if (response.data.success) {
            toast.success(response.data.message || 'Payment updated successfully');
            closeEditModal();
            await getData(); // Refresh the list
        } else {
            throw new Error(response.data.message || 'Payment update failed');
        }
    } catch (error) {
        console.error('Error updating payment:', error);
        const errorMessage = error.response?.data?.message || 'Failed to update payment';
        toast.error(errorMessage);
    } finally {
        paymentLoading.value = false;
    }
};

// View payment
const viewPayment = async (payment) => {
    try {
        viewLoading.value = true;
        showViewModal.value = true;
        viewingPayment.value = payment;
    } catch (error) {
        console.error('Error viewing payment:', error);
        toast.error('An error occurred while fetching payment details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};

// Delete functions
const confirmDelete = (payment) => {
    deletingPayment.value = payment;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (deletingPayment.value) {
        const result = await paymentStore.deleteItem(deletingPayment.value.id);
        if (result.success) {
            closeDeleteModal();
            await getData();
        } else {
            toast.error(result.message || 'Failed to delete payment');
        }
    }
};

// Modal close functions
const closeViewModal = () => {
    showViewModal.value = false;
    viewingPayment.value = null;
    viewLoading.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingPayment.value = null;
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await paymentStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await paymentStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = paymentStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await paymentStore.sort(column, order);
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>