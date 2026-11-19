<template>
  <div>
    <!-- Sidebar -->
    <div :class="[
      'sidebar w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 h-full transition-all duration-300',
      { collapsed: isCollapsed },
      { open: isMobileOpen },
      'fixed md:relative'
    ]" :style="{ width: isCollapsed && windowWidth >= 768 ? '70px' : '256px' }">
      <!-- Header -->
      <div class="h-[4.42rem] px-4 border-b-transparent dark:border-gray-700 flex items-center justify-between">
        <span class="flex items-center">
          <router-link to="/dashboard" class="flex items-center">
            <img src="./../../../public/logo/app-logo.png" alt="App Logo" class="h-9 w-auto pl-2"
              :style="{ display: isCollapsed && windowWidth >= 768 ? 'none' : 'block' }" />
            <img src="./../../../public/logo/logo-sm.png" alt="App Logo" class="h-9 w-[70px]"
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
            'fas text-sm text-white dark:text-transparent',
            isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'
          ]"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav
        class="p-3 flex-1 min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-visible sidebar-overly">
        <ul class="space-y-1">
          <!-- Filtered navigation items based on permissions -->
          <template v-for="item in filteredNavigationItems" :key="item.id">
            <li v-if="hasAccessToItem(item)" class="relative nav-item-container"
              @mouseenter="handleHoverEnter(item, $event)" @mouseleave="handleHoverLeave(item)">
              <!-- Parent item with subItems -->
              <div v-if="item.subItems && hasAccessToSubItems(item)" class="space-y-1">
                <button @click="toggleSubmenu(item.id)" :class="[
                  'w-full nav-item flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  { active: isActive(item) || isSubItemActive(item) },
                  { 'justify-center': isCollapsed && windowWidth >= 768 }
                ]" :title="item.text">
                  <i :class="[
                    item.icon,
                    'w-5 text-center',
                    isCollapsed && windowWidth >= 768 ? 'mx-auto' : ''
                  ]"></i>

                  <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text text-sm flex-1 text-left">
                    {{ item.text }}
                  </span>

                  <i v-if="!isCollapsed || windowWidth < 768" :class="[
                    'fas text-[11px] transition-transform duration-300 text-gray-400 dark:text-gray-400',
                    expandedMenus.includes(item.id) ? 'fa-chevron-down' : 'fa-chevron-right'
                  ]"></i>
                </button>

                <!-- Submenu items (Regular) -->
                <ul v-if="expandedMenus.includes(item.id)"
                  class="space-y-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-3">
                  <li v-for="subItem in getAccessibleSubItems(item)" :key="subItem.path">
                    <router-link :to="subItem.path" :class="[
                      'nav-item flex items-center space-x-3 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm',
                      { active: route?.path === subItem.path }
                    ]" :title="subItem.name" @click="handleNavigation">
                      <i :class="[subItem.icon, 'w-4 text-center']"></i>
                      <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text">
                        {{ subItem.name }}
                      </span>
                    </router-link>
                  </li>
                </ul>
              </div>

              <!-- Regular item without subItems -->
              <router-link v-else-if="hasAccessToItem(item)" :to="item.route" :class="[
                'nav-item flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative',
                { active: isActive(item) },
                { 'justify-center': isCollapsed && windowWidth >= 768 }
              ]" :title="item.text" @click="handleNavigation">
                <i :class="[
                  item.icon,
                  'w-5 text-center',
                  isCollapsed && windowWidth >= 768 ? 'mx-auto' : ''
                ]"></i>

                <span v-if="!isCollapsed || windowWidth < 768" class="sidebar-text text-sm">
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
              { active: route?.path === subItem.path }
            ]" @click="handleNavigation">
              <i :class="[subItem.icon, 'w-4 text-center']"></i>
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
          id: 'units',
          text: 'Units',
          icon: 'fas fa-layer-group',
          route: '/units',
          exact: false,
          permission: '' 
        },
        {
          id: 'model-has-roles',
          text: 'Model Has Roles',
          icon: 'fas fa-layer-group',
          route: '/model-has-roles',
          exact: false,
          permission: '' 
        },
        {
          id: 'suppliers',
          text: 'Suppliers',
          icon: 'fas fa-layer-group',
          route: '/suppliers',
          exact: false,
          permission: '' 
        },
  {
    id: 'overview',
    text: 'dashboard',
    icon: 'fas fa-dashboard',
    route: '/dashboard',
    exact: true,
    permission: '' // Add permission requirement
  }, 

  // {
  //   id: 'my-account',
  //   text: 'My Account',
  //   icon: 'fas fa-database',
  //   route: '/my-account',
  //   exect: true,
  //   permission: ''
  // },

  // {
  //   id: 'my-account',
  //   text: 'Account',
  //   icon: 'fas fa-database',
  //   route: '/my-account',
  //   subItems: [
  //     { name: 'Manager Account', path: '/account', icon: 'fas fa-cog' },
  //     { name: 'Trash Account', path: '/account/trash', icon: 'fas fa-trash' },
  //   ]
  // }, 
  
  // {
  //   id: 'settings',
  //   text: 'settings',
  //   icon: 'fa-solid fa-gear',
  //   route: '/settings',
  //   permission: ''
  // }, 

  // {
  //   id: 'users',
  //   text: 'Users',
  //   icon: 'fas fa-users',
  //   route: '/users',
  //   permission: ''
  // },

  // {
  //   id: 'roles',
  //   text: 'Roles',
  //   icon: 'fas fa-user-tag',
  //   route: '/roles',
  //   permission: ''
  // },

  // {
  //   id: 'permissions',
  //   text: 'Permissions',
  //   icon: 'fas fa-lock',
  //   route: '/permissions',
  //   permission: ''
  // },

  // Reports with subItems
  // {
  //   id: 'reports',
  //   text: 'Reports',
  //   icon: 'fas fa-chart-bar',
  //   route: '/reports',
  //   permission: '', // Parent permission
  //   subItems: [
  //     // {
  //     //   name: 'General Ledger',
  //     //   path: '/general-ledgers',
  //     //   icon: 'fa-solid fa-money-bill-transfer',
  //     //   permission: 'general_ledger_report.view'
  //     // },
     
  //   ]
  // }
]);

/* ================= Computed Properties ================= */
const isCollapsed = computed(() => sidebarStore.isCollapsed);
const isMobileOpen = computed(() => sidebarStore.isMobileOpen);

// Filter navigation items based on permissions
const filteredNavigationItems = computed(() => {
  return navigationItems.value.filter(item => hasAccessToItem(item));
});

/* ================= Permission Check Functions ================= */
const hasAccessToItem = (item) => {
  // If no permission required, show item
  if (!item.permission) return true;

  // Check permission using auth store
  return authStore.can(item.permission);
};

const hasAccessToSubItems = (parentItem) => {
  // Check if any subitem is accessible
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
  if (!route?.path) return false;
  if (item.exact) {
    return route.path === item.route;
  }
  return route.path.startsWith(item.route);
};

const isSubItemActive = (parentItem) => {
  if (!route?.path || !parentItem.subItems) return false;

  return parentItem.subItems.some(subItem =>
    route.path === subItem.path || route.path.startsWith(subItem.path)
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
  hoveredItemId.value = null;
  isHoveringSubmenu.value = false;
};

const handleHoverEnter = (item) => {
  if (!isCollapsed.value || windowWidth.value < 768) return;

  clearTimeout(hoverTimeout.value);
  hoverTimeout.value = setTimeout(() => {
    hoveredItemId.value = item.id;
  }, 150);
};

const handleHoverLeave = (item) => {
  if (!isCollapsed.value || windowWidth.value < 768) return;

  clearTimeout(hoverTimeout.value);
  hoverTimeout.value = setTimeout(() => {
    if (!isHoveringSubmenu.value) {
      hoveredItemId.value = null;
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
    hoveredItemId.value = null;
  }, 200);
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 768) {
    sidebarStore.isMobileOpen = false;
  }
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

/* Scrollbar styling */
.sidebar-overly {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.sidebar-overly::-webkit-scrollbar {
  width: 4px;
}

.sidebar-overly::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.sidebar-overly::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 20px;
}

.dark .sidebar-overly::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark .sidebar-overly::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
