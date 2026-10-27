<template>
    <div class="px-0 py-0">
        <!-- Page Header -->
        <div class="mb-6">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Inventory & Sales Dashboard</h1>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time overview of products, sales,
                        warehouses and stock management</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button @click="loadDashboardData" :disabled="isLoading"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                        <component :is="isLoading ? Loader2 : RefreshCw"
                            :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
                        {{ isLoading ? 'Loading...' : 'Refresh' }}
                    </button>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        Updated: {{ formatDisplayDate(new Date()) }}
                    </span>
                </div>
            </div>
        </div>
        <!-- Stock and sales limit alert -->
        <div v-if="dashboardMetrics.completedSales >= 1000" class="mb-6">
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p class="font-bold">Sales Data Limit Alert</p>
                <p>Dashboard has reached the limit for completed sales max data 1000, please take necessary actions or contact the administrator
                    .</p>
            </div>
        </div>
        <!-- dashboardMetrics.totalProducts -->
        <div v-if="dashboardMetrics.totalProducts >=200" class="mb-6">
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p class="font-bold">Product Data Limit Alert</p>
                <p>Dashboard has reached the limit for total products max data 200,
                    please take necessary actions or contact the administrator
                    .</p>
            </div>
        </div>
        <!-- dashboardMetrics.totalProducts -->
        <div v-if="warehouseStocks.length > 5000" class="mb-6">
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p class="font-bold">Warehouse Stock Data Limit Alert</p>
                <p>Dashboard has reached the limit for warehouse stock max data 5000,
                    please take necessary actions or contact the administrator
                    .</p>
            </div>
        </div>
 
        <!-- Main Content -->
        <div class="space-y-6">
            <!-- Key Metrics Widgets -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                <!-- Total Products Widget -->
                <DashboardCard title="Total Products" :value="dashboardMetrics.totalProducts" :icon="Package"
                    color="blue" :loading="isLoading" />
                <!-- Total Warehouse Stock (PCS) Widget -->
                <!-- <DashboardCard title="Warehouse Stock" :value="dashboardMetrics.totalWarehouseStockPcs" :icon="Boxes"
                    color="indigo" :loading="isLoading" /> -->
                <!-- Total Variants Widget -->
                <DashboardCard title="Product Variants" :value="dashboardMetrics.totalVariants" :icon="Tags"
                    color="cyan" :loading="isLoading" />
                <!-- Total Sales Widget -->
                <DashboardCard title="Total Sales" :value="formatPrice(dashboardMetrics.totalSalesAmount)"
                    :icon="ShoppingCart" color="green" :loading="isLoading" />
                <!-- Active Warehouses Widget -->
                <DashboardCard title="Warehouses" :value="dashboardMetrics.totalWarehouses" :icon="Warehouse"
                    color="purple" :loading="isLoading" />
                <!-- Active Customers Widget -->
                <DashboardCard title="Active Customers" :value="dashboardMetrics.totalDealers" :icon="Handshake"
                    color="orange" :loading="isLoading" />
            </div>

            <!-- Products & Sales Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <!-- Latest Products -->
                <div class="lg:col-span-2 xl:col-span-3">
                    <DataCard title="Latest Products" subtitle="Recently added products">
                        <div class="overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                            <div class="bg-white dark:bg-gray-800 md:p-3 rounded-lg dark:border dark:border-gray-700">
                                <!-- Header with Filters and Search -->
                                <div
                                    class="flex flex-row lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                                    <div class="flex gap-4 w-full md:w-1/2 lg:w-1/3">
                                        <!-- Top Controls: Expand All / Collapse All Toggle -->
                                        <div class="flex justify-end gap-4"
                                            v-if="displayedProducts && displayedProducts.length > 0">
                                            <button @click="toggleAllProducts"
                                                class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium flex items-center gap-2 transition">
                                                <i
                                                    :class="['fas text-xs', areAllExpanded ? 'fa-compress-alt' : 'fa-expand-alt']"></i>
                                                <span>{{ areAllExpanded ? 'Collapse All' : 'Expand All' }}</span>
                                            </button>
                                            <!-- view All -->
                                        </div>
                                    </div>
                                    <router-link to="/products" 
                                        class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium flex items-center gap-2 transition">
                                        <span>View All</span>
                                        <i class="fas fa-arrow-right text-xs animate-pulse duration-200"></i>
                                    </router-link>

                                    <!-- <div class="flex flex-col lg:flex-row justify-end items-end gap-4">
                                        <div class="sm:col-span-1 flex items-end gap-2 w-full">
                                            <div class="relative min-w-[180px] max-w-[250px]">
                                                <select v-model="filter.variant_id" @change="applyFilter"
                                                    class="w-full pl-4 pr-10 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none">
                                                    <option value="">All Variants</option>
                                                    <option v-for="variant in allVariants"
                                                        :key="'variant-filter-' + variant.id" :value="variant.id">
                                                        {{ variant.label }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="relative flex-grow">
                                                <input v-model="searchQuery" @input="handleSearch" type="search"
                                                    placeholder="Search by product name or SKU..."
                                                    class="w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all" />
                                                <div class="absolute left-3 top-2 text-gray-400">
                                                    <i class="fas fa-search text-base"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->
                                </div>

                                <!-- Product Cards Grid -->
                                <div class="space-y-6" v-if="displayedProducts && displayedProducts.length > 0">
                                    <div v-for="product in displayedProducts" :key="'product-' + product.id"
                                        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible shadow-sm hover:shadow-md transition-shadow">

                                        <!-- Product Header -->
                                        <div
                                            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <div class="flex items-center space-x-4">
                                                <div
                                                    class="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                                    <img v-if="product.image_url && product.image_url !== 'http://127.0.0.1:8000/logo/default.png'"
                                                        :src="product.image_url" :alt="product.name"
                                                        class="h-12 w-12 rounded-lg object-cover" />
                                                    <i v-else
                                                        class="fas fa-box text-gray-400 dark:text-gray-500 text-2xl"></i>
                                                </div>
                                                <div>
                                                    <h2 class="text-sm font-semibold text-gray-700 dark:text-white">{{
                                                        product.name }}</h2>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                                        Category: {{ product.category?.name || 'Uncategorized' }}
                                                    </p>
                                                    <p class="text-xs text-gray-400 dark:text-gray-500">
                                                        SKU: {{ product.sku }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-3">
                                                <span :class="[
                                                    product.is_active === 1 || product.is_active === true
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                                                    'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                                                ]">
                                                    {{ product.is_active === 1 || product.is_active === true ? 'Active'
                                                        : 'Inactive' }}
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Variants Section Header (Accordion Toggle Button) -->
                                        <div class="px-4 py-3 flex items-center justify-between cursor-pointer border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                            @click="toggleProductExpansion(product)">
                                            <div class="flex items-center space-x-2">
                                                <i
                                                    :class="['fas text-xs text-gray-500 transition-transform duration-200', product.isExpanded ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
                                                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Variants ({{ product?.variants?.length || 0 }}), Packages ({{
                                                        totalPackages(product?.variants) }})
                                                </h3>
                                            </div>
                                        </div>

                                        <!-- Collapsible Variants Body (Default Hidden) -->
                                        <div v-show="product.isExpanded"
                                            class="px-4 pb-4 transition-all duration-300 border-t border-gray-100 dark:border-gray-700/50">
                                            <div v-if="!product?.variants || product.variants.length === 0"
                                                class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg mt-3">
                                                <i class="fas fa-cube text-2xl mb-2 block"></i>
                                                No variants added yet. Click "Add Variant" to create one.
                                            </div>

                                            <!-- Variant Cards -->
                                            <div v-else class="space-y-3 mt-3">
                                                <div v-for="variant in product.variants" :key="'variant-' + variant.id"
                                                    class="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">

                                                    <!-- Variant Header -->
                                                    <div
                                                        class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                                        <div class="flex items-center space-x-3 flex-1 flex-wrap">
                                                            <i class="fas fa-cube text-gray-400 dark:text-gray-500"></i>
                                                            <span
                                                                class="text-sm font-medium text-gray-900 dark:text-white">
                                                                {{ variant.name }}
                                                            </span>
                                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                                SKU: {{ variant.sku || 'N/A' }}
                                                            </span>
                                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                                Qty: {{ variant.quantity || 0 }} {{
                                                                    variant.measurement_unit?.symbol || '' }}
                                                            </span>
                                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                                Unit: {{ variant.measurement_unit_name || 'N/A' }}
                                                            </span>
                                                            <span :class="[
                                                                variant.is_active === true
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                                                                'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full'
                                                            ]">
                                                                {{ variant.is_active === true ? 'Active' : 'Inactive' }}
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center space-x-2">
                                                            <div class="relative inline-block text-left"
                                                                v-click-outside="() => { if (variant) variant.showDropdown = false; }">
                                                                <button
                                                                    @click.stop="variant.showDropdown = !variant.showDropdown"
                                                                    class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                                                    <i
                                                                        class="fas fa-ellipsis-v text-gray-500 dark:text-gray-400 text-xs"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- Packages Section -->
                                                    <div class="p-3">
                                                        <div class="flex items-center justify-between mb-2">
                                                            <h4
                                                                class="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                Packages ({{ variant?.packages?.length || 0 }})
                                                            </h4>
                                                        </div>

                                                        <div v-if="!variant?.packages || variant.packages.length === 0"
                                                            class="text-center py-2 text-gray-400 dark:text-gray-500 text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded">
                                                            No packages added yet.
                                                        </div>

                                                        <div v-else
                                                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                                            <div v-for="pkg in variant.packages"
                                                                :key="'package-' + pkg.id"
                                                                class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 p-2 hover:shadow-sm transition-shadow">
                                                                <div class="flex items-start justify-between">
                                                                    <div class="flex-1">
                                                                        <div class="flex items-center flex-wrap">
                                                                            <span
                                                                                class="text-xs font-medium text-gray-900 dark:text-white">
                                                                                {{ pkg.package_type_name || 'N/A' }}
                                                                            </span>
                                                                            <span v-if="pkg.is_default"
                                                                                class="ml-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[8px] font-bold uppercase rounded">
                                                                                Default
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            {{ pkg.pieces_per_package || 0 }} pcs/pkg
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            Barcode: {{ pkg.barcode || 'N/A' }}
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            Regular: {{ formatPrice(pkg.regular_price)
                                                                            }}
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            Dealer: {{ formatPrice(pkg.dealer_price) }}
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            Sub dealer: {{
                                                                                formatPrice(pkg.sub_dealer_price) }}
                                                                        </div>
                                                                        <div
                                                                            class="text-xs text-gray-500 dark:text-gray-400">
                                                                            Status:
                                                                            <span :class="[
                                                                                pkg.is_active === 1 || pkg.is_active === true
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                                                                                'px-3 py-0 inline-flex text-[10px] leading-2 font-semibold rounded-full'
                                                                            ]">
                                                                                {{ pkg.is_active === 1 || pkg.is_active
                                                                                    === true ? 'Active' : 'Inactive' }}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Empty State -->
                                    <div v-if="displayedProducts.length === 0" class="text-center py-12">
                                        <i
                                            class="fas fa-boxes text-6xl text-gray-300 dark:text-gray-600 mb-4 block"></i>
                                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Products
                                            Found</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            {{ searchQuery ? 'No products match your search criteria.' :
                                                'Get started by creating your first product.' }}
                                        </p>
                                        <button @click="clearSearch"
                                            class="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                                            <i class="fas fa-times mr-2"></i> Clear Search
                                        </button>
                                    </div>
                                </div>

                                <!-- Loading State -->
                                <div v-else-if="productStore.isLoading" class="text-center py-12">
                                    <i
                                        class="fas fa-spinner fa-spin text-4xl text-gray-400 dark:text-gray-500 mb-4 block"></i>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
                                </div>

                                <!-- Empty State when no products -->
                                <div v-else class="text-center py-12">
                                    <i class="fas fa-boxes text-6xl text-gray-300 dark:text-gray-600 mb-4 block"></i>
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Products Found
                                    </h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Get started by creating your
                                        first product.</p>
                                </div>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <!-- Sales Summary Card + Warehouse Stock Pie Chart -->
                <div class="space-y-4 flex flex-col justify-between h-full">
                    <!-- Sales Summary Card -->
                    <DataCard title="Sales Summary" subtitle="Sales by product">
                        <div class="space-y-4 py-2">
                            <SummaryItem label="Total Sales" :value="dashboardMetrics.completedSales"
                                :loading="isLoading" />
                            <SummaryItem label="Total Revenue" :value="formatPrice(dashboardMetrics.totalSalesAmount)"
                                valueClass="text-green-600" :loading="isLoading" />
                            <SummaryItem label="Average Sale" :value="formatPrice(dashboardMetrics.avgSaleValue)"
                                :loading="isLoading" />
                        </div>
                    </DataCard>

                    <!-- Warehouse Stock Pie Chart -->
                    <DataCard title="Warehouse Stock Distribution" subtitle="Stock by warehouse (PCS)">
                        <div class="h-64 py-0 px-0">
                            <canvas ref="warehouseStockPieChart"></canvas>
                        </div>
                    </DataCard>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Product-wise Sales Growth Chart -->
                <DataCard title="Product-wise Sales Growth" subtitle="Sales by product">
                    <div class="h-80">
                        <canvas ref="productSalesChart"></canvas>
                    </div>
                </DataCard>

                <!-- Warehouse-wise Sales Chart -->
                <DataCard title="Warehouse-wise Sales" subtitle="Sales by warehouse">
                    <div class="h-80">
                        <canvas ref="warehouseSalesChart"></canvas>
                    </div>
                </DataCard>
            </div>

            <!-- Full Width Product-Variant-wise Sales -->
            <DataCard title="Detailed Product-Variant Sales" subtitle="Comprehensive sales breakdown for all variants">
                <div class="h-[400px] w-full overflow-x-auto">
                    <div :style="{ minWidth: latestSales.length > 5 ? '100%' : '100%' }" class="h-full">
                        <canvas ref="productVariantSalesChart"></canvas>
                    </div>
                </div>
            </DataCard>

            <!-- Latest Sales & Warehouse Stock -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Latest Sales Invoices -->
                <DataCard title="Latest Sales" subtitle="Recent sales transactions">
                    <div class="relative">
                        <!-- Scrollable Wrapper -->
                        <div class="max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            <table class="w-full text-sm text-left border-collapse">
                                <!-- Sticky Header -->
                                <thead
                                    class="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th
                                            class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Invoice No
                                        </th>
                                        <th
                                            class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Dealer
                                        </th>
                                        <th
                                            class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    <!-- Loading State -->
                                    <template v-if="isLoading">
                                        <tr v-for="i in 5" :key="'sale-skeleton-' + i" class="animate-pulse">
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                        </tr>
                                    </template>

                                    <template v-else>
                                        <tr v-for="sale in latestSales" :key="sale.id"
                                            class="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">

                                            <!-- Invoice No with subtle Badge style -->
                                            <td class="px-4 py-3">
                                                <span
                                                    class="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded text-xs">
                                                    #{{ sale.invoice_no }}
                                                </span>
                                            </td>

                                            <!-- Dealer Name -->
                                            <td class="px-4 py-3">
                                                <div class="flex flex-col">
                                                    <span
                                                        class="font-medium text-gray-900 dark:text-gray-100 leading-none">
                                                        {{ sale.dealer_name }}
                                                    </span>
                                                    <span
                                                        class="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Verified
                                                        Dealer</span>
                                                </div>
                                            </td>

                                            <!-- Total Price -->
                                            <td class="px-4 py-3">
                                                <span class="text-sm font-black text-gray-900 dark:text-white">
                                                    {{ formatPrice(sale.grand_total) }}
                                                </span>
                                            </td>
                                        </tr>

                                        <!-- Empty State -->
                                        <tr v-if="latestSales.length === 0">
                                            <td colspan="3" class="px-4 py-12 text-center">
                                                <p class="text-gray-400 dark:text-gray-500 italic">No sales recorded yet
                                                </p>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DataCard>

                <!-- Warehouse Stock Status -->
                <DataCard title="Warehouse Stock Status" subtitle="Current warehouse inventory">
                    <div class="relative overflow-x-auto">
                        <!-- Scrollable wrapper with fixed height -->
                        <div class="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                            <table class="w-full text-sm text-left">
                                <thead class="sticky top-0 z-20 bg-gray-50 dark:bg-gray-700 shadow-sm">
                                    <tr>
                                        <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Warehouse
                                        </th>
                                        <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Product
                                        </th>
                                        <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Qty</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    <!-- Loading State -->
                                    <template v-if="isLoading">
                                        <tr v-for="i in 5" :key="'stock-skeleton-' + i" class="animate-pulse">
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </td>
                                        </tr>
                                    </template>

                                    <template v-else>
                                        <tr v-for="stock in warehouseStockRows" :key="stock.rowKey"
                                            class="hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-colors">
                                            <td
                                                class="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs truncate max-w-[150px]">
                                                {{ stock.warehouse_name }}
                                            </td>
                                            <td
                                                class="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs truncate max-w-[200px]">
                                                <div class="flex flex-col gap-0.5">
                                                    <span class="font-medium text-gray-900 dark:text-white">
                                                        {{ stock.product_name }}
                                                    </span>
                                                    <span class="text-[10px] text-gray-500 dark:text-gray-400">
                                                        {{ stock.variant_name }} • SKU: {{ stock.product_sku }}
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="flex flex-col gap-1">
                                                    <span class="font-bold text-gray-900 dark:text-white">
                                                        {{ stock.formatted_stock || '-' }}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Empty State -->
                                        <tr v-if="warehouseStockRows.length === 0">
                                            <td colspan="3"
                                                class="px-4 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                                                No stock data available
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DataCard>
            </div>

            <!-- Warehouses & Dealers Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Warehouses List -->
                <DataCard title="Warehouses" subtitle="List of all warehouses">
                    <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        <template v-if="isLoading">
                            <div v-for="i in 3" :key="'warehouse-skeleton-' + i"
                                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
                                <div class="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                                <div class="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            </div>
                        </template>
                        <template v-else>
                            <div v-for="warehouse in warehouses" :key="warehouse.id"
                                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4 class="font-semibold text-gray-900 dark:text-white">{{ warehouse.name }}
                                        </h4>
                                        <p
                                            class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                                            <Package class="w-4 h-4" /> {{ warehouse.serials_count }} Items
                                        </p>
                                        <p v-if="warehouse.location"
                                            class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin class="w-3 h-3" /> {{ warehouse.location }}
                                        </p>
                                    </div>
                                    <span
                                        :class="['px-3 py-1 text-xs rounded-full font-medium', warehouse.is_default ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200']">
                                        {{ warehouse.is_default ? 'Default' : 'Active' }}
                                    </span>
                                </div>
                            </div>
                            <div v-if="warehouses.length === 0"
                                class="text-center py-8 text-gray-500 dark:text-gray-400">
                                No warehouses available
                            </div>
                        </template>
                    </div>
                </DataCard>

                <!-- Dealers List -->
                <DataCard title="Active Customers" subtitle="List of all active Customers">
                    <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        <template v-if="isLoading">
                            <div v-for="i in 3" :key="'dealer-skeleton-' + i"
                                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
                                <div class="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                                <div class="h-3 w-56 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            </div>
                        </template>
                        <template v-else>
                            <div v-for="dealer in dealers" :key="dealer.id"
                                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4 class="font-semibold text-gray-900 dark:text-white">{{ dealer.name }}</h4>
                                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ dealer.code }}</p>
                                        <p v-if="dealer.phone"
                                            class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Phone class="w-3 h-3" /> {{ dealer.phone }}
                                        </p>
                                        <p v-if="dealer.email"
                                            class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Mail class="w-3 h-3" /> {{ dealer.email }}
                                        </p>
                                    </div>
                                    <span
                                        class="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div v-if="dealers.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                                No dealers available
                            </div>
                        </template>
                    </div>
                </DataCard>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSaleStore } from '@/stores/saleStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useDealerStore } from '@/stores/dealerStore';
import { useProductStore } from '@/stores/productStore';
import { useProductVariantStore } from '@/stores/productVariantStore';
import { useVariantPackageStore } from '@/stores/variantPackageStore';
import axiosClient from '@/axiosClient';
import Chart from 'chart.js/auto';
import DashboardCard from '@/components/core/DashboardCard.vue';
import DataCard from '@/components/core/DataCard.vue';
import SummaryItem from '@/components/core/SummaryItem.vue';
import {
    RefreshCw,
    Loader2,
    Package,
    Tags,
    ShoppingCart,
    Warehouse,
    Handshake,
    Phone,
    Mail,
    MapPin,
    Boxes,
} from 'lucide-vue-next';

// Store instances
const saleStore = useSaleStore();
const warehouseStore = useWarehouseStore();
const dealerStore = useDealerStore();
const productStore = useProductStore();
const productVariantStore = useProductVariantStore();
const variantPackageStore = useVariantPackageStore();

// Reactive data
const isLoading = ref(false);
const latestSales = ref([]);
const warehouseStocks = ref([]);
const warehouses = ref([]);
const dealers = ref([]);
const searchQuery = ref('');
const searchTimeout = ref(null);
const refresh = ref(false);

const filter = ref({
    variant_id: ''
});

const dashboardMetrics = ref({
    totalProducts: 0,
    totalVariants: 0,
    totalWarehouses: 0,
    totalDealers: 0,
    completedSales: 0,
    totalSalesAmount: 0,
    avgSaleValue: 0,
    totalWarehouseStockPcs: 0
});

// Computed properties for product section
const displayedProducts = computed(() => {
    let products = productStore.items || [];

    // Apply variant filter if selected
    if (filter.value.variant_id) {
        products = products.filter(product =>
            product.variants?.some(v => v.id === filter.value.variant_id)
        );
    }

    return products;
});

const allVariants = computed(() => {
    const variants = [];
    (productStore.items || []).forEach(product => {
        if (product.variants) {
            product.variants.forEach(variant => {
                variants.push({
                    id: variant.id,
                    label: `${product.name} - ${variant.name}`
                });
            });
        }
    });
    return variants;
});

const areAllExpanded = computed(() => {
    const products = displayedProducts.value;
    if (!products || products.length === 0) return false;
    return products.every(p => p.isExpanded === true);
});

// Toggle all products expansion
const toggleAllProducts = () => {
    const shouldExpand = !areAllExpanded.value;
    displayedProducts.value.forEach(product => {
        product.isExpanded = shouldExpand;
    });
};

// Toggle single product expansion
const toggleProductExpansion = (product) => {
    if (product) {
        product.isExpanded = !product.isExpanded;
    }
};

// Apply filter
const applyFilter = () => {
    // The computed property handles the filtering automatically
};

// Total packages calculator
const totalPackages = (variants) => {
    if (!variants || !Array.isArray(variants)) return 0;
    let total = 0;
    variants.forEach(variant => {
        if (variant.packages && variant.packages.length > 0) {
            total += variant.packages.length;
        }
    });
    return total;
};

// Format price helper
const formatPrice = (price) => {
    if (price === null || price === undefined) return '৳0';
    return '৳' + new Intl.NumberFormat('en-BD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Search methods
const handleSearch = () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }
    searchTimeout.value = setTimeout(async () => {
        try {
            await productStore.search(searchQuery.value);
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    filter.value.variant_id = '';
    productStore.search('');
};

// Refresh data
const refreshData = async () => {
    refresh.value = true;
    try {
        await loadProductData();
    } finally {
        refresh.value = false;
    }
};

// Load product data with proper structure initialization
const loadProductData = async () => {
    try {
        await productStore.get({ page: 1, per_page: 200 });

        if (productStore.items && Array.isArray(productStore.items)) {
            productStore.items.forEach(product => {
                if (product) {
                    if (product.isExpanded === undefined) {
                        product.isExpanded = false;
                    }
                    if (product.showDropdown === undefined) {
                        product.showDropdown = false;
                    }

                    if (product.variants && Array.isArray(product.variants)) {
                        product.variants.forEach(variant => {
                            if (variant) {
                                if (variant.showDropdown === undefined) {
                                    variant.showDropdown = false;
                                }
                                if (variant.packages && Array.isArray(variant.packages)) {
                                    variant.packages.forEach(pkg => {
                                        if (pkg && pkg.showDropdown === undefined) {
                                            pkg.showDropdown = false;
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });

            dashboardMetrics.value.totalProducts = productStore.items.length;

            let variantCount = 0;
            productStore.items.forEach(product => {
                if (product.variants) {
                    variantCount += product.variants.length;
                }
            });
            dashboardMetrics.value.totalVariants = variantCount;
        }
    } catch (error) {
        console.error('Error loading product data:', error);
    }
};

// Load all dashboard data
const loadDashboardData = async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            loadProductData(),
            fetchSales(),
            fetchWarehouseStocks(),
            fetchWarehouses(),
            fetchDealers()
        ]);

        setTimeout(() => {
            initializeCharts();
            toggleAllProducts();
        }, 500);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        isLoading.value = false;
    }
};

// Fetch sales from store
const fetchSales = async () => {
    try {
        const response = await axiosClient.get('/sales-invoices', {
            params: {
                page: 1,
                per_page: 1000
            }
        });
        if (response.success || response.data) {
            const salesData = response.data?.data?.data || [];
            latestSales.value = salesData.slice(0, 5);
            dashboardMetrics.value.completedSales = salesData.length;
            dashboardMetrics.value.totalSalesAmount = salesData.reduce((sum, sale) => sum + (sale.grand_total || 0), 0);
            if (dashboardMetrics.value.completedSales > 0) {
                dashboardMetrics.value.avgSaleValue = dashboardMetrics.value.totalSalesAmount / dashboardMetrics.value.completedSales;
            }
        }
    } catch (error) {
        console.error('Error fetching sales:', error);
    }
};

// Fetch warehouse stocks (grouped by warehouse) - using axiosClient directly
const fetchWarehouseStocks = async () => {
    try {
        const response = await axiosClient.get('/warehouse-stocks', {
            params: {
                page: 1,
                per_page: 5000,
                grouped: 1,
                search: ''
            }
        });

        if (response.data?.success || response.data?.data) {
            // Handle grouped response structure
            const responseData = response.data?.data?.data
                || response.data?.data
                || [];

            const flattenedStocks = [];
            let totalPcs = 0;

            if (Array.isArray(responseData)) {
                responseData.forEach(warehouseGroup => {
                    const warehouseName = warehouseGroup.warehouse_name || 'Unknown Warehouse';
                    const warehouseId = warehouseGroup.warehouse_id;

                    if (warehouseGroup.products && Array.isArray(warehouseGroup.products)) {
                        warehouseGroup.products.forEach(product => {
                            // Calculate total PCS for this variant from packages
                            let variantTotalPcs = 0;
                            if (product.packages && Array.isArray(product.packages)) {
                                product.packages.forEach(pkg => {
                                    const qty = Number(pkg.qty) || 0;
                                    // const totalQty = Number(pkg.total_qty) || 0;
                                    const ppp = Number(pkg.pieces_per_package) || 0;

                                    // if (totalQty > 0) {
                                    //     variantTotalPcs += totalQty;
                                    // } else 
                                    if (qty > 0) {
                                        // Fallback: pieces = qty × pieces_per_package
                                        variantTotalPcs += qty * (ppp > 0 ? ppp : 1);
                                    }
                                });
                            }

                            totalPcs += variantTotalPcs;

                            flattenedStocks.push({
                                id: `${warehouseId}-${product.product_id}-${product.variant_id ?? 'null'}`,
                                warehouse_id: warehouseId,
                                warehouse_name: warehouseName,
                                product_id: product.product_id,
                                product_name: product.product_name,
                                product_sku: product.product_sku,
                                variant_id: product.variant_id,
                                variant_name: product.variant_name,
                                formatted_stock: product.formatted_stock,
                                packages: product.packages || [],
                                total_stock_value: product.total_stock_value || 0,
                                total_pcs: variantTotalPcs
                            });
                        });
                    }
                });
            }

            warehouseStocks.value = flattenedStocks;
            dashboardMetrics.value.totalWarehouseStockPcs = totalPcs;

            // Debug log — check browser console to verify all warehouses show PCS totals
            const debugMap = {};
            flattenedStocks.forEach(s => {
                debugMap[s.warehouse_name] = (debugMap[s.warehouse_name] || 0) + s.total_pcs;
            });
            console.log('📊 Warehouse PCS totals:', debugMap);
        }
    } catch (error) {
        console.error('Error fetching warehouse stocks:', error);
    }
};

// Fetch warehouses
const fetchWarehouses = async () => {
    try {
        const response = await warehouseStore.getAll();
        if (response.success || response.data) {
            warehouses.value = response.data?.data || response.data || [];
            dashboardMetrics.value.totalWarehouses = warehouses.value.length;
        }
    } catch (error) {
        console.error('Error fetching warehouses:', error);
    }
};

// Fetch dealers
const fetchDealers = async () => {
    try {
        const response = await dealerStore.getAll();
        if (response.success || response.data) {
            dealers.value = response.data?.data || response.data || [];
            dashboardMetrics.value.totalDealers = dealers.value.length;
        }
    } catch (error) {
        console.error('Error fetching dealers:', error);
    }
};

// Computed for warehouse stock rows with formatted stock
const warehouseStockRows = computed(() => {
    return warehouseStocks.value.map((stock, index) => ({
        rowKey: stock.id || `stock-${index}`,
        warehouse_name: stock.warehouse_name || 'Unknown Warehouse',
        product_name: stock.product_name || 'Unknown Product',
        variant_name: stock.variant_name || 'Default Variant',
        product_sku: stock.product_sku || 'N/A',
        formatted_stock: stock.formatted_stock || '-',
        packages: stock.packages || [],
        total_pcs: stock.total_pcs || 0
    }));
});

// Chart references
const productSalesChart = ref(null);
const productVariantSalesChart = ref(null);
const warehouseSalesChart = ref(null);
const warehouseStockPieChart = ref(null);
let productChartInstance = null;
let productVariantChartInstance = null;
let warehouseChartInstance = null;
let warehouseStockPieChartInstance = null;

// Initialize all charts
const initializeCharts = () => {
    createProductSalesChart();
    createProductVariantSalesChart();
    createWarehouseSalesChart();
    createWarehouseStockPieChart();
};

// Create product sales bar chart
const createProductSalesChart = () => {
    if (!productSalesChart.value) return;

    const productSales = {};
    latestSales.value.forEach(sale => {
        if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach(item => {
                const productName = item.product_name || 'Unknown';
                productSales[productName] = (productSales[productName] || 0) + (item.total || 0);
            });
        }
    });

    const labels = Object.keys(productSales).slice(0, 5);
    const data = Object.values(productSales).slice(0, 5);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (productChartInstance) {
        productChartInstance.destroy();
    }

    productChartInstance = new Chart(productSalesChart.value, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Sales Amount',
                    data,
                    backgroundColor: colors,
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '৳' + Math.abs(value).toLocaleString()
                    }
                }
            }
        }
    });
};

// Create product variant sales bar chart
const createProductVariantSalesChart = () => {
    if (!productVariantSalesChart.value) return;

    const variantSales = {};
    latestSales.value.forEach(sale => {
        if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach(item => {
                const variantName = (item.product_name || 'Unknown') + ' (' + (item.unit_name || 'N/A') + ')';
                variantSales[variantName] = (variantSales[variantName] || 0) + (item.total || 0);
            });
        }
    });

    const labels = Object.keys(variantSales);
    const data = Object.values(variantSales);
    const colors = labels.map((_, i) => {
        const presets = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];
        return presets[i % presets.length];
    });

    if (productVariantChartInstance) {
        productVariantChartInstance.destroy();
    }

    productVariantChartInstance = new Chart(productVariantSalesChart.value, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Sales Amount',
                    data,
                    backgroundColor: colors,
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '৳' + Math.abs(value).toLocaleString()
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
};

// Create warehouse sales doughnut chart
const createWarehouseSalesChart = () => {
    if (!warehouseSalesChart.value) return;

    const warehouseSales = {};
    latestSales.value.forEach(sale => {
        const warehouseName = sale.warehouse_name || 'Unknown';
        warehouseSales[warehouseName] = (warehouseSales[warehouseName] || 0) + (sale.grand_total || 0);
    });

    const labels = Object.keys(warehouseSales);
    const data = Object.values(warehouseSales);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (warehouseChartInstance) {
        warehouseChartInstance.destroy();
    }

    warehouseChartInstance = new Chart(warehouseSalesChart.value, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};

// Create warehouse stock pie chart
const createWarehouseStockPieChart = () => {
    if (!warehouseStockPieChart.value) return;

    // Aggregate stock by warehouse
    const warehouseStockMap = {};

    warehouseStocks.value.forEach(stock => {
        const warehouseName = stock.warehouse_name || 'Unknown';
        if (!warehouseStockMap[warehouseName]) {
            warehouseStockMap[warehouseName] = 0;
        }
        warehouseStockMap[warehouseName] += stock.total_pcs || 0;
    });

    // Sort warehouses by stock descending, filter out zero values
    const sortedEntries = Object.entries(warehouseStockMap)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedEntries.map(([name]) => name);
    const data = sortedEntries.map(([, value]) => value);

    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#F43F5E', '#84CC16', '#F97316',
        '#14B8A6', '#A855F7', '#EAB308', '#6366F1', '#22C55E'
    ];

    if (warehouseStockPieChartInstance) {
        warehouseStockPieChartInstance.destroy();
    }

    // If no data, show placeholder
    if (labels.length === 0) {
        warehouseStockPieChartInstance = new Chart(warehouseStockPieChart.value, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#E5E7EB'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: () => 'No stock data available'
                        }
                    }
                }
            }
        });
        return;
    }

    warehouseStockPieChartInstance = new Chart(warehouseStockPieChart.value, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderColor: '#fff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 10 },
                        boxWidth: 12,
                        padding: 6
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value.toLocaleString()} PCS (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
};

// Format display date
const formatDisplayDate = (dateValue) => {
    const date = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
        return `Today ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${timeString}`;
    } else {
        return `${date.toLocaleDateString()} ${timeString}`;
    }
};

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};

// Watch for product store changes to update metrics
watch(() => productStore.items, (newItems) => {
    if (newItems) {
        dashboardMetrics.value.totalProducts = newItems.length;
        let variantCount = 0;
        newItems.forEach(product => {
            if (product.variants) {
                variantCount += product.variants.length;
            }
        });
        dashboardMetrics.value.totalVariants = variantCount;
    }
}, { deep: true });

onMounted(() => {
    loadDashboardData();
});
</script>

<style scoped>
.data-card {
    @apply transition-shadow duration-200;
}

.data-card:hover {
    @apply shadow-lg;
}

/* Chrome, Safari, and Edge */
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6366f1;
}
</style>