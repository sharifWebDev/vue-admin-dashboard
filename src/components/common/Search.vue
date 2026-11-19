<template>
    <div class="relative w-full min-w-0 max-w-full">
        <!-- Search Input -->
        <input v-model="searchQuery" @input="handleSearchInput" type="search"
            :placeholder="searchPlaceholder || 'Search...'"
            :aria-label="searchPlaceholder || 'Search'"
            class="block h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-600 sm:h-11 sm:pl-10 sm:text-sm" />

        <!-- Search Icon -->
        <div class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 sm:left-3.5">
             <Search class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'

// Props definition
const props = defineProps({
    searchPlaceholder: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    }
})

// Emit definition to send search query to parent component
const emit = defineEmits(['search', 'update:modelValue'])

const searchQuery = ref(props.modelValue)

// Handle input changes and emit the value
const handleSearchInput = () => {
    emit('update:modelValue', searchQuery.value)
    emit('search', searchQuery.value)
}

watch(() => props.modelValue, (value) => {
    if (value !== searchQuery.value) {
        searchQuery.value = value
    }
})
</script>