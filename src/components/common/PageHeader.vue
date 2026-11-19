<!-- components/common/PageHeader.vue -->
<template>
  <div class="mb-0 w-full min-w-0">
    <!-- Main Header Section -->
    <div class="flex min-w-0 flex-col items-start justify-between gap-0 sm:gap-4 lg:flex-row lg:items-center">
      <!-- Left Side: Title and Description -->
      <div class="w-full min-w-0 flex-1 lg:w-auto">
        <div class="flex min-w-0 items-center gap-2">
          <!-- Icon -->
          <div v-if="icon" class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
            :class="iconBgClass || 'bg-gray-100 dark:bg-gray-700'">
            <i :class="`fas fa-${icon} ${iconColorClass || 'text-gray-600 dark:text-gray-300'}`"></i>
          </div>

          <!-- Title -->
          <h1 class="min-w-0 truncate text-base font-semibold text-gray-800 dark:text-white sm:text-lg"
            :class="titleClass">
            {{ title }}
          </h1>

          <!-- Badge -->
          <span v-if="badge"
            class="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-xs">
            {{ badge }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="description" class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm"
          :class="icon ? 'ml-10 sm:ml-11' : 'ml-0'">
          {{ description }}
        </p>
      </div>

      <!-- Right Side: Actions and Breadcrumb -->
      <div class="flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto">
        <!-- Actions Slot -->
        <div v-if="$slots.actions" class="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <slot name="actions" />
        </div>

        <!-- Breadcrumb -->
        <Breadcrumb v-if="showBreadcrumb" class="max-w-full flex-shrink-0 self-start sm:self-center" />
      </div>
    </div>

    <!-- Filter Section -->
    <div v-if="$slots.filters || showFilters" :class="($slots.filters || showFilters) ? 'mt-1 md:mt-2 min-w-0 sm:mt-4' : 'mt-0'">
      <div class="flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <!-- Create Button -->
        <Button v-if="showCreateButton" :text="createButtonText || 'Create New'" icon="plus" variant="primary" size="md"
          class="w-full sm:w-auto" :custom-class="createButtonClass" @click="handleCreate" v-permission="createPermission" />

        <!-- Filters Slot -->
        <div class="flex w-full min-w-0 flex-1 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <slot name="filters" />
        </div>

        <!-- Search and Refresh -->
        <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <!-- Search Input -->
          <div v-if="showSearch" class="relative min-w-0 flex-1 sm:w-48 sm:flex-initial md:w-64">
            <input :value="searchValue" @input="handleSearchInput" type="search"
              :placeholder="searchPlaceholder || 'Search...'"
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <i class="fas fa-search pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
          </div>

          <!-- Refresh Button -->
          <Button v-if="showRefresh" :icon="'refresh'" variant="outline" size="sm" :loading="refreshing"
            :disabled="refreshing" custom-class="p-2 !px-2 !py-2" title="Refresh Data" @click="handleRefresh" />

          <!-- Extra Actions Slot -->
          <slot name="extra-actions" />
        </div>
      </div>
    </div>

    <!-- Extra Content Slot -->
    <slot name="extra" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  // ============ Title & Description ============
  title: {
    type: String,
    required: true,
    description: 'Page title'
  },
  description: {
    type: String,
    default: '',
    description: 'Page description/subtitle'
  },
  titleClass: {
    type: String,
    default: '',
    description: 'Additional CSS classes for title'
  },

  // ============ Icon ============
  icon: {
    type: String,
    default: '',
    description: 'Font Awesome icon name (e.g., "box", "users")'
  },
  iconBgClass: {
    type: String,
    default: 'bg-gray-100 dark:bg-gray-700'
  },
  iconColorClass: {
    type: String,
    default: 'text-gray-600 dark:text-gray-300'
  },

  // ============ Badge ============
  badge: {
    type: String,
    default: '',
    description: 'Badge text (e.g., "12 items", "New")'
  },

  // ============ Breadcrumb ============
  showBreadcrumb: {
    type: Boolean,
    default: true
  },

  // ============ Create Button ============
  showCreateButton: {
    type: Boolean,
    default: false
  },
  createButtonText: {
    type: String,
    default: 'Create New'
  },
  createButtonClass: {
    type: String,
    default: ''
  },
  createPermission: {
    type: String,
    default: ''
  },
  createVariant: {
    type: String,
    default: 'primary'
  },
  createIcon: {
    type: [String, Boolean],
    default: 'plus'
  },

  // ============ Search ============
  showSearch: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  searchValue: {
    type: String,
    default: ''
  },
  searchDebounce: {
    type: Number,
    default: 300
  },

  // ============ Refresh ============
  showRefresh: {
    type: Boolean,
    default: false
  },

  // ============ Filters ============
  showFilters: {
    type: Boolean,
    default: true
  },

  // ============ Loading ============
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'create',
  'search',
  'refresh',
  'update:searchValue',
  'filter'
])

// ============ State ============
const searchQuery = ref(props.searchValue)
const refreshing = ref(false)
let searchTimeout = null

// ============ Computed ============
const hasFilters = computed(() => {
  return !!props.$slots?.filters || props.showFilters
})

// ============ Methods ============
const handleCreate = () => {
  emit('create')
}

const handleSearchInput = (event) => {
  const value = event.target.value
  searchQuery.value = value
  emit('update:searchValue', value)

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('search', value)
  }, props.searchDebounce)
}

const handleRefresh = async () => {
  refreshing.value = true
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('update:searchValue', '')
  emit('search', '')
}

// ============ Watchers ============
watch(() => props.searchValue, (newVal) => {
  if (newVal !== searchQuery.value) {
    searchQuery.value = newVal
  }
})

// ============ Expose ============
defineExpose({
  searchQuery,
  refreshing,
  refresh: handleRefresh,
  clearSearch,
  search: (query) => {
    searchQuery.value = query
    emit('update:searchValue', query)
    emit('search', query)
  }
})
</script>

<!-- 
<PageHeader 
    title="Product Variants"
    description="Manage your product variants and their details"
    icon="cube"
  />

 
  2. ক্রিয়েট বাটন সহ
vue
<template>
  <PageHeader 
    title="Product Variants"
    description="Manage your product variants"
    icon="cube"
    :show-create-button="true"
    create-button-text="Add Variant"
    create-permission="product_variants.create"
    @create="openCreateModal"
  />
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue'

const openCreateModal = () => {
  console.log('Open create modal')
}
</script>
3. সার্চ এবং রিফ্রেশ সহ
vue
<template>
  <PageHeader 
    title="Product Variants"
    description="Manage your product variants"
    icon="cube"
    badge="12 items"
    :show-search="true"
    search-placeholder="Search by name or SKU..."
    :show-refresh="true"
    @search="handleSearch"
    @refresh="refreshData"
  />
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'

const searchQuery = ref('')

const handleSearch = (query) => {
  searchQuery.value = query
  console.log('Search:', query)
}

const refreshData = () => {
  console.log('Refreshing data')
}
</script>
4. ফিল্টার সহ (আপনার Product Variants পেজ)
vue
<template>
  <PageHeader 
    title="Product Variants"
    description="Manage your product variants and their details"
    icon="cube"
    :show-create-button="true"
    create-button-text="Create New"
    create-permission="product_variants.create"
    :show-search="true"
    search-placeholder="Search by name, SKU, or barcode..."
    :show-refresh="true"
    @create="openCreateModal"
    @search="handleSearch"
    @refresh="refreshData"
  >
    
    <template #filters>
      <div class="relative min-w-[200px]">
        <GlobalDropdown 
          v-model="selectedProductId" 
          :label="false" 
          store-name="productStore"
          placeholder="All Products" 
          value-key="id" 
          label-key="name" 
          :fetch-on-mount="true"
          @select="handleProductFilter"
        />
      </div>
      
      <div class="relative min-w-[150px]">
        <select 
          v-model="selectedStatus"
          class="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none appearance-none text-sm"
          @change="handleStatusFilter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
          <i class="fas fa-chevron-down text-xs"></i>
        </div>
      </div>
    </template>

 
<template #extra-actions>
      <button 
        @click="exportData" 
        class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
        title="Export Data"
      >
        <i class="fas fa-file-export text-sm"></i>
      </button>
    </template>
 
<template #extra>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
        <span>Showing {{ totalItems }} items</span>
        <span v-if="lastUpdated" class="text-gray-400">
          Last updated: {{ lastUpdated }}
        </span>
      </div>
    </template>
</PageHeader>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import GlobalDropdown from '@/components/common/GlobalDropdown.vue'

const selectedProductId = ref(null)
const selectedStatus = ref('')
const totalItems = ref(25)
const lastUpdated = ref(new Date().toLocaleString())

const openCreateModal = () => {
  console.log('Open create modal')
}

const handleSearch = (query) => {
  console.log('Search:', query)
}

const refreshData = () => {
  console.log('Refreshing data')
  lastUpdated.value = new Date().toLocaleString()
}

const handleProductFilter = ({ value }) => {
  console.log('Product filter:', value)
  emit('filter', { type: 'product', value })
}

const handleStatusFilter = () => {
  console.log('Status filter:', selectedStatus.value)
  emit('filter', { type: 'status', value: selectedStatus.value })
}

const exportData = () => {
  console.log('Exporting data')
}
</script>
5. অ্যাকশন স্লট সহ (কাস্টম বাটন)
vue
<template>
  <PageHeader 
    title="Orders"
    description="Manage customer orders"
    icon="shopping-cart"
    :show-create-button="true"
    create-button-text="Create Order"
  > 
    <template #actions>
      <button 
        @click="printReport"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <i class="fas fa-print"></i>
        <span>Print</span>
      </button>
      
      <button 
        @click="exportReport"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <i class="fas fa-download"></i>
        <span>Export</span>
      </button>
    </template>
 
<template #filters>
      <div class="relative min-w-[200px]">
        <GlobalDropdown 
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Order Status"
          value-key="value"
          label-key="label"
        />
      </div>
    </template>
</PageHeader>
</template> 

<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import GlobalDropdown from '@/components/common/GlobalDropdown.vue'

const selectedStatus = ref(null)
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const printReport = () => {
  console.log('Print report')
}

const exportReport = () => {
  console.log('Export report')
}
</script>
6. রেফ ব্যবহার করে প্রোগ্রামেটিক কন্ট্রোল
vue
<template>
    <PageHeader ref="pageHeaderRef" title="Product Variants" icon="cube" :show-search="true" :show-refresh="true"
        @search="handleSearch" @refresh="refreshData" />

    <button @click="clearSearchFromOutside" class="mt-4">
        Clear Search
    </button>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'

const pageHeaderRef = ref(null)

const clearSearchFromOutside = () => {
  if (pageHeaderRef.value) {
    pageHeaderRef.value.clearSearch()
  }
}

const handleSearch = (query) => {
  console.log('Search:', query)
}

const refreshData = () => {
  console.log('Refreshing data')
}
</script>
-->