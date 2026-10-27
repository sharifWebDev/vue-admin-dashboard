<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Sales List</h1>
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
                    <button @click="openCreateSale" v-permission="['sales_invoices.create']"
                        class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                        <i class="fas fa-plus"></i>
                        <span>New Sales</span>
                    </button>
                </div>

            </div>

            <!-- Filter Row -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3">
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
                    <TextInput v-model="filters.from_date" label="From Date" type="date" placeholder="Select From Date"
                        :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- To Date Filter -->
                <div>
                    <TextInput v-model="filters.to_date" label="To Date" type="date" placeholder="Select To Date"
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
                        :item-name="'sales'" loading-text="Loading sales..."
                        loading-subtext="Fetching your sales data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Empty State -->
                        <TableLoadingState v-if="saleStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :has-search="!!searchQuery" :item-name="'sales'" empty-icon="fas fa-shopping-cart"
                            empty-title="No sales found"
                            :empty-message="searchQuery ? 'No sales match your search criteria.' : 'Get started by creating your first sale.'"
                            :create-button-text="'Create First Sale'" @create="openCreateSale"
                            @clear-search="clearSearch" />

                        <tr v-else v-for="(sale, index) in displayedItems" :key="sale.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ sale.invoice_no || 'N/A'
                                }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Date: {{
                                    formatDate(sale.invoice_date) }}</p>
                            </td>
                            <td class="px-6 py-3">
                                <p class="text-sm text-gray-900 dark:text-white">
                                    {{ sale.dealer_name || 'Walk-in Customer' }}</p>
                            </td>
                            <td class="px-6 py-3 text-right text-sm text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.subtotal) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                ৳{{ formatNumber(sale.discount_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                ৳{{ formatNumber(sale.grand_total) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm text-blue-600 dark:text-blue-400">
                                ৳{{ formatNumber(sale.paid_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm" :class="getDueClass(sale.due_amount)">
                                ৳{{ formatNumber(sale.due_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right">
                                <span :class="getStatusClass(sale.status)">
                                    {{ formatStatus(sale.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewSale(sale)" v-permission="['sales_invoices.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button @click="printInvoice(sale)" v-permission="['sales_invoices.view']"
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
                                        v-permission="['sales_invoices.update', 'sales_invoices.delete', 'sales_invoices.repayments', 'sales_invoices.return']">
                                        <button @click="sale.showDropdown = !sale.showDropdown"
                                            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Actions">
                                            <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                                        </button>

                                        <div v-if="sale.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700">
                                            <div class="py-1">
                                                <!-- due_amount >0 then show Pay Now button -->
                                                <button @click="payNow(sale); sale.showDropdown = false"
                                                    v-permission="['sales_invoices.repayments']"
                                                    v-if="sale.due_amount > 0"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-money-bill text-green-500"></i>
                                                    Pay Now
                                                </button>
                                                <!-- return  -->
                                                <button v-if="sale.status !== 'returned'"
                                                    @click="returnSale(sale.id); sale.showDropdown = false"
                                                    v-permission="['sales_returns.create']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-undo text-red-500"></i>
                                                    Return
                                                </button>

                                                <button v-if="sale.status !== 'returned'"
                                                    @click="editSale(sale.id); sale.showDropdown = false"
                                                    v-permission="['sales_invoices.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>
                                                <button v-if="sale.status !== 'returned'"
                                                    @click="confirmDelete(sale); sale.showDropdown = false"
                                                    v-permission="['sales_invoices.delete']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
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
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="5xl" title="Sale Details" @close="closeViewModal">
        <!-- Loading State -->
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading sale details...</p>
        </div>

        <!-- Content -->
        <div v-else-if="viewingSale" class="px-6 py-4">

            <button @click="printInvoice(viewingSale)" v-if="viewingSale"
                class="w-auto border rounded-lg -mt-8 mb-3 px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <i class="fas fa-download"></i>Download Invoice
            </button>

            <!-- Header Information -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice
                            No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{ viewingSale.invoice_no ||
                            'N/A' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(viewingSale.invoice_date) }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                        <p class="mt-1">
                            <span :class="getStatusClass(viewingSale.status)">
                                {{ formatStatus(viewingSale.status) }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Dealer & Warehouse Information -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-store mr-2"></i>Customer & Warehouse Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ viewingSale.dealer_name ||
                            'Walk-in Customer' }}</p>
                    </div>
                    <!-- price_type -->
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Price Type</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingSale.price_type || 'N/A' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Warehouse</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingSale.warehouse_name || 'N/A' }}
                        </p>
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
                                    <!-- image_url -->
                                    <div class="flex items-center gap-2">
                                        <img v-if="getItemImage(item)" :src="getItemImage(item)" alt="Image"
                                            class="w-12 h-12 bg-gray-50 dark:bg-gray-700 object-cover rounded-lg border border-gray-200 dark:border-gray-700">
                                            
                                        <i v-else class="fas fa-box text-gray-300 text-lg"></i>
                                        <div>
                                            <p class="text-sm text-gray-900 dark:text-white font-medium">{{
                                                item.product_name }}</p>
                                            <p class="text-xs text-gray-500"
                                                v-if="item.serial_no && item.serial_no.length">
                                                <!-- SN: {{ item.serial_no.join(', ') }} -->
                                                <!-- SN take 1st item -->
                                                SN: {{ item.serial_no[0] }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ item.variant_name }} -
                                    {{ item.pieces_per_package }} {{ item.package_name }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">৳{{
                                    formatNumber(item.unit_price) }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">{{ item.quantity
                                }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">৳{{
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
                                    ৳{{ formatNumber(viewingSale.subtotal) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Discount ({{ formatNumber(viewingSale.discount_percentage) }}%):
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳{{ formatNumber(viewingSale.discount_amount) }}
                                </td>
                            </tr>
                            <tr v-if="viewingSale.vat_percentage > 0">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    VAT ({{ formatNumber(viewingSale.vat_percentage) }}%):
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                                    ৳{{ formatNumber(viewingSale.grand_total - viewingSale.subtotal +
                                        viewingSale.discount_amount) }}
                                </td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="5"
                                    class="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-white">
                                    Grand Total:
                                </td>
                                <td class="px-4 py-3 text-right text-xl font-bold text-blue-600 dark:text-blue-400">
                                    ৳{{ formatNumber(viewingSale.grand_total) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="5"
                                    class="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Paid Amount:
                                </td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-green-600 dark:text-green-400">
                                    ৳{{ formatNumber(viewingSale.paid_amount) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="5"
                                    class="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Due Amount:
                                </td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-red-600">
                                    ৳{{ formatNumber(viewingSale.due_amount) }}
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

            <!-- Audit Information -->
            <div class="mb-2">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-clock mr-2"></i>Audit Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingSale.created_at || 'N/A' }}</p>
                    </div>
                    <!-- <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingSale.updated_at || 'N/A' }}</p>
                    </div> -->
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
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Sale</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete sale <strong>{{ deletingSale?.invoice_no || 'this sale' }}</strong>?
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
                    <span v-else>Delete Sale</span>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import { useSaleStore } from '@/stores/saleStore.js';
import { useDealerStore } from '@/stores/dealerStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';
import NumberInput from '@/components/common/NumberInput.vue';

const toast = useToast();
const viewLoading = ref(false);
const refresh = ref(false);

// Table columns configuration
const tableColumns = ref([
    {
        "key": "invoice_no",
        "label": "Invoice Info",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "dealer_name",
        "label": "Customer",
        "sortable": true,
        "type": "varchar",
    },
    {
        "key": "subtotal",
        "label": "Subtotal",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "total_discount",
        "label": "Discount",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "grand_total",
        "label": "Grand Total",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "paid_amount",
        "label": "Paid",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "due_amount",
        "label": "Due",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    },
    {
        "key": "payment_status",
        "label": "Status",
        "sortable": true,
        "type": "enum",
        "class": "text-center",
        "align": "right"
    }
]);

// Status options based on API
const statusOptions = ref([
    { id: 'completed', name: 'Completed' },
    { id: 'pending', name: 'Pending' },
    { id: 'cancelled', name: 'Cancelled' }
]);

// Filter state
const filters = ref({
    dealer_id: null,
    status: null,
    from_date: '',
    to_date: ''
});

const saleStore = useSaleStore();
const dealerStore = useDealerStore();
const router = useRouter();

// Modal states
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

// Current items
const viewingSale = ref(null);
const deletingSale = ref(null);

// Computed properties
const dealerStoreItems = computed(() => {
    const items = dealerStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.name || item.dealer_name
    })).filter(item => item !== undefined && item !== null);
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
        'returned': 'Returned'
    };
    return statusMap[status] || status || 'N/A';
};

const getStatusClass = (status) => {
    const classes = {
        'completed': 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'pending': 'px-2 py-1 text-xs rounded-full inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'returned': 'px-2 py-1 text-xs rounded-full inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return classes[status] || classes.pending;
};

const getDueClass = (dueAmount) => {
    if (dueAmount === 0) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400 font-semibold';
};

const getItemImage = (item) => {
    return item.image_url || (item.unit_prices && item.unit_prices.length > 0 ? item.unit_prices.find(up => up.unit_id === item.unit_id)?.image_url || item.unit_prices[0].image_url : null);
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
        dealerStore.getAll()
    ]);
};

// Navigation functions
const openCreateSale = () => {
    router.push({ name: 'new-sales' });
};

const editSale = (saleId) => {
    router.push({ name: 'sales-edit', params: { id: saleId } });
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
        console.error('Error fetching sale:', error);
        toast.error('An error occurred while fetching sale details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};

// Print invoice
const printInvoice = (sale) => {
    if (sale && sale.id) {
        axiosClient.get(`/sales-invoices/${sale.id}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `invoice_${sale.invoice_no || sale.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error('Error printing invoice:', error);
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
        console.error('Error submitting payment:', error);
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

// return
const returnSale = (saleId) => {
    router.push({ name: 'sales-return', params: { invoice_id: saleId } });
}
const print = (salesId) => {
    axiosClient.get(`/sales-invoices/${salesId}/download-pdf`, {
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