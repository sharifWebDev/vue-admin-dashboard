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
                <GlobalDropdown v-model="filters.dealer_id" class="w-[350px]" label="Select a Customer"
                    store-name="customerStore" placeholder="Search Or Select a Customer..." :required="true"
                    :fetch-on-mount="true" @select="handleCustomerChange" />

                <button @click="resetFilters"
                    class="px-4 w-[95px] flex items-center mt-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">
                    <i class="fas fa-undo mr-2"></i> Reset
                </button>
            </div>
        </div>

        <!-- Main Content - Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <!-- Left Column - Customer Table -->
            <div class="lg:col-span-4">
                <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

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
                        <tbody v-else-if="dealerRecords.length === 0"
                            class="dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td colspan="8" class="text-center py-8">
                                    <div class="flex flex-col items-center">
                                        <i class="fas fa-users text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                                        <p class="text-gray-500 dark:text-gray-400">No customer payments records found
                                        </p>
                                        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                            Apply filters above to view customer payments records.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        <!-- Data Rows -->
                        <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(record, index) in dealerRecords" :key="record.dealer_id"
                                @click="selectCustomer(record)" class="bg-cyan-100 hover:bg-cyan-200 dark:bg-red-900/20 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer 
                                "
                                :class="{ 'bg-blue-50 dark:bg-blue-900/20': selectedDealer && selectedDealer.dealer_id === record.dealer_id }">

                                <td
                                    class="px-6 py-3 whitespace-wrap text-sm font-medium text-gray-900 dark:text-white max-w-[300px]">
                                    Customer Name: {{ record.dealer_name }}
                                </td>
                                <td
                                    class="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                    Invoice Amount: ৳ {{ formatCurrency(record.total_invoice_amount) }}
                                </td>
                                <td
                                    class="px-6 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                                    Paid Amount: ৳ {{ formatCurrency(record.total_paid_amount) }}
                                </td>
                                <td class="px-6 py-3 whitespace-nowrap text-sm text-right font-semibold"
                                    :class="record.total_due_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                    Due Amount: ৳ {{ formatCurrency(record.total_due_amount) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Right Column - Invoice Details -->
            <div class="lg:col-span-2">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full">
                    <div v-if="!selectedDealer" class="flex flex-col items-center justify-center h-64">
                        <i class="fas fa-file-invoice text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                        <p class="text-gray-500 dark:text-gray-400 text-center">Select a customer to view invoice
                            details</p>
                    </div>

                    <div v-else>
                        <div class="flex justify-between items-center mb-3">
                            <div>
                                <h3 class="text-md font-semibold text-gray-900 dark:text-white">
                                    {{ selectedDealer.dealer_name }}
                                </h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Warehouse: {{ selectedDealer?.warehouse_name || 'N/A' }}
                                </p>
                            </div>
                            <span
                                class="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                {{ selectedDealer.invoices?.length || 0 }} Invoices
                            </span>
                        </div>

                        <!-- Invoice List -->
                        <div class="space-y-2 max-h-[500px] overflow-y-auto">
                            <div v-for="invoice in selectedDealer.invoices" :key="invoice.invoice_id"
                                @click="selectInvoice(invoice)"
                                class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-all"
                                :class="{ 'border-blue-500 dark:border-blue-400 shadow-md': selectedInvoice && selectedInvoice.invoice_id === invoice.invoice_id }">

                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="font-semibold text-sm text-gray-900 dark:text-white">
                                                {{ invoice.invoice_no }}
                                            </span>
                                            <span :class="getStatusBadgeClass(invoice.status)" class="text-xs">
                                                {{ formatStatus(invoice.status) }}
                                            </span>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {{ formatDate(invoice.invoice_date) }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Due</p>
                                        <p class="text-sm font-bold"
                                            :class="invoice.due_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                            ৳ {{ formatCurrency(invoice.due_amount) }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                                    <div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                        <p class="text-xs font-semibold text-gray-900 dark:text-white">
                                            ৳ {{ formatCurrency(invoice.grand_total) }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                        <p class="text-xs font-semibold text-green-600 dark:text-green-400">
                                            ৳ {{ formatCurrency(invoice.paid_amount) }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                        <p class="text-xs font-medium" :class="getStatusColor(invoice.status)">
                                            {{ formatStatus(invoice.status) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Section - Payment Form -->
            <div class="lg:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <!-- Show payment form when dealer is selected, even if no invoices -->
                <div v-if="selectedDealer" class="py-2 lg:px-2">
                    <div class="space-y-4">
                        <!-- Show Total Due Amount for all invoices -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Total Due Amount (All Invoices)
                                </label>
                                <p class="text-lg font-bold text-red-600 dark:text-red-400">
                                    ৳ {{ formatCurrency(selectedDealer.total_due_amount || 0) }}
                                </p>
                            </div>
                        </div>

                        <NumberInput v-model="paymentData.amount_paid" label="Payment Amount" type="number" :min="1"
                            :step="0.01" placeholder="Enter amount" :required="true" :error="paymentErrors.amount_paid"
                            @input="validatePaymentAmount" />

                        <SearchSelect v-model="paymentData.payment_method_id" :options="accounts" label="Account"
                            placeholder="Select Account" :required="true" :error="paymentErrors.payment_method_id" />

                        <TextInput v-model="paymentData.payment_date" label="Payment Date" type="date" :required="true"
                            :error="paymentErrors.payment_date" />

                        <TextAreaInput v-model="paymentData.reference_note" label="Note" type="text"
                            :error="paymentErrors.reference_note" placeholder="Add any notes about this payment" />
                    </div>

                    <div class="mt-6 flex justify-end space-x-3">
                        <button @click="resetPaymentForm"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Reset
                        </button>
                        <button @click="submitPayment" :disabled="paymentLoading || !isPaymentValid || !selectedDealer"
                            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <i v-if="paymentLoading" class="fas fa-spinner fa-spin"></i>
                            {{ paymentLoading ? 'Processing...' : 'Submit Payment' }}
                        </button>
                    </div>
                </div>

                <!-- Show message when no dealer is selected -->
                <div v-else class="flex flex-col items-center justify-center h-64">
                    <i class="fas fa-user-circle text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                    <p class="text-gray-500 dark:text-gray-400 text-center">
                        Select a customer to view payment details
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useToast } from "vue-toastification";
import axiosClient from '@/axiosClient';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import GlobalDropdown from '@/components/common/GlobalDropdown.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import TextAreaInput from '@/components/common/TextAreaInput.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

import { useCashBankAccountStore } from '@/stores/cashBankAccountStore.js';
const cashBankAccountStore = useCashBankAccountStore();
const accounts = computed(() => {
    const items = cashBankAccountStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.account_name || item.name
    })).filter(item => item !== undefined && item !== null);
});

const toast = useToast();
const loading = ref(false);

// Store data from API
const dealerRecords = ref([]);

// Selected states
const selectedDealer = ref(null);
const selectedInvoice = ref(null);

// Filters
const filters = reactive({
    dealer_id: null
});


const customerPaymentId = ref(null);
const customerId = ref(null);

// Payment data
const paymentLoading = ref(false);
const paymentErrors = ref({});
const paymentData = reactive({
    amount_paid: 0,
    payment_method_id: null,
    payment_date: new Date().toISOString().split('T')[0],
    reference_note: ''
});

const isPaymentValid = computed(() => {
    return paymentData.amount_paid > 0 &&
        paymentData.payment_method_id &&
        paymentData.payment_date;
});

// Fetch report data
const fetchReport = async () => {
    loading.value = true;
    try {
        const params = {};

        if (filters.dealer_id && !isNaN(filters.dealer_id)) {
            params.dealer_id = filters.dealer_id;
        }

        const response = await axiosClient.get('/dealers/report', { params });
        const apiResponse = response.data;

        if (apiResponse.success) {
            dealerRecords.value = apiResponse.data?.records || [];

            // Auto-select first customer if only one is returned
            if (dealerRecords.value.length === 1) {
                selectCustomer(dealerRecords.value[0]);
            } else if (dealerRecords.value.length === 0) {
                selectedDealer.value = null;
                selectedInvoice.value = null;
                resetPaymentForm();
            }
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

// Select customer
const selectCustomer = (record) => {
    selectedDealer.value = record;
    // Auto-select first invoice
    if (record.invoices && record.invoices.length > 0) {
        // Find first unpaid or partially paid invoice
        const unpaidInvoice = record.invoices.find(inv => inv.due_amount > 0);
        if (unpaidInvoice) {
            selectedInvoice.value = unpaidInvoice;
        } else {
            selectedInvoice.value = record.invoices[0];
        }
    } else {
        selectedInvoice.value = null;
    }

    // Reset payment form with total due amount
    resetPaymentForm();
};

// Select invoice (for display purposes only)
const selectInvoice = (invoice) => {
    selectedInvoice.value = invoice;
};

// Validate payment amount
const validatePaymentAmount = () => {
    // if (paymentData.amount_paid > (selectedDealer.value?.total_due_amount || 0)) {
    //     paymentErrors.value.amount_paid = `Amount cannot exceed total due amount (৳ ${formatCurrency(selectedDealer.value?.total_due_amount || 0)})`;
    // } else 
    
    if (paymentData.amount_paid < 0) {
        paymentErrors.value.amount_paid = 'Amount cannot be negative';
    } else {
        paymentErrors.value.amount_paid = '';
    }
};

// Reset payment form
const resetPaymentForm = () => {
    paymentData.amount_paid = selectedDealer.value?.total_due_amount || 0;
    paymentData.payment_method_id = null;
    paymentData.payment_date = new Date().toISOString().split('T')[0];
    paymentData.reference_note = '';
    paymentErrors.value = {};
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
        'paid': 'px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'unpaid': 'px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'partially_paid': 'px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'completed': 'px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'pending': 'px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'cancelled': 'px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return classes[status] || 'px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

// Reset filters
const resetFilters = () => {
    filters.dealer_id = null;
    selectedDealer.value = null;
    selectedInvoice.value = null;
    dealerRecords.value = [];
    resetPaymentForm();
};

// Handle customer change
const handleCustomerChange = (selectedOption) => {
    if (selectedOption && typeof selectedOption === 'object') {
        if (selectedOption.id) {
            filters.dealer_id = selectedOption.id;
        } else if (selectedOption.value) {
            filters.dealer_id = selectedOption.value;
        } else {
            filters.dealer_id = selectedOption.id || selectedOption.value || null;
        }
    } else {
        filters.dealer_id = selectedOption;
    }

    fetchReport();
};

// Watch for changes in filters.dealer_id
watch(() => filters.dealer_id, (newVal) => {
    if (newVal !== null && newVal !== undefined && !isNaN(newVal) && newVal !== '') {
        fetchReport();
    }
});

// Watch for changes in selected dealer to update payment form
watch(selectedDealer, (newVal) => {
    if (newVal) {
        resetPaymentForm();
    }
});

watch(customerId, (newVal) => {
    if (newVal !== null && newVal !== undefined && !isNaN(newVal) && newVal !== '') {
        filters.dealer_id = newVal;
        fetchReport();
    }
});

// Load data on mount
onMounted(async () => {
    await cashBankAccountStore.getAll();
    // customer_id and customer_payment_id from query params
    const urlParams = new URLSearchParams(window.location.search);
    customerId.value = urlParams.get('customer_id');
    customerPaymentId.value = urlParams.get('customer_payment_id');
});

// Submit payment
const submitPayment = async () => {
    if (!selectedDealer.value) {
        toast.error('No customer selected');
        return;
    }

    // Validate payment
    let isValid = true;
    paymentErrors.value = {};

    if (!paymentData.amount_paid || paymentData.amount_paid <= 0) {
        paymentErrors.value.amount_paid = 'Please enter a valid payment amount';
        isValid = false;
    }
    //  else if (paymentData.amount_paid > selectedDealer.value.total_due_amount) {
    //     paymentErrors.value.amount_paid = `Amount cannot exceed total due amount (৳ ${formatCurrency(selectedDealer.value.total_due_amount)})`;
    //     isValid = false;
    // }

    if (!paymentData.payment_method_id) {
        paymentErrors.value.payment_method_id = 'Payment method is required';
        isValid = false;
    }

    if (!paymentData.payment_date) {
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
        // Build payload with dealer_id and without invoice_no
        const payload = {
            dealer_id: selectedDealer.value.dealer_id,
            amount_paid: parseFloat(paymentData.amount_paid),
            payment_method_id: paymentData.payment_method_id,
            payment_date: paymentData.payment_date,
            reference_note: paymentData.reference_note || ''
        };

        // Send payment to API (without invoice_no)
        const response = await axiosClient.post('/dealer-payments', payload);

        if (response.data.success) {
            toast.success(response.data.message || 'Payment submitted successfully');

            // Refresh the data after payment
            await fetchReport();

            // Reset form after successful payment
            if (selectedDealer.value) {
                resetPaymentForm();
            }
        } else {
            throw new Error(response.data.message || 'Payment submission failed');
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

/* Custom scrollbar */
.max-h-\[500px\]::-webkit-scrollbar {
    width: 6px;
}

.max-h-\[500px\]::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.dark .max-h-\[500px\]::-webkit-scrollbar-track {
    background: #374151;
}

.dark .max-h-\[500px\]::-webkit-scrollbar-thumb {
    background: #6b7280;
}

.dark .max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>