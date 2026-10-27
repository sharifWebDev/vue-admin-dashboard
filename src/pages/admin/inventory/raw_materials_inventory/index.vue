<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Raw
                    Materials Inventory</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <!-- Left Side: Create Button -->
            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="openCreateModal" v-permission="['raw_material_inventory.update']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>Add Stock</span>
                </button>
                <button @click="openUsageModal" v-permission="['raw_material_inventory.update']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-boxes"></i>
                    <span>Record Usage</span>
                </button>
            </div>

            <!-- Right Side: Search and Filters -->
            <div class="flex items-center gap-3 w-full lg:w-auto">
                <!-- Material filter -->
                <div class="relative min-w-[150px]">
                    <SearchSelect v-model="filters.raw_material_id" :options="rawMaterials" placeholder="All Materials"
                        option-label="name" option-value="id" @change="applyFilters" />
                </div>
                <!-- Warehouse Filter -->
                <div class="relative min-w-[150px]">
                    <SearchSelect v-model="filters.warehouse_id" :options="warehouses" placeholder="All Warehouses"
                        option-label="name" option-value="id" @change="applyFilters" />
                </div>

                <!-- Search Input -->
                <div class="relative flex-1 min-w-0 max-w-md">
                    <input v-model="searchQuery" @input="handleSearch" type="search"
                        placeholder="Search by material name..."
                        class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search text-base"></i>
                    </div>
                </div>

                <!-- Refresh Button -->
                <button @click="refreshData" title="Refresh Data"
                    class="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
                    :disabled="refresh">
                    <i class="fas fa-sync-alt" :class="{ 'animate-spin': refresh }"></i>
                </button>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="inventoryStore.sortBy"
                        :sort-direction="inventoryStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="inventoryStore.loading" :is-loading="true"
                        :total-items="inventoryStore.totalItems" :item-name="'inventory records'"
                        loading-text="Loading inventory data..." loading-subtext="Fetching your raw material stock" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">

                        <!-- Empty State -->
                        <TableLoadingState v-if="inventoryStore.items.length === 0" :is-loading="false" :isEmpty="true"
                            :has-search="!!searchQuery" :item-name="'inventory records'" empty-icon="fas fa-warehouse"
                            empty-title="No inventory records found"
                            :empty-message="searchQuery ? 'No inventory records match your search criteria.' : 'Get started by adding stock to your raw materials.'"
                            :show-create-button="false" @clear-search="clearSearch" />

                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id" class="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors even:bg-gray-100 odd:bg-white 
           dark:even:bg-gray-700 dark:odd:bg-gray-800">
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ calculateRowNumber(index) }}
                            </td>
                            <td class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img v-if="data.raw_material?.image_url" :src="data.raw_material.image_url"
                                            :alt="data.raw_material?.name" class="h-10 w-10 rounded-md object-cover">
                                        <div v-else
                                            class="h-10 w-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-md">
                                            <i class="fas fa-cube text-gray-400"></i>
                                        </div>
                                    </div>
                                    <div class="flex flex-col">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ data.raw_material?.name || 'N/A' }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ data.raw_material?.measurement_unit?.symbol || '-' }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {{ data.warehouse?.name || 'N/A' }}
                            </td>
                            <td
                                class="px-6 py-1 md:py-2 lg:py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                <span class="font-medium">{{ formatQuantity(data.qty) }}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    {{ data.raw_material?.measurement_unit?.symbol || '' }}
                                </span>
                            </td>
                            <td class="px-6 py-1 md:py-2 lg:py-3 text-right text-sm font-medium relative">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="viewInventory(data)" v-permission="['raw_material_inventory.view']"
                                        class="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 p-1 rounded bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors dark:bg-gray-500"
                                        title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="inventoryStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="inventoryStore.totalItems > 0" :total-items="inventoryStore.totalItems"
                :per-page="inventoryStore.perPage" :current-page="inventoryStore.currentPage"
                :last-page="inventoryStore.lastPage" :is-loading="inventoryStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- Create/Edit Stock Modal -->
    <BaseModal v-if="isStockModalOpen" :show="isStockModalOpen"
        :title="stockModalMode === 'create' ? 'Add Stock' : 'Update Stock'" maxWidth="4xl" @close="closeStockModal">
        <form @submit.prevent="handleStockSubmit" class="px-2 py-3 space-y-4 min-h-[35vh]">
            <!-- Warehouse Selection -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Warehouse <span class="text-xs text-red-500">*</span>
                    </label>
                    <SearchSelect v-model="stockFormData.warehouse_id" :options="warehouses"
                        placeholder="Select a warehouse" option-value="id" option-label="name"
                        @change="clearStockValidationError('warehouse_id')"
                        :class="{ 'border-red-500': getStockValidationErrors('warehouse_id') }" />
                    <p v-if="getStockValidationErrors('warehouse_id')"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ getStockValidationErrors('warehouse_id')[0] }}
                    </p>
                </div>
            </div>

            <!-- Stock Items Table -->
            <div class="border rounded-lg overflow-y-visible dark:border-gray-700">
                <div class="overflow-y-visible">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                                    #
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Raw Material <span class="text-red-500">*</span>
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Quantity <span class="text-red-500">*</span>
                                </th>
                                <th v-if="stockModalMode === 'create'"
                                    class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in stockFormData.items" :key="index">
                                <td
                                    class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                    {{ index + 1 }}
                                </td>
                                <td class="px-4 py-2">
                                    <SearchSelect v-model="item.raw_material_id"
                                        :options="getAvailableStockMaterials(index)" placeholder="Select a material"
                                        option-value="id" option-label="name"
                                        @change="clearStockItemValidationError(index, 'raw_material_id')"
                                        :class="{ 'border-red-500': getStockItemValidationErrors(index, 'raw_material_id') }" />
                                    <p v-if="getStockItemValidationErrors(index, 'raw_material_id')"
                                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {{ getStockItemValidationErrors(index, 'raw_material_id')[0] }}
                                    </p>
                                </td>
                                <td class="px-4 py-2">
                                    <div class="flex items-center gap-2">
                                        <input v-model="item.qty" type="number" step="0.01" min="0"
                                            placeholder="Enter quantity"
                                            @change="clearStockItemValidationError(index, 'qty')"
                                            class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                                            :class="{ 'border-red-500': getStockItemValidationErrors(index, 'qty') }" />
                                        <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {{ getMaterialUnit(item.raw_material_id) }}
                                        </span>
                                    </div>
                                    <p v-if="getStockItemValidationErrors(index, 'qty')"
                                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {{ getStockItemValidationErrors(index, 'qty')[0] }}
                                    </p>
                                </td>
                                <td v-if="stockModalMode === 'create'" class="px-4 py-2 text-center">
                                    <button type="button" @click="removeStockItem(index)"
                                        :disabled="stockFormData.items.length <= 1"
                                        class="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Remove row">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Add Row Button -->
                <div v-if="stockModalMode === 'create'"
                    class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <button type="button" @click="addStockItem"
                        class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                        <i class="fas fa-plus mr-2"></i> Add Row
                    </button>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-[20px]">
                <div class="mt-[60px] flex justify-end space-x-3">
                    <button type="button" @click="closeStockModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isStockSubmitting" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                        isStockSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="isStockSubmitting">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            {{ stockModalMode === 'create' ? 'Adding...' : 'Updating...' }}
                        </span>
                        <span v-else>{{ stockModalMode === 'create' ? 'Add Stock' : 'Update Stock' }}</span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>

    <!-- Usage Modal -->
    <BaseModal v-if="isUsageModalOpen" :show="isUsageModalOpen" title="Record Usage" maxWidth="7xl"
        @close="closeUsageModal">
        <form @submit.prevent="handleUsageSubmit" class="px-2 py-3 space-y-4 min-h-[35vh]">
            <!-- Warehouse Selection -->
            <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Warehouse <span class="text-xs text-red-500">*</span>
                    </label>
                    <SearchSelect v-model="usageFormData.warehouse_id" :options="warehouses"
                        placeholder="Select a warehouse" option-value="id" option-label="name"
                        @change="onWarehouseSelectForUsage"
                        :class="{ 'border-red-500': getUsageValidationErrors('warehouse_id') }" />
                    <p v-if="getUsageValidationErrors('warehouse_id')"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ getUsageValidationErrors('warehouse_id')[0] }}
                    </p>
                </div>
            </div>

            <!-- Usage Items Table -->
            <div class="border rounded-lg overflow-visible dark:border-gray-700">
                <div class="overflow-visible">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                                    #
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Raw Material <span class="text-red-500">*</span>
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Available Quantity
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Quantity Used <span class="text-red-500">*</span>
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Usage Date <span class="text-red-500">*</span>
                                </th>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Note
                                </th>
                                <th
                                    class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in usageFormData.items" :key="index">
                                <td
                                    class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                    {{ index + 1 }}
                                </td>
                                <td class="px-4 py-2">
                                    <SearchSelect v-model="item.raw_material_id"
                                        :options="getAvailableUsageMaterials(index)"
                                        :disabled="!usageFormData.warehouse_id" placeholder="Select a material"
                                        option-value="id" option-label="name" @change="onMaterialSelectForUsage(index)"
                                        class="min-w-[180px]"
                                        :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'raw_material_id') }" />
                                    <p v-if="getUsageItemValidationErrors(index, 'raw_material_id')"
                                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {{ getUsageItemValidationErrors(index, 'raw_material_id')[0] }}
                                    </p>
                                </td>
                                <td class="px-4 py-2">
                                    <span v-if="item.available_quantity !== null"
                                        class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {{ formatQuantity(item.available_quantity) }}
                                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                            {{ getMaterialUnit(item.raw_material_id) }}
                                        </span>
                                    </span>
                                    <span v-else class="text-sm text-gray-400 dark:text-gray-500">
                                        Select material
                                    </span>
                                </td>
                                <td class="px-4 py-2">
                                    <div class="flex items-center gap-2">
                                        <input v-model="item.qty" type="number" step="0.01" min="0"
                                            placeholder="Enter quantity"
                                            :disabled="!item.raw_material_id || !usageFormData.warehouse_id"
                                            @input="validateUsageQuantity(index)" @blur="validateUsageQuantity(index)"
                                            class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                                            :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'qty') }" />
                                        <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {{ getMaterialUnit(item.raw_material_id) }}
                                        </span>
                                    </div>
                                    <p v-if="getUsageItemValidationErrors(index, 'qty')"
                                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {{ getUsageItemValidationErrors(index, 'qty')[0] }}
                                    </p>
                                </td>
                                <td class="px-4 py-2">
                                    <input v-model="item.usage_date" type="date"
                                        @change="clearUsageItemValidationError(index, 'usage_date')"
                                        class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white"
                                        :class="{ 'border-red-500': getUsageItemValidationErrors(index, 'usage_date') }" />
                                    <p v-if="getUsageItemValidationErrors(index, 'usage_date')"
                                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {{ getUsageItemValidationErrors(index, 'usage_date')[0] }}
                                    </p>
                                </td>
                                <td class="px-4 py-2">
                                    <input v-model="item.note" type="text" placeholder="Optional note"
                                        class="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 dark:bg-gray-700 dark:text-white" />
                                </td>
                                <td class="px-4 py-2 text-center">
                                    <button type="button" @click="removeUsageItem(index)"
                                        :disabled="usageFormData.items.length <= 1"
                                        class="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Remove row">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Add Row Button -->
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <button type="button" @click="addUsageItem" :disabled="!usageFormData.warehouse_id"
                        class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-plus mr-2"></i> Add Row
                    </button>
                </div>
            </div>

            <!-- Global Form Errors -->
            <!-- <div v-if="hasUsageValidationErrors"
                class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Please fix the following errors:</p>
                <ul class="text-xs text-red-500 dark:text-red-400 space-y-1">
                    <li v-for="(errors, field) in allUsageValidationErrors" :key="field">
                        • {{ errors[0] }}
                    </li>
                </ul>
            </div> -->

            <!-- Form Actions -->
            <div class="mt-[20px]">
                <div class="mt-[60px] flex justify-end space-x-3">
                    <button type="button" @click="closeUsageModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isUsageSubmitting" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                        isUsageSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="isUsageSubmitting">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            Recording...
                        </span>
                        <span v-else>Record Usage</span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>

    <!-- View Modal -->
    <BaseModal v-if="viewingInventory" :show="showViewModal" maxWidth="2xl" title="Stock Details"
        @close="closeViewModal">
        <div class="px-6 py-3">
            <div class="text-center mb-6">
                <div v-if="viewingInventory.raw_material?.image_url" class="mb-4">
                    <img :src="viewingInventory.raw_material.image_url" :alt="viewingInventory.raw_material?.name"
                        class="h-24 w-24 rounded-lg mx-auto object-cover">
                </div>
                <div v-else
                    class="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-cube text-gray-400 text-3xl"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ viewingInventory.raw_material?.name ||
                    'N/A' }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ viewingInventory.warehouse?.name || 'N/A' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</label>
                    <p class="text-sm text-gray-900 dark:text-white">
                        {{ formatQuantity(viewingInventory.qty) }}
                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {{ viewingInventory.raw_material?.measurement_unit?.symbol || '' }}
                        </span>
                    </p>
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Warehouse</label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ viewingInventory.warehouse?.name || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material Type</label>
                    <p class="text-sm text-gray-900 dark:text-white">
                        {{ viewingInventory.raw_material?.name || 'N/A' }}
                        ({{ viewingInventory.raw_material?.measurement_unit?.name || 'N/A' }})
                    </p>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                Close
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Stock Record" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Stock Record</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete the stock record for <strong>{{
                        deletingInventory?.raw_material?.name }}</strong>
                    at <strong>{{ deletingInventory?.warehouse?.name }}</strong>? This action cannot be undone.
                </p>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Quantity: <strong>{{ formatQuantity(deletingInventory?.qty) }}</strong>
                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {{ deletingInventory?.raw_material?.measurement_unit?.symbol || '' }}
                        </span>
                    </p>
                </div>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="inventoryStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    inventoryStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="inventoryStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Record</span>
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRawMaterialInventoryStore } from '@/stores/rawMaterialInventoryStore';
import { useRawMaterialStore } from '@/stores/rawMaterialStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useRawMaterialInventoryUsageStore } from '@/stores/rawMaterialInventoryUsageStore';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import SearchSelect from '@/components/common/SearchSelect.vue';
import axiosClient from '@/axiosClient';
import { useToast } from "vue-toastification";
const toast = useToast();

const refresh = ref(false);

// Stock Modal States
const isStockModalOpen = ref(false);
const isStockSubmitting = ref(false);
const stockModalMode = ref('create'); // 'create' | 'update'

// Usage Modal States
const isUsageModalOpen = ref(false);
const isUsageSubmitting = ref(false);

// View and Delete Modal States
const showViewModal = ref(false);
const showDeleteModal = ref(false);

const tableColumns = ref([
    {
        "key": "raw_material.name",
        "label": "Material",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "warehouse.name",
        "label": "Warehouse",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "qty",
        "label": "Quantity",
        "sortable": true,
        "type": "number"
    }
]);

// Initialize stores
const inventoryStore = useRawMaterialInventoryStore();
const rawMaterialStore = useRawMaterialStore();
const warehouseStore = useWarehouseStore();
const usageStore = useRawMaterialInventoryUsageStore();

// Search and filters
const searchQuery = ref('');
const filters = ref({
    warehouse_id: '',
    raw_material_id: ''
});
let searchTimeout = null;

// Stock Form data
const stockFormData = ref({
    warehouse_id: '',
    items: [
        {
            raw_material_id: '',
            qty: ''
        }
    ]
});

// Usage Form data
const usageFormData = ref({
    warehouse_id: '',
    items: [
        {
            raw_material_id: '',
            qty: '',
            usage_date: '',
            note: '',
            available_quantity: null
        }
    ]
});

// Store validation errors
const stockItemErrors = ref({});
const usageItemErrors = ref({});
const usageCheckErrors = ref({});

const currentInventory = ref(null);
const viewingInventory = ref(null);
const deletingInventory = ref(null);

// Helper functions to get available materials (excluding already selected ones)
const getAvailableStockMaterials = (currentItemIndex) => {
    const selectedMaterials = stockFormData.value.items
        .map((item, index) => index !== currentItemIndex ? item.raw_material_id : null)
        .filter(id => id);

    return rawMaterials.value.filter(material => !selectedMaterials.includes(material.id));
};

const getAvailableUsageMaterials = (currentItemIndex) => {
    if (!usageFormData.value.warehouse_id) {
        return [];
    }

    const selectedMaterials = usageFormData.value.items
        .map((item, index) => index !== currentItemIndex ? item.raw_material_id : null)
        .filter(id => id);

    return rawMaterials.value.filter(material => !selectedMaterials.includes(material.id));
};

// Computed properties for Stock validation
const hasStockValidationErrors = computed(() => {
    return Object.keys(inventoryStore.validationErrors).length > 0 ||
        Object.keys(stockItemErrors.value).length > 0;
});

const allStockValidationErrors = computed(() => {
    const errors = {};

    // Add global errors
    Object.assign(errors, inventoryStore.validationErrors);

    // Add item-specific errors
    for (const [key, value] of Object.entries(stockItemErrors.value)) {
        const [index, field] = key.split('.');
        if (!errors[`item_${index}_${field}`]) {
            errors[`item_${index}_${field}`] = value;
        }
    }

    return errors;
});

const getStockValidationErrors = (field) => {
    return inventoryStore.validationErrors[field] || null;
};

const getStockItemValidationErrors = (index, field) => {
    const key = `${index}.${field}`;
    return stockItemErrors.value[key] || null;
};

// Computed properties for Usage validation
const hasUsageValidationErrors = computed(() => {
    return Object.keys(usageStore.validationErrors).length > 0 ||
        Object.keys(usageItemErrors.value).length > 0 ||
        Object.keys(usageCheckErrors.value).length > 0;
});

const allUsageValidationErrors = computed(() => {
    const errors = {};

    // Add global errors
    Object.assign(errors, usageStore.validationErrors);

    // Add item-specific errors
    for (const [key, value] of Object.entries(usageItemErrors.value)) {
        const [index, field] = key.split('.');
        if (!errors[`item_${index}_${field}`]) {
            errors[`item_${index}_${field}`] = value;
        }
    }

    // Add check errors
    for (const [key, value] of Object.entries(usageCheckErrors.value)) {
        const [index, field] = key.split('.');
        if (!errors[`item_${index}_${field}`]) {
            errors[`item_${index}_${field}`] = value;
        }
    }

    return errors;
});

const getUsageValidationErrors = (field) => {
    return usageStore.validationErrors[field] || null;
};

const getUsageItemValidationErrors = (index, field) => {
    const key = `${index}.${field}`;
    // Check required validation errors first
    if (usageItemErrors.value[key]) {
        return usageItemErrors.value[key];
    }
    // Check stock validation errors
    if (usageCheckErrors.value[key]) {
        return usageCheckErrors.value[key];
    }
    return null;
};

const displayedItems = computed(() => {
    return inventoryStore.items || [];
});

const rawMaterials = computed(() => {
    return rawMaterialStore.items || [];
});

const warehouses = computed(() => {
    return warehouseStore.items || [];
});

const getMaterialUnit = (materialId) => {
    if (!materialId) return '';
    const material = rawMaterials.value.find(m => m.id === parseInt(materialId));
    return material?.measurement_unit?.symbol || '';
};

const calculateRowNumber = (index) => {
    if (inventoryStore.pagination?.from && inventoryStore.pagination.from > 0) {
        return inventoryStore.pagination.from + index;
    }
    return (inventoryStore.pagination.current_page - 1) * inventoryStore.pagination.per_page + index + 1;
};

// Stock Validation helpers
const clearStockValidationError = (fieldName) => {
    if (inventoryStore.validationErrors[fieldName]) {
        const updatedErrors = { ...inventoryStore.validationErrors };
        delete updatedErrors[fieldName];
        inventoryStore.validationErrors = updatedErrors;
    }
};

const clearStockItemValidationError = (index, field) => {
    const key = `${index}.${field}`;
    if (stockItemErrors.value[key]) {
        const updatedErrors = { ...stockItemErrors.value };
        delete updatedErrors[key];
        stockItemErrors.value = updatedErrors;
    }
};

// Usage Validation helpers
const clearUsageValidationError = (fieldName) => {
    if (usageStore.validationErrors[fieldName]) {
        const updatedErrors = { ...usageStore.validationErrors };
        delete updatedErrors[fieldName];
        usageStore.validationErrors = updatedErrors;
    }
};

const clearUsageItemValidationError = (index, field) => {
    const key = `${index}.${field}`;
    if (usageItemErrors.value[key]) {
        const updatedErrors = { ...usageItemErrors.value };
        delete updatedErrors[key];
        usageItemErrors.value = updatedErrors;
    }
    if (usageCheckErrors.value[key]) {
        const updatedErrors = { ...usageCheckErrors.value };
        delete updatedErrors[key];
        usageCheckErrors.value = updatedErrors;
    }
};

const clearAllValidationErrors = () => {
    inventoryStore.validationErrors = {};
    usageStore.validationErrors = {};
    stockItemErrors.value = {};
    usageItemErrors.value = {};
    usageCheckErrors.value = {};
};

// Usage - Check available quantity
const checkAvailableQuantity = async (index) => {
    const item = usageFormData.value.items[index];
    if (!item.raw_material_id || !usageFormData.value.warehouse_id) {
        return;
    }

    try {
        const response = await axiosClient.get('raw-material-inventory', {
            params: {
                warehouse_id: usageFormData.value.warehouse_id,
                raw_material_id: item.raw_material_id,
                per_page: 1
            }
        });

        if (response.data?.success && response.data?.data?.data?.length > 0) {
            const inventoryData = response.data.data.data[0];
            item.available_quantity = parseFloat(inventoryData.qty) || 0;

            // Clear any existing check errors
            const key = `${index}.qty`;
            if (usageCheckErrors.value[key]) {
                const updatedErrors = { ...usageCheckErrors.value };
                delete updatedErrors[key];
                usageCheckErrors.value = updatedErrors;
            }

            // Validate quantity if already entered
            if (item.qty) {
                validateUsageQuantity(index);
            }
        } else {
            item.available_quantity = 0;
            // Add error for no inventory found
            const key = `${index}.qty`;
            usageCheckErrors.value[key] = ['No inventory found for this material in the selected warehouse'];
        }
    } catch (error) {
        item.available_quantity = null;
    }
};

// Validate usage quantity
const validateUsageQuantity = (index) => {
    const item = usageFormData.value.items[index];
    const key = `${index}.qty`;

    // Clear previous check error
    if (usageCheckErrors.value[key]) {
        const updatedErrors = { ...usageCheckErrors.value };
        delete updatedErrors[key];
        usageCheckErrors.value = updatedErrors;
    }

    // Clear any previous validation error for this field
    if (usageItemErrors.value[key]) {
        const updatedErrors = { ...usageItemErrors.value };
        delete updatedErrors[key];
        usageItemErrors.value = updatedErrors;
    }

    // Skip validation if no material selected or no warehouse
    if (!item.raw_material_id || !usageFormData.value.warehouse_id) {
        return;
    }

    // Skip if quantity is empty
    if (!item.qty || parseFloat(item.qty) <= 0) {
        return;
    }

    // Check if available quantity is loaded
    if (item.available_quantity === null) {
        // Try to fetch available quantity if not loaded
        checkAvailableQuantity(index);
        return;
    }

    const enteredQty = parseFloat(item.qty);
    const availableQty = parseFloat(item.available_quantity);

    if (enteredQty > availableQty) {
        // Add error to usageCheckErrors
        usageCheckErrors.value[key] = [`Insufficient stock. Available: ${formatQuantity(availableQty)} ${getMaterialUnit(item.raw_material_id)}`];
    }
};

// Usage - Warehouse select handler
const onWarehouseSelectForUsage = () => {
    // Reset all items' available quantity when warehouse changes
    usageFormData.value.items.forEach((item) => {
        item.available_quantity = null;
        // Clear quantity if warehouse changes (since available qty is unknown)
        if (item.raw_material_id) {
            // Reset the raw material selection
            item.raw_material_id = '';
            item.qty = '';
        }
    });
    clearAllValidationErrors();
};

// Usage - Material select handler
const onMaterialSelectForUsage = (index) => {
    const item = usageFormData.value.items[index];
    // Reset quantity and available quantity when material changes
    item.qty = '';
    item.available_quantity = null;

    // Clear errors for this item
    clearUsageItemValidationError(index, 'qty');
    clearUsageItemValidationError(index, 'raw_material_id');

    // Check available quantity
    if (item.raw_material_id && usageFormData.value.warehouse_id) {
        checkAvailableQuantity(index);
    }
};

// Stock Item Management
const addStockItem = () => {
    stockFormData.value.items.push({
        raw_material_id: '',
        qty: ''
    });
};

const removeStockItem = (index) => {
    if (stockFormData.value.items.length > 1) {
        stockFormData.value.items.splice(index, 1);
        // Remove associated errors
        const keys = Object.keys(stockItemErrors.value);
        const itemKeys = keys.filter(key => key.startsWith(`${index}.`));
        itemKeys.forEach(key => {
            const updatedErrors = { ...stockItemErrors.value };
            delete updatedErrors[key];
            stockItemErrors.value = updatedErrors;
        });
    }
};

// Usage Item Management
const addUsageItem = () => {
    const today = new Date().toISOString().split('T')[0];
    usageFormData.value.items.push({
        raw_material_id: '',
        qty: '',
        usage_date: today,
        note: '',
        available_quantity: null
    });
};

const removeUsageItem = (index) => {
    if (usageFormData.value.items.length > 1) {
        usageFormData.value.items.splice(index, 1);
        // Remove associated errors
        const keys = Object.keys(usageItemErrors.value);
        const itemKeys = keys.filter(key => key.startsWith(`${index}.`));
        itemKeys.forEach(key => {
            const updatedErrors = { ...usageItemErrors.value };
            delete updatedErrors[key];
            usageItemErrors.value = updatedErrors;
        });

        const checkKeys = Object.keys(usageCheckErrors.value);
        const checkItemKeys = checkKeys.filter(key => key.startsWith(`${index}.`));
        checkItemKeys.forEach(key => {
            const updatedErrors = { ...usageCheckErrors.value };
            delete updatedErrors[key];
            usageCheckErrors.value = updatedErrors;
        });
    }
};

const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await inventoryStore.search(searchQuery.value);
    }, 500);
};

const applyFilters = async () => {
    await inventoryStore.filter(filters.value);
};

const clearSearch = () => {
    searchQuery.value = '';
    filters.value.warehouse_id = '';
    filters.value.raw_material_id = '';
    inventoryStore.search('');
};

onMounted(async () => {
    await getData();
    await loadRelatedData();
});

const getData = async () => {
    await inventoryStore.get();
};

const refreshData = async () => {
    refresh.value = true;
    try {
        clearSearch();
        await applyFilters();
    } finally {
        refresh.value = false;
    }
};

const loadRelatedData = async () => {
    try {
        await rawMaterialStore.getAll();
        await warehouseStore.getAll();
    } catch (error) {
        console.error('Error loading related data:', error);
    }
};

// Stock Modal functions
const openCreateModal = async () => {
    if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
        await loadRelatedData();
    }
    stockModalMode.value = 'create';
    resetStockForm();
    isStockModalOpen.value = true;
    clearAllValidationErrors();
};

const editInventory = async (inventory) => {
    if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
        await loadRelatedData();
    }
    stockModalMode.value = 'update';
    currentInventory.value = inventory;
    stockFormData.value = {
        warehouse_id: inventory.warehouse?.id || '',
        items: [
            {
                raw_material_id: inventory.raw_material?.id || '',
                qty: inventory.qty || ''
            }
        ]
    };
    isStockModalOpen.value = true;
    clearAllValidationErrors();
};

const closeStockModal = () => {
    isStockModalOpen.value = false;
    resetStockForm();
    clearAllValidationErrors();
};

const resetStockForm = () => {
    stockFormData.value = {
        warehouse_id: '',
        items: [
            {
                raw_material_id: '',
                qty: ''
            }
        ]
    };
    currentInventory.value = null;
    stockItemErrors.value = {};
};

// Usage Modal functions
const openUsageModal = async () => {
    if (rawMaterials.value.length === 0 || warehouses.value.length === 0) {
        await loadRelatedData();
    }
    resetUsageForm();
    isUsageModalOpen.value = true;
    clearAllValidationErrors();
};

const closeUsageModal = () => {
    isUsageModalOpen.value = false;
    resetUsageForm();
    clearAllValidationErrors();
};

const resetUsageForm = () => {
    const today = new Date().toISOString().split('T')[0];
    usageFormData.value = {
        warehouse_id: '',
        items: [
            {
                raw_material_id: '',
                qty: '',
                usage_date: today,
                note: '',
                available_quantity: null
            }
        ]
    };
    usageItemErrors.value = {};
    usageCheckErrors.value = {};
};

// View functions
const viewInventory = (inventory) => {
    viewingInventory.value = inventory;
    showViewModal.value = true;
};

const closeViewModal = () => {
    showViewModal.value = false;
    viewingInventory.value = null;
};

// Delete functions
const confirmDelete = (inventory) => {
    deletingInventory.value = inventory;
    showDeleteModal.value = true;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingInventory.value = null;
};

// Validate stock items
const validateStockItems = () => {
    let isValid = true;
    const errors = {};

    stockFormData.value.items.forEach((item, index) => {
        if (!item.raw_material_id) {
            errors[`${index}.raw_material_id`] = ['Raw material is required'];
            isValid = false;
        }
        if (!item.qty || parseFloat(item.qty) <= 0) {
            errors[`${index}.qty`] = ['Quantity must be greater than 0'];
            isValid = false;
        }
    });

    stockItemErrors.value = errors;
    return isValid;
};

// Validate usage items
const validateUsageItems = () => {
    let isValid = true;
    const errors = {};
    const checkErrors = {};

    usageFormData.value.items.forEach((item, index) => {
        if (!item.raw_material_id) {
            errors[`${index}.raw_material_id`] = ['Raw material is required'];
            isValid = false;
        }
        if (!item.qty || parseFloat(item.qty) <= 0) {
            errors[`${index}.qty`] = ['Quantity must be greater than 0'];
            isValid = false;
        }
        if (!item.usage_date) {
            errors[`${index}.usage_date`] = ['Usage date is required'];
            isValid = false;
        }

        // Check if quantity exceeds available stock
        if (item.raw_material_id && item.qty && item.available_quantity !== null) {
            const enteredQty = parseFloat(item.qty);
            const availableQty = parseFloat(item.available_quantity);
            if (enteredQty > availableQty) {
                checkErrors[`${index}.qty`] = [`Insufficient stock. Available: ${formatQuantity(availableQty)} ${getMaterialUnit(item.raw_material_id)}`];
                isValid = false;
            }
        }
    });

    usageItemErrors.value = errors;
    usageCheckErrors.value = checkErrors;
    return isValid;
};

// CRUD operations
const handleStockSubmit = async () => {
    isStockSubmitting.value = true;
    clearAllValidationErrors();

    try {
        // Validate items
        if (!validateStockItems()) {
            isStockSubmitting.value = false;
            return;
        }

        // Validate warehouse
        if (!stockFormData.value.warehouse_id) {
            inventoryStore.validationErrors = { warehouse_id: ['Warehouse is required'] };
            isStockSubmitting.value = false;
            return;
        }

        let result;

        if (stockModalMode.value === 'create') {
            // Submit all items as an array
            const payload = {
                warehouse_id: stockFormData.value.warehouse_id,
                items: stockFormData.value.items.map(item => ({
                    raw_material_id: parseInt(item.raw_material_id),
                    qty: parseFloat(item.qty)
                }))
            };
            result = await axiosClient.post('raw-material-inventory/bulk-store', payload);
            if (result && result?.data?.success) {
                closeStockModal();
                await getData();
                toast.success('Stock successfully added');
            }
        } else if (stockModalMode.value === 'update') {
            // For update, we only support single item update (first item)
            const payload = new FormData();
            payload.append('raw_material_id', stockFormData.value.items[0].raw_material_id);
            payload.append('warehouse_id', stockFormData.value.warehouse_id);
            payload.append('qty', stockFormData.value.items[0].qty);
            payload.append('_method', 'PUT');
            result = await inventoryStore.update(currentInventory.value.id, payload);
            if (result && result.success) {
                closeStockModal();
                await getData();
            }
        }
    } catch (error) {
        console.error('Error submitting stock form:', error);
        // Handle API validation errors
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.items) {
                errors.items.forEach((itemErrors, index) => {
                    if (itemErrors.raw_material_id) {
                        stockItemErrors.value[`${index}.raw_material_id`] = itemErrors.raw_material_id;
                    }
                    if (itemErrors.qty) {
                        stockItemErrors.value[`${index}.qty`] = itemErrors.qty;
                    }
                });
            } else {
                inventoryStore.validationErrors = errors;
            }
        }
    } finally {
        isStockSubmitting.value = false;
    }
};

const handleUsageSubmit = async () => {
    isUsageSubmitting.value = true;
    clearAllValidationErrors();

    try {
        // Validate items
        if (!validateUsageItems()) {
            isUsageSubmitting.value = false;
            return;
        }

        // Validate warehouse
        if (!usageFormData.value.warehouse_id) {
            usageStore.validationErrors = { warehouse_id: ['Warehouse is required'] };
            isUsageSubmitting.value = false;
            return;
        }

        // Build payload
        const payload = {
            warehouse_id: usageFormData.value.warehouse_id,
            items: usageFormData.value.items.map(item => ({
                raw_material_id: parseInt(item.raw_material_id),
                qty_used: parseFloat(item.qty),
                usage_date: item.usage_date,
                note: item.note || ''
            }))
        };

        const result = await usageStore.create(payload);
        if (result && result?.success) {
            closeUsageModal();
            await getData();
        }
    } catch (error) {
        console.error('Error submitting usage form:', error);
        // Handle API validation errors
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.items) {
                errors.items.forEach((itemErrors, index) => {
                    if (itemErrors.raw_material_id) {
                        usageItemErrors.value[`${index}.raw_material_id`] = itemErrors.raw_material_id;
                    }
                    if (itemErrors.qty_used) {
                        usageItemErrors.value[`${index}.qty`] = itemErrors.qty_used;
                    }
                    if (itemErrors.usage_date) {
                        usageItemErrors.value[`${index}.usage_date`] = itemErrors.usage_date;
                    }
                });
            } else {
                usageStore.validationErrors = errors;
            }
        }
    } finally {
        isUsageSubmitting.value = false;
    }
};

const handleDelete = async () => {
    if (deletingInventory.value) {
        const result = await inventoryStore.deleteItem(deletingInventory.value.id);
        if (result.success) {
            closeDeleteModal();
            await getData();
            toast.success('Stock record deleted successfully');
        }
    }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await inventoryStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await inventoryStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = inventoryStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await inventoryStore.sort(column, order);
};

// Helper functions
const formatQuantity = (qty) => {
    if (qty === null || qty === undefined) return '0';
    return parseFloat(qty).toFixed(2);
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>