<!-- components/common/ActiveFilterBar.vue -->
<template>
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pb-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Active Filters:</span>

        <!-- Dynamic Filter Badges -->
        <span v-for="badge in activeBadges" :key="badge.key"
            class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
            :class="badge.class || 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'">
            <span class="font-medium">{{ badge.label }}:</span>
            <span>{{ badge.value }}</span>
            <button @click="$emit('remove-filter', badge.key)" class="ml-1 hover:opacity-70 transition-opacity">
                <i class="fas fa-times text-xs"></i>
            </button>
        </span>

        <!-- Search Badge -->
        <span v-if="searchQuery"
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
            <span class="font-medium">Search:</span>
            <span>"{{ searchQuery }}"</span>
            <button @click="$emit('clear-search')" class="ml-1 hover:opacity-70 transition-opacity">
                <i class="fas fa-times text-xs"></i>
            </button>
        </span>

        <!-- Clear All -->
        <button @click="$emit('clear-all')"
            class="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium ml-2">
            Clear All
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    /**
     * Filters object — { product_id: 1, status: 'active', ... }
     */
    filters: {
        type: Object,
        default: () => ({})
    },

    /**
     * Search query string
     */
    searchQuery: {
        type: String,
        default: ''
    },

    /**
     * Badge configuration — array of objects:
     * [
     *   {
     *     key: 'product_id',              // filter key
     *     label: 'Product',               // badge label
     *     class: 'bg-blue-100 ...',       // (optional) custom color
     *     format: (value) => 'My Name'    // (optional) value formatter
     *   }
     * ]
     */
    badges: {
        type: Array,
        default: () => []
    }
})

defineEmits(['remove-filter', 'clear-search', 'clear-all'])

/**
 * Build active badge list based on filters + badge config
 */
const activeBadges = computed(() => {
    return props.badges
        .filter(badge => {
            const value = props.filters?.[badge.key]
            return value !== '' && value !== null && value !== undefined
        })
        .map(badge => {
            const rawValue = props.filters[badge.key]
            const displayValue = badge.format
                ? badge.format(rawValue)
                : rawValue

            return {
                key: badge.key,
                label: badge.label,
                value: displayValue,
                class: badge.class
            }
        })
})

/**
 * Show the whole bar only if any filter or search is active
 */
const hasActiveFilters = computed(() => {
    const hasFilterValues = Object.values(props.filters || {}).some(
        v => v !== '' && v !== null && v !== undefined
    )
    return hasFilterValues || props.searchQuery !== ''
})
</script>

<!-- usages -->
<!--
<ActiveFilterBar
  :filters="filters"
  :search-query="searchQuery"
  :badges="activeFilterBadges"
  @remove-filter="removeFilter"
  @clear-search="clearSearch"
  @clear-all="removeAllFilters"
/>

-->
<!-- bottom script -->
// Badge configuration — fully declarative
<!-- const activeFilterBadges = [
{
key: 'product_id',
label: 'Product',
class: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
format: (value) => getProductName(value)
},
// Add more filters here as you add them:
// {
// key: 'status',
// label: 'Status',
// class: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
// format: (value) => value.charAt(0).toUpperCase() + value.slice(1)
// }
]; -->