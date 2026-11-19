<!-- components/common/TableCell.vue -->
<template>
    <td :class="[paddingClass, {
        'whitespace-nowrap': nowrap,
        'text-right': align === 'right',
        'text-left': align === 'left',
        'text-center': align === 'center',
        'font-medium': bold,
        'text-[13px]': small,
        'text-gray-500 dark:text-gray-400': muted
    }]">
        <slot />
    </td>
</template>

<script setup>
defineProps({
    paddingClass: { type: String, default: 'px-6 py-4' },
    nowrap: { type: Boolean, default: false },
    align: { type: String, default: 'left' },
    bold: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    muted: { type: Boolean, default: false }
})
</script>