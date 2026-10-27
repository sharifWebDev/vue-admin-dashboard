<!-- WorkOrderList.vue -->
<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Work Orders List</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col gap-4 mb-4">
            <!-- Filter Row -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <!-- Left Side: Create Button -->
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button @click="openCreateWorkOrder" v-permission="['work_orders.create']"
                            class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                            <i class="fas fa-plus"></i>
                            <span>New Work Order</span>
                        </button>
                    </div>
                </div>
                <!-- Supplier Filter -->
                <div>
                    <SearchSelect v-model="filters.supplier_id" :options="supplierStoreItems"
                        placeholder="All Suppliers" :clearable="true" @update:model-value="handleFilterChange" />
                </div>

                <!-- From Date Filter -->
                <div class="flex">
                    <TextInput v-model="filters.from_date" type="date" placeholder="Select From Date" :clearable="true"
                        @update:model-value="handleFilterChange" />
                    <span class="ml-2 text-gray-500 dark:text-gray-400 my-auto">To</span>
                </div>

                <!-- To Date Filter -->
                <div>
                    <TextInput v-model="filters.to_date" type="date" placeholder="Select To Date" :clearable="true"
                        @update:model-value="handleFilterChange" />
                </div>
                <!-- Right Side: Search -->
                <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div class="relative flex-grow max-w-md">
                        <input v-model="searchQuery" @input="handleSearch" type="search"
                            placeholder="Search by reference no, supplier name..."
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
                    <SortableTableHeader :columns="tableColumns" :sort-by="workOrderStore.sortBy"
                        :sort-direction="workOrderStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="workOrderStore.loading" :is-loading="true"
                        :total-items="workOrderStore.totalItems" :item-name="'work orders'"
                        loading-text="Loading work orders..." loading-subtext="Fetching your work order data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Empty State -->
                        <TableLoadingState v-if="workOrderStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :has-search="!!searchQuery" :item-name="'work orders'" empty-icon="fas fa-file-alt"
                            empty-title="No work orders found"
                            :empty-message="searchQuery ? 'No work orders match your search criteria.' : 'Get started by creating your first work order.'"
                            :show-create-button="false" @clear-search="clearSearch" />

                        <tr v-else v-for="(workOrder, index) in displayedItems" :key="workOrder.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">{{
                                    workOrder.reference_no || '-' }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Date: {{
                                    formatDate(workOrder.work_order_date) }}</p>
                            </td>
                            <td class="px-6 py-3">
                                <p class="text-sm text-gray-900 dark:text-white">
                                    {{ workOrder.supplier?.name || workOrder.supplier_name || '-' }}</p>
                                <p v-if="workOrder.supplier_address || workOrder.supplier_city"
                                    class="text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-semibold"></span> {{ workOrder.supplier_address || '-' }}
                                </p>
                            </td>
                            <td class="px-6 py-3 text-start text-sm text-gray-900 dark:text-white">
                                {{ workOrder.items?.length || 0 }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                ৳{{ formatNumber(workOrder.total_bill_amount) }}
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewWorkOrder(workOrder)" v-permission="['work_orders.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button @click="downloadWorkOrder(workOrder)" v-permission="['work_orders.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Download Work Order">
                                        <i class="fas fa-download"></i>
                                    </button>

                                    <!-- print -->
                                    <button @click="printWorkOrder(workOrder?.id)" v-permission="['work_orders.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Print Order Sheet">
                                        <i class="fas fa-print"></i>
                                    </button>

                                    <div class="relative inline-block text-left"
                                        v-click-outside="() => workOrder.showDropdown = false"
                                        v-permission="['work_orders.update', 'work_orders.delete']">
                                        <button @click="workOrder.showDropdown = !workOrder.showDropdown"
                                            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Actions">
                                            <i class="fas fa-ellipsis-v text-gray-600 dark:text-gray-200"></i>
                                        </button>

                                        <div v-if="workOrder.showDropdown" class="absolute right-0 z-[100] w-44 mt-2
                                            origin-top-right rounded-md shadow-xl
                                            bg-white dark:bg-gray-800
                                            ring-1 ring-black ring-opacity-5
                                            divide-y divide-gray-100 dark:divide-gray-700">
                                            <div class="py-1">
                                                <button
                                                    @click="editWorkOrder(workOrder.id); workOrder.showDropdown = false"
                                                    v-permission="['work_orders.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>
                                                <button
                                                    @click="confirmDelete(workOrder); workOrder.showDropdown = false"
                                                    v-permission="['work_orders.delete']"
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
        <div v-if="workOrderStore.pagination && workOrderStore.pagination.total > 0" class="mt-6">
            <Pagination :total-items="workOrderStore.pagination.total" :per-page="workOrderStore.pagination.per_page"
                :current-page="workOrderStore.pagination.current_page" :last-page="workOrderStore.pagination.last_page"
                :is-loading="workOrderStore.loading" @change-page="handlePageChange"
                @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- View Work Order Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="7xl" title="Work Order Details"
        @close="closeViewModal">
        <!-- Loading State -->
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading work order details...</p>
        </div>

        <!-- Content -->
        <div v-else-if="viewingWorkOrder" class="px-6 py-4">
            <button @click="downloadWorkOrder(viewingWorkOrder)" v-if="viewingWorkOrder"
                class="w-auto border rounded-lg -mt-8 mb-3 px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <i class="fas fa-download"></i>Download Work Order
            </button>

            <!-- Header Information -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference
                            No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{
                            viewingWorkOrder.reference_no || '-' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Work Order
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                            formatDate(viewingWorkOrder.work_order_date) }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revised Date
                            1</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                            formatDate(viewingWorkOrder.revised_date_1) }}
                        </p>
                    </div>
                    <div>
                        <!-- "revised_date_1": "2026-08-11",
                        "revised_date_2": "2026-08-15", -->
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revised Date
                            2</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                            formatDate(viewingWorkOrder.revised_date_2) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Supplier Information -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-store mr-2"></i>Supplier Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Supplier Name</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {{ viewingWorkOrder.supplier?.name }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Address</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.supplier_address ||
                            '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">City / Country</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">
                            {{ viewingWorkOrder.supplier_city || '-' }}, {{ viewingWorkOrder.supplier_country || '-' }}
                        </p>
                    </div>
                    <div v-if="viewingWorkOrder.supplier_factory_address"
                        class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Factory Address</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                            viewingWorkOrder.supplier_factory_address }}</p>
                    </div>
                </div>
            </div>

            <!-- Letter Content -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-envelope mr-2"></i>Letter Content
                </h3>
                <div class="grid grid-cols-1 gap-3">

                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Salutation</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.salutation || '-' }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Subject</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{ viewingWorkOrder.subject ||
                            '-' }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Introduction</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.introduction || '-' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="mb-6" v-if="viewingWorkOrder.items && viewingWorkOrder.items.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Items ({{ viewingWorkOrder.items.length }} items)
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    #
                                </th>

                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Product
                                </th>

                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Size
                                </th>

                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Quality
                                </th>

                                <!-- Length -->
                                <th v-if="hasViewLength"
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Length
                                </th>

                                <!-- Width -->
                                <th v-if="hasViewWidth"
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Width
                                </th>

                                <!-- Height -->
                                <th v-if="hasViewHeight"
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Height
                                </th>

                                <!-- Weight -->
                                <th v-if="hasViewWeight"
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Weight
                                </th>

                                <!-- Color -->
                                <th v-if="hasViewColor"
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Color
                                </th>

                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Qty (kg)
                                </th>

                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Unit
                                </th>

                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Unit Price
                                </th>

                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">

                            <tr v-for="(item, index) in viewingWorkOrder.items" :key="item.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">

                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {{ index + 1 }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {{ item.product_description || '-' }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {{ item.size || '-' }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {{ item.foil_quality || '-' }}
                                </td>

                                <!-- Length -->
                                <td v-if="hasViewLength"
                                    class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.length || '-' }}
                                </td>

                                <!-- Width -->
                                <td v-if="hasViewWidth"
                                    class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.width_mm || '-' }}
                                </td>

                                <!-- Height -->
                                <td v-if="hasViewHeight"
                                    class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.height_mm || '-' }}
                                </td>

                                <!-- Weight -->
                                <td v-if="hasViewWeight"
                                    class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.weight || '-' }}
                                </td>

                                <!-- Color -->
                                <td v-if="hasViewColor"
                                    class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.color || '-' }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.order_quantity_kg || 0 }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                    {{ item.unit || '-' }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                    ৳{{ formatNumber(item.unit_price_per_kg) }}
                                </td>

                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                    ৳{{ formatNumber(item.total_bill_amount) }}
                                </td>

                            </tr>

                        </tbody>

                        <tfoot class="bg-gray-50 dark:bg-gray-700">

                            <!-- Grand Total -->
                            <tr>
                                <td :colspan="viewTableColumnCount - 1"
                                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Grand Total:
                                </td>

                                <td class="px-4 py-3 text-right text-xl font-bold text-blue-600 dark:text-blue-400">
                                    ৳{{ formatNumber(viewingWorkOrder.total_bill_amount) }}
                                </td>
                            </tr>

                            <!-- Amount in Words -->
                            <tr>
                                <td :colspan="viewTableColumnCount"
                                    class="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400 italic">
                                    Total Amount in Words:
                                    {{ viewingWorkOrder.total_amount_in_words || 'Zero Only' }}
                                </td>
                            </tr>

                        </tfoot>

                    </table>

                    <!-- Terms -->
                    <div v-if="viewingWorkOrder.term_a || viewingWorkOrder.term_b || viewingWorkOrder.term_c || viewingWorkOrder.term_d || viewingWorkOrder.term_e"
                        class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-3">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Terms & Conditions</label>
                        <ul class="text-sm text-gray-900 dark:text-white mt-1 list-disc list-inside space-y-1">
                            <li v-if="viewingWorkOrder.term_a">{{ viewingWorkOrder.term_a }}</li>
                            <li v-if="viewingWorkOrder.term_b">{{ viewingWorkOrder.term_b }}</li>
                            <li v-if="viewingWorkOrder.term_c">{{ viewingWorkOrder.term_c }}</li>
                            <li v-if="viewingWorkOrder.term_d">{{ viewingWorkOrder.term_d }}</li>
                            <li v-if="viewingWorkOrder.term_e">{{ viewingWorkOrder.term_e }}</li>
                        </ul>
                    </div>

                    <!-- Special Notes -->
                    <div v-if="viewingWorkOrder.special_notes"
                        class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-3">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Special Notes</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.special_notes }}</p>
                    </div>

                    <!-- Signature Labels -->
                    <div class="grid grid-cols-2 gap-3 mt-3">
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Signature Label</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.signature_label ||
                                '-' }}</p>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingWorkOrder.request_name ||
                                '-' }}</p>

                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Receiving Copy
                                Label</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                                viewingWorkOrder.receiving_copy_label || '-' }}</p>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{
                                viewingWorkOrder.received_name || '-' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="!viewLoading && !viewingWorkOrder" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load work order details</p>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Work Order" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Work Order</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete work order <strong>
                        {{ deletingWorkOrder?.reference_no || 'this work order' }}</strong>?
                    This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="workOrderStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    workOrderStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="workOrderStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Work Order</span>
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
import { useWorkOrderStore } from '@/stores/workOrderStore';
import { useSupplierStore } from '@/stores/supplierStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';

const toast = useToast();
const viewLoading = ref(false);
const refresh = ref(false);

// Table columns configuration
const tableColumns = ref([
    {
        "key": "reference_no",
        "label": "Reference No.",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "supplier_name",
        "label": "Supplier",
        "sortable": true,
        "type": "varchar",
    },
    {
        "key": "total_items",
        "label": "Total Items",
        "sortable": true,
        "type": "integer",
        "class": "text-center",
        "align": "center"
    },
    {
        "key": "total_bill_amount",
        "label": "Total Amount",
        "sortable": true,
        "type": "decimal",
        "class": "text-right",
        "align": "right"
    }
]);

// Status options based on API
const statusOptions = ref([
    { id: 'pending', name: 'Pending' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' }
]);

// Filter state
const filters = ref({
    supplier_id: null,
    status: null,
    from_date: '',
    to_date: ''
});

const workOrderStore = useWorkOrderStore();
const supplierStore = useSupplierStore();
const router = useRouter();

// Modal states
const showViewModal = ref(false);
const showDeleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

// Current items
const viewingWorkOrder = ref(null);
const deletingWorkOrder = ref(null);

// Computed properties
const supplierStoreItems = computed(() => {
    const items = supplierStore.items || [];
    return items.map(item => ({
        id: item.id,
        name: item.name || item.dealer_name
    })).filter(item => item !== undefined && item !== null);
});

const displayedItems = computed(() => {
    return workOrderStore.items || [];
});

const calculateRowNumber = (index) => {
    if (workOrderStore.pagination?.from && workOrderStore.pagination.from > 0) {
        return workOrderStore.pagination.from + index;
    }
    return (workOrderStore.pagination?.current_page - 1) * (workOrderStore.pagination?.per_page || 10) + index + 1;
};

// Helper functions
const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
};

const formatDate = (date) => {
    if (!date) return '-';
    return date;
};

const formatStatus = (status) => {
    const statusMap = {
        'completed': 'Completed',
        'pending': 'Pending',
        'returned': 'Returned',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status || 'Pending';
};

const getStatusClass = (status) => {
    const classes = {
        'completed': 'px-2 py-1 text-xs rounded-full inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'pending': 'px-2 py-1 text-xs rounded-full inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'returned': 'px-2 py-1 text-xs rounded-full inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'cancelled': 'px-2 py-1 text-xs rounded-full inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return classes[status] || classes.pending;
};

// Filter handlers
const handleFilterChange = () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }

    filterTimeout = setTimeout(async () => {
        const filterParams = {};

        if (filters.value.supplier_id) {
            filterParams.supplier_id = filters.value.supplier_id;
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

        await workOrderStore.get(filterParams);
    }, 400);
};

// Search with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await workOrderStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    workOrderStore.search('');
};

const clearAllFilters = () => {
    filters.value = {
        supplier_id: null,
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
    await workOrderStore.get();
};

const refreshData = async () => {
    refresh.value = true;
    try {
        if (searchQuery.value) {
            clearSearch();
        }
        if (Object.values(filters.value).some(v => v !== null && v !== '')) {
            clearAllFilters();
        }
        await getData();
    } catch (error) {
        toast.error('Failed to refresh data');
    } finally {
        refresh.value = false;
    }
};

const loadRelatedData = async () => {
    await Promise.all([
        supplierStore.getAll()
    ]);
};

// Navigation functions
const openCreateWorkOrder = () => {
    router.push({ name: 'new-work-order' });
};

const editWorkOrder = (workOrderId) => {
    router.push({ name: 'work-order-edit', params: { id: workOrderId } });
};

// View work order
const viewWorkOrder = async (workOrder) => {
    try {
        viewLoading.value = true;
        showViewModal.value = true;

        const response = await workOrderStore.show(workOrder.id);

        if (response && response.success) {
            viewingWorkOrder.value = response.data;
        } else {
            toast.error('Failed to fetch work order details');
            closeViewModal();
        }
    } catch (error) {
        console.error('Error fetching work order:', error);
        toast.error('An error occurred while fetching work order details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};


// Download work order
const downloadWorkOrder1 = (workOrder) => {
    if (workOrder && workOrder.id) {
        axiosClient.get(`/work-orders/${workOrder.id}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `work_order_${workOrder.reference_no || workOrder.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('Work order downloaded successfully!');
            })
            .catch((error) => {
                console.error('Error downloading work order:', error);
                toast.error('Failed to download work order');
            });
    }
};


// Print invoice
const downloadWorkOrder = (workOrder) => {
    if (workOrder && workOrder.id) {
        axiosClient.get(`/work-orders/${workOrder.id}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `work_order_${workOrder.reference_no || workOrder.id}.pdf`);
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

// Print work order
const printWorkOrder = (workOrderId) => {
    if (workOrderId) {
        axiosClient.get(`/work-orders/${workOrderId}/download-pdf`, { responseType: 'blob' })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    iframe.contentWindow.print();
                };
            })
            .catch((error) => {
                console.error('Error printing work order:', error);
                toast.error('Failed to print work order');
            });
    }
};

// Delete functions
const confirmDelete = (workOrder) => {
    deletingWorkOrder.value = workOrder;
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (deletingWorkOrder.value) {
        const result = await workOrderStore.deleteItem(deletingWorkOrder.value.id);
        if (result.success) {
            closeDeleteModal();
            await getData();
        } else {
            toast.error(result.message || 'Failed to delete work order');
        }
    }
};

// Modal close functions
const closeViewModal = () => {
    showViewModal.value = false;
    viewingWorkOrder.value = null;
    viewLoading.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingWorkOrder.value = null;
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await workOrderStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await workOrderStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = workOrderStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await workOrderStore.sort(column, order);
};

const hasViewLength = computed(() => {
    return viewingWorkOrder.value?.items?.some(item => {
        const value = item?.length;

        return value !== null &&
            value !== undefined &&
            String(value).trim() !== '';
    }) ?? false;
});

const hasViewWidth = computed(() => {
    return viewingWorkOrder.value?.items?.some(item => {
        const value = item?.width_mm;

        return value !== null &&
            value !== undefined &&
            String(value).trim() !== '';
    }) ?? false;
});

const hasViewHeight = computed(() => {
    return viewingWorkOrder.value?.items?.some(item => {
        const value = item?.height_mm;

        return value !== null &&
            value !== undefined &&
            String(value).trim() !== '';
    }) ?? false;
});

const hasViewWeight = computed(() => {
    return viewingWorkOrder.value?.items?.some(item => {
        const value = item?.weight;

        return value !== null &&
            value !== undefined &&
            String(value).trim() !== '';
    }) ?? false;
});

const hasViewColor = computed(() => {
    return viewingWorkOrder.value?.items?.some(item => {
        const value = item?.color;

        return value !== null &&
            value !== undefined &&
            String(value).trim() !== '';
    }) ?? false;
});

const viewTableColumnCount = computed(() => {
    return 8 +
        Number(hasViewLength.value) +
        Number(hasViewWidth.value) +
        Number(hasViewHeight.value) +
        Number(hasViewWeight.value) +
        Number(hasViewColor.value);
});
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