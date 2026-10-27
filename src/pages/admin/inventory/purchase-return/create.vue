<template>
    <div>
        <!-- TOP SECTION -->
        <div class="flex justify-between items-center rounded bg-gray-50 dark:bg-gray-800 px-1">
            <div class="flex items-center gap-4">
                <router-link to="/purchase-returns" class="flex items-center border border-gray-200 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-300 
                    hover:text-gray-900 dark:hover:text-gray-300 transition-colors text-sm">
                    <i class="fas fa-arrow-left"></i>
                    <span class="hidden sm:inline">Back to Returns</span>
                </router-link>
                <h6 class="text-sm text-gray-800 dark:text-white">Purchase Order Return</h6>
                <span v-if="returnData.id" class="text-xs px-2 py-1 rounded-full" :class="statusBadgeClass">
                    {{ returnData.status || 'draft' }}
                </span>
            </div>
            <Breadcrumb />
        </div>

        <!-- LOADING -->
        <div v-if="isLoading" class="flex items-center justify-center py-20 text-gray-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-3"></i>
            <span>Loading purchase order...</span>
        </div>

        <!-- MAIN RETURN SECTION -->
        <div v-else class="bg-gray-50 dark:bg-gray-800 overflow-hidden font-sans flex flex-col">
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
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-exclamation-circle"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Original PO Info (Read-only) -->
                        <div class="w-full" v-if="purchaseOrder">
                            <div
                                class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div class="flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Supplier</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            {{ purchaseOrder.supplier?.name || 'N/A' }}
                                            <span v-if="purchaseOrder.supplier?.company_name"
                                                class="text-xs font-normal text-gray-500">
                                                ({{ purchaseOrder.supplier.company_name }})
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Warehouse</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            {{ purchaseOrder.warehouse?.name || 'N/A' }}
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Order No.</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            {{ purchaseOrder.order_no }}
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Order Date</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            {{ purchaseOrder.order_date }}
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            ৳ {{ formatNumber(purchaseOrder.total_amount) }}
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                                        <p class="font-semibold text-gray-900 dark:text-white capitalize">
                                            {{ purchaseOrder.status }}
                                        </p>
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
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Return Items ({{
                            returnLines.length }})</h3>
                        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Return Amount: ৳ {{
                            grandTotal.toFixed(2) }}</span>
                    </div>

                    <!-- Return Items Table -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit
                                        Cost</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty to
                                        Return</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Max
                                        Qty</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Discount</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Description</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Serial
                                        Numbers</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                <template v-for="(line, index) in returnLines" :key="line.cart_id || index">
                                    <!-- Main Row -->
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors align-top">
                                        <!-- Item Info -->
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                                                    <img v-if="line.image_url" :src="line.image_url"
                                                        :alt="line.item_name" class="h-full w-full object-cover" />
                                                    <i v-else
                                                        :class="line.is_raw_material ? 'fas fa-flask text-green-600' : 'fas fa-box text-blue-600'"></i>
                                                </div>
                                                <div>
                                                    <p class="font-medium text-gray-900 dark:text-white">
                                                        {{ line.item_name }}
                                                    </p>
                                                    <p v-if="line.variant || line.variant_package"
                                                        class="text-xs text-gray-500">
                                                        <span v-if="line.variant">{{ line.variant.name }}</span>
                                                        <span v-if="line.variant_package">
                                                            - {{ line.variant_package.package_type ||
                                                                line.variant_package.package_type_name }}
                                                            <span v-if="line.variant_package.pieces_per_package">
                                                                ({{ line.variant_package.pieces_per_package }} pcs)
                                                            </span>
                                                        </span>
                                                    </p>
                                                    <p v-else-if="line.measurement_unit" class="text-xs text-gray-500">
                                                        {{ line.measurement_unit.name }} ({{
                                                            line.measurement_unit.symbol
                                                        }})
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <!-- Type -->
                                        <td class="px-4 py-3 text-center">
                                            <span
                                                class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium"
                                                :class="line.is_raw_material
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                                                {{ line.is_raw_material ? 'Raw Material' : 'Product' }}
                                            </span>
                                        </td>

                                        <!-- Unit Cost -->
                                        <td class="px-4 py-3 text-center">
                                            <div class="relative inline-block">
                                                <input type="number" v-model="line.unit_price" readonly
                                                    class="w-28 px-2 py-1 cursor-not-allowed text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50">
                                            </div>
                                        </td>

                                        <!-- Quantity -->
                                        <td class="px-4 py-3 text-center">
                                            <div class="flex items-center justify-center gap-2">
                                                <button @click="decreaseQty(line)" :disabled="!isEditable"
                                                    class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                                                    <i class="fas fa-minus text-xs"></i>
                                                </button>
                                                <input type="number" v-model="line.qty_returned" :disabled="!isEditable"
                                                    @input="validateQuantity(line)"
                                                    class="w-16 text-center px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50"
                                                    min="0" :max="line.max_returnable_qty">
                                                <button @click="increaseQty(line)" :disabled="!isEditable"
                                                    class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                                                    <i class="fas fa-plus text-xs"></i>
                                                </button>
                                            </div>
                                        </td>

                                        <!-- Max Quantity -->
                                        <td class="px-4 py-3 text-center text-sm text-gray-500">
                                            {{ line.max_returnable_qty }}
                                        </td>

                                        <!-- Discount -->
                                        <td class="px-4 py-3 text-center">
                                            <input type="number" v-model="line.discount_amount" :disabled="!isEditable"
                                                @input="updateLineTotal(line)" step="0.01" min="0"
                                                class="w-24 px-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50">
                                        </td>

                                        <!-- Total -->
                                        <td class="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                                            ৳ {{ line.line_total.toFixed(2) }}
                                        </td>

                                        <!-- Description (button -> modal) -->
                                        <td class="px-4 py-3 text-center">
                                            <button @click="openDescriptionModal(line)" :disabled="!isEditable"
                                                class="inline-flex items-center gap-1 px-1 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-w-[180px]">
                                                <i class="fas fa-align-left text-gray-500 flex-shrink-0"></i>
                                                <span v-if="line.description"
                                                    class="text-blue-600 dark:text-blue-400 w-[20px] font-medium truncate text-ellipsis"
                                                    :title="line.description">
                                                    {{ line.description }}
                                                </span>
                                                <span v-else class="text-gray-400">Add</span>
                                            </button>
                                        </td>

                                        <!-- Serial Numbers (button -> modal) -->
                                        <td class="px-4 py-3 text-center">
                                            <button @click="openSerialModal(line)" :disabled="!isEditable"
                                                class="inline-flex items-center gap-1 px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                <i class="fas fa-barcode text-gray-500"></i>
                                                <span v-if="line.serial_numbers && line.serial_numbers.length > 0"
                                                    class="text-blue-600 dark:text-blue-400 font-medium">
                                                    {{ line.serial_numbers.length }} Serial{{ line.serial_numbers.length
                                                    > 1 ? 's' : '' }}
                                                </span>
                                                <span v-else class="text-gray-400">Add</span>
                                            </button>
                                        </td>

                                        <!-- Action -->
                                        <td class="px-4 py-3 text-center">
                                            <button @click="removeReturnLine(index)" :disabled="!isEditable"
                                                class="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>

                                    <!-- Serial Numbers Preview Row (comma-separated, shown under main row) -->
                                    <tr v-if="line.serial_numbers && line.serial_numbers.length > 0"
                                        class="bg-blue-50/40 dark:bg-blue-900/10">
                                        <td colspan="10" class="px-4 py-2">
                                            <div class="flex items-start gap-2">
                                                <i class="fas fa-barcode text-blue-500 text-xs mt-1 flex-shrink-0"></i>
                                                <div class="text-xs text-gray-700 dark:text-gray-300">
                                                    <span
                                                        class="font-medium text-gray-600 dark:text-gray-400">Serials:</span>
                                                    <span class="ml-1 font-mono text-blue-700 dark:text-blue-300">
                                                        {{ line.serial_numbers.join(', ') }}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>

                                <!-- Empty State -->
                                <tr v-if="returnLines.length === 0">
                                    <td colspan="10" class="px-4 py-12 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <i class="fas fa-box-open text-4xl text-gray-300 dark:text-gray-600"></i>
                                            <p class="text-gray-500 dark:text-gray-400">No items selected for return
                                            </p>
                                            <p class="text-xs text-gray-400">Click "Add Items" or "Add Raw Materials"
                                                below to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Add Items Buttons -->
                    <div class="mt-4 flex flex-wrap gap-3" v-if="isEditable">
                        <button @click="openAddItemsModal"
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                            <i class="fas fa-plus-circle"></i>
                            Add Items
                        </button>
                        <button @click="openRawMaterialsModal"
                            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                            <i class="fas fa-flask"></i>
                            Add Raw Materials
                        </button>
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
                                <span class="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span class="text-sm font-medium dark:text-white">৳ {{ subtotal.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Discount Total</span>
                                <span class="text-sm font-medium text-red-600">- ৳ {{ discountTotal.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Tax Total</span>
                                <span class="text-sm font-medium dark:text-white">৳ {{ taxTotal.toFixed(2) }}</span>
                            </div>
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                                <div class="flex justify-between">
                                    <span class="font-semibold text-gray-900 dark:text-white">Grand Total</span>
                                    <span class="text-xl font-bold text-blue-600 dark:text-blue-400">৳ {{
                                        grandTotal.toFixed(2) }}</span>
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
                                <span class="text-gray-600 dark:text-gray-400">Current Status:</span>
                                <span class="font-semibold capitalize" :class="statusTextClass">
                                    {{ returnData.status || 'Draft' }}
                                </span>
                            </div>
                            <div class="flex justify-between text-sm" v-if="returnData.returned_at">
                                <span class="text-gray-600 dark:text-gray-400">Completed At:</span>
                                <span class="font-semibold dark:text-white">{{
                                    formatDateTime(returnData.returned_at) }}</span>
                            </div>
                        </div>

                        <!-- Action Buttons based on status -->
                        <div class="space-y-3">
                            <template v-if="returnData.status === 'draft' || !returnData.status">
                                <button @click="saveAsDraft" :disabled="isSaving || returnLines.length === 0"
                                    class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <i class="fas fa-save"></i>
                                    <span>{{ isSaving ? 'Processing...' : 'Return' }}</span>
                                </button>
                            </template>

                            <template v-if="returnData.status === 'approved'">
                                <button @click="completeReturn" :disabled="isSaving"
                                    class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    <i class="fas fa-check-double"></i>
                                    <span>Complete Return (Process Stock)</span>
                                </button>
                            </template>

                            <div v-if="returnData.status === 'completed'"
                                class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <i class="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                                <p class="text-sm text-green-600 dark:text-green-400">Return has been completed and
                                    stock has been reversed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== Add PO Items Modal (Products) ==================== -->
        <BaseModal v-model="showAddItemsModal" title="Select Order Items to Return" maxWidth="4xl"
            @close="closeAddItemsModal">
            <div class="flex flex-col h-full">
                <div class="flex-shrink-0 mb-4">
                    <div class="relative">
                        <input type="text" v-model="itemSearchQuery" placeholder="Search items..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                </div>

                <div class="flex-grow overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ordered
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Received
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">In Return
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit
                                    Price</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            <tr v-for="line in filteredProductLines" :key="line.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-3">
                                    <p class="font-medium text-gray-900 dark:text-white">{{ line.item_name }}</p>
                                    <p v-if="line.variant || line.variant_package" class="text-xs text-gray-500">
                                        <span v-if="line.variant">{{ line.variant.name }}</span>
                                        <span v-if="line.variant_package">
                                            - {{ line.variant_package.package_type || line.variant_package.name }}
                                            <span v-if="line.variant_package.pieces_per_package">
                                                ({{ line.variant_package.pieces_per_package }} pcs)
                                            </span>
                                        </span>
                                    </p>
                                </td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">{{ line.qty_ordered }}</td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">{{ line.qty_received }}</td>
                                <td class="px-4 py-3 text-center text-sm text-red-600">
                                    {{ getAlreadyReturned(line.id) }}
                                </td>
                                <td class="px-4 py-3 text-center text-sm font-semibold"
                                    :class="getReturnableQty(line) > 0 ? 'text-green-600' : 'text-gray-400'">
                                    {{ getReturnableQty(line) }}
                                </td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">
                                    ৳ {{ formatNumber(line.unit_price) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button @click="addReturnLine(line)"
                                        :disabled="getReturnableQty(line) <= 0 || isLineInReturn(line.id)"
                                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <i class="fas fa-plus mr-1"></i>
                                        {{ isLineInReturn(line.id) ? 'Added' : 'Add' }}
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredProductLines.length === 0">
                                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                                    <i class="fas fa-search text-2xl mb-2 opacity-50"></i>
                                    <p>No product items available to return</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button @click="showAddItemsModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                        Close
                    </button>
                    <button @click="addAllAvailableProducts" v-if="hasAvailableProducts"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-layer-group mr-2"></i>
                        Add All Available Products
                    </button>
                </div>
            </div>
        </BaseModal>

        <!-- ==================== Add Raw Materials Modal ==================== -->
        <BaseModal v-model="showRawMaterialsModal" title="Select Raw Materials to Return" maxWidth="4xl"
            @close="closeRawMaterialsModal">
            <div class="flex flex-col h-full">
                <div class="flex-shrink-0 mb-4">
                    <div class="relative">
                        <input type="text" v-model="rawMaterialSearchQuery" placeholder="Search raw materials..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                </div>

                <div class="flex-grow overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ordered
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Received
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">In Return
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit
                                    Price</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            <tr v-for="line in filteredRawMaterialLines" :key="line.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <i class="fas fa-flask text-green-600 dark:text-green-400"></i>
                                        </div>
                                        <p class="font-medium text-gray-900 dark:text-white">{{ line.item_name }}</p>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">
                                    <span v-if="line.measurement_unit">
                                        {{ line.measurement_unit.symbol }}
                                    </span>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">{{ line.qty_ordered }}</td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">{{ line.qty_received }}</td>
                                <td class="px-4 py-3 text-center text-sm text-red-600">
                                    {{ getAlreadyReturned(line.id) }}
                                </td>
                                <td class="px-4 py-3 text-center text-sm font-semibold"
                                    :class="getReturnableQty(line) > 0 ? 'text-green-600' : 'text-gray-400'">
                                    {{ getReturnableQty(line) }}
                                </td>
                                <td class="px-4 py-3 text-center text-sm dark:text-white">
                                    ৳ {{ formatNumber(line.unit_price) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button @click="addReturnLine(line)"
                                        :disabled="getReturnableQty(line) <= 0 || isLineInReturn(line.id)"
                                        class="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <i class="fas fa-plus mr-1"></i>
                                        {{ isLineInReturn(line.id) ? 'Added' : 'Add' }}
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredRawMaterialLines.length === 0">
                                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                                    <i class="fas fa-flask text-2xl mb-2 opacity-50"></i>
                                    <p>No raw materials available to return</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button @click="showRawMaterialsModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                        Close
                    </button>
                    <button @click="addAllAvailableRawMaterials" v-if="hasAvailableRawMaterials"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-layer-group mr-2"></i>
                        Add All Available Raw Materials
                    </button>
                </div>
            </div>
        </BaseModal>

        <!-- ==================== Description Modal ==================== -->
        <BaseModal v-model="showDescriptionModal" title="Line Description" maxWidth="lg" @close="closeDescriptionModal">
            <div class="flex flex-col">
                <div class="mb-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Description for
                        <span class="font-semibold text-gray-900 dark:text-white">{{ descriptionModalLine?.item_name
                            }}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        Optional — add any notes / details about this line. Changes are saved automatically when you
                        close.
                    </p>
                </div>

                <textarea v-model="descriptionModalText" rows="4" placeholder="Enter line description..."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white"></textarea>

                <div class="text-right text-xs text-gray-400 mt-1">
                    {{ descriptionModalText.length }} / 500
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <button @click="closeDescriptionModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                        Cancel
                    </button>
                    <button @click="saveDescription"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <i class="fas fa-check"></i>
                        Save Description
                    </button>
                </div>
            </template>
        </BaseModal>

        <!-- ==================== Serial Numbers Modal ==================== -->
        <BaseModal v-model="showSerialModal" title="Serial Numbers" maxWidth="lg" @close="closeSerialModal">
            <div class="flex flex-col">
                <div class="mb-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Add serial numbers for
                        <span class="font-semibold text-gray-900 dark:text-white">{{ serialModalLine?.item_name
                            }}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        You can add up to <span class="font-medium">{{ serialModalLine?.qty_returned || 0 }}</span>
                        serial number(s). Changes are saved automatically when you close.
                    </p>
                </div>

                <!-- Serial Inputs -->
                <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                    <div v-for="(serial, sIndex) in serialModalSerials" :key="sIndex" class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 w-6 text-right">{{ sIndex + 1 }}.</span>
                        <input type="text" v-model="serialModalSerials[sIndex]" placeholder="Enter serial number..."
                            class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        <button @click="removeSerialInput(sIndex)"
                            class="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Empty State -->
                    <div v-if="serialModalSerials.length === 0"
                        class="text-center py-6 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                        <i class="fas fa-barcode text-2xl mb-2 opacity-50"></i>
                        <p class="text-sm">No serial numbers added yet</p>
                    </div>
                </div>

                <!-- Add Serial Button -->
                <button @click="addSerialInput"
                    class="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-plus"></i>
                    Add Serial Number
                </button>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <button @click="closeSerialModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                        Cancel
                    </button>
                    <button @click="saveSerialNumbers"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <i class="fas fa-check"></i>
                        Save Serials
                    </button>
                </div>
            </template>
        </BaseModal>

        <!-- Delete Confirmation Modal -->
        <BaseModal v-model="showDeleteConfirmModal" title="Delete Return" maxWidth="md">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Purchase Return</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this return? This action cannot be undone.
                </p>
                <div class="flex justify-center gap-3">
                    <button @click="showDeleteConfirmModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                        Cancel
                    </button>
                    <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </BaseModal>
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

const orderId = ref(route.params.order_id || route.params.invoice_id || route.params.id)
const returnId = ref(route.params.return_id || null)

const returnData = ref({
    id: null,
    return_no: '',
    return_date: new Date().toISOString().split('T')[0],
    return_reason: '',
    notes: '',
    status: 'draft',
    purchase_order_id: null,
    company_id: null,
})

const purchaseOrder = ref(null)
const returnLines = ref([])

const isSaving = ref(false)
const isLoading = ref(false)
const showAddItemsModal = ref(false)
const showRawMaterialsModal = ref(false)
const showDeleteConfirmModal = ref(false)

// Description modal state
const showDescriptionModal = ref(false)
const descriptionModalLine = ref(null)
const descriptionModalText = ref('')

// Serial numbers modal state
const showSerialModal = ref(false)
const serialModalLine = ref(null)
const serialModalSerials = ref([])

const itemSearchQuery = ref('')
const rawMaterialSearchQuery = ref('')

let cartIdCounter = 0

const dateConfig = {
    enableTime: false,
    dateFormat: 'Y-m-d',
    altFormat: 'd-m-Y',
    altInput: true,
}

// ==================== Computed ====================

const isEditable = computed(() => {
    return !returnData.value.status || returnData.value.status === 'draft'
})

const subtotal = computed(() => {
    return returnLines.value.reduce((sum, line) => sum + (Number(line.unit_price) * Number(line.qty_returned)), 0)
})

const discountTotal = computed(() => {
    return returnLines.value.reduce((sum, line) => sum + (Number(line.discount_amount) || 0), 0)
})

const taxTotal = computed(() => {
    return returnLines.value.reduce((sum, line) => sum + (Number(line.tax_amount) || 0), 0)
})

const grandTotal = computed(() => subtotal.value - discountTotal.value + taxTotal.value)

const statusBadgeClass = computed(() => {
    switch (returnData.value.status) {
        case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
})

const statusTextClass = computed(() => {
    switch (returnData.value.status) {
        case 'draft': return 'text-yellow-600 dark:text-yellow-400'
        case 'approved': return 'text-blue-600 dark:text-blue-400'
        case 'completed': return 'text-green-600 dark:text-green-400'
        default: return 'text-gray-600 dark:text-gray-400'
    }
})

const productLines = computed(() => {
    if (!purchaseOrder.value?.lines) return []
    return purchaseOrder.value.lines.filter(line => !line.is_raw_material && line.is_product !== false)
})

const rawMaterialLines = computed(() => {
    if (!purchaseOrder.value?.lines) return []
    return purchaseOrder.value.lines.filter(line => line.is_raw_material === true)
})

const filteredProductLines = computed(() => {
    if (!itemSearchQuery.value) return productLines.value
    const q = itemSearchQuery.value.toLowerCase()
    return productLines.value.filter(line =>
        line.item_name?.toLowerCase().includes(q) ||
        line.item_id?.toString().includes(q)
    )
})

const filteredRawMaterialLines = computed(() => {
    if (!rawMaterialSearchQuery.value) return rawMaterialLines.value
    const q = rawMaterialSearchQuery.value.toLowerCase()
    return rawMaterialLines.value.filter(line =>
        line.item_name?.toLowerCase().includes(q) ||
        line.item_id?.toString().includes(q)
    )
})

const hasAvailableProducts = computed(() => {
    return productLines.value.some(line => getReturnableQty(line) > 0)
})

const hasAvailableRawMaterials = computed(() => {
    return rawMaterialLines.value.some(line => getReturnableQty(line) > 0)
})

// ==================== Helpers ====================

const getAlreadyReturned = (poLineId) => {
    return returnLines.value
        .filter(rl => rl.purchase_order_line_id === poLineId)
        .reduce((sum, rl) => sum + Number(rl.qty_returned || 0), 0)
}

const getReturnableQty = (poLine) => {
    const already = getAlreadyReturned(poLine.id)
    const received = Number(poLine.qty_received || 0)
    const ordered = Number(poLine.qty_ordered || 0)
    const base = received > 0 ? received : ordered
    return Math.max(0, base - already)
}

const isLineInReturn = (poLineId) => {
    return returnLines.value.some(rl => rl.purchase_order_line_id === poLineId)
}

const buildReturnLineFromPoLine = (poLine, qty) => {
    cartIdCounter++
    const newLine = {
        cart_id: cartIdCounter,
        purchase_order_line_id: poLine.id,
        item_id: poLine.item_id,
        item_name: poLine.item_name,
        item_type: poLine.item_type,
        is_raw_material: !!poLine.is_raw_material,
        variant: poLine.variant,
        variant_package: poLine.variant_package,
        measurement_unit: poLine.measurement_unit,
        qty_ordered: Number(poLine.qty_ordered || 0),
        qty_returned: qty,
        unit_price: Number(poLine.unit_price || 0),
        discount_amount: 0,
        tax_amount: 0,
        line_total: 0,
        max_returnable_qty: getReturnableQty(poLine),
        image_url: poLine.image_url || null,
        description: '',
        serial_numbers: [],
    }
    updateLineTotal(newLine)
    return newLine
}

const preloadAllReturnLines = () => {
    if (!purchaseOrder.value?.lines) return

    returnLines.value = []
    cartIdCounter = 0

    const allLines = [...productLines.value, ...rawMaterialLines.value]

    for (const poLine of allLines) {
        const qtyReceived = Number(poLine.qty_received ?? 0)
        if (qtyReceived <= 0) continue

        const available = getReturnableQty(poLine)
        if (available <= 0) continue

        returnLines.value.push(buildReturnLineFromPoLine(poLine, available))
    }
}

// ==================== Fetch Data ====================

const fetchPurchaseOrder = async () => {
    if (!orderId.value) {
        toast.error('No purchase order specified')
        router.push('/purchase-returns')
        return
    }

    isLoading.value = true
    try {
        const response = await axiosClient.get(`/purchase-orders/${orderId.value}`)
        if (response.data?.success && response.data?.data) {
            purchaseOrder.value = response.data.data
            returnData.value.purchase_order_id = purchaseOrder.value.id
            returnData.value.company_id = purchaseOrder.value.company_id || null

            if (!returnData.value.return_date) {
                returnData.value.return_date = new Date().toISOString().split('T')[0]
            }

            preloadAllReturnLines()

            if (returnLines.value.length > 0) {
                toast.success(`Available ${returnLines.value.length} item(s) from PO ${purchaseOrder.value.order_no}`)
            } else {
                toast.info('No returnable items found in this purchase order')
            }
        } else {
            toast.error('Failed to load purchase order')
        }
    } catch (error) {
        console.error('Error fetching purchase order:', error)
        toast.error(error.response?.data?.message || 'Failed to load purchase order details')
    } finally {
        isLoading.value = false
    }
}

const fetchReturnData = async () => {
    if (!returnId.value) return

    isLoading.value = true
    try {
        const response = await axiosClient.get(`/purchase-returns/${returnId.value}`)
        if (response.data?.success && response.data?.data) {
            const data = response.data.data

            returnData.value = {
                id: data.id,
                return_no: data.return_no,
                return_date: data.return_date
                    ? new Date(data.return_date).toISOString().split('T')[0]
                    : returnData.value.return_date,
                return_reason: data.return_reason || '',
                notes: data.notes || '',
                status: data.status || 'draft',
                purchase_order_id: data.purchase_order_id || null,
                company_id: data.company_id || null,
                returned_at: data.returned_at || null,
            }

            if (data.purchase_order) {
                purchaseOrder.value = data.purchase_order
                orderId.value = data.purchase_order.id
            } else if (data.purchase_order_id) {
                orderId.value = data.purchase_order_id
                await fetchPurchaseOrderOnly()
            }

            returnLines.value = (data.lines || []).map(line => {
                cartIdCounter++
                const qtyReturned = Number(line.qty_returned || line.quantity || 0)
                const unitPrice = Number(line.unit_price || 0)
                const discount = Number(line.discount_amount || 0)
                const tax = Number(line.tax_amount || 0)

                return {
                    cart_id: cartIdCounter,
                    purchase_order_line_id: line.purchase_order_line_id,
                    item_id: line.item_id,
                    item_name: line.item_name,
                    item_type: line.item_type,
                    is_raw_material: !!line.is_raw_material,
                    variant: line.variant,
                    variant_package: line.variant_package,
                    measurement_unit: line.measurement_unit,
                    qty_ordered: Number(line.qty_ordered || 0),
                    qty_returned: qtyReturned,
                    unit_price: unitPrice,
                    discount_amount: discount,
                    tax_amount: tax,
                    line_total: (unitPrice * qtyReturned) - discount + tax,
                    max_returnable_qty: Number(line.qty_ordered || line.max_returnable_qty || qtyReturned),
                    image_url: line.image_url || null,
                    description: line.description || '',
                    serial_numbers: Array.isArray(line.serial_numbers)
                        ? [...line.serial_numbers]
                        : [],
                }
            })
        }
    } catch (error) {
        console.error('Error fetching return:', error)
        toast.error(error.response?.data?.message || 'Failed to load return data')
    } finally {
        isLoading.value = false
    }
}

const fetchPurchaseOrderOnly = async () => {
    if (!orderId.value) return
    try {
        const response = await axiosClient.get(`/purchase-orders/${orderId.value}`)
        if (response.data?.success && response.data?.data) {
            purchaseOrder.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching purchase order:', error)
    }
}

// ==================== Return Line Operations ====================

const addReturnLine = (poLine) => {
    const available = getReturnableQty(poLine)

    if (available <= 0) {
        toast.warning('No quantity available for return on this line')
        return
    }

    if (isLineInReturn(poLine.id)) {
        toast.info('This item is already in the return list')
        return
    }

    const newLine = buildReturnLineFromPoLine(poLine, Math.min(1, available))
    returnLines.value.push(newLine)
    toast.success(`${poLine.item_name} added to return`)
}

const addAllAvailableProducts = () => {
    const available = productLines.value.filter(line => getReturnableQty(line) > 0 && !isLineInReturn(line.id))
    if (available.length === 0) {
        toast.info('No product items available to add')
        return
    }
    available.forEach(line => addReturnLine(line))
    showAddItemsModal.value = false
    toast.success(`Added ${available.length} product(s) to return`)
}

const addAllAvailableRawMaterials = () => {
    const available = rawMaterialLines.value.filter(line => getReturnableQty(line) > 0 && !isLineInReturn(line.id))
    if (available.length === 0) {
        toast.info('No raw materials available to add')
        return
    }
    available.forEach(line => addReturnLine(line))
    showRawMaterialsModal.value = false
    toast.success(`Added ${available.length} raw material(s) to return`)
}

const removeReturnLine = (index) => {
    const line = returnLines.value[index]
    returnLines.value.splice(index, 1)
    if (line) toast.success(`${line.item_name} removed from return`)
}

const updateLineTotal = (line) => {
    line.line_total = (Number(line.unit_price) * Number(line.qty_returned))
        - (Number(line.discount_amount) || 0)
        + (Number(line.tax_amount) || 0)
}

const validateQuantity = (line) => {
    let qty = Number(line.qty_returned)

    if (isNaN(qty) || qty < 0) qty = 0
    if (qty > line.max_returnable_qty) {
        qty = line.max_returnable_qty
        toast.warning(`Maximum returnable quantity is ${line.max_returnable_qty}`)
    }

    line.qty_returned = qty
    updateLineTotal(line)
}

const increaseQty = (line) => {
    if (Number(line.qty_returned) < line.max_returnable_qty) {
        line.qty_returned = Number(line.qty_returned) + 1
        updateLineTotal(line)
    }
}

const decreaseQty = (line) => {
    if (Number(line.qty_returned) > 1) {
        line.qty_returned = Number(line.qty_returned) - 1
        updateLineTotal(line)
    }
}

// ==================== Description Modal ====================

const openDescriptionModal = (line) => {
    descriptionModalLine.value = line
    descriptionModalText.value = line.description || ''
    showDescriptionModal.value = true
}

/**
 * Commit current textarea value to the line WITHOUT closing.
 * Safe to call multiple times.
 */
const commitDescription = () => {
    if (!descriptionModalLine.value) return
    const text = (descriptionModalText.value || '').trim()
    if (text.length > 500) return
    descriptionModalLine.value.description = text
}

/**
 * Close handler — used by Cancel button AND BaseModal @close.
 * Auto-saves before resetting state so reopening shows the latest input.
 */
const closeDescriptionModal = () => {
    commitDescription()
    showDescriptionModal.value = false
    descriptionModalLine.value = null
    descriptionModalText.value = ''
}

/**
 * Save button — commits and shows a toast.
 */
const saveDescription = () => {
    commitDescription()
    toast.success('Description saved')
    showDescriptionModal.value = false
    descriptionModalLine.value = null
    descriptionModalText.value = ''
}

// Watch on the modal open state to catch v-model changes
// (X button / backdrop / ESC) that may not fire @close.
watch(showDescriptionModal, (isOpen) => {
    if (!isOpen && descriptionModalLine.value) {
        commitDescription()
        descriptionModalLine.value = null
        descriptionModalText.value = ''
    }
})

// ==================== Serial Numbers Modal ====================

const openSerialModal = (line) => {
    serialModalLine.value = line
    // Deep copy so cancel doesn't mutate the original.
    // Restores previously saved serials into the inputs when reopened.
    serialModalSerials.value = Array.isArray(line.serial_numbers)
        ? [...line.serial_numbers]
        : []
    showSerialModal.value = true
}

/**
 * Commit current serial inputs to the line WITHOUT closing.
 * Trims entries, drops empties, dedupes (case-insensitive, keep first).
 */
const commitSerials = () => {
    if (!serialModalLine.value) return

    const cleaned = serialModalSerials.value
        .map(s => (s || '').trim())
        .filter(s => s.length > 0)

    const seen = new Set()
    const unique = []
    for (const s of cleaned) {
        const key = s.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(s)
        }
    }

    serialModalLine.value.serial_numbers = unique
}

const closeSerialModal = () => {
    commitSerials()
    showSerialModal.value = false
    serialModalLine.value = null
    serialModalSerials.value = []
}

const saveSerialNumbers = () => {
    commitSerials()
    toast.success('Serial numbers saved')
    showSerialModal.value = false
    serialModalLine.value = null
    serialModalSerials.value = []
}

const addSerialInput = () => {
    const max = Number(serialModalLine.value?.qty_returned || 0)
    if (max > 0 && serialModalSerials.value.length >= max) {
        toast.warning(`You can add at most ${max} serial number(s) for this line`)
        return
    }
    serialModalSerials.value.push('')
}

const removeSerialInput = (index) => {
    serialModalSerials.value.splice(index, 1)
}

// Watch on modal open state (handles X / backdrop / ESC closes)
watch(showSerialModal, (isOpen) => {
    if (!isOpen && serialModalLine.value) {
        commitSerials()
        serialModalLine.value = null
        serialModalSerials.value = []
    }
})

// ==================== Modal Handlers ====================

const openAddItemsModal = () => {
    itemSearchQuery.value = ''
    showAddItemsModal.value = true
}

const closeAddItemsModal = () => {
    showAddItemsModal.value = false
    itemSearchQuery.value = ''
}

const openRawMaterialsModal = () => {
    rawMaterialSearchQuery.value = ''
    showRawMaterialsModal.value = true
}

const closeRawMaterialsModal = () => {
    showRawMaterialsModal.value = false
    rawMaterialSearchQuery.value = ''
}

// ==================== Save / Complete ====================

const validateReturnData = () => {
    if (!returnData.value.return_reason) {
        toast.warning('Please select a return reason')
        return false
    }

    if (returnLines.value.length === 0) {
        toast.warning('Please add at least one item to return')
        return false
    }

    for (const line of returnLines.value) {
        if (Number(line.qty_returned) <= 0) {
            toast.warning(`Invalid quantity for ${line.item_name}`)
            return false
        }
        if (Number(line.qty_returned) > line.max_returnable_qty) {
            toast.warning(`Quantity for ${line.item_name} exceeds returnable limit`)
            return false
        }
    }

    return true
}

const buildPayload = () => {
    return {
        purchase_order_id: returnData.value.purchase_order_id || orderId.value,
        return_date: returnData.value.return_date,
        return_reason: returnData.value.return_reason,
        notes: returnData.value.notes,
        company_id: returnData.value.company_id,
        lines: returnLines.value.map(line => ({
            purchase_order_line_id: line.purchase_order_line_id,
            product_id: line.item_id,
            item_type: line.item_type,
            is_raw_material: line.is_raw_material,
            quantity: Number(line.qty_returned),
            unit_cost: Number(line.unit_price),
            discount_amount: Number(line.discount_amount) || 0,
            tax_amount: Number(line.tax_amount) || 0,
            description: line.description || '',
            serial_numbers: Array.isArray(line.serial_numbers)
                ? line.serial_numbers.filter(s => (s || '').trim().length > 0)
                : [],
        })),
    }
}

const saveAsDraft = async () => {
    if (!validateReturnData()) return

    isSaving.value = true
    try {
        const payload = buildPayload()

        let response
        if (returnId.value) {
            response = await axiosClient.put(`/purchase-returns/${returnId.value}`, payload)
        } else {
            response = await axiosClient.post('/purchase-returns', payload)
        }

        if (response.data?.success || response.data?.status === 200 || response.data?.status === 201) {
            toast.success(response.data?.message || 'Return saved successfully')
            router.push('/purchase-returns')
        } else {
            toast.error(response.data?.message || 'Failed to save return')
        }
    } catch (error) {
        console.error('Error saving return:', error)
        toast.error(error.response?.data?.message || 'Failed to save return')
    } finally {
        isSaving.value = false
    }
}

const completeReturn = async () => {
    if (!returnId.value) return

    isSaving.value = true
    try {
        const response = await axiosClient.post(`/purchase-returns/${returnId.value}/complete`)
        if (response.data?.success || response.data?.status === 200) {
            toast.success('Return completed successfully. Stock has been reversed.')
            await fetchReturnData()
        } else {
            toast.error(response.data?.message || 'Failed to complete return')
        }
    } catch (error) {
        console.error('Error completing return:', error)
        toast.error(error.response?.data?.message || 'Failed to complete return')
    } finally {
        isSaving.value = false
    }
}

const confirmDelete = async () => {
    if (!returnId.value) return

    isSaving.value = true
    try {
        await axiosClient.delete(`/purchase-returns/${returnId.value}`)
        toast.success('Return deleted successfully')
        router.push('/purchase-returns')
    } catch (error) {
        console.error('Error deleting return:', error)
        toast.error(error.response?.data?.message || 'Failed to delete return')
    } finally {
        isSaving.value = false
        showDeleteConfirmModal.value = false
    }
}

// ==================== Format Helpers ====================

const formatNumber = (value) => {
    if (value === null || value === undefined) return '0.00'
    const num = Number(value)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// ==================== Lifecycle ====================

onMounted(async () => {
    if (returnId.value) {
        await fetchReturnData()
    } else if (orderId.value) {
        await fetchPurchaseOrder()
    } else {
        toast.error('No purchase order specified')
        router.push('/purchase-returns')
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