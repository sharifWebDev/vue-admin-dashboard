<template>
    <div class="px-0 py-4">
        <!-- Page Header -->
        <div class="mb-6">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Inventory & Sales Dashboard</h1>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time overview of products, sales, and
                        warehouse management</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button @click="loadDashboardData" :disabled="loading"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
                        {{ loading ? 'Loading...' : 'Refresh' }}
                    </button>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {{ formatDate(new Date()) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>

        <!-- Main Content -->
        <div v-else class="space-y-6">
            <!-- Key Metrics Widgets -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Total Products -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Products</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ metrics.totalProducts }}
                            </p>
                        </div>
                        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <i class="fas fa-cube text-2xl text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Sales -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Sales</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{
                                formatPrice(metrics.totalSales) }}</p>
                        </div>
                        <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <i class="fas fa-shopping-cart text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Warehouses -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Warehouses</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ metrics.totalWarehouses
                                }}</p>
                        </div>
                        <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <i class="fas fa-warehouse text-2xl text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Active Dealers -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-orange-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Dealers</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ metrics.totalDealers }}
                            </p>
                        </div>
                        <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <i class="fas fa-handshake text-2xl text-orange-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products & Sales Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Latest Products -->
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex justify-between items-center">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Latest Products</h2>
                            <a href="#" class="text-sm text-blue-600 hover:text-blue-700">View All →</a>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Product</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Price</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Units</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="product in latestProducts" :key="product.id"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900 dark:text-white">{{ product.name }}</div>
                                        <div class="text-xs text-gray-600 dark:text-gray-400">SKU: {{ product.sku }}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-gray-900 dark:text-white">{{
                                        formatPrice(product.unit_prices[0]?.selling_price || 0) }}</td>
                                    <td class="px-4 py-3 text-gray-900 dark:text-white">{{ product.serials_count }}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full"
                                            :class="product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'">
                                            {{ product.is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Sales Summary Card -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Summary</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Completed Sales</span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">{{ metrics.completedSales
                                    }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Total Revenue</span>
                                <span class="text-xl font-bold text-green-600">{{ formatPrice(metrics.totalSales)
                                    }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Avg Sale Value</span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">{{
                                    formatPrice(metrics.avgSaleValue) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a href="#" class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            View Detailed Report <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Product-wise Sales Chart -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product-wise Sales Growth</h3>
                    <div class="h-80">
                        <canvas ref="productSalesChart"></canvas>
                    </div>
                </div>

                <!-- Warehouse-wise Sales Chart -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Warehouse-wise Sales</h3>
                    <div class="h-80">
                        <canvas ref="warehouseSalesChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Latest Sales & Warehouse Info Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Latest Sales -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Latest Sales</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Invoice</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Dealer</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Total</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Date</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="sale in latestSales" :key="sale.id"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-4 py-3 font-medium text-blue-600">{{ sale.invoice_no }}</td>
                                    <td class="px-4 py-3 text-gray-900 dark:text-white">{{ sale.dealer_name }}</td>
                                    <td class="px-4 py-3 font-bold text-gray-900 dark:text-white">{{
                                        formatPrice(sale.grand_total) }}</td>
                                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{{
                                        formatDate(sale.invoice_date) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Warehouse Stock Info -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Warehouse Stock Status</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Warehouse</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Product</th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                        Qty</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="stock in warehouseStocks" :key="stock.id"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{
                                        stock.warehouse_name }}</td>
                                    <td class="px-4 py-3 text-gray-900 dark:text-white">{{ stock.product_name }}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-gray-900 dark:text-white">{{ stock.total_qty
                                                }}</span>
                                            <span
                                                class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">{{
                                                    stock.package_qty }} pkg</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Warehouses & Dealers Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Latest Warehouses -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Warehouses</h2>
                    </div>
                    <div class="divide-y divide-gray-200 dark:divide-gray-700">
                        <div v-for="warehouse in warehouses" :key="warehouse.id"
                            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ warehouse.name }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <i class="fas fa-cube mr-2"></i>
                                        {{ warehouse.serials_count }} Items
                                    </p>
                                    <p v-if="warehouse.location" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        📍 {{ warehouse.location }}
                                    </p>
                                </div>
                                <span
                                    class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium">
                                    {{ warehouse.is_default ? 'Default' : 'Active' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Dealers List -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Active Dealers</h2>
                    </div>
                    <div class="divide-y divide-gray-200 dark:divide-gray-700">
                        <div v-for="dealer in dealers" :key="dealer.id"
                            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ dealer.name }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ dealer.code }}</p>
                                    <p v-if="dealer.phone" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        <i class="fas fa-phone mr-1"></i>{{ dealer.phone }}
                                    </p>
                                    <p v-if="dealer.email" class="text-xs text-gray-500 dark:text-gray-500">
                                        <i class="fas fa-envelope mr-1"></i>{{ dealer.email }}
                                    </p>
                                </div>
                                <span
                                    class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-medium">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useSaleStore } from '@/stores/saleStore';
import { useProductStore } from '@/stores/productStore';
import { useWarehouseStockStore } from '@/stores/warehouseStockStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useDealerStore } from '@/stores/dealerStore';
import axiosClient from '@/axiosClient';
import Chart from 'chart.js/auto';

export default defineComponent({
    name: 'InventoryDashboard',
    data() {
        return {
            loading: false,
            latestProducts: [],
            latestSales: [],
            warehouseStocks: [],
            warehouses: [],
            dealers: [],
            metrics: {
                totalProducts: 0,
                totalSales: 0,
                totalWarehouses: 0,
                totalDealers: 0,
                completedSales: 0,
                avgSaleValue: 0
            },
            charts: {
                productSales: null,
                warehouseSales: null
            }
        };
    },
    computed: {
        saleStore() {
            return useSaleStore();
        },
        productStore() {
            return useProductStore();
        },
        warehouseStockStore() {
            return useWarehouseStockStore();
        },
        warehouseStore() {
            return useWarehouseStore();
        },
        dealerStore() {
            return useDealerStore();
        }
    },
    mounted() {
        this.loadDashboardData();
    },
    methods: {
        async loadDashboardData() {
            this.loading = true;
            try {
                await Promise.all([
                    this.fetchProducts(),
                    this.fetchSales(),
                    this.fetchWarehouseStocks(),
                    this.fetchWarehouses(),
                    this.fetchDealers()
                ]);
                this.calculateMetrics();
                this.$nextTick(() => {
                    this.initializeCharts();
                });
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchProducts() {
            try {
                const response = await this.productStore.get({ page: 1, per_page: 5 });
                if (response.success) {
                    this.latestProducts = response.data || [];
                    this.metrics.totalProducts = response.meta?.total || 0;
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },

        async fetchSales() {
            try {
                const response = await this.saleStore.get({ page: 1, per_page: 10 });
                if (response.success) {
                    this.latestSales = (response.data || []).slice(0, 5);
                    this.metrics.completedSales = response.meta?.total || (response.data || []).length;
                    this.metrics.totalSales = (response.data || []).reduce((sum, sale) => sum + (sale.grand_total || 0), 0);
                    if (this.metrics.completedSales > 0) {
                        this.metrics.avgSaleValue = this.metrics.totalSales / this.metrics.completedSales;
                    }
                }
            } catch (error) {
                console.error('Error fetching sales:', error);
            }
        },

        async fetchWarehouseStocks() {
            try {
                const response = await this.warehouseStockStore.get({ page: 1, per_page: 5 });
                if (response.success) {
                    this.warehouseStocks = (response.data || []).slice(0, 5);
                }
            } catch (error) {
                console.error('Error fetching warehouse stocks:', error);
            }
        },

        async fetchWarehouses() {
            try {
                const response = await this.warehouseStore.get({ page: 1, per_page: 10 });
                if (response.success) {
                    this.warehouses = response.data || [];
                    this.metrics.totalWarehouses = response.meta?.total || this.warehouses.length;
                }
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            }
        },

        async fetchDealers() {
            try {
                const response = await this.dealerStore.get({ page: 1, per_page: 10 });
                if (response.success) {
                    this.dealers = response.data || [];
                    this.metrics.totalDealers = response.meta?.total || this.dealers.length;
                }
            } catch (error) {
                console.error('Error fetching dealers:', error);
            }
        },

        calculateMetrics() {
            // Metrics are calculated during fetch operations
        },

        initializeCharts() {
            this.createProductSalesChart();
            this.createWarehouseSalesChart();
        },

        createProductSalesChart() {
            const ctx = this.$refs.productSalesChart;
            if (!ctx) return;

            // Group sales by product
            const productSales = {};
            this.latestSales.forEach(sale => {
                if (sale.items) {
                    sale.items.forEach(item => {
                        const productName = item.product_name;
                        productSales[productName] = (productSales[productName] || 0) + item.total;
                    });
                }
            });

            const labels = Object.keys(productSales).slice(0, 5);
            const data = Object.values(productSales).slice(0, 5);
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

            if (this.charts.productSales) {
                this.charts.productSales.destroy();
            }

            this.charts.productSales = new Chart(ctx, {
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
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatPrice(value)
                            }
                        }
                    }
                }
            });
        },

        createWarehouseSalesChart() {
            const ctx = this.$refs.warehouseSalesChart;
            if (!ctx) return;

            // Group sales by warehouse
            const warehouseSales = {};
            this.latestSales.forEach(sale => {
                const warehouseName = sale.warehouse_name || 'Unknown';
                warehouseSales[warehouseName] = (warehouseSales[warehouseName] || 0) + sale.grand_total;
            });

            const labels = Object.keys(warehouseSales);
            const data = Object.values(warehouseSales);
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

            if (this.charts.warehouseSales) {
                this.charts.warehouseSales.destroy();
            }

            this.charts.warehouseSales = new Chart(ctx, {
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
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },

        formatPrice(price) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price || 0);
        },

        formatDate(date) {
            if (!date) return '';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(new Date(date));
        }
    }
});
</script>

<style scoped>
.bg-white {
    @apply transition-shadow duration-200;
}

.bg-white:hover {
    @apply shadow-lg;
}
</style>
