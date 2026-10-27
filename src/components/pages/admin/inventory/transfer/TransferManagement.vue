<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-lg font-semibold text-gray-700 dark:text-white">Product Transfer List</h1>
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
                    <button @click="openCreateModal" v-permission="['stock_movements.create']"
                        class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                        <i class="fas fa-plus"></i>
                        <span>New Transfer</span>
                    </button>
                </div>
            </div>

            <!-- Filter Row: From Location, To Location, Supplier, Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <!-- From Location Filter -->
                <div>
                    <SearchSelect v-model="filters.from_location_id" :options="warehouseStoreItems"
                        label="From Location" placeholder="-- All From Locations --" :clearable="true"
                        @update:model-value="handleFilterChange" />
                </div>

                <!-- To Location Filter -->
                <div>
                    <SearchSelect v-model="filters.to_location_id" :options="warehouseStoreItems" label="To Location"
                        placeholder="-- All To Locations --" :clearable="true"
                        @update:model-value="handleFilterChange" />
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
                <div class="col-span-1 md:col-span-2 lg:col-span-1 mt-6">
                    <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div class="relative flex-grow max-w-md">
                            <input v-model="searchQuery" @input="handleSearch" type="search"
                                placeholder="Search by reference no..."
                                class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                            <div class="absolute left-3 top-2.5 text-gray-400">
                                <i class="fas fa-search text-base"></i>
                            </div>
                        </div>
                        <div
                            class="text-xs text-gray-500 dark:text-gray-400 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1">
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
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="transferStore.sortBy"
                        :sort-direction="transferStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
                        @sort="sortByColumn" />

                    <!-- Loading State - Inside table body -->
                    <TableLoadingState v-if="transferStore.loading" :is-loading="true"
                        :total-items="transferStore.totalItems" :item-name="'transfers'"
                        loading-text="Loading transfers..." loading-subtext="Fetching your transfer data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <!-- Empty State -->
                        <TableLoadingState v-if="transferStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :has-search="!!searchQuery" :item-name="'transfers'" empty-icon="fas fa-exchange-alt"
                            empty-title="No transfers found"
                            :empty-message="searchQuery ? 'No transfers match your search criteria.' : 'Get started by creating your first transfer.'"
                            :create-button-text="'Add First Transfer'" @create="openCreateModal"
                            @clear-search="clearSearch" />

                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <p class="font-medium">{{ data.reference_no || 'N/A' }}</p>
                                <p class="text-xs text-gray-400 mt-1">Movement Date: {{ data.movement_date || 'N/A' }}
                                </p>
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                <p>{{ data.from_location_name || 'N/A' }}</p>
                                <p class="text-xs text-gray-400 capitalize">Type: {{ data.from_location_type || 'N/A' }}
                                </p>
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                <p>{{ data.to_location_name || 'N/A' }}</p>
                                <p class="text-xs text-gray-400 capitalize">Type: {{ data.to_location_type || 'N/A' }}
                                </p>
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {{ getTotalItems(data.items) }}
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {{ getTotalPackages(data.items) }}
                            </td>
                            <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span :class="{
                                    'px-2 py-1 text-xs rounded-full inline-block': true,
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': data.status === 'completed',
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': data.status === 'pending',
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': data.status === 'in_transit',
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': data.status === 'cancelled'
                                }">
                                    {{ formatBadge(data.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right text-sm font-medium relative">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewItem(data)" v-permission="['stock_movements.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <button @click="printChallan(data?.id)" v-permission="['stock_movements.view']"
                                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Download Challan">
                                        <i class="fas fa-download"></i>
                                    </button>

                                    <div class="relative inline-block text-left hidden"
                                        v-click-outside="() => data.showDropdown = false"
                                        v-permission="['stock_movements.view', 'stock_movements.edit', 'stock_movements.delete']">
                                        <button @click="data.showDropdown = !data.showDropdown"
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
                                                <button v-if="data.status === 'pending'"
                                                    @click="editItem(data.id); data.showDropdown = false"
                                                    v-permission="['stock_movements.update']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-edit text-yellow-500"></i>
                                                    Edit
                                                </button>
                                                <button v-if="data.status === 'pending'"
                                                    @click="confirmComplete(data); data.showDropdown = false"
                                                    v-permission="['stock_movements.complete']"
                                                    class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                                                    <i class="fas fa-check-circle text-green-500"></i>
                                                    Mark as Completed
                                                </button>
                                                <button v-if="data.status === 'pending'"
                                                    @click="confirmDelete(data); data.showDropdown = false"
                                                    v-permission="['stock_movements.delete']"
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

        <div v-if="transferStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="transferStore.totalItems > 0" :total-items="transferStore.totalItems"
                :per-page="transferStore.perPage" :current-page="transferStore.currentPage"
                :last-page="transferStore.lastPage" :is-loading="transferStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- View Modal -->
    <BaseModal v-if="showViewModal" :show="showViewModal" maxWidth="5xl" title="Transfer Details"
        @close="closeViewModal">
        <!-- Loading State -->
        <div v-if="viewLoading" class="px-6 py-8 text-center">
            <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading transfer details...</p>
        </div>

        <!-- Content -->
        <div v-else-if="viewingItem" class="px-6 py-4">
            <button @click="printChallan(viewingItem.id)" v-permission="['stock_movements.view']"
                class="w-auto border rounded-lg -mt-8 mb-3 px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <i class="fas fa-download"></i>Download Challan
            </button>

            <!-- Header Information -->
            <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference
                            No.</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">{{ viewingItem.reference_no
                            || 'N/A' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Movement
                            Date</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.movement_date || 'N/A' }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.supplier_name || 'N/A' }}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                        <p class="mt-1">
                            <span :class="{
                                'px-2 py-1 text-xs rounded-full inline-block': true,
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': viewingItem.status === 'completed',
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': viewingItem.status === 'pending',
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': viewingItem.status === 'in_transit',
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': viewingItem.status === 'cancelled'
                            }">
                                {{ formatBadge(viewingItem.status) }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Location Information -->
            <div class="mb-6">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-location-dot mr-2"></i>Location Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">From Location</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{
                            viewingItem.from_location_name || 'N/A' }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">Type: {{
                            viewingItem.from_location_type || 'N/A' }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">To Location</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1 font-medium">{{
                            viewingItem.to_location_name || 'N/A' }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">Type: {{
                            viewingItem.to_location_type || 'N/A' }}</p>
                    </div>
                </div>
            </div>

            <!-- Remarks -->
            <div class="mb-6" v-if="viewingItem.remarks">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-comment mr-2"></i>Remarks
                </h3>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p class="text-sm text-gray-900 dark:text-white">{{ viewingItem.remarks }}</p>
                </div>
            </div>

            <!-- Items Table -->
            <div class="mb-6" v-if="viewingItem.items && viewingItem.items.length > 0">
                <h3
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <i class="fas fa-boxes mr-2"></i>Items ({{ viewingItem.items.length }} items)
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
                                    Variant</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Package</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Package Qty</th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Total Pieces</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Source Stock</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Destination Stock</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            <tr v-for="(item, index) in viewingItem.items" :key="item.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ item.product_name ||
                                    'N/A' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ item.variant_name ||
                                    'N/A' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{
                                    item.variant_package_name || 'N/A' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{ item.quantity
                                    || 0 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{
                                    item.total_pieces || 0 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div v-if="item.source_warehouse_stock?.data">
                                        <span class="block">Pkg: {{ item.source_warehouse_stock.data.package_qty || 0
                                            }}</span>
                                        <span class="block text-xs">Pcs: {{ item.source_warehouse_stock.data.total_qty
                                            || 0 }}</span>
                                    </div>
                                    <span v-else class="text-xs text-gray-400">N/A</span>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div v-if="item.destination_warehouse_stock?.data">
                                        <span class="block">Pkg: {{ item.destination_warehouse_stock.data.package_qty ||
                                            0 }}</span>
                                        <span class="block text-xs">Pcs: {{
                                            item.destination_warehouse_stock.data.total_qty || 0 }}</span>
                                    </div>
                                    <span v-else class="text-xs text-gray-400">N/A</span>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td colspan="8"
                                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <span class="font-medium">Total Items:</span> {{ viewingItem.items.length }}
                                    &nbsp;|&nbsp;
                                    <span class="font-medium">Total Packages:</span> {{
                                    getTotalPackages(viewingItem.items) }}
                                    &nbsp;|&nbsp;
                                    <span class="font-medium">Total Pieces:</span> {{ getTotalPieces(viewingItem.items)
                                    }}
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
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.created_at || 'N/A' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="!viewLoading && !viewingItem" class="px-6 py-8 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Failed to load transfer details</p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Close
            </button>
            <button @click="editItem(viewingItem.id)" v-if="viewingItem && viewingItem.status === 'pending'"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                <i class="fas fa-edit mr-2"></i>Edit Transfer
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Transfer" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Transfer</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete transfer <strong>{{ deletingItem?.reference_no || 'this item'
                        }}</strong>? This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="transferStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    transferStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="transferStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Transfer</span>
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Complete Confirmation Modal -->
    <BaseModal :show="showCompleteModal" title="Complete Transfer" maxWidth="lg" :showClose="false"
        @close="closeCompleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <i class="fas fa-check-circle text-green-600 dark:text-green-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Complete Transfer</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to mark transfer <strong>{{ completingItem?.reference_no || 'this item'
                        }}</strong> as completed?
                </p>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeCompleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleComplete" :disabled="transferStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    transferStore.loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                ]">
                    <span v-if="transferStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                    </span>
                    <span v-else>Confirm Complete</span>
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import NumberInput from '@/components/common/NumberInput.vue';
import TextInput from '@/components/common/TextInput.vue';
import { useTransferStore } from '@/stores/transferStore.js';
import { useDealerStore } from '@/stores/dealerStore.js';
import { useWarehouseStore } from '@/stores/warehouseStore.js';
import { useUserStore } from '@/stores/userStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axiosClient from '@/axiosClient';

const toast = useToast();
const viewLoading = ref(false);
const refresh = ref(false);

const tableColumns = ref([
    {
        "key": "reference_no",
        "label": "Reference No.",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "from_location_name",
        "label": "From Location",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "to_location_name",
        "label": "To Location",
        "sortable": true,
        "type": "varchar"
    },
    {
        "key": "items_count",
        "label": "Items",
        "sortable": false,
        "type": "integer"
    },
    {
        "key": "total_packages",
        "label": "Total Packages",
        "sortable": false,
        "type": "integer"
    },
    {
        "key": "status",
        "label": "Status",
        "sortable": true,
        "type": "enum"
    }
]);

const locationTypeOptions = ref([
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'store', label: 'Store' },
    { value: 'shop', label: 'Shop' }
]);

// Filter state
const filters = ref({
    from_location_id: null,
    to_location_id: null,
    supplier_id: null,
    from_date: '',
    to_date: ''
});

const transferStore = useTransferStore();
const dealerStore = useDealerStore();
const warehouseStore = useWarehouseStore();
const userStore = useUserStore();
const router = useRouter();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const showCompleteModal = ref(false);

// Search query with debounce
const searchQuery = ref('');
let searchTimeout = null;
let filterTimeout = null;

// Form data
const formData = ref({
    from_location_type: '',
    from_location_id: null,
    to_location_type: '',
    to_location_id: null,
    supplier_id: null,
    movement_date: '',
    remarks: '',
    status: 'pending'
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const completingItem = ref(null);
const modalMode = ref('create');

// Computed properties for store items
const dealerStoreItems = computed(() => {
    const items = dealerStore.items || [];
    return items.filter(item => item !== undefined && item !== null);
});

const warehouseStoreItems = computed(() => {
    const items = warehouseStore.items || [];
    return items.filter(item => item !== undefined && item !== null);
});

const displayedItems = computed(() => {
    return transferStore.items || [];
});

const hasActiveFilters = computed(() => {
    return !!(filters.value.from_location_id || filters.value.to_location_id ||
        filters.value.supplier_id || filters.value.from_date || filters.value.to_date);
});

const calculateRowNumber = (index) => {
    if (transferStore.pagination?.from && transferStore.pagination.from > 0) {
        return transferStore.pagination.from + index;
    }
    return (transferStore.pagination.current_page - 1) * transferStore.pagination.per_page + index + 1;
};

const clearAllValidationErrors = () => {
    transferStore.validationErrors = {};
};

// Helper functions
const getTotalItems = (items) => {
    return items?.length || 0;
};

const getTotalPackages = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

const getTotalPieces = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.total_pieces || 0), 0);
};

const getSupplierNameFromMovement = (movement) => {
    if (movement.supplier_name) return movement.supplier_name;
    if (movement.supplier_id) {
        const supplier = dealerStore.items.find(s => s.id === movement.supplier_id);
        return supplier?.name || 'N/A';
    }
    return 'N/A';
};

const getWarehouseName = (id) => {
    if (!id) return '';
    const warehouse = warehouseStore.items.find(w => w.id === id);
    return warehouse?.name || `ID: ${id}`;
};

const getSupplierName = (id) => {
    if (!id) return '';
    const supplier = dealerStore.items.find(s => s.id === id);
    return supplier?.name || `ID: ${id}`;
};

// Filter handlers
const handleFilterChange = () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }

    filterTimeout = setTimeout(async () => {
        const filterParams = {};

        if (filters.value.from_location_id) {
            filterParams.from_location_id = filters.value.from_location_id;
        }
        if (filters.value.to_location_id) {
            filterParams.to_location_id = filters.value.to_location_id;
        }
        if (filters.value.supplier_id) {
            filterParams.supplier_id = filters.value.supplier_id;
        }
        if (filters.value.from_date) {
            filterParams.from_date = filters.value.from_date;
        }
        if (filters.value.to_date) {
            filterParams.to_date = filters.value.to_date;
        }

        await transferStore.get(filterParams);
    }, 400);
};

const clearFilter = (filterName) => {
    filters.value[filterName] = filterName === 'from_date' || filterName === 'to_date' ? '' : null;
    handleFilterChange();
};

const clearAllFilters = () => {
    filters.value = {
        from_location_id: null,
        to_location_id: null,
        supplier_id: null,
        from_date: '',
        to_date: ''
    };
    handleFilterChange();
};

// Search with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await transferStore.search(searchQuery.value);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    transferStore.search('');
};

onMounted(async () => {
    await Promise.all([
        getData(),
        loadRelatedData()
    ]);
});

const getData = async () => {
    await transferStore.get();
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
    } finally {
        refresh.value = false;
    }
};

const loadRelatedData = async () => {
    await Promise.all([
        dealerStore.getAll(),
        warehouseStore.getAll(),
        userStore.getAll()
    ]);
};

// Modal functions
const openCreateModal = () => {
    router.push({ name: 'new-transfer' });
};

const editItem = (itemID) => {
    router.push({ name: 'transfer/edit', params: { id: itemID } });
};

const viewItem = async (item) => {
    try {
        viewLoading.value = true;
        showViewModal.value = true;

        const response = await transferStore.show(item.id);

        if (response && response.success) {
            viewingItem.value = response.data;
        } else {
            toast.error('Failed to fetch transfer details');
            closeViewModal();
        }
    } catch (error) {
        console.error('Error fetching transfer:', error);
        toast.error('An error occurred while fetching transfer details');
        closeViewModal();
    } finally {
        viewLoading.value = false;
    }
};

const confirmDelete = (item) => {
    deletingItem.value = item;
    showDeleteModal.value = true;
};

const confirmComplete = (item) => {
    completingItem.value = item;
    showCompleteModal.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    clearAllValidationErrors();
};

const closeViewModal = () => {
    showViewModal.value = false;
    viewingItem.value = null;
    viewLoading.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingItem.value = null;
};

const closeCompleteModal = () => {
    showCompleteModal.value = false;
    completingItem.value = null;
};

const resetForm = () => {
    formData.value = {
        from_location_type: '',
        from_location_id: null,
        to_location_type: '',
        to_location_id: null,
        supplier_id: null,
        movement_date: '',
        remarks: '',
        status: 'pending'
    };
    currentItem.value = null;
};

// CRUD operations
const handleSubmit = async () => {
    clearAllValidationErrors();

    const formDataToSend = new FormData();

    for (const key in formData.value) {
        const value = formData.value[key];
        if (value === null || value === undefined || value === '') {
            continue;
        }
        formDataToSend.append(key, value);
    }

    let result;
    if (modalMode.value === 'create') {
        result = await transferStore.create(formDataToSend);
    } else {
        formDataToSend.append('_method', 'PUT');
        result = await transferStore.update(currentItem.value.id, formDataToSend);
    }

    if (result && result.success) {
        closeModal();
        getData();
    }
};

const handleDelete = async () => {
    if (deletingItem.value) {
        const result = await transferStore.deleteItem(deletingItem.value.id);
        if (result.success) {
            closeDeleteModal();
            getData();
        }
    }
};

const handleComplete = async () => {
    if (!completingItem.value) return;

    try {
        transferStore.loading = true;
        const response = await axiosClient.post(`/stock-movements/${completingItem.value.id}/complete`);

        if (response.data.success) {
            toast.success('Transfer marked as completed successfully');
            closeCompleteModal();
            getData();
        } else {
            toast.error(response.data.message || 'Failed to complete transfer');
        }
    } catch (error) {
        console.error('Error completing transfer:', error);
        toast.error(error.response?.data?.message || 'Failed to complete transfer');
    } finally {
        transferStore.loading = false;
    }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await transferStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await transferStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = transferStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await transferStore.sort(column, order);
};

const formatBadge = (text) => {
    if (!text) return 'N/A';
    return text
        .replaceAll('_', ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

// Print challan
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
            });
    }
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>