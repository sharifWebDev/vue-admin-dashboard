<!-- components/common/GlobalFormSection.vue -->
<template>
    <div class="mb-6">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ title }}
        </h3>
        <div :class="gridClass">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: { type: String, default: '' },
    columns: { type: Number, default: 2 },
    responsive: { type: Boolean, default: true }
})

const gridClass = computed(() => {
    if (props.responsive) {
        return `grid grid-cols-1 md:grid-cols-${props.columns} gap-4`
    }
    return `grid grid-cols-${props.columns} gap-4`
})
</script>