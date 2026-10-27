<!-- WorkOrderEdit.vue -->
<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                    Edit Work Order
                </h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
        <!-- Work Order Information Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mb-6">

            <!-- Supplier Name -->
            <div>
                <SearchSelect v-model="formData.supplier_id" :options="supplierStoreItems"
                    :selected-item="selectedSupplier" label="Supplier Name" placeholder="--Select Supplier--"
                    :error="validationErrors.supplier_id" required @change="onSupplierChange" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Address <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.supplier_address" type="text" placeholder="Enter supplier address"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.supplier_address }"
                    @input="clearValidationError('supplier_address')" />
                <p v-if="validationErrors.supplier_address" class="text-xs text-red-500 mt-1">{{
                    validationErrors.supplier_address }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier City <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.supplier_city" type="text" placeholder="Enter city"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.supplier_city }"
                    @input="clearValidationError('supplier_city')" />
                <p v-if="validationErrors.supplier_city" class="text-xs text-red-500 mt-1">{{
                    validationErrors.supplier_city }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Country <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.supplier_country" type="text" placeholder="Enter country"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.supplier_country }"
                    @input="clearValidationError('supplier_country')" />
                <p v-if="validationErrors.supplier_country" class="text-xs text-red-500 mt-1">{{
                    validationErrors.supplier_country }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Factory Address
                </label>
                <input v-model="formData.supplier_factory_address" type="text" placeholder="Enter factory address"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>

            <!-- Reference No -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference No <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.reference_no" type="text" placeholder="Enter reference number"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.reference_no }"
                    @input="clearValidationError('reference_no')" />
                <p v-if="validationErrors.reference_no" class="text-xs text-red-500 mt-1">{{
                    validationErrors.reference_no }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Order Date <span class="text-xs text-red-500">*</span>
                </label>
                <DateInput v-model="formData.work_order_date"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.work_order_date }" />
                <p v-if="validationErrors.work_order_date" class="text-xs text-red-500 mt-1">{{
                    validationErrors.work_order_date }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Revised Date 1
                </label>
                <DateInput v-model="formData.revised_date_1" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Revised Date 2
                </label>
                <DateInput v-model="formData.revised_date_2" />
            </div>

            <!-- Subject -->
            <div class="col-span-1 2xl:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.subject" type="text" placeholder="Enter subject"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.subject }"
                    @input="clearValidationError('subject')" />
                <p v-if="validationErrors.subject" class="text-xs text-red-500 mt-1">{{ validationErrors.subject }}
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salutation <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.salutation" type="text" placeholder="e.g., Dear Sir/Madam"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.salutation }"
                    @input="clearValidationError('salutation')" />
                <p v-if="validationErrors.salutation" class="text-xs text-red-500 mt-1">{{ validationErrors.salutation
                    }}</p>
            </div>

            <div class="col-span-1 md:col-span-1 lg:col-span-2 2xl:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Introduction <span class="text-xs text-red-500">*</span>
                </label>
                <input v-model="formData.introduction" type="text" placeholder="Introduction text"
                    class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.introduction }"
                    @input="clearValidationError('introduction')" />
                <p v-if="validationErrors.introduction" class="text-xs text-red-500 mt-1">{{
                    validationErrors.introduction }}</p>
            </div>
        </div>

        <!-- Items Section -->
        <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300">
                    <i class="fas fa-boxes mr-2"></i>Work Order Items
                </h3>
                <button @click="addRow"
                    class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>Add Row</span>
                </button>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                #</th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Product <span class="text-red-500">*</span>
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Size
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                 Quality
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Length
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Width
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Height
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Weight
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Color
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Unit Price (৳)
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Unit<span class="text-red-500">*</span>
                            </th>
                            <th
                                class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Quantity<span class="text-red-500">*</span>
                            </th>
                            <th
                                class="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Total (৳)
                            </th>
                            <th
                                class="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="(item, index) in items" :key="item.id">
                            <td class="px-1 py-2 text-xs text-gray-500 dark:text-gray-400">
                                {{ index + 1 }}
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.product_description"
                                    @input="clearItemValidationError(item, 'product_description')" type="text"
                                    placeholder="Product description"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                                    :class="{ 'border-red-500 dark:border-red-500': item.errors?.product_description }" />
                                <p v-if="item.errors?.product_description" class="text-xs text-red-500 mt-1">{{
                                    item.errors.product_description }}</p>
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.size" type="text" placeholder="Size"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.foil_quality" type="text" placeholder="Quality"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.length" type="text" placeholder="Length"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.width" type="text" placeholder="Width"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.height" type="text" placeholder="Height"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.weight" type="text" placeholder="Weight"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <td class="px-1 py-2">
                                <input v-model="item.color" type="text" placeholder="Color"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>

                            <!-- Unit Price -->
                            <td class="px-1 py-2">
                                <input v-model.number="item.unit_price_per_kg" @input="calculateItemTotal(item)"
                                    type="number" min="0" step="0.01" placeholder="0.00"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                            </td>
                            <!-- Unit -->
                            <td class="px-1 py-2">
                                <select v-model="item.unit" @change="clearItemValidationError(item, 'unit')"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                                    :class="{ 'border-red-500 dark:border-red-500': item.errors?.unit }">
                                    <option value="" disabled>Unit</option>
                                    <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                                </select>
                                <p v-if="item.errors?.unit" class="text-xs text-red-500 mt-1">{{ item.errors.unit }}</p>
                            </td>


                            <!-- Quantity -->
                            <td class="px-1 py-2">
                                <input v-model.number="item.order_quantity_kg"
                                    @input="clearItemValidationError(item, 'order_quantity_kg'); calculateItemTotal(item)"
                                    type="number" min="0" step="0.01" placeholder="Qty (kg)"
                                    class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"
                                    :class="{ 'border-red-500 dark:border-red-500': item.errors?.order_quantity_kg }" />
                                <p v-if="item.errors?.order_quantity_kg" class="text-xs text-red-500 mt-1">{{
                                    item.errors.order_quantity_kg }}</p>
                            </td>
                            <!-- Total -->
                            <td class="px-1 py-2 text-right font-medium text-gray-900 dark:text-white text-xs">
                                ৳ {{ item.total_bill_amount.toFixed(2) }}
                            </td>
                            <!-- Actions -->
                            <td class="px-1 py-2 text-center">
                                <button @click="removeRow(index)"
                                    class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors text-xs"
                                    :disabled="items.length <= 1"
                                    :class="{ 'opacity-50 cursor-not-allowed': items.length <= 1 }" title="Remove row">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <td colspan="15" class="p-0">
                                <!-- Footer alignment Table -->
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="width: 40%; text-align: right; padding: 6px; font-size: 11px;">
                                            <div>
                                                <strong>Total Items: </strong>
                                                <span class="text-blue-600 dark:text-blue-400"
                                                    style="color: #2563eb; font-weight: bold;">
                                                    {{ totalItems }}
                                                </span>
                                            </div>
                                            <div style="margin-top: 4px;">
                                                <strong>Grand Total: </strong>
                                                <span class="text-blue-600 dark:text-blue-400"
                                                    style="color: #2563eb; font-weight: bold;">
                                                    ৳ {{ grandTotal.toFixed(2) }}
                                                </span>
                                            </div>
                                            <div style="margin-top: 4px;">
                                                <strong>Total Amount in Words: </strong>
                                                <span class="text-blue-600 dark:text-blue-400"
                                                    style="color: #2563eb; font-weight: bold;">
                                                    {{ totalAmountInWords }}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- Terms & Special Notes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term A
                </label>
                <input v-model="formData.term_a" type="text" placeholder="Term A"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term B
                </label>
                <input v-model="formData.term_b" type="text" placeholder="Term B"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term C
                </label>
                <input v-model="formData.term_c" type="text" placeholder="Term C"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term D
                </label>
                <input v-model="formData.term_d" type="text" placeholder="Term D"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term E
                </label>
                <input v-model="formData.term_e" type="text" placeholder="Term E"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
        </div>

        <!-- Special Notes -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Special Notes
            </label>
            <textarea v-model="formData.special_notes" rows="3" placeholder="Add any special notes..."
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all"></textarea>
        </div>

        <!-- Signature & Copy Labels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Signature Label
                </label>
                <input v-model="formData.receiving_copy_label" type="text" placeholder="e.g., Supplier Copy" disabled
                    class="w-full cursor-not-allowed text-gray-500 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Signature Label
                </label>
                <input v-model="formData.signature_label" type="text" placeholder="e.g., Authorized Signature" disabled
                    class="w-full text-gray-500 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requested By Name
                </label>
                <input v-model="formData.request_name" type="text" placeholder="Enter requested by name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Received By Name
                </label>
                <input v-model="formData.received_name" type="text" placeholder="Enter received by name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button @click="showResetConfirmModal = true"
                class="px-6 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm font-medium">
                <i class="fas fa-undo"></i>
                <span>Reset</span>
            </button>
            <button @click="openPreviewModal"
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium"
                :disabled="isLoading" :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
                <i class="fas fa-eye"></i>
                <span>Preview</span>
            </button>
            <button @click="openPreviewModal"
                class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium"
                :disabled="isLoading || items.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': isLoading || items.length === 0 }">
                <i class="fas fa-save"></i>
                <span>{{ isLoading ? 'Updating...' : 'Update Work Order' }}</span>
            </button>
        </div>
    </div>

    <!-- Preview Modal -->
    <BaseModal v-if="showPreviewModal" :show="showPreviewModal" title="Preview & Confirm Work Order" maxWidth="7xl"
        @close="closePreviewModal">
        <div class="p-2">
            <Preview :work-order-data="previewData" @close="closePreviewModal" @confirm="updateWorkOrder"
                :loading="isLoading" />
        </div>
    </BaseModal>

    <!-- Reset Confirmation Modal -->
    <BaseModal v-if="showResetConfirmModal" :show="showResetConfirmModal" title="Reset Form" maxWidth="md"
        :showClose="false">
        <div class="px-6 py-4">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Reset Form</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to reset the form? All entered data will be lost and cannot be recovered.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="showResetConfirmModal = false"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="resetForm"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-undo mr-2"></i>Reset Form
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Success Modal -->
    <BaseModal v-if="showSuccessModal" :show="showSuccessModal" title="Work Order Updated" maxWidth="md"
        :showClose="false">
        <div class="flex flex-col items-center p-6 text-center">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-check-circle text-4xl text-green-600 dark:text-green-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Work Order Updated!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">The work order has been updated successfully.</p>
            <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg mb-6 w-full">
                <p class="text-sm text-gray-500 dark:text-gray-400">Reference Number</p>
                <p class="font-medium text-gray-900 dark:text-white"># {{ lastWorkOrderData?.reference_no || 'N/A' }}
                </p>
            </div>
            <div class="flex justify-center space-x-3 w-full flex-wrap gap-2">
                <button @click="printWorkOrder(lastWorkOrderData?.id)"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-print mr-2"></i>Print
                </button>
                <button @click="exportWorkOrder(lastWorkOrderData?.id)"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-file-pdf mr-2"></i>Export PDF
                </button>
                <button @click="closeSuccessModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Close
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import Preview from './Preview.vue';
import { useSupplierStore } from '@/stores/supplierStore';
import DateInput from '@/components/common/DateInput.vue';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const supplierStore = useSupplierStore();

// State
const isLoading = ref(false);
const showPreviewModal = ref(false);
const showResetConfirmModal = ref(false);
const showSuccessModal = ref(false);
const lastWorkOrderData = ref(null);
const workOrderId = ref(null);

const sname = ref('');
const term_e = ref(`During delivery in case, if there any damage found, same needs to be replaced by "${sname.value || ''}" free of charge.`);
watch(sname, () => {
    formData.term_e = `During delivery in case, if there any damage found, same needs to be replaced by "${sname.value || ''}" free of charge.`;
});

const units = ['KG', 'PCS', 'Bosta', 'Packet', 'Jar', 'Carton'];

// Form Data
const formData = reactive({
    supplier_id: null,
    supplier_address: '',
    supplier_city: '',
    supplier_country: '',
    supplier_factory_address: '',
    reference_no: '',
    subject: `Work Order for Supplying of Micro PVC Shrink Foil Printing`,
    salutation: 'Dear Sir / Madam,',
    introduction: `With Reference to your quotation & subsequent negotiation, we are pleased to issue this purchase order for the Following - `,
    work_order_date: new Date().toISOString().split('T')[0],
    revised_date_1: '',
    revised_date_2: '',
    term_a: `Full order quantity of Items to be delivered to our Gazipur Factory withtin the shortage possible time.`,
    term_b: `Transportation Charges are built in to the Price.`,
    term_c: `Delivery to be Completed within Seven (7) working days from the date of issuing this work order.`,
    term_d: `Payment will be settled through the Account, Please share us your Bank and it's Account number details with routing number at your earliest.`,
    term_e: term_e.value,
    special_notes: `Refer from discussion with Mr. Kabir, - It should be do the production only 50 Kgs of Each Item, in First Lot Delivery.`,
    signature_label: 'Received By',
    receiving_copy_label: 'Requested By',
    received_name: '',
    request_name: ''
});

// Validation Errors
const validationErrors = reactive({
    supplier_id: null,
    supplier_address: null,
    supplier_city: null,
    supplier_country: null,
    reference_no: null,
    subject: null,
    unit: null,
    salutation: null,
    introduction: null,
    work_order_date: null
});

// watch supplier_id to update sname and term_e
watch(() => formData.supplier_id, (newSupplierId) => {
    const vendor = supplierStore.items?.find(v => Number(v.id) === Number(newSupplierId));
    sname.value = vendor?.name || '';
    formData.term_e = `During delivery in case, if there any damage found, same needs to be replaced by "${sname.value || ''}" free of charge.`;
});

// Items with at least one row
const items = ref([
    {
        id: Date.now(),
        product_description: '',
        size: '',
        foil_quality: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        color: '',
        unit: '',
        order_quantity_kg: 1,
        unit_price_per_kg: 0,
        total_bill_amount: 0,
        errors: {}
    }
]);

// Computed
const supplierStoreItems = computed(() => {
    const items = supplierStore.items || [];
    return items.map(item => ({
        id: item.id,
        supplier_id: item.id,
        name: item.name
    })).filter(item => item !== undefined && item !== null);
});

const selectedSupplier = computed(() => {
    if (!formData.supplier_id) return null;
    return supplierStore.items?.find(v => Number(v.id) === Number(formData.supplier_id)) || null;
});

const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.order_quantity_kg || 0), 0);
});

const grandTotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.total_bill_amount || 0), 0);
});

const totalAmountInWords = computed(() => {
    return numberToWords(grandTotal.value);
});

// Helper function to convert number to words
const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 20) return units[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
        if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    const whole = Math.floor(num);
    const decimal = Math.round((num - whole) * 100);
    let result = convert(whole);
    if (decimal > 0) {
        result += ' and ' + convert(decimal) + ' Paisa';
    }
    return result + ' Only';
};

const previewData = computed(() => ({
    work_order_date: formData.work_order_date,
    revised_date_1: formData.revised_date_1,
    revised_date_2: formData.revised_date_2,
    supplier_name: selectedSupplier.value?.name || '',
    supplier_address: formData.supplier_address,
    supplier_city: formData.supplier_city,
    supplier_country: formData.supplier_country,
    supplier_factory_address: formData.supplier_factory_address,
    reference_no: formData.reference_no || 'WO-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
    subject: formData.subject,
    salutation: formData.salutation,
    introduction: formData.introduction,
    total_bill_amount: grandTotal.value,
    total_amount_in_words: totalAmountInWords.value,
    term_a: formData.term_a,
    term_b: formData.term_b,
    term_c: formData.term_c,
    term_d: formData.term_d,
    term_e: formData.term_e,
    special_notes: formData.special_notes,
    signature_label: formData.signature_label || 'Authorized Signature',
    receiving_copy_label: formData.receiving_copy_label || 'Supplier Copy',
    received_by_name: formData.received_name,
    requested_by_name: formData.request_name,
    items: items.value.map(item => ({
        supplier_name: item.supplier_name,
        product_description: item.product_description,
        size: item.size,
        foil_quality: item.foil_quality,
        length: item.length,
        width: item.width,
        height: item.height,
        weight: item.weight,
        color: item.color,
        unit: item.unit,
        order_quantity_kg: item.order_quantity_kg,
        unit_price_per_kg: item.unit_price_per_kg,
        total_bill_amount: item.total_bill_amount
    }))
}));

// Methods 
const onSupplierChange = () => {
    clearValidationError('supplier_id');
    if (selectedSupplier.value) {
        formData.supplier_address = selectedSupplier.value.address || '';
        formData.supplier_city = selectedSupplier.value.city || '';
        formData.supplier_country = selectedSupplier.value.country || 'Bangladesh';
    } else {
        formData.supplier_address = '';
        formData.supplier_city = '';
        formData.supplier_country = '';
    }
};

const addRow = () => {
    items.value.push({
        id: Date.now() + Math.random(),
        supplier_name: '',
        product_description: '',
        size: '',
        foil_quality: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        color: '',
        unit: '',
        order_quantity_kg: 1,
        unit_price_per_kg: 0,
        total_bill_amount: 0,
        errors: {}
    });
};

const removeRow = (index) => {
    if (items.value.length > 1) {
        items.value.splice(index, 1);
    }
};

const calculateItemTotal = (item) => {
    item.total_bill_amount = (item.order_quantity_kg || 0) * (item.unit_price_per_kg || 0);
};

const clearValidationError = (field) => {
    validationErrors[field] = null;
};

// Clear validation error for specific item field
const clearItemValidationError = (item, field) => {
    if (item.errors && item.errors[field]) {
        item.errors[field] = null;
    }
};

const validateForm = () => {
    let isValid = true;

    // Clear all errors
    Object.keys(validationErrors).forEach(key => validationErrors[key] = null);

    // Validate supplier
    if (!formData.supplier_id) {
        validationErrors.supplier_id = 'Please select a supplier';
        isValid = false;
    }

    // Validate supplier address
    if (!formData.supplier_address || formData.supplier_address.trim() === '') {
        validationErrors.supplier_address = 'Supplier address is required';
        isValid = false;
    }

    // Validate supplier city
    if (!formData.supplier_city || formData.supplier_city.trim() === '') {
        validationErrors.supplier_city = 'Supplier city is required';
        isValid = false;
    }

    // Validate supplier country
    if (!formData.supplier_country || formData.supplier_country.trim() === '') {
        validationErrors.supplier_country = 'Supplier country is required';
        isValid = false;
    }

    // Validate reference no
    if (!formData.reference_no || formData.reference_no.trim() === '') {
        validationErrors.reference_no = 'Reference number is required';
        isValid = false;
    }

    // Validate subject
    if (!formData.subject || formData.subject.trim() === '') {
        validationErrors.subject = 'Subject is required';
        isValid = false;
    }

    // Validate salutation
    if (!formData.salutation || formData.salutation.trim() === '') {
        validationErrors.salutation = 'Salutation is required';
        isValid = false;
    }

    // Validate introduction
    if (!formData.introduction || formData.introduction.trim() === '') {
        validationErrors.introduction = 'Introduction is required';
        isValid = false;
    }

    // Validate work order date
    if (!formData.work_order_date) {
        validationErrors.work_order_date = 'Work order date is required';
        isValid = false;
    }

    // Validate items
    items.value.forEach((item) => {
        // Initialize errors object if not exists
        if (!item.errors) {
            item.errors = {};
        }

        // Clear previous errors for this item
        item.errors.product_description = null;
        item.errors.order_quantity_kg = null;
        item.errors.unit = null;

        // Validate product description
        if (!item.product_description || item.product_description.trim() === '') {
            item.errors.product_description = 'Product description is required';
            isValid = false;
        }

        // Validate quantity
        if (!item.order_quantity_kg || item.order_quantity_kg <= 0) {
            item.errors.order_quantity_kg = 'Quantity must be greater than 0';
            isValid = false;
        }

        // Validate unit
        if (!item.unit || item.unit.trim() === '') {
            item.errors.unit = 'Please select a unit';
            isValid = false;
        }
    });

    return isValid;
};

const openPreviewModal = () => {
    if (!validateForm()) {
        toast.warning('Please fix all errors before previewing');
        return;
    }

    if (items.value.length === 0) {
        toast.warning('Please add at least one item');
        return;
    }

    showPreviewModal.value = true;
};

const closePreviewModal = () => {
    showPreviewModal.value = false;
};

const resetForm = () => {
    formData.supplier_id = null;
    formData.supplier_address = '';
    formData.supplier_city = '';
    formData.supplier_country = '';
    formData.supplier_factory_address = '';
    formData.reference_no = '';
    formData.work_order_date = new Date().toISOString().split('T')[0];
    formData.revised_date_1 = '';
    formData.revised_date_2 = '';
    formData.received_name = '';
    formData.request_name = '';

    items.value = [
        {
            id: Date.now(),
            supplier_name: '',
            product_description: '',
            size: '',
            foil_quality: '',
            length: '',
            width: '',
            height: '',
            weight: '',
            color: '',
            unit: '',
            order_quantity_kg: 1,
            unit_price_per_kg: 0,
            total_bill_amount: 0,
            errors: {}
        }
    ];

    Object.keys(validationErrors).forEach(key => validationErrors[key] = null);
    showResetConfirmModal.value = false;
    toast.info('Form has been reset');
};

const updateWorkOrder = async () => {
    if (!validateForm()) {
        toast.warning('Please fix all errors before updating');
        closePreviewModal();
        return;
    }

    if (items.value.length === 0) {
        toast.warning('Please add at least one item');
        closePreviewModal();
        return;
    }

    isLoading.value = true;

    try {
        const payload = {
            work_order_date: formData.work_order_date,
            revised_date_1: formData.revised_date_1 || null,
            revised_date_2: formData.revised_date_2 || null,
            supplier_id: formData.supplier_id,
            supplier_address: formData.supplier_address,
            supplier_city: formData.supplier_city,
            supplier_country: formData.supplier_country,
            supplier_factory_address: formData.supplier_factory_address || null,
            reference_no: formData.reference_no,
            subject: formData.subject,
            salutation: formData.salutation,
            introduction: formData.introduction,
            total_bill_amount: grandTotal.value,
            total_amount_in_words: totalAmountInWords.value,
            term_a: formData.term_a || null,
            term_b: formData.term_b || null,
            term_c: formData.term_c || null,
            term_d: formData.term_d || null,
            term_e: formData.term_e || null,
            special_notes: formData.special_notes || null,
            signature_label: formData.signature_label || 'Authorized Signature',
            receiving_copy_label: formData.receiving_copy_label || 'Supplier Copy',
            received_name: formData.received_name || null,
            request_name: formData.request_name || null,
            items: items.value.map(item => ({
                id: item.id,
                product_description: item.product_description,
                size: item.size || null,
                foil_quality: item.foil_quality || null,
                length: item.length || null,
                width_mm: item.width || null,
                height_mm: item.height || null,
                weight: item.weight || null,
                color: item.color || null,
                unit: item.unit || null,
                order_quantity_kg: item.order_quantity_kg,
                unit_price_per_kg: item.unit_price_per_kg || 0,
                total_bill_amount: item.total_bill_amount
            }))
        };

        const response = await axiosClient.put(`/work-orders/${workOrderId.value}`, payload);

        if (response.data.success) {
            lastWorkOrderData.value = response.data.data;
            closePreviewModal();
            showSuccessModal.value = true;
            toast.success('Work order updated successfully!');
        } else {
            toast.error(response.data.message || 'Failed to update work order');
        }
    } catch (error) {
        console.error('Error updating work order:', error);
        toast.error(error.response?.data?.message || 'An error occurred while updating');
    } finally {
        isLoading.value = false;
    }
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
    router.push({ name: 'work-orders' });
};

const printWorkOrder = (workOrderId) => {
    if (workOrderId) {
        axiosClient.get(`/work-orders/${workOrderId}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    iframe.contentWindow.print();
                };
            })
            .catch((error) => {
                console.error('Error printing:', error);
                toast.error('Failed to print work order');
            });
    }
};

const exportWorkOrder = (workOrderId) => {
    if (workOrderId) {
        axiosClient.get(`/work-orders/${workOrderId}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `work_order_${lastWorkOrderData.value?.reference_no || workOrderId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('PDF exported successfully!');
            })
            .catch((error) => {
                console.error('Error exporting:', error);
                toast.error('Failed to export PDF');
            });
    }
};

const loadWorkOrder = async () => {
    try {
        isLoading.value = true;
        workOrderId.value = route.params.id;
        const response = await axiosClient.get(`/work-orders/${workOrderId.value}`);

        if (!response.data?.success || !response.data.data) {
            toast.error('Failed to fetch work order details');
            router.push({ name: 'work-orders' });
            return;
        }

        const workOrder = response.data.data;

        // Populate form data
        Object.keys(formData).forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(workOrder, field)) {
                formData[field] = workOrder[field] ?? '';
            }
        });

        // Populate items
        if (Array.isArray(workOrder.items) && workOrder.items.length > 0) {
            items.value = workOrder.items.map((item) => ({
                id: item.id || Date.now() + Math.random(),
                product_description: item.product_description || '',
                size: item.size || '',
                foil_quality: item.foil_quality || '',
                length: item.length || '',
                width: item.width_mm || '',
                height: item.height_mm || '',
                weight: item.weight || '',
                color: item.color || '',
                unit: item.unit || '',
                order_quantity_kg: Number(item.order_quantity_kg) || 0,
                unit_price_per_kg: Number(item.unit_price_per_kg) || 0,
                total_bill_amount: Number(item.total_bill_amount) || 0,
                errors: {}
            }));
        }

        // Update supplier name for term_e
        if (formData.supplier_id) {
            const vendor = supplierStore.items?.find(v => Number(v.id) === Number(formData.supplier_id));
            sname.value = vendor?.name || '';
        }

    } catch (error) {
        console.error('Error fetching work order:', error);
        toast.error('An error occurred while fetching work order details');
        router.push({ name: 'work-orders' });
    } finally {
        isLoading.value = false;
    }
};

// Lifecycle
onMounted(async () => {
    try {
        await supplierStore.getAll();
        await loadWorkOrder();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        toast.error('Failed to load suppliers');
    }
});
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
    outline: none;
}

/* Scrollbar styling for items table */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
    background: #374151;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #6b7280;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>