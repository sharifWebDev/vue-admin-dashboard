<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Purchase Returns</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="openCreateModal" v-permission="['purchase_returns.create']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>New Purchase Return</span>
                </button>
            </div>
        </div>

        <!-- Filter Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7 gap-3 mb-4">
            <!-- Warehouse Filter -->
            <div>
                <SearchSelect v-model="filters.warehouse_id" :options="warehouseStoreItems" label="Warehouse"
                    placeholder="-- All Warehouses --" :clearable="true" @update:model-value="applyFilters" />
            </div>

            <!-- Supplier Filter -->
            <div>
                <SearchSelect v-model="filters.supplier_id" :options="supplierStoreItems" label="Supplier"
                    placeholder="-- All Suppliers --" :clearable="true" @update:model-value="applyFilters" />
            </div>

            <!-- Status Filter -->
            <div>
                <SearchSelect v-model="filters.status" :options="statusOptions" label="Status"
                    placeholder="-- All Statuses --" :clearable="true" @update:model-value="applyFilters" />
            </div>

            <!-- From Date -->
            <div>
                <TextInput v-model="filters.from_date" label="From Date" type="date" placeholder="Select From Date"
                    :clearable="true" @update:model-value="applyFilters" />
            </div>

            <!-- To Date -->
            <div>
                <TextInput v-model="filters.to_date" label="To Date" type="date" placeholder="Select To Date"
                    :clearable="true" @update:model-value="applyFilters" />
            </div>

            <!-- Search -->
            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div class="relative flex-grow max-w-md mt-6">
                    <input v-model="searchQuery" @input="handleSearch" type="search"
                        placeholder="Search by return no, PO no, supplier..."
                        class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search text-base"></i>
                    </div>
                    <button v-if="searchQuery" @click="clearSearch"
                        class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mt-6">
                    <div
                        class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2">
                        <button @click="refreshData"
                            class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" :disabled="loading">
                            <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': loading }"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="purchaseReturnStore.sortBy"
                        :sort-direction="purchaseReturnStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="purchaseReturnStore.loading" :is-loading="true"
                        :total-items="purchaseReturnStore.totalItems" :item-name="'Purchase Returns'"
                        loading-text="Loading Purchase Returns..."
                        loading-subtext="Fetching your Purchase Returns data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <!-- Empty State -->
                        <TableLoadingState v-if="purchaseReturnStore.items.length === 0" :is-loading="false"
                            :isEmpty="true" :has-search="!!searchQuery" :item-name="'Purchase Returns'"
                            empty-icon="fas fa-undo-alt" empty-title="No Purchase Returns found"
                            :empty-message="searchQuery ? 'No Purchase Returns match your search criteria.' : 'Get started by creating your first Purchase Return.'"
                            :create-button-text="'Add First Purchase Return'" @create="openCreateModal"
                            @clear-search="clearSearch" />

                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
                                dark:even:bg-gray-700 dark:odd:bg-gray-800">

                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ data.return_no || '-' }}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    PO No: {{ data.purchase_order?.order_no || '-' }}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p>{{ data.warehouse_name || '-' }}</p>
                                <p class="text-xs">Supplier: {{ data.supplier_name || '-' }}</p>
                                <p v-if="data.supplier_company" class="text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-semibold">Company:</span>
                                    {{ data.supplier_company }}
                                </p>
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900 dark:text-white">
                                ৳{{ formatNumber(data.grand_total) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ formatDate(data.return_date) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span class="capitalize">
                                    {{ (data.return_reason || '-').replace(/_/g, ' ') }}
                                </span>
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
                                    <button @click="viewReturnDetails(data)" v-permission="['purchase_returns.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 px-1.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-gray-600 transition-colors"
                                        title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <EllipseButton @click="someAction(data)" title="Ellipse Action">
                                        <div class="py-1">
                                            <!-- Approve - Only for draft status -->
                                            <button v-if="data.status === 'draft'"
                                                @click="approveReturn(data); data.showDropdown = false"
                                                v-permission="['purchase_returns.approve']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-check-circle text-green-500"></i>
                                                Approve Return
                                            </button>

                                            <!-- Complete - Only for approved status -->
                                            <button v-if="data.status === 'approved'"
                                                @click="completeReturn(data); data.showDropdown = false"
                                                v-permission="['purchase_returns.complete']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-check-double text-blue-500"></i>
                                                Complete Return
                                            </button>

                                            <!-- Edit - Only for draft status -->
                                            <button v-if="data.status === 'draft'"
                                                @click="editReturn(data); data.showDropdown = false"
                                                v-permission="['purchase_returns.update']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-edit text-yellow-500"></i>
                                                Edit
                                            </button>

                                            <!-- Delete - Only for draft status -->
                                            <button v-if="data.status === 'draft'"
                                                @click="confirmDelete(data); data.showDropdown = false"
                                                v-permission="['purchase_returns.delete']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                <i class="fas fa-trash-alt"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </EllipseButton>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="purchaseReturnStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="purchaseReturnStore.totalItems > 0" :total-items="purchaseReturnStore.totalItems"
                :per-page="purchaseReturnStore.perPage" :current-page="purchaseReturnStore.currentPage"
                :last-page="purchaseReturnStore.lastPage" :is-loading="purchaseReturnStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- Create Purchase Return Modal -->
    <BaseModal v-model="showCreateModal" title="Create Purchase Return" maxWidth="md" @close="closeCreateModal">
        <div class="p-6">
            <div class="text-center mb-6">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <i class="fas fa-file-invoice text-blue-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Enter Purchase Order Number</h3>
                <p class="text-sm text-gray-500">
                    Please enter the purchase order number to create a return against it.
                </p>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Order Number <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-hashtag text-gray-400"></i>
                    </div>
                    <input type="text" v-model="purchaseOrderInput" @keyup.enter="validateAndProceed"
                        placeholder="Enter PO number (e.g., PO-000004)"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        :class="{ 'border-red-500': validationError }" autofocus>
                </div>
                <p v-if="validationError" class="mt-1 text-sm text-red-600">
                    <i class="fas fa-exclamation-circle mr-1"></i>
                    {{ validationError }}
                </p>
                <p class="mt-2 text-xs text-gray-500">
                    <i class="fas fa-info-circle mr-1"></i>
                    Enter the PO number of the purchase order you want to return items from.
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
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="5xl" title="Purchase Return Details"
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
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            {{ viewingReturn.return_no || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 uppercase">Return Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ formatDate(viewingReturn.return_date) }}
                        </p>
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
                    <div v-if="viewingReturn.approved_at">
                        <label class="text-xs font-medium text-gray-500 uppercase">Approved At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ formatDateTime(viewingReturn.approved_at) }}
                        </p>
                    </div>
                    <div v-if="viewingReturn.returned_at">
                        <label class="text-xs font-medium text-gray-500 uppercase">Completed At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ formatDateTime(viewingReturn.returned_at) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- PO & Supplier Information -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-file-invoice mr-2"></i>Purchase Order & Supplier Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Purchase Order No.</label>
                        <p class="text-sm text-gray-900 dark:text-white font-medium">
                            {{ viewingReturn.purchase_order?.order_no || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                        <p class="text-sm text-gray-900 dark:text-white">
                            {{ viewingReturn.supplier_name || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Warehouse</label>
                        <p class="text-sm text-gray-900 dark:text-white">
                            {{ viewingReturn.warehouse_name || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Return Reason</label>
                        <p class="text-sm text-gray-900 dark:text-white capitalize">
                            {{ (viewingReturn.return_reason || '-').replace(/_/g, ' ') }}
                        </p>
                    </div>
                    <div v-if="viewingReturn.notes" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg col-span-2">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
                        <p class="text-sm text-gray-900 dark:text-white">{{ viewingReturn.notes }}</p>
                    </div>
                </div>
            </div>

            <!-- Return Items -->
            <div class="mb-6" v-if="viewingReturn.lines && viewingReturn.lines.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Return Items ({{ viewingReturn.lines.length }} items, Qty:
                    {{viewingReturn.lines.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}})
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            <tr v-for="(item, idx) in viewingReturn.lines" :key="item.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td class="px-4 py-3 text-sm text-gray-500">{{ idx + 1 }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded border border-gray-100 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                            <i class="fas fa-box text-blue-600"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                                                {{ item.product_name || '-' }}
                                            </p>
                                            <p v-if="item.product_code" class="text-xs text-gray-500 mt-1">
                                                Code: {{ item.product_code }}
                                            </p>
                                            <p v-if="item.description" class="text-xs text-gray-400 mt-0.5">
                                                {{ item.description }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    {{ item.quantity || 0 }}
                                </td>
                                <td class="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                    ৳{{ formatNumber(item.unit_cost) }}
                                </td>
                                <td class="px-4 py-3 text-right text-sm text-red-600">
                                    {{ Number(item.discount_amount) > 0 ? '- ৳' + formatNumber(item.discount_amount) :
                                        '-' }}
                                </td>
                                <td class="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                    {{ Number(item.tax_amount) > 0 ? '৳' + formatNumber(item.tax_amount) : '-' }}
                                </td>
                                <td class="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                                    ৳{{ formatNumber(item.line_total) }}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <tr>
                                <td colspan="6"
                                    class="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                                    Subtotal
                                </td>
                                <td class="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                    ৳{{ formatNumber(viewingReturn.subtotal) }}
                                </td>
                            </tr>
                            <tr v-if="Number(viewingReturn.discount_total) > 0">
                                <td colspan="6" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Discount
                                </td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-red-600">
                                    - ৳{{ formatNumber(viewingReturn.discount_total) }}
                                </td>
                            </tr>
                            <tr v-if="Number(viewingReturn.tax_total) > 0">
                                <td colspan="6" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Tax
                                </td>
                                <td class="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                                    ৳{{ formatNumber(viewingReturn.tax_total) }}
                                </td>
                            </tr>
                            <tr class="bg-blue-50/50 dark:bg-blue-900/10">
                                <td colspan="6"
                                    class="px-4 py-4 text-right text-base font-bold text-blue-900 dark:text-blue-300 border-t border-blue-100 dark:border-blue-900">
                                    Grand Total
                                </td>
                                <td
                                    class="px-4 py-4 text-right text-xl font-black text-blue-700 dark:text-blue-400 border-t border-blue-100 dark:border-blue-900 italic">
                                    ৳{{ formatNumber(viewingReturn.grand_total) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
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
                        <p class="text-sm text-gray-900 dark:text-white">{{ formatDateTime(viewingReturn.created_at) }}
                        </p>
                        <p v-if="viewingReturn.created_by_name" class="text-xs text-gray-500 mt-1">
                            By: {{ viewingReturn.created_by_name }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg" v-if="viewingReturn.updated_at">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                        <p class="text-sm text-gray-900 dark:text-white">{{ formatDateTime(viewingReturn.updated_at) }}
                        </p>
                        <p v-if="viewingReturn.updated_by_name" class="text-xs text-gray-500 mt-1">
                            By: {{ viewingReturn.updated_by_name }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600">Failed to load return details</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                Close
            </button>
            <button v-if="viewingReturn?.status === 'draft'" @click="editReturn(viewingReturn); closeViewModal()"
                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                <i class="fas fa-edit mr-2"></i>Edit Return
            </button>
            <button v-if="viewingReturn?.status === 'draft'" @click="approveReturn(viewingReturn); closeViewModal()"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <i class="fas fa-check-circle mr-2"></i>Approve Return
            </button>
            <button v-if="viewingReturn?.status === 'approved'" @click="completeReturn(viewingReturn); closeViewModal()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <i class="fas fa-check-double mr-2"></i>Complete Return
            </button>
        </div>
    </BaseModal>

    <!-- Approve Confirmation Modal -->
    <BaseModal :show="showApproveModal" title="Approve Purchase Return" maxWidth="md" @close="closeApproveModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Approve Purchase Return</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Are you sure you want to approve return <strong>{{ approvingReturn?.return_no }}</strong>?
            </p>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    Once approved, this return will be ready to be completed. Stock will be reversed when completed.
                </p>
            </div>
            <div class="flex justify-center gap-3">
                <button @click="closeApproveModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                    Cancel
                </button>
                <button @click="confirmApprove" :disabled="approving"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    <i v-if="approving" class="fas fa-spinner fa-spin mr-2"></i>
                    {{ approving ? 'Approving...' : 'Approve Return' }}
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Purchase Return" maxWidth="md" @close="closeDeleteModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Purchase Return</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete return <strong>{{ deletingReturn?.return_no }}</strong>? This action
                cannot be undone.
            </p>
            <div class="flex justify-center gap-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
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

    <!-- Complete Confirmation Modal -->
    <BaseModal :show="showCompleteModal" title="Complete Purchase Return" maxWidth="md" @close="closeCompleteModal">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <i class="fas fa-check-double text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Complete Purchase Return</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Are you sure you want to complete return <strong>{{ completingReturn?.return_no }}</strong>?
            </p>
            <div
                class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                <p class="text-sm text-yellow-800 dark:text-yellow-300">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    This will reverse stock for all returned items and reduce supplier due. This action cannot be
                    undone.
                </p>
            </div>
            <div class="flex justify-center gap-3">
                <button @click="closeCompleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axiosClient from '@/axiosClient'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Pagination from '@/components/common/Pagination.vue'
import TableLoadingState from '@/components/core/TableLoadingState.vue'
import SortableTableHeader from '@/components/common/SortableTableHeader.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import TextInput from '@/components/common/TextInput.vue'
import { usePurchaseReturnStore } from '@/stores/purchaseReturnStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useSupplierStore } from '@/stores/supplierStore'
import EllipseButton from '@/components/common/EllipseButton.vue'

const purchaseReturnStore = usePurchaseReturnStore()
const warehouseStore = useWarehouseStore()
const supplierStore = useSupplierStore()
const router = useRouter()
const toast = useToast()

// Table columns
const tableColumns = ref([
    { key: 'return_no', label: 'Return No.', sortable: true, type: 'string' },
    { key: 'warehouse_name', label: 'Warehouse', sortable: false, type: 'string' },
    { key: 'grand_total', label: 'Return Amount', sortable: true, type: 'number', align: 'left' },
    { key: 'return_date', label: 'Return Date', sortable: false, type: 'date' },
    { key: 'return_reason', label: 'Return Reason', sortable: false, type: 'string' },
    { key: 'status', label: 'Status', sortable: true, type: 'string', align: 'left' },
])

// Status options for filter
const statusOptions = [
    { id: 'draft', name: 'Draft' },
    { id: 'approved', name: 'Approved' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' },
]

// Data
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout = null
let filterTimeout = null

// Create Return Modal
const showCreateModal = ref(false)
const purchaseOrderInput = ref('')
const verifying = ref(false)
const validationError = ref('')

// Filters
const filters = ref({
    warehouse_id: null,
    supplier_id: null,
    status: '',
    from_date: '',
    to_date: '',
})

// Modals
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showCompleteModal = ref(false)
const showApproveModal = ref(false)
const viewLoading = ref(false)
const viewingReturn = ref(null)
const deletingReturn = ref(null)
const completingReturn = ref(null)
const approvingReturn = ref(null)
const deleting = ref(false)
const completing = ref(false)
const approving = ref(false)

// Computed
const displayedItems = computed(() => purchaseReturnStore.items || [])

const warehouseStoreItems = computed(() => {
    const items = warehouseStore.items || []
    return items.filter(item => item !== undefined && item !== null)
})

const supplierStoreItems = computed(() => {
    const items = supplierStore.items || []
    return items.filter(item => item !== undefined && item !== null)
})

const calculateRowNumber = (index) => {
    if (purchaseReturnStore.pagination?.from && purchaseReturnStore.pagination.from > 0) {
        return purchaseReturnStore.pagination.from + index
    }
    return (purchaseReturnStore.pagination.current_page - 1) * purchaseReturnStore.pagination.per_page + index + 1
}

// Fetch
const fetchReturns = () => {
    purchaseReturnStore.get()
}

const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        purchaseReturnStore.get({ search: searchQuery.value })
    }, 500)
}

const clearSearch = () => {
    searchQuery.value = ''
    fetchReturns()
}

const applyFilters = () => {
    if (filterTimeout) clearTimeout(filterTimeout)
    filterTimeout = setTimeout(() => {
        purchaseReturnStore.get({
            warehouse_id: filters.value.warehouse_id || null,
            supplier_id: filters.value.supplier_id || null,
            status: filters.value.status || null,
            from_date: filters.value.from_date || '',
            to_date: filters.value.to_date || '',
        })
    }, 300)
}

const resetFilters = () => {
    filters.value = {
        warehouse_id: null,
        supplier_id: null,
        status: '',
        from_date: '',
        to_date: '',
    }
    purchaseReturnStore.get()
}

const refreshData = () => {
    searchQuery.value = ''
    filters.value = {
        warehouse_id: null,
        supplier_id: null,
        status: '',
        from_date: '',
        to_date: '',
    }
    if (purchaseReturnStore.clearFilters) {
        purchaseReturnStore.clearFilters()
    } else {
        fetchReturns()
    }
}

const handlePerPageChange = async (newPerPage) => {
    await purchaseReturnStore.changePerPage(newPerPage)
}

const handlePageChange = async (page) => {
    await purchaseReturnStore.paginate(page)
}

const sortByColumn = async (column) => {
    const order = purchaseReturnStore.sortDirection === 'asc' ? 'desc' : 'asc'
    await purchaseReturnStore.sort(column, order)
}

const toggleDropdown = (data) => {
    purchaseReturnStore.items.forEach(r => {
        if (r.id !== data.id) r.showDropdown = false
    })
    data.showDropdown = !data.showDropdown
}

// Click outside directive
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
    },
}

// Create Return Modal
const openCreateModal = () => {
    purchaseOrderInput.value = ''
    validationError.value = ''
    showCreateModal.value = true
}

const closeCreateModal = () => {
    showCreateModal.value = false
    purchaseOrderInput.value = ''
    validationError.value = ''
}

const validateAndProceed = async () => {
    if (!purchaseOrderInput.value.trim()) {
        validationError.value = 'Please enter a purchase order number'
        return
    }

    verifying.value = true
    validationError.value = ''

    try {
        const response = await axiosClient.get(`/purchase-orders?search=${purchaseOrderInput.value.trim()}`)

        if (response.data?.success && response.data?.data) {
            const po = response.data?.data?.data?.[0]
            if (!po) {
                validationError.value = 'Purchase order not found. Please check the PO number.'
                return
            }
            if (!['received', 'partial'].includes(po.status)) {
                validationError.value =
                    `Purchase order cannot be returned. Current status: ${po.status}. Only Received or Partially Received POs can be returned.`
                return
            }

            closeCreateModal()
            router.push({ name: 'purchase-order-return', params: { invoice_id: po.id } })
        } else {
            validationError.value = 'Purchase order not found. Please check the PO number.'
        }
    } catch (error) {
        console.error('PO lookup error:', error)
        if (error.response?.status === 404) {
            validationError.value = 'Purchase order not found. Please check the PO number.'
        } else {
            validationError.value = error.response?.data?.message || 'Error fetching purchase order. Please try again.'
        }
    } finally {
        verifying.value = false
    }
}

// View
const viewReturnDetails = async (data) => {
    viewLoading.value = true
    showViewModal.value = true

    try {
        const response = await axiosClient.get(`/purchase-returns/${data.id}`)
        if (response.data?.success) {
            viewingReturn.value = response.data.data
        } else {
            toast.error('Failed to load return details')
            closeViewModal()
        }
    } catch (error) {
        console.error('Error fetching return details:', error)
        toast.error(error.response?.data?.message || 'Failed to load return details')
        closeViewModal()
    } finally {
        viewLoading.value = false
    }
}

const closeViewModal = () => {
    showViewModal.value = false
    viewingReturn.value = null
    viewLoading.value = false
}

// Edit
const editReturn = (data) => {
    router.push(`/purchase-orders/return/${data.id}`)
}

// Approve
const approveReturn = (data) => {
    approvingReturn.value = data
    showApproveModal.value = true
}

const confirmApprove = async () => {
    if (!approvingReturn.value) return

    approving.value = true
    try {
        const response = await axiosClient.post(`/purchase-returns/${approvingReturn.value.id}/approve`)
        if (response.data?.success || response.data?.status === 200) {
            toast.success('Return approved successfully')
            closeApproveModal()
            fetchReturns()
        } else {
            toast.error(response.data?.message || 'Failed to approve return')
        }
    } catch (error) {
        console.error('Error approving return:', error)
        toast.error(error.response?.data?.message || 'Failed to approve return')
    } finally {
        approving.value = false
    }
}

const closeApproveModal = () => {
    showApproveModal.value = false
    approvingReturn.value = null
    approving.value = false
}

// Complete
const completeReturn = (data) => {
    completingReturn.value = data
    showCompleteModal.value = true
}

const confirmComplete = async () => {
    if (!completingReturn.value) return

    completing.value = true
    try {
        const response = await axiosClient.post(`/purchase-returns/${completingReturn.value.id}/complete`)
        if (response.data?.success || response.data?.status === 200) {
            toast.success('Return completed successfully. Stock has been reversed.')
            closeCompleteModal()
            fetchReturns()
        } else {
            toast.error(response.data?.message || 'Failed to complete return')
        }
    } catch (error) {
        console.error('Error completing return:', error)
        toast.error(error.response?.data?.message || 'Failed to complete return')
    } finally {
        completing.value = false
    }
}

const closeCompleteModal = () => {
    showCompleteModal.value = false
    completingReturn.value = null
    completing.value = false
}

// Delete
const confirmDelete = (data) => {
    deletingReturn.value = data
    showDeleteModal.value = true
}

const confirmDeleteAction = async () => {
    if (!deletingReturn.value) return

    deleting.value = true
    try {
        await axiosClient.delete(`/purchase-returns/${deletingReturn.value.id}`)
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

const closeDeleteModal = () => {
    showDeleteModal.value = false
    deletingReturn.value = null
    deleting.value = false
}

// View Purchase Order
const viewPurchaseOrder = (data) => {
    const poId = data.purchase_order?.id
    if (poId) {
        router.push({ name: 'purchase-order-view', params: { id: poId } })
    } else {
        toast.warning('Purchase order not linked')
    }
}

// Print
const printReturn = (data) => {
    if (!data?.id) return

    axiosClient
        .get(`/purchase-returns/${data.id}/download-pdf`, { responseType: 'blob' })
        .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute(
                'download',
                `purchase-return-${data.return_no || data.id}-${new Date().toISOString().split('T')[0]}.pdf`
            )
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        })
        .catch(() => toast.error('Failed to download purchase return PDF'))
}

// Helpers
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'draft':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        case 'approved':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'draft': return 'Draft'
        case 'approved': return 'Approved'
        case 'completed': return 'Completed'
        case 'cancelled': return 'Cancelled'
        default: return status || '-'
    }
}

const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0.00'
    const num = Number(value)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Lifecycle
onMounted(() => {
    fetchReturns()
    warehouseStore.getAll()
    supplierStore.getAll()
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