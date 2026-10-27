<!-- Preview.vue -->
<template>
    <div class="preview-container bg-gray-100">
        <!-- Preview Content -->
        <div id="preview-content" class="bg-white border border-gray-200 shadow-lg max-w-7xl mx-auto p-8">
            <!-- Company Header -->
            <div class="text-start bg-yellow-100 border-b-2 border-gray-300 pb-4 mb-2 flex flex-row items-center">
                <!-- logo -->
                <img src="/logo/logo-sm.png" alt="App Logo" class="h-14 w-auto mx-auto ml-2" />
                <h1 class="text-xl font-bold text-gray-900 uppercase tracking-wide mx-2">Ratan Consumer Care &
                    Toiletries Ltd.</h1>
                <div>
                    <div class="flex justify-center space-x-4 mt-2">
                        <p class="text-sm text-gray-600 border-r-2 border-gray-300 pr-2 font-semibold">Head Office</p>
                        <p class="text-sm text-gray-600">43 Rankin Street, 2nd Floor
                            Wari, Dhaka-1203, Bangladesh
                            Ph. 88 02 9512188</p>
                    </div>
                    <div class="flex justify-center space-x-4 mt-2">
                        <p class="text-sm text-gray-600 border-r-2 border-gray-300 pr-3 font-semibold">Factory
                        </p>
                        <p class="text-sm text-gray-600">Rayerchala, Haturi achala
                            Machhyapara, Kaliakor
                            Gazipur, Bangladesh</p>
                    </div>

                </div>
            </div>

            <div>
                <div class="flex justify-between">
                    <p class="py-1 text-xs font-semibold text-gray-700 w-50">
                        Ref. {{ workOrderData.reference_no || '-' }}</p>
                    <p class="py-1 text-xs text-gray-900">Date: {{ workOrderData.work_order_date
                        ? formatDate(workOrderData.work_order_date, 'DD-MM-YYYY')
                        : formatDate(new Date(), 'DD-MM-YYYY')
                        }} </p>
                </div>

                <div class="w-full text-xs">
                    <p class="pb-1 font-semibold text-gray-700">Revised Date 1
                        <span class="text-gray-900">: {{ workOrderData.revised_date_1 || '-' }}</span>
                    </p>

                    <p class="font-semibold text-gray-700">Revised Date 2
                        <span class="text-gray-900">: {{ workOrderData.revised_date_2 || '-' }}</span>
                    </p>
                </div>
            </div>

            <!-- Document Title -->
            <div class="text-center mb-6">
                <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wider p-3 bg-gray-200 my-2">Work Order /
                    Requisition Form</h2>
            </div>

            <div class="text-xs pb-4">
                <p class="font-semibold text-gray-700">
                    To
                </p>
                <p class="font-semibold text-gray-700">
                    {{ workOrderData.supplier_name || '-' }}
                </p>
                <p>
                    {{ workOrderData.supplier_address || '-' }}
                </p>
                <p>
                    {{ workOrderData.supplier_city || '-' }}, {{ workOrderData.supplier_country || '-' }}
                </p>
                <p>
                    Factory: {{ workOrderData.supplier_factory_address || '-' }}
                </p>
            </div>

            <!-- Letter Content -->
            <div class="mb-4">
                <p class="pt-2 text-xs text-gray-700 w-50">Ref. {{ workOrderData.reference_no
                    || '-' }}</p>
                <p class="text-sm font-semibold text-gray-700">{{ workOrderData.salutation || '-' }}</p>

                <p class="text-sm font-semibold text-gray-700 mt-1">Subject: <span class="font-normal">{{
                    workOrderData.subject || '-' }}</span></p>

                <p class="text-sm text-gray-700 mt-2">
                    {{ workOrderData.introduction ||
                        '-' }}</p>
            </div>

            <!-- Items Table -->
            <div class="mb-4">
                <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Items</h3>
                <div class="overflow-x-auto border border-gray-300">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-2 py-2 text-left font-bold text-gray-700 border border-gray-300">#</th>
                                <th class="px-2 py-2 text-left font-bold text-gray-700 border border-gray-300">Product
                                </th>
                                <th class="px-2 py-2 text-left font-bold text-gray-700 border border-gray-300">Size</th>
                                <th class="px-2 py-2 text-left font-bold text-gray-700 border border-gray-300">
                                    Quality</th>
                                <th v-if="hasLength"
                                    class="px-2 py-2 text-left font-bold text-gray-700 border border-gray-300">
                                    Length
                                </th>

                                <th v-if="hasWidth"
                                    class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">
                                    Width
                                </th>

                                <th v-if="hasHeight"
                                    class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">
                                    Height
                                </th>

                                <th v-if="hasWeight"
                                    class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">
                                    Weight
                                </th>

                                <th v-if="hasColor"
                                    class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">
                                    Color
                                </th>

                                <th class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">
                                    Quantity</th>
                                <!-- Unit -->
                                <th class="px-2 py-2 text-center font-bold text-gray-700 border border-gray-300">Unit
                                </th>
                                <th class="px-2 py-2 text-right font-bold text-gray-700 border border-gray-300">Unit
                                    Price</th>
                                <th class="px-2 py-2 text-right font-bold text-gray-700 border border-gray-300">Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in workOrderData.items" :key="index">
                                <td class="px-2 py-2 border border-gray-300 text-center">{{ index + 1 }}</td>
                                <td class="px-2 py-2 border border-gray-300">{{ item.product_description || '-' }}</td>
                                <td class="px-2 py-2 border border-gray-300">{{ item.size || '-' }}</td>
                                <td class="px-2 py-2 border border-gray-300">{{ item.foil_quality || '-' }}</td>
                                <td v-if="hasLength" class="px-2 py-2 border border-gray-300">
                                    {{ item.length || '-' }}
                                </td>

                                <td v-if="hasWidth" class="px-2 py-2 border border-gray-300 text-center">
                                    {{ item.width || '-' }}
                                </td>

                                <td v-if="hasHeight" class="px-2 py-2 border border-gray-300 text-center">
                                    {{ item.height || '-' }}
                                </td>

                                <td v-if="hasWeight" class="px-2 py-2 border border-gray-300 text-center">
                                    {{ item.weight || '-' }}
                                </td>

                                <td v-if="hasColor" class="px-2 py-2 border border-gray-300 text-center">
                                    {{ item.color || '-' }}
                                </td>

                                <td class="px-2 py-2 border border-gray-300 text-center">{{ item.order_quantity_kg || 0
                                    }}</td>
                                <td class="px-2 py-2 border border-gray-300 text-center">{{ item.unit || '-' }}</td>
                                <td class="px-2 py-2 border border-gray-300 text-right">৳ {{
                                    formatPrice(item.unit_price_per_kg) }}</td>
                                <td class="px-2 py-2 border border-gray-300 text-right font-semibold">৳ {{
                                    formatPrice(item.total_bill_amount) }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="bg-gray-50">
                                <td :colspan="visibleItemColumns - 4"
                                    class="px-2 py-2 border border-gray-300 text-right font-semibold">
                                    Total Items:
                                </td>
                                <td class="px-2 py-2 border border-gray-300 text-center font-semibold">
                                    {{ totalItems }}
                                </td>
                                <td colspan="2" class="border border-gray-300"></td>
                            </tr>
                            <tr class="bg-gray-100">
                                <td :colspan="visibleItemColumns - 1"
                                    class="px-2 py-2 border border-gray-300 text-right font-bold text-gray-800">
                                    Grand Total:
                                </td>
                                <td class="px-2 py-2 border border-gray-300 text-right font-bold text-blue-600 text-lg">
                                    ৳ {{ formatPrice(grandTotal) }}
                                </td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td :colspan="visibleItemColumns"
                                    class="px-2 py-2 border border-gray-300 text-right font-semibold text-gray-700">
                                    Total Amount in Words: {{ workOrderData.total_amount_in_words || 'Zero Only' }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Terms -->
            <div v-if="hasTerms" class="border border-gray-300 rounded p-3 mb-4">
                <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <ul class="list-disc list-inside text-xs text-gray-700 space-y-1">
                    <li v-if="workOrderData.term_a">{{ workOrderData.term_a }}</li>
                    <li v-if="workOrderData.term_b">{{ workOrderData.term_b }}</li>
                    <li v-if="workOrderData.term_c">{{ workOrderData.term_c }}</li>
                    <li v-if="workOrderData.term_d">{{ workOrderData.term_d }}</li>
                    <li v-if="workOrderData.term_e">{{ workOrderData.term_e }}</li>
                </ul>
            </div>

            <!-- Special Notes -->
            <div v-if="workOrderData.special_notes" class="border bg-yellow-200 rounded p-2 mb-4">
                <p class="text-sm text-gray-700 mb-1">
                    Special Notes: {{ workOrderData.special_notes }}</p>
            </div>

            <!-- Footer with Signatures -->
            <div class="grid grid-cols-2 gap-10 mt-6 pt-4 border-t-1 border-gray-300">
                <div class="text-center">
                    <p class="text-xs font-semibold text-gray-600 uppercase">{{ workOrderData.signature_label ||
                        'Approved By' }}</p>
                    <div v-if="workOrderData.received_by_name" class="text-xs text-gray-700 mt-2">
                        {{ workOrderData.received_by_name }}
                    </div>
                    <!-- <div class="mt-6 border-b-2 mx-auto border-gray-500 w-[250px]"></div> -->
                    <!-- <p class="text-xs text-gray-500 mt-1">Signature</p> -->
                    <!-- <p class="text-xs text-gray-500">Date: ___________</p> -->
                </div>

                <div class="text-center">
                    <p class="text-xs font-semibold text-gray-600 uppercase">{{ workOrderData.receiving_copy_label ||
                        'Receiving Copy' }}</p>
                    <div v-if="workOrderData.requested_by_name" class="text-xs text-gray-700 mt-2">
                        {{ workOrderData.requested_by_name }}
                    </div>
                    <!-- <div class="mt-6 border-b-2 mx-auto border-gray-500 w-[250px]"></div> -->
                    <!-- <p class="text-xs text-gray-500 mt-1">Signature</p> -->
                    <!-- <p class="text-xs text-gray-500">Date: ___________</p> -->
                </div>
            </div>
            <div class="flex justify-between mt-6">
                <div class="text-xs text-gray-500 mt-4">
                    Sincerely Yours
                </div>
                <div class="text-xs text-gray-500 mt-4">
                    Receiving Copy
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200">
                <p>Generated on: {{ formatDateTime(new Date()) }}</p>
                <p class="mt-1">This is a auto generated work order.</p>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-6 flex-wrap">
            <button @click="$emit('close')"
                class="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <i class="fas fa-times"></i>
                <span>Close</span>
            </button>
            <button @click="$emit('confirm')" :disabled="loading"
                class="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                :class="{ 'opacity-50 cursor-not-allowed': loading }">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                <span>{{ loading ? 'Submitting...' : 'Confirm & Submit' }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
    workOrderData: {
        type: Object,
        required: true,
        default: () => ({
            reference_no: 'WO-2024-001',
            work_order_date: null,
            revised_date_1: null,
            revised_date_2: null,
            status: 'PENDING',
            supplier_name: '',
            supplier_address: '',
            supplier_city: '',
            supplier_country: '',
            supplier_factory_address: '',
            subject: '',
            salutation: '',
            introduction: '',
            total_bill_amount: 0,
            total_amount_in_words: '',
            term_a: '',
            term_b: '',
            term_c: '',
            term_d: '',
            term_e: '',
            special_notes: '',
            signature_label: 'Authorized Signature',
            receiving_copy_label: 'Supplier Copy',
            received_by_name: '',
            requested_by_name: '',
            items: []
        })
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'confirm']);
const toast = useToast();

// Computed
const hasTerms = computed(() => {
    return props.workOrderData.term_a ||
        props.workOrderData.term_b ||
        props.workOrderData.term_c ||
        props.workOrderData.term_d ||
        props.workOrderData.term_e;
});

const totalItems = computed(() => {
    if (props.workOrderData.items) {
        return props.workOrderData.items.reduce((sum, item) => sum + (item.order_quantity_kg || 0), 0);
    }
    return 0;
});

const grandTotal = computed(() => {
    if (props.workOrderData.items) {
        return props.workOrderData.items.reduce((sum, item) => sum + (item.total_bill_amount || 0), 0);
    }
    return 0;
});

// Methods
const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
};

const formatDate = (date, format = 'DD-MM-YYYY') => {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

const formatDateTime = (date) => {
    if (!date) return '-';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const hasLength = computed(() => {
    return props.workOrderData.items?.some(item =>
        item.length !== null &&
        item.length !== undefined &&
        String(item.length).trim() !== ''
    );
});

const hasWidth = computed(() => {
    return props.workOrderData.items?.some(item =>
        item.width !== null &&
        item.width !== undefined &&
        String(item.width).trim() !== ''
    );
});

const hasHeight = computed(() => {
    return props.workOrderData.items?.some(item =>
        item.height !== null &&
        item.height !== undefined &&
        String(item.height).trim() !== ''
    );
});

const hasWeight = computed(() => {
    return props.workOrderData.items?.some(item =>
        item.weight !== null &&
        item.weight !== undefined &&
        String(item.weight).trim() !== ''
    );
});

const hasColor = computed(() => {
    return props.workOrderData.items?.some(item =>
        item.color !== null &&
        item.color !== undefined &&
        String(item.color).trim() !== ''
    );
});

// Total number of columns in the table
const visibleItemColumns = computed(() => {
    let columns = 8; // #, Product, Size, Foil Quality, Quantity, Unit, Unit Price, Total

    if (hasLength.value) columns++;
    if (hasWidth.value) columns++;
    if (hasHeight.value) columns++;
    if (hasWeight.value) columns++;
    if (hasColor.value) columns++;

    return columns;
});

const printPreview = () => {
    const content = document.getElementById('preview-content');
    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    printWindow.document.write(`
        <html>
            <head>
                <title>Work Order - ${props.workOrderData.reference_no || 'Preview'}</title>
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        margin: 20px;
                        padding: 0;
                        background: white;
                    }
                    .print-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #d1d5db;
                        padding: 6px 10px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #f3f4f6;
                        font-weight: bold;
                        text-align: left;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .font-semibold { font-weight: 600; }
                    .text-lg { font-size: 18px; }
                    .text-xl { font-size: 20px; }
                    .text-2xl { font-size: 24px; }
                    .text-sm { font-size: 13px; }
                    .text-xs { font-size: 11px; }
                    .text-gray-500 { color: #6b7280; }
                    .text-gray-600 { color: #4b5563; }
                    .text-gray-700 { color: #374151; }
                    .text-gray-800 { color: #1f2937; }
                    .text-gray-900 { color: #111827; }
                    .text-blue-600 { color: #2563eb; }
                    .text-yellow-800 { color: #92400e; }
                    .bg-yellow-200 { background-color: #fde68a; }
                    .bg-gray-50 { background-color: #f9fafb; }
                    .bg-gray-100 { background-color: #f3f4f6; }
                    .border { border: 1px solid #d1d5db; }
                    .border-2 { border-width: 2px; }
                    .border-t-2 { border-top-width: 2px; }
                    .border-b-2 { border-bottom-width: 2px; }
                    .border-gray-300 { border-color: #d1d5db; }
                    .border-gray-400 { border-color: #9ca3af; }
                    .border-gray-200 { border-color: #e5e7eb; }
                    .rounded { border-radius: 4px; }
                    .p-3 { padding: 12px; }
                    .p-8 { padding: 32px; }
                    .px-2 { padding-left: 8px; padding-right: 8px; }
                    .px-3 { padding-left: 12px; padding-right: 12px; }
                    .py-1 { padding-top: 4px; padding-bottom: 4px; }
                    .py-2 { padding-top: 8px; padding-bottom: 8px; }
                    .mt-1 { margin-top: 4px; }
                    .mt-2 { margin-top: 8px; }
                    .mt-3 { margin-top: 12px; }
                    .mt-4 { margin-top: 16px; }
                    .mt-6 { margin-top: 24px; }
                    .mb-1 { margin-bottom: 4px; }
                    .mb-2 { margin-bottom: 8px; }
                    .mb-4 { margin-bottom: 16px; }
                    .mb-6 { margin-bottom: 24px; }
                    .gap-4 { gap: 16px; }
                    .grid { display: grid; }
                    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                    .w-full { width: 100%; }
                    .w-28 { width: 112px; }
                    .w-32 { width: 128px; }
                    .inline-block { display: inline-block; }
                    .uppercase { text-transform: uppercase; }
                    .tracking-wider { letter-spacing: 0.05em; }
                    .tracking-wide { letter-spacing: 0.025em; }
                    .list-disc { list-style-type: disc; }
                    .list-inside { list-style-position: inside; }
                    .ml-2 { margin-left: 8px; }
                    .space-y-1 > * + * { margin-top: 4px; }
                    .overflow-x-auto { overflow-x: auto; }
                    .no-print { display: none !important; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .no-print { display: none !important; }
                        .bg-yellow-200 {
                            background-color: #fde68a !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .bg-gray-50 {
                            background-color: #f9fafb !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .bg-gray-100 {
                            background-color: #f3f4f6 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .text-blue-600 { color: #2563eb !important; }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${content.innerHTML}
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 500);
};
</script>

<style scoped>
.preview-container {
    @apply p-2 md:p-4;
}

#preview-content {
    @apply transition-all;
    font-family: Arial, Helvetica, sans-serif;
}

/* Print styles */
@media print {
    .preview-container {
        padding: 0;
    }

    #preview-content {
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 20px !important;
        max-width: 100% !important;
    }

    .preview-container>div:last-child {
        display: none !important;
    }

    .bg-yellow-200 {
        background-color: #fde68a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .bg-gray-50 {
        background-color: #f9fafb !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .bg-gray-100 {
        background-color: #f3f4f6 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
</style>