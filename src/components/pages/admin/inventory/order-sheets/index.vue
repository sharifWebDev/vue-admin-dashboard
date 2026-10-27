<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">All Order Sheets</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col gap-4 mb-4">
            <!-- Top Row: Create Button and Search -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <!-- Left Side: Create Button -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <button @click="openCreateSale" v-permission="['quotations.create']"
                        class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                        <i class="fas fa-plus"></i>
                        <span>New</span>
                    </button>
                </div>

            </div>

            <!-- Filter Row -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                <!-- warehouse filter -->
                <div>
                    <SearchSelect v-model="filters.warehouse_id" :options="warehouseStoreItems" label="Warehouse"
                        placeholder="-- All Warehouses --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>
                <!-- Dealer Filter -->
                <div>
                    <SearchSelect v-model="filters.dealer_id" :options="dealerStoreItems" label="Customer"
                        placeholder="-- All Customer --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- Status Filter -->
                <div>
                    <SearchSelect v-model="filters.status" :options="statusOptions" label="Status"
                        placeholder="-- All Status --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- From Date Filter -->
                <div>
                    <BaseInput v-model="filters.from_date" label="From Date" type="date" placeholder="Select From Date"
                        :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- To Date Filter -->
                <div>
                    <BaseInput v-model="filters.to_date" label="To Date" type="date" placeholder="Select To Date"
                        :clearable="true" @update:model-value="handleFilterChange" />
                </div>
                <!-- Right Side: Search -->
                <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-6">
                    <div class="relative flex-grow max-w-md">
                        <input v-model="searchQuery" @input="handleSearch" type="search"
                            placeholder="Search by invoice no, dealer name..."
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search text-base"></i>
                        </div>
                    </div>
                    <div
                        class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1">
                        <button @click="refreshData"
                            class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" :disabled="refresh">
                            <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>


        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="saleStore.sortBy"
                        :sort-direction="saleStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
                        @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="saleStore.loading" :is-loading="true" :total-items="saleStore.totalItems"
                        :item-name="'sales'" loading-text="Loading Order Sheets..."
                        loading-subtext="Fetching your order sheets data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Empty State -->
                        <TableLoadingState v-if="saleStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :has-search="!!searchQuery" :item-name="'sales'" empty-icon="fas fa-shopping-cart"
                            empty-title="No Order Sheets found"
                            :empty-message="searchQuery ? 'No Order Sheets match your search criteria.' : 'Get started by creating your first Order Sheet.'"
                            :create-button-text="'Create'" @create="openCreateSale" @clear-search="clearSearch" />

                        <tr v-else v-for="(sale, index) in displayedItems" :key="sale.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ sale.number || 'N/A' }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Date: {{
                                    formatDate(sale.date) }}</p>
                            </td>
                            <td class="px-6 py-3">
                                <p class="text-sm text-gray-900 dark:text-white">
                                     {{ sale.type === 'dealer' ? 'Customer' : 'Warehouse' }}</p>
                                <!-- warehouse_name -->
                                <p v-if="sale.warehouse_name" class="text-xs text-gray-500 dark:text-gray-400">
                                    Name: {{ sale.warehouse_name }}</p>
                                <!-- dealer_name -->
                                <p v-if="sale.dealer_name" class="text-xs text-gray-500 dark:text-gray-400">
                                    Name: <span class="text-gray-900 dark:text-white">
                                         {{ sale.dealer_name }}</span></p>
                            </td>
                            <td class="px-6 py-3 text-center text-sm text-gray-900 dark:text-white">
                                {{ sale.price_type || '-' }}
                            </td>
                            <!-- <td class="px-6 py-3 text-right text-sm text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.subtotal) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                ৳{{ formatNumber(sale.discount_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm text-blue-600 dark:text-blue-400">
                                {{ formatNumber(sale.vat_percentage) }} %
                            </td> -->
                            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.total) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.advance_paid_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.payable) }}
                            </td>

                            <td class="px-6 py-3 text-center">
                                <span :class="getStatusClass(sale.status)">
                                    {{ sale.status }}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewSale(sale)" v-permission="['quotations.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button @click="printInvoice(sale)" v-permission="['quotations.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Download Invoice">
                                        <i class="fas fa-download"></i>
                                    </button>

                                    <!-- print -->
                                    <button @click="print(sale?.id)" v-permission="['sales_invoices.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Print Order Sheet">
                                        <i class="fas fa-print"></i>
                                    </button>

                                    <div class="relative inline-block text-left"
                                        v-click-outside="() => sale.showDropdown = false"
                                        v-permission="['quotations.update', 'quotations.delete', 'quotations.convert']">
                                        <button @click="sale.showDropdown = !sale.showDropdown"
                                            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Actions">
                                            <i class="fas fa-ellipsis-v"
                                                :class="sale.status == 'pending' ? 'text-gray-600 dark:text-gray-200' : 'text-red-400 dark:text-red-600'">
                                            </i>
                                        </button>

                                        <div v-if="sale.showDropdown && sale.status =='pending'" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700">
                                            <div class="py-1 w-full">
                                                <!-- due_amount >0 then show Pay Now button -->
                                                <button v-if="sale.status == 'pending' && sale.type == 'dealer'"
                                                    @click="convertToSale(sale); sale.showDropdown = false"
                                                    v-permission="['quotations.convert']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-shopping-cart text-green-500"></i>
                                                    Convert To Sale
                                                </button>

                                                <!-- convert to transfer -->
                                                <button v-if="sale.status == 'pending' && sale.type == 'warehouse'"
                                                    @click="convertToTransfer(sale); sale.showDropdown = false"
                                                    v-permission="['quotations.convert']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-exchange-alt text-green-500"></i>
                                                      Transfer
                                                </button>

                                                <button v-if="sale.status == 'pending'"
                                                    @click="editSale(sale.id); sale.showDropdown = false"
                                                    v-permission="['quotations.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>
                                                <button @click="confirmDelete(sale); sale.showDropdown = false"
                                                    v-permission="['quotations.delete']"
                                                    class="hiddend w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                    <i class="fas fa-trash"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="saleStore.pagination && saleStore.pagination.total > 0" class="mt-6">
            <Pagination :total-items="saleStore.pagination.total" :per-page="saleStore.pagination.per_page"
                :current-page="saleStore.pagination.current_page" :last-page="saleStore.pagination.last_page"
                :is-loading="saleStore.loading" @change-page="handlePageChange"
                @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- View Sale Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="5xl" title="Order Sheet Details"
        @close="closeViewModal">
        <!-- Loading State -->
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading details...</p>
        </div>

        <!-- Content -->
        <div v-else-if="viewingSale" class="px-6 py-4">

            <button @click="printInvoice(viewingSale)" v-if="viewingSale"
                class="w-auto border rounded-lg -mt-8 mb-3 px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <i class="fas fa-download"></i>Download Invoice
            </button>

            <!-- Header Information -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div class="col-span-2">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Quotation No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{ viewingSale.number ||
                            'N/A' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(viewingSale.date) }}
                        </p>
                    </div>
                    <!-- price type -->
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price
                            Type</label>
                        <p class="mt-1">
                            <span class="text-sm text-gray-900 dark:text-white">{{ viewingSale.price_type || '-' }}
                            </span>
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                        <p class="mt-1">
                            <span :class="getStatusClass(viewingSale.status)">
                                {{ viewingSale.status }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Dealer & Warehouse Information -->
            <div v-if="viewingSale.type == 'dealer'" class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-store mr-2"></i>Customer Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ viewingSale.dealer_name ||
                            '-' }}</p>
                    </div> 
                </div>
            </div>
            <div v-if="viewingSale.type == 'warehouse'" class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-store mr-2"></i>Warehouse Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Warehouse Name</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ viewingSale.warehouse_name ||
                            '-' }}</p>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="mb-6" v-if="viewingSale.items && viewingSale.items.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Items ({{ viewingSale.items.length }} items)
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    #</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Product</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Variant Package</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Unit Price</th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Quantity</th>
                                <!-- <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Discount</th> -->
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            <tr v-for="(item, index) in viewingSale.items" :key="item.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ index + 1 }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2">
                                        <img v-if="item.image_url" :src="item.image_url" alt="Product Image"
                                            class="w-16 h-16 bg-gray-50 dark:bg-gray-700 object-cover rounded-lg border border-gray-200 dark:border-gray-700">
                                        <span v-else class="w-16 h-16 bg-gray-50 dark:bg-gray-700 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">    
                                            <i class="fas fa-box text-gray-400 dark:text-gray-500"></i>
                                        </span>
                                            <div>
                                            <p class="text-sm text-gray-900 dark:text-white font-medium">{{
                                                item.product_name }}</p>
                                            <p class="text-xs text-gray-500"
                                                v-if="item.serial_no && item.serial_no.length">
                                                SN: {{ item.serial_no.join(', ') }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div v-if="item.variant_name">
                                        {{ item.variant_name }} - {{ item.quantity }} {{ item.package_name }}
                                    </div>
                                    <div v-else class="text-gray-400 dark:text-gray-500 italic">
                                        No Variant Package
                                    </div>
                                    
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">৳ {{
                                    formatNumber(item.unit_price) }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">{{ item.quantity
                                }}</td>
                                <!-- <td class="px-4 py-3 text-sm text-green-600 dark:text-green-400 text-right">৳ {{
                                    formatNumber(item.discount_amount) }}</td> -->
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">৳ {{
                                    formatNumber(item.total) }}</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td colspan="5"
                                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Subtotal:
                                </td>
                                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                    ৳ {{ formatNumber(viewingSale.subtotal) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Discount ({{ formatNumber(viewingSale.discount_percentage) }}%):
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳ {{ formatNumber(viewingSale.discount_amount) }}
                                </td>
                            </tr>
                            <tr v-if="viewingSale.vat_percentage > 0">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    VAT ({{ formatNumber(viewingSale.vat_percentage) }}%):
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                                    ৳ {{ formatNumber(viewingSale.total - viewingSale.subtotal +
                                        viewingSale.discount_amount) }}
                                </td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="5"
                                    class="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-white">
                                    Total:
                                </td>
                                <td class="px-4 py-3 text-right text-xl font-bold text-blue-600 dark:text-blue-400">
                                    ৳ {{ formatNumber(viewingSale.total) }}
                                </td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Advance Paid:
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳ {{ formatNumber(viewingSale.advance_paid_amount) }}
                                </td>
                            </tr>
                            <!-- payable -->
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Payable:
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳ {{ formatNumber(viewingSale.total - viewingSale.advance_paid_amount) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    <!-- notes -->
                    <div v-if="viewingSale.notes" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
                        <p v-html="viewingSale.notes" class="text-sm text-gray-900 dark:text-white mt-1"></p>
                    </div>
                </div>
            </div> 
        </div>

        <!-- Error State -->
        <div v-else-if="!viewLoading && !viewingSale" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load sale details</p>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Sale" maxWidth="lg" :showClose="false" @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Order Sheet</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete order sheet <strong>{{ deletingSale?.number || 'this item'
                    }}</strong>?
                    This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="saleStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    saleStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="saleStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Pay Now Modal -->
    <BaseModal :show="showPayModal" title="Make Payment" maxWidth="md" @close="closePayModal">
        <div class="px-6 py-4">
            <div class="space-y-4">
                <NumberInput v-model="paymentData.amount_paid" label="Payment Amount" type="number" min="1" :step="any"
                    placeholder="Enter amount" :required="true" :error="paymentErrors.amount_paid" />

                <SearchSelect v-model="paymentData.payment_method" :options="paymentMethods" label="Payment Method"
                    placeholder="Select payment method" :required="true" :error="paymentErrors.payment_method" />

                <TextInput v-if="paymentData.payment_method === 'check'" v-model="paymentData.cheque_number"
                    label="Cheque Number" placeholder="Enter cheque number" :required="true"
                    :error="paymentErrors.cheque_number" />

                <TextInput v-if="paymentData.payment_method === 'mobile_banking'" v-model="paymentData.cell_number"
                    label="Cell Number" placeholder="Enter cell number" :required="true"
                    :error="paymentErrors.cell_number" />

                <TextInput v-if="paymentData.payment_method === 'bank_transfer'" v-model="paymentData.transaction_id"
                    label="Transaction ID" placeholder="Enter transaction ID" :required="true"
                    :error="paymentErrors.transaction_id" />

                <TextInput v-model="paymentData.payment_date" label="Payment Date" type="date" :required="true"
                    :error="paymentErrors.payment_date" />
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button @click="closePayModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="submitPayment" :disabled="paymentLoading"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    <i v-if="paymentLoading" class="fas fa-spinner fa-spin"></i>
                    {{ paymentLoading ? 'Processing...' : 'Submit Payment' }}
                </button>
            </div>
        </div>
    </BaseModal>
    <!-- Convert to Sale Confirmation Modal -->
    <BaseModal :show="showConvertModal" title="Convert to Sale" maxWidth="lg" :showClose="false"
        @close="closeConvertModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <i class="fas fa-shopping-cart text-blue-600 dark:text-blue-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Convert to Sale</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to convert order sheet <strong>{{ convertingOrder?.number || 'this order'
                    }}</strong> to a sale?
                    This will create a new sales invoice.
                </p>

                <div class="text-left space-y-4 mb-6">
                    <SearchSelect v-model="selectedWarehouseId" :options="warehouseStoreItems" label="Select Warehouse"
                        placeholder="Choose a warehouse" :required="true" />

                    <NumberInput v-model="convertPaidAmount" label="Paid Amount" placeholder="Enter amount" :min="0" />
                </div>
            </div>
            <!-- orderConvertError.value -->
            <div v-if="orderConvertError?.items?.length" class="text-red-500 dark:text-red-500 text-sm mb-2">
                <div v-for="(item, index) in orderConvertError.items" :key="index">
                    <p>{{ item }}</p>
                </div>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeConvertModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleConvert" :disabled="convertLoading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    convertLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                ]">
                    <span v-if="convertLoading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Converting...
                    </span>
                    <span v-else>Confirm</span>
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import { useOrderStore } from '@/stores/orderStore.js';
import { useDealerStore } from '@/stores/dealerStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';
import NumberInput from '@/components/common/NumberInput.vue';
import BaseInput from '@/components/common/BaseInput.vue';

const toast = useToast();
const viewLoading = ref(false);
const refresh = ref(false);

// Table columns configuration
const tableColumns = ref([
    {
        "key": "number",
        "label": "Order Info",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "type",
        "label": "Order For",
        "sortable": true,
        "type": "varchar",
    },
    // price type
    {
        "key": "price_type",
        "label": "Price Type",
        "sortable": true,
        "type": "varchar",
        "class": "text-center",
        "align": "center"
    },
    // {
    //     "key": "subtotal",
    //     "label": "Subtotal",
    //     "sortable": true,
    //     "type": "decimal",
    //     "class": "text-right",
    //     "align": "right"
    // },
    // {
    //     "key": "total_discount",
    //     "label": "Discount",
    //     "sortable": true,
    //     "type": "decimal",
    //     "class": "text-right",
    //     "align": "right"
    // },
    // {
    //     "key": "vat_percentage",
    //     "label": "Vat",
    //     "sortable": true,
    //     "type": "decimal",
    //     "class": "text-right",
    //     "align": "right"
    // },
    {
        "key": "total",
        "label": "Grand Total",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    // advance_paid_amount
    {
        "key": "advance_paid_amount",
        "label": "Advance Paid",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    // payable
    {
        "key": "payable",
        "label": "Payable",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "payment_status",
        "label": "Status",
        "sortable": true,
        "type": "enum"
    }
]);

// Status options based on API
const statusOptions = ref([
    { id: 'converted', name: 'Converted' },
    { id: 'transferred', name: 'Transferred' },
    { id: 'pending', name: 'Pending' },
]);

// Filter state
const filters = ref({
    dealer_id: null,
    status: null,
    from_date: '',
    to_date: ''
});

const saleStore = useOrderStore();
const dealerStore = useDealerStore();
const warehouseStore = useWarehouseStore();
const router = useRouter();

// Modal states
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showConvertModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

// Current items
const viewingSale = ref(null);
const deletingSale = ref(null);
const convertingOrder = ref(null);
const selectedWarehouseId = ref(null);
const convertPaidAmount = ref(0);

// Computed properties
const dealerStoreItems = computed(() => {
    const items = dealerStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.name || item.dealer_name || item.dealer?.name
    })).filter(item => item !== undefined && item !== null);
});

const warehouseStoreItems = computed(() => {
    const items = warehouseStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.name || item.warehouse_name
    }));
});

const displayedItems = computed(() => {
    return saleStore.items || [];
});

const calculateRowNumber = (index) => {
    if (saleStore.pagination?.from && saleStore.pagination.from > 0) {
        return saleStore.pagination.from + index;
    }
    return (saleStore.pagination?.current_page - 1) * (saleStore.pagination?.per_page || 10) + index + 1;
};

// Helper functions
const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return date;
};

const formatStatus = (status) => {
    const statusMap = {
        'completed': 'Completed',
        'pending': 'Pending',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status || 'N/A';
};

const getStatusClass = (status) => {
    const classes = {
        'transferred': 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'converted': 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'pending': 'px-2 py-1 text-xs rounded-full inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return classes[status] || classes.pending;
};

const getDueClass = (dueAmount) => {
    if (dueAmount === 0) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400 font-semibold';
};

// Filter handlers
const handleFilterChange = () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }

    filterTimeout = setTimeout(async () => {
        const filterParams = {};

        if (filters.value.dealer_id) {
            filterParams.dealer_id = filters.value.dealer_id;
        }
        if (filters.value.status) {
            filterParams.status = filters.value.status;
        }
        if (filters.value.from_date) {
            filterParams.from_date = filters.value.from_date;
        }
        if (filters.value.to_date) {
            filterParams.to_date = filters.value.to_date;
        }

        await saleStore.get(filterParams);
    }, 400);
};

// Search with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await saleStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    saleStore.search('');
};

const clearAllFilters = () => {
    filters.value = {
        dealer_id: null,
        status: null,
        from_date: '',
        to_date: ''
    };
    handleFilterChange();
};

// Lifecycle
onMounted(async () => {
    await Promise.all([
        getData(),
        loadRelatedData()
    ]);
});

const getData = async () => {
    await saleStore.get();
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

const loadRelatedData = async () => {
    await Promise.all([
        dealerStore.getAll(),
        warehouseStore.getAll()
    ]);
};

// Navigation functions
const openCreateSale = () => {
    router.push({ name: 'new-order-sheet' });
};

const editSale = (saleId) => {
    router.push({ name: 'order-sheet-edit', params: { id: saleId } });
};

// View sale
const viewSale = async (sale) => {
    try {
        viewLoading.value = true;
        showViewModal.value = true;

        const response = await saleStore.show(sale.id);

        if (response && response.success) {
            viewingSale.value = response.data;
        } else {
            toast.error('Failed to fetch sale details');
            closeViewModal();
        }
    } catch (error) {
        toast.error('An error occurred while fetching sale details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};

// Print invoice
const printInvoice = (sale) => {
    if (sale && sale.id) {
        axiosClient.get(`/orders/${sale.id}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `order_${sale.number || sale.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                toast.error('Failed to print invoice');
            })
    }
};

// Delete functions
const confirmDelete = (sale) => {
    deletingSale.value = sale;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (deletingSale.value) {
        const result = await saleStore.deleteItem(deletingSale.value.id);
        if (result.success) {
            // toast.success('Sale deleted successfully');
            closeDeleteModal();
            await getData();
        } else {
            toast.error(result.message || 'Failed to delete sale');
        }
    }
};

// Modal close functions
const closeViewModal = () => {
    showViewModal.value = false;
    viewingSale.value = null;
    viewLoading.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingSale.value = null;
};

const closeConvertModal = () => {
    showConvertModal.value = false;
    convertingOrder.value = null;
    selectedWarehouseId.value = null;
    convertPaidAmount.value = 0;
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await saleStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await saleStore.paginate(page);
};

// Payment functionality
const showPayModal = ref(false);
const paymentLoading = ref(false);
const currentSaleId = ref(null);
const paymentErrors = ref({});
const paymentData = ref({
    amount_paid: 0,
    payment_method: 'cash',
    cheque_number: '',
    cell_number: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0]
});

const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'check', name: 'Cheque' },
    { id: 'mobile_banking', name: 'Mobile Banking' },
    { id: 'bank_transfer', name: 'Bank Transfer' }
];

const payNow = (sale) => {
    currentSaleId.value = sale.id;
    paymentErrors.value = {};
    paymentData.value = {
        amount_paid: sale.due_amount,
        payment_method: 'cash',
        cheque_number: '',
        cell_number: '',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0]
    };
    showPayModal.value = true;
};

const closePayModal = () => {
    showPayModal.value = false;
    currentSaleId.value = null;
    paymentErrors.value = {};
};

const validatePayment = () => {
    paymentErrors.value = {};
    let isValid = true;

    if (!paymentData.value.amount_paid) {
        paymentErrors.value.amount_paid = 'Payment amount is required';
        isValid = false;
    } else if (paymentData.value.amount_paid <= 0) {
        paymentErrors.value.amount_paid = 'Amount must be greater than 0';
        isValid = false;
    }

    if (!paymentData.value.payment_method) {
        paymentErrors.value.payment_method = 'Payment method is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'check' && !paymentData.value.cheque_number) {
        paymentErrors.value.cheque_number = 'Cheque number is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'mobile_banking' && !paymentData.value.cell_number) {
        paymentErrors.value.cell_number = 'Cell number is required';
        isValid = false;
    }

    if (paymentData.value.payment_method === 'bank_transfer' && !paymentData.value.transaction_id) {
        paymentErrors.value.transaction_id = 'Transaction ID is required';
        isValid = false;
    }

    if (!paymentData.value.payment_date) {
        paymentErrors.value.payment_date = 'Payment date is required';
        isValid = false;
    }

    return isValid;
};

const submitPayment = async () => {
    if (!currentSaleId.value) return;

    if (!validatePayment()) {
        // toast.warning('Please fix the errors in the form');
        // focus on the first error
        if (paymentErrors.value.amount_paid) {
            document.getElementById('amount_paid').focus();
        } else if (paymentErrors.value.payment_method) {
            document.getElementById('payment_method').focus();
        } else if (paymentErrors.value.cheque_number) {
            document.getElementById('cheque_number').focus();
        } else if (paymentErrors.value.cell_number) {
            document.getElementById('cell_number').focus();
        } else if (paymentErrors.value.transaction_id) {
            document.getElementById('transaction_id').focus();
        } else if (paymentErrors.value.payment_date) {
            document.getElementById('payment_date').focus();
        }
        return;
    }

    paymentLoading.value = true;
    try {
        const response = await axiosClient.post(`/sales-invoices/${currentSaleId.value}/payments`, paymentData.value);
        if (response.data.success) {
            toast.success(response.data.message || 'Payment submitted successfully');
            closePayModal();
            getData();
        } else {
            toast.error(response.data.message || 'Failed to submit payment');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to submit payment';
        toast.error(errorMessage);
    } finally {
        paymentLoading.value = false;
    }
};
const sortByColumn = async (column) => {
    const order = saleStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await saleStore.sort(column, order);
};

const convertLoading = ref(false);
const convertToSale = (sale) => {
    convertingOrder.value = sale;
    selectedWarehouseId.value = null;
    convertPaidAmount.value = sale.payable || 0;
    showConvertModal.value = true;
};
const convertToTransfer = (sale) => {
    router.push('/transfer-convert/' + sale.id + '?type=convert&order-sheets=' + sale.id);
}

const orderConvertError = ref(null);

const handleConvert = async () => {
    if (!convertingOrder.value) return;

    if (!selectedWarehouseId.value) {
        toast.warning('Please select a warehouse');
        return;
    }

    convertLoading.value = true;
    try {
        const result = await axiosClient.post(`/orders/${convertingOrder.value.id}/convert`, {
            warehouse_id: selectedWarehouseId.value,
            paid_amount: convertPaidAmount.value
        });
        if (result.data.success) {
            toast.success(result.data.message || 'Order converted successfully');
            closeConvertModal();
            getData();
        } else {
            toast.error(result.data.message || 'Failed to convert order');
        }
    } catch (error) {
        orderConvertError.value = error.response?.data?.errors || null;

        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            Object.keys(errors).forEach(key => {
                const messages = errors[key];
                if (Array.isArray(messages)) {
                    messages.forEach(msg => toast.error(msg));
                } else {
                    toast.error(messages);
                }
            });
        } else {
            const errorMessage = error.response?.data?.message || 'Failed to convert order';
            toast.error(errorMessage);
        }
    } finally {
        convertLoading.value = false;
    }
};

const print = (salesId) => {
    axiosClient.get(`/orders/${salesId}/download-pdf`, {
        responseType: 'blob'
    }).then((response) => {
        const blob = new Blob([response.data], {
            type: 'application/pdf'
        });

        const url = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            iframe.contentWindow.print();
        };
    });
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>


<!-- 


Sales create and edit page:
 components/pages/admin/inventory/sales/create.vue
 components/pages/admin/inventory/sales/edit.vue

Ami jokhon browse product korbo tokhon sudu Select Products modal ta open hobe and joto bar products e click korbo toto gulu row cart items e add hobe.
and cart items theke Unit field remove hobe sekhane new fields hobe Select varient_package_id, all cart items e varient_package_id select korar dropdown thakbe, akta akta varient_package_id select korle seta next row te thakbe na.  
Select Unit modal ta remove hobe.
submitted form e thakbe:
 

{
    "date": "2026-07-05",
    "dealer_id": 1,
    "price_type": "dealer",
    "vat_percentage": 4,
    "discount_percentage": 5,
    "discount_amount": 43,
    "items": [
        {
        "product_id": 1,
        "quantity": "2",
        "unit_price": 43,
        "discount_amount": 0,
        "total": 86,
        "variant_package_id": 2,
        },
        {
        "product_id": 2,
        "quantity": "3",
        "unit_price": 323,
        "discount_amount": 0,
        "total": 969,
        "variant_package_id": 1,
        }
    ],
    "advance_paid_amount": 822,
    "notes": ""
}

My browse products response is:

Request URL
http://192.168.0.71:8000/api/v1/products/by-warehouse?page=1&per_page=20&search=&is_active=1&from_location_id=1&from_location_type=warehouse
Request Method
GET
Status Code
200 OK

response
{
    "success": true,
    "status": 200,
    "message": "Products fetched successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "name": "Wiks Washing Powder",
                "variant_packages": [
                    {
                        "id": 2,
                        "variant_id": 2,
                        "variant_name": "1kg",
                        "package_name": "Carton",
                        "pieces_per_package": 24,
                        "barcode": "1234",
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 3,
                        "variant_id": 2,
                        "variant_name": "1kg",
                        "package_name": "Carton",
                        "pieces_per_package": 12,
                        "barcode": "4321",
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 5,
                        "variant_id": 2,
                        "variant_name": "1kg",
                        "package_name": "Piece",
                        "pieces_per_package": 1,
                        "barcode": null,
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 6,
                        "variant_id": 3,
                        "variant_name": "2kg",
                        "package_name": "Piece",
                        "pieces_per_package": 1,
                        "barcode": null,
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 7,
                        "variant_id": 7,
                        "variant_name": "500gm",
                        "package_name": "Carton",
                        "pieces_per_package": 50,
                        "barcode": null,
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 8,
                        "variant_id": 7,
                        "variant_name": "500gm",
                        "package_name": "Piece",
                        "pieces_per_package": 1,
                        "barcode": null,
                        "regular_price": 0,
                        "dealer_price": 0,
                        "sub_dealer_price": 0
                    },
                    {
                        "id": 9,
                        "variant_id": 3,
                        "variant_name": "2kg",
                        "package_name": "Piece",
                        "pieces_per_package": 322,
                        "barcode": "3232332323",
                        "regular_price": 232323,
                        "dealer_price": 2323323,
                        "sub_dealer_price": 32323232
                    },
                    {
                        "id": 10,
                        "variant_id": 8,
                        "variant_name": "500 mg",
                        "package_name": "Carton",
                        "pieces_per_package": 30,
                        "barcode": "32323",
                        "regular_price": 50,
                        "dealer_price": 40,
                        "sub_dealer_price": 45
                    },
                    {
                        "id": 11,
                        "variant_id": 7,
                        "variant_name": "500gm",
                        "package_name": "Piece",
                        "pieces_per_package": 1,
                        "barcode": "2121",
                        "regular_price": 55,
                        "dealer_price": 40,
                        "sub_dealer_price": 45
                    }
                ],
                 
            },
            {
                "id": 2,
                "name": "Wiks Dish Washing Powder",
                "variant_packages": [
                    {
                        "id": 12,
                        "variant_id": 9,
                        "variant_name": "1kg",
                        "package_name": "Piece",
                        "pieces_per_package": 1,
                        "barcode": "3232",
                        "regular_price": 3232,
                        "dealer_price": 3232,
                        "sub_dealer_price": 3232
                    }
                ],
                 
            }
        ],
        "links": {
            "first": "http:\/\/192.168.0.71:8000\/api\/v1\/products\/by-warehouse?page=1",
            "last": "http:\/\/192.168.0.71:8000\/api\/v1\/products\/by-warehouse?page=30",
            "prev": null,
            "next": "http:\/\/192.168.0.71:8000\/api\/v1\/products\/by-warehouse?page=2"
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 30,
            "path": "http:\/\/192.168.0.71:8000\/api\/v1\/products\/by-warehouse",
            "per_page": 20,
            "to": 2,
            "total": 581,
            "has_more_pages": true
        }
    }
}
-->