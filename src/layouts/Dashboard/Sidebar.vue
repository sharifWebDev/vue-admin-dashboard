<template>
  <div>
    <!-- Sidebar -->
    <div :class="[
      'sidebar w-64 bg-[#082680] dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 h-full transition-all duration-300',
      { collapsed: isCollapsed },
      { open: isMobileOpen },
      'fixed md:relative'
    ]" :style="{ width: isCollapsed && windowWidth >= 768 ? '70px' : '256px' }">
      <!-- Header -->
      <div class="h-[4.3rem] px-4 border-b border-gray-200/20 dark:border-gray-700 flex items-center justify-between">
        <span class="flex items-center">
          <router-link to="/dashboard" class="flex items-center">
            <img src=".//logo/app-logo.png" alt="App Logo" class="h-14 w-auto"
              :style="{ display: isCollapsed && windowWidth >= 768 ? 'none' : 'block' }" />
            <img src=".//logo/logo-sm.png" alt="App Logo" class="h-14 w-[70px]"
              :style="{ display: isCollapsed && windowWidth >= 768 ? 'block' : 'none' }" />
            <span v-if="!isCollapsed || windowWidth < 768"
              class="logo-text text-lg font-bold text-gray-600 dark:text-white">
            </span>
          </router-link>
          <span v-if="isCollapsed || windowWidth < 768"
            class="logo-text text-lg font-bold text-gray-600 dark:text-white">
            <button v-if="windowWidth < 768" @click="toggleMobileMenu"
              class="p-1 rounded-md text-gray-500 md:hidden ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="rotate-180">
                <g id="Group_28009" data-name="Group 28009" transform="translate(0 16) rotate(-90)">
                  <rect id="Rectangle_18283" data-name="Rectangle 18283" width="2" height="7" rx="1" fill="#9da3ae">
                  </rect>
                  <rect id="Rectangle_16236" data-name="Rectangle 16236" width="2" height="11" rx="1"
                    transform="translate(14)" fill="#9da3ae"></rect>
                  <rect id="Rectangle_18284" data-name="Rectangle 18284" width="2" height="16" rx="1"
                    transform="translate(7)" fill="#9da3ae"></rect>
                </g>
              </svg>
            </button>
          </span>
        </span>

        <!-- Collapse -->
        <button v-if="windowWidth >= 768" @click="toggleCollapse" class="hidden md:block p-1 rounded-md text-gray-500"
          :style="{ display: isCollapsed && windowWidth >= 768 ? 'none' : 'block' }">
          <i :class="[
            'fas text-sm text-transparent dark:text-transparent',
            isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'
          ]"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav
        class="p-3 flex-1 min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-visible sidebar-overly custom-scrollbar">
        <ul class="space-y-1">
          <!-- Filtered navigation items based on permissions -->
          <template v-for="item in filteredNavigationItems" :key="item.id">

            <li v-if="hasAccessToItem(item)" class="relative nav-item-container"
              @mouseenter="handleHoverEnter(item, $event)" @mouseleave="handleHoverLeave(item)">
              <!-- Parent item with subItems -->
              <div v-if="item.subItems && hasAccessToSubItems(item)" class="space-y-1">
                <button @click="toggleSubmenu(item.id)" :class="[
                  'w-full nav-item flex items-center space-x-3 p-3 rounded-lg text-gray-200 dark:text-gray-300 hover:bg-[#e6e6e633] dark:hover:bg-gray-700 transition-colors',
                  { active: isActive(item) || isSubItemActive(item) },
                  { 'justify-center': isCollapsed && windowWidth >= 768 }
                ]" :title="item.text">

                  <div
                    :class="['flex items-center justify-center w-6', isCollapsed && windowWidth >= 768 ? 'mx-auto' : '']">
                    <component v-if="typeof item.icon !== 'string'" :is="item.icon"
                      :class="['w-5 h-5', isActive(item) ? 'text-indigo-500' : 'text-slate-200']" />

                    <ArrowRight v-else class="w-4 h-4 group-hover:text-indigo-500" />
                  </div>

                  <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text text-sm flex-1 text-left">
                    {{ item.text }}
                  </span>
                  <i :class="[
                    'fas transition-transform duration-200 text-xs',
                    isCollapsed && windowWidth >= 768 ? 'ml-0' : 'ml-2',
                    expandedMenus.includes(item.id) ? 'fa-chevron-down' : 'fa-chevron-right'
                  ]"></i>
                </button>

                <!-- Submenu items (Regular) -->
                <ul v-if="expandedMenus.includes(item.id)"
                  class="space-y-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-3">
                  <li v-for="subItem in getAccessibleSubItems(item)" :key="subItem.path">
                    <router-link :to="subItem.path" :class="[
                      'nav-item flex items-center space-x-3 p-2 rounded-lg text-gray-50 dark:text-gray-400 hover:bg-[#e6e6e633] dark:hover:bg-gray-700 transition-colors text-sm',
                      { active: route.path === subItem.path }
                    ]" :title="subItem.name" @click="handleNavigation">

                      <div
                        :class="['flex items-center justify-center w-6', isCollapsed && windowWidth >= 768 ? 'mx-auto' : '']">
                        <component v-if="typeof item.icon !== 'string'" :is="item.icon"
                          :class="['w-5 h-5', isActive(item) ? 'text-indigo-100' : 'text-slate-200 hover:text-indigo-500']" />
                        <ArrowRight v-else class="w-4 h-4 text-slate-200 hover:text-indigo-500" />
                      </div>

                      <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text">
                        {{ subItem.name }}
                      </span>
                    </router-link>
                  </li>
                </ul>
              </div>

              <!-- Regular item without subItems -->
              <router-link v-else-if="hasAccessToItem(item)" :to="item.route" :class="[
                'nav-item flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#e6e6e633] dark:hover:bg-gray-700 transition-colors relative',
                { active: isActive(item) },
                { 'justify-center': isCollapsed && windowWidth >= 768 }
              ]" :title="item.text" @click="handleNavigation">
                <div
                  :class="['flex items-center justify-center w-6', isCollapsed && windowWidth >= 768 ? 'mx-auto' : '']">
                  <component v-if="typeof item.icon !== 'string'" :is="item.icon"
                    :class="['w-5 h-5', isActive(item) ? 'text-indigo-500' : 'text-slate-50 hover:text-indigo-500']" />
                  <ArrowRight v-else class="w-4 h-4 text-slate-200 hover:text-indigo-500" />
                </div>
                <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text  dark:text-gray-400 text-sm"
                  :class="['', isActive(item) ? 'text-indigo-500' : 'text-white']">
                  {{ item.text }}
                </span>
              </router-link>
            </li>
          </template>

          <!-- No items message -->
          <li v-if="filteredNavigationItems.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            No menu items available
          </li>
        </ul>
      </nav>
    </div>

    <!-- Portal for hover submenus -->
    <Teleport to="body">
      <!-- Hover Submenu (When collapsed) -->
      <div v-if="hoverSubmenuData && hoverSubmenuData.item && hoverSubmenuData.position"
        class="hover-submenu-portal bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700 min-w-[200px]"
        :style="hoverSubmenuData.position" @mouseenter="handleHoverSubmenuEnter" @mouseleave="handleHoverSubmenuLeave">
        <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="font-medium text-gray-800 dark:text-white text-sm">
            {{ hoverSubmenuData.item.text }}
          </span>
        </div>
        <ul class="space-y-1">
          <li v-for="subItem in getAccessibleSubItems(hoverSubmenuData.item)" :key="subItem.path">
            <router-link :to="subItem.path" :class="[
              'nav-item flex items-center space-x-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm',
              { active: route.path === subItem.path }
            ]" @click="handleNavigation">
              <component v-if="typeof subItem.icon !== 'string'" :is="subItem.icon"
                :class="['w-5 h-5', isActive(subItem) ? 'text-indigo-100' : 'text-slate-600 hover:text-indigo-500']" />
              <span class="sidebar-text">{{ subItem.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Tooltip for collapsed items without subItems -->
      <div v-if="hoverTooltipData && hoverTooltipData.item && hoverTooltipData.position"
        class="hover-tooltip-portal bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 px-3 py-1.5 rounded-md text-sm whitespace-nowrap shadow-lg"
        :style="hoverTooltipData.position" @mouseenter="handleHoverSubmenuEnter" @mouseleave="handleHoverSubmenuLeave">
        {{ hoverTooltipData.item.text }}
        <div
          class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700">
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useSidebarStore } from "@/stores/sidebar";
import { useAuthStore } from "@/stores/authStore";

import {
  LayoutDashboard,
  Target,
  FileCheck,
  TrendingUp,
  Receipt,
  RotateCcw,
  FileSpreadsheet,
  ArrowLeftRight,
  FileText,
  Store,
  BarChart3,
  Banknote,
  Scale,
  ArrowRight,
  Box,
  UserRoundCog,
  Factory,
  ClipboardList,
  ArrowRightLeft,
  Warehouse,
  FileBarChart,
  Boxes,
  Package,
  Sliders,
  Ruler,
  CreditCard,
  Users,
  Truck,
  UserCheck,
  PackageCheck,
  Tags,
  Layers,
  History,
  FlaskConical,
  FolderTree,
  Settings,
  PackageSearch,
  ShieldCheck,
  Lock,
} from 'lucide-vue-next'



const route = useRoute();
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();

const windowWidth = ref(window.innerWidth);
const expandedMenus = ref([]);
const hoveredItemId = ref(null);
const hoverTimeout = ref(null);
const isHoveringSubmenu = ref(false);
const hoverSubmenuData = ref(null);
const hoverTooltipData = ref(null);

/* ================= Menu with Permissions ================= */
const navigationItems = ref([
  {
    id: 'overview',
    text: 'Dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
    // exact: true,
    permission: ''
  },
  {
    name: 'sales',
    text: 'Sales',
    route: '/sales',
    icon: BarChart3,
    permission: 'sales_invoices.view'
  }, 
  // sales return
  {
    name: 'sales-return',
    text: 'Sales Return',
    route: '/return/sales',
    icon: RotateCcw,
    permission: 'sales_returns.view'
  },
  {
    name: 'order-sheets',
    text: 'Order Sheets',
    route: '/order-sheets',
    icon: FileSpreadsheet,
    permission: 'quotations.view'
  },
  {
    name: 'Transfer',
    text: 'Product Transfer',
    route: '/transfer',
    icon: ArrowLeftRight,
    permission: 'stock_movements.view'
  },
  // Packaging
  {
    name: 'Production',
    text: 'Production',
    route: '/packaging',
    icon: Factory,
    permission: 'packagings.view'
  },
  {
    name: 'Current Warehouse Stocks',
    text: 'Current Warehouse Stocks',
    route: '/stocks',
    icon: Store,
    permission: 'warehouse_stocks.view'
  },
  {
    name: 'Stock Balance Report',
    text: 'Stock Balance Report',
    route: '/stock-balance-report',
    icon: Store,
    permission: 'warehouse_stocks.view'
  },
  {
    // requesition
    name: 'work-orders',
    text: 'Work Orders',
    route: '/work-orders',
    icon: FileText,
    permission: 'work_orders.view'
  },
  // supplier transactions
  {
    name: 'supplier-transactions',
    text: 'Supplier Transactions',
    route: '/supplier-transactions',
    icon: ArrowRightLeft,
    permission: 'supplier_transactions.view'
  },
  // supplierStatementRoutes
  {
    name: 'supplier-statements',
    text: 'Supplier Statements',
    route: '/supplier-statements',
    icon: FileText,
    permission: 'supplier_statements.view'
  },
  {
    name: 'Purchase Orders',
    text: 'Purchase Orders',
    route: '/purchase-orders',
    icon: ClipboardList,
    permission: 'purchase_orders.view'
  },
  {
    name: 'Purchase Returns',
    text: 'Purchase Returns',
    route: '/purchase-returns',
    icon: RotateCcw,
    permission: 'purchase_returns.view'
  },
  {
    id: 'products',
    text: 'Products',
    icon: Box,
    route: '/products',
    permission: 'products.view'
  },
  // category
  {
    name: 'Category',
    text: 'Category',
    route: '/category',
    icon: Scale,
    permission: 'categories.view'
  },
  // Variant Packages
  {
    name: 'variant-packages',
    text: 'Variant Packages',
    route: '/variant-packages',
    icon: Box,
    permission: 'variant_packages.view'
  },
  // // ProductVariantsRoutes
  {
    name: 'Product Variants',
    text: 'Product Variants',
    route: '/product-variants',
    icon: Tags,
    permission: 'product_variants.view'
  },
  // package types
  {
    name: 'Package Types',
    text: 'Package Types',
    route: '/package-types',
    icon: Scale,
    permission: 'package_types.view'
  },
  // measurement units
  {
    name: 'Measurement Units',
    text: 'Measurement Units',
    route: '/measurement-units',
    icon: Scale,
    permission: 'measurement_units.view'
  },
  // raw_material_inventory
  {
    name: 'Raw Materials Inventory',
    text: 'Raw Materials Inventory',
    route: '/raw-materials-inventory',
    icon: Warehouse,
    permission: 'raw_material_inventory.view'
  },
  {
    name: 'Raw Materials Inventory Usages',
    text: 'Raw Materials Inventory Usages',
    route: '/raw-material-inventory-usages',
    icon: Warehouse,
    permission: 'raw_material_inventory.view'
  },
  {
    name: 'Raw Material Inventory Logs',
    text: 'Raw Material Inventory Logs',
    route: '/raw-material-inventory-logs',
    icon: Scale,
    permission: 'raw_material_inventory.view'
  },
  // raw_materials
  {
    name: 'Raw Materials',
    text: 'Raw Materials',
    route: '/raw-materials',
    icon: Scale,
    permission: 'raw_materials.view'
  },
  //stock conversion
  // {
  //   name: 'Stock Conversion',
  //   text: 'Stock Conversion',
  //   route: '/stock-conversions',
  //   icon: Scale,
  //   permission: 'stock_conversions.list'
  // },
  // {
  //   name: 'Unit Conversion',
  //   text: 'Unit Conversion',
  //   route: '/unit-conversions',
  //   icon: ArrowRight,
  //   permission: 'unit_conversions.view'
  // },
  // {
  //   name: 'Product Units',
  //   text: 'Units',
  //   route: '/product-units',
  //   icon: Scale,
  //   permission: 'units.view'
  // },
  {
    name: 'Warehouse',
    text: 'Warehouse',
    route: '/warehouse',
    icon: Warehouse,
    permission: 'warehouses.view'
  },
  // {
  //   id: 'Dealers',
  //   text: 'Dealers',
  //   icon: Users,
  //   route: '/dealers',
  //   permission: 'dealers.view'
  // },
  {
    id: 'Customers',
    text: 'Customers',
    icon: Users,
    route: '/customers',
    permission: 'dealers.view'
  },
  {
    id: 'suppliers',
    text: 'Suppliers',
    icon: Users,
    route: '/suppliers',
    permission: 'suppliers.view'
  },
  {
    id: 'users',
    text: 'Users',
    icon: Users,
    route: '/users',
    permission: 'users.view'
  },
  {
    id: 'payment-methods',
    text: 'Payment Methods',
    icon: Banknote,
    route: '/payment-methods',
    permission: 'payment_methods.list'

  },
  {
    id: 'payment-summary-report',
    text: 'Payment Summary Report',
    icon: FileText,
    route: '/payment-summary-report',
    permission: 'dealers.report'
  },
  // {
  //   id: 'roles',
  //   text: 'Roles',
  //   icon: UserRoundCog,
  //   route: '/roles',
  //   permission: 'roles.view'
  // },
  // {
  //   id: 'permissions',
  //   text: 'Permissions',
  //   icon: Lock,
  //   route: '/permissions',
  //   permission: 'permissions.view'
  // },
  {
    id: 'activity-logs',
    text: 'Activity Logs',
    icon: ShieldCheck,
    route: '/activity-logs',
    permission: 'activity_logs.view'
  },
  {
    id: 'reports',
    text: 'Reports',
    icon: FileText,
    route: '/reports',
    permission: '',
    subItems: [
      {
        name: 'Sales Report',
        path: '/reports/sales-report',
        icon: BarChart3,
        permission: 'sales_invoices.report'
      },
      // {
      //   name: 'Sales Invoice Details Report',
      //   path: '/reports/sales-invoice-details-report',
      //   icon: BarChart3,
      //   permission: 'sales_invoices.report'
      // },
      {
        name: 'Delevery Details Report',
        path: '/reports/delevery-details-report',
        icon: BarChart3,
        permission: 'stock_movements.report'
      },
      {
        name: 'Transfer Report',
        path: '/reports/transfer-report',
        icon: ArrowLeftRight,
        permission: 'stock_movements.report'
      },
      {
        name: 'Production Report',
        path: '/reports/production-report',
        icon: FileText,
        permission: 'packagings.view'
      },
      {
        name: 'Customer Due Report',
        path: '/payment-summary-report',
        icon: FileText,
        permission: 'dealers.report'
      },
      {
        name: 'Raw Material Inventory Usages Report',
        text: 'Raw Material Inventory Usages Report',
        path: '/reports/raw-material-inventory-usage-report',
        icon: Warehouse,
        permission: 'raw_material_inventory.view'
      }
    ]
  }
]);

/* ================= Computed Properties ================= */
const isCollapsed = computed(() => sidebarStore.isCollapsed);
const isMobileOpen = computed(() => sidebarStore.isMobileOpen);

// Filter navigation items based on permissions
const filteredNavigationItems = computed(() => {
  return navigationItems.value.filter(item => hasAccessToItem(item));
});

const toggleMobileMenu = () => {
  if (windowWidth.value < 768) {
    sidebarStore.closeMobile();
  }
};

/* ================= Permission Check Functions ================= */
const hasAccessToItem = (item) => {
  if (!item.permission) return true;
  return authStore.can(item.permission);
};

const hasAccessToSubItems = (parentItem) => {
  if (!parentItem.subItems) return false;
  return parentItem.subItems.some(subItem => {
    if (!subItem.permission) return true;
    return authStore.can(subItem.permission);
  });
};

const getAccessibleSubItems = (parentItem) => {
  if (!parentItem.subItems) return [];
  return parentItem.subItems.filter(subItem => {
    if (!subItem.permission) return true;
    return authStore.can(subItem.permission);
  });
};

/* ================= Active State ================= */
const isActive = (item) => {
  if (item.exact) return route.path === item.route;
  return isPathActive(route.path, item.route);
};

const isSubItemActive = (parentItem) => {
  if (!parentItem.subItems) return false;
  return parentItem.subItems.some(
    subItem => route.path === subItem.path
  );
};
const isPathActive = (currentPath, itemPath) => {
  return (
    currentPath === itemPath ||
    currentPath.startsWith(itemPath + '/')
  );
};

/* ================= Actions ================= */
const toggleCollapse = () => {
  sidebarStore.toggleCollapse();
};

const toggleSubmenu = (itemId) => {
  if (expandedMenus.value.includes(itemId)) {
    expandedMenus.value = expandedMenus.value.filter(id => id !== itemId);
  } else {
    expandedMenus.value.push(itemId);
  }
};

const handleNavigation = () => {
  if (windowWidth.value < 768) {
    sidebarStore.closeMobile();
  }
  hoverSubmenuData.value = null;
  hoverTooltipData.value = null;
  isHoveringSubmenu.value = false;
};

const handleHoverEnter = (item, event) => {
  if (!isCollapsed.value || windowWidth.value < 768) return;
  if (!hasAccessToItem(item)) return;

  clearTimeout(hoverTimeout.value);

  // Get the target element's position
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();

  hoverTimeout.value = setTimeout(() => {
    if (item.subItems && hasAccessToSubItems(item)) {
      // Show submenu
      hoverSubmenuData.value = {
        item: item,
        position: {
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.right + 8}px`,
          zIndex: 10000
        }
      };
      hoverTooltipData.value = null;
    } else if (!item.subItems) {
      // Show tooltip
      hoverTooltipData.value = {
        item: item,
        position: {
          position: 'fixed',
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 8}px`,
          transform: 'translateY(-50%)',
          zIndex: 10000
        }
      };
      hoverSubmenuData.value = null;
    }
  }, 150);
};

const handleHoverLeave = (item) => {
  if (!isCollapsed.value || windowWidth.value < 768) return;

  clearTimeout(hoverTimeout.value);
  hoverTimeout.value = setTimeout(() => {
    if (!isHoveringSubmenu.value) {
      hoverSubmenuData.value = null;
      hoverTooltipData.value = null;
    }
  }, 200);
};

const handleHoverSubmenuEnter = () => {
  isHoveringSubmenu.value = true;
  clearTimeout(hoverTimeout.value);
};

const handleHoverSubmenuLeave = () => {
  isHoveringSubmenu.value = false;
  hoverTimeout.value = setTimeout(() => {
    hoverSubmenuData.value = null;
    hoverTooltipData.value = null;
  }, 200);
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 768) {
    sidebarStore.isMobileOpen = false;
  }
  // Clear hover data on resize
  hoverSubmenuData.value = null;
  hoverTooltipData.value = null;
};

/* ================= Lifecycle ================= */
onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  clearTimeout(hoverTimeout.value);
});
</script>

<style scoped>
.sidebar {
  transition: all 0.3s ease;
  overflow: visible !important;
}

.sidebar.collapsed {
  width: 70px !important;
}

.nav-item.active {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 500;
}

.dark .nav-item.active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* Ensure sidebar doesn't clip content */
.sidebar,
.sidebar * {
  overflow: visible !important;
}

.sidebar-overly {
  overflow-y: auto !important;
  overflow-x: visible !important;
}

/* Portal styles */
.hover-submenu-portal,
.hover-tooltip-portal {
  animation: fadeIn 0.15s ease-in-out;
  pointer-events: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .hover-submenu-portal,
  .hover-tooltip-portal {
    display: none !important;
  }
}

/* set scroll y 4 px width */
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}

.custom-scrollbar:hover::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e6e9ec99;
  border-radius: 10px;
}
</style>