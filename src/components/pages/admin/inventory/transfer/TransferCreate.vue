<template>
    <div>
        <!-- TOP SECTION-->
        <div class="flex justify-between items-center rounded bg-gray-50 dark:bg-gray-800 px-1">
            <div class="flex items-center gap-4">
                <h6 class="text-lg font-semibold text-gray-800 dark:text-white">Product Transfer</h6>
            </div>
            <Breadcrumb />
        </div>

        <!-- MAIN SECTION-->
        <div class="bg-gray-50 dark:bg-gray-800 overflow-hidden font-sans flex flex-col">
            <div class="flex flex-col lg:flex-row flex-wrap px-1 md:px-1 py-4 gap-4 md:gap-4 overflow-hidden">

                <!-- Left Section - Products & Cart -->
                <div
                    class="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 md:p-6 flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
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

                        <!-- From Location Type -->
                        <div class="w-full lg:w-[calc(50%-1rem)] xl:flex-1 hidden">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                From Location
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="from_location_type" @change="handleFromLocationChange"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all">
                                    <option value="warehouse">Warehouse</option>
                                    <option value="dealer">Dealers</option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                            </div>
                        </div>

                        <!-- From Warehouse dropdown -->
                        <div v-if="from_location_type === 'warehouse'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                From Warehouse <span class="text-red-500">*</span>
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="from_location_id" @change="clearFromLocationError"
                                    :selected-item="selectedWarehouse"
                                    class="w-full px-3 py-2 pl-10 border rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all"
                                    :class="fromLocationError ? 'border-red-400' : 'border-gray-200'">
                                    <option value="">-- Select Warehouse --</option>
                                    <option v-for="wh in warehouses" :value="wh.id" :key="wh.id">{{ wh.name }}</option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-warehouse"></i>
                                </div>
                            </div>
                            <p v-if="fromLocationError" class="text-xs text-red-500 mt-1">Please select a warehouse</p>
                        </div>

                        <!-- From Dealer dropdown -->
                        <div v-if="from_location_type === 'dealer'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                From Dealer <span class="text-red-500">*</span>
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="from_location_id" @change="clearFromLocationError"
                                    class="w-full px-3 py-2 pl-10 border rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all"
                                    :class="fromLocationError ? 'border-red-400' : 'border-gray-200'">
                                    <option value="">-- Select Dealer --</option>
                                    <option v-for="sup in allDealers" :value="sup.id" :key="sup.id">{{ sup.name }}
                                    </option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-truck"></i>
                                </div>
                            </div>
                            <p v-if="fromLocationError" class="text-xs text-red-500 mt-1">Please select a dealer</p>
                        </div>

                        <!-- To Location Type -->
                        <div class="w-full lg:w-[calc(50%-1rem)] xl:flex-1 hidden">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                To Location
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="to_location_type" @change="handleToLocationChange"
                                    class="w-full px-3 py-2 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all">
                                    <option value="warehouse">Warehouse</option>
                                    <option value="dealer">Dealers</option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                            </div>
                        </div>

                        <!-- To Warehouse dropdown -->
                        <div v-if="to_location_type === 'warehouse'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                To Warehouse <span class="text-red-500">*</span>
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="to_location_id" @change="clearToLocationError"
                                    class="w-full px-3 py-2 pl-10 border rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all"
                                    :class="toLocationError ? 'border-red-400' : 'border-gray-200'">

                                    <option value="">-- Select Warehouse --</option>

                                    <option v-for="wh in filteredWarehouses" :value="wh.id" :key="wh.id">
                                        {{ wh.name }}
                                    </option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-warehouse"></i>
                                </div>
                            </div>
                            <p v-if="toLocationError" class="text-xs text-red-500 mt-1">Please select a warehouse</p>
                        </div>

                        <!-- To Dealer dropdown -->
                        <div v-if="to_location_type === 'dealer'" class="w-full lg:w-[calc(50%-1rem)] xl:flex-1">
                            <label class="block text-sm font-sm text-gray-700 dark:text-gray-300 mb-1">
                                To Dealer <span class="text-red-500">*</span>
                            </label>
                            <div class="relative flex items-center">
                                <select v-model="to_location_id" @change="clearToLocationError"
                                    class="w-full px-3 py-2 pl-10 border rounded-xl shadow-sm focus:outline-none focus:ring-0.5 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 transition-all"
                                    :class="toLocationError ? 'border-red-400' : 'border-gray-200'">
                                    <option value="">-- Select Dealer --</option>
                                    <option v-for="sup in allDealers" :value="sup.id" :key="sup.id">{{ sup.name }}
                                    </option>
                                </select>
                                <div class="absolute left-4 text-gray-400">
                                    <i class="fas fa-truck"></i>
                                </div>
                            </div>
                            <p v-if="toLocationError" class="text-xs text-red-500 mt-1">Please select a dealer</p>
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
                        <div class="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center flex-shrink-0">
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
                                        <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover"
                                            v-if="item.image_url">
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-400">
                                            <i class="fas fa-box text-xl"></i>
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h4 class="font-semibold text-gray-900 truncate text-sm">{{ item.name }}</h4>
                                        <p v-if="item?.sku" class="text-xs text-gray-500 truncate">SKU: {{ item.sku }}</p>
                                    </div>
                                </div>

                                <!-- Variant Package Column -->
                                <div class="col-span-2 flex items-center justify-center">
                                    <select v-model="item.variant_package_id"
                                        @change="onVariantPackageChange(index, item.variant_package_id)"
                                        class="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">Select Package</option>
                                        <option v-for="pkg in getAvailableVariantPackages(item, index)" :key="pkg.id"
                                            :value="pkg.id">
                                            {{ formatVariantPackageLabel(pkg) }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Qty Column (Read-only) -->
                                <!-- <div class="col-span-2 flex items-center justify-center">
                                    <span class="text-sm font-semibold text-blue-600 cursor-pointer 
                                    group-hover:text-blue-700 transition-colors group-hover:underline hover:underline 
                                    p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                                        @click="() => openBarcodeModal(item)">{{ item.quantity }}</span>
                                </div> -->

                                <!-- Quantity Column -->
                                <div class="col-span-2 flex items-center justify-center gap-1">
                                    <div class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5">
                                        <button @click="decreaseQty(index)"
                                            class="w-7 h-7 z-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <i class="fas fa-minus text-xs"></i>
                                        </button>
                                        <!-- <span class="w-5 text-center text-sm font-medium dark:text-white">{{
                                            item.quantity }}</span> -->
                                        <!-- //input quantity -->
                                        <input type="number" v-model="item.quantity" min="0" max="999999" step="1"
                                            @input="handleQtyInput($event, index)"
                                            class="w-20 pl-2 py-1 -mx-5 z-5 text-center text-sm font-medium dark:text-white bg-gray-100 dark:bg-gray-700 
                                         border rounded-lg focus:outline-none focus:ring-0 focus:ring-gray-400 focus:border-gray-200"
                                            :class="item.error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100 dark:border-gray-600'" />
                                        <!-- //input quantity -->

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

                <!-- Right Section - Transfer Summary -->
                <div class="w-full lg:w-96 space-y-4 flex flex-col overflow-hidden">
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700 flex-1 flex flex-col overflow-hidden">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Movement Summary</h3>

                        <div class="space-y-3 mb-6">
                            <!-- Total Items -->
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-sm text-gray-600 dark:text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-boxes text-blue-400"></i>
                                    Total Items
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{
                                    totalProductsQty }} items</span>
                            </div>

                            <!-- Unique Products -->
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="text-sm text-gray-600 dark:text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-cubes text-green-400"></i>
                                    Unique Products
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{
                                    cartItems.length }} products</span>
                            </div>

                            <!-- Movement Info -->
                            <div class="flex justify-between items-center py-2">
                                <span
                                    class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <i class="fas fa-arrows-alt-h text-purple-400"></i>
                                    Transfer Type
                                </span>
                                <span class="text-sm font-medium text-gray-700">
                                    {{ from_location_type }}
                                    →
                                    {{ to_location_type }}
                                </span>
                            </div>
                            <!-- Movement Info -->
                            <div class="flex justify-between items-center">
                                <span
                                    class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">

                                </span>
                                <span class="text-sm font-medium text-gray-700">

                                    {{ getFromLocationName() ? getFromLocationName() : 'Not Select From Location' }}
                                    →

                                    {{ getToLocationName() ? getToLocationName() : 'Not Select To Location' }}
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
                                <i class="fas fa-paper-plane"></i>
                                <span>{{ isSubmitting ? 'Submitting...' : 'Submit Movement' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== CONFIRMATION MODAL ===== -->
            <BaseModal v-model="showConfirmModal" classes="modal-container" content-class="modal-content" maxWidth="4xl"
                overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col h-full">
                    <!-- Header -->
                    <div
                        class="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-md">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-xl font-bold">Confirm Stock Movement</h2>
                                <p class="text-sm opacity-80 mt-1">Review all items before confirming</p>
                            </div>
                            <div class="text-right text-sm">
                                <p class="opacity-90">Date: {{ formatDate(movement_date) }}</p>
                                <p class="opacity-90 mt-1">
                                    From: <span class="capitalize font-medium">{{ from_location_type }}</span>
                                    <span v-if="from_location_type === 'warehouse'" class="ml-1">→ {{
                                        getFromLocationName() }}</span>
                                    <span v-if="from_location_type === 'dealer'" class="ml-1">→ {{
                                        getFromLocationName() }}</span>
                                </p>
                                <p class="opacity-90 mt-1">
                                    To: <span class="capitalize font-medium">{{ to_location_type }}</span>
                                    <span v-if="to_location_type === 'warehouse'" class="ml-1">→ {{ getToLocationName()
                                    }}</span>
                                    <span v-if="to_location_type === 'dealer'" class="ml-1">→ {{ getToLocationName()
                                    }}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Info -->
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

                    <!-- Items Table -->
                    <div class="flex-grow overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Variant Package
                                    </th>
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
                                                <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-center text-sm text-gray-700">{{
                                        getSelectedVariantPackageName(item) }}</td>
                                    <td class="px-4 py-3 text-center text-sm font-medium text-gray-900">{{ item.quantity
                                    }}</td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-gray-50">
                                <tr class="border-t border-gray-300">
                                    <td colspan="4" class="px-4 py-3 text-right font-bold text-gray-900">Total Items:
                                    </td>
                                    <td class="px-4 py-3 text-center text-xl font-bold text-blue-600">{{
                                        totalProductsQty }}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                        <div class="flex justify-end gap-3">
                            <button @click="showConfirmModal = false"
                                class="px-6 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                            <button @click="submitMovement" :disabled="isSubmitting"
                                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-check-circle"></i>
                                <span>{{ isSubmitting ? 'Processing...' : 'Confirm Movement' }}</span>
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
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Movement Successful!</h3>
                    <p class="text-gray-600 mb-6">Stock movement has been processed successfully.</p>
                    <div class="bg-gray-50 px-4 py-3 rounded-lg mb-6 w-full">
                        <p class="text-sm text-gray-500">Reference Number</p>
                        <p class="font-medium text-gray-900"># {{ lastMovementData?.reference_no || 'N/A' }}</p>
                    </div>
                    <div class="flex justify-between items-center w-full gap-3 pt-4">

                        <button @click="showSuccessModal = false"
                            class="border w-[50%] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition-all font-medium">
                            <i class="fas fa-check"></i> Close
                        </button>

                        <button @click="printChallan(lastMovementData.id)" v-permission="['stock_movements.view']"
                            class="border w-auto mt-3 mx-auto items-center rounded-lg mb-3 px-4 py-2 text-left text-md font-md text-gray-700 bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <span class=" gap-2"><i class="fas fa-download animate-bounce mr-3"></i>Download
                                Challan</span>
                        </button>

                    </div>
                </div>
            </BaseModal>

            <!-- Modal for viewing scanned barcodes -->
            <BaseModal v-model="showBarcodeModal" classes="modal-container" content-class="modal-content max-w-lg"
                overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Scanned Barcodes</h3>
                    <div v-if="selectedItemBarcodes.length > 0" class="space-y-3">
                        <div v-for="(barcode, index) in selectedItemBarcodes" :key="index"
                            class="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                            <span class="text-sm text-gray-700">{{ barcode }}</span>
                            <!-- <button @click="removeBarcode(index, barcode)" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash-alt"></i>
                            </button> -->
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-500 py-6">
                        <i class="fas fa-barcode text-4xl mb-3"></i>
                        <p>No barcodes scanned for this product.</p>
                    </div>
                    <button @click="showBarcodeModal = false"
                        class="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Close
                    </button>
                </div>
            </BaseModal>

            <!-- Product Browser Modal -->
            <BaseModal v-model="showItemModal" classes="modal-container" maxWidth="6xl" title="Select Products"
                content-class="modal-content" overlay-transition="vfm-fade" content-transition="vfm-slide-up">
                <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">

                    <!-- Search -->
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

                    <!-- Product List -->
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
                                        <p v-if="product.sku" class="text-xs text-gray-500 dark:text-gray-400">SKU: {{ product.sku }}</p>
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
import FlatPickr from 'vue-flatpickr-component'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import { useWarehouseStore } from '@/stores/warehouseStore'

// ── Stores ──────────────────────────────────────────────────────────
const warehouseStore = useWarehouseStore()
const toast = useToast()

// ── Props ────────────────────────────────────────────────────────────
const props = defineProps({ metaInfo: Object })

// ── Flatpickr config ─────────────────────────────────────────────────
const config = {
    enableTime: false,
    dateFormat: "Y-m-d",
    defaultDate: new Date()
}
const selectedWarehouse = computed(() => {
    const warehouse = warehouses.value.find(w => w.is_default === true || w.is_default === 1)
    return warehouse ? warehouse.id : ''
})

// ── Reactive state ───────────────────────────────────────────────────
const movement_date = ref(new Date())

// Location data
const from_location_type = ref('warehouse')
const to_location_type = ref('warehouse')
const from_location_id = ref('')
const to_location_id = ref('')
const fromLocationError = ref(false)
const toLocationError = ref(false)

// Lists
const warehouses = ref([])
const allDealers = ref([])

// Cart
const cartItems = ref([])

// Barcode
const barcodeInput = ref('')

// Modals
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const showBarcodeModal = ref(false)
const showItemModal = ref(false)

// Product Browser state
const products = ref([])
const productSearch = ref('')
const loadingProducts = ref(false)
const totalProducts = ref(0)
const currentProductPage = ref(1)
const lastProductPage = ref(1)
const itemSearchInput = ref(null)

// Submit
const isSubmitting = ref(false)
const lastMovementData = ref(null)

// Template refs
const barcodeInputRef = ref(null)

// Reactive state for barcode modal
const selectedItemBarcodes = ref([])

// ── Computed ─────────────────────────────────────────────────────────
const totalProductsQty = computed(() => cartItems.value.reduce((s, i) => {
    const qty = parseInt(i.quantity, 10)
    return s + (Number.isNaN(qty) ? 0 : qty)
}, 0))

// ── Methods ───────────────────────────────────────────────────────────

/** Format date helper */
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

/** Get from location name */
const getFromLocationName = () => {
    if (from_location_type.value === 'warehouse') {
        const wh = warehouses.value.find(w => w.id === from_location_id.value)
        return wh ? wh.name : ''
    } else {
        const sup = allDealers.value.find(s => s.id === from_location_id.value)
        return sup ? sup.name : ''
    }
}

/** Get to location name */
const getToLocationName = () => {
    if (to_location_type.value === 'warehouse') {
        const wh = warehouses.value.find(w => w.id === to_location_id.value)
        return wh ? wh.name : ''
    } else {
        const sup = allDealers.value.find(s => s.id === to_location_id.value)
        return sup ? sup.name : ''
    }
}

/** Load warehouses */
const loadWarehouses = async () => {
    try {
        await warehouseStore.getAll()
        warehouses.value = warehouseStore.items || []
        // Set default warehouse
        const defaultWh = warehouses.value.find(w => w.is_default === 1 || w.is_default === true)
        if (defaultWh) {
            from_location_id.value = defaultWh.id
        }
    } catch (e) {
        console.error(e)
        toast.error('Failed to load warehouses')
    }
}

/** Load all dealers */
const loadAllDealers = async () => {
    try {
        const res = await axiosClient.get('/dealers/all')
        allDealers.value = res?.data?.data?.data || res?.data?.data || []
    } catch (e) {
        console.error(e)
        toast.error('Failed to load dealers')
    }
}

/** Handle location changes */
const handleFromLocationChange = () => {
    from_location_id.value = ''
    fromLocationError.value = false
}

const handleToLocationChange = () => {
    to_location_id.value = ''
    toLocationError.value = false
}

const clearFromLocationError = () => {
    fromLocationError.value = false
}

const clearToLocationError = () => {
    toLocationError.value = false
}

// Product Browser methods
const openProductBrowser = () => {
    if (!from_location_id.value) {
        toast.warning('Please select a from location first')
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
        // toast.error('Failed to load products')
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

// Watch for modal open to load products
watch(() => showItemModal.value, (newVal) => {
    if (newVal) {
        currentProductPage.value = 1
        searchProducts()
    }
})


/** Handle barcode scan - uses the QR code scan API */
let isScanning = false; // Flag to prevent multiple scans
const scanSerialNo = ref([]) // To keep track of scanned serial numbers and prevent duplicates in cart;

const handleBarcodeScan = async () => {

    //check from location and to location
    if (!from_location_id.value) {
        toast.warning('Please select a from location');
        return;
    }

    if (isScanning) return; // Prevent concurrent execution
    isScanning = true;

    const code = barcodeInput.value?.trim();
    if (!code) {
        toast.warning('Please enter or scan a code');
        isScanning = false;
        return;
    }
    // if (scanSerialNo.value.includes(code)) {
    //     toast.warning('This code has already been scanned');
    //     isScanning = false;
    //     return;
    // }


    try {
        // Call the QR code scan API
        const response = await axiosClient.get(`/packagings/scan/${encodeURIComponent(code)}?from_location_id=${from_location_id.value}&from_location_type=${from_location_type.value}`);

        if (response.data.success && response.data.status === 200) {
            const productData = response.data.data;

            scanSerialNo.value.push(code); // Add the scanned serial number to the array

            // console.log('Scanned product serial number:', productData.serial_no);


            // Check if product with same unit exists in cart to increment quantity
            const variantPackages = Array.isArray(productData.variant_packages) ? productData.variant_packages : [];
            const usedIds = getSelectedVariantPackageIds(-1);
            const firstAvailable = variantPackages.find(pkg => !usedIds.includes(pkg.id));

            const newItem = {
                row_id: `${productData.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                id: productData.id,
                name: productData.name,
                sku: productData.sku || '-',
                serial_no: productData.serial_no || null,
                quantity: 1,
                image_url: productData.image_url || null,
                variant_packages: variantPackages,
                variant_package_id: firstAvailable?.id || '',
                package_serial: productData.package_serial,
                barcodes: [productData.serial_no].filter(Boolean),
                error: null
            };
            cartItems.value.push(newItem);

            // Clear input and focus
            barcodeInput.value = '';
            await nextTick();
            barcodeInputRef.value?.focus();
        } else {
            toast.error(response.data.message || 'Failed to fetch product');
        }
    } catch (error) {
        console.error('Barcode scan error:', error);
        toast.error(error.response?.data?.message || 'Failed to scan barcode');
        barcodeInput.value = '';
        barcodeInputRef.value?.focus();
    } finally {
        isScanning = false; // Reset the flag
    }
};
// Cart operations
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
        const item = cartItems.value[index]
    }
}
const handleQtyInput = (event, index) => {
    let value = event.target.value

    // Allow empty string/backspace
    if (value === '') {
        cartItems.value[index].quantity = ''
        return
    }

    // Keep only numbers
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

    // Clear error when quantity is changed
    if (cartItems.value[index].error) {
        cartItems.value[index].error = null
    }
}

/** Remove item from cart */
const removeItem = (index) => {
    const removedItem = cartItems.value[index]
    // Remove all associated barcodes from the scan tracker so they can be re-scanned
    if (removedItem.barcodes) {
        removedItem.barcodes.forEach(barcode => {
            const si = scanSerialNo.value.indexOf(barcode);
            if (si !== -1) scanSerialNo.value.splice(si, 1);
        });
    }
    cartItems.value.splice(index, 1)
    toast.info(`Removed ${removedItem.name} from cart`)
}

/** Reset entire cart */
const resetCart = () => {
    if (cartItems.value.length > 0) {
        cartItems.value = []
        scanSerialNo.value = [];
        // toast.info('Cart cleared')
    }
}

watch(showSuccessModal, (newValue = false) => {
    if (!newValue) {
        resetCart()
    }
})

/** Validate before showing confirm modal */
const handleSubmitClick = () => {
    if (cartItems.value.length === 0) {
        toast.warning('Please add items to cart')
        return
    }

    // Validate from location
    if (!from_location_id.value) {
        fromLocationError.value = true
        toast.warning(`Please select a ${from_location_type.value}`)
        return
    }

    // Validate to location
    if (!to_location_id.value) {
        toLocationError.value = true
        toast.warning(`Please select a ${to_location_type.value}`)
        return
    }

    // Validate from and to are not the same
    if (from_location_type.value === to_location_type.value && from_location_id.value === to_location_id.value) {
        toast.warning('Source and destination locations cannot be the same')
        return
    }

    const zeroOrEmptyQtyItems = cartItems.value.filter(item => !item.quantity || parseInt(item.quantity) <= 0)
    if (zeroOrEmptyQtyItems.length > 0) {
        toast.warning('Quantity 0 is not allowed. Please enter a valid quantity.')
        return
    }

    // Validate that each item has variant package selected
    for (const item of cartItems.value) {
        if (!item.variant_package_id) {
            item.error = `Please select a variant package for ${item.name}.`
            toast.error(`Validation failed. Please select variant package for ${item.name}.`)
            return
        }
    }

    showConfirmModal.value = true
}

const submitMovement = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    const items = []
    const itemMapping = [] // To map payload items back to cartItems

    try {
        cartItems.value.forEach((item, cartIdx) => {
            // Clear previous errors
            item.error = null

            items.push({
                product_id: item.id,
                variant_package_id: Number(item.variant_package_id),
                quantity: parseInt(item.quantity, 10),
            })
            itemMapping.push(cartIdx)
        })

        const payload = {
            from_location_type: from_location_type.value,
            from_location_id: parseInt(from_location_id.value),
            to_location_type: to_location_type.value,
            to_location_id: parseInt(to_location_id.value),
            cart_items: items
        }

        const response = await axiosClient.post('/stock-movements', payload)

        if (response.data.success !== false && response.data.data) {
            toast.success('Stock movement completed successfully')
            lastMovementData.value = response.data.data
            showConfirmModal.value = false
            showSuccessModal.value = true

            // Reset cart after successful submission
            resetCart()
        } else {
            // Case where backend returns 200 but success: false (sometimes happens)
            const errorData = response.data
            toast.error(errorData.message || 'Failed to create stock movement')

            if (errorData.errors) {
                handleValidationErrors(errorData.errors, itemMapping)
                showConfirmModal.value = false
            }
        }
    } catch (error) {
        console.error('Submit error:', error)
        const errorData = error.response?.data
        const errorMessage = errorData?.message || 'Failed to submit stock movement'
        toast.error(errorMessage)

        // Display validation errors if any
        if (errorData?.errors) {
            handleValidationErrors(errorData.errors, itemMapping)
            showConfirmModal.value = false
        }
    } finally {
        isSubmitting.value = false
    }
}

/** Helper to map validation errors to cart items */
const handleValidationErrors = (errors, itemMapping) => {
    if (Array.isArray(errors)) {
        errors.forEach(errStr => {
            const match = String(errStr).match(/cart_items\.(\d+):\s*(.*)/)
            if (match) {
                const payloadIdx = parseInt(match[1])
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
                const payloadIdx = parseInt(match[1])
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

/** Format date for API (YYYY-MM-DD) */
const formatDateForAPI = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split('T')[0]
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
    return d.toISOString().split('T')[0]
}

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(async () => {
    await Promise.all([
        loadWarehouses(),
        loadAllDealers()
    ])

    // Focus on barcode input
    setTimeout(() => {
        barcodeInputRef.value?.focus()
    }, 500)


})


let scanBuffer = ''
let lastKeyTime = Date.now()

const handleGlobalScanner = (e) => {
    const now = Date.now()

    if (now - lastKeyTime > 50) {
        scanBuffer = ''
    }

    lastKeyTime = now

    if (e.key === 'Enter') {
        if (scanBuffer.length > 3) {
            barcodeInput.value = scanBuffer
            handleBarcodeScan()
        }
        scanBuffer = ''
        return
    }

    if (e.key.length === 1) {
        scanBuffer += e.key
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleGlobalScanner)
})

const openBarcodeModal = (item) => {
    // If each item has multiple barcodes stored
    if (item.barcodes && Array.isArray(item.barcodes)) {
        selectedItemBarcodes.value = [...item.barcodes]
    } else if (item.serial_no) {
        // fallback if only one serial exists
        selectedItemBarcodes.value = [item.serial_no]
    } else {
        selectedItemBarcodes.value = []
    }

    showBarcodeModal.value = true
}
const removeBarcode = (index, barcode) => {

    console.log('Removing barcode at index:', index, 'with value:', barcode)
    //remove from selectedItemBarcodes
    selectedItemBarcodes.value.splice(index, 1)
    //then quantity down by 1   
    cartItems.value[index].quantity -= 1

    if (cartItems.value[index].quantity <= 0) {
        cartItems.value.splice(index, 1)
    }

    scanSerialNo.value.splice(scanSerialNo.value.indexOf(barcode), 1)
}

const filteredWarehouses = computed(() => {
    return warehouses.value.filter(wh => wh.id !== from_location_id.value)
})

// Print printChallan
const printChallan = (printChallanId) => {
    if (printChallanId) {
        axiosClient.get(`/stock-movements/${printChallanId}/download-challan`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `challan_${printChallanId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error('Error printing challan:', error);
                toast.error('Failed to print challan');
            })
    }
};
</script>