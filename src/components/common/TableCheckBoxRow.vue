<template>
    <input
        ref="checkboxRef"
        type="checkbox"
        :checked="isChecked"
        :disabled="isDisabled"
        :aria-label="selectAll ? 'Select all rows' : `Select row ${rowId}`"
        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700"
        @change="handleChange"
    />
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    rowId: {
        type: [String, Number],
        default: null
    },
    rowIds: {
        type: Array,
        default: () => []
    },
    selectAll: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const checkboxRef = ref(null)

const selectableIds = computed(() =>
    [...new Set(props.rowIds.filter(id => id !== null && id !== undefined))]
)

const isChecked = computed(() => {
    if (props.selectAll) {
        return selectableIds.value.length > 0 &&
            selectableIds.value.every(id => props.modelValue.includes(id))
    }

    return props.rowId !== null && props.rowId !== undefined &&
        props.modelValue.includes(props.rowId)
})

const isIndeterminate = computed(() =>
    props.selectAll &&
    selectableIds.value.some(id => props.modelValue.includes(id)) &&
    !isChecked.value
)

const isDisabled = computed(() =>
    props.selectAll
        ? selectableIds.value.length === 0
        : props.rowId === null || props.rowId === undefined
)

watchEffect(() => {
    if (checkboxRef.value) {
        checkboxRef.value.indeterminate = isIndeterminate.value
    }
})

const handleChange = (event) => {
    const selectedIds = new Set(props.modelValue)
    const checked = event.target.checked

    if (props.selectAll) {
        selectableIds.value.forEach(id => {
            if (checked) {
                selectedIds.add(id)
            } else {
                selectedIds.delete(id)
            }
        })
    } else if (props.rowId !== null && props.rowId !== undefined) {
        if (checked) {
            selectedIds.add(props.rowId)
        } else {
            selectedIds.delete(props.rowId)
        }
    }

    emit('update:modelValue', [...selectedIds])
}
</script>
