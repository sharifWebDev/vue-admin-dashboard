<template>
    <div class="mb-0">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                    Purchase Order Create</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="">
        <!-- MAIN SECTION -->
        <div class="bg-gray-50 dark:bg-gray-800 overflow-hidden font-sans flex flex-col">
            <div class="flex flex-col lg:flex-row flex-wrap px-1 md:px-1 py-4 gap-4 md:gap-4 overflow-hidden">
                <!-- Left Section - Products & Cart -->
                <div
                    class="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 md:p-6 flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">

                    <!-- Top Filters -->
                    <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 items-end gap-4 mb-6">
                        <!-- Supplier -->
                        <div class="w-full">
                            <SearchSelect v-model="formData.supplier_id" :options="supplierStoreItems"
                                :selected-item="selectedSupplier" label="Supplier" placeholder="--Select Supplier--"
                                :error="orderStore.validationErrors?.supplier_id" required
                                @change="clearValidationError('supplier_id')" />
                        </div>

                        <!-- Warehouse -->
                        <div class="w-full">
                            <SearchSelect v-model="formData.warehouse_id" :options="warehouseStoreItems"
                                :selected-item="selectedWarehouse" label="Warehouse" placeholder="--Select Warehouse--"
                                :error="orderStore.validationErrors?.warehouse_id" required
                                @change="clearValidationError('warehouse_id')" />
                        </div>

                        <!-- Order Date -->
                        <div class="w-full">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Order Date <span class="text-xs text-red-500 dark:text-red-500"> *</span>
                            </label>
                            <div class="relative flex items-center">
                                <flat-pickr v-model="order_date" :config="config"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                                <div class="absolute left-4 text-gray-400">
                                    <i class="far fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Expected Date -->
                        <div class="w-full">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expected Date
                            </label>
                            <div class="relative flex items-center">
                                <flat-pickr v-model="formData.expected_date"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                                <div class="absolute left-4 text-gray-400">
                                    <i class="far fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Browse Products Button -->
                        <div class="">
                            <button @click="openProductBrowser"
                                class="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                                <i class="fas fa-layer-group text-lg"></i>
                                <span class="font-medium">Browse Products</span>
                            </button>
                        </div>

                        <!-- Browse Raw Materials Button -->
                        <div class="">
                            <button @click="openRawMaterialBrowser"
                                class="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                                <i class="fas fa-flask text-lg"></i>
                                <span class="font-medium">Browse Raw Materials</span>
                            </button>
                        </div>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex flex-col" style="max-height: 800px;">
                        <div
                            class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4 flex justify-between items-center flex-shrink-0">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cart Items ({{
                                cartItems.length }})</h3>
                            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Total: ৳ {{
                                total.toFixed(2) }}</span>
                        </div>

                        <div class="overflow-y-auto flex-1">
                            <!-- Cart Header -->
                            <div v-if="cartItems.length > 0"
                                class="grid grid-cols-12 gap-2 mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                                <div class="col-span-3">Item</div>
                                <div class="col-span-2 text-center">Type / Package</div>
                                <div class="col-span-2 text-center">Unit Price</div>
                                <div class="col-span-2 text-center">Discount</div>
                                <div class="col-span-2 text-center">Qty</div>
                                <div class="col-span-1 text-right">Total</div>
                            </div>

                            <!-- Cart Items List -->
                            <div v-for="(item, index) in cartItems" :key="item.cart_id"
                                class="grid grid-cols-12 gap-2 px-3 py-3 mb-2 bg-white rounded-xl border hover:shadow-sm transition-all relative group"
                                :class="item.error
                                    ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30'
                                    : 'border-gray-100 hover:border-blue-100'">

                                <!-- Item Column -->
                                <div class="col-span-3 flex items-center gap-3">
                                    <div
                                        class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover"
                                            v-if="item.image_url">
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-400">
                                            <i :class="item.item_type === 'raw_material' ? 'fas fa-flask' : 'fas fa-box'"
                                                class="text-xl"></i>
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h4 class="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                            {{ item.name }}</h4>
                                        <span
                                            class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5"
                                            :class="item.item_type === 'raw_material'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                                            {{ item.item_type === 'raw_material' ? 'Raw Material' : 'Product' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Type / Package Column -->
                                <div class="col-span-2 flex flex-col items-center justify-center">
                                    <!-- Product: Variant Package -->
                                    <div v-if="item.item_type === 'product'" class="w-full">
                                        <select v-model="item.variant_package_id"
                                            @change="onVariantPackageChange(index, item.variant_package_id)"
                                            class="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white text-center">
                                            <option value="">Select Package</option>
                                            <option v-for="pkg in getAvailableVariantPackages(item, index)"
                                                :key="pkg.id" :value="pkg.id">
                                                {{ formatVariantPackageLabel(pkg) }}
                                            </option>
                                        </select>
                                    </div>
                                    <!-- Raw Material: Measurement Unit -->
                                    <div v-else class="text-center">
                                        <span
                                            class="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {{ item.measurement_unit?.symbol || '-' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Unit Price Column -->
                                <div class="col-span-2 flex items-center justify-center">
                                    <div class="relative w-full max-w-[100px]">
                                        <input type="number" v-model="item.unit_price"
                                            @input="updateCartItemTotal(item)"
                                            class="w-full text-right px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white">
                                        <span
                                            class="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">৳</span>
                                    </div>
                                </div>

                                <!-- Discount Column -->
                                <div class="col-span-2 flex items-center justify-center">
                                    <div class="relative w-full max-w-[100px]">
                                        <input type="number" v-model="item.discount_amount"
                                            @input="updateCartItemTotal(item); handleDiscountInput($event, index)"
                                            class="w-full text-right px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white">
                                        <span
                                            class="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">৳</span>
                                    </div>
                                </div>

                                <!-- Quantity Column -->
                                <div class="col-span-2 flex items-center justify-center gap-1">
                                    <div class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                                        <button @click="decreaseQty(index)"
                                            class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <i class="fas fa-minus text-xs"></i>
                                        </button>
                                        <input type="number" v-model="item.quantity" min="0" max="999999" step="1"
                                            @input="handleQtyInput($event, index)"
                                            @change="handleQtyChange($event, index)"
                                            class="w-[90px] pl-2 py-1 -mx-5 z-5 text-center text-sm font-medium dark:text-white bg-gray-100 dark:bg-gray-700 
                                        border border-gray-100 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-200" />
                                        <button @click="increaseQty(index)"
                                            class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Total Column -->
                                <div class="col-span-1 flex flex-col justify-center items-end">
                                    <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        ৳ {{ getItemTotal(item).toFixed(2) }}
                                    </span>
                                </div>

                                <!-- Remove Button -->
                                <button @click="removeItem(index)"
                                    class="absolute -top-2 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-25 group-hover:opacity-50 hover:opacity-100 transition-opacity shadow-md hover:bg-red-600">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                                <div v-if="item.error"
                                    class="col-span-12 mt-2 text-[11px] text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100 flex items-start gap-1">
                                    <i class="fas fa-exclamation-circle mt-0.5"></i>
                                    <span>{{ item.error }}</span>
                                </div>
                            </div>

                            <!-- Empty Cart -->
                            <div v-if="cartItems.length === 0"
                                class="flex flex-col items-center justify-center py-12 text-gray-400 min-h-[40vh]">
                                <i class="fas fa-shopping-cart text-4xl mb-3"></i>
                                <p class="text-sm">No items in cart. Browse products or raw materials to add.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="cartItems.length > 0" class="mt-6">
                        <div class="mb-4 h-full">
                            <TextEditorInput v-model="notes" label="Notes" />
                        </div>
                    </div>
                </div>

                <!-- Right Section - Order Summary -->
                <div class="w-full lg:w-96 space-y-4 flex flex-col overflow-hidden">
                    <!-- Supplier Info -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-md font-semibold text-gray-900 dark:text-white">
                                Supplier Information
                            </h3>
                            <button @click="openSupplierCreateModal"
                                class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                <i class="fas fa-plus-circle mr-1"></i> New
                            </button>
                        </div>

                        <!-- Selected Supplier -->
                        <div v-if="selectedSupplier"
                            class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex-shrink-0 h-12 w-12 bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-sm">
                                    <img :src="selectedSupplier.avatar_url || 'https://ui-avatars.com/api/?name=' + selectedSupplier.name"
                                        :alt="selectedSupplier.name" class="h-full w-full object-cover">
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ selectedSupplier.name }}
                                    </h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedSupplier.phone_no
                                    }}</p>
                                    <p v-if="selectedSupplier.email" class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ selectedSupplier.email }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="p-3 flex gap-2 text-start bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed 
                            border-gray-200 dark:border-gray-600">
                            <p class=""><i class="fas fa-user-circle text-[3.23vh] text-gray-300 dark:text-gray-500 mb-2"></i>
                            </p>
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    No supplier selected
                                </p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Select from search above
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div
                        class="max-h-[600px] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700 flex-1 flex flex-col">
                        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

                        <div class="space-y-3 mb-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span class="text-sm font-medium dark:text-white">৳ {{ subtotal.toFixed(2) }}</span>
                            </div>

                            <!-- Discount -->
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Discount</span>
                                    <div class="relative w-16">
                                        <input type="number" v-model.number="discount" min="0" :max="subtotal"
                                            @input="handleGlobalDiscountInput($event)"
                                            class="w-full h-7 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                                        <span
                                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">৳</span>
                                    </div>
                                </div>
                                <span class="text-sm font-medium dark:text-white">৳ {{ globalDiscountAmount.toFixed(2)
                                }}</span>
                            </div>

                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Total Discount</span>
                                <span class="text-sm font-medium text-green-600 dark:text-green-400">- ৳ {{
                                    totalDiscount.toFixed(2) }}</span>
                            </div>

                            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-gray-900 dark:text-white">Total Payable</span>
                                    <span class="text-xl font-bold text-blue-600 dark:text-blue-400">৳ {{
                                        total.toFixed(2) }}</span>
                                </div>
                            </div>

                            <!-- Advance Paid Amount -->
                            <div class="flex justify-between items-center pt-2">
                                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Advance Paid</span>
                                <div class="relative w-32">
                                    <input type="number" v-model="paidAmount" @input="validatePaidAmount" min="0"
                                        :max="total" placeholder="0.00"
                                        class="w-full px-2 py-1 text-right border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                                    <span
                                        class="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">৳</span>
                                </div>
                            </div>

                            <!-- Due/Change -->
                            <div class="flex justify-between items-center pt-1">
                                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {{ changeDue > 0 ? 'Change Due' : 'Due Amount' }}
                                </span>
                                <span class="text-sm font-semibold" :class="{
                                    'text-green-600 dark:text-green-400': changeDue > 0,
                                    'text-red-600 dark:text-red-400': dueAmount > 0,
                                    'text-gray-600 dark:text-gray-400': dueAmount === 0 && changeDue === 0
                                }">
                                    ৳ {{ changeDue > 0 ? changeDue.toFixed(2) : dueAmount.toFixed(2) }}
                                </span>
                            </div>

                            <!-- Payment method section -->
                            <div v-if="paidAmount > 0"
                                class="flex flex-row justify-between pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <label
                                        class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Account</label>
                                </div>
                                <div>
                                    <div class="relative">
                                        <select v-model="payment_method_id" @change="validatePaymentMethod"
                                            class="w-[125px] px-3 py-1.5 pl-10 cursor-pointer text-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all">
                                            <option value="">Select Account</option>
                                            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-auto grid grid-cols-2 gap-3 pt-4">
                            <button @click="resetCart"
                                class="px-3 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm"
                                :class="{ 'opacity-50 cursor-not-allowed': cartItems.length === 0 }"
                                :disabled="cartItems.length === 0">
                                <i class="fas fa-trash-alt"></i>
                                <span>Clear All</span>
                            </button>
                            <button @click="processOrder"
                                class="px-3 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                                :disabled="cartItems.length === 0 || !isValidSelection || orderStore.loading"
                                :class="{ 'opacity-50 cursor-not-allowed': cartItems.length === 0 || !isValidSelection }">
                                <i class="fas fa-file-alt"></i>
                                <span>{{ orderStore.loading ? 'Processing...' : 'Create Order' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Product Browser Modal -->
    <BaseModal v-if="showItemModal" :show="showItemModal" title="Select Products" maxWidth="5xl"
        @close="showItemModal = false">
        <div class="flex flex-col h-full">
            <!-- Search -->
            <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="relative">
                    <input type="text" v-model="productSearch" @input="searchProducts" @keyup.enter="searchProducts"
                        placeholder="Search by product name, SKU, or barcode..."
                        class="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        ref="itemSearchInput">
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search"></i>
                    </div>
                    <button v-if="productSearch" @click="clearProductSearch"
                        class="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Product List -->
            <div class="flex-grow overflow-y-auto p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="product in products" :key="product.id"
                        class="relative border rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-500 cursor-pointer bg-white dark:bg-gray-800"
                        :class="getProductCartCount(product.id) > 0 ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'"
                        @click="product.variant_packages?.length > getProductCartCount(product.id) ? handleProductSelect(product) : null">
                        <!-- Selected quantity badge -->
                        <div v-if="getProductCartCount(product.id) > 0"
                            class="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 flex items-center justify-center z-10 px-2">
                            Selected
                        </div>
                        <div class="flex gap-3">
                            <div
                                class="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img :src="product.image_url || product.variant_packages?.[0]?.image_url"
                                    :alt="product.name" class="w-full h-full object-cover"
                                    v-if="product.image_url || product.variant_packages?.[0]?.image_url">
                                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                                    <i class="fas fa-box text-2xl"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">{{ product.name }}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">SKU: {{ product.sku }}</p>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {{ product.variant_packages?.length || 0 }} Packages Available
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loadingProducts" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                </div>

                <!-- Empty State -->
                <div v-if="products.length === 0 && !loadingProducts" class="text-center py-12">
                    <i class="fas fa-box-open text-5xl text-gray-300 dark:text-gray-600 mb-3"></i>
                    <p class="text-gray-500 dark:text-gray-400">No products found</p>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalProducts > 0"
                class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">Showing {{ products.length }} of {{ totalProducts
                }} items</span>
                <div class="flex gap-2">
                    <button @click="prevProductPage" :disabled="currentProductPage === 1"
                        class="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Previous
                    </button>
                    <button @click="nextProductPage" :disabled="currentProductPage === lastProductPage"
                        class="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </BaseModal>

    <!-- Raw Material Browser Modal -->
    <BaseModal v-if="showRawMaterialModal" :show="showRawMaterialModal" title="Select Raw Materials" maxWidth="5xl"
        @close="showRawMaterialModal = false">
        <div class="flex flex-col h-full">
            <!-- Search -->
            <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="relative">
                    <input type="text" v-model="rawMaterialSearch" @input="searchRawMaterials"
                        @keyup.enter="searchRawMaterials" placeholder="Search raw materials by name..."
                        class="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        ref="rawMaterialSearchInput">
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search"></i>
                    </div>
                    <button v-if="rawMaterialSearch" @click="clearRawMaterialSearch"
                        class="absolute right-3 top-2.5 text-gray-400 hover:text-green-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Raw Material List -->
            <div class="flex-grow overflow-y-auto p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="material in rawMaterials" :key="material.id"
                        class="relative border rounded-lg p-3 hover:shadow-md transition-all hover:border-green-500 cursor-pointer bg-white dark:bg-gray-800"
                        :class="getRawMaterialCartCount(material.id) > 0 ? 'border-green-600' : 'border-gray-200 dark:border-gray-700'"
                        @click="handleRawMaterialSelect(material)">
                        <!-- Selected badge -->
                        <div v-if="getRawMaterialCartCount(material.id) > 0"
                            class="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 flex items-center justify-center z-10 px-2">
                            Added
                        </div>
                        <div class="flex gap-3">
                            <div
                                class="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                                <i class="fas fa-flask text-2xl text-green-600 dark:text-green-400"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">{{ material.name }}
                                </h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    Unit: {{ material.measurement_unit?.name || '-' }}
                                    ({{ material.measurement_unit?.symbol || '-' }})
                                </p>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-sm font-bold text-green-600 dark:text-green-400">
                                        Cost: ৳ {{ Number(material.standard_cost || 0).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loadingRawMaterials" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-green-500"></i>
                </div>

                <!-- Empty State -->
                <div v-if="rawMaterials.length === 0 && !loadingRawMaterials" class="text-center py-12">
                    <i class="fas fa-flask text-5xl text-gray-300 dark:text-gray-600 mb-3"></i>
                    <p class="text-gray-500 dark:text-gray-400">No raw materials found</p>
                </div>
            </div>
        </div>
    </BaseModal>

    <!-- Confirmation Modal -->
    <BaseModal v-if="showConfirmModal" :show="showConfirmModal" title="Confirm Purchase Order" maxWidth="4xl"
        @close="showConfirmModal = false">
        <div class="flex flex-col h-full">
            <!-- Items Table -->
            <div class="flex-grow overflow-y-auto p-4">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Item
                            </th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                Type / Package</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Unit
                                Price</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                Discount</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Qty
                            </th>
                            <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        <tr v-for="(item, index) in cartItems" :key="index">
                            <td class="px-3 py-2">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                                        <img :src="item.image_url" class="w-full h-full object-cover"
                                            v-if="item.image_url">
                                        <i v-else
                                            :class="item.item_type === 'raw_material' ? 'fas fa-flask text-green-600' : 'fas fa-box text-gray-400'"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-sm dark:text-white">{{ item.name }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ item.item_type === 'raw_material' ? 'Raw Material' : item.sku }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">
                                <template v-if="item.item_type === 'product'">
                                    {{ getSelectedVariantPackageName(item) }}
                                </template>
                                <template v-else>
                                    {{ item.measurement_unit?.symbol || '-' }}
                                </template>
                            </td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">৳ {{
                                item.unit_price?.toFixed(2) }}</td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">৳ {{
                                item.discount_amount?.toFixed(2) }}</td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">{{ item.quantity }}</td>
                            <td class="px-3 py-2 text-right text-sm font-medium dark:text-white">৳ {{
                                getItemTotal(item).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right font-semibold dark:text-white">Subtotal:</td>
                            <td class="px-3 py-2 text-right dark:text-white">৳ {{ subtotal.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right text-sm dark:text-white">Item Total Discount:
                            </td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-green-400"> ৳ {{
                                cartItems.map(item => item.discount_amount).reduce((acc, curr) => acc + curr,
                                    0).toFixed(2)}}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right text-sm dark:text-white">Additional Discount:
                            </td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-red-400">
                                ৳ {{ discount }}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right text-sm dark:text-white">Total Discount:</td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-green-400"> ৳ {{
                                totalDiscount.toFixed(2) }}</td>
                        </tr>
                        <tr class="border-t border-gray-300 dark:border-gray-600">
                            <td colspan="5" class="px-3 py-2 text-right font-bold text-lg dark:text-white">Total:</td>
                            <td class="px-3 py-2 text-right text-xl font-bold text-blue-600 dark:text-blue-400">৳ {{
                                total.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right dark:text-white">Advance Paid:</td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-green-400">৳ {{
                                paidAmount.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="px-3 py-2 text-right font-medium dark:text-white">
                                {{ changeDue > 0 ? 'Change Due:' : 'Due:' }}
                            </td>
                            <td class="px-3 py-2 text-right font-semibold"
                                :class="changeDue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                ৳ {{ changeDue > 0 ? changeDue.toFixed(2) : dueAmount.toFixed(2) }}
                            </td>
                        </tr>
                        <tr class="bg-blue-50/50 dark:bg-blue-900/10">
                            <td colspan="5"
                                class="px-3 py-2 text-right text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                                Payment Method:
                            </td>
                            <td
                                class="px-3 py-2 text-right text-sm font-bold text-blue-700 dark:text-blue-300 capitalize">
                                {{ payment_method_name }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Form Actions -->
            <div
                class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex justify-end gap-3">
                <button type="button" @click="showConfirmModal = false"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="submitOrder" :disabled="loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                ]">
                    <span v-if="loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                    </span>
                    <span v-else>Confirm Order</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Success Modal -->
    <BaseModal v-if="showSuccessModal" :show="showSuccessModal" title="Purchase Order Successful" maxWidth="md"
        :showClose="false" @close="showSuccessModal = false">
        <div class="flex flex-col items-center p-6 text-center">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-check-circle text-4xl text-green-600 dark:text-green-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order Successful!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Purchase order has been created successfully.</p>
            <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg mb-6 w-full">
                <p class="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                <p class="font-medium text-gray-900 dark:text-white"># {{ lastOrderData?.order_no || 'N/A' }}</p>
            </div>
            <div class="flex justify-end space-x-3 w-full">
                <button @click="closeSuccessModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Close
                </button>
                <button @click="printOrder(lastOrderData?.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-print mr-2"></i>Print Order
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Supplier Create Modal -->
    <BaseModal v-if="showSupplierCreateModal" :show="showSupplierCreateModal" title="Create New Supplier" maxWidth="md"
        @close="showSupplierCreateModal = false">
        <form @submit.prevent="createSupplier" class="px-6 py-3">
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <input v-model="newSupplier.company" type="text" placeholder="Enter company name"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
                            class="text-xs text-red-500"> *</span></label>
                    <input v-model="newSupplier.name" type="text" placeholder="Enter Name"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone </label>
                    <input v-model="newSupplier.phone" type="text" placeholder="Enter Phone"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input v-model="newSupplier.email" type="email" placeholder="Enter Email"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea v-model="newSupplier.address" rows="2" placeholder="Enter Address"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"></textarea>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" @click="showSupplierCreateModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="creatingSupplier" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                        creatingSupplier ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="creatingSupplier">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            Creating...
                        </span>
                        <span v-else>Create Supplier</span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import FlatPickr from 'vue-flatpickr-component'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import { useSupplierStore } from '@/stores/supplierStore'
import { useOrderStore } from '@/stores/orderStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import TextEditorInput from '@/components/common/TextEditorInput.vue'
import { useCashBankAccountStore } from '@/stores/cashBankAccountStore.js'

const cashBankAccountStore = useCashBankAccountStore()
const accounts = computed(() => {
    const items = cashBankAccountStore.items || []
    return items.map(item => ({
        id: item.id,
        name: item.account_name || item.name
    })).filter(item => item !== undefined && item !== null)
})

// Stores
const supplierStore = useSupplierStore()
const orderStore = useOrderStore()
const warehouseStore = useWarehouseStore()
const toast = useToast()
const loading = ref(false)

// Computed store items
const supplierStoreItems = computed(() => {
    const items = supplierStore.items || []
    return items.filter(item => item !== undefined && item !== null)
})

const warehouseStoreItems = computed(() => {
    const items = warehouseStore.items || []
    return items.filter(item => item !== undefined && item !== null)
})

// Flatpickr config
const config = {
    enableTime: false,
    dateFormat: "Y-m-d",
    defaultDate: new Date()
}

const formData = ref({
    supplier_id: null,
    warehouse_id: null,
    expected_date: null,
})

const payment_method_id = ref('')
const paymentErrors = ref({})

// Reactive state
const order_date = ref(new Date())
const cartItems = ref([])
let cartIdCounter = 0

// Supplier
const selectedSupplier = ref(null)
const showSupplierCreateModal = ref(false)
const creatingSupplier = ref(false)
const newSupplier = ref({
    company: '',
    name: '',
    phone: '',
    email: '',
    address: ''
})

// Warehouse
const selectedWarehouse = ref(null)

// Products
const products = ref([])
const productSearch = ref('')
const loadingProducts = ref(false)
const totalProducts = ref(0)
const currentProductPage = ref(1)
const lastProductPage = ref(1)
const showItemModal = ref(false)
const itemSearchInput = ref(null)

// Raw Materials
const showRawMaterialModal = ref(false)
const rawMaterials = ref([])
const rawMaterialSearch = ref('')
const loadingRawMaterials = ref(false)
const rawMaterialSearchInput = ref(null)

// Payment/Order summary
const paidAmount = ref(0)
const discount = ref(0)

const globalDiscountAmount = computed(() => {
    return discount.value || 0
})

// Modals
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const notes = ref('')

// Submit
const lastOrderData = ref(null)

// Computed
const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
})

const totalDiscount = computed(() => {
    const itemDiscount = cartItems.value.reduce((sum, item) => sum + (item.discount_amount || 0), 0)
    return itemDiscount + globalDiscountAmount.value
})

const total = computed(() => {
    return subtotal.value - totalDiscount.value
})

const dueAmount = computed(() => {
    return Math.max(0, total.value - paidAmount.value)
})

const changeDue = computed(() => {
    return Math.max(0, paidAmount.value - total.value)
})

const isValidSelection = computed(() => {
    return !!formData.value.supplier_id
})

const payment_method_name = computed(() => {
    const account = accounts.value.find(acc => acc.id === payment_method_id.value)
    return account ? account.name : ''
})

// Methods
const formatVariantPackageLabel = (pkg) => {
    if (!pkg) return '-'
    const variant = pkg.variant_name || ''
    const pack = pkg.package_name || ''
    const pieces = pkg.pieces_per_package ? `${pkg.pieces_per_package} pcs` : ''
    return [variant, pack, pieces].filter(Boolean).join(' - ') || `ID: ${pkg.id}`
}

const getSelectedVariantPackageName = (item) => {
    const selected = item.variant_packages?.find(pkg => Number(pkg.id) === Number(item.variant_package_id))
    if (!selected) return '-'
    const variant = selected.variant_name || ''
    const pack = selected.package_name || ''
    const pieces = selected.pieces_per_package ? `${selected.pieces_per_package} pcs` : ''
    return [variant, pack, pieces].filter(Boolean).join(' - ') || `ID: ${selected.id}`
}

const getSelectedVariantPackageIds = (excludeIndex = -1) => {
    return cartItems.value
        .filter((_, idx) => idx !== excludeIndex && cartItems.value[idx].item_type === 'product')
        .map(row => Number(row.variant_package_id))
        .filter(Boolean)
}

const getAvailableVariantPackages = (item, index) => {
    const selectedIds = getSelectedVariantPackageIds(index)
    return (item.variant_packages || []).filter(pkg => {
        const currentSelected = Number(item.variant_package_id)
        return !selectedIds.includes(Number(pkg.id)) || Number(pkg.id) === currentSelected
    })
}

const onVariantPackageChange = (index, selectedId) => {
    const item = cartItems.value[index]
    item.variant_package_id = selectedId ? Number(selectedId) : ''
    item.error = null
    updateCartItemTotal(item)
}

const getItemTotal = (item) => {
    return (item.unit_price || 0) * (item.quantity || 0) - (item.discount_amount || 0)
}

const updateCartItemTotal = (item) => {
    item.total = getItemTotal(item)
}

const handleDiscountInput = (event, index) => {
    const value = Number(event.target.value || 0)
    const item = cartItems.value[index]

    if (item) {
        const itemMaxDiscount = (item.unit_price || 0) * (item.quantity || 0)

        const otherItemsDiscount = cartItems.value.reduce((sum, currItem, idx) => {
            return idx !== index ? sum + (currItem.discount_amount || 0) : sum
        }, 0)

        const globalDisc = Number(discount.value || 0)
        const remainingForThisItem = subtotal.value - otherItemsDiscount - globalDisc

        const maxAllowed = Math.min(itemMaxDiscount, Math.max(0, remainingForThisItem))

        if (value > maxAllowed) {
            toast.warning(`Discount cannot exceed ${maxAllowed.toFixed(2)}`)
            item.discount_amount = maxAllowed
            event.target.value = maxAllowed
        } else if (value < 0) {
            toast.warning(`Discount cannot be negative`)
            item.discount_amount = 0
            event.target.value = 0
        } else {
            item.discount_amount = value
        }

        updateCartItemTotal(item)
    }
}

const handleGlobalDiscountInput = (event) => {
    const value = Number(event.target.value || 0)
    const maxDiscount = subtotal.value

    const cartItemsDiscount = cartItems.value.reduce((sum, item) => sum + (item.discount_amount || 0), 0)

    if (cartItemsDiscount >= maxDiscount) {
        toast.warning(`Cart items discount has already reached the maximum limit`)
        event.target.value = 0
        discount.value = 0
        return
    }

    const availableGlobalDiscount = maxDiscount - cartItemsDiscount

    if (value > availableGlobalDiscount) {
        toast.warning(`Global discount cannot exceed ${availableGlobalDiscount.toFixed(2)}`)
        discount.value = availableGlobalDiscount
        event.target.value = availableGlobalDiscount
    } else if (value < 0) {
        toast.warning(`Global discount cannot be negative`)
        discount.value = 0
        event.target.value = 0
    } else {
        discount.value = value
        event.target.value = value
    }
}

const formatDateForAPI = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split('T')[0]
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
    return d.toISOString().split('T')[0]
}

const clearValidationError = (fieldName) => {
    if (orderStore.validationErrors && orderStore.validationErrors[fieldName]) {
        const updatedErrors = { ...orderStore.validationErrors }
        delete updatedErrors[fieldName]
        orderStore.validationErrors = updatedErrors
    }
}

// Open product browser
const openProductBrowser = () => {
    showItemModal.value = true
}

// Open raw material browser
const openRawMaterialBrowser = () => {
    showRawMaterialModal.value = true
}

// Create supplier
const createSupplier = async () => {
    if (!newSupplier.value.name) {
        toast.warning('Please enter supplier name')
        return
    }
    if (!newSupplier.value.company) {
        toast.warning('Please enter company name')
        return
    }

    creatingSupplier.value = true
    try {
        const response = await axiosClient.post('/suppliers', newSupplier.value)
        if (response.data.status === 200 || response.data.status === 201) {
            toast.success('Supplier created successfully')
            selectedSupplier.value = response.data.data
            formData.value.supplier_id = response.data.data.id
            showSupplierCreateModal.value = false
            newSupplier.value = { company: '', name: '', phone: '', email: '', address: '' }
            await supplierStore.getAll()
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create supplier')
    } finally {
        creatingSupplier.value = false
    }
}

const openSupplierCreateModal = () => {
    newSupplier.value = { company: '', name: '', phone: '', email: '', address: '' }
    showSupplierCreateModal.value = true
}

// Product search
const searchProducts = async () => {
    const defaultWarehouse = warehouseStore.items?.find(item => item.is_default === 1 || item.is_default === true)
    const warehouseId = defaultWarehouse?.id || 1

    loadingProducts.value = true
    try {
        const params = {
            page: currentProductPage.value,
            per_page: 20,
            search: productSearch.value,
            is_active: 1,
            from_location_id: warehouseId,
            from_location_type: 'warehouse',
            order: 1
        }
        const response = await axiosClient.get('/products/by-warehouse', { params })
        products.value = response?.data?.data?.data || []
        totalProducts.value = response?.data?.data?.meta?.total || 0
        lastProductPage.value = response?.data?.data?.meta?.last_page || 1
    } catch (e) {
        console.error(e)
        toast.error('Failed to load products')
    } finally {
        loadingProducts.value = false
    }
}

const clearProductSearch = () => {
    productSearch.value = ''
    searchProducts()
}

const nextProductPage = () => {
    if (currentProductPage.value < lastProductPage.value) {
        currentProductPage.value++
        searchProducts()
    }
}

const prevProductPage = () => {
    if (currentProductPage.value > 1) {
        currentProductPage.value--
        searchProducts()
    }
}

const getProductCartCount = (productId) => {
    return cartItems.value
        .filter(i => i.id === productId && i.item_type === 'product')
        .reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0)
}

const handleProductSelect = (product) => {
    addProductToCart(product)
}

// Add product to cart
const addProductToCart = (product) => {
    cartIdCounter++

    const variantPackages = Array.isArray(product.variant_packages) ? product.variant_packages : []
    const usedIds = getSelectedVariantPackageIds(-1)
    const selectedFromApi = variantPackages.find(pkg => Number(pkg.selected) === 1)
    const firstAvailable = variantPackages.find(pkg => !usedIds.includes(Number(pkg.id)))
    const defaultPackage = selectedFromApi || firstAvailable

    const newItem = {
        cart_id: cartIdCounter,
        item_type: 'product',
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit_price: Number(defaultPackage?.purchase_price || defaultPackage?.dealer_price || 0),
        quantity: 1,
        discount_amount: 0,
        image_url: product.image_url || null,
        variant_packages: variantPackages,
        variant_package_id: defaultPackage?.id || '',
        total: 0,
        error: null
    }
    newItem.total = getItemTotal(newItem)
    cartItems.value.push(newItem)
}

// ==================== RAW MATERIAL METHODS ====================

const searchRawMaterials = async () => {
    loadingRawMaterials.value = true
    try {
        const params = {
            search: rawMaterialSearch.value,
        }
        const response = await axiosClient.get('/raw-materials/all', { params })
        let data = response?.data?.data?.data || response?.data?.data || []
        if (rawMaterialSearch.value) {
            const search = rawMaterialSearch.value.toLowerCase()
            data = data.filter(m => m.name?.toLowerCase().includes(search))
        }
        rawMaterials.value = data
    } catch (e) {
        console.error(e)
        toast.error('Failed to load raw materials')
    } finally {
        loadingRawMaterials.value = false
    }
}

const clearRawMaterialSearch = () => {
    rawMaterialSearch.value = ''
    searchRawMaterials()
}

const getRawMaterialCartCount = (materialId) => {
    return cartItems.value
        .filter(i => i.id === materialId && i.item_type === 'raw_material')
        .reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0)
}

const handleRawMaterialSelect = (material) => {
    // Check if this raw material already exists in cart
    const existingItem = cartItems.value.find(
        item => item.item_type === 'raw_material' && Number(item.id) === Number(material.id)
    )

    if (existingItem) {
        // Increment quantity of existing item instead of adding duplicate
        const current = parseInt(existingItem.quantity, 10) || 0
        if (current < 999999) {
            existingItem.quantity = current + 1
            existingItem.error = null
            updateCartItemTotal(existingItem)
        }
        return
    }

    addRawMaterialToCart(material)
}

const addRawMaterialToCart = (material) => {
    cartIdCounter++

    const newItem = {
        cart_id: cartIdCounter,
        item_type: 'raw_material',
        id: material.id,
        name: material.name,
        sku: null,
        unit_price: Number(material.standard_cost || 0),
        quantity: 1,
        discount_amount: 0,
        image_url: material.image_path || null,
        measurement_unit: material.measurement_unit || null,
        variant_packages: [],
        variant_package_id: null,
        total: 0,
        error: null
    }
    newItem.total = getItemTotal(newItem)
    cartItems.value.push(newItem)
}

// ==================== CART OPERATIONS ====================

const increaseQty = (index) => {
    const item = cartItems.value[index]
    const current = parseInt(item.quantity, 10) || 0
    if (current < 999999) {
        item.quantity = current + 1
        item.error = null
    }
}

const decreaseQty = (index) => {
    const item = cartItems.value[index]
    const current = parseInt(item.quantity, 10) || 0
    if (current > 1) {
        item.quantity = current - 1
        item.error = null
    }
}

const handleQtyInput = (event, index) => {
    let value = event.target.value

    if (value === '') {
        cartItems.value[index].quantity = ''
        return
    }

    value = value.replace(/[^0-9]/g, '')

    if (value === '') {
        cartItems.value[index].quantity = ''
        event.target.value = ''
        return
    }

    let parsedValue = parseInt(value)

    if (parsedValue < 0) parsedValue = 0
    if (parsedValue > 999999) parsedValue = 999999

    cartItems.value[index].quantity = value
    event.target.value = value
    cartItems.value[index].error = null
}

const handleQtyChange = (event, index) => {
    const item = cartItems.value[index]
    item.error = null
}

const removeItem = (index) => {
    cartItems.value.splice(index, 1)
}

const resetCart = () => {
    if (cartItems.value.length > 0) {
        cartItems.value = []
        paidAmount.value = 0
        discount.value = 0
        payment_method_id.value = ''
        paymentErrors.value = {}
        cartIdCounter = 0
    }
}

const closeSuccessModal = () => {
    showSuccessModal.value = false
    resetCart()
}

watch(showSuccessModal, (newValue = false) => {
    if (!newValue) {
        resetCart()
    }
})

// Validate paid amount
const validatePaidAmount = () => {
    if (paidAmount.value > total.value) {
        paidAmount.value = total.value
    }
    if (paidAmount.value < 0) {
        paidAmount.value = 0
    }
}

const validatePaymentMethod = () => {
    paymentErrors.value = {}
    if (paidAmount.value > 0 && payment_method_id.value === '') {
        toast.warning('Please select an account')
    }
}

const validatePaymentFields = () => {
    paymentErrors.value = {}
    let isValid = true

    if (paidAmount.value > 0 && !payment_method_id.value) {
        paymentErrors.value.payment_method_id = 'Please select an account'
        isValid = false
        toast.warning('Please select an account before submitting')
    }

    return isValid
}

// Process order
const processOrder = () => {
    if (cartItems.value.length === 0) {
        toast.warning('Please add items to cart')
        return
    }

    if (!isValidSelection.value) {
        toast.warning('Please select a supplier')
        return
    }

    const invalidItems = cartItems.value.filter(item => !item.unit_price || item.unit_price <= 0)
    if (invalidItems.length > 0) {
        toast.warning('Please set valid unit prices for all items')
        return
    }

    const zeroOrEmptyQtyItems = cartItems.value.filter(item => !item.quantity || parseInt(item.quantity) <= 0)
    if (zeroOrEmptyQtyItems.length > 0) {
        toast.warning('Quantity 0 is not allowed. Please enter a valid quantity.')
        return
    }

    const missingVariantItems = cartItems.value.filter(item => item.item_type === 'product' && !item.variant_package_id)
    if (missingVariantItems.length > 0) {
        toast.warning('Please select variant package for all product items')
        return
    }

    if (!validatePaymentFields()) {
        return
    }

    showConfirmModal.value = true
}

// Submit order
const submitOrder = async () => {
    if (loading.value) return

    if (!validatePaymentFields()) {
        toast.warning('Please select an account before submitting')
        return
    }

    const missingVariantItems = cartItems.value.filter(item => item.item_type === 'product' && !item.variant_package_id)
    if (missingVariantItems.length > 0) {
        toast.warning('Please select variant package for all product items')
        return
    }

    loading.value = true

    try {
        const lines = cartItems.value.map(item => {
            if (item.item_type === 'raw_material') {
                return {
                    item_type: 'App\\Models\\RawMaterial',
                    item_id: item.id,
                    qty_ordered: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    discount_amount: item.discount_amount || 0,
                }
            }
            // Product
            const selectedPkg = item.variant_packages?.find(
                pkg => Number(pkg.id) === Number(item.variant_package_id)
            )
            return {
                item_type: 'App\\Models\\Product',
                item_id: item.id,
                variant_id: selectedPkg?.variant_id || null,
                variant_package_id: Number(item.variant_package_id),
                qty_ordered: Number(item.quantity),
                unit_price: Number(item.unit_price),
                discount_amount: item.discount_amount || 0,
            }
        })

        const payload = {
            supplier_id: formData.value.supplier_id,
            warehouse_id: formData.value.warehouse_id,
            order_date: formatDateForAPI(order_date.value),
            expected_date: formData.value.expected_date ? formatDateForAPI(formData.value.expected_date) : null,
            discount_amount: discount.value,
            advance_paid_amount: paidAmount.value,
            notes: notes.value,
            payment_method_id: payment_method_id.value || null,
            lines: lines,
        }

        const response = await axiosClient.post('/purchase-orders', payload)

        if (response.data.status === 200 || response.data.status === 201) {
            toast.success('Purchase order created successfully')
            lastOrderData.value = response.data.data
            showConfirmModal.value = false
            showSuccessModal.value = true
        } else {
            toast.error(response.data.message || 'Failed to create purchase order')
        }
        loading.value = false
    } catch (error) {
        console.error('Submit error:', error)
        loading.value = false
        const errorData = error.response?.data

        if (errorData?.errors) {
            cartItems.value.forEach(item => {
                item.error = null
            })

            if (errorData.errors.lines && Array.isArray(errorData.errors.lines)) {
                errorData.errors.lines.forEach((errorMsg) => {
                    const itemIdMatch = errorMsg.match(/item ID:? (\d+)/i) ||
                        errorMsg.match(/item "([^"]+)" [^:]*ID:? (\d+)/)

                    if (itemIdMatch) {
                        const itemId = parseInt(itemIdMatch[1])
                        const cartItem = cartItems.value.find(item =>
                            Number(item.id) === itemId
                        )
                        if (cartItem) {
                            cartItem.error = errorMsg
                        }
                    } else {
                        const firstItem = cartItems.value.find(item =>
                            item.quantity > 0 && !item.error
                        )
                        if (firstItem) {
                            firstItem.error = errorMsg
                        }
                    }
                })
            }

            toast.error(errorData.message || 'Validation failed')
        } else {
            toast.error(errorData?.message || 'Failed to create purchase order')
        }
    }
}

// Print order
const printOrder = (orderId) => {
    if (!orderId) {
        toast.error('Invalid order ID for printing')
        return
    }

    axiosClient.get(`/purchase-orders/${orderId}/download-pdf`, { responseType: 'blob' })
        .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = url
            document.body.appendChild(iframe)
            iframe.onload = () => {
                iframe.contentWindow.print()
            }
        })
        .catch((error) => {
            console.error('Error printing order:', error)
            toast.error('Failed to print order')
        })
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        supplierStore.getAll(),
        warehouseStore.getAll(),
        cashBankAccountStore.getAll()
    ])
})

// Watch for modal open to load products
watch(() => showItemModal.value, (newVal) => {
    if (newVal) {
        currentProductPage.value = 1
        searchProducts()
    }
})

// Watch for raw material modal open
watch(() => showRawMaterialModal.value, (newVal) => {
    if (newVal) {
        searchRawMaterials()
        setTimeout(() => {
            if (rawMaterialSearchInput.value) {
                rawMaterialSearchInput.value.focus()
            }
        }, 100)
    }
})

// Watch on change Supplier option
watch(() => formData.value.supplier_id, (newVal) => {
    const matchedSupplier = supplierStoreItems.value.find(s => s.id === newVal)
    if (matchedSupplier) {
        selectedSupplier.value = matchedSupplier
    } else {
        selectedSupplier.value = null
    }
})

// Watch on change warehouse option
watch(() => formData.value.warehouse_id, (newVal) => {
    const matchedWarehouse = warehouseStoreItems.value.find(warehouse => warehouse.id === newVal)
    if (matchedWarehouse) {
        selectedWarehouse.value = matchedWarehouse
    } else {
        selectedWarehouse.value = null
    }
})
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>