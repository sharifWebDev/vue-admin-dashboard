<template>
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Payments List</h1>
      </div>
      <Breadcrumb />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
    <!-- Header with Filters and Search -->
    <div class="flex flex-col gap-4 mb-4">
      <div class="flex flex-col sm:flex-row justify-between items-start lg:items-center gap-4">
        <button @click="openCreateModal" v-permission="['sales_invoices.repayments']"
          class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
          <i class="fas fa-plus"></i>
          <span>New Payment</span>
        </button>
      </div>

      <!-- Filter Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div>
          <SearchSelect v-model="filters.dealer_id" :options="dealerStoreItems" label="Customer"
            placeholder="-- All Customer --" :clearable="true" @update:model-value="handleFilterChange" />
        </div>
        <div>
          <SearchSelect v-model="filters.payment_method_id" :options="accounts" label="Payment Method"
            placeholder="-- All Methods --" :clearable="true" @update:model-value="handleFilterChange" />
        </div>
        <div>
          <TextInput v-model="filters.from_date" label="From Date" type="date" :clearable="true"
            @update:model-value="handleFilterChange" />
        </div>
        <div>
          <TextInput v-model="filters.to_date" label="To Date" type="date" :clearable="true"
            @update:model-value="handleFilterChange" />
        </div>

        <!-- Search Row -->
        <div class="flex flex-col sm:flex-row justify-start items-center gap-4 mt-6">
          <div class="relative flex-grow max-w-md w-full">
            <input v-model="searchQuery" @input="handleSearch" type="search"
              placeholder="Search by invoice no, customer name..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
            <div class="absolute left-3 top-2.5 text-gray-400">
              <i class="fas fa-search text-base"></i>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="refreshData"
              class="btn px-3 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-lg flex items-center gap-2 transition-colors">
              <i class="fas fa-sync-alt" :class="{ 'animate-spin': refresh }"></i>
            </button>
          </div>
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

          <TableLoadingState v-if="paymentStore.loading" :is-loading="true" :total-items="paymentStore.totalItems"
            :item-name="'payments'" />

          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <TableLoadingState v-if="paymentStore.items.length === 0 && !paymentStore.loading" :is-loading="false"
              :isEmpty="true" :has-search="!!searchQuery" :item-name="'payments'" empty-icon="fas fa-money-bill-wave" />

            <tr v-else v-for="(payment, index) in displayedItems" :key="payment.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ calculateRowNumber(index) }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                <p class="text-sm font-medium text-gray-900 dark:text-white"> {{ payment.invoice_no || 'N/A' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Date: {{ formatDate(payment.payment_date) }}</p>

              </td>
              <td class="px-6 py-3 whitespace-nowrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.dealer_name || '-' }}</p>
                <p v-if="payment.company" class="text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Company:</span> {{ payment.company }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400"> Payment Method: {{ payment.payment_method?.account_name }}</p>
                </td> 
              <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ payment.paid_by || 'System' }}
              </td>

              <td class="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                ৳{{ formatNumber(payment.amount_paid) }}
              </td>
              <!-- created_at -->
              <!-- <td class="px-6 py-3 text-sm text-gray-900 dark:text-white">
                {{ formatDate(payment.created_at) }}
              </td> -->
              <td class="px-6 py-3 text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewPayment(payment)" v-permission="['payments.list']"
                    class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1.5 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                    title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paymentStore.pagination?.total > 0" class="mt-6">
      <Pagination :total-items="paymentStore.pagination.total" :per-page="paymentStore.pagination.per_page"
        :current-page="paymentStore.pagination.current_page" :last-page="paymentStore.pagination.last_page"
        :is-loading="paymentStore.loading" @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
    </div>
  </div>

  <!-- Create Modal - Enter Invoice No -->
  <BaseModal v-model="showCreateModal" title="New Payment" maxWidth="md" @close="closeCreateModal">
    <div class="p-6">
      <div class="text-center mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <i class="fas fa-file-invoice text-blue-600 text-xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Enter Sales Invoice Number</h3>
        <p class="text-sm text-gray-500">
          Start recording a payment by entering the invoice number.
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Invoice Number <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-hashtag text-gray-400"></i>
          </div>
          <input type="text" v-model="invoiceIdInput" @keyup.enter="validateAndProceed" placeholder="e.g. SI-000001"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500': validationError }" autofocus>
        </div>
        <p v-if="validationError" class="mt-1 text-sm text-red-600 flex items-center gap-1">
          <i class="fas fa-exclamation-circle"></i>
          {{ validationError }}
        </p>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button @click="closeCreateModal"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white">
          Cancel
        </button>
        <button @click="validateAndProceed" :disabled="verifying"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          <i v-if="verifying" class="fas fa-spinner fa-spin"></i>
          <span>{{ verifying ? 'Verifying...' : 'Proceed' }}</span>
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- View Payment Modal -->
  <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="3xl" title="Payment Details" @close="closeViewModal">
    <div v-if="viewLoading" class="px-6 py-8 text-center text-gray-500">
      <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
      <p>Loading details...</p>
    </div>

    <div v-else-if="viewingPayment && viewingPayment.payment" class="px-1 py-1">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Payment Information Section -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white border-b pb-2 mb-4 flex items-center gap-2">
            <i class="fas fa-money-bill-wave text-blue-500"></i>
            Payment Information
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Invoice No</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ viewingPayment.payment.invoice_no
                }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Payment Date</span>
              <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(viewingPayment.payment.payment_date)
                }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Amount Paid</span>
              <span class="text-sm font-bold text-green-600">৳ {{ formatNumber(viewingPayment.payment.amount_paid)
                }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Payment Method</span>
              <span class="text-sm text-gray-900 dark:text-white capitalize">{{
                viewingPayment?.payment?.payment_method?.account_name }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Paid By</span>
              <span class="text-sm text-gray-900 dark:text-white font-medium">{{ viewingPayment.payment.paid_by
                }}</span>
            </div>
            <div v-if="viewingPayment.payment.cheque_number"
              class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Cheque No</span>
              <span class="text-sm text-gray-900 dark:text-white">{{ viewingPayment.payment.cheque_number }}</span>
            </div>
            <div v-if="viewingPayment.payment.cell_number"
              class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Cell No</span>
              <span class="text-sm text-gray-900 dark:text-white">{{ viewingPayment.payment.cell_number }}</span>
            </div>
            <div v-if="viewingPayment.payment.transaction_id"
              class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Transaction ID</span>
              <span class="text-sm text-gray-900 dark:text-white">{{ viewingPayment.payment.transaction_id }}</span>
            </div>
          </div>

          <div v-if="viewingPayment.payment.reference_note" class="mt-4">
            <label class="text-xs font-medium text-gray-500 uppercase">Reference Note</label>
            <p class="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-2 rounded mt-1 italic">
              {{ viewingPayment.payment.reference_note }}
            </p>
          </div>
        </div>

        <!-- Invoice Summary Section -->
        <div v-if="viewingPayment.invoice" class="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white border-b pb-2 mb-4 flex items-center gap-2">
            <i class="fas fa-file-invoice text-indigo-500"></i>
            Invoice Summary
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Invoice Date</span>
              <span class="text-sm text-gray-900 dark:text-white">{{ viewingPayment.invoice.invoice_date }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Grand Total</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">৳ {{
                formatNumber(viewingPayment.invoice.grand_total) }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-1">
              <span class="text-xs font-medium text-gray-500 uppercase">Total Paid</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">৳ {{
                formatNumber(viewingPayment.invoice.paid_amount) }}</span>
            </div>
            <div class="flex justify-between bg-red-50 dark:bg-red-900/10 p-2 rounded">
              <span class="text-xs font-bold text-red-600 uppercase">Remaining Due</span>
              <span class="text-sm font-bold text-red-600">৳ {{ formatNumber(viewingPayment.invoice.due_amount)
                }}</span>
            </div>
            <div class="mt-4">
              <label class="text-xs font-medium text-gray-500 uppercase">Customer Name</label>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ viewingPayment.invoice.dealer_name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Pay Now / Record Payment Modal -->
  <BaseModal v-if="showPayModal" :show="showPayModal" title="Record Payment" maxWidth="md" @close="closePayModal">
    <div class="px-6 py-4">
      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue-700 dark:text-blue-300 font-medium">Invoice: {{ currentInvoiceNo }}</span>
            <span v-if="currentDueAmount > 0" class="text-sm text-red-600 font-bold">Due: ৳ {{
              formatNumber(currentDueAmount) }}</span>
          </div>
        </div>

        <div id="pf_amount_paid">
          <NumberInput v-model="paymentData.amount_paid" label="Payment Amount" type="number" min="1" placeholder="0.00"
            :required="true" :error="paymentErrors.amount_paid" />
        </div>

        <div id="pf_payment_method_id">
          <SearchSelect v-model="paymentData.payment_method_id" :options="accounts" label="Account"
            placeholder="Select Account" :required="true" :error="paymentErrors.payment_method_id" />
        </div> 

        <div id="pf_payment_date">
          <TextInput v-model="paymentData.payment_date" label="Payment Date" type="date" :required="true"
            :error="paymentErrors.payment_date" />
        </div>

        <TextInput v-model="paymentData.reference_note" label="Reference Note" placeholder="Optional notes" />
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button @click="closePayModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button @click="submitPayment" :disabled="paymentLoading"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
          <i v-if="paymentLoading" class="fas fa-spinner fa-spin"></i>
          <span>{{ paymentLoading ? 'Processing...' : 'Submit' }}</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import { usePaymentStore } from '@/stores/paymentStore';
import { useDealerStore } from '@/stores/dealerStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';

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
const paymentStore = usePaymentStore();
const dealerStore = useDealerStore();

// UI State
const refresh = ref(false);
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

const filters = ref({
  dealer_id: null,
  payment_method_id: null,
  from_date: '',
  to_date: ''
});

// Modals State
const showViewModal = ref(false);
const viewLoading = ref(false);
const viewingPayment = ref(null);

const showCreateModal = ref(false);
const showPayModal = ref(false);
const verifying = ref(false);
const invoiceIdInput = ref('');
const validationError = ref('');

const paymentLoading = ref(false);
const currentSaleId = ref(null);
const currentInvoiceNo = ref('');
const currentDueAmount = ref(0);
const paymentErrors = ref({});
const paymentData = ref({
  amount_paid: 0,
  payment_method_id: 'cash',
  cheque_number: '',
  cell_number: '',
  transaction_id: '',
  payment_date: new Date().toISOString().split('T')[0],
  reference_note: ''
});

// Options
const tableColumns = [
  { key: "invoice_no", label: "Invoice No", sortable: true },
  { key: "dealer_name", label: "Customer", sortable: true }, 
  { key: "paid_by", label: "Paid By", sortable: true },
  { key: "amount_paid", label: "Amount Paid", sortable: true, class: "text-right", align: "right" } 
];

const paymentMethodOptions = [
  { id: 'cash', name: 'Cash' },
  { id: 'check', name: 'Cheque' },
  { id: 'mobile_banking', name: 'Mobile Banking' },
  { id: 'bank_transfer', name: 'Bank Transfer' }
];

// Computed
const dealerStoreItems = computed(() => (dealerStore.items || []).map(i => ({ id: i.id, name: i.name || i.dealer_name })));
const displayedItems = computed(() => paymentStore.items || []);

// Helper Functions
const calculateRowNumber = (idx) => {
  const p = paymentStore.pagination;
  if (p?.from) return p.from + idx;
  return ((p?.current_page || 1) - 1) * (p?.per_page || 10) + idx + 1;
};
const formatNumber = (v) => v ? Number(v).toFixed(2) : '0.00';
const formatDate = (d) => d || 'N/A';
const formatPaymentMethod = (m) => m ? m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';

// Handlers
const handleFilterChange = () => {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => paymentStore.get(filters.value), 400);
};

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => paymentStore.search(searchQuery.value), 500);
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
  } catch (error) {
    toast.error('Failed to refresh data');
  } finally {
    refresh.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  paymentStore.search(null);
};

const clearAllFilters = () => {
  filters.value = {
    dealer_id: null,
    payment_method_id: null,
    from_date: '',
    to_date: ''
  };
  paymentStore.get();
};

// Modal Logic
const openCreateModal = () => {
  invoiceIdInput.value = '';
  validationError.value = '';
  showCreateModal.value = true;
};

const closeCreateModal = () => { showCreateModal.value = false; };

const validateAndProceed = async () => {
  const input = invoiceIdInput.value.trim();
  if (!input) {
    validationError.value = 'Please enter an invoice number';
    return;
  }
  verifying.value = true;
  validationError.value = '';
  try {
    const res = await axiosClient.get(`/sales-invoices/${input}`);
    if (res.data?.success) {
      const matched = res.data.data;
      // Some APIs return exact match or closest. We check invoice_no.
      if (matched && matched.invoice_no === input) {
        if (matched.status !== 'completed' && matched.status !== 'partially_returned') {
          validationError.value = `Status is ${matched.status}. Only completed invoices can have payments.`;
          return;
        }
        showCreateModal.value = false;
        openPayModal(matched);
      } else {
        validationError.value = 'Invoice no match failed.';
      }
    } else {
      validationError.value = 'Invoice not found.';
    }
  } catch (err) {
    validationError.value = 'Error fetching invoice. Verify the number.';
  } finally {
    verifying.value = false;
  }
};

const openPayModal = (sale) => {
  currentSaleId.value = sale.id;
  currentInvoiceNo.value = sale.invoice_no;
  currentDueAmount.value = sale.due_amount || 0;
  paymentErrors.value = {};
  paymentData.value = {
    amount_paid: sale.due_amount || 0,
    payment_method_id: 'cash',
    cheque_number: '',
    cell_number: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_note: ''
  };
  showPayModal.value = true;
};

const payNowForInvoice = async (payment) => {
  try {
    const res = await axiosClient.get(`/sales-invoices/${payment.sales_invoice_id}`);
    if (res.data?.success) openPayModal(res.data.data);
  } catch (err) { toast.error('Failed to get invoice info'); }
};

const closePayModal = () => { showPayModal.value = false; };

const viewPayment = async (p) => {
  try {
    viewLoading.value = true;
    showViewModal.value = true;
    const res = await axiosClient.get(`/payments/${p.id}`);
    if (res.data?.success) {
      viewingPayment.value = res.data.data;
    }
  } catch (err) {
    toast.error('Failed to load payment details');
    closeViewModal();
  } finally {
    viewLoading.value = false;
  }
};

const closeViewModal = () => { showViewModal.value = false; viewingPayment.value = null; };

// Payment Submission
const validatePayment = () => {
  paymentErrors.value = {};
  let valid = true;
  const d = paymentData.value;
  if (!d.amount_paid || d.amount_paid <= 0) { paymentErrors.value.amount_paid = 'Amount > 0 required'; valid = false; }
  if (!d.payment_method_id) { paymentErrors.value.payment_method_id = 'Method required'; valid = false; }
  if (d.payment_method_id === 'check' && !d.cheque_number) { paymentErrors.value.cheque_number = 'Required'; valid = false; }
  if (d.payment_method_id === 'mobile_banking' && !d.cell_number) { paymentErrors.value.cell_number = 'Required'; valid = false; }
  if (d.payment_method_id === 'bank_transfer' && !d.transaction_id) { paymentErrors.value.transaction_id = 'Required'; valid = false; }
  return valid;
};

const submitPayment = async () => {
  if (!validatePayment()) {
    const firstErr = Object.keys(paymentErrors.value)[0];
    const el = document.querySelector(`#pf_${firstErr} input, #pf_${firstErr} select`);
    if (el) el.focus();
    return;
  }
  paymentLoading.value = true;
  try {
    const res = await axiosClient.post(`/sales-invoices/${currentSaleId.value}/payments`, paymentData.value);
    if (res.data.success) {
      toast.success('Payment recorded');
      showPayModal.value = false;
      paymentStore.get();
    } else { toast.error(res.data.message || 'Submit failed'); }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error occurred');
  } finally {
    paymentLoading.value = false;
  }
};

// Pagination/Sort
const handlePageChange = (p) => paymentStore.paginate(p);
const handlePerPageChange = (pp) => paymentStore.changePerPage(pp);
const sortByColumn = (col) => paymentStore.sort(col, paymentStore.sortDirection === 'asc' ? 'desc' : 'asc');

onMounted(() => {
  paymentStore.get();
  dealerStore.getAll();
  cashBankAccountStore.getAll();
});
</script>