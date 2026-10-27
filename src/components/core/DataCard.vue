<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-md font-semibold text-gray-700 dark:text-white">{{ title }}</h2>
            <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        </div>
        <div class="px-6 py-3">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    subtitle: String
});
</script>
