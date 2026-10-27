<template>
    <div class="mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Variant
                    Packages</h1>
            </div>
            <Breadcrumb />
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
        <!-- Header with Filters and Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <!-- Left Side: Create Button and Filters -->
            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="openCreateModal" v-permission="['variant_packages.create']"
                    class="btn px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
                    <i class="fas fa-plus"></i>
                    <span>Create New</span>
                </button>

                <!-- Variant Filter -->
                <div class="relative min-w-[200px]">
                    <select v-model="selectedVariantId" @change="filterByVariant"
                        class="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none">
                        <option value="">All Variants</option>
                        <option v-for="variant in allVariants" :key="variant.id" :value="variant.id">
                            {{ variant.product?.name }} - {{ variant.name }}
                        </option>
                    </select>
                    <div
                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Right Side: Search -->
            <div class="flex items-center gap-3 w-full lg:w-auto">
                <!-- Search Input -->
                <div class="relative flex-1 min-w-0 max-w-md">
                    <input v-model="searchQuery" @input="handleSearch" type="search"
                        placeholder="Search by product, variant, or barcode..."
                        class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all focus:shadow-sm" />
                    <div class="absolute left-3 top-2.5 text-gray-400">
                        <i class="fas fa-search text-base"></i>
                    </div>
                </div>

                <!-- Refresh Button Group -->
                <div
                    class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1.5 flex-shrink-0">
                    <button @click="refreshData" title="Refresh Data"
                        class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        :disabled="refresh">
                        <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': refresh }"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
            <div class="overflow-x-auto min-h-[150px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                    <SortableTableHeader :columns="tableColumns" :sort-by="variantPackageStore.sortBy"
                        :sort-direction="variantPackageStore.sortDirection" :show-actions-column="true"
                        :show-sl-column="true" @sort="sortByColumn" />

                    <!-- Loading State -->
                    <TableLoadingState v-if="variantPackageStore.loading" :is-loading="true"
                        :total-items="variantPackageStore.totalItems" :item-name="'variant packages'"
                        loading-text="Loading variant packages..."
                        loading-subtext="Fetching your variant package data" />

                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        <!-- Empty State -->
                        <TableLoadingState v-if="variantPackageStore.items.length === 0" :is-loading="false"
                            :isEmpty="true" :has-search="!!searchQuery" :item-name="'variant packages'"
                            empty-icon="fas fa-boxes" empty-title="No variant packages found"
                            :empty-message="searchQuery ? 'No variant packages match your search criteria.' : 'Get started by creating your first Variant Package.'"
                            :create-button-text="'Add First Package'" @create="openCreateModal"
                            @clear-search="clearSearch" />

                        <!-- Data Rows -->
                        <tr v-else v-for="(data, index) in displayedItems" :key="data.id"
                            class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">

                            <!-- Row Number (SL) -->
                            <td
                                class="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                                {{ calculateRowNumber(index) }}
                            </td>

                            <!-- Product / Variant Info -->
                            <td class="px-6 py-4">
                                <div class="flex items-center space-x-4">
                                    <div>
                                        <div class="text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ data.variant?.product?.name || 'N/A' }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            Variant: {{ data.variant?.name || 'N/A' }}
                                        </div>
                                        <div class="text-xs text-gray-400 dark:text-gray-500">
                                            SKU: {{ data.variant?.sku || 'N/A' }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Package Type & Pieces -->
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ data.package_type?.name || 'N/A' }}
                                        </span>
                                        <span v-if="data.is_default"
                                            class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[10px] font-bold uppercase rounded">
                                            Default
                                        </span>
                                    </div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ data.pieces_per_package || 0 }} pcs per package
                                    </span>
                                </div>
                            </td>

                            <!-- Selling Price -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex flex-col">
                                    <p class="text-xs text-gray-600 dark:text-white">
                                        Regular: {{ Number(data.regular_price || 0).toFixed(2) }}
                                    </p>
                                    <p class="text-xs text-gray-600 dark:text-white">
                                        Dealer: {{ Number(data.dealer_price || 0).toFixed(2) }}
                                    </p>
                                    <p class="text-xs text-gray-600 dark:text-white">
                                        Sub Dealer: {{ Number(data.sub_dealer_price || 0).toFixed(2) }}
                                    </p>
                                </div>
                            </td>

                            <!-- Barcode -->
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-sm font-mono text-gray-900 dark:text-white">
                                        {{ data.barcode || 'N/A' }}
                                    </span>
                                </div>
                            </td>

                            <!-- Status Badge -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="[
                                    data.is_active === true
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                                    'px-2.5 py-1 inline-flex text-[11px] leading-4 font-bold uppercase tracking-wide rounded-md border border-transparent'
                                ]">
                                    <span class="mr-1.5 flex h-1.5 w-1.5 items-center justify-center">
                                        <span :class="[
                                            data.is_active === true ? 'bg-emerald-500' : 'bg-gray-400',
                                            'h-1.5 w-1.5 rounded-full'
                                        ]"></span>
                                    </span>
                                    {{ data.is_active === true ? 'Active' : 'Inactive' }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="px-6 py-4 text-right text-sm font-medium">
                                <div class="flex items-center justify-end space-x-1">
                                    <!-- Print Barcode Button -->
                                    <button @click="generateBarcodeItem(data)"
                                        class="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-900/30 rounded-lg transition-all"
                                        title="Print Barcode">
                                        <i class="fas fa-barcode text-base"></i>
                                    </button>

                                    <!-- View Button -->
                                    <button @click="viewItem(data)" v-permission="['variant_packages.view']"
                                        class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                        title="Quick View">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <!-- Dropdown Container -->
                                    <div class="relative inline-block text-left"
                                        v-click-outside="() => data.showDropdown = false"
                                        v-permission="['variant_packages.update', 'variant_packages.delete']">

                                        <button @click="data.showDropdown = !data.showDropdown"
                                            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none">
                                            <i class="fas fa-ellipsis-h"></i>
                                        </button>

                                        <!-- Dropdown Menu -->
                                        <div v-if="data.showDropdown"
                                            class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none overflow-hidden transform transition-all">

                                            <div class="py-1">
                                                <button @click="editItem(data); data.showDropdown = false"
                                                    v-permission="['variant_packages.update']"
                                                    class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                                                    <i class="fas fa-edit text-amber-500 w-4"></i>
                                                    <span class="font-medium">Edit</span>
                                                </button>
                                            </div>

                                            <div class="py-1">
                                                <button @click="confirmDelete(data); data.showDropdown = false"
                                                    v-permission="['variant_packages.delete']"
                                                    class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                                                    <i class="fas fa-trash-alt w-4"></i>
                                                    <span class="font-medium">Delete</span>
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

        <div v-if="variantPackageStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="variantPackageStore.totalItems > 0" :total-items="variantPackageStore.totalItems"
                :per-page="variantPackageStore.perPage" :current-page="variantPackageStore.currentPage"
                :last-page="variantPackageStore.lastPage" :is-loading="variantPackageStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal v-if="isModalOpen" :show="isModalOpen"
        :title="modalMode === 'create' ? 'Create Variant Package' : 'Edit Variant Package'" maxWidth="2xl"
        @close="closeModal">
        <form @submit.prevent="handleSubmit" class="py-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Variant -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Product Variant <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <select v-model="formData.variant_id" @change="clearValidationError('variant_id')"
                            class="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.variant_id }">
                            <option value="">Select variant</option>
                            <option v-for="variant in allVariants" :key="variant.id" :value="variant.id">
                                {{ variant.product?.name || 'N/A' }} - {{ variant.name }}
                            </option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    <p v-if="variantPackageStore.validationErrors.variant_id"
                        class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        {{ variantPackageStore.validationErrors.variant_id[0] }}
                    </p>
                </div>

                <!-- Package Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Package Type <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <select v-model="formData.package_type_id" @change="clearValidationError('package_type_id')"
                            class="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.package_type_id }">
                            <option value="">Select package type</option>
                            <option v-for="packageType in allPackageTypes" :key="packageType.id"
                                :value="packageType.id">
                                {{ packageType.name }}
                            </option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    <p v-if="variantPackageStore.validationErrors.package_type_id"
                        class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        {{ variantPackageStore.validationErrors.package_type_id[0] }}
                    </p>
                </div>

                <!-- Pieces Per Package -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Pieces Per Package <span class="text-red-500">*</span>
                    </label>
                    <input v-model.number="formData.pieces_per_package" type="number" step="1" min="1"
                        placeholder="Enter number of pieces" @change="clearValidationError('pieces_per_package')"
                        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.pieces_per_package }">
                    <p v-if="variantPackageStore.validationErrors.pieces_per_package"
                        class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        {{ variantPackageStore.validationErrors.pieces_per_package[0] }}
                    </p>
                </div>

                <!-- Image URL (Read-only, shown in view/edit) -->
                <div v-if="modalMode === 'edit' && currentItem && currentItem.image_url">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Current Image
                    </label>
                    <div class="mt-1">
                        <img :src="currentItem.image_url" alt="Package Image"
                            class="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                    </div>
                </div>

                <!-- regular_price -->
                <div>
                    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div class="relative">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regular
                                Price</label>
                            <input v-model.number="formData.regular_price" type="number" step="0.01" :min="0"
                                placeholder="0.00" @change="clearValidationError('regular_price')"
                                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.regular_price }">
                            <p v-if="variantPackageStore.validationErrors.regular_price"
                                class="text-xs text-red-600 dark:text-red-400 mt-1">
                                {{ variantPackageStore.validationErrors.regular_price[0] }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- dealer_price -->
                <div>
                    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div class="relative">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dealer
                                Price</label>
                            <input v-model.number="formData.dealer_price" type="number" step="0.01" :min="0"
                                placeholder="0.00" @change="clearValidationError('dealer_price')"
                                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.dealer_price }">
                            <p v-if="variantPackageStore.validationErrors.dealer_price"
                                class="text-xs text-red-600 dark:text-red-400 mt-1">
                                {{ variantPackageStore.validationErrors.dealer_price[0] }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- sub_dealer_price -->
                <div>
                    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div class="relative">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sub Dealer
                                Price</label>
                            <input v-model.number="formData.sub_dealer_price" type="number" step="0.01" :min="0"
                                placeholder="0.00" @change="clearValidationError('sub_dealer_price')"
                                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                :class="{ 'border-red-500 focus:ring-red-500/20 focus:border-red-500': variantPackageStore.validationErrors.sub_dealer_price }">
                            <p v-if="variantPackageStore.validationErrors.sub_dealer_price"
                                class="text-xs text-red-600 dark:text-red-400 mt-1">
                                {{ variantPackageStore.validationErrors.sub_dealer_price[0] }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <div class="flex items-center space-x-6">
                        <label class="inline-flex items-center cursor-pointer">
                            <input v-model="formData.is_active" type="radio" :value="true"
                                @change="clearValidationError('is_active')"
                                class="h-4 w-4 text-gray-600 focus:ring-green-600 border-green-300 dark:border-green-600 dark:bg-green-700 accent-green-600">
                            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                        </label>
                        <label class="inline-flex items-center cursor-pointer">
                            <input v-model="formData.is_active" type="radio" :value="false"
                                @change="clearValidationError('is_active')"
                                class="h-4 w-4 text-red-600 focus:ring-red-600 border-red-300 dark:border-red-600 dark:bg-red-700 accent-red-600">
                            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                        </label>
                    </div>
                    <p v-if="variantPackageStore.validationErrors.is_active"
                        class="text-xs text-red-600 dark:text-red-400 mt-1">
                        {{ variantPackageStore.validationErrors.is_active[0] }}
                    </p>
                </div>

                <!-- Actions - Full Width -->
                <div class="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Cancel
                    </button>

                    <button type="submit" :disabled="variantPackageStore.loading" :class="[
                        'px-4 py-2 rounded-lg text-sm text-white transition',
                        variantPackageStore.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'
                    ]">
                        <span v-if="variantPackageStore.loading">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            {{ modalMode === 'create' ? 'Creating...' : 'Updating...' }}
                        </span>
                        <span v-else> {{ modalMode === 'create' ? 'Create' : 'Update' }} </span>
                    </button>
                </div>
            </div>
        </form>
    </BaseModal>

    <!-- View Modal -->
    <BaseModal v-if="viewingItem" :show="showViewModal" maxWidth="4xl" title="Variant Package Details"
        @close="closeViewModal">
        <div class="px-6 py-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Left Column -->
                <div class="space-y-4 col-span-2">
                    <div class="flex items-center space-x-4">
                        <div
                            class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            <i class="fas fa-boxes text-gray-500 dark:text-gray-400 text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                                {{ viewingItem.variant?.product?.name || 'N/A' }}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Variant: {{ viewingItem.variant?.name || 'N/A' }}
                            </p>
                            <p class="text-xs text-gray-400 dark:text-gray-500">
                                SKU: {{ viewingItem.variant?.sku || 'N/A' }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package
                                Type</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.package_type?.name ||
                                'N/A' }}</p>
                        </div>
                        <div>
                            <label
                                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pieces
                                Per Package</label>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">{{
                                viewingItem.pieces_per_package || 0 }}</p>
                        </div>
                    </div>

                    <div>
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                        <div class="mt-1 flex items-center space-x-3">
                            <span :class="[
                                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                viewingItem.is_active === true
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            ]">
                                {{ viewingItem.is_active === true ? 'Active' : 'Inactive' }}
                            </span>
                            <span v-if="viewingItem.is_default"
                                class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full">
                                Default
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div v-if="viewingItem.regular_price || viewingItem.dealer_price || viewingItem.sub_dealer_price"
                            class="col-span-2">
                            <label
                                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selling
                                Price</label>
                            <p v-if="viewingItem.regular_price" class="text-xs text-gray-600 dark:text-white">
                                Regular: {{ Number(viewingItem.regular_price || 0).toFixed(2) }}
                            </p>
                            <p v-if="viewingItem.dealer_price" class="text-xs text-gray-600 dark:text-white">
                                Dealer: {{ Number(viewingItem.dealer_price || 0).toFixed(2) }}
                            </p>
                            <p v-if="viewingItem.sub_dealer_price" class="text-xs text-gray-600 dark:text-white">
                                Sub Dealer: {{ Number(viewingItem.sub_dealer_price || 0).toFixed(2) }}
                            </p>
                        </div>
                        <div>
                            <label
                                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Barcode</label>
                            <p class="text-sm font-mono text-gray-900 dark:text-white mt-1">{{ viewingItem.barcode ||
                                'N/A' }}</p>
                        </div>
                    </div>

                    <div>
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Label</label>
                        <p class="text-sm text-gray-900 dark:text-white mt-1">{{ viewingItem.label || 'N/A' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeViewModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                Close
            </button>
            <button v-permission="['variant_packages.update']" @click="editItem(viewingItem)"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                Edit Package
            </button>
        </div>
    </BaseModal>

    <!-- Barcode Generation Modal -->
    <BaseModal :show="generateBarcodeModal" maxWidth="5xl" title="Generate Barcode" @close="closeGenerateBarcodeModal">
        <div class="px-6 py-3">
            <div class="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-4">
                <div
                    class="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">

                    <!-- Left Column: Hero Product Presentation -->
                    <div
                        class="lg:col-span-1 flex flex-col items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">

                        <div
                            class="flex-shrink-0 h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <img v-if="viewBarcodeItem?.image_url" :src="viewBarcodeItem?.image_url || '/logo/default-product.png'"
                                class="h-full w-full object-cover rounded-sm"
                                :alt="viewBarcodeItem?.variant?.product?.name">
                            <i v-else class="fas fa-box text-4xl text-gray-400 dark:text-gray-500"></i>
                        </div>

                        <!-- Title & Primary Identifiers -->
                        <h2
                            class="text-md font-bold text-gray-900 dark:text-white mt-4 tracking-tight line-clamp-2 max-w-xs">
                            {{ viewBarcodeItem?.variant?.product?.name || 'N/A' }}
                        </h2> 
                        <!-- Badges / Micro-details -->
                        <div class="flex flex-col gap-1.5 mt-3 w-full">
                            <div
                                class="flex items-center justify-between px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                <span class="font-medium text-gray-400 dark:text-gray-500">BARCODE</span>
                                <span class="font-mono font-semibold text-gray-700 dark:text-gray-300">{{
                                    viewBarcodeItem?.barcode || 'N/A' }}</span>
                            </div>
                             
                        </div>
                    </div>

                    <!-- Right Column: Structured Specifications Grid -->
                    <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">

                        <!-- Variant Field -->
                        <div
                            class="p-3 bg-gray-50/30 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <span
                                class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-0.5">Variant</span>
                            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {{ viewBarcodeItem?.variant?.name || '—' }}  
                                 {{ viewBarcodeItem?.label || 0 }}
                            </span>
                        </div>
 
                        <!-- Status Field -->
                        <div
                            class="p-3 bg-gray-50/30 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <span
                                class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">Status</span>
                            <span :class="[
                                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                                viewBarcodeItem?.is_active === true
                                    ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50'
                                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50'
                            ]">
                                {{ viewBarcodeItem?.is_active === true ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
 
                    </div>

                </div>

                <div
                    class="mb-6 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm rounded-xl">

                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Batch Barcode Generation
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Specify how many unique barcodes you want to create and print simultaneously (Max: 500).
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        <div class="relative flex-1 sm:flex-none">
                            <div
                                class="flex items-stretch rounded-xl shadow-sm shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">

                                <input v-model.number="barcodeQuantity" type="number" min="1" max="500"
                                    :disabled="generating"
                                    class="w-full sm:w-60 pl-4 pr-2 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-l-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                                    @input="validateQuantity" />

                                <button @click="generateQuantityBarcodes" :disabled="generating"
                                    class="flex-1 sm:flex-none px-5 py-2.5 -ml-px bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-800/50 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-sm rounded-r-xl flex items-center justify-center gap-2 transition-all duration-200 group">
                                    <i v-if="generating" class="fas fa-spinner fa-spin"></i>
                                    <i v-else
                                        class="fas fa-sync-alt transition-transform group-hover:rotate-180 duration-500"></i>

                                    <span>
                                        {{ generating ? 'Generating...' : `Generate ${barcodeQuantity || 1}
                                        Barcode${barcodeQuantity > 1 ? 's' : ''}` }}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial">
                            <button @click="printAllBarcodes" :disabled="!barcodeList.length"
                                class="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 transition-all duration-200">
                                <i class="fas fa-print"></i>
                                <span>Print All ({{ barcodeList.length }})</span>
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Barcodes Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" id="barcode-container">
                    <div v-for="(barcode, index) in barcodeList" :key="index"
                        class="border dark:border-gray-600 rounded-lg p-2 text-center hover:shadow-lg transition-shadow">
                        <div class="barcode-item mb-2 flex justify-center">
                            <svg :id="`barcode-svg-${index}`" class="w-full"></svg>
                        </div>
                        <div
                            class="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 mx-2 px-3 py-1 rounded break-all">
                            {{ barcode.value }}
                        </div>
                    </div>
                </div>

                <!-- No barcodes message -->
                <div v-if="barcodeList.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-barcode text-4xl mb-2"></i>
                    <p>Click "Generate" to create barcodes</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="px-6 py-3 border-t mt-3 border-gray-200 dark:border-gray-700 flex justify-end">
                <button type="button" @click="closeGenerateBarcodeModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500">
                    Close
                </button>
            </div>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete Variant Package" maxWidth="lg" :showClose="false"
        @close="closeDeleteModal">
        <div class="px-6 py-3">
            <div class="text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Variant Package</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this variant package? This action cannot be undone.
                </p>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
                    <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                            deletingItem?.variant?.product?.name }}</span>
                    </div>
                    <div class="flex items-center space-x-3 mt-1">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Variant:</span>
                        <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.variant?.name }}</span>
                    </div>
                    <div class="flex items-center space-x-3 mt-1">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Package Type:</span>
                        <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.package_type?.name || 'N/A'
                            }}</span>
                    </div>
                </div>
            </div>
            <div class="flex justify-center space-x-3">
                <button @click="closeDeleteModal"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                </button>
                <button @click="handleDelete" :disabled="variantPackageStore.loading" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    variantPackageStore.loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                ]">
                    <span v-if="variantPackageStore.loading">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Deleting...
                    </span>
                    <span v-else>Delete Package</span>
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useVariantPackageStore } from '@/stores/variantPackageStore.js';
import { useProductVariantStore } from '@/stores/productVariantStore.js';
import { usePackageTypeStore } from '@/stores/packageTypeStore.js';
import BaseModal from '@/components/common/BaseModal.vue';
import Pagination from '@/components/common/Pagination.vue';
import Breadcrumb from '@/components/core/Breadcrumb.vue';
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import SortableTableHeader from '@/components/common/SortableTableHeader.vue';
import JsBarcode from 'jsbarcode';
import { useToast } from 'vue-toastification';

const toast = useToast();
const refresh = ref(false);

const tableColumns = ref([
    {
        "key": "variant.product.name",
        "label": "Product / Variant",
        "sortable": false,
        "type": "string"
    },
    {
        "key": "package_type.name",
        "label": "Package Type",
        "sortable": false,
        "type": "string"
    },
    {
        "key": "selling_price",
        "label": "Selling Price",
        "sortable": true,
        "type": "number"
    },
    {
        "key": "barcode",
        "label": "Barcode",
        "sortable": true,
        "type": "string"
    },
    {
        "key": "is_active",
        "label": "Status",
        "sortable": true,
        "type": "boolean",
        "width": "100px"
    }
]);

// Initialize stores
const variantPackageStore = useVariantPackageStore();
const productVariantStore = useProductVariantStore();
const packageTypeStore = usePackageTypeStore();

// Modal states
const isModalOpen = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const generateBarcodeModal = ref(false);

// Barcode generation states
const barcodeQuantity = ref(1);
const barcodeList = ref([]);
const generating = ref(false);
const viewBarcodeItem = ref(null);

// Search query with debounce
const searchQuery = ref('');
const selectedVariantId = ref('');
let searchTimeout = null;

// Form data matching API structure
const formData = ref({
    variant_id: '',
    package_type_id: '',
    pieces_per_package: null,
    regular_price: null,
    dealer_price: null,
    sub_dealer_price: null,
    barcode: '',
    image_path: null,
    is_default: false,
    is_active: true
});

const currentItem = ref(null);
const viewingItem = ref(null);
const deletingItem = ref(null);
const modalMode = ref('create');

const previewImage = ref(null);

const displayedItems = computed(() => {
    return variantPackageStore.items || [];
});

const allVariants = computed(() => {
    return productVariantStore.items || [];
});

const allPackageTypes = computed(() => {
    return packageTypeStore.items || [];
});

const calculateRowNumber = (index) => {
    if (variantPackageStore.pagination?.from && variantPackageStore.pagination.from > 0) {
        return variantPackageStore.pagination.from + index;
    }
    return (variantPackageStore.pagination.current_page - 1) * variantPackageStore.pagination.per_page + index + 1;
};

const clearValidationError = (fieldName) => {
    if (variantPackageStore.validationErrors && variantPackageStore.validationErrors[fieldName]) {
        const updatedErrors = { ...variantPackageStore.validationErrors };
        delete updatedErrors[fieldName];
        variantPackageStore.validationErrors = updatedErrors;
    }
};

const clearAllValidationErrors = () => {
    variantPackageStore.validationErrors = {};
};

// Search with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        await variantPackageStore.search(searchQuery.value);
    }, 500);
};

const filterByVariant = async () => {
    await variantPackageStore.get({ variant_id: selectedVariantId.value });
};

const clearSearch = () => {
    searchQuery.value = '';
    selectedVariantId.value = '';
    getData();
};

onMounted(async () => {
    await Promise.all([
        getData(),
        productVariantStore.get({ per_page: 100 }),
        packageTypeStore.get({ per_page: 100 })
    ]);
});

const getData = async () => {
    await variantPackageStore.get({ search: '' });
};

const refreshData = async () => {
    refresh.value = true;
    try {
        clearSearch();
    } finally {
        refresh.value = false;
    }
}

// Modal functions
const openCreateModal = () => {
    resetForm();
    modalMode.value = 'create';
    isModalOpen.value = true;
    clearAllValidationErrors();
};

// Edit item function
const editItem = (item) => {
    currentItem.value = item;
    modalMode.value = 'edit';

    // Set form data matching API structure
    formData.value = {
        variant_id: item.variant_id || '',
        package_type_id: item.package_type_id || '',
        pieces_per_package: item.pieces_per_package || null,
        regular_price: item.regular_price || null,
        dealer_price: item.dealer_price || null,
        sub_dealer_price: item.sub_dealer_price || null,
        barcode: item.barcode || '',
        is_default: item.is_default === true || item.is_default === 1,
        is_active: item.is_active === true || item.is_active === 1,
        image_path: item.image_path || null
    };

    isModalOpen.value = true;

    previewImage.value = item.image_path || null;
    clearAllValidationErrors();
};

const viewItem = (item) => {
    viewingItem.value = item;
    showViewModal.value = true;
};

const confirmDelete = (item) => {
    deletingItem.value = item;
    showDeleteModal.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    clearAllValidationErrors();
};

const closeViewModal = () => {
    showViewModal.value = false;
    viewingItem.value = null;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    deletingItem.value = null;
};

const resetForm = () => {
    formData.value = {
        variant_id: '',
        package_type_id: '',
        pieces_per_package: null,
        regular_price: null,
        dealer_price: null,
        sub_dealer_price: null,
        barcode: '',
        image_path: null,
        is_default: false,
        is_active: true
    };
    currentItem.value = null;
    previewImage.value = null;
};

// CRUD operations
const handleSubmit = async () => {
    clearAllValidationErrors();

    const formDataToSend = new FormData();

    Object.keys(formData.value).forEach((key) => {
        let value = formData.value[key];

        // Convert booleans to 1/0 for FormData
        if (typeof value === 'boolean') {
            value = value ? 1 : 0;
        }

        // Skip null image_path for updates
        if (key === 'image_path' && (value === null || value === '')) {
            return;
        }

        if (value !== null && value !== undefined && value !== '') {
            formDataToSend.append(key, value);
        }
    });

    let result;
    if (modalMode.value === 'create') {
        result = await variantPackageStore.create(formDataToSend);
    } else {
        formDataToSend.append('_method', 'PUT');
        result = await variantPackageStore.update(currentItem.value.id, formDataToSend);
    }

    if (result && result.success) {
        closeModal();
        getData();
    }
};

const handleDelete = async () => {
    if (deletingItem.value) {
        const result = await variantPackageStore.deleteItem(deletingItem.value.id);
        if (result.success) {
            closeDeleteModal();
            getData();
        }
    }
};

// Pagination and sorting
const handlePerPageChange = async (newPerPage) => {
    await variantPackageStore.changePerPage(newPerPage);
};

const handlePageChange = async (page) => {
    await variantPackageStore.paginate(page);
};

const sortByColumn = async (column) => {
    const order = variantPackageStore.sortDirection === 'asc' ? 'desc' : 'asc';
    await variantPackageStore.sort(column.key, order);
};

// Image upload
const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    formData.value.image_path = file;
    previewImage.value = URL.createObjectURL(file);
};

const removeImage = () => {
    formData.value.image_path = null;
    previewImage.value = null;
};

const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    return parseFloat(price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
};

// Barcode generation functions
const generateBarcodeItem = (item) => {
    viewBarcodeItem.value = item;
    barcodeQuantity.value = 1;
    barcodeList.value = [];
    generateBarcodeModal.value = true;
};

const closeGenerateBarcodeModal = () => {
    generateBarcodeModal.value = false;
    viewBarcodeItem.value = null;
    barcodeList.value = [];
    barcodeQuantity.value = 1;
};

watch(() => generateBarcodeModal.value, () => {
    if (generateBarcodeModal.value) {
        generateQuantityBarcodes();
    }
});

// watch barcode input value change
watch(() => barcodeQuantity.value, () => {
    if (generating.value) {
        return;
    }
    if (barcodeQuantity.value < 1) {
        toast.info('Please enter a valid quantity');
        return;
    }
    if (barcodeQuantity.value > 500) {
        toast.info('Please enter a valid quantity max 500');
        return;
    }
    setTimeout(() => {
        generateQuantityBarcodes();
    }, 4000);
});

const validateQuantity = () => {
    if (barcodeQuantity.value < 1) {
        barcodeQuantity.value = 1;
    }
    if (barcodeQuantity.value > 500) {
        barcodeQuantity.value = 500;
    }
};

const generateQuantityBarcodes = async () => {
    generating.value = true;
    if (!viewBarcodeItem.value || !viewBarcodeItem.value.barcode) {
        console.error('No barcode data available');
        toast.error('No barcode data available for this item, please edit the item and set a valid barcode.');
        generating.value = false;
        return;
    }

    const quantity = barcodeQuantity.value;
    const baseBarcode = viewBarcodeItem.value.barcode;

    // Generate barcode list
    barcodeList.value = [];
    for (let i = 0; i < quantity; i++) {
        barcodeList.value.push({
            id: i,
            value: baseBarcode
        });
    }

    // Generate barcodes after DOM update
    await nextTick();
    for (let i = 0; i < barcodeList.value.length; i++) {
        await generateSingleBarcode(i, barcodeList.value[i].value);
    }
    setTimeout(() => {
        generating.value = false;
    }, 1000);
};

const generateSingleBarcode = async (index, barcodeValue) => {
    try {
        const svgElement = document.getElementById(`barcode-svg-${index}`);
        if (svgElement) {
            svgElement.innerHTML = '';

            JsBarcode(`#barcode-svg-${index}`, String(barcodeValue), {
                format: 'CODE128',
                width: 2,
                height: 100,
                displayValue: false,
                fontSize: 16,
                fontOptions: 'bold',
                margin: 10,
                lineColor: '#000000',
                background: '#ffffff'
            });
        }
    } catch (error) {
        console.error('Error generating barcode:', error);
    }
};

// Helper function to convert SVG to canvas/image with high DPI support
const svgToCanvas = async (svgElement, dpi = 300) => {
    return new Promise((resolve) => {
        const clonedSvg = svgElement.cloneNode(true);

        const svgRect = svgElement.getBoundingClientRect();
        const svgWidth = svgRect.width || svgElement.getAttribute('width') || 300;
        const svgHeight = svgRect.height || svgElement.getAttribute('height') || 150;

        const scale = (dpi / 96);

        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;

        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);

        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const img = new Image();

        img.onload = () => {
            try {
                ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                resolve(canvas);
            } catch (error) {
                console.error('Error drawing SVG to canvas:', error);
                resolve(canvas);
            }
        };

        img.onerror = () => {
            console.error('Error loading SVG image');
            resolve(canvas);
        };

        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.src = url;
    });
};

const printAllBarcodes = async () => {
    if (barcodeList.value.length === 0) {
        alert('Please generate barcodes first before printing.');
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await nextTick();

    const printWindow = window.open('', '_blank');

    let barcodesHtml = '';

    for (let idx = 0; idx < barcodeList.value.length; idx++) {
        const barcode = barcodeList.value[idx];
        const svgElement = document.getElementById(`barcode-svg-${idx}`);

        barcodesHtml += `
      <div class="barcode-page">
        <div class="barcode-container">
    `;

        if (svgElement) {
            try {
                const canvas = await svgToCanvas(svgElement, 300);
                const img = canvas.toDataURL('image/png', 1.0);

                barcodesHtml += `
          <div class="barcode-image">
            <img src="${img}" />
          </div>

          <div class="barcode-info">
            <div class="text-value">${viewBarcodeItem.value?.variant?.product?.name || ''}</div>
            <div class="text-value">${viewBarcodeItem.value?.variant?.name || ''}</div>
            <div class="text-value">${viewBarcodeItem.value?.package_type?.name || ''} (${viewBarcodeItem.value?.pieces_per_package || 0} pcs)</div>
          </div>
        `;
            } catch (err) {
                console.error('Barcode convert error:', err);
            }
        }

        barcodesHtml += `
        </div>
      </div>
    `;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Barcode Print</title>

        <style>
          @page {
            size: 75mm 50mm;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 75mm;
            height: 50mm;
            background: #fff;
            font-family: 'Courier New', monospace;
          }

          .barcode-page {
            width: 100%;
            height: 50mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-after: always;
            break-after: page;
            box-sizing: border-box;
            overflow: hidden;
          }

          .barcode-container {
            width: 100%;
            text-align: center;
          }

          .barcode-image {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2mm;
          }

          .barcode-image img {
            width: 99%;
            height: auto;
            max-height: 28mm;
            image-rendering: pixelated;
          }

          .barcode-info {
            width: 100%;
            text-align: center;
          }

          .text-value {
            width: 100%;
            font-size: 10px;
            font-weight: bold;
            line-height: 1.1;
            margin: 1px 0;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          @media print {
            body { width: 92%; margin: 0 auto; padding: 0; align-items: center; justify-content: center; }
          }
        </style>
      </head>

      <body>
        ${barcodesHtml}

        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = function () {
              window.close();
            };
          };
        <\/script>
      </body>
    </html>
  `);

    printWindow.document.close();
};
</script>

<style scoped>
input,
select,
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}
</style>