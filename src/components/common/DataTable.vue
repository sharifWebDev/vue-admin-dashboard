<!-- components/common/DataTable.vue -->
<template>
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-visible">
        <div class="overflow-x-auto min-h-[150px]">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                <!-- Table Header -->
                <slot name="header" />

                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    <!-- Loading State -->
                    <slot name="loading" />

                    <!-- Empty State -->
                    <slot name="empty" />

                    <!-- Data Rows -->
                    <slot name="rows" />
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <slot name="pagination" />
    </div>
</template>

<script setup>
// Pure presentation component - no logic needed
</script>