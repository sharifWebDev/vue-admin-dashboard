<template>
    <div>
        <!-- TOP SECTION -->
        <div class="flex justify-between items-center rounded bg-gray-50 dark:bg-gray-800 px-1">
            <div class="flex items-center gap-4">
                <h6 class="text-lg font-semibold text-gray-800 dark:text-white">Edit Product Transfer</h6>
            </div>
            <Breadcrumb />
        </div>

        <!-- MAIN SECTION -->
        <div class="bg-gray-50 dark:bg-gray-800 overflow-hidden font-sans flex flex-col">
            <div class="flex flex-col lg:flex-row flex-wrap px-1 md:px-1 py-4 gap-4 md:gap-4 overflow-hidden">

                <!-- Left Section - Products & Cart -->
                <div
                    class="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 md:p-6 flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <!-- Loading State -->
                    <div v-if="isLoading" class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-3 text-gray-600">Loading movement data...</span>
                    </div>

                    <div v-else>
                        <div class="flex flex-wrap items-end gap-4 mb-6">
                            <!-- Movement Date -->
                            <div class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    Movement Date
                                </label>
                                <div class="relative flex items-center">
                                    <flat-pickr v-model="movement_date" :config="config"
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all" />
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="far fa-calendar-alt"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- From Location Type (disabled on edit) -->
                            <div class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    From Location
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="from_location_type" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="warehouse">Warehouse</option>
                                        <option value="dealer">Dealer</option>
                                        <option value="supplier">Supplier</option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Location type cannot be changed while editing</p>
                            </div>

                            <!-- From Warehouse -->
                            <div v-if="from_location_type === 'warehouse'"
                                class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    From Warehouse
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="from_location_id" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="">-- Select Warehouse --</option>
                                        <option v-for="wh in warehouses" :value="wh.id" :key="wh.id">{{ wh.name }}
                                        </option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-warehouse"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- From Dealer/Supplier -->
                            <div v-if="from_location_type !== 'warehouse'"
                                class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    From {{ from_location_type === 'dealer' ? 'Dealer' : 'Supplier' }}
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="from_location_id" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="">-- Select {{ from_location_type === 'dealer' ? 'Dealer' :
                                            'Supplier' }} --</option>
                                        <option v-for="person in allDealers" :value="person.id" :key="person.id">{{
                                            person.name }}</option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- To Location Type (disabled on edit) -->
                            <div class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    To Location
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="to_location_type" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="warehouse">Warehouse</option>
                                        <option value="dealer">Dealer</option>
                                        <option value="supplier">Supplier</option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Location type cannot be changed while editing</p>
                            </div>

                            <!-- To Warehouse -->
                            <div v-if="to_location_type === 'warehouse'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    To Warehouse
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="to_location_id" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="">-- Select Warehouse --</option>
                                        <option v-for="wh in warehouses" :value="wh.id" :key="wh.id">{{ wh.name }}
                                        </option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-warehouse"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- To Dealer/Supplier -->
                            <div v-if="to_location_type !== 'warehouse'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    To {{ to_location_type === 'dealer' ? 'Dealer' : 'Supplier' }}
                                </label>
                                <div class="relative flex items-center">
                                    <select v-model="to_location_id" disabled
                                        class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed">
                                        <option value="">-- Select {{ to_location_type === 'dealer' ? 'Dealer' :
                                            'Supplier' }} --</option>
                                        <option v-for="person in allDealers" :value="person.id" :key="person.id">{{
                                            person.name }}</option>
                                    </select>
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-1">
                                <button @click="openProductBrowser"
                                    class="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                                    <i class="fas fa-layer-group text-lg"></i>
                                    <span class="font-medium">Browse Products</span>
                                </button>
                            </div>
                        </div>

                        <!-- Barcode Scanner -->
                        <div class="grid grid-cols-1 xl:grid-cols-4 items-center justify-center gap-4 mb-6">
                            <!-- <div class="w-full col-span-3">
                                <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                    Scan QR/Barcode
                                </label>
                                <div class="relative flex items-center">
                                    <input type="text" v-model="barcodeInput" @keyup.enter="handleBarcodeScan"
                                        placeholder="Scan or enter QR/Barcode code"
                                        class="w-full px-3 py-2 pl-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all text-lg"
                                        ref="barcodeInputRef">
                                    <div class="absolute left-4 text-gray-400">
                                        <i class="fas fa-qrcode text-xl"></i>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Scan product QR code to add to cart</p>
                            </div> -->

                            <!-- Browse Items Button -->
                            
                        </div>

                        <!-- Cart Items -->
                        <div class="flex flex-col" style="max-height: calc(100vh - 430px);">
                            <div
                                class="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center flex-shrink-0">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cart Items ({{
                                    cartItems.length }})</h3>
                                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Items: {{
                                    totalProductsQty }}</span>
                            </div>

                            <div class="overflow-y-auto flex-1">
                                <!-- Cart Header -->
                                <div v-if="cartItems.length > 0"
                                    class="grid grid-cols-10 gap-2 mb-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                    <div class="col-span-4">Product</div>
                                    <div class="col-span-2 text-center">Variant Package</div>
                                    <div class="col-span-2 text-center">Quantity</div>
                                    <div class="col-span-2 text-right">Actions</div>
                                </div>

                                <!-- Cart Items List -->
                                <div v-for="(item, index) in cartItems" :key="item.row_id"
                                    class="grid grid-cols-10 gap-2 px-3 py-3 mb-2 bg-white rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all relative group">

                                    <!-- Product Column -->
                                    <div class="col-span-4 flex items-center gap-3">
                                        <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                            <img :src="item.image_url" :alt="item.name"
                                                class="w-full h-full object-cover" v-if="item.image_url">
                                            <div v-else
                                                class="w-full h-full flex items-center justify-center text-gray-400">
                                                <i class="fas fa-box text-xl"></i>
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <h4 class="font-semibold text-gray-900 truncate text-sm">{{ item.name }}
                                            </h4>
                                            <p v-if="item.sku" class="text-xs text-gray-500 truncate">SKU: {{ item.sku
                                                }}</p>
                                        </div>
                                    </div>

                                    <!-- Variant Package Column -->
                                    <div class="col-span-2 flex items-center justify-center">
                                        <select v-model="item.variant_package_id"
                                            @change="onVariantPackageChange(index, item.variant_package_id)"
                                            class="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                            <option value="">Select Package</option>
                                            <option v-for="pkg in getAvailableVariantPackages(item, index)"
                                                :key="pkg.id" :value="pkg.id">
                                                {{ formatVariantPackageLabel(pkg) }}
                                            </option>
                                        </select>
                                    </div>

                                    <!-- Quantity Column -->
                                    <div class="col-span-2 flex items-center justify-center gap-1">
                                        <div
                                            class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                                            <button @click="decreaseQty(index)"
                                                class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <i class="fas fa-minus text-xs"></i>
                                            </button>
                                            <input type="number" v-model="item.quantity" min="0" max="999999" step="1"
                                                @input="handleQtyInput($event, index)"
                                                class="w-20 pl-2 py-1 -mx-5 z-5 text-center text-sm font-medium dark:text-white bg-gray-100 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-200"
                                                :class="item.error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100 dark:border-gray-600'" />
                                            <button @click="increaseQty(index)"
                                                class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <i class="fas fa-plus text-xs"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Actions Column -->
                                    <div class="col-span-2 flex items-center justify-end gap-2">
                                        <button @click="removeItem(index)"
                                            class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors">
                                            <i class="fas fa-trash-alt text-sm"></i>
                                        </button>
                                    </div>

                                    <!-- Validation Error Message -->
                                    <div v-if="item.error"
                                        class="col-span-10 mt-2 text-[11px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-800/30 flex items-start gap-1">
                                        <i class="fas fa-exclamation-circle mt-0.5"></i>
                                        <span>{{ item.error }}</span>
                                    </div>
                                </div>

                                <!-- Empty Cart -->
                                <div v-if="cartItems.length === 0"
                                    class="flex flex-col items-center justify-center py-12 text-gray-400 min-h-[55vh]">
                                    <i class="fas fa-shopping-cart text-4xl mb-3"></i>
                                    <p class="text-sm">No items in cart. Scan QR codes to add.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Section - Transfer Summary -->
                <div class="w-full lg:w-96 space-y-4 flex flex-col overflow-hidden">
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700 flex-1 flex flex-col overflow-hidden">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Movement Summary</h3>

                        <div class="space-y-3 mb-6">
                            <!-- Reference Number -->
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-sm text-gray-600 dark:text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-hashtag text-purple-400"></i>
                                    Reference No
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{
                                    movementData?.reference_no || 'N/A' }}</span>
                            </div>

                            <!-- Total Items -->
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-sm text-gray-600 dark:text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-boxes text-blue-400"></i>
                                    Total Items
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ totalProductsQty
                                    }} items</span>
                            </div>

                            <!-- Unique Products -->
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-sm text-gray-600 dark:text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-cubes text-green-400"></i>
                                    Unique Products
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ cartItems.length
                                    }} products</span>
                            </div>

                            <!-- Movement Info -->
                            <div class="flex justify-between items-center py-2">
                                <span
                                    class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <i class="fas fa-arrows-alt-h text-purple-400"></i>
                                    Transfer Type
                                </span>
                                <span class="text-sm font-medium text-gray-700">
                                    {{ from_location_type }} → {{ to_location_type }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-auto grid grid-cols-2 gap-3">
                            <button @click="resetCart"
                                class="px-3 py-2 border border-gray-200 bg-white text-red-500 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
                                :class="{ 'opacity-50 cursor-not-allowed': cartItems.length === 0 }"
                                :disabled="cartItems.length === 0">
                                <i class="fas fa-trash-alt"></i>
                                <span>Clear All</span>
                            </button>
                            <button @click="handleSubmitClick"
                                class="px-2 py-2 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm"
                                :disabled="cartItems.length === 0 || isSubmitting"
                                :class="{ 'opacity-50 cursor-not-allowed': cartItems.length === 0 }">
                                <i class="fas fa-save"></i>
                                <span>{{ isSubmitting ? 'Updating...' : 'Update Movement' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== CONFIRMATION MODAL ===== -->
            <BaseModal v-model="showConfirmModal" classes="modal-container" content-class="modal-content" maxWidth="4xl"
                overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col h-full">
                    <div
                        class="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-md">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-xl font-bold">Confirm Stock Movement Update</h2>
                                <p class="text-sm opacity-80 mt-1">Review changes before updating</p>
                            </div>
                            <div class="text-right text-sm">
                                <p class="opacity-90">Date: {{ formatDate(movement_date) }}</p>
                                <p class="opacity-90 mt-1">Ref: {{ movementData?.reference_no || 'N/A' }}</p>
                                <p class="opacity-90 mt-1">From: <span class="capitalize font-medium">{{
                                        from_location_type }}</span></p>
                                <p class="opacity-90 mt-1">To: <span class="capitalize font-medium">{{ to_location_type
                                        }}</span></p>
                            </div>
                        </div>
                    </div>

                    <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white rounded-xl border border-gray-200 p-3 text-center">
                                <p class="text-xs text-gray-500 mb-1">Total Items</p>
                                <p class="text-2xl font-bold text-blue-600">{{ totalProductsQty }}</p>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-3 text-center">
                                <p class="text-xs text-gray-500 mb-1">Products Moving</p>
                                <p class="text-2xl font-bold text-indigo-600">{{ cartItems.length }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex-grow overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Variant Package</th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Quantity</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="(item, index) in cartItems" :key="index" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm text-gray-500">{{ index + 1 }}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg overflow-hidden">
                                                <img :src="item.image_url" :alt="item.name"
                                                    class="h-full w-full object-cover" v-if="item.image_url">
                                                <div v-else
                                                    class="h-full w-full flex items-center justify-center text-gray-400">
                                                    <i class="fas fa-box"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-900 text-sm">{{ item.name }}</div>
                                                <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-center text-sm text-gray-700">{{
                                        getSelectedVariantPackageName(item) }}</td>
                                    <td class="px-4 py-3 text-center text-sm font-medium text-gray-900">{{ item.quantity
                                        }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                        <div class="flex justify-end gap-3">
                            <button @click="showConfirmModal = false"
                                class="px-6 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                            <button @click="updateMovement" :disabled="isSubmitting"
                                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-check-circle"></i>
                                <span>{{ isSubmitting ? 'Processing...' : 'Confirm Update' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </BaseModal>

            <!-- ===== SUCCESS MODAL ===== -->
            <BaseModal v-model="showSuccessModal" classes="modal-container" content-class="modal-content max-w-md"
                overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col items-center p-6 text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-check-circle text-4xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Movement Updated!</h3>
                    <p class="text-gray-600 mb-6">Stock movement has been updated successfully.</p>
                    <div class="bg-gray-50 px-4 py-3 rounded-lg mb-6 w-full">
                        <p class="text-sm text-gray-500">Reference Number</p>
                        <p class="font-medium text-gray-900"># {{ movementData?.reference_no || 'N/A' }}</p>
                    </div>
                    <button @click="handleSuccessClose"
                        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-medium">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </BaseModal>

            <!-- Product Browser Modal -->
            <BaseModal v-model="showItemModal" classes="modal-container" maxWidth="6xl" title="Select Products"
                content-class="modal-content" overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">
                    <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="relative">
                            <input type="text" v-model="productSearch" @input="searchProducts"
                                @keyup.enter="searchProducts" placeholder="Search by product name, SKU, or barcode..."
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

                    <div class="flex-grow overflow-y-auto p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="product in products" :key="product.id"
                                class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-300 cursor-pointer bg-white dark:bg-gray-800"
                                @click="handleProductSelect(product)">
                                <div class="flex gap-3">
                                    <div
                                        class="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <img :src="product.image_url || product.serials?.[0]?.image_url"
                                            :alt="product.name" class="w-full h-full object-cover"
                                            v-if="product.image_url || product.serials?.[0]?.image_url">
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-400">
                                            <i class="fas fa-box text-2xl"></i>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-gray-900 dark:text-white text-sm">{{ product.name
                                            }}</h4>
                                        <p v-if="product.sku" class="text-xs text-gray-500 dark:text-gray-400">SKU: {{
                                            product.sku }}</p>
                                        <div class="flex justify-between items-center mt-2">
                                            <span class="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {{ product.variant_packages?.length || 0 }} Packages Available
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="loadingProducts" class="text-center py-12">
                            <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                        </div>

                        <div v-if="products.length === 0 && !loadingProducts" class="text-center py-12">
                            <i class="fas fa-box-open text-5xl text-gray-300 dark:text-gray-600 mb-3"></i>
                            <p class="text-gray-500 dark:text-gray-400">No products found</p>
                        </div>
                    </div>

                    <div v-if="totalProducts > 0"
                        class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <span class="text-sm text-gray-500 dark:text-gray-400">Showing {{ products.length }} of {{
                            totalProducts }} items</span>
                        <div class="flex gap-2">
                            <button @click="prevProductPage" :disabled="currentProductPage === 1"
                                class="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300">
                                Previous
                            </button>
                            <button @click="nextProductPage" :disabled="currentProductPage === lastProductPage"
                                class="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </BaseModal>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlatPickr from 'vue-flatpickr-component'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import { useWarehouseStore } from '@/stores/warehouseStore'

const warehouseStore = useWarehouseStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const config = {
    enableTime: false,
    dateFormat: 'Y-m-d',
    defaultDate: new Date()
}

const isLoading = ref(true)
const movement_date = ref(new Date())
const movementId = ref(null)
const movementData = ref(null)

const from_location_type = ref('warehouse')
const to_location_type = ref('warehouse')
const from_location_id = ref('')
const to_location_id = ref('')
const fromLocationError = ref(false)
const toLocationError = ref(false)

const warehouses = ref([])
const allDealers = ref([])

const cartItems = ref([])
const barcodeInput = ref('')

const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const showItemModal = ref(false)

const products = ref([])
const productSearch = ref('')
const loadingProducts = ref(false)
const totalProducts = ref(0)
const currentProductPage = ref(1)
const lastProductPage = ref(1)
const itemSearchInput = ref(null)

const isSubmitting = ref(false)
const barcodeInputRef = ref(null)

const totalProductsQty = computed(() => cartItems.value.reduce((s, i) => {
    const qty = parseInt(i.quantity, 10)
    return s + (Number.isNaN(qty) ? 0 : qty)
}, 0))

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatVariantPackageLabel = (pkg) => {
    if (!pkg) return '-'
    const variant = pkg.variant_name || ''
    const pack = pkg.package_name || ''
    const pieces = pkg.pieces_per_package ? `${pkg.pieces_per_package} pcs` : ''
    return [variant, pack, pieces].filter(Boolean).join(' - ') || `ID: ${pkg.id}`
}

const getSelectedVariantPackageName = (item) => {
    const selected = item.variant_packages?.find(pkg => pkg.id === Number(item.variant_package_id))
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
        return !selectedIds.includes(pkg.id) || pkg.id === currentSelected
    })
}

const onVariantPackageChange = (index, selectedId) => {
    cartItems.value[index].variant_package_id = selectedId ? Number(selectedId) : ''
    cartItems.value[index].error = null
}

const getFromLocationName = () => {
    if (from_location_type.value === 'warehouse') {
        const wh = warehouses.value.find(w => Number(w.id) === Number(from_location_id.value))
        return wh ? wh.name : ''
    }
    const person = allDealers.value.find(s => Number(s.id) === Number(from_location_id.value))
    return person ? person.name : ''
}

const getToLocationName = () => {
    if (to_location_type.value === 'warehouse') {
        const wh = warehouses.value.find(w => Number(w.id) === Number(to_location_id.value))
        return wh ? wh.name : ''
    }
    const person = allDealers.value.find(s => Number(s.id) === Number(to_location_id.value))
    return person ? person.name : ''
}

const loadWarehouses = async () => {
    try {
        await warehouseStore.getAll()
        warehouses.value = warehouseStore.items || []
    } catch (e) {
        console.error(e)
        toast.error('Failed to load warehouses')
    }
}

const loadAllDealers = async () => {
    try {
        const res = await axiosClient.get('/dealers/all')
        allDealers.value = res?.data?.data?.data || res?.data?.data || []
    } catch (e) {
        console.error(e)
        toast.error('Failed to load dealers')
    }
}

const normalizeVariantPackages = (item, product) => {
    const list = Array.isArray(product?.variant_packages) ? [...product.variant_packages] : []
    const selectedId = Number(item?.variant_package_id || item?.packaging?.variant_package_id || item?.variant_package?.id || 0)

    if (selectedId && !list.some(pkg => Number(pkg.id) === selectedId)) {
        list.push({
            id: selectedId,
            variant_name: item?.variant_package?.variant_name || item?.packaging?.variant_package?.variant_name || '',
            package_name: item?.variant_package?.package_name || item?.packaging?.variant_package?.package_name || '',
            pieces_per_package: item?.variant_package?.pieces_per_package || item?.packaging?.variant_package?.pieces_per_package || null
        })
    }

    return { list, selectedId }
}

const loadMovementData = async () => {
    isLoading.value = true
    try {
        const response = await axiosClient.get(`/stock-movements/${movementId.value}`)
        const data = response?.data?.data

        if (!data) {
            toast.error('Failed to load movement data')
            router.push('/stock-movements')
            return
        }

        movementData.value = data
        movement_date.value = data.movement_date || new Date()
        from_location_type.value = data.from_location_type || 'warehouse'
        to_location_type.value = data.to_location_type || 'warehouse'
        from_location_id.value = data.from_location_id || ''
        to_location_id.value = data.to_location_id || ''

        const sourceItems = Array.isArray(data.cart_items) && data.cart_items.length > 0
            ? data.cart_items
            : (Array.isArray(data.items) ? data.items : [])

        cartItems.value = sourceItems.map((item, idx) => {
            const product = item.product || item.packaging?.product || {}
            const { list, selectedId } = normalizeVariantPackages(item, product)

            return {
                row_id: `existing-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                id: item.product_id || product.id,
                name: product.name || item.product_name || 'Unknown Product',
                sku: product.sku || item.sku || '-',
                serial_no: item.serial_no || item.packaging?.serial_no || null,
                quantity: parseInt(item.quantity, 10) || 1,
                image_url: product.image_url || item.image_url || null,
                variant_packages: list,
                variant_package_id: selectedId || '',
                error: null
            }
        }).filter(item => item.id)
    } catch (error) {
        console.error('Load movement error:', error)
        toast.error(error.response?.data?.message || 'Failed to load movement data')
        router.push('/stock-movements')
    } finally {
        isLoading.value = false
    }
}

const openProductBrowser = () => {
    if (!from_location_id.value) {
        toast.warning('Missing source location')
        return
    }
    showItemModal.value = true
}

const searchProducts = async () => {
    loadingProducts.value = true
    try {
        const params = {
            page: currentProductPage.value,
            per_page: 20,
            search: productSearch.value,
            is_active: 1,
            from_location_id: from_location_id.value,
            from_location_type: from_location_type.value
        }
        const response = await axiosClient.get('/products/by-warehouse', { params })
        products.value = response?.data?.data?.data || []
        totalProducts.value = response?.data?.data?.meta?.total || 0
        lastProductPage.value = response?.data?.data?.meta?.last_page || 1
    } catch (e) {
        console.error(e)
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

const handleProductSelect = (product) => {
    addProductToCart(product)
}

const addProductToCart = (product) => {
    const variantPackages = Array.isArray(product.variant_packages) ? product.variant_packages : []
    const usedIds = getSelectedVariantPackageIds(-1)
    const firstAvailable = variantPackages.find(pkg => !usedIds.includes(pkg.id))

    const newItem = {
        row_id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        id: product.id,
        name: product.name,
        sku: product.sku || '-',
        serial_no: product.serial_no || null,
        quantity: 1,
        image_url: product.image_url || null,
        variant_packages: variantPackages,
        variant_package_id: firstAvailable?.id || '',
        error: null
    }

    cartItems.value.push(newItem)
}

watch(() => showItemModal.value, (newVal) => {
    if (newVal) {
        currentProductPage.value = 1
        searchProducts()
    }
})

let isScanning = false
const handleBarcodeScan = async () => {
    if (isScanning) return
    isScanning = true

    const code = barcodeInput.value?.trim()
    if (!code) {
        toast.warning('Please enter or scan a code')
        isScanning = false
        return
    }

    try {
        const response = await axiosClient.get(`/packagings/scan/${encodeURIComponent(code)}?from_location_id=${from_location_id.value}&from_location_type=${from_location_type.value}`)

        if (response.data.success && response.data.status === 200) {
            const productData = response.data.data
            const variantPackages = Array.isArray(productData.variant_packages) ? productData.variant_packages : []
            const usedIds = getSelectedVariantPackageIds(-1)
            const firstAvailable = variantPackages.find(pkg => !usedIds.includes(pkg.id))

            cartItems.value.push({
                row_id: `${productData.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                id: productData.id,
                name: productData.name,
                sku: productData.sku || '-',
                serial_no: productData.serial_no || null,
                quantity: 1,
                image_url: productData.image_url || null,
                variant_packages: variantPackages,
                variant_package_id: firstAvailable?.id || '',
                error: null
            })

            barcodeInput.value = ''
            await nextTick()
            barcodeInputRef.value?.focus()
        } else {
            toast.error(response.data.message || 'Failed to fetch product')
        }
    } catch (error) {
        console.error('Barcode scan error:', error)
        toast.error(error.response?.data?.message || 'Failed to scan barcode')
        barcodeInput.value = ''
        barcodeInputRef.value?.focus()
    } finally {
        isScanning = false
    }
}

const increaseQty = (index) => {
    if (cartItems.value[index].quantity < 999999) {
        cartItems.value[index].quantity += 1
        cartItems.value[index].error = null
    }
}

const decreaseQty = (index) => {
    if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity -= 1
        cartItems.value[index].error = null
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

    let parsedValue = parseInt(value, 10)

    if (parsedValue < 0) parsedValue = 0
    if (parsedValue > 999999) parsedValue = 999999

    cartItems.value[index].quantity = parsedValue
    event.target.value = parsedValue

    if (cartItems.value[index].error) {
        cartItems.value[index].error = null
    }
}

const removeItem = (index) => {
    const removedItem = cartItems.value[index]
    cartItems.value.splice(index, 1)
    toast.info(`Removed ${removedItem.name} from cart`)
}

const resetCart = () => {
    if (cartItems.value.length > 0) {
        cartItems.value = []
    }
}

watch(showSuccessModal, (newValue = false) => {
    if (!newValue) {
        resetCart()
    }
})

const handleSubmitClick = () => {
    if (cartItems.value.length === 0) {
        toast.warning('Please add items to cart')
        return
    }

    if (!from_location_id.value) {
        fromLocationError.value = true
        toast.warning(`Please select a ${from_location_type.value}`)
        return
    }

    if (!to_location_id.value) {
        toLocationError.value = true
        toast.warning(`Please select a ${to_location_type.value}`)
        return
    }

    const zeroOrEmptyQtyItems = cartItems.value.filter(item => !item.quantity || parseInt(item.quantity, 10) <= 0)
    if (zeroOrEmptyQtyItems.length > 0) {
        toast.warning('Quantity 0 is not allowed. Please enter a valid quantity.')
        return
    }

    for (const item of cartItems.value) {
        if (!item.variant_package_id) {
            item.error = `Please select a variant package for ${item.name}.`
            toast.error(`Validation failed. Please select variant package for ${item.name}.`)
            return
        }
    }

    showConfirmModal.value = true
}

const handleValidationErrors = (errors, itemMapping) => {
    if (Array.isArray(errors)) {
        errors.forEach(errStr => {
            const match = String(errStr).match(/cart_items\.(\d+):\s*(.*)/)
            if (match) {
                const payloadIdx = parseInt(match[1], 10)
                const cartIdx = itemMapping[payloadIdx]
                if (cartIdx !== undefined && cartItems.value[cartIdx]) {
                    cartItems.value[cartIdx].error = match[2]
                }
            } else {
                toast.error(errStr)
            }
        })
    } else if (typeof errors === 'object') {
        Object.keys(errors).forEach(key => {
            const match = key.match(/cart_items\.(\d+)/)
            if (match) {
                const payloadIdx = parseInt(match[1], 10)
                const cartIdx = itemMapping[payloadIdx]
                if (cartIdx !== undefined && cartItems.value[cartIdx]) {
                    const errorMsg = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
                    cartItems.value[cartIdx].error = errorMsg
                }
            } else {
                const msg = Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]
                toast.error(`${key}: ${msg}`)
            }
        })
    }
}

const updateMovement = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    const items = []
    const itemMapping = []

    try {
        cartItems.value.forEach((item, cartIdx) => {
            item.error = null
            items.push({
                product_id: item.id,
                variant_package_id: Number(item.variant_package_id),
                quantity: parseInt(item.quantity, 10)
            })
            itemMapping.push(cartIdx)
        })

        const payload = {
            from_location_type: from_location_type.value,
            from_location_id: parseInt(from_location_id.value, 10),
            to_location_type: to_location_type.value,
            to_location_id: parseInt(to_location_id.value, 10),
            cart_items: items
        }

        const response = await axiosClient.put(`/stock-movements/${movementId.value}`, payload)

        if (response.data.success !== false && response.data.data) {
            toast.success('Stock movement updated successfully')
            movementData.value = response.data.data
            showConfirmModal.value = false
            showSuccessModal.value = true
        } else {
            const errorData = response.data
            toast.error(errorData.message || 'Failed to update stock movement')
            if (errorData.errors) {
                handleValidationErrors(errorData.errors, itemMapping)
                showConfirmModal.value = false
            }
        }
    } catch (error) {
        console.error('Update error:', error)
        const errorData = error.response?.data
        const errorMessage = errorData?.message || 'Failed to update stock movement'
        toast.error(errorMessage)

        if (errorData?.errors) {
            handleValidationErrors(errorData.errors, itemMapping)
            showConfirmModal.value = false
        }
    } finally {
        isSubmitting.value = false
    }
}

const handleSuccessClose = () => {
    showSuccessModal.value = false
    router.push('/stock-movements')
}

onMounted(async () => {
    movementId.value = route.params.id

    if (!movementId.value) {
        toast.error('No movement ID provided')
        router.push('/stock-movements')
        return
    }

    await Promise.all([
        loadWarehouses(),
        loadAllDealers()
    ])

    await loadMovementData()

    setTimeout(() => {
        barcodeInputRef.value?.focus()
    }, 500)
})
</script>
