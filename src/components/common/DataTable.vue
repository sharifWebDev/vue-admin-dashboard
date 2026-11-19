<!-- components/common/DataTable.vue -->
<template>
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="min-h-[120px] overflow-x-auto overscroll-x-contain sm:min-h-[150px]">
            <table class="relative min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
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