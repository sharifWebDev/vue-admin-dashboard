<!-- components/common/FilterBar.vue -->
<template>
    <!-- Combined into one line with flex-nowrap -->
    <div class="flex flex-nowrap items-center justify-between gap-3 w-full mb-3">

        <!-- Left Side Group -->
        <div class="flex items-center gap-3 flex-shrink-0">

            <Button v-if="showCreateButton" type="button" btn-type="create" :text="createButtonText || 'Create New'" 
              size="md" @click="handleCreate" v-permission="createPermission" />

            <!-- Left Side Custom Actions -->
            <slot name="left-actions" />
        </div>

        <!-- Right Side Group: ml-auto pushes it completely to the right -->
        <div class="flex flex-nowrap items-center gap-3 ml-auto">

            <!-- Right Side Custom Actions -->
            <div class="flex items-center gap-3 flex-nowrap">
                <slot name="right-actions" />
            </div>

            <!-- Search Input -->
            <div v-if="showSearch" class="relative min-w-[200px] max-w-xs flex-shrink-0">
                <input v-model="searchQuery" @input="handleSearchInput" type="search"
                    :placeholder="searchPlaceholder || 'Search...'"
                    class="w-full pl-10 pr-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 outline-none transition-all duration-200 text-sm" />
                
                <div class="absolute left-3.5 top-2 text-gray-400 dark:text-gray-500 pointer-events-none">
                    <i class="fas fa-search text-sm"></i>
                </div>
                <!-- <Search v-model="searchQuery" :placeholder="searchPlaceholder" @update:modelValue="handleSearchInput" /> -->
            </div>

            <Button v-if="showRefresh" type="button" class="py-3" :text="false" btn-type="refresh" :disabled="refreshing"
                variant="outline" size="md" @click="handleRefresh" :loading="refreshing" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from '@/components/common/Button.vue'
import { RefreshCcw } from 'lucide-vue-next'
// import Search from './Search.vue'

const props = defineProps({
    // Create Button
    showCreateButton: {
        type: Boolean,
        default: false
    },
    createButtonText: {
        type: String,
        default: 'Create New'
    },
    createPermission: {
        type: [String, Array],
        default: ''
    },

    // Search
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

    // Refresh
    showRefresh: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'create',
    'search',
    'refresh',
    'update:searchValue'
])

// ============ State ============
const searchQuery = ref(props.searchValue)
const refreshing = ref(false)
let searchTimeout = null

// ============ Methods ============
const handleCreate = () => {
    emit('create')
}

const handleSearchInput = () => {
    emit('update:searchValue', searchQuery.value)

    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
        emit('search', searchQuery.value)
    }, props.searchDebounce)
}

const clearSearch = () => {
    searchQuery.value = ''
    emit('update:searchValue', '')
    emit('search', '')
}

const handleRefresh = async () => {
    refreshing.value = true
    await emit('refresh')
    refreshing.value = false
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
    clearSearch,
    refresh: handleRefresh
})
</script>

<!-- 
 <FilterBar 
      ref="filterBarRef"
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
      <template #left-actions> 
        <button 
          @click="exportData" 
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <i class="fas fa-file-export"></i>
          <span>Export</span>
        </button>
      </template>
 
      <template #right-actions>
        <button @click="printData"
            class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
            title="Print">
            <i class="fas fa-print"></i>
        </button>
    </template>
    </FilterBar>

-->