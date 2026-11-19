<template>
    <div class="flex items-center justify-between p-4 rounded-2xl 
           bg-white dark:bg-gray-800 
           hover:border-indigo-300 dark:hover:border-gray-700 
           transition-all duration-300 
           border border-gray-200 dark:border-gray-700">
        <!-- Left Side -->
        <div class="flex items-center gap-3">
            <!-- Icon Box -->
            <div class="flex items-center gap-1 px-2 py-1 rounded-xl 
               bg-green-100 dark:bg-green-900">
                <span class="text-xs font-bold text-green-700 dark:text-green-300">
                    ৳
                </span>
            </div>

            <!-- Label -->
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ label }}
            </span>
        </div>

        <!-- Right Side -->
        <div v-if="loading" class="h-6 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
        <span v-else class="text-lg font-bold text-gray-800 dark:text-white" :class="valueClass">
            {{ value }}
        </span>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    label: {
        type: String,
        default: "Revenue"
    },
    value: {
        type: [Number, String],
        default: 0
    },
    valueClass: {
        type: String,
        default: ""
    },
    loading: {
        type: Boolean,
        default: false
    }
});

</script>