<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Sales Returns</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <!-- Left Side: Create Button -->
            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="openCreateModal" v-permission="['sales_returns.create']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>New Return</span>
                </button>
            </div>

            <!-- Right Side: Filters and Search -->
            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <!-- Date Range Filter -->
                <input type="date" v-model="filters.from_date" @change="applyFilters"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                    placeholder="From Date">
                <input type="date" v-model="filters.to_date" @change="applyFilters"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                    placeholder="To Date">

                <!-- Search Input -->
                <div class="relative flex-grow max-w-md">
                    <input v-model="searchQuery" @input="handleSearch" type="search"
                        placeholder="Search by return no, invoice no, supplier..."
                        class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search text-base"></i>
                    </div>
                    <button v-if="searchQuery" @click="clearSearch"
                        class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Refresh Button -->
                <div
                    class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1">
                    <button @click="refreshData" class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        :disabled="loading">
                        <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': loading }"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="salesReturnStore.sortBy"
                        :sort-direction="salesReturnStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="salesReturnStore.loading" :is-loading="true"
                        :total-items="salesReturnStore.totalItems" :item-name="'Sales Returns'"
                        loading-text="Loading Sales Returns..." loading-subtext="Fetching your Sales Returns data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <!-- Empty State -->
                        <TableLoadingState v-if="salesReturnStore.items.length === 0" :is-loading="false"
                            :isEmpty="true" :has-search="!!searchQuery" :item-name="'Sales Returns'"
                            empty-icon="fas fa-warehouse" empty-title="No Sales Returns found"
                            :empty-message="searchQuery ? 'No Sales Returns match your search criteria.' : 'Get started by creating your first Sales Return.'"
                            :create-button-text="'Add First Sales Return'" @create="openCreateModal"
                            @clear-search="clearSearch" />
                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
                                dark:even:bg-gray-700 dark:odd:bg-gray-800">

                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ (currentPage - 1) * perPage + index + 1 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ data.return_no }}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    Invoice No: {{ data.sales_invoice_no || '-' }}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p> {{ data.warehouse_name || '-' }}</p>
                                <p class="text-xs"> Customer: {{ data.dealer_name || '-' }} </p>
                                <p v-if="data.company" class="text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-semibold">Company:</span> {{ data.company }}
                                </p>
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900 dark:text-white">
                                ৳{{ formatNumber(data.returnable_amount) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ formatDate(data.return_date) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span class="capitalize">{{ data.return_reason?.replace('_', ' ') || '-' }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-start">
                                <span :class="getStatusBadgeClass(data.status)"
                                    class="px-2 py-1 text-xs font-semibold rounded-full">
                                    {{ getStatusText(data.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-end justify-end gap-2">
                                    <!-- View Button -->
                                    <button @click="viewReturnDetails(data)" v-permission="['sales_returns.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-600 transition-colors"
                                        title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <!-- Actions Dropdown -->
                                    <div class="relative inline-block text-right"
                                        v-click-outside="() => data.showDropdown = false"
                                        v-permission="['sales_returns.update', 'sales_returns.delete']">
                                        <button @click="toggleDropdown(data)"
                                            class="p-1.5 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Actions">
                                            <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                                        </button>

                                        <div v-if="data.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700
                                            focus:outline-none">

                                            <div class="py-1">
                                                <!-- Edit - Only for draft status -->
                                                <button v-if="data.status === 'completed'"
                                                    @click="editReturn(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-right text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>

                                                <!-- Approve - Only for draft status -->
                                                <!-- <button v-if="data.status === 'draft'"
                                                    @click="approveReturn(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-check-circle text-green-500"></i>
                                                    Approve
                                                </button> -->

                                                <!-- Complete - Only for approved status -->
                                                <!-- <button v-if="data.status === 'approved'"
                                                    @click="completeReturn(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-check-double text-blue-500"></i>
                                                    Complete
                                                </button> -->

                                                <!-- View Purchase Invoice -->
                                                <!-- <button @click="viewPurchaseInvoice(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-file-invoice text-purple-500"></i>
                                                    View Invoice
                                                </button> -->

                                                <!-- Delete - Only for draft status -->
                                                <button v-if="data.status === 'completed'"
                                                    @click="confirmDelete(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                    <i class="fas fa-trash-alt"></i>
                                                    Delete
                                                </button>

                                                <!-- Print - For any status -->
                                                <!-- <button @click="printReturn(data); data.showDropdown = false"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-print text-gray-500"></i>
                                                    Print
                                                </button> -->
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

        <div v-if="salesReturnStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="salesReturnStore.totalItems > 0" :total-items="salesReturnStore.totalItems"
                :per-page="salesReturnStore.perPage" :current-page="salesReturnStore.currentPage"
                :last-page="salesReturnStore.lastPage" :is-loading="salesReturnStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- Create Return Modal - Enter Invoice ID -->
    <BaseModal v-model="showCreateModal" title="Create Sales Return" maxWidth="md" @close="closeCreateModal">
        <div class="p-6">
            <div class="text-center mb-6">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <i class="fas fa-file-invoice text-blue-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Enter Sales Invoice Number</h3>
                <p class="text-sm text-gray-500">
                    Please enter the sales invoice number to create a return against it.
                </p>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-hashtag text-gray-400"></i>
                    </div>
                    <input type="text" v-model="invoiceIdInput" @keyup.enter="validateAndProceed"
                        placeholder="Enter invoice number (e.g., SI-000001)"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        :class="{ 'border-red-500': validationError }" autofocus>
                </div>
                <p v-if="validationError" class="mt-1 text-sm text-red-600">
                    <i class="fas fa-exclamation-circle mr-1"></i>
                    {{ validationError }}
                </p>
                <p class="mt-2 text-xs text-gray-500">
                    <i class="fas fa-info-circle mr-1"></i>
                    Enter the invoice number of the sales order you want to return items from.
                </p>
            </div>

            <div class="flex justify-end gap-3">
                <button @click="closeCreateModal"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button @click="validateAndProceed" :disabled="verifying"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <i v-if="verifying" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-check-circle"></i>
                    {{ verifying ? 'Verifying...' : 'Proceed to Return' }}
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- View Return Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="5xl" title="Sales Return Details"
        @close="closeViewModal">
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading return details...</p>
        </div>

        <div v-else-if="viewingReturn" class="px-6 py-4">
            <!-- Header Information -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="col-span-2">
                        <label class="text-xs font-medium text-gray-500 uppercase">Return No.</label>
                        <p class="text-lg font-semibold text-gray-900 mt-1">{{ viewingReturn.return_no }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 uppercase">Return Date</label>
                        <p class="text-sm text-gray-900 mt-1">{{ formatDate(viewingReturn.return_date) }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 uppercase">Status</label>
                        <p class="mt-1">
                            <span :class="getStatusBadgeClass(viewingReturn.status)"
                                class="px-2 py-1 text-xs font-semibold rounded-full">
                                {{ getStatusText(viewingReturn.status) }}
                            </span>
                        </p>
                    </div>
                    <div v-if="viewingReturn.returned_at">
                        <label class="text-xs font-medium text-gray-500 uppercase">Completed At</label>
                        <p class="text-sm text-gray-900 mt-1">{{ formatDateTime(viewingReturn.returned_at) }}</p>
                    </div>
                </div>
            </div>

            <!-- Invoice & Dealer Information -->
            <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                    <i class="fas fa-file-invoice mr-2"></i>Sales Invoice & Customer Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div class="bg-gray-50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500">Sales Invoice No.</label>
                        <p class="text-sm text-gray-900 font-medium">{{ viewingReturn.sales_invoice_no ||
                            '-' }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500">Customer</label>
                        <p class="text-sm text-gray-900">{{ viewingReturn.dealer_name || '-' }}
                        </p>

                        <p v-if="viewingReturn.company" class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ viewingReturn.company }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500">Warehouse</label>
                        <p class="text-sm text-gray-900">{{ viewingReturn.warehouse_name || '-' }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500">Return Reason</label>
                        <p class="text-sm text-gray-900 capitalize">{{ viewingReturn.return_reason?.replace('_', ' ') ||
                            '-' }}</p>
                    </div>
                    <div v-if="viewingReturn.notes" class="bg-gray-50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500">Notes</label>
                        <p class="text-sm text-gray-900">{{ viewingReturn.notes }}</p>
                    </div>
                </div>
            </div>

            <!-- Return Items -->
            <div class="mb-6" v-if="viewingReturn.items && viewingReturn.items.length > 0">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                    <i class="fas fa-boxes mr-2"></i>Return ({{ viewingReturn.items.length }} items, Quantity:
                    {{viewingReturn.items.filter(item => item.is_gift || !item.is_gift).reduce((sum, item) => sum + Number(item.quantity
                        || 0), 0)}}) 
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Variant
                                    Package </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="(item, idx) in viewingReturn.items" :key="item.id" class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-500">{{ idx + 1 }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            <img v-if="item.image_url" :src="item.image_url"
                                                class="w-full h-full object-contain" alt="">
                                            <i v-else class="fas fa-box text-gray-300 text-lg"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">{{ item.product_name }}

                                                <span v-if="item.is_gift" class="text-green-700 rounded-xl px-2 py-1 bg-green-300/50">Gift Item</span>

                                            </p>
                                            <p v-if="item.description" class="text-xs text-gray-500 mt-1">{{
                                                item.description }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span
                                        class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {{ item.pieces_per_package }} {{ item.package_name }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-center text-sm font-semibold">{{ item.quantity }}</td>
                                <td class="px-4 py-3 text-right text-sm"> {{ item.is_gift ? '-' : '৳' + formatNumber(item.unit_price) }}</td>
                                <td class="px-4 py-3 text-right text-sm font-bold text-gray-900">  {{
                                   item.is_gift ? '-' : '৳' +  formatNumber(item.line_total) }}</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colspan="5" class="px-4 py-3 text-right font-medium text-gray-600">Subtotal</td>
                                <td class="px-4 py-3 text-right font-semibold text-gray-900">৳ {{
                                    formatNumber(viewingReturn.subtotal) }}</td>
                            </tr>
                            <tr v-if="viewingReturn.discount_amount > 0">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600">Discount</td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-red-600">- ৳ {{
                                    formatNumber(viewingReturn.discount_amount) }}</td>
                            </tr>
                            <tr v-if="viewingReturn.tax_amount > 0">
                                <td colspan="5" class="px-4 py-2 text-right text-sm text-gray-600">VAT ({{
                                    viewingReturn.vat_percentage }}%)</td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-gray-900">৳ {{
                                    formatNumber(viewingReturn.tax_amount) }}</td>
                            </tr>
                            <tr class="bg-blue-50/50">
                                <td colspan="5"
                                    class="px-4 py-4 text-right text-base font-bold text-blue-900 border-t border-blue-100">
                                    Returnable Amount</td>
                                <td
                                    class="px-4 py-4 text-right text-xl font-black text-blue-700 border-t border-blue-100 italic">
                                    ৳ {{ formatNumber(viewingReturn.returnable_amount) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Audit Information -->
            <div class="mb-2">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                    <i class="fas fa-clock mr-2"></i>Audit Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500">Created By</label>
                        <p class="text-sm text-gray-900">{{ viewingReturn.created_by_name || '-' }}</p>
                        <p class="text-xs text-gray-500">{{ formatDateTime(viewingReturn.created_at) }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg" v-if="viewingReturn.updated_by_name">
                        <label class="text-xs font-medium text-gray-500">Last Updated By</label>
                        <p class="text-sm text-gray-900">{{ viewingReturn.updated_by_name }}</p>
                        <p class="text-xs text-gray-500">{{ formatDateTime(viewingReturn.updated_at) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600">Failed to load return details</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Close
            </button>
            <button v-if="viewingReturn?.status === 'draft'" @click="editReturn(viewingReturn); closeViewModal()"
                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                <i class="fas fa-edit mr-2"></i>Edit Return
            </button>
            <button v-if="viewingReturn?.status === 'approved'" @click="completeReturn(viewingReturn); closeViewModal()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <i class="fas fa-check-double mr-2"></i>Complete Return
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Sales Return" maxWidth="md" @close="closeDeleteModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Sales Return</h3>
            <p class="text-sm text-gray-500 mb-6">
                Are you sure you want to delete return <strong>{{ deletingReturn?.return_no }}</strong>? This action
                cannot be undone.
            </p>
            <div class="flex justify-center gap-3">
                <button @click="closeDeleteModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button @click="confirmDeleteAction" :disabled="deleting"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                    <i v-if="deleting" class="fas fa-spinner fa-spin mr-2"></i>
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Approve Confirmation Modal -->
    <BaseModal :show="showApproveModal" title="Approve Sales Return" maxWidth="md" @close="closeApproveModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <i class="fas fa-check-circle text-yellow-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Approve Sales Return</h3>
            <p class="text-sm text-gray-500 mb-6">
                Are you sure you want to approve return <strong>{{ approvingReturn?.return_no }}</strong>?
            </p>
            <div class="flex justify-center gap-3">
                <button @click="closeApproveModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button @click="confirmApprove" :disabled="approving"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    <i v-if="approving" class="fas fa-spinner fa-spin mr-2"></i>
                    {{ approving ? 'Approving...' : 'Approve' }}
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Complete Confirmation Modal -->
    <BaseModal :show="showCompleteModal" title="Complete Sales Return" maxWidth="md" @close="closeCompleteModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <i class="fas fa-check-double text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Complete Sales Return</h3>
            <p class="text-sm text-gray-500 mb-4">
                Are you sure you want to complete return <strong>{{ completingReturn?.return_no }}</strong>?
            </p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p class="text-sm text-yellow-800">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    This will reverse stock for all returned items and update serial numbers status.
                    This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center gap-3">
                <button @click="closeCompleteModal"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button @click="confirmComplete" :disabled="completing"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <i v-if="completing" class="fas fa-spinner fa-spin mr-2"></i>
                    {{ completing ? 'Processing...' : 'Complete Return' }}
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Pagination from '@/components/common/Pagination.vue'
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import { useSalesReturnStore } from '@/stores/salesReturnStore';

const salesReturnStore = useSalesReturnStore()


const router = useRouter()
const toast = useToast()

const tableColumns = ref([
    {
        key: "return_no",
        label: "Return No.",
        sortable: true,
        type: "string"
    },
    {
        key: "warehouse_name",
        label: "Warehouse",
        sortable: false,
        type: "string"
    },
    {
        key: "returnable_amount",
        label: "Return Amount",
        sortable: true,
        type: "number",
        align: "left"
    },
    {
        key: "return_date",
        label: "Return Date",
        sortable: false,
        type: "date"
    },
    {
        key: "return_reason",
        label: "Return Reason",
        sortable: false,
        type: "string"
    },
    {
        key: "status",
        label: "Status",
        sortable: true,
        type: "string",
        align: "left"
    }
]);

// Data
const returns = ref([])
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout = null

// Create Return Modal
const showCreateModal = ref(false)
const invoiceIdInput = ref('')
const verifying = ref(false)
const validationError = ref('')

// Filters
const filters = ref({
    status: '',
    from_date: '',
    to_date: ''
})

// Pagination
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const lastPage = ref(1)

// Sorting
const sortByField = ref('id')
const sortDirection = ref('desc')

// Modals
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showApproveModal = ref(false)
const showCompleteModal = ref(false)
const viewLoading = ref(false)
const viewingReturn = ref(null)
const deletingReturn = ref(null)
const approvingReturn = ref(null)
const completingReturn = ref(null)
const deleting = ref(false)
const approving = ref(false)
const completing = ref(false)

const displayedItems = computed(() => {
    return salesReturnStore.items || [];
});

const calculateRowNumber = (index) => {
    if (salesReturnStore.pagination?.from && salesReturnStore.pagination.from > 0) {
        return salesReturnStore.pagination.from + index;
    }
    return (salesReturnStore.pagination.current_page - 1) * salesReturnStore.pagination.per_page + index + 1;
};
// Methods
const fetchReturns = async () => {
    salesReturnStore.get()
}

const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        salesReturnStore.get({
            search: searchQuery.value
        })
    }, 500)
}

const clearSearch = () => {
    searchQuery.value = ''
    currentPage.value = 1
    fetchReturns()
}

const applyFilters = () => {
    currentPage.value = 1
    salesReturnStore.get({
        status: filters.value.status,
        from_date: filters.value.from_date,
        to_date: filters.value.to_date
    })
}

const resetFilters = () => {
    filters.value = {
        status: '',
        from_date: '',
        to_date: ''
    }
    salesReturnStore.get();
}

const refreshData = () => {
    if (searchQuery.value) {
        clearSearch();
    }
    if (Object.keys(filters.value).length > 0) {
        resetFilters();
    }
}

const handlePerPageChange = async (newPerPage) => {
    await salesReturnStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await salesReturnStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = salesReturnStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await salesReturnStore.sort(column, order);
};

const toggleDropdown = (data) => {
    // Close all other dropdowns
    returns.value.forEach(r => {
        if (r.id !== data.id) r.showDropdown = false
    })
    data.showDropdown = !data.showDropdown
}

// Click outside directive handler
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
    }
}

// Create Return Modal Methods
const openCreateModal = () => {
    invoiceIdInput.value = ''
    validationError.value = ''
    showCreateModal.value = true
}

const closeCreateModal = () => {
    showCreateModal.value = false
    invoiceIdInput.value = ''
    validationError.value = ''
}
const validateAndProceed = async () => {
    if (!invoiceIdInput.value.trim()) {
        validationError.value = 'Please enter an invoice number'
        return
    }

    verifying.value = true
    validationError.value = ''

    try {
        const response = await axiosClient.get(`/sales-invoices/${invoiceIdInput.value}`);

        if (response.data?.success) {
            const matchedInvoice = response.data.data;

            if (matchedInvoice && matchedInvoice.invoice_no === invoiceIdInput.value) {

                // Status validation
                if (matchedInvoice.status !== 'completed' && matchedInvoice.status !== 'partially_returned') {
                    validationError.value = 'Invoice is not in completed status. Current status: ' + matchedInvoice.status;
                    return;
                }

                closeCreateModal();

                router.push(`/return/sales/${matchedInvoice.id}`);

            } else {
                validationError.value = 'Invoice not found. Please check the invoice number.';
            }
        } else {
            validationError.value = 'Invoice not found. Please try again.';
        }
    } catch (error) {
        // Handle 404 or connection errors
        validationError.value = 'Error fetching invoice. Please ensure the ID is correct.';
        console.error(error);
    } finally {
        verifying.value = false
    }
}

const viewReturnDetails = async (data) => {
    viewLoading.value = true
    showViewModal.value = true

    try {
        const response = await axiosClient.get(`/sales-returns/${data.id}`)
        if (response.data) {
            viewingReturn.value = response.data.data
        }
    } catch (error) {
        console.error('Error fetching return details:', error)
        toast.error('Failed to load return details')
        closeViewModal()
    } finally {
        viewLoading.value = false
    }
}

const editReturn = (data) => {
    router.push({ name: 'sales-return-edit', params: { id: data.id } })
}

const approveReturn = (data) => {
    approvingReturn.value = data
    showApproveModal.value = true
}

const confirmApprove = async () => {
    if (!approvingReturn.value) return

    approving.value = true
    try {
        const response = await axiosClient.post(`/sales-returns/${approvingReturn.value.id}/approve`)
        if (response.data) {
            toast.success('Return approved successfully')
            closeApproveModal()
            fetchReturns()
        }
    } catch (error) {
        console.error('Error approving return:', error)
        toast.error(error.response?.data?.message || 'Failed to approve return')
    } finally {
        approving.value = false
    }
}

const completeReturn = (data) => {
    completingReturn.value = data
    showCompleteModal.value = true
}

const confirmComplete = async () => {
    if (!completingReturn.value) return

    completing.value = true
    try {
        const response = await axiosClient.post(`/sales-returns/${completingReturn.value.id}/complete`)
        if (response.data) {
            toast.success('Return completed successfully. Stock has been reversed.');
            closeCompleteModal();
            fetchReturns();
        }
    } catch (error) {
        console.error('Error completing return:', error)
        toast.error(error.response?.data?.message || 'Failed to complete return')
    } finally {
        completing.value = false
    }
}

const confirmDelete = (data) => {
    deletingReturn.value = data
    showDeleteModal.value = true
}

const confirmDeleteAction = async () => {
    if (!deletingReturn.value) return

    deleting.value = true
    try {
        await axiosClient.delete(`/sales-returns/${deletingReturn.value.id}`)
        toast.success('Return deleted successfully')
        closeDeleteModal()
        fetchReturns()
    } catch (error) {
        console.error('Error deleting return:', error)
        toast.error(error.response?.data?.message || 'Failed to delete return')
    } finally {
        deleting.value = false
    }
}

const viewPurchaseInvoice = (data) => {
    if (data.purchase_invoice_id) {
        router.push({ name: 'purchase-order-view', params: { id: data.purchase_invoice_id } })
    } else {
        toast.warning('Purchase invoice not found')
    }
}

const printReturn = (data) => {
    // Implement print functionality
    window.open(`/purchase-returns/${data.id}/print`, '_blank')
}

// Modal close methods
const closeViewModal = () => {
    showViewModal.value = false
    viewingReturn.value = null
    viewLoading.value = false
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    deletingReturn.value = null
    deleting.value = false
}

const closeApproveModal = () => {
    showApproveModal.value = false
    approvingReturn.value = null
    approving.value = false
}

const closeCompleteModal = () => {
    showCompleteModal.value = false
    completingReturn.value = null
    completing.value = false
}

// Helper methods
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'draft':
            return 'bg-yellow-100 text-yellow-800'
        case 'approved':
            return 'bg-blue-100 text-blue-800'
        case 'completed':
            return 'bg-green-100 text-green-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'draft':
            return 'Draft'
        case 'approved':
            return 'Approved'
        case 'completed':
            return 'Completed'
        default:
            return status || '-'
    }
}

const formatNumber = (value) => {
    if (!value && value !== 0) return '0.00'
    return parseFloat(value).toFixed(2)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Lifecycle
onMounted(() => {
    fetchReturns()
}) 
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

.btn {
    transition: all 0.3s ease;
}

.capitalize {
    text-transform: capitalize;
}
</style>