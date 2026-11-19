<template>
    <div :class="['bg-white dark:bg-gray-800 rounded-lg px-4 py-4 border', borderColorClass]">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">{{ title }}</p>
                <div v-if="loading" class="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mt-1"></div>
                <p v-else class="text-xl font-bold text-gray-900 dark:text-white mt-1">{{ value }}</p>
            </div>
            <div :class="['p-3 rounded-lg', bgColorClass]">
                <component v-if="typeof icon !== 'string'" :is="icon" :class="[iconColorClass, 'w-6 h-6']" />
                <i v-else :class="[icon, iconColorClass, 'text-xl']"></i>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: String,
    value: [String, Number],
    icon: [String, Object, Function],
    color: {
        type: String,
        default: 'blue'
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const colorMap = {
    blue: {
        border: 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400'
    },
    green: {
        border: 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400'
    },
    purple: {
        border: 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400'
    },
    orange: {
        border: 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400'
    }
};

const borderColorClass = computed(() => colorMap[props.color]?.border || colorMap.blue.border);
const bgColorClass = computed(() => colorMap[props.color]?.bg || colorMap.blue.bg);
const iconColorClass = computed(() => colorMap[props.color]?.icon || colorMap.blue.icon);
</script>
