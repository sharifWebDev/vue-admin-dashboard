<!-- components/common/FilterBar.vue -->
<template>
    <div class="mb-2 md:mb-3 flex w-full flex-col gap-2 md:gap-3 sm:flex-row sm:items-center sm:justify-between">

        <!-- Left Side Group -->
        <div v-if="showCreateButton || $slots['left-actions']"
            class="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-shrink-0 sm:gap-3">

            <Button v-if="showCreateButton" type="button" btn-type="create" :text="createButtonText || 'Create New'" 
              size="md" @click="handleCreate" v-permission="createPermission" />

            <!-- Left Side Custom Actions -->
            <slot name="left-actions" />
        </div>

        <!-- Right Side Group: ml-auto pushes it completely to the right -->
        <div v-if="showSearch || showRefresh || $slots['right-actions']"
            class="ml-auto flex w-full min-w-0 items-center gap-2 sm:w-auto sm:gap-3">

            <!-- Right Side Custom Actions -->
            <div v-if="$slots['right-actions']" class="flex min-w-0 items-center gap-2 sm:gap-3">
                <slot name="right-actions" />
            </div>

            <!-- Search Input -->
            <Search v-if="showSearch" v-model="searchQuery" :search-placeholder="searchPlaceholder"
                class="relative min-w-0 flex-1 sm:w-auto sm:min-w-[200px] sm:max-w-xs sm:flex-shrink-0"
                @search="handleSearchInput" />

            <Button v-if="showRefresh" type="button" class="shrink-0 py-3 sm:py-3" :text="false" btn-type="refresh" :disabled="refreshing"
                variant="outline" size="md" @click="handleRefresh" :loading="refreshing" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from '@/components/common/Button.vue'
import Search from '@/components/common/Search.vue'

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

const handleSearchInput = (query) => {
    searchQuery.value = query
    emit('update:searchValue', query)

    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
        emit('search', query)
        searchTimeout = null
    }, props.searchDebounce)
}

const clearSearch = () => {
    searchQuery.value = ''
    emit('update:searchValue', '')
    emit('search', '')
}

const handleRefresh = async () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

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