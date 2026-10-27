<template>
    <div class="mb-0">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                    Order Sheet Edit</h1>
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
                        <!-- Order Sheet For Dropdown -->
                        <div class="w-full">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Order Sheet For <span class="text-xs text-red-500 dark:text-red-500"> *</span>
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="orderSheetFor" @change="onOrderSheetForChange"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all cursor-pointer">
                                    <option value="dealer">Customer</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-building"></i>
                                </div>
                            </div>
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

                        <!-- Customer dropdown -->
                        <div class="w-full" v-if="orderSheetFor === 'dealer'">
                            <SearchSelect v-model="formData.dealer_id" :options="dealerStoreItems"
                                :selected-item="selectedDealer" label="Customer" placeholder="--Select Customer--"
                                :error="orderStore.validationErrors?.dealer_id" required
                                @change="clearValidationError('dealer_id')" />
                        </div>

                        <!-- Warehouse dropdown -->
                        <div class="w-full" v-if="orderSheetFor === 'warehouse'">
                            <SearchSelect v-model="formData.warehouse_id" :options="warehouseStoreItems"
                                :selected-item="selectedWarehouse" label="Warehouse" placeholder="--Select Warehouse--"
                                :error="orderStore.validationErrors?.warehouse_id" required
                                @change="clearValidationError('warehouse_id')" />
                        </div>

                        <div class="">
                            <button @click="showItemModal = true"
                                class="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                                <i class="fas fa-layer-group text-lg"></i>
                                <span class="font-medium">Browse Products</span>
                            </button>
                        </div>

                        <!-- Delivery Date -->
                        <!-- <div class="w-full">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Delivery Date
                            </label>
                            <div class="relative flex items-center">
                                <flat-pickr v-model="delivery_date" :config="config"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all" />
                                <div class="absolute left-4 text-gray-400">
                                    <i class="far fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div> -->
                    </div>

                    <div class="grid grid-cols-1 xl:grid-cols-1 items-center justify-center gap-4 mb-6">
                        <!-- Barcode Scanner -->
                        <!-- <div class="w-full col-span-3 xl:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Scan QR/Barcode
                            </label>
                            <div class="relative flex items-center">
                                <input type="text" v-model="barcodeInput" @keyup.enter="handleBarcodeScan"
                                    placeholder="Scan or enter product barcode"
                                    class="w-full px-3 py-2 pl-12 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all text-lg"
                                    ref="barcodeInputRef">
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-qrcode text-xl"></i>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Scan product barcode to add to cart
                            </p>
                        </div> -->

                        <!-- Browse Items Button -->
                        
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

                        <div v-if="loadingOrder" class="flex justify-center py-12">
                            <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                        </div>

                        <div v-else class="overflow-y-auto flex-1">
                            <!-- Cart Header -->
                            <div v-if="cartItems.length > 0"
                                class="grid grid-cols-12 gap-2 mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                                <div class="col-span-3">Product</div>
                                <div class="col-span-3 text-center">Variant Package</div>
                                <div class="col-span-2 text-center">Price</div>
                                <div class="col-span-2 text-center">Qty</div>
                                <div class="col-span-2 text-right">Total</div>
                            </div>

                            <!-- Cart Items List -->
                            <div v-for="(item, index) in cartItems" :key="item.cart_id"
                                class="grid grid-cols-12 gap-2 px-3 py-2 mb-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-100 hover:shadow-sm transition-all relative group">

                                <!-- Product Column -->
                                <div @click="openProductDetailModal(index)"
                                    class="col-span-3 hover:cursor-pointer flex items-center gap-3">
                                    <div
                                        class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover"
                                            v-if="item.image_url">
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-400">
                                            <i class="fas fa-box text-xl"></i>
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h4 class="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                            {{ item.name }}</h4>
                                    </div>
                                </div>

                                <!-- Variant Package Column -->
                                <div class="col-span-3 flex items-center justify-center">
                                    <select v-model="item.variant_package_id"
                                        @change="onVariantPackageChange(index, item.variant_package_id)"
                                        class="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white text-center">
                                        <option value="">Select Package</option>
                                        <option v-for="pkg in getAvailableVariantPackages(item, index)" :key="pkg.id"
                                            :value="pkg.id">
                                            {{ formatVariantPackageLabel(pkg) }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Price Column -->
                                <div class="col-span-2 flex items-center justify-center">
                                    <div class="relative w-full max-w-[100px]">
                                        <input type="number" v-model="item.selling_price"
                                            @input="updateCartItemTotal(item)"
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
                                            class="w-[90px] pl-2 py-1 -mx-5 z-5 text-center text-sm font-medium dark:text-white bg-gray-100 dark:bg-gray-700 
                                        border border-gray-100 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-200" />
                                        <button @click="increaseQty(index)"
                                            class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Total Column -->
                                <div class="col-span-2 flex flex-col justify-center items-end">
                                    <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        ৳ {{ getItemTotal(item).toFixed(2) }}
                                    </span>
                                </div>

                                <!-- Remove Button -->
                                <button @click="removeItem(index)"
                                    class="absolute -top-2 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-25 group-hover:opacity-50 hover:opacity-100 transition-opacity shadow-md hover:bg-red-600">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>

                            <!-- Empty Cart -->
                            <div v-if="cartItems.length === 0 && !loadingOrder"
                                class="flex flex-col items-center justify-center py-12 text-gray-400 min-h-[40vh]">
                                <i class="fas fa-shopping-cart text-4xl mb-3"></i>
                                <p class="text-sm">No items in cart. Scan barcodes or browse products to add.</p>
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
                    <!-- Dealer/Warehouse Info -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-md font-semibold text-gray-900 dark:text-white">
                                {{ orderSheetFor === 'dealer' ? 'Customer' : 'Warehouse' }} Information
                            </h3>
                            <button v-if="orderSheetFor === 'dealer'" @click="openDealerCreateModal"
                                class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                <i class="fas fa-plus-circle mr-1"></i> New
                            </button>
                        </div>

                        <!-- Selected Dealer -->
                        <div v-if="orderSheetFor === 'dealer' && selectedDealer"
                            class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex-shrink-0 h-12 w-12 bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-sm">
                                    <img :src="selectedDealer.avatar_url || 'https://ui-avatars.com/api/?name=' + selectedDealer.name"
                                        :alt="selectedDealer.name" class="h-full w-full object-cover">
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ selectedDealer.name }}
                                    </h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedDealer.phone_no }}
                                    </p>
                                    <p v-if="selectedDealer.email" class="text-xs text-gray-500 dark:text-gray-400">{{
                                        selectedDealer.email }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Selected Warehouse -->
                        <div v-else-if="orderSheetFor === 'warehouse' && selectedWarehouse"
                            class="p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex-shrink-0 h-12 w-12 bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-sm flex items-center justify-center">
                                    <i class="fas fa-warehouse text-2xl text-green-600 dark:text-green-400"></i>
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ selectedWarehouse.name }}
                                    </h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedWarehouse.address ||
                                        'No address' }}
                                    </p>
                                    <p v-if="selectedWarehouse.phone" class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ selectedWarehouse.phone }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-else class="p-3 flex gap-2 text-start bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed 
                            border-gray-200 dark:border-gray-600">
                            <p class=""><i
                                    :class="orderSheetFor === 'dealer' ? 'fas fa-user-circle' : 'fas fa-warehouse'"
                                    class="text-[3.23vh] text-gray-300 dark:text-gray-500 mb-2"></i>
                            </p>
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    No {{ orderSheetFor === 'dealer' ? 'customer' : 'warehouse' }} selected
                                </p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Select from search above
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Price Type -->
                    <div
                        class="bg-white overflow-y-auto max-h-[120px] dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700 flex-1 flex flex-col">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Price Type <span class="text-xs text-red-500 dark:text-red-500"> *</span>
                        </label>
                        <div class="relative flex items-center">
                            <select v-model="formData.price_type" @change="clearValidationError('price_type')"
                                class="w-full px-3 py-2 pl-10 cursor-pointer text-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all">
                                <option value="regular">Regular</option>
                                <option value="dealer">Dealer</option>
                                <option value="sub_dealer">Sub Dealer</option>
                            </select>
                            <div class="absolute left-4 text-gray-400">
                                <i class="fas fa-tags"></i>
                            </div>
                        </div>
                        <p v-if="orderStore.validationErrors?.price_type"
                            class="text-xs text-red-500 dark:text-red-500 mt-1">
                            {{ orderStore.validationErrors.price_type[0] }}
                        </p>
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

                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">VAT</span>
                                    <div class="relative w-16">
                                        <input type="number" v-model.number="vatPercentage" min="0" max="100"
                                            class="w-full h-7 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                                        <span
                                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">%</span>
                                    </div>
                                </div>
                                <span class="text-sm font-medium dark:text-white">৳ {{ vatAmount.toFixed(2) }}</span>
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
                                <i class="fas fa-save"></i>
                                <span>{{ orderStore.loading ? 'Updating...' : 'Update Order' }}</span>
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
                        class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 cursor-pointer bg-white dark:bg-gray-800"
                        @click="handleProductSelect(product)">
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

    <!-- Confirmation Modal -->
    <BaseModal v-if="showConfirmModal" :show="showConfirmModal" title="Confirm Order Update" maxWidth="4xl"
        @close="showConfirmModal = false">
        <div class="flex flex-col h-full">
            <!-- Items Table -->
            <div class="flex-grow overflow-y-auto p-4">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product
                            </th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                Variant Package</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Price
                            </th>
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
                                    <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                        <img :src="item.image_url" class="w-full h-full object-cover"
                                            v-if="item.image_url">
                                        <div v-else class="w-full h-full flex items-center justify-center">
                                            <i class="fas fa-box text-gray-400"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-sm dark:text-white">{{ item.name }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.sku }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">{{
                                getSelectedVariantPackageName(item) }}</td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">৳ {{
                                item.selling_price?.toFixed(2) }}</td>
                            <td class="px-3 py-2 text-center text-sm dark:text-white">{{ item.quantity }}</td>
                            <td class="px-3 py-2 text-right text-sm font-medium dark:text-white">৳ {{
                                getItemTotal(item).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <td colspan="4" class="px-3 py-2 text-right font-semibold dark:text-white">Subtotal:</td>
                            <td class="px-3 py-2 text-right dark:text-white">৳ {{ subtotal.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="px-3 py-2 text-right text-sm dark:text-white">Discount:</td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-green-400">- ৳ {{
                                totalDiscount.toFixed(2) }}</td>
                        </tr>
                        <tr v-if="vatPercentage > 0">
                            <td colspan="4" class="px-3 py-2 text-right text-sm dark:text-white">VAT ({{ vatPercentage
                            }}%):</td>
                            <td class="px-3 py-2 text-right dark:text-white">+ ৳ {{ vatAmount.toFixed(2) }}</td>
                        </tr>
                        <tr class="border-t border-gray-300 dark:border-gray-600">
                            <td colspan="4" class="px-3 py-2 text-right font-bold text-lg dark:text-white">Total:</td>
                            <td class="px-3 py-2 text-right text-xl font-bold text-blue-600 dark:text-blue-400">৳ {{
                                total.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="px-3 py-2 text-right dark:text-white">Advance Paid:</td>
                            <td class="px-3 py-2 text-right text-green-600 dark:text-green-400">৳ {{
                                paidAmount.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="px-3 py-2 text-right font-medium dark:text-white">
                                {{ changeDue > 0 ? 'Change Due:' : 'Due:' }}
                            </td>
                            <td class="px-3 py-2 text-right font-semibold"
                                :class="changeDue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                ৳ {{ changeDue > 0 ? changeDue.toFixed(2) : dueAmount.toFixed(2) }}
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
                <button @click="submitOrder" :disabled="orderStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    orderStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                ]">
                    <span v-if="orderStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Updating...
                    </span>
                    <span v-else>Confirm Update</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Success Modal -->
    <BaseModal v-if="showSuccessModal" :show="showSuccessModal" title="Order Updated" maxWidth="md" :showClose="false"
        @close="showSuccessModal = false">
        <div class="flex flex-col items-center p-6 text-center">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-check-circle text-4xl text-green-600 dark:text-green-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order Updated!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Order has been updated successfully.</p>
            <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg mb-6 w-full">
                <p class="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                <p class="font-medium text-gray-900 dark:text-white"># {{ orderData?.number || 'N/A' }}</p>
            </div>
            <div class="flex justify-end space-x-3 w-full">
                <button @click="closeSuccessModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Close
                </button>
                <button @click="printOrder(orderData?.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-print mr-2"></i>Print Order
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Dealer Create Modal -->
    <BaseModal v-if="showDealerCreateModal" :show="showDealerCreateModal" title="Create New Customer" maxWidth="md"
        @close="showDealerCreateModal = false">
        <form @submit.prevent="createDealer" class="px-6 py-3">
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <input v-model="newDealer.company" type="text" placeholder="Enter company name"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>

                <!-- Type - Select Dropdown -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type <span
                            class="text-xs text-red-500 dark:text-red-500"> *</span></label>
                    <select v-model="newDealer.type"
                        class="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white appearance-none">
                        <option value="">Select Type</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="dealer">Dealer</option>
                        <option value="sub-dealer">Sub-Dealer</option>
                        <option value="retail">Retail</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span
                            class="text-xs text-red-500"> *</span></label>
                    <input v-model="newDealer.name" type="text" placeholder="Enter Name"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone </label>
                    <input v-model="newDealer.phone" type="text" placeholder="Enter Phone"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input v-model="newDealer.email" type="email" placeholder="Enter Email"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea v-model="newDealer.address" rows="2" placeholder="Enter Address"
                        class="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"></textarea>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" @click="showDealerCreateModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="creatingDealer" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                        creatingDealer ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="creatingDealer">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            Creating...
                        </span>
                        <span v-else>Create Dealer</span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>

    <!-- Product Detail Modal -->
    <BaseModal v-if="showProductDetailModal" :show="showProductDetailModal" title="Product Details" maxWidth="2xl"
        @close="showProductDetailModal = false">
        <div class="px-6 py-3" v-if="selectedProductDetail">
            <div class="flex gap-4">
                <div class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img :src="selectedProductDetail.image_url" class="w-full h-full object-cover"
                        v-if="selectedProductDetail.image_url">
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <i class="fas fa-box text-4xl text-gray-400"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-lg dark:text-white">{{ selectedProductDetail.name }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">SKU: {{ selectedProductDetail.sku }}</p>
                    <div class="mt-3 grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Selling Price</p>
                            <p class="font-semibold text-blue-600 dark:text-blue-400">৳ {{
                                selectedProductDetail.selling_price?.toFixed(2) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Unit</p>
                            <p class="text-sm dark:text-white">{{ selectedProductDetail.unit_name || '-' }}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Packages</p>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="pkg in selectedProductDetail.variant_packages" :key="pkg.id"
                                    class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                                    {{ pkg.variant_name }} - {{ pkg.package_name }} ({{ pkg.pieces_per_package }} pcs)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlatPickr from 'vue-flatpickr-component'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import { useDealerStore } from '@/stores/dealerStore'
import { useOrderStore } from '@/stores/orderStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import TextEditorInput from '@/components/common/TextEditorInput.vue'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const dealerStore = useDealerStore()
const orderStore = useOrderStore()
const warehouseStore = useWarehouseStore()
const toast = useToast()

// Order ID from route
const orderId = ref(route.params.id)
const orderData = ref(null)

// Loading state
const loadingOrder = ref(true)

// Computed store items
const dealerStoreItems = computed(() => {
    const items = dealerStore.items || []
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
    dealer_id: null,
    warehouse_id: null,
    price_type: 'dealer',
})

// Order Sheet For
const orderSheetFor = ref('dealer') // default: dealer

const onOrderSheetForChange = () => {
    // Reset the other selection when switching
    if (orderSheetFor.value === 'dealer') {
        formData.value.warehouse_id = null
        selectedWarehouse.value = null
        // Fetch dealers if not loaded
        if (dealerStoreItems.value.length === 0) {
            dealerStore.getAll()
        }
    } else {
        formData.value.dealer_id = null
        selectedDealer.value = null
        // Fetch warehouses if not loaded
        if (warehouseStoreItems.value.length === 0) {
            warehouseStore.getAll()
        }
    }
}

// Reactive state
const order_date = ref(new Date())
const delivery_date = ref(null)
const cartItems = ref([])
let cartIdCounter = 0
const barcodeInput = ref('')
const barcodeInputRef = ref(null)

// Dealer
const selectedDealer = ref(null)
const showDealerCreateModal = ref(false)
const creatingDealer = ref(false)
const newDealer = ref({
    company: '',
    type: '',
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

// Payment/Order summary
const vatPercentage = ref(0)
const paidAmount = ref(0)
const discount = ref(0)

const globalDiscountAmount = computed(() => {
    return discount.value || 0
})

// Modals
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const showProductDetailModal = ref(false)
const selectedProductDetail = ref(null)
const notes = ref('')

// Submit
const lastOrderData = ref(null)

// Computed
const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0)
})

const totalDiscount = computed(() => {
    const itemDiscount = cartItems.value.reduce((sum, item) => sum + (item.discount_amount || 0), 0)
    return itemDiscount + globalDiscountAmount.value
})

const vatAmount = computed(() => {
    return subtotal.value * (vatPercentage.value / 100)
})

const total = computed(() => {
    return subtotal.value + vatAmount.value - totalDiscount.value
})

const dueAmount = computed(() => {
    return Math.max(0, total.value - paidAmount.value)
})

const changeDue = computed(() => {
    return Math.max(0, paidAmount.value - total.value)
})

const isValidSelection = computed(() => {
    if (orderSheetFor.value === 'dealer') {
        return !!formData.value.dealer_id
    } else {
        return !!formData.value.warehouse_id
    }
})

// Methods
const formatVariantPackageLabel = (pkg) => {
    if (!pkg) return '-'
    const variant = pkg.variant_name || ''
    const pack = pkg.package_name || ''
    const pieces = pkg.pieces_per_package ? `${pkg.pieces_per_package} pcs` : ''
    return [variant, pack, pieces].filter(Boolean).join(' - ') || `ID: ${pkg.id}`
}

const getVariantPackagePrice = (pkg) => {
    if (!pkg) return 0
    if (formData.value.price_type === 'regular') return Number(pkg.regular_price || 0)
    if (formData.value.price_type === 'sub_dealer') return Number(pkg.sub_dealer_price || 0)
    return Number(pkg.dealer_price || 0)
}

const getSelectedVariantPackageName = (item) => {
    const selected = item.variant_packages?.find(pkg => Number(pkg.id) === Number(item.variant_package_id))
    return selected ? formatVariantPackageLabel(selected) : '-'
}

const getSelectedVariantPackageIds = (excludeIndex = -1) => {
    return cartItems.value
        .filter((_, idx) => idx !== excludeIndex)
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
    const selectedPkg = item.variant_packages?.find(pkg => Number(pkg.id) === Number(item.variant_package_id))
    if (selectedPkg) {
        item.selling_price = getVariantPackagePrice(selectedPkg)
        updateCartItemTotal(item)
    }
}

const getVariantPackagesForOrderItem = (item) => {
    const list = Array.isArray(item?.product?.variant_packages)
        ? [...item.product.variant_packages]
        : (Array.isArray(item?.variant_packages) ? [...item.variant_packages] : [])

    const selectedId = Number(item?.variant_package_id || 0)
    if (selectedId && !list.some(pkg => Number(pkg.id) === selectedId)) {
        list.push({
            id: selectedId,
            variant_name: item?.variant_name || '',
            package_name: item?.package_name || '',
            pieces_per_package: item?.pieces_per_package || null,
            regular_price: item?.unit_price || 0,
            dealer_price: item?.unit_price || 0,
            sub_dealer_price: item?.unit_price || 0
        })
    }

    return list
}

const normalizeVariantPackageResponse = (payload) => {
    const variants = payload?.data?.variants || payload?.variants
    if (Array.isArray(variants)) {
        return variants.flatMap(variant => {
            const packages = Array.isArray(variant?.packages) ? variant.packages : []
            return packages.map(pkg => ({
                id: pkg.id,
                variant_id: variant.id,
                variant_name: variant.name || '',
                package_name: pkg.package_type_name || pkg.package_name || '',
                pieces_per_package: pkg.pieces_per_package || null,
                regular_price: Number(pkg.regular_price || 0),
                dealer_price: Number(pkg.dealer_price || 0),
                sub_dealer_price: Number(pkg.sub_dealer_price || 0),
                barcode: pkg.barcode || null,
                is_default: !!pkg.is_default,
                is_active: pkg.is_active !== false
            }))
        })
    }

    if (Array.isArray(payload?.data?.variant_packages)) return payload.data.variant_packages
    if (Array.isArray(payload?.variant_packages)) return payload.variant_packages
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload)) return payload
    return []
}

const fetchVariantPackagesForProduct = async (productId, fallbackItem = null) => {
    if (!productId) {
        return getVariantPackagesForOrderItem(fallbackItem)
    }

    try {
        const response = await axiosClient.get(`/variant-packages/products/${productId}`)
        const packages = normalizeVariantPackageResponse(response?.data)

        if (Array.isArray(packages) && packages.length > 0) {
            const fallbackPackages = getVariantPackagesForOrderItem(fallbackItem)
            const fallbackSelectedId = Number(fallbackItem?.variant_package_id || 0)

            if (fallbackSelectedId && !packages.some(pkg => Number(pkg.id) === fallbackSelectedId)) {
                const fallbackSelected = fallbackPackages.find(pkg => Number(pkg.id) === fallbackSelectedId)
                if (fallbackSelected) {
                    return [...packages, fallbackSelected]
                }
            }

            return packages
        }
    } catch (error) {
        console.error(`Failed to load variant packages for product ${productId}:`, error)
    }

    return getVariantPackagesForOrderItem(fallbackItem)
}

const getItemTotal = (item) => {
    return (item.selling_price || 0) * (item.quantity || 0) - (item.discount_amount || 0)
}

const updateCartItemTotal = (item) => {
    item.total = getItemTotal(item)
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

// Load order data
const loadOrderData = async () => {
    if (!orderId.value) {
        toast.error('Order ID not found')
        router.push('/order-sheets')
        return
    }

    loadingOrder.value = true
    try {
        const response = await axiosClient.get(`/orders/${orderId.value}`)
        if (response.data.status === 200 && response.data.success) {
            orderData.value = response.data.data
            const orderType = orderData.value.order_sheet_for || orderData.value.type || 'dealer'

            // Set order sheet for
            orderSheetFor.value = orderType

            // Populate form data
            order_date.value = orderData.value.date
            delivery_date.value = orderData.value.delivery_date || null

            if (orderType === 'warehouse') {
                formData.value.warehouse_id = orderData.value.warehouse_id
                formData.value.dealer_id = null
            } else {
                formData.value.dealer_id = orderData.value.dealer_id
                formData.value.warehouse_id = null
            }

            formData.value.price_type = orderData.value.price_type || 'dealer'
            vatPercentage.value = orderData.value.vat_percentage || 0
            discount.value = parseFloat(orderData.value.discount_amount) || 0
            paidAmount.value = parseFloat(orderData.value.advance_paid_amount) || 0
            notes.value = orderData.value.notes || ''

            // Set selected dealer
            if (orderData.value.dealer_id) {
                const dealer = dealerStoreItems.value.find(d => d.id === orderData.value.dealer_id)
                if (dealer) {
                    selectedDealer.value = dealer
                } else {
                    selectedDealer.value = {
                        id: orderData.value.dealer_id,
                        name: orderData.value.dealer?.name || orderData.value.dealer_name || '',
                        phone_no: orderData.value.dealer?.phone_no || orderData.value.dealer_phone || '',
                        email: orderData.value.dealer?.email || ''
                    }
                }
            }

            // Set selected warehouse
            if (orderData.value.warehouse_id) {
                const warehouse = warehouseStoreItems.value.find(w => w.id === orderData.value.warehouse_id)
                if (warehouse) {
                    selectedWarehouse.value = warehouse
                } else {
                    selectedWarehouse.value = {
                        id: orderData.value.warehouse_id,
                        name: orderData.value.warehouse?.name || orderData.value.warehouse_name || '',
                        address: orderData.value.warehouse?.address || orderData.value.warehouse_address || '',
                        phone: orderData.value.warehouse?.phone || orderData.value.warehouse_phone || ''
                    }
                }
            }

            // Populate cart items
            if (orderData.value.items && orderData.value.items.length > 0) {
                cartItems.value = await Promise.all(orderData.value.items.map(async (item, index) => {
                    cartIdCounter = index + 1

                    const productId = 1 || null
                    const variantPackages = await fetchVariantPackagesForProduct(productId, item)

                    return {
                        cart_id: index + 1,
                        id: productId,
                        name: item.product?.name || item.product_name || 'Product', 
                        sku: item.product?.sku || item.product_sku || '',
                        selling_price: parseFloat(item.unit_price),
                        purchase_price: item.purchase_price || 0,
                        quantity: item.quantity,
                        discount_amount: parseFloat(item.discount_amount) || 0,
                        discount_percent: 0,
                        image_url: item.product?.image_url || item.image_url || '',
                        variant_name: item.variant_name || '',
                        current_stock: item.current_stock || 0,
                        variant_packages: variantPackages,
                        variant_package_id: item.variant_package_id || null,
                        total: 0
                    }
                }))

                // Update prices based on selected price type
                cartItems.value.forEach(item => {
                    if (item.variant_package_id) {
                        const selectedPkg = item.variant_packages?.find(pkg => Number(pkg.id) === Number(item.variant_package_id))
                        if (selectedPkg) {
                            item.selling_price = getVariantPackagePrice(selectedPkg)
                        }
                    }
                    updateCartItemTotal(item)
                })
            }
        } else {
            toast.error(response.data.message || 'Failed to load order data')
            router.push('/order-sheets')
        }
    } catch (error) {
        console.error('Load order error:', error)
        toast.error(error.response?.data?.message || 'Failed to load order data')
        router.push('/order-sheets')
    } finally {
        loadingOrder.value = false
    }
}

// Create dealer
const createDealer = async () => {
    if (!newDealer.value.name) {
        toast.warning('Please enter customer name')
        return
    }

    if (!newDealer.value.company) {
        toast.warning('Please enter company name')
        return
    }
    // type
    if (!newDealer.value.type) {
        toast.warning('Please select a type')
    }

    creatingDealer.value = true
    try {
        const response = await axiosClient.post('/dealers', newDealer.value)
        if (response.data.status === 200 || response.data.status === 201) {
            toast.success('Dealer created successfully')
            selectedDealer.value = response.data.data
            formData.value.dealer_id = response.data.data.id
            showDealerCreateModal.value = false
            newDealer.value = { company: '', type: '', name: '', phone: '', email: '', address: '' }
            await dealerStore.getAll()
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create dealer')
    } finally {
        creatingDealer.value = false
    }
}

const openDealerCreateModal = () => {
    newDealer.value = { company: '', type: '', name: '', phone: '', email: '', address: '' }
    showDealerCreateModal.value = true
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
            order:1
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

// Handle product selection - add directly to cart
const handleProductSelect = (product) => {
    addProductToCart(product)
}

// Add product to cart
const addProductToCart = (product) => {
    cartIdCounter++

    const variantPackages = Array.isArray(product.variant_packages) ? product.variant_packages : []
    const usedIds = getSelectedVariantPackageIds(-1)
    const firstAvailable = variantPackages.find(pkg => !usedIds.includes(Number(pkg.id)))

    cartItems.value.push({
        cart_id: cartIdCounter,
        id: product.id,
        name: product.name,
        image_url: product.image_url || null,
        sku: product.sku,
        selling_price: getVariantPackagePrice(firstAvailable),
        purchase_price: product.purchase_price || 0,
        quantity: 1,
        discount_amount: 0,
        discount_percent: 0,
        image_url: product.image_url || null,
        variant_name: product.variant_name,
        current_stock: product.current_stock || 0,
        variant_packages: variantPackages,
        variant_package_id: firstAvailable?.id || '',
        total: 0
    })

    showItemModal.value = false
}

// Barcode scan
let isScanning = false

const handleBarcodeScan = async () => {
    const defaultWarehouse = warehouseStore.items?.find(item => item.is_default === 1 || item.is_default === true)
    const warehouseId = defaultWarehouse?.id || 1

    if (isScanning) return
    isScanning = true

    const code = barcodeInput.value?.trim()
    if (!code) {
        toast.warning('Please enter or scan a barcode')
        isScanning = false
        return
    }

    try {
        const response = await axiosClient.get(`/packagings/scan/${encodeURIComponent(code)}?from_location_id=${warehouseId}&type=order-sheet`)

        if (response.data.success && response.data.status === 200) {
            const product = response.data.data
            addProductToCart(product)

            barcodeInput.value = ''
            await nextTick()
            barcodeInputRef.value?.focus()
        } else {
            toast.error(response.data.message || 'Product not found')
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to find product')
    } finally {
        isScanning = false
    }
}

// Cart operations
const increaseQty = (index) => {
    if (cartItems.value[index].quantity < 999999) {
        cartItems.value[index].quantity += 1
    }
}

const decreaseQty = (index) => {
    if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity -= 1
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
}

const removeItem = (index) => {
    cartItems.value.splice(index, 1)
}

const resetCart = () => {
    if (cartItems.value.length > 0) {
        cartItems.value = []
        paidAmount.value = 0
        discount.value = 0
        vatPercentage.value = 0
        cartIdCounter = 0
    }
}

const closeSuccessModal = () => {
    showSuccessModal.value = false
    router.push('/order-sheets')
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

// Process order
const processOrder = () => {
    if (cartItems.value.length === 0) {
        toast.warning('Please add items to cart')
        return
    }

    if (!isValidSelection.value) {
        toast.warning(`Please select a ${orderSheetFor.value === 'dealer' ? 'dealer' : 'warehouse'}`)
        return
    }

    const zeroOrEmptyQtyItems = cartItems.value.filter(item => !item.quantity || parseInt(item.quantity) <= 0)
    if (zeroOrEmptyQtyItems.length > 0) {
        toast.warning('Quantity 0 is not allowed. Please enter a valid quantity.')
        return
    }

    const invalidItems = cartItems.value.filter(item => !item.selling_price || item.selling_price <= 0)
    if (invalidItems.length > 0) {
        toast.warning('Please set valid selling prices for all items')
        return
    }

    const missingVariantItems = cartItems.value.filter(item => !item.variant_package_id)
    if (missingVariantItems.length > 0) {
        toast.warning('Please select variant package for all cart items')
        return
    }

    showConfirmModal.value = true
}

// Submit order
const submitOrder = async () => {
    if (orderStore.loading) return

    try {
        const orderItems = cartItems.value.map(item => ({
            product_id: item.id,
            quantity: String(item.quantity),
            unit_price: item.selling_price,
            discount_amount: item.discount_amount || 0,
            total: getItemTotal(item),
            variant_package_id: Number(item.variant_package_id)
        }))

        const payload = {
            date: formatDateForAPI(order_date.value),
            price_type: formData.value.price_type,
            vat_percentage: vatPercentage.value,
            discount_percentage: subtotal.value > 0 ? (discount.value / subtotal.value) * 100 : 0,
            discount_amount: discount.value,
            advance_paid_amount: paidAmount.value,
            notes: notes.value,
            items: orderItems,
            order_sheet_for: orderSheetFor.value
        }

        if (orderSheetFor.value === 'dealer') {
            payload.dealer_id = formData.value.dealer_id
        } else {
            payload.warehouse_id = formData.value.warehouse_id
        }

        if (delivery_date.value) {
            payload.delivery_date = formatDateForAPI(delivery_date.value)
        }

        const response = await axiosClient.put(`/orders/${orderId.value}`, payload)

        if (response.data.status === 200 || response.data.status === 201) {
            toast.success('Order updated successfully')
            orderData.value = response.data.data
            showConfirmModal.value = false
            showSuccessModal.value = true
        } else {
            toast.error(response.data.message || 'Failed to update order')
        }
    } catch (error) {
        console.error('Submit error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update order'
        toast.error(errorMessage)

        if (error.response?.data?.errors) {
            const errors = error.response.data.errors
            Object.keys(errors).forEach(key => {
                toast.error(`${key}: ${errors[key].join(', ')}`)
            })
        }
    }
}

// Print order
const printOrder = (orderId) => {
    if (!orderId) {
        toast.error('Invalid order ID for printing')
        return
    }

    axiosClient.get(`/orders/${orderId}/download-pdf`, { responseType: 'blob' })
        .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `order_${orderData.value?.number || orderData.value?.id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        })
        .catch((error) => {
            console.error('Error printing order:', error)
            toast.error('Failed to print order')
        })
}

// Open product detail
const openProductDetailModal = (index) => {
    selectedProductDetail.value = cartItems.value[index]
    showProductDetailModal.value = true
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        dealerStore.getAll(),
        warehouseStore.getAll()
    ])

    await loadOrderData()

    setTimeout(() => {
        barcodeInputRef.value?.focus()
    }, 500)
})

// Watch for modal open to load products
watch(() => showItemModal.value, (newVal) => {
    if (newVal) {
        currentProductPage.value = 1
        searchProducts()
    }
})

// Watch on change dealer option to set selected dealer
watch(() => formData.value.dealer_id, (newVal) => {
    const matchedDealer = dealerStoreItems.value.find(dealer => dealer.id === newVal)
    if (matchedDealer) {
        selectedDealer.value = matchedDealer
    } else {
        selectedDealer.value = null
    }
})

// Watch on change warehouse option to set selected warehouse
watch(() => formData.value.warehouse_id, (newVal) => {
    const matchedWarehouse = warehouseStoreItems.value.find(warehouse => warehouse.id === newVal)
    if (matchedWarehouse) {
        selectedWarehouse.value = matchedWarehouse
    } else {
        selectedWarehouse.value = null
    }
})

watch(() => formData.value.price_type, () => {
    cartItems.value.forEach(item => {
        const selectedPkg = item.variant_packages?.find(pkg => Number(pkg.id) === Number(item.variant_package_id))
        item.selling_price = getVariantPackagePrice(selectedPkg)
        updateCartItemTotal(item)
    })
})

const print = (orderId) => {
    printOrder(orderId)
}
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>