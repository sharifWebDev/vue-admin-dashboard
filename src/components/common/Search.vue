<template>
    <div class="relative w-full max-w-md">
        <!-- Search Input -->
        <input v-model="searchQuery" @input="handleSearchInput" type="search"
            :placeholder="searchPlaceholder || 'Search...'"
            class="w-full pl-10 pr-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 outline-none transition-all duration-200 text-sm" />

        <!-- Search Icon -->
        <div class="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none">
             <Search class="w-4 h-4" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

// Props definition
defineProps({
    searchPlaceholder: {
        type: String,
        default: ''
    }
})

// Emit definition to send search query to parent component
const emit = defineEmits(['search'])

const searchQuery = ref('')

// Handle input changes and emit the value
const handleSearchInput = () => {
    emit('search', searchQuery.value)
}
</script>