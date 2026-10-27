<template>
    <div>
        <!-- TOP SECTION -->
        <div class="flex justify-between items-center rounded bg-gray-50 dark:bg-gray-800 px-1">
            <div class="flex items-center gap-4">
                <router-link to="/return/sales" class="flex items-center border border-gray-200 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-300 
                    hover:text-gray-900 dark:hover:text-gray-300 transition-colors text-sm">
                    <i class="fas fa-arrow-left"></i>
                    <span class="hidden sm:inline">Back to Returns</span>
                </router-link>
                <h6 class="text-sm text-gray-800 dark:text-white">Sales Return</h6>
                <span v-if="returnData.id" class="text-xs px-2 py-1 rounded-full" :class="statusBadgeClass">
                    {{ returnData.status || 'draft' }}
                </span>
            </div>
            <Breadcrumb />
        </div>

        <!-- MAIN RETURN SECTION -->
        <div class="bg-gray-50 dark:bg-gray-800 overflow-hidden font-sans flex flex-col">
            <div class="flex flex-col lg:flex-row flex-wrap px-1 md:px-1 py-4 gap-4 md:gap-4 overflow-hidden">
                <!-- Left Section - Return Items -->
                <div
                    class="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 md:p-6 flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="flex flex-wrap items-end gap-6 mb-8">
                        <!-- Return Date -->
                        <div class="w-full lg:w-[calc(50%-1.5rem)] xl:flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Return Date
                            </label>
                            <div class="relative flex items-center">
                                <flat-pickr v-model="returnData.return_date" :config="dateConfig"
                                    :disabled="!isEditable"
                                    class="w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 transition-all" />
                                <div class="absolute left-4 text-gray-400">
                                    <i class="far fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Return Reason -->
                        <div class="w-full lg:w-[calc(50%-1.5rem)] xl:flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Return Reason
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="returnData.return_reason" :disabled="!isEditable"
                                    class="w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 transition-all">
                                    <option value="">Select Reason</option>
                                    <option value="damaged">Damaged - Items arrived damaged</option>
                                    <option value="defective">Defective - Items are defective/faulty</option>
                                    <option value="excess_stock">Excess Stock - Over-ordered</option>
                                    <option value="customer_return">Customer Return - Customer returned item</option>
                                    <option value="quality_issue">Quality Issue - Quality issues found</option>
                                    <option value="wrong_item">Wrong Item - Wrong item received</option>
                                    <option value="duplicate_order">Duplicate Order - Duplicate order received</option>
                                    <option value="other">Other - Specify in notes</option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-exclamation-circle"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Original Invoice Info (Read-only) -->
                        <div class="w-full" v-if="salesInvoice">
                            <div
                                class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div class="flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Original Invoice</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">{{
                                            salesInvoice.invoice_no }}</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Customer</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">{{
                                            salesInvoice.dealer_name }}</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Invoice Date</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">{{
                                            formatDate(salesInvoice.invoice_date) }}</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">৳ {{
                                            formatNumber(salesInvoice.grand_total) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div class="w-full">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea v-model="returnData.notes" :disabled="!isEditable" rows="2"
                                placeholder="Add any additional notes about this return..."
                                class="w-full px-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 transition-all"></textarea>
                        </div>
                    </div>

                    <!-- Return Items Header -->
                    <div class="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center flex-shrink-0">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Return Items
                            ({{ returnLines.length + giftReturnLines.length }})</h3>
                        <div class="flex items-center gap-2">
                            <button @click="openAddItemsModal" :disabled="!isEditable"
                                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm disabled:opacity-50">
                                <i class="fas fa-plus"></i>
                                <span>Add Items</span>
                            </button>
                        </div>
                        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Return Amount: ৳ {{
                            grandTotal.toFixed(2) }}</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Variant Package
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit
                                        Price</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty to
                                        Return</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Max
                                        Qty</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                <tr v-for="(line, index) in returnLines" :key="line.id || index"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <!-- Product Info -->
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                                                <img :src="line.image_url" :alt="line.product_name"
                                                    class="w-full h-full object-cover" v-if="line.image_url">
                                                <div v-else
                                                    class="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i class="fas fa-box"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-900 dark:text-white">{{
                                                    line.product_name }}</p>
                                                <p class="text-xs text-gray-500">{{ line.sku }}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Variant Package -->
                                    <td class="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                                        {{ formatVariantPackageLabel(line) }}
                                    </td>

                                    <!-- Unit Price -->
                                    <td class="px-4 py-3 text-center">
                                        <div class="relative inline-block">
                                            <input type="number" v-model="line.unit_price" :disabled="true"
                                                @input="updateLineTotal(line)" step="0.01" min="0"
                                                class="w-28 px-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100 cursor-not-allowed">
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <div class="flex items-center justify-center gap-1">
                                            <div
                                                class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                                                <button @click="decreaseQty(index)"
                                                    :disabled="!isEditable || line.quantity <= 0"
                                                    class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                                                    <i class="fas fa-minus text-xs"></i>
                                                </button>

                                                <input type="number" v-model="line.quantity" min="0"
                                                    :max="line.max_returnable_qty" step="1"
                                                    @input="handleQtyInput($event, index)"
                                                    class="w-[90px] pl-2 py-1 -mx-5 z-5 text-center text-sm font-medium dark:text-white bg-gray-100 dark:bg-gray-700 
                                        border border-gray-100 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-200" />

                                                <button @click="increaseQty(index)"
                                                    :disabled="!isEditable || line.quantity >= line.max_returnable_qty"
                                                    class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                                                    <i class="fas fa-plus text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Max Quantity -->
                                    <td class="px-4 py-3 text-center text-sm text-gray-500">
                                        {{ line.max_returnable_qty }}
                                    </td>

                                    <!-- Total -->
                                    <td
                                        class="px-4 py-3 text-left font-semibold text-blue-600 flex items-center justify-between">
                                        <p class="mr-5 text-sm"> ৳ {{ line.line_total.toFixed(2) }} </p>

                                        <div class="flex items-end justify-end -mr-2">
                                            <button @click="removeItem(index)" :disabled="!isEditable"
                                                class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                                                <i class="fas fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Empty State -->
                                <tr v-if="returnLines.length === 0">
                                    <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                                        <i class="fas fa-box-open text-4xl mb-3 opacity-50"></i>
                                        <p>No products found in this sales invoice</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Gift Return Items -->
                    <div v-if="giftReturnLines.length > 0" class="mt-6 border-t border-green-200 pt-4">
                        <h3 class="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
                            Gift Items ({{ giftReturnLines.length }})
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-green-200 dark:divide-green-700">
                                <thead class="bg-green-50 dark:bg-green-900/20">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            Variant Package</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            Qty to Return</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            Max Qty</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Action</th>
                                    </tr>
                                </thead>
                                <tbody
                                    class="divide-y divide-green-100 dark:divide-green-800 bg-green-50/30 dark:bg-green-900/10">
                                    <tr v-for="(line, index) in giftReturnLines" :key="line.id || `gift-${index}`">
                                        <td class="px-4 py-3">
                                            <p class="text-sm text-gray-900 dark:text-white">{{ line.product_name }}</p>
                                            <p class="text-xs text-gray-500">{{ line.sku }}</p>
                                        </td>
                                        <td class="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{{
                                            formatVariantPackageLabel(line) }}</td>
                                        <td class="px-4 py-3 text-center">
                                            <input type="number" v-model="line.quantity" min="0"
                                                :max="line.max_returnable_qty"
                                                @input="handleGiftQtyInput($event, index)" :disabled="!isEditable"
                                                class="w-24 px-2 py-1 text-center border border-green-200 rounded-lg bg-white" />
                                        </td>
                                        <td class="px-4 py-3 text-center text-sm text-gray-500">{{
                                            line.max_returnable_qty }}</td>
                                        <td class="px-4 py-3 text-right">
                                            <button @click="removeGiftItem(index)" :disabled="!isEditable"
                                                class="w-7 h-7 inline-flex items-center justify-center border border-gray-200 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50">
                                                <i class="fas fa-trash text-xs"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right Section - Return Summary & Actions -->
                <div class="w-full lg:w-96 space-y-4 flex flex-col overflow-hidden">
                    <!-- Return Summary -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Summary</h3>

                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Subtotal</span>
                                <span class="text-sm font-medium">৳ {{ subtotal.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between" v-if="itemDiscountTotal > 0">
                                <span class="text-sm text-gray-600">Item Discount</span>
                                <span class="text-sm font-medium text-red-600">- ৳ {{ itemDiscountTotal.toFixed(2)
                                }}</span>
                            </div>
                            <div class="flex justify-between items-center" v-if="salesInvoice?.discount_amount > 0">
                                <span class="text-sm text-gray-600">Invoice Discount</span>
                                <div class="relative w-32">
                                    <span
                                        class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-medium">৳</span>
                                    <input type="number" v-model="returnData.discount_amount" :disabled="!isEditable"
                                        step="0.01" min="0" :max="salesInvoice?.discount_amount"
                                        class="w-full pl-6 pr-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50 text-sm font-medium text-red-600 appearance-none">
                                </div>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Tax Total ({{ salesInvoice?.vat_percentage || 0
                                }}%)</span>
                                <span class="text-sm font-medium">৳ {{ taxTotal.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span
                                    class="text-sm font-semibold text-gray-900 border-t border-gray-200 pt-2 flex-grow">Return
                                    Grand Total</span>
                                <span class="text-xl font-bold text-blue-600 border-t border-gray-200 pt-0">৳ {{
                                    grandTotal.toFixed(2) }}</span>
                            </div>

                            <div
                                class="flex justify-between items-center mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                                <span class="text-sm font-bold text-blue-700 dark:text-blue-300">Returnable
                                    Amount</span>
                                <div class="relative w-32">
                                    <span
                                        class="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 font-medium">৳</span>
                                    <input type="number" v-model="returnData.returnable_amount" :disabled="!isEditable"
                                        step="0.01" min="0"
                                        class="w-full pl-6 pr-2 py-1 text-right border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-sm font-bold text-blue-600 appearance-none">
                                </div>
                            </div>

                            <div class="pt-4 mt-4 border-t border-gray-100 space-y-2">
                                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Original Invoice
                                    Info</p>
                                <div class="flex justify-between">
                                    <span class="text-xs text-gray-500">Subtotal</span>
                                    <span class="text-xs font-medium text-gray-700">৳ {{
                                        salesInvoice?.subtotal?.toFixed(2) || '0.00' }}</span>
                                </div>
                                <div class="flex justify-between" v-if="salesInvoice?.discount_amount > 0">
                                    <span class="text-xs text-gray-500">Discount ({{ salesInvoice?.discount_percentage
                                    }}%)</span>
                                    <span class="text-xs font-medium text-red-600">- ৳ {{
                                        salesInvoice?.discount_amount?.toFixed(2) || '0.00' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-xs text-gray-500">VAT Amount ({{ salesInvoice?.vat_percentage
                                    }}%)</span>
                                    <span class="text-xs font-medium text-gray-700">৳ {{ (salesInvoice?.grand_total -
                                        salesInvoice?.subtotal + salesInvoice?.discount_amount)?.toFixed(2) || '0.00'
                                    }}</span>
                                </div>
                                <div class="flex justify-between pt-1 border-t border-gray-50">
                                    <span class="text-xs text-gray-500">Paid Amount</span>
                                    <span class="text-xs font-medium text-gray-700">৳ {{
                                        salesInvoice?.paid_amount?.toFixed(2) || '0.00' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-xs text-gray-500">Due Amount</span>
                                    <span class="text-xs font-medium text-red-700">৳ {{
                                        salesInvoice?.due_amount?.toFixed(2) || '0.00' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status & Actions -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>

                        <!-- Status Information -->
                        <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div class="flex justify-between text-sm mb-2">
                                <span class="text-gray-600">Current Status:</span>
                                <span class="font-semibold capitalize" :class="statusTextClass">{{ returnData.status ||
                                    'Draft' }}</span>
                            </div>
                            <div class="flex justify-between text-sm" v-if="returnData.returned_at">
                                <span class="text-gray-600">Completed At:</span>
                                <span class="font-semibold">{{ formatDateTime(returnData.returned_at) }}</span>
                            </div>
                        </div>

                        <!-- Action Buttons based on status -->
                        <div class="space-y-3">
                            <!-- Draft Status Actions -->
                            <template v-if="returnData.status === 'draft'">
                                <button @click="saveAsDraft" :disabled="isSaving"
                                    class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <i class="fas fa-undo"></i>
                                    <span>{{ isSaving ? 'Saving...' : 'Return' }}</span>
                                </button>
                                <!-- <button @click="approveReturn" :disabled="isSaving || returnLines.length === 0"
                                    class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Approve Return</span>
                                </button>
                                <button @click="deleteReturn" :disabled="isSaving"
                                    class="w-full px-4 py-2 border border-red-300 bg-white text-red-600 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50">
                                    <i class="fas fa-trash-alt"></i>
                                    <span>Delete Return</span>
                                </button> -->
                            </template>

                            <!-- Approved Status Actions -->
                            <template v-if="returnData.status === 'approved'">
                                <button @click="completeReturn" :disabled="isSaving"
                                    class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <i class="fas fa-check-double"></i>
                                    <span>Complete Return (Process Stock)</span>
                                </button>
                            </template>

                            <!-- Completed Status - View Only -->
                            <div v-if="returnData.status === 'completed'"
                                class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <i class="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                                <p class="text-sm text-green-600">Return has been completed and stock has been reversed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Return Item Selection Modal -->
            <BaseModal v-if="showAddItemsModal" :show="showAddItemsModal" title="Select Return Items" maxWidth="5xl"
                @close="showAddItemsModal = false">
                <div class="p-4">
                    <div class="flex flex-col md:flex-row gap-3 mb-4">
                        <div class="relative flex-1">
                            <input v-model="itemSearchQuery" type="text"
                                placeholder="Search product, SKU, or barcode..."
                                class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg" />
                            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>
                        <div class="relative flex-1">
                            <input v-model="barcodeInput" @keyup.enter="scanInvoiceItem" type="text"
                                placeholder="Scan item barcode"
                                class="w-full px-3 py-2 pl-10 border border-blue-200 rounded-lg"
                                ref="barcodeInputRef" />
                            <i class="fas fa-qrcode absolute left-3 top-3 text-blue-400"></i>
                        </div>
                        <button @click="addAllAvailableItems" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                            Add All
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                        <div v-for="line in selectableInvoiceLines" :key="line.id"
                            class="border rounded-lg p-3 flex items-center justify-between gap-3">
                            <div class="min-w-0">
                                <p class="font-medium text-sm truncate">{{ line.product_name }}</p>
                                <p class="text-xs text-gray-500">{{ line.sku || line.product_code || '-' }} · {{
                                    formatVariantPackageLabel(line) }}</p>
                                <p class="text-xs" :class="line.is_gift ? 'text-green-600' : 'text-blue-600'">
                                    {{ line.is_gift ? 'Gift item' : 'Sale item' }} · Available: {{
                                        line.returnable_quantity }}
                                </p>
                            </div>
                            <button @click="addReturnLine(line)" class="px-3 py-1.5 rounded-lg text-white text-xs"
                                :class="line.is_gift ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </BaseModal>

            <!-- Delete Confirmation Modal -->
            <BaseModal v-model="showDeleteConfirmModal" title="Delete Return" maxWidth="md">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Sales Return</h3>
                    <p class="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete this return? This action cannot be undone.
                    </p>
                    <div class="flex justify-center gap-3">
                        <button @click="showDeleteConfirmModal = false"
                            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button @click="confirmDelete"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
            </BaseModal>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlatPickr from 'vue-flatpickr-component'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Data
const returnId = ref(route.params.id)
const salesInvoiceId = ref(route.params.invoice_id)
const returnData = ref({
    id: null,
    return_no: '',
    return_date: new Date().toISOString().split('T')[0],
    return_reason: '',
    notes: '',
    status: 'draft',
    sales_invoice_id: null,
    company_id: null,
    discount_amount: 0,
    vat_percentage: 0,
    returnable_amount: 0
})

const salesInvoice = ref(null)
const returnLines = ref([])
const giftReturnLines = ref([])
const isSaving = ref(false)
const serialSearchQuery = ref('')
const isLoading = ref(false)
const showAddItemsModal = ref(false)
const itemSearchQuery = ref('')
const barcodeInput = ref('')
const barcodeInputRef = ref(null)

// Computed
const isEditable = computed(() => {
    return returnData.value.status === 'draft'
})

const subtotal = computed(() => {
    return returnLines.value.reduce((sum, line) => sum + (line.unit_price * line.quantity), 0)
})

const itemDiscountTotal = computed(() => {
    return returnLines.value.reduce((sum, line) => {
        const ratio = line.purchased_quantity > 0 ? (line.quantity / line.purchased_quantity) : 0
        return sum + ((line.discount_amount || 0) * ratio)
    }, 0)
})

const globalDiscountTotal = computed(() => {
    return parseFloat(returnData.value.discount_amount || 0)
})

const discountTotal = computed(() => {
    return itemDiscountTotal.value + globalDiscountTotal.value
})

const taxTotal = computed(() => {
    const vatPercent = salesInvoice.value?.vat_percentage || 0
    return (subtotal.value - discountTotal.value) * (vatPercent / 100)
})

const grandTotal = computed(() => {
    return subtotal.value - discountTotal.value + taxTotal.value
})

// Update returnable_amount when paid_amount changes
watch(salesInvoice, (newValue) => {
    if (isEditable.value && newValue?.paid_amount) {
        // returnData.value.returnable_amount = newValue.paid_amount
        refturnData.value.returnable_amount = 0
    }
}, { immediate: true, deep: true })

const statusBadgeClass = computed(() => {
    switch (returnData.value.status) {
        case 'draft': return 'bg-yellow-100 text-yellow-800'
        case 'approved': return 'bg-blue-100 text-blue-800'
        case 'completed': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
    }
})

const statusTextClass = computed(() => {
    switch (returnData.value.status) {
        case 'draft': return 'text-yellow-600'
        case 'approved': return 'text-blue-600'
        case 'completed': return 'text-green-600'
        default: return 'text-gray-600'
    }
})

const invoiceLines = computed(() => {
    if (!salesInvoice.value?.items) return []
    return salesInvoice.value.items.map(line => ({
        ...line,
        returned_quantity: 0,
        returnable_quantity: line.quantity
    }))
})

const filteredInvoiceLines = computed(() => {
    return invoiceLines.value
})

const hasAvailableItems = computed(() => {
    return invoiceLines.value.some(line => line.returnable_quantity > 0)
})

const selectableInvoiceLines = computed(() => {
    const query = itemSearchQuery.value.trim().toLowerCase()
    return invoiceLines.value.filter(line => {
        if (line.returnable_quantity <= 0) return false
        if (!query) return true
        return [line.product_name, line.sku, line.product_code, line.barcode, line.variant_name, line.package_name]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(query))
    })
})



// Date picker config
const dateConfig = {
    enableTime: false,
    dateFormat: "Y-m-d",
    altFormat: "d-m-Y",
    altInput: true
}

const formatVariantPackageLabel = (line) => {
    const variantName = line.variant_name || line.variant_package?.variant_name || ''
    const packageName = line.package_name || line.variant_package?.package_name || ''
    const piecesPerPackage = line.pieces_per_package || line.variant_package?.pieces_per_package || ''

    const parts = [variantName, packageName]
    if (piecesPerPackage) {
        parts.push(`${piecesPerPackage} pcs`)
    }

    return parts.filter(Boolean).join(' - ') || 'N/A'
}

// Methods
const fetchSalesInvoice = async () => {
    const invoiceId = returnData.value.sales_invoice_id || salesInvoiceId.value

    if (!invoiceId) {
        toast.error('No sales invoice specified')
        return
    }

    isLoading.value = true
    try {
        const response = await axiosClient.get(`/sales-invoices/${invoiceId}`)
        if (response.data?.success && response.data?.data) {
            salesInvoice.value = response.data.data
            returnData.value.sales_invoice_id = salesInvoice.value.id
            returnData.value.company_id = salesInvoice.value.company_id
            returnData.value.discount_amount = salesInvoice.value.discount_amount || 0
            returnData.value.vat_percentage = salesInvoice.value.vat_percentage || 0


            // Drop fully returned items; keep partial/never-returned items with their remaining returnable quantity.
            salesInvoice.value.items = salesInvoice.value.items
                .filter(line => !line.is_fully_returned)
                .map(line => ({
                    ...line,
                    returned_quantity: line.returned_quantity || 0,
                    returnable_quantity: line.is_partially_returned ? line.returnable_quantity : line.quantity
                }))

            const mapInvoiceLine = (line, quantity = line.returnable_quantity ?? line.quantity) => {
                const unitPrice = Number(line.unit_price || 0)
                const discount = Number(line.discount_amount || 0)
                const tax = Number(line.tax_amount || 0)
                const total = Number(line.total ?? ((unitPrice * quantity) - discount + tax))

                return {
                    product_id: line.product_id,
                    variant_package_id: line.variant_package_id,
                    package_name: line.package_name || '',
                    pieces_per_package: line.pieces_per_package || null,
                    variant_name: line.variant_name || '',
                    product_name: line.product_name,
                    sku: line.sku || line.product_code || `PRD-${line.product_id}`,
                    sales_invoice_item_id: line.id,
                    quantity,
                    unit_price: unitPrice,
                    discount_amount: discount,
                    tax_amount: tax,
                    description: line.description || '',
                    line_total: total,
                    max_returnable_qty: line.returnable_quantity ?? line.quantity,
                    purchased_quantity: line.quantity,
                    is_serialized: line.serial_no?.length > 0 || false,
                    available_serials: (line.serial_no || []).map(sn => ({ serial_no: sn })),
                    serial_numbers: [],
                    image_url: line.unit_prices?.[0]?.image_url || line.product_image || null,
                    unit_name: line.unit_name,
                    unit_id: line.unit_id,
                    is_gift: Boolean(line.is_gift)
                }
            }

            returnLines.value = salesInvoice.value.items
                .filter(line => !line.is_gift)
                .map(line => mapInvoiceLine(line))
            giftReturnLines.value = salesInvoice.value.items
                .filter(line => line.is_gift)
                .map(line => mapInvoiceLine(line))
        }
    } catch (error) {
        console.error('Error fetching sales invoice:', error)
        toast.error('Failed to load sales invoice details')
    } finally {
        isLoading.value = false
    }
}

const fetchReturnData = async () => {
    if (!returnId.value) return

    isLoading.value = true
    try {
        const response = await axiosClient.get(`/sales-returns/${returnId.value}`)
        if (response.data) {
            returnData.value = response.data
            const loadedLines = response.data.lines || []
            returnLines.value = loadedLines.filter(line => !line.is_gift)
            giftReturnLines.value = loadedLines.filter(line => line.is_gift)
            salesInvoice.value = response.data.sales_invoice

            // Update available quantities based on existing return lines
            updateAvailableQuantities()
        }
    } catch (error) {
        console.error('Error fetching return:', error)
        toast.error('Failed to load return data')
    } finally {
        isLoading.value = false
    }
}

const updateAvailableQuantities = () => {
    if (!salesInvoice.value?.items) return

    salesInvoice.value.items.forEach(invLine => {
        const returnedQty = [...returnLines.value, ...giftReturnLines.value]
            .filter(rl => rl.sales_invoice_item_id === invLine.id)
            .reduce((sum, rl) => sum + rl.quantity, 0)
        invLine.returned_quantity = returnedQty
        invLine.returnable_quantity = invLine.quantity - returnedQty
    })
}

const addReturnLine = (invoiceLine) => {
    if (invoiceLine.returnable_quantity <= 0) {
        toast.warning('No quantity available for return')
        return
    }

    // Check if line already exists
    const targetLines = invoiceLine.is_gift ? giftReturnLines.value : returnLines.value
    const existingLine = targetLines.find(l => l.sales_invoice_item_id === invoiceLine.id)

    if (existingLine) {
        toast.info('This item is already in the return list')
        return
    }

    const newLine = {
        product_id: invoiceLine.product_id,
        variant_package_id: invoiceLine.variant_package_id,
        package_name: invoiceLine.package_name || '',
        pieces_per_package: invoiceLine.pieces_per_package || null,
        variant_name: invoiceLine.variant_name || '',
        product_name: invoiceLine.product_name,
        sku: invoiceLine.sku || invoiceLine.product_code || `PRD-${invoiceLine.product_id}`,
        sales_invoice_item_id: invoiceLine.id,
        quantity: Math.min(1, invoiceLine.returnable_quantity),
        unit_price: invoiceLine.unit_price,
        discount_amount: 0,
        tax_amount: invoiceLine.tax_amount || 0,
        description: invoiceLine.description || '',
        line_total: invoiceLine.unit_price,
        max_returnable_qty: invoiceLine.returnable_quantity,
        purchased_quantity: invoiceLine.quantity,
        is_serialized: invoiceLine.serial_no?.length > 0 || false,
        available_serials: (invoiceLine.serial_no || []).map(sn => ({ serial_no: sn })),
        serial_numbers: [],
        product_image: invoiceLine.product_image || null,
        image_url: invoiceLine.image_url || invoiceLine.product_image || null,
        is_gift: Boolean(invoiceLine.is_gift)
    }

    targetLines.push(newLine)
    updateAvailableQuantities()
    toast.success(`${invoiceLine.product_name} added to return`)
}

const addAllAvailableItems = () => {
    const availableLines = invoiceLines.value.filter(line => line.returnable_quantity > 0)

    availableLines.forEach(line => {
        const targetLines = line.is_gift ? giftReturnLines.value : returnLines.value
        const existingLine = targetLines.find(l => l.sales_invoice_item_id === line.id)
        if (!existingLine) {
            addReturnLine(line)
        }
    })

    showAddItemsModal.value = false
    toast.success(`Added ${availableLines.length} item(s) to return`)
}

const openAddItemsModal = () => {
    itemSearchQuery.value = ''
    barcodeInput.value = ''
    showAddItemsModal.value = true
}

const scanInvoiceItem = async () => {
    const code = barcodeInput.value.trim().toLowerCase()
    if (!code) return

    let line = invoiceLines.value.find(item =>
        [item.barcode, item.sku, item.product_code, item.serial_number, item.packaging_code]
            .filter(Boolean)
            .some(value => String(value).toLowerCase() === code)
    )

    if (!line) {
        try {
            const response = await axiosClient.get(
                `/packagings/scan/${encodeURIComponent(barcodeInput.value.trim())}?from_location_id=${salesInvoice.value?.warehouse_id || ''}`
            )
            const scannedProduct = response.data?.data
            line = invoiceLines.value.find(item =>
                Number(item.product_id) === Number(scannedProduct?.product_id || scannedProduct?.id) &&
                (!scannedProduct?.variant_package_id ||
                    Number(item.variant_package_id) === Number(scannedProduct.variant_package_id))
            )
        } catch (error) {
            line = null
        }
    }

    if (!line) {
        toast.error('Scanned item was not found in this invoice')
    } else {
        addReturnLine(line)
    }
    barcodeInput.value = ''
    barcodeInputRef.value?.focus()
}

const removeReturnLine = (index) => {
    const line = returnLines.value[index]
    returnLines.value.splice(index, 1)
    updateAvailableQuantities()
    toast.success(`${line.product_name} removed from return`)
}

const handleGiftQtyInput = (event, index) => {
    const line = giftReturnLines.value[index]
    let value = parseInt(String(event.target.value).replace(/[^0-9]/g, ''), 10) || 0
    if (value > line.max_returnable_qty) value = line.max_returnable_qty
    line.quantity = value
    event.target.value = value
}

const removeGiftItem = (index) => {
    const removedItem = giftReturnLines.value[index]
    giftReturnLines.value.splice(index, 1)
    updateAvailableQuantities()
    toast.success(`${removedItem.product_name} removed from return`)
}

const updateLineTotal = (line) => {
    // Calculate ratio if we need to adjust discount/tax based on quantity
    const ratio = line.purchased_quantity > 0 ? (line.quantity / line.purchased_quantity) : 0
    const currentDiscount = (line.discount_amount || 0) * ratio
    const currentTax = (line.tax_amount || 0) * ratio

    line.line_total = (line.unit_price * line.quantity) - currentDiscount + currentTax
}

const validateQuantity = (line, maxQty) => {
    if (line.quantity > maxQty) {
        line.quantity = maxQty
        toast.warning(`Maximum return quantity is ${maxQty}`)
    }
    if (line.quantity < 0) {
        line.quantity = 0
    }
    updateLineTotal(line)
}


// Cart operations
const increaseQty = (index) => {
    const line = returnLines.value[index]
    if (line.quantity < line.max_returnable_qty) {
        line.quantity++
        updateLineTotal(line)
    }
}

const decreaseQty = (index) => {
    const line = returnLines.value[index]
    if (line.quantity > 0) {
        line.quantity--
        updateLineTotal(line)
    }
}

const removeItem = (index) => {
    const removedItem = returnLines.value[index]
    returnLines.value.splice(index, 1)
    updateAvailableQuantities()
}

const handleQtyInput = (event, index) => {
    let value = event.target.value
    const line = returnLines.value[index]

    // শুধু integer allow
    value = value.replace(/[^0-9]/g, '')

    // empty হলে
    if (value === '') {
        value = 0
    }

    value = parseInt(value)

    // min/max validation   
    if (value < 0) value = 0
    if (value > line.max_returnable_qty) {
        value = line.max_returnable_qty
        toast.warning(`Maximum return quantity is ${line.max_returnable_qty}`)
    }

    line.quantity = value
    event.target.value = value
    updateLineTotal(line)
}

const saveAsDraft = async () => {
    if (!validateReturnData()) return

    isSaving.value = true
    try {
        const payload = buildPayload()

        let response
        if (returnId.value) {
            response = await axiosClient.put(`/sales-returns/${returnId.value}`, payload)
        } else {
            response = await axiosClient.post('/sales-returns', payload)
        }

        if (response.data) {
            toast.success(response.data.message || 'Return saved successfully')
            //redirect to list
            router.push('/return/sales')
            // if (!returnId.value && response.data.id) {
            //     router.push(`/sales-returns/${response.data.id}/edit`)
            // } else {
            //     await fetchReturnData()
            // }
        }
    } catch (error) {
        console.error('Error saving return:', error)
        toast.error(error.response?.data?.message || 'Failed to save return')
    } finally {
        isSaving.value = false
    }
}

const approveReturn = async () => {
    if (!returnId.value) {
        toast.warning('Please save the return first')
        return
    }

    isSaving.value = true
    try {
        const response = await axiosClient.post(`/sales-returns/${returnId.value}/approve`)
        if (response.data) {
            toast.success('Return approved successfully')
            await fetchReturnData()
        }
    } catch (error) {
        console.error('Error approving return:', error)
        toast.error(error.response?.data?.message || 'Failed to approve return')
    } finally {
        isSaving.value = false
    }
}

const completeReturn = async () => {
    if (!returnId.value) return

    isSaving.value = true
    try {
        const response = await axiosClient.post(`/sales-returns/${returnId.value}/complete`)
        if (response.data) {
            toast.success('Return completed successfully. Stock has been reversed.')
            await fetchReturnData()
        }
    } catch (error) {
        console.error('Error completing return:', error)
        toast.error(error.response?.data?.message || 'Failed to complete return')
    } finally {
        isSaving.value = false
    }
}

const deleteReturn = () => {
    showDeleteConfirmModal.value = true
}

const confirmDelete = async () => {
    if (!returnId.value) return

    isSaving.value = true
    try {
        await axiosClient.delete(`/sales-returns/${returnId.value}`)
        toast.success('Return deleted successfully')
        router.push('/return/sales')
    } catch (error) {
        console.error('Error deleting return:', error)
        toast.error(error.response?.data?.message || 'Failed to delete return')
    } finally {
        isSaving.value = false
        showDeleteConfirmModal.value = false
    }
}

const validateReturnData = () => {
    if (!returnData.value.return_reason) {
        toast.warning('Please select a return reason')
        return false
    }

    const allReturnLines = [...returnLines.value, ...giftReturnLines.value]

    if (allReturnLines.length === 0) {
        toast.warning('Please add at least one item to return')
        return false
    }

    for (const line of allReturnLines) {
        if (line.quantity < 0) {
            toast.warning(`Invalid quantity for ${line.product_name}`)
            return false
        }
    }
    const zeroOrEmptyQtyItems = allReturnLines.filter(item => !item.quantity || parseInt(item.quantity) <= 0)
    if (zeroOrEmptyQtyItems.length > 0) {
        toast.warning('Quantity 0 is not allowed. Please enter a valid quantity.')
        return
    }

    return true
}

const buildPayload = () => {
    const allReturnLines = [...returnLines.value, ...giftReturnLines.value]
    const payload = {
        sales_invoice_id: returnData.value.sales_invoice_id || salesInvoiceId.value,
        return_date: returnData.value.return_date,
        return_reason: returnData.value.return_reason,
        notes: returnData.value.notes,
        company_id: returnData.value.company_id,
        discount_amount: returnData.value.discount_amount,
        vat_percentage: returnData.value.vat_percentage,
        returnable_amount: returnData.value.returnable_amount,
        items: allReturnLines
            .filter(line => line.quantity > 0)
            .map(line => ({
                product_id: line.product_id,
                sales_invoice_item_id: line.sales_invoice_item_id,
                variant_package_id: line.variant_package_id,
                quantity: line.quantity,
                unit_price: line.unit_price,
                description: line.description,
                discount_amount: line.discount_amount,
                tax_amount: line.tax_amount,
                ...(line.is_serialized && line.serial_numbers?.length ? { serial_numbers: line.serial_numbers } : {})
            }))
    }

    return payload
}



// Formatting helpers
const formatNumber = (value) => {
    if (!value && value !== 0) return '0.00'
    return parseFloat(value).toFixed(2)
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(async () => {
    if (returnId.value) {
        await fetchReturnData()
    } if (salesInvoiceId.value) {
        await fetchSalesInvoice()
    } else {
        toast.error('No sales invoice specified')
        router.push('/return/sales')
    }
})
</script>

<style scoped>
input:disabled,
select:disabled,
textarea:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.modal-container {
    max-height: 90vh;
    overflow-y: auto;
}
</style>