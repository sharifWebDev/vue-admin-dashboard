<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                    Customer Payment</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters -->
        <div class="flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center mb-4 gap-4">
            <div class="flex flex-row gap-4 w-full lg:w-auto items-start sm:items-start">
                <GlobalDropdown v-model="filters.dealer_id" class="w-[350px]" label="Select a Customer" store-name="customerStore" placeholder="Search Or Select a Customer..."
                    :required="true" :fetch-on-mount="true" @select="handleCustomerChange" />

                <button @click="resetFilters"
                    class="px-4 w-[95px] flex items-center mt-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">
                    <i class="fas fa-undo mr-2"></i> Reset
                </button>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                SL
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Customer Name
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Invoice Amount
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Paid Amount
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Due Amount
                            </th>
                        </tr>
                    </thead>

                    <!-- Loading State -->
                    <tbody v-if="loading">
                        <tr>
                            <td colspan="8" class="text-center py-8">
                                <div class="flex justify-center items-center">
                                    <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
                                    <span class="text-gray-500 dark:text-gray-400">Loading customer data...</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>

                    <!-- Empty State -->
                    <tbody v-else-if="dealerRecords.length === 0">
                        <tr>
                            <td colspan="8" class="text-center py-8">
                                <div class="flex flex-col items-center">
                                    <i class="fas fa-users text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                                    <p class="text-gray-500 dark:text-gray-400">No customer payments records found</p>
                                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Apply filters above to view
                                        customer payments records.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>

                    <!-- Data Rows -->
                    <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="(record, index) in dealerRecords" :key="record.dealer_id"
                            @click="openInvoiceModal(record)"
                            class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer even:bg-gray-100 odd:bg-white dark:even:bg-gray-700 dark:odd:bg-gray-800">
                            <td
                                class="px-2 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center w-[30px]">
                                {{ index + 1 }}
                            </td>
                            <td
                                class="px-6 py-3 whitespace-wrap text-sm font-medium text-gray-900 dark:text-white max-w-[300px]">
                                {{ record.dealer_name }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                ৳ {{ formatCurrency(record.total_invoice_amount) }}
                            </td>
                            <td
                                class="px-6 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                                ৳ {{ formatCurrency(record.total_paid_amount) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-semibold"
                                :class="record.total_due_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                ৳ {{ formatCurrency(record.total_due_amount) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Invoice Details Panel -->
            <div v-if="showModal" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <div>
                        <h3 class="text-md font-semibold text-gray-900 dark:text-white">
                            Invoice Details - {{ selectedDealer?.dealer_name }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Warehouse: {{ selectedDealer?.warehouse_name || 'N/A' }}
                        </p>
                    </div>
                    <button @click="closeModal"
                        class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="max-h-[60vh] overflow-y-auto">
                    <div v-if="!selectedDealer?.invoices || selectedDealer.invoices.length === 0"
                        class="text-center py-8">
                        <p class="text-gray-500 dark:text-gray-400">No invoices found for this customer.</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="invoice in selectedDealer.invoices" :key="invoice.invoice_id"
                            class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">

                            <!-- Invoice Header -->
                            <div
                                class="bg-gray-100 dark:bg-gray-600 px-4 py-3 flex flex-wrap justify-between items-center">
                                <div class="flex items-center gap-4">
                                    <span class="font-semibold text-gray-900 dark:text-white">{{ invoice.invoice_no
                                        }}</span>
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Date: {{
                                        formatDate(invoice.invoice_date) }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span :class="getStatusBadgeClass(invoice.status)">
                                        {{ formatStatus(invoice.status) }}
                                    </span>
                                    <button @click="toggleInvoiceDetails(invoice.invoice_id)"
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                        <i
                                            :class="expandedInvoices.includes(invoice.invoice_id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Invoice Summary -->
                            <div class="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Grand Total</p>
                                    <p class="text-sm font-semibold text-gray-900 dark:text-white">৳ {{
                                        formatCurrency(invoice.grand_total) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Paid Amount</p>
                                    <p class="text-sm font-semibold text-green-600 dark:text-green-400">৳ {{
                                        formatCurrency(invoice.paid_amount) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Due Amount</p>
                                    <p class="text-sm font-semibold"
                                        :class="invoice.due_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                        ৳ {{ formatCurrency(invoice.due_amount) }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <p class="text-sm font-medium" :class="getStatusColor(invoice.status)">
                                        {{ formatStatus(invoice.status) }}
                                    </p>
                                </div>
                            </div>

                            <!-- Pay Now Button -->
                            <div class="px-4 pb-3" v-if="invoice.due_amount > 0">
                                <button @click="payNow(invoice)" v-permission="['sales_invoices.repayments']"
                                    class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <i class="fas fa-money-bill"></i>
                                    Pay Now (৳ {{ formatCurrency(invoice.due_amount) }})
                                </button>
                            </div>

                            <!-- Payment History (Expandable) -->
                            <div v-if="expandedInvoices.includes(invoice.invoice_id)"
                                class="border-t border-gray-200 dark:border-gray-600 px-4 py-3">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <i class="fas fa-history mr-1"></i>
                                    Payment History
                                </h4>

                                <div v-if="invoice.payment_history && invoice.payment_history.length > 0"
                                    class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead class="bg-gray-50 dark:bg-gray-600">
                                            <tr>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                    Date</th>
                                                <th
                                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                    Amount</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                    Method</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                    Reference</th>
                                                <th
                                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                    Note</th>
                                            </tr>
                                        </thead>
                                        <tbody
                                            class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                            <tr v-for="(payment, idx) in invoice.payment_history" :key="idx">
                                                <td class="px-3 py-2 text-sm text-gray-900 dark:text-white">{{
                                                    formatDate(payment.payment_date) }}</td>
                                                <td
                                                    class="px-3 py-2 text-sm text-right font-medium text-green-600 dark:text-green-400">
                                                    ৳ {{ formatCurrency(payment.amount_paid) }}
                                                </td>
                                                <td class="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <span class="capitalize">{{ payment.payment_method }}</span>
                                                </td>
                                                <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {{ payment.transaction_id || payment.cheque_number ||
                                                    payment.cell_number || 'N/A' }}
                                                </td>
                                                <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {{ payment.reference_note || 'N/A' }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p v-else class="text-sm text-gray-500 dark:text-gray-400">No payment history available.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Pay Now Modal -->
    <BaseModal :show="showPayModal" title="Make Payment" maxWidth="md" @close="closePayModal">
        <div class="py-1">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Invoice Number
                        </label>
                        <p class="text-sm text-gray-900 dark:text-white font-semibold">{{ currentInvoice?.invoice_no ||
                            'N/A' }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Amount
                        </label>
                        <p class="text-sm font-bold text-red-600 dark:text-red-400">৳ {{
                            formatCurrency(currentInvoice?.due_amount || 0) }}</p>
                    </div>
                </div>

                <NumberInput v-model="paymentData.amount_paid" label="Payment Amount" type="number" min="1" step="0.01"
                    placeholder="Enter amount" :required="true" :error="paymentErrors.amount_paid" />

                <SearchSelect v-model="paymentData.payment_method" :options="paymentMethods" label="Payment Method"
                    placeholder="Select payment method" :required="true" :error="paymentErrors.payment_method" />

                <TextInput v-if="paymentData.payment_method === 'check'" v-model="paymentData.cheque_number"
                    label="Cheque Number" placeholder="Enter cheque number" :required="true"
                    :error="paymentErrors.cheque_number" />

                <TextInput v-if="paymentData.payment_method === 'mobile_banking'" v-model="paymentData.cell_number"
                    label="Cell Number" placeholder="Enter cell number" :required="true"
                    :error="paymentErrors.cell_number" />

                <TextInput v-if="paymentData.payment_method === 'bank_transfer'" v-model="paymentData.transaction_id"
                    label="Transaction ID" placeholder="Enter transaction ID" :required="true"
                    :error="paymentErrors.transaction_id" />

                <TextInput v-model="paymentData.payment_date" label="Payment Date" type="date" :required="true"
                    :error="paymentErrors.payment_date" />

                <!-- <TextInput v-model="paymentData.reference_note" label="Reference Note" type="text"
                    placeholder="Enter reference note" /> -->
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button @click="closePayModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="submitPayment" :disabled="paymentLoading"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    <i v-if="paymentLoading" class="fas fa-spinner fa-spin"></i>
                    {{ paymentLoading ? 'Processing...' : 'Submit Payment' }}
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useToast } from "vue-toastification";
import axiosClient from '@/axiosClient';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import GlobalDropdown from '@/components/common/GlobalDropdown.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';

const toast = useToast();
const loading = ref(false);

// Store data from API
const dealerRecords = ref([]);
const summary = reactive({
    total_dealers: 0,
    total_invoices: 0,
    total_invoice_amount: 0,
    total_paid_amount: 0,
    total_due_amount: 0
});

// Modal state
const showModal = ref(false);
const selectedDealer = ref(null);
const expandedInvoices = ref([]);

// Filters
const filters = reactive({
    dealer_id: null
});

// Fetch report data
const fetchReport = async () => {
    loading.value = true;
    try {
        const params = {};

        // Only send dealer_id if it's a valid number
        if (filters.dealer_id && !isNaN(filters.dealer_id)) {
            params.dealer_id = filters.dealer_id;
        }

        const response = await axiosClient.get('/dealers/report', { params });
        const apiResponse = response.data;

        if (apiResponse.success) {
            dealerRecords.value = apiResponse.data?.records || [];

            // Update summary
            const summaryData = apiResponse.data?.summary || {};
            summary.total_dealers = summaryData.total_dealers || 0;
            summary.total_invoices = summaryData.total_invoices || 0;
            summary.total_invoice_amount = summaryData.total_invoice_amount || 0;
            summary.total_paid_amount = summaryData.total_paid_amount || 0;
            summary.total_due_amount = summaryData.total_due_amount || 0;
        } else {
            throw new Error(apiResponse.message || 'API request failed');
        }
    } catch (error) {
        console.error('Failed to fetch dealer report:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch dealer report');
    } finally {
        loading.value = false;
    }
};

// Open invoice modal
const openInvoiceModal = (record) => {
    selectedDealer.value = record;
    expandedInvoices.value = [];
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    showModal.value = false;
    selectedDealer.value = null;
    expandedInvoices.value = [];
};

// Toggle invoice details
const toggleInvoiceDetails = (invoiceId) => {
    const index = expandedInvoices.value.indexOf(invoiceId);
    if (index > -1) {
        expandedInvoices.value.splice(index, 1);
    } else {
        expandedInvoices.value.push(invoiceId);
    }
};

// Format status
const formatStatus = (status) => {
    const statusMap = {
        'paid': 'Paid',
        'unpaid': 'Unpaid',
        'partially_paid': 'Partially Paid',
        'completed': 'Completed',
        'pending': 'Pending',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status || 'N/A';
};

// Get status badge class
const getStatusBadgeClass = (status) => {
    const classes = {
        'paid': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'unpaid': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'partially_paid': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'completed': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'pending': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'cancelled': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return classes[status] || 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

// Get status color
const getStatusColor = (status) => {
    const colors = {
        'paid': 'text-green-600 dark:text-green-400',
        'unpaid': 'text-red-600 dark:text-red-400',
        'partially_paid': 'text-yellow-600 dark:text-yellow-400',
        'completed': 'text-green-600 dark:text-green-400',
        'pending': 'text-yellow-600 dark:text-yellow-400',
        'cancelled': 'text-red-600 dark:text-red-400'
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400';
};

// Format currency
const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.00';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numValue);
};

// Format date
const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Apply filters
const applyFilters = async () => {
    await fetchReport();
};

// Reset filters
const resetFilters = () => {
    filters.dealer_id = null;
    fetchReport();
};

// Handle customer change - extract ID from the selected object
const handleCustomerChange = (selectedOption) => {
    // If selectedOption is an object with id property, extract the id
    if (selectedOption && typeof selectedOption === 'object') {
        // Check if it has an id property
        if (selectedOption.id) {
            filters.dealer_id = selectedOption.id;
        } else if (selectedOption.value) {
            // Some dropdowns use value property
            filters.dealer_id = selectedOption.value;
        } else {
            // If it's a complex object, try to find an id
            filters.dealer_id = selectedOption.id || selectedOption.value || null;
        }
    } else {
        // If it's a primitive value, use it directly
        filters.dealer_id = selectedOption;
    }

    // Fetch data with the new filter
    fetchReport();
};

// Watch for changes in filters.dealer_id
watch(() => filters.dealer_id, (newVal) => {
    // If dealer_id changes and it's a valid number, fetch report
    if (newVal !== null && newVal !== undefined && !isNaN(newVal)) {
        fetchReport();
    }
});

// Load data on mount
onMounted(async () => {
    // await fetchReport();
});

// Payment functionality
const showPayModal = ref(false);
const paymentLoading = ref(false);
const currentInvoice = ref(null);
const paymentErrors = ref({});
const paymentData = ref({
    amount_paid: 0,
    payment_method: 'cash',
    cheque_number: '',
    cell_number: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_note: ''
});

const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'check', name: 'Cheque' },
    { id: 'mobile_banking', name: 'Mobile Banking' },
    { id: 'bank_transfer', name: 'Bank Transfer' }
];

// Pay Now function
const payNow = (invoice) => {
    currentInvoice.value = invoice;
    paymentErrors.value = {};
    paymentData.value = {
        amount_paid: invoice.due_amount,
        payment_method: 'cash',
        cheque_number: '',
        cell_number: '',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference_note: ''
    };
    showPayModal.value = true;
};

// Close pay modal
const closePayModal = () => {
    showPayModal.value = false;
    currentInvoice.value = null;
    paymentErrors.value = {};
};

// Validate payment
const validatePayment = () => {
    paymentErrors.value = {};
    let isValid = true;

    if (!paymentData.value.amount_paid || paymentData.value.amount_paid <= 0) {
        paymentErrors.value.amount_paid = 'Please enter a valid payment amount';
        isValid = false;
    } else if (currentInvoice.value && paymentData.value.amount_paid > currentInvoice.value.due_amount) {
        paymentErrors.value.amount_paid = `Amount cannot exceed due amount (৳ ${formatCurrency(currentInvoice.value.due_amount)})`;
        isValid = false;
    }

    if (!paymentData.value.payment_method) {
        paymentErrors.value.payment_method = 'Payment method is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'check' && !paymentData.value.cheque_number) {
        paymentErrors.value.cheque_number = 'Cheque number is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'mobile_banking' && !paymentData.value.cell_number) {
        paymentErrors.value.cell_number = 'Cell number is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'bank_transfer' && !paymentData.value.transaction_id) {
        paymentErrors.value.transaction_id = 'Transaction ID is required';
        isValid = false;
    }

    if (!paymentData.value.payment_date) {
        paymentErrors.value.payment_date = 'Payment date is required';
        isValid = false;
    }

    return isValid;
};

// Submit payment
const submitPayment = async () => {
    if (!currentInvoice.value) {
        toast.error('No invoice selected');
        return;
    }

    if (!validatePayment()) {
        // Focus on first error field
        const firstErrorField = Object.keys(paymentErrors.value)[0];
        if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) element.focus();
        }
        return;
    }

    paymentLoading.value = true;
    try {
        const payload = {
            invoice_id: currentInvoice.value.invoice_id,
            amount_paid: parseFloat(paymentData.value.amount_paid),
            payment_method: paymentData.value.payment_method,
            payment_date: paymentData.value.payment_date,
            reference_note: paymentData.value.reference_note
        };

        // Add conditional fields based on payment method
        if (paymentData.value.payment_method === 'check') {
            payload.cheque_number = paymentData.value.cheque_number;
        } else if (paymentData.value.payment_method === 'mobile_banking') {
            payload.cell_number = paymentData.value.cell_number;
        } else if (paymentData.value.payment_method === 'bank_transfer') {
            payload.transaction_id = paymentData.value.transaction_id;
        }

        const response = await axiosClient.post(`/sales-invoices/${currentInvoice.value.invoice_id}/payments`, payload);

        if (response.data.success) {
            toast.success(response.data.message || 'Payment submitted successfully');
            closePayModal();
            // Refresh data
            await fetchReport();
            // Refresh the selected dealer invoices
            if (selectedDealer.value) {
                const updatedRecord = dealerRecords.value.find(r => r.dealer_id === selectedDealer.value.dealer_id);
                if (updatedRecord) {
                    selectedDealer.value = updatedRecord;
                }
            }
        } else {
            toast.error(response.data.message || 'Failed to submit payment');
        }
    } catch (error) {
        console.error('Error submitting payment:', error);
        const errorMessage = error.response?.data?.message || 'Failed to submit payment';
        toast.error(errorMessage);
    } finally {
        paymentLoading.value = false;
    }
};
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

/* Custom scrollbar for modal */
.max-h-\[60vh\]::-webkit-scrollbar {
    width: 6px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.dark .max-h-\[60vh\]::-webkit-scrollbar-track {
    background: #374151;
}

.dark .max-h-\[60vh\]::-webkit-scrollbar-thumb {
    background: #6b7280;
}

.dark .max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>