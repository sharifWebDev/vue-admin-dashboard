<!-- components/common/StatusBadge.vue -->
<template>
    <span :class="[
        getStatusClasses(),
        'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1.5'
    ]">
        <span v-if="showDot" class="inline-block h-1.5 w-1.5 rounded-full" :class="getDotClasses()"></span>
        {{ displayText }}
    </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    // Value
    value: {
        type: [Boolean, Number, String],
        default: false
    },

    // Labels
    activeLabel: {
        type: String,
        default: 'Active'
    },
    inactiveLabel: {
        type: String,
        default: 'Inactive'
    },

    // Custom labels for different statuses
    customLabels: {
        type: Object,
        default: () => ({})
    },

    // Colors
    activeColor: {
        type: String,
        default: 'green'
    },
    inactiveColor: {
        type: String,
        default: 'red'
    },

    // Custom colors for different statuses
    customColors: {
        type: Object,
        default: () => ({})
    },

    // Show dot
    showDot: {
        type: Boolean,
        default: true
    },

    // Size
    size: {
        type: String,
        default: 'md', // sm, md, lg
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },

    // Rounded
    rounded: {
        type: String,
        default: 'full', // full, md, lg
        validator: (value) => ['full', 'md', 'lg'].includes(value)
    }
})

// ============ Computed ============
const isActive = computed(() => {
    return props.value === true || props.value === 1 || props.value === '1' || props.value === 'active'
})

const displayText = computed(() => {
    // Check for custom labels
    const key = String(props.value)
    if (props.customLabels && props.customLabels[key]) {
        return props.customLabels[key]
    }

    // Check for boolean/active status
    if (isActive.value) {
        return props.activeLabel
    }
    return props.inactiveLabel
})

const statusColor = computed(() => {
    const key = String(props.value)

    // Check for custom colors
    if (props.customColors && props.customColors[key]) {
        return props.customColors[key]
    }

    // Return based on active/inactive
    return isActive.value ? props.activeColor : props.inactiveColor
})

// ============ Methods ============
const getStatusClasses = () => {
    const color = statusColor.value
    const size = getSizeClasses()
    const rounded = getRoundedClasses()

    // Color classes
    const colorClasses = {
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
        lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    }

    return `${colorClasses[color] || colorClasses.gray} ${size} ${rounded}`
}

const getDotClasses = () => {
    const color = statusColor.value

    const dotColors = {
        green: 'bg-green-500 dark:bg-green-400',
        red: 'bg-red-500 dark:bg-red-400',
        blue: 'bg-blue-500 dark:bg-blue-400',
        yellow: 'bg-yellow-500 dark:bg-yellow-400',
        purple: 'bg-purple-500 dark:bg-purple-400',
        pink: 'bg-pink-500 dark:bg-pink-400',
        indigo: 'bg-indigo-500 dark:bg-indigo-400',
        gray: 'bg-gray-500 dark:bg-gray-400',
        orange: 'bg-orange-500 dark:bg-orange-400',
        teal: 'bg-teal-500 dark:bg-teal-400',
        cyan: 'bg-cyan-500 dark:bg-cyan-400',
        lime: 'bg-lime-500 dark:bg-lime-400',
        emerald: 'bg-emerald-500 dark:bg-emerald-400'
    }

    return dotColors[color] || dotColors.gray
}

const getSizeClasses = () => {
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    }
    return sizes[props.size] || sizes.md
}

const getRoundedClasses = () => {
    const rounded = {
        full: 'rounded-full',
        md: 'rounded-md',
        lg: 'rounded-lg'
    }
    return rounded[props.rounded] || rounded.full
}
</script>

<!-- 

<StatusBadge :value="true" />
<StatusBadge :value="true" active-label="Published" inactive-label="Draft" />
<StatusBadge :value="true" size="sm" />
<StatusBadge :value="true" size="md" />
<StatusBadge :value="true" size="lg" />
<StatusBadge :value="data.is_active" active-label="Active" inactive-label="Inactive" active-color="green"
    inactive-color="red" :show-dot="true" />

-->