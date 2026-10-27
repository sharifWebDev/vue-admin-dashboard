<template>
    <div class="relative w-full">
        <div
            :class="['flex items-start', layout === 'vertical' && !multiple ? 'flex-col space-y-2' : 'flex-wrap gap-4']">
            <!-- Single Checkbox -->
            <label v-if="!multiple"
                :class="['flex items-center cursor-pointer', disabled ? 'opacity-50 cursor-not-allowed' : '']">
                <input type="checkbox" v-model="checkedValue" :disabled="disabled" :indeterminate="indeterminate"
                    :class="checkboxClass" @change="handleChange" />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ label }}
                </span>
            </label>

            <!-- Multiple Checkboxes -->
            <div v-else class="space-y-2">
                <label v-for="option in options" :key="option[valueKey]"
                    :class="['flex items-center cursor-pointer', disabled ? 'opacity-50 cursor-not-allowed' : '']">
                    <input type="checkbox" :value="option[valueKey]" v-model="selectedValues"
                        :disabled="disabled || option.disabled" :class="checkboxClass" @change="handleMultipleChange" />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {{ option[labelKey] }}
                    </span>

                    <!-- Optional Description -->
                    <p v-if="option.description" class="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-0">
                        {{ option.description }}
                    </p>
                </label>
            </div>
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !hasError" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ helperText }}
        </p>

        <!-- Error Message -->
        <p v-if="hasError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
    modelValue: [Boolean, Array],
    label: String,
    multiple: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    valueKey: { type: String, default: 'value' },
    labelKey: { type: String, default: 'label' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    indeterminate: { type: Boolean, default: false },
    layout: { type: String, default: 'vertical' } // vertical, horizontal
})

const emit = defineEmits(['update:modelValue', 'change'])

const checkedValue = computed({
    get: () => props.modelValue,
    set: (val) => {
        emit('update:modelValue', val)
        emit('change', val)
    }
})

const selectedValues = computed({
    get: () => {
        // Ensure we always return an array
        const value = props.modelValue
        if (Array.isArray(value)) return value
        if (value === null || value === undefined) return []
        return [value]
    },
    set: (val) => {
        emit('update:modelValue', val)
        emit('change', val)
    }
})

const hasError = computed(() => {
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

const checkboxClass = computed(() => {
    const baseClasses = 'focus:ring-2 focus:ring-opacity-50 rounded transition-all duration-200'
    return `${baseClasses} h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700`
})

const handleChange = (event) => {
    // The change is already handled by v-model, but we emit for additional logic
    emit('change', event.target.checked)
}

const handleMultipleChange = () => {
    // The change is already handled by v-model
    emit('change', selectedValues.value)
}

// Watch for indeterminate state
watch(() => props.indeterminate, (newVal) => {
    // This will be handled by the parent component
}, { immediate: true })
</script>

<style scoped>
/* Custom checkbox styling */
input[type="checkbox"] {
    accent-color: #3b82f6;
    cursor: pointer;
}

/* Hover effect */
label:hover input[type="checkbox"]:not(:disabled) {
    transform: scale(1.05);
}

/* Focus ring */
input[type="checkbox"]:focus {
    outline: none;
    ring: 2px solid #3b82f6;
}

/* Disabled state */
input[type="checkbox"]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Transition for smooth changes */
input[type="checkbox"] {
    transition: all 0.2s ease;
}

/* Custom checkmark for better visibility */
input[type="checkbox"]:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    input[type="checkbox"] {
        background-color: #374151;
        border-color: #4b5563;
    }

    input[type="checkbox"]:checked {
        background-color: #3b82f6;
        border-color: #3b82f6;
    }
}
</style>

<!-- 

<template>
  <CheckboxInput 
    v-model="form.terms" 
    label="I agree to the terms and conditions" 
    required
    @change="handleTermsChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import CheckboxInput from '@/components/common/CheckboxInput.vue'

const form = ref({
  terms: false
})

const handleTermsChange = (checked) => {
  console.log('Terms accepted:', checked)
}
</script>-->