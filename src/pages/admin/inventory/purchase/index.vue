<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Purchase Orders</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">

        <div class="flex flex-col gap-4 mb-4">
            <!-- Top Row -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div class="flex flex-col sm:flex-row gap-4">
                    <Button v-permission="['purchase_orders.create']" variant="secondary" icon="Add"
                        @click="openCreatePage">
                        New Purchase Order
                    </Button>
                </div>
            </div>

            <!-- Filter Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 wrap gap-3">

                <!-- Supplier Filter -->
                <div>
                    <SearchSelect v-model="filters.supplier_id" :options="supplierStoreItems" label="Supplier"
                        placeholder="-- All Suppliers --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- Warehouse Filter -->
                <div>
                    <SearchSelect v-model="filters.warehouse_id" :options="warehouseStoreItems" label="Warehouse"
                        placeholder="-- All Warehouses --" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- Approval Status Filter -->
                <!-- <div>
                    <SearchSelect v-model="filters.approval_status" :options="approvalStatusOptions"
                        label="Approval Status" placeholder="-- All Approval Status --" :clearable="true"
                        @update:model-value="handleFilterChange" />
                </div> -->

                <!-- Receiving Status Filter -->
                <div>
                    <SearchSelect v-model="filters.status" :options="receivingStatusOptions" label="Receiving Status"
                        placeholder="-- All Receiving Status --" :clearable="true"
                        @update:model-value="handleFilterChange" />
                </div>

                <!-- From Date -->
                <div>
                    <TextInput v-model="filters.from_date" label="From Date" type="date" placeholder="Select From Date"
                        :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- To Date -->
                <div>
                    <TextInput v-model="filters.to_date" label="To Date" type="date" placeholder="Select To Date"
                        :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- Search -->
                <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div class="relative flex-grow max-w-md mt-6">
                        <input v-model="searchQuery" @input="handleSearch" type="search"
                            placeholder="Search by order no, supplier..."
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search text-base"></i>
                        </div>
                    </div>
                    <div class="mt-6">
                        <div
                            class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2">
                            <button @click="refreshData"
                                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                :disabled="refresh">
                                <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-visible">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="purchaseOrderStore.sortBy"
                        :sort-direction="purchaseOrderStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <TableLoadingState v-if="purchaseOrderStore.loading" :is-loading="true"
                        :total-items="purchaseOrderStore.totalItems" :item-name="'purchase orders'"
                        loading-text="Loading purchase orders..." loading-subtext="Fetching your purchase order data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <TableLoadingState v-if="purchaseOrderStore.items.length === 0" :is-loading="false"
                            :isEmpty="true" :has-search="!!searchQuery" :item-name="'purchase orders'"
                            empty-icon="fas fa-file-invoice" empty-title="No purchase orders found"
                            :empty-message="searchQuery ? 'No purchase orders match your search criteria.' : 'Get started by creating your first purchase order.'"
                            :show-create-button="false" @create="openCreatePage" @clear-search="clearSearch" />

                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p class="font-medium">{{ data.order_no || '-' }}</p>
                                <p v-if="data.order_date" class="text-xs text-gray-500 dark:text-gray-400">
                                    Order: {{ data.order_date }}
                                </p>
                                <p v-if="data.expected_date" class="text-xs text-gray-500 dark:text-gray-400">
                                    Expected: {{ data.expected_date }}
                                </p>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p class="font-medium">{{ data.supplier?.name || data.supplier_name || '-' }}</p>
                                <p v-if="data.supplier?.company_name || data.supplier_company"
                                    class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ data.supplier?.company_name || data.supplier_company }}
                                </p>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p>{{ data.warehouse?.name || data.warehouse_name || '-' }}</p>
                                <p v-if="data.warehouse?.code || data.warehouse_code"
                                    class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ data.warehouse?.code || data.warehouse_code }}
                                </p>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p class="font-medium">{{ formatAmount(data.total_amount) }}</p>
                                <p v-if="data.discount_amount > 0" class="text-xs text-green-600 dark:text-green-400">
                                    Discount: {{ formatAmount(data.discount_amount) }}
                                </p>
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span :class="statusBadgeClass(data.status)">
                                    {{ formatBadge(data.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-medium relative">
                                <div class="flex items-center justify-end gap-2">

                                    <button @click="viewItem(data)" v-permission="['purchase_orders.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button @click="printOrder(data)" v-permission="['purchase_orders.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Download PDF">
                                        <i class="fas fa-download"></i>
                                    </button>

                                    <EllipseButton>
                                        <div class="py-1">

                                            <!-- Approve: only when ordered -->
                                            <button v-if="data.status === 'draft'"
                                                v-permission="['purchase_orders.approve']"
                                                @click="approveItem(data); data.showDropdown = false"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-check-circle text-green-500"></i>
                                                Approve
                                            </button>

                                            <!-- Receive: only when approved & not fully received -->
                                            <button v-if="data.status === 'ordered' || data.status === 'partial'"
                                                @click="receiveItem(data); data.showDropdown = false"
                                                v-permission="['purchase_orders.receive']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-truck-loading text-green-500"></i>
                                                Receive
                                            </button>

                                            <!-- Return: only when received/partially received -->
                                            <button v-if="data.status === 'received' || data.status === 'partial'"
                                                @click="returnItem(data); data.showDropdown = false"
                                                v-permission="['purchase_returns.create']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-undo text-green-500"></i>
                                                Return
                                            </button>

                                            <!-- Cancel: only when pending/approved, not received -->
                                            <button v-if="data.status === 'ordered' || data.status === 'approved'"
                                                @click="cancelItem(data); data.showDropdown = false"
                                                v-permission="['purchase_orders.cancel']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-ban text-orange-500"></i>
                                                Cancel
                                            </button>

                                            <!-- Edit: only when ordered -->
                                            <button v-if="data.status === 'ordered' || data.status === 'draft'"
                                                @click="editItem(data.id); data.showDropdown = false"
                                                v-permission="['purchase_orders.update']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                <i class="fas fa-edit text-yellow-500"></i>
                                                Edit
                                            </button>

                                            <!-- Delete: only when pending -->
                                            <button v-if="data.status === 'draft'"
                                                @click="confirmDelete(data); data.showDropdown = false"
                                                v-permission="['purchase_orders.delete']"
                                                class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                <i class="fas fa-trash"></i>
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

        <div v-if="purchaseOrderStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="purchaseOrderStore.totalItems > 0" :total-items="purchaseOrderStore.totalItems"
                :per-page="purchaseOrderStore.perPage" :current-page="purchaseOrderStore.currentPage"
                :last-page="purchaseOrderStore.lastPage" :is-loading="purchaseOrderStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- View Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="6xl" title="Purchase Order Details"
        @close="closeViewModal">

        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading purchase order details...</p>
        </div>

        <div v-else-if="viewingItem" class="px-6 py-4">
            <button @click="printOrder(viewingItem)" v-if="viewingItem"
                class="w-auto border rounded-lg -mt-8 mb-3 px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <i class="fas fa-download"></i>Download Order
            </button>

            <!-- Header -->
            <div class="mb-6 pb-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            {{ viewingItem.order_no || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.order_date || '-' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expected
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.expected_date || '-' }}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <div class="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            <span class="font-medium mr-2">Status:</span>
                            <span :class="statusBadgeClass(viewingItem.status)">
                                {{ formatBadge(viewingItem.status) }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</label>
                    <p class="text-sm text-gray-900 dark:text-white mt-1" v-html="viewingItem.notes || '-'"></p>
                </div>
            </div>

            <!-- Supplier & Warehouse Info -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-building mr-2"></i>Supplier & Warehouse
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {{ viewingItem.supplier?.name || '-' }}
                        </p>
                        <p v-if="viewingItem.supplier?.company_name"
                            class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ viewingItem.supplier.company_name }}
                        </p>
                        <p v-if="viewingItem.supplier?.phone" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-phone mr-1"></i>{{ viewingItem.supplier.phone }}
                        </p>
                        <p v-if="viewingItem.supplier?.contact_person"
                            class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-user mr-1"></i>{{ viewingItem.supplier.contact_person }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Warehouse</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {{ viewingItem.warehouse?.name || '-' }}
                        </p>
                        <p v-if="viewingItem.warehouse?.code" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Code: {{ viewingItem.warehouse.code }}
                        </p>
                        <p v-if="viewingItem.warehouse?.location" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-map-marker-alt mr-1"></i>{{ viewingItem.warehouse.location }}
                        </p>
                        <p v-if="viewingItem.warehouse?.contact_person"
                            class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-user mr-1"></i>{{ viewingItem.warehouse.contact_person }}
                            <span v-if="viewingItem.warehouse.contact_no"> - {{ viewingItem.warehouse.contact_no
                                }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Lines -->
            <div class="mb-6" v-if="viewingItem.lines && viewingItem.lines.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Order Lines ({{ viewingItem.lines.length }} items)
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
                                    Item</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Type</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Variant / Package</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Ordered</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Received</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Pending</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Unit Price</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Discount</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            <tr v-for="(line, index) in viewingItem.lines" :key="line.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ index + 1 }}</td>
                                <td class="px-4 py-3">
                                    <p class="text-sm text-gray-900 dark:text-white font-medium">
                                        {{ line.item_name || '-' }}
                                    </p>
                                    <p v-if="line.item_code" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Code: {{ line.item_code }}
                                    </p>
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        :class="line.is_raw_material
                                            ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'">
                                        {{ line.is_raw_material ? 'Raw Material' : 'Product' }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    <template v-if="line.variant_package">
                                        <span v-if="line.variant_package">
                                            {{ line.variant_package.name }} - {{ line.variant_package?.package_type }}
                                            <span v-if="line.variant_package.pieces_per_package">
                                                ({{ line.variant_package.pieces_per_package }} PCS)
                                            </span>
                                        </span>
                                    </template>
                                    <span v-else-if="line.is_raw_material" class="text-gray-400">
                                        {{ line.measurement_unit?.symbol }} </span>
                                    <span v-else class="text-gray-400">
                                        -
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{
                                    line.qty_ordered }}</td>
                                <td class="px-4 py-3 text-sm text-green-600 dark:text-green-400 text-right">{{
                                    line.qty_received }}</td>
                                <td class="px-4 py-3 text-sm text-orange-600 dark:text-orange-400 text-right">{{
                                    line.qty_pending }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{
                                    formatCurrency(line.unit_price) }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{
                                    formatCurrency(line.discount_amount) }}</td>
                                <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">{{
                                    formatCurrency(line.line_total)
                                    }}</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td colspan="9"
                                    class="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subtotal:</td>
                                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{{
                                    formatCurrency(viewingItem.subtotal) }}</td>
                            </tr>
                            <tr>
                                <td colspan="9" class="px-3 py-2 text-right text-sm dark:text-white">Item Total
                                    Discount:</td>
                                <td class="px-3 py-2 text-right text-green-600 dark:text-green-400"> ৳ {{
                                    viewingItem.lines.map(item => item?.discount_amount).reduce((acc, curr) => acc +
                                        curr,
                                        0).toFixed(2) || '0.00'}}</td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="9" class="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                                    Additional Discount:
                                </td>
                                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                    ৳ {{ formatCurrency(viewingItem.discount) }}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="9" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Total Discount:
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳ {{ formatCurrency(viewingItem.discount_amount) }}
                                </td>
                            </tr>
                            <tr v-if="viewingItem.vat_percentage > 0">
                                <td colspan="9" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    VAT ({{ formatCurrency(viewingItem.vat_percentage) }}%):
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                                    ৳ {{ formatCurrency(viewingItem.total - viewingItem.subtotal +
                                        viewingItem.discount_amount) }}
                                </td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="9"
                                    class="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-white">
                                    Total:
                                </td>
                                <td class="px-4 py-3 text-right text-xl font-bold text-blue-600 dark:text-blue-400">
                                    ৳ {{ formatCurrency(viewingItem.total_amount) }}
                                </td>
                            </tr>
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="9" class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                    Paid Amount:
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-green-600 dark:text-green-400">
                                    ৳ {{ formatCurrency(viewingItem.paid_amount) }}
                                </td>
                            </tr>
                            <!-- payable -->
                            <tr class="border-t border-gray-300 dark:border-gray-600">
                                <td colspan="9" class="px-4 py-2 text-right text-sm text-red-600 dark:text-red-400">
                                    Payable/Due:
                                </td>
                                <td class="px-4 py-2 text-right text-sm text-red-600 dark:text-red-400">
                                    ৳ {{ formatCurrency(viewingItem.total_amount - viewingItem.paid_amount) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Audit -->
            <div class="mb-2">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-clock mr-2"></i>Audit Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at || '-' }}</p>
                    </div>
                    <!-- <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.updated_at || '-' }}</p>
                    </div> -->
                    <div v-if="viewingItem.approved_at" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Approved At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.approved_at }}</p>
                    </div>
                    <div v-if="viewingItem.received_at" class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Received At</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.received_at }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!viewLoading && !viewingItem" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load purchase order details</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <Button variant="secondary" outlined :icon="true" @click="closeViewModal">Close</Button>
            <Button v-if="viewingItem && viewingItem.status === 'pending'" variant="secondary" icon="Edit"
                :loading="viewLoading" @click="editItem(viewingItem.id)">
                Edit Purchase Order
            </Button>
        </div>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Purchase Order" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Purchase Order</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete
                    <strong>{{ deletingItem?.order_no || 'this order' }}</strong>?
                    This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="purchaseOrderStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    purchaseOrderStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="purchaseOrderStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Deleting...
                    </span>
                    <span v-else>Delete Purchase Order</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Approve Modal -->
    <BaseModal :show="showApproveModal" title="Approve Purchase Order" maxWidth="lg" :showClose="false"
        @close="closeApproveModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <i class="fas fa-check-circle text-green-600 dark:text-green-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Approve Purchase Order</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to approve
                    <strong>{{ approvingItem?.order_no || 'this order' }}</strong>?
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeApproveModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleApprove" :disabled="purchaseOrderStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    purchaseOrderStore.loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                ]">
                    <span v-if="purchaseOrderStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Approving...
                    </span>
                    <span v-else>Approve Purchase Order</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Cancel Modal -->
    <BaseModal :show="showCancelModal" title="Cancel Purchase Order" maxWidth="lg" :showClose="false"
        @close="closeCancelModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                    <i class="fas fa-ban text-orange-600 dark:text-orange-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Cancel Purchase Order</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to cancel
                    <strong>{{ cancellingItem?.order_no || 'this order' }}</strong>?
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeCancelModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    No, Keep It
                </button>
                <button @click="handleCancel" :disabled="purchaseOrderStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    purchaseOrderStore.loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                ]">
                    <span v-if="purchaseOrderStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Cancelling...
                    </span>
                    <span v-else>Yes, Cancel Order</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Receive Modal -->
    <BaseModal v-if="showReceiveModal" :show="showReceiveModal" maxWidth="5xl" title="Receive Purchase Order"
        @close="closeReceiveModal">

        <div v-if="receiveLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading purchase order details...</p>
        </div>

        <div v-else-if="receivingItem" class="px-6 py-4">
            <!-- Header -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{ receivingItem.order_no ||
                            '-' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ receivingItem.order_date || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expected
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ receivingItem.expected_date || '-' }}
                        </p>
                    </div>
                    <div>
                        <span :class="statusBadgeClass(receivingItem.status)">
                            {{ formatBadge(receivingItem.status) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Lines with conditions/serials -->
            <div class="mb-6" v-if="receivingItem.lines && receivingItem.lines.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Order Lines
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
                                    Item</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Ordered</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Received</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Pending</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Receiving Now</th>
                                <!-- <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Condition</th> -->
                                <!-- <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Serial Numbers</th> -->
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            <tr v-for="(line, index) in receivingItem.lines" :key="line.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {{ line.item_name }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{
                                    line.qty_ordered
                                    }}</td>
                                <td class="px-4 py-3 text-sm text-green-600 dark:text-green-400 text-right">{{
                                    line.qty_received }}</td>
                                <td class="px-4 py-3 text-sm text-orange-600 dark:text-orange-400 text-right">{{
                                    line.qty_pending }}</td>
                                <td class="px-4 py-3 text-right">
                                    <input type="number" v-model.number="serialNumbersData[line.id].quantity"
                                        :max="line.qty_pending" min="0" @change="onReceivingQtyChange(line)"
                                        class="w-24 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                </td>
                                <!-- <td class="px-4 py-3">
                                    <SearchSelect v-model="serialNumbersData[line.id].condition"
                                        :options="conditionOptions" label="" placeholder="-- Select --"
                                        :clearable="false" :error="null" />
                                </td> -->
                                <!-- <td class="px-4 py-3 text-center">
                                    <div v-if="line.item_type && line.item_type.includes('Product')"
                                        class="flex flex-col items-center gap-2">
                                        <button @click="openSerialModal(line)"
                                            class="px-3 py-1.5 text-xs rounded-md transition-colors" :class="{
                                                'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400': !hasAllSerialsFilled(line.id),
                                                'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400': hasAllSerialsFilled(line.id)
                                            }">
                                            <i class="fas"
                                                :class="hasAllSerialsFilled(line.id) ? 'fa-edit' : 'fa-barcode'"></i>
                                            <span class="ml-1">{{ hasAllSerialsFilled(line.id) ? 'Edit Serials' :
                                                'Set Serials' }}</span>
                                        </button>
                                        <span :class="['text-xs font-medium', getSerialStatusClass(line.id)]">
                                            {{ getSerialStatusText(line.id) }}
                                        </span>
                                    </div>
                                    <span v-else class="text-xs text-gray-400">Not required</span>
                                </td> -->
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-else-if="!receiveLoading && !receivingItem" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load purchase order details</p>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeReceiveModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
            </button>
            <button @click="handleReceive" :disabled="isSubmittingReceive || receiveLoading || !receivingItem"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <i v-if="isSubmittingReceive" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-check-circle mr-2"></i>
                {{ isSubmittingReceive ? 'Processing...' : 'Receive Purchase Order' }}
            </button>
        </div>
    </BaseModal>

    <!-- Serial Modal -->
    <BaseModal v-if="showSerialModal" :show="showSerialModal" maxWidth="lg"
        :title="`Serial Numbers - ${currentSerialLine?.item_name || 'Item'}`" @close="closeSerialModal">
        <div class="px-6 py-4">
            <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    Please enter <strong>{{ currentSerialLine?.quantity || 0 }}</strong> unique serial number(s).
                </p>
            </div>

            <div class="space-y-3 max-h-96 overflow-y-auto">
                <div v-for="(input, idx) in serialInputs" :key="idx" class="flex items-center gap-3">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">
                        Serial #{{ idx + 1 }}:
                    </label>
                    <input v-model="input.value" type="text" :placeholder="`Enter serial number ${idx + 1}`"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                        @keyup.enter="saveSerialNumbers" />
                </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button @click="closeSerialModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="saveSerialNumbers"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-save mr-2"></i>Save Serial Numbers
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { usePurchaseOrderStore } from '@/stores/purchaseOrderStore.js';
import SearchSelect from '@/components/common/SearchSelect.vue';
import TextInput from '@/components/common/TextInput.vue';
import { useSupplierStore } from '@/stores/supplierStore.js';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Button from '@/components/common/Button.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';
import EllipseButton from '@/components/common/EllipseButton.vue';

const toast = useToast();
const router = useRouter();

const purchaseOrderStore = usePurchaseOrderStore();
const supplierStore = useSupplierStore();
const warehouseStore = useWarehouseStore();

// Column config
const tableColumns = ref([
    { key: 'order_no', label: 'Order No.', sortable: true, type: 'varchar' },
    { key: 'supplier_id', label: 'Supplier', sortable: true, type: 'bigint' },
    { key: 'warehouse_id', label: 'Warehouse', sortable: true, type: 'bigint' },
    { key: 'total_amount', label: 'Total Amount', sortable: true, type: 'decimal' },
    { key: 'status', label: 'Status', sortable: true, type: 'enum' },
]);

const receivingStatusOptions = [
    { id: 'draft', name: 'Draft' },
    { id: 'ordered', name: 'Ordered' },
    { id: 'partial', name: 'Partially Received' },
    { id: 'received', name: 'Received' },
    { id: 'cancelled', name: 'Cancelled' },
];

const approvalStatusOptions = [
    { id: 'pending', name: 'Pending' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
];

const conditionOptions = [
    { id: 'New stock', name: 'New Stock' },
    { id: 'Used stock', name: 'Used Stock' },
    { id: 'In use', name: 'In Use' },
    { id: 'Damaged', name: 'Damaged' },
    { id: 'Scrapped', name: 'Scrapped' },
];

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showApproveModal = ref(false);
const showCancelModal = ref(false);
const showReceiveModal = ref(false);
const viewLoading = ref(false);
const refresh = ref(false);

// Current items
const viewingItem = ref(null);
const deletingItem = ref(null);
const approvingItem = ref(null);
const cancellingItem = ref(null);
const receivingItem = ref(null);

// Search
const searchQuery = ref('');
let searchTimeout = null;

// Filters
const filters = reactive({
    supplier_id: null,
    warehouse_id: null,
    approval_status: null,
    status: null,
    from_date: '',
    to_date: '',
});
let filterTimeout = null;

// Computed lists
const displayedItems = computed(() => purchaseOrderStore.items || []);

const supplierStoreItems = computed(() => (supplierStore.items || []).filter(Boolean));
const warehouseStoreItems = computed(() => (warehouseStore.items || []).filter(Boolean));

// Row number
const calculateRowNumber = (index) => {
    if (purchaseOrderStore.pagination?.from && purchaseOrderStore.pagination.from > 0) {
        return purchaseOrderStore.pagination.from + index;
    }
    return (purchaseOrderStore.pagination.current_page - 1) * purchaseOrderStore.pagination.per_page + index + 1;
};

// Lifecycle
onMounted(async () => {
    await getData();
    loadRelatedData();
});

const getData = async () => {
    await purchaseOrderStore.get();
};

const loadRelatedData = () => {
    supplierStore.getAll();
    warehouseStore.getAll();
};

const refreshData = async () => {
    refresh.value = true;
    try {
        searchQuery.value = '';
        filters.supplier_id = null;
        filters.warehouse_id = null;
        filters.approval_status = null;
        filters.status = null;
        filters.from_date = '';
        filters.to_date = '';
        if (purchaseOrderStore.clearFilters) await purchaseOrderStore.clearFilters();
        else await getData();
    } catch (error) {
        toast.error('Failed to refresh data');
    } finally {
        refresh.value = false;
    }
};

// Search
const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        if (purchaseOrderStore.search) await purchaseOrderStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    if (purchaseOrderStore.search) purchaseOrderStore.search('');
};

// Filters
watch(filters, () => {
    handleFilterChange();
}, { deep: true });

const handleFilterChange = () => {
    if (filterTimeout) clearTimeout(filterTimeout);
    filterTimeout = setTimeout(async () => {
        const filterParams = {
            supplier_id: filters.supplier_id || null,
            warehouse_id: filters.warehouse_id || null,
            approval_status: filters.approval_status || null,
            status: filters.status || null,
            from_date: filters.from_date || '',
            to_date: filters.to_date || '',
        };
        if (purchaseOrderStore.filter) await purchaseOrderStore.filter(filterParams);
    }, 400);
};

// Navigation
const openCreatePage = () => router.push({ name: 'purchase-order-create' });
const editItem = (id) => router.push({ name: 'purchase-order-edit', params: { id } });

// View
const viewItem = async (item) => {
    try {
        viewLoading.value = true;
        showViewModal.value = true;
        const response = await purchaseOrderStore.show(item.id);
        if (response && response.success) {
            viewingItem.value = response.data;
        } else {
            toast.error('Failed to fetch purchase order details');
            closeViewModal();
        }
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        toast.error('An error occurred while fetching order details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};

const closeViewModal = () => {
    showViewModal.value = false;
    viewingItem.value = null;
    viewLoading.value = false;
};

// Delete
const confirmDelete = (item) => {
    deletingItem.value = item;
    showDeleteModal.value = true;
};
const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingItem.value = null;
};
const handleDelete = async () => {
    if (!deletingItem.value) return;
    const result = await purchaseOrderStore.deleteItem(deletingItem.value.id);
    if (result?.success) {
        closeDeleteModal();
        getData();
    }
};

// Approve
const approveItem = (item) => {
    approvingItem.value = item;
    showApproveModal.value = true;
};
const closeApproveModal = () => {
    showApproveModal.value = false;
    approvingItem.value = null;
};
const handleApprove = async () => {
    if (!approvingItem.value) return;
    try {
        await axiosClient.post(`/purchase-orders/${approvingItem.value.id}/approve`);
        toast.success('Purchase order approved successfully');
        closeApproveModal();
        getData();
    } catch (error) {
        console.error('Error approving purchase order:', error);
        toast.error(error.response?.data?.message || 'Failed to approve purchase order');
    }
};

// Cancel
const cancelItem = (item) => {
    cancellingItem.value = item;
    showCancelModal.value = true;
};
const closeCancelModal = () => {
    showCancelModal.value = false;
    cancellingItem.value = null;
};
const handleCancel = async () => {
    if (!cancellingItem.value) return;
    try {
        await axiosClient.post(`/purchase-orders/${cancellingItem.value.id}/cancel`);
        toast.success('Purchase order cancelled successfully');
        closeCancelModal();
        getData();
    } catch (error) {
        console.error('Error cancelling purchase order:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel purchase order');
    }
};

// Pagination & sorting
const handlePerPageChange = async (newPerPage) => {
    await purchaseOrderStore.changePerPage(newPerPage);
};
const handlePageChange = async (page) => {
    await purchaseOrderStore.paginate(page);
};
const sortByColumn = async (column) => {
    const order = purchaseOrderStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await purchaseOrderStore.sort(column, order);
};

// Formatting helpers
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};
const formatAmount = (value) => {
    if (!value) return '0.00';
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const formatBadge = (text) => {
    if (!text) return '-';
    return text.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusBadgeClass = (status) => {
    const base = 'px-2 py-1 text-xs rounded-full inline-block mt-1';
    switch (status) {
        case 'pending':
            return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
        case 'approved':
            return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case 'partial':
            return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
        case 'received':
            return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case 'cancelled':
            return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
        case 'rejected':
            return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
        default:
            return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
};

// Return
const returnItem = (data) => {
    router.push({ name: 'purchase-order-return', params: { invoice_id: data.id } });
};

// Print
const printOrder = (order) => {
    if (!order?.id) return;
    axiosClient.get(`/purchase-orders/${order.id}/download-pdf`, { responseType: 'blob' })
        .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `purchase-order-${order?.order_no}-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(() => toast.error('Failed to print purchase order'));
};

// ==================== RECEIVE ====================
const serialNumbersData = ref({});
const showSerialModal = ref(false);
const currentSerialLine = ref(null);
const serialInputs = ref([]);
const isSubmittingReceive = ref(false);
const receiveLoading = ref(false);

const receiveItem = async (item) => {
    try {
        receiveLoading.value = true;
        showReceiveModal.value = true;
        receivingItem.value = null;

        // Use GET to fetch the purchase order details, NOT POST
        const response = await axiosClient.get(`/purchase-orders/${item.id}`);

        // Handle nested response structure: response.data.data
        if (response?.data?.success && response.data.data) {
            receivingItem.value = response.data.data;
            initializeSerialNumbersData(response.data.data.lines);
        } else if (response?.data?.id) {
            // Fallback: response.data is the order directly
            receivingItem.value = response.data;
            initializeSerialNumbersData(response.data.lines || []);
        } else {
            toast.error('Failed to fetch purchase order details');
            showReceiveModal.value = false;
        }
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        toast.error(error.response?.data?.message || 'An error occurred while fetching order details');
        showReceiveModal.value = false;
    } finally {
        receiveLoading.value = false;
    }
};

const initializeSerialNumbersData = (lines) => {
    serialNumbersData.value = {};
    (lines || []).forEach((line) => {
        const pending = Number(line.qty_pending || 0);
        serialNumbersData.value[line.id] = {
            quantity: pending,           // receiving now (UI)
            serial_numbers: [],          // serial numbers for this line
            condition: '',               // selected condition
            is_serialized: !!(line.item_type && line.item_type.includes('Product')),
            qty_pending: pending,        // reference for validation
        };
    });
};

const onReceivingQtyChange = (line) => {
    const data = serialNumbersData.value[line.id];
    if (!data) return;

    let newQty = Number(data.quantity || 0);
    const pending = Number(line.qty_pending || 0);

    if (newQty > pending) {
        newQty = pending;
        toast.warning(`Quantity cannot exceed pending (${pending})`);
    }
    if (newQty < 0) newQty = 0;

    data.quantity = newQty;

    // Reset serial numbers if the count no longer matches
    if (data.serial_numbers.length !== newQty) {
        data.serial_numbers = [];
    }
};

const openSerialModal = (line) => {
    currentSerialLine.value = line;
    const currentData = serialNumbersData.value[line.id];
    const quantity = Number(currentData.quantity || 0);
    const existingSerials = currentData.serial_numbers || [];

    serialInputs.value = [];
    for (let i = 0; i < quantity; i++) {
        serialInputs.value.push({ index: i, value: existingSerials[i] || '' });
    }
    showSerialModal.value = true;
};

const saveSerialNumbers = () => {
    if (!currentSerialLine.value) return;
    const serialNumbers = serialInputs.value.map((i) => i.value.trim()).filter(Boolean);
    const requiredCount = Number(serialNumbersData.value[currentSerialLine.value.id].quantity);

    if (serialNumbers.length !== requiredCount) {
        toast.error(`Please provide all ${requiredCount} serial numbers`);
        return;
    }
    const unique = new Set(serialNumbers);
    if (unique.size !== serialNumbers.length) {
        toast.error('Duplicate serial numbers are not allowed');
        return;
    }

    serialNumbersData.value[currentSerialLine.value.id].serial_numbers = serialNumbers;
    const productName = currentSerialLine.value.item_name;
    closeSerialModal();
    toast.success(`Serial numbers saved for ${productName}`);
};

const closeSerialModal = () => {
    showSerialModal.value = false;
    currentSerialLine.value = null;
    serialInputs.value = [];
};

const hasAllSerialsFilled = (lineId) => {
    const data = serialNumbersData.value[lineId];
    if (!data || !data.is_serialized) return true;
    return data.serial_numbers.length === Number(data.quantity);
};
const getSerialCount = (lineId) => {
    const data = serialNumbersData.value[lineId];
    if (!data || !data.is_serialized) return 0;
    return data.serial_numbers.length;
};
const getSerialStatusText = (lineId) => {
    const data = serialNumbersData.value[lineId];
    if (!data || !data.is_serialized) return '';
    const filled = data.serial_numbers.length;
    const total = Number(data.quantity);
    if (total === 0) return 'Set quantity first';
    if (filled === 0) return 'No serials added';
    if (filled < total) return `${filled}/${total} serials added`;
    return 'All serials added';
};
const getSerialStatusClass = (lineId) => {
    const data = serialNumbersData.value[lineId];
    if (!data || !data.is_serialized) return '';
    const filled = data.serial_numbers.length;
    const total = Number(data.quantity);
    if (total === 0) return 'text-gray-500';
    if (filled === 0) return 'text-red-500';
    if (filled < total) return 'text-yellow-500';
    return 'text-green-500';
};

const handleReceive = async () => {
    if (!receivingItem.value) return;

    const lines = [];
    let hasError = false;

    for (const line of receivingItem.value.lines) {
        const lineData = serialNumbersData.value[line.id];
        const condition = lineData?.condition || '';
        const qtyReceiving = Number(lineData?.quantity || 0);

        // Skip lines with zero receiving quantity
        //if (qtyReceiving <= 0) continue;

        // Validate against pending
        // if (qtyReceiving > Number(line.qty_pending)) {
        //     toast.error(`Receiving quantity for ${line.item_name} exceeds pending (${line.qty_pending})`);
        //     hasError = true;
        //     break;
        // }

        // if (!condition) {
        //     toast.error(`Please select a condition for ${line.item_name}`);
        //     hasError = true;
        //     break;
        // }

        // if (lineData.is_serialized) {
        //     if (!lineData.serial_numbers || lineData.serial_numbers.length !== qtyReceiving) {
        //         toast.error(`Please add all serial numbers for ${line.item_name}`);
        //         hasError = true;
        //         break;
        //     }
        //     lines.push({
        //         purchase_order_line_id: line.id,
        //         qty_received: qtyReceiving,   // ✅ matches backend validation rule
        //         // condition,
        //         serial_numbers: lineData.serial_numbers,
        //     });
        // } else {
        lines.push({
            purchase_order_line_id: line.id,
            qty_received: qtyReceiving,   // ✅ matches backend validation rule
            // condition,
            // serial_numbers: [],
        });
        // }
    }

    if (hasError) return;
    if (lines.length === 0) {
        toast.error('Please enter at least one receiving quantity');
        return;
    }

    isSubmittingReceive.value = true;
    try {
        const response = await axiosClient.post(
            `/purchase-orders/${receivingItem.value.id}/receive`,
            { lines }
        );
        if (response.data.success) {
            toast.success('Purchase order received successfully');
            closeReceiveModal();
            getData();
        } else {
            toast.error(response.data.message || 'Failed to receive purchase order');
        }
    } catch (error) {
        console.error('Error receiving purchase order:', error);
        const msg = error.response?.data?.message
            || (error.response?.data?.errors && Object.values(error.response.data.errors).flat()[0])
            || 'Failed to receive purchase order';
        toast.error(msg);
    } finally {
        isSubmittingReceive.value = false;
    }
};

const closeReceiveModal = () => {
    showReceiveModal.value = false;
    receivingItem.value = null;
    serialNumbersData.value = {};
    isSubmittingReceive.value = false;
    receiveLoading.value = false;
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>