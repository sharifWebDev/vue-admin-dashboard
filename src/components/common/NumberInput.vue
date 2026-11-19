<!-- components/common/NumberInput.vue -->
<template>
    <div class="relative w-full ai-suggestion-wrapper">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative flex items-stretch group">
            <!-- Input Field -->
            <input type="number" :value="modelValue" :disabled="disabled" :readonly="readonly"
                :placeholder="placeholder" :min="min" :max="max" :step="step" :class="inputClass" @input="onInput"
                @blur="handleBlur" @focus="handleFocus" ref="inputRef" />

            <!-- AI Suggestion Component -->
            <AiSuggestion v-if="hasAiSuggestions" ref="aiSuggestionRef" component-type="number" :label="label"
                :value="modelValue" :required="required" :min="min" :max="max" :disabled="disabled" :readonly="readonly"
                :ai-suggestions="aiSuggestions" :ai-loading="aiLoading" :max-suggestions="5" tone="neutral"
                @apply="applyAISuggestion" @fetch="fetchAISuggestions" @toggle="onAIToggle"
                @update:suggestions="updateAISuggestions" />

            <!-- Stacked Controls -->
            <div v-if="!readonly && !disabled"
                class="hidden group-focus-within:flex absolute bg-transparent right-0 top-0 h-full flex flex-col w-6 rounded-r-lg border border-gray-300 dark:border-gray-600">
                <button type="button" @click="stepUp" :disabled="isMaxReached"
                    class="flex-1 flex items-center bg-transparent justify-center rounded-tr-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    tabindex="-1">
                    <svg class="w-3 h-3 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <button type="button" @click="stepDown" :disabled="isMinReached"
                    class="flex-1 flex items-center justify-center rounded-br-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    tabindex="-1">
                    <svg class="w-3 h-3 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Validation Messages -->
        <div class="mt-1 space-y-1">
            <p v-if="showError" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errorMessage }}
            </p>
            <p v-else-if="helperText && !showError" class="text-xs text-gray-500 dark:text-gray-400">
                {{ helperText }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount, inject, onMounted, useAttrs, normalizeClass } from 'vue'
import AiSuggestion from '@/components/common/AiSuggestion.vue'

const attrs = useAttrs()

const props = defineProps({
    modelValue: { type: [Number, String], default: null },
    label: String,
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    required: Boolean,
    error: [String, Array, Object],
    helperText: String,
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: null },
    // AI Props - Can be boolean true, array, or null
    aiSuggestions: {
        type: [Boolean, Array],
        default: null
    },
    aiLoading: {
        type: Boolean,
        default: false
    },
    validationRules: {
        type: Object,
        default: () => ({})
    },
    customValidator: { type: Function, default: null },
    validateOnBlur: { type: Boolean, default: true },
    validateOnInput: { type: Boolean, default: false }
})

const emit = defineEmits([
    'update:modelValue',
    'change',
    'blur',
    'focus',
    'ai-suggest'
])

const inputRef = ref(null)
const aiSuggestionRef = ref(null)
const internalError = ref(null)
const hasBeenTouched = ref(false)
const hasBeenFocused = ref(false)
const submitAttempted = ref(false)
const localAiSuggestions = ref([])

// Computed: Check if AI is enabled
const hasAiSuggestions = computed(() => {
    return props.aiSuggestions !== null && props.aiSuggestions !== undefined
})

// Get form validation from parent
const formValidation = inject('formValidation', null)

// Component reference for form registration
let componentRef = null

// Register with form
onMounted(() => {
    if (formValidation) {
        componentRef = {
            validate: (triggerSubmit = true) => {
                if (triggerSubmit) {
                    submitAttempted.value = true
                }
                const error = getValidationMessage(props.modelValue, triggerSubmit)
                internalError.value = error
                return !error
            },
            resetValidation: () => {
                internalError.value = null
                hasBeenTouched.value = false
                submitAttempted.value = false
            },
            get errorMessage() {
                return internalError.value
            },
            get internalError() {
                return internalError
            },
            $el: inputRef.value?.closest?.('.relative') || inputRef.value
        }

        formValidation.register(componentRef)
    }
})

// Unregister on unmount
onBeforeUnmount(() => {
    if (formValidation && componentRef) {
        formValidation.unregister(componentRef)
        componentRef = null
    }
})

/**
 * AI Methods
 */
const fetchAISuggestions = () => {
    // If aiSuggestions is boolean true, AI component handles auto-fetch
    // If aiSuggestions is array, parent provides data
    // Otherwise, emit event for parent to handle
    if (props.aiSuggestions === true) {
        // Auto-fetch is handled by AiSuggestion component
        return
    }
    // Emit event to parent for manual fetch
    emit('ai-suggest')
}

const applyAISuggestion = (value) => {
    updateValue(value)
}

const onAIToggle = (isOpen) => {
    // Handle AI dropdown toggle if needed
}

const updateAISuggestions = (suggestions) => {
    localAiSuggestions.value = suggestions
}

/**
 * Logic: Handle Floating Point Precision
 */
const getPrecision = (val) => {
    if (props.precision !== null) return props.precision
    const stepStr = props.step.toString()
    if (stepStr.includes('.')) return stepStr.split('.')[1].length
    return 0
}

const clampValue = (val) => {
    if (val === null || val === '') return null
    let num = parseFloat(val)
    if (isNaN(num)) return null

    const p = getPrecision(num)
    num = parseFloat(num.toFixed(p))

    return Math.min(props.max, Math.max(props.min, num))
}

/**
 * Frontend Validation
 */
const validateValue = (value, triggerSubmit = false) => {
    const errors = []
    const numValue = parseFloat(value)

    const shouldValidateRequired =
        triggerSubmit ||
        submitAttempted.value ||
        (hasBeenTouched.value && (hasBeenFocused.value || value === '' || value === null))

    if (props.required && shouldValidateRequired) {
        if (value === null || value === '' || value === undefined) {
            errors.push(`${props.label || 'This field'} is required`)
        }
    }

    if (value !== null && value !== '' && !isNaN(numValue)) {
        if (props.min !== -Infinity && numValue < props.min) {
            errors.push(`Value must be at least ${props.min}`)
        }

        if (props.max !== Infinity && numValue > props.max) {
            errors.push(`Value must be at most ${props.max}`)
        }

        if (props.step && props.step > 0 && !isNaN(numValue)) {
            const remainder = (numValue - (props.min !== -Infinity ? props.min : 0)) % props.step
            if (Math.abs(remainder) > 0.0001) {
                errors.push(`Value must be a multiple of ${props.step}`)
            }
        }

        if (props.validationRules) {
            Object.entries(props.validationRules).forEach(([rule, ruleValue]) => {
                switch (rule) {
                    case 'min':
                        if (numValue < ruleValue) {
                            errors.push(`Value must be at least ${ruleValue}`)
                        }
                        break
                    case 'max':
                        if (numValue > ruleValue) {
                            errors.push(`Value must be at most ${ruleValue}`)
                        }
                        break
                    case 'integer':
                        if (ruleValue && !Number.isInteger(numValue)) {
                            errors.push('Value must be an integer')
                        }
                        break
                    case 'positive':
                        if (ruleValue && numValue <= 0) {
                            errors.push('Value must be positive')
                        }
                        break
                    case 'even':
                        if (ruleValue && numValue % 2 !== 0) {
                            errors.push('Value must be even')
                        }
                        break
                }
            })
        }

        if (props.customValidator) {
            const customError = props.customValidator(numValue)
            if (customError) {
                errors.push(customError)
            }
        }
    }

    return errors
}

const getValidationMessage = (value, triggerSubmit = false) => {
    const errors = validateValue(value, triggerSubmit)
    if (errors.length > 0) {
        return errors[0]
    }
    return null
}

/**
 * Button Actions
 */
const stepUp = () => {
    const current = parseFloat(props.modelValue ?? 0)
    const newValue = current + props.step
    const formatted = clampValue(newValue)
    updateValue(formatted)
}

const stepDown = () => {
    const current = parseFloat(props.modelValue ?? 0)
    const newValue = current - props.step
    const formatted = clampValue(newValue)
    updateValue(formatted)
}

const onInput = (e) => {
    const val = e.target.value === '' ? null : e.target.value

    if (!hasBeenTouched.value) {
        hasBeenTouched.value = true
    }

    updateValue(val)

    if (props.validateOnInput) {
        internalError.value = getValidationMessage(val)
    }
}

const updateValue = (val) => {
    const formatted = clampValue(val)
    emit('update:modelValue', formatted)
    emit('change', formatted)

    if (formValidation && formValidation.validateForm) {
        nextTick(() => {
            formValidation.validateForm()
        })
    }
}

const handleFocus = (event) => {
    hasBeenFocused.value = true
    emit('focus', event)
}

const handleBlur = (event) => {
    hasBeenTouched.value = true
    hasBeenFocused.value = false

    if (props.validateOnBlur) {
        internalError.value = getValidationMessage(props.modelValue)
    }

    emit('blur', event)
}

/**
 * Public method to trigger validation
 */
const validate = (triggerSubmit = true) => {
    if (triggerSubmit) {
        submitAttempted.value = true
    }
    const error = getValidationMessage(props.modelValue, triggerSubmit)
    internalError.value = error
    return !error
}

// Expose validate method to parent
defineExpose({
    validate,
    resetValidation: () => {
        internalError.value = null
        hasBeenTouched.value = false
        hasBeenFocused.value = false
        submitAttempted.value = false
    },
    clearError: () => {
        internalError.value = null
    }
})

/**
 * Visual States
 */
const isMaxReached = computed(() => {
    if (props.modelValue === null || props.modelValue === '') return false
    return parseFloat(props.modelValue) >= props.max
})

const isMinReached = computed(() => {
    if (props.modelValue === null || props.modelValue === '') return false
    return parseFloat(props.modelValue) <= props.min
})

const showError = computed(() => {
    if (props.error) return true

    if (internalError.value) {
        if (props.required && internalError.value.includes('required')) {
            return submitAttempted.value || (hasBeenTouched.value && hasBeenFocused.value === false)
        }
        return submitAttempted.value || hasBeenTouched.value
    }

    return false
})

const errorMessage = computed(() => {
    if (props.error) {
        return Array.isArray(props.error) ? props.error[0] : props.error
    }
    return internalError.value
})

const inputClass = computed(() => {
    // Add padding for AI button only if AI is enabled
    const rightPadding = hasAiSuggestions.value ? 'pr-16' : 'pr-12'
    const customClasses = normalizeClass(attrs.class)
    const hasCustomVerticalPadding = customClasses
        .split(/\s+/)
        .some(className => /^!?p(y|t|b)?-/.test(className))

    return [
        'w-full pl-4 text-left border rounded-lg outline-none transition-all duration-200 sm:text-sm',
        hasCustomVerticalPadding ? '' : 'py-2.5',
        rightPadding,
        showError.value
            ? 'border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/20 dark:bg-blue-700 dark:text-white',
        props.disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'bg-white',
        props.readonly ? 'bg-gray-50 cursor-default' : '',
        customClasses
    ].join(' ')
})

// Watch for validation on model changes
watch(() => props.modelValue, (newVal) => {
    if (hasBeenTouched.value || submitAttempted.value) {
        if (!hasBeenTouched.value && !submitAttempted.value && newVal === null) {
            return
        }
        internalError.value = getValidationMessage(newVal)

        if (formValidation && formValidation.validateForm) {
            nextTick(() => {
                formValidation.validateForm()
            })
        }
    }
})
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance: textfield;
}
</style>

<!-- 
<NumberInput 
  v-model="form.quantity" 
  label="Quantity" 
  :min="1" 
  :max="99" 
/>

<NumberInput 
  v-model="form.price" 
  label="Price ($)" 
  :step="0.01" 
  :min="0"
  placeholder="0.00"
/>
<NumberInput 
  v-model="form.weight" 
  label="Weight (kg)" 
  :step="0.1" 
  :precision="3" 
/>
<NumberInput 
  v-model="form.stock" 
  label="Stock Level" 
  :error="errors.stock ? 'Stock cannot be negative' : null"
  required
/>

<NumberInput v-model="formData.quantity" label="Quantity" placeholder="Enter quantity"
    :error="productVariantStore.validationErrors?.quantity" @input="clearValidationError('quantity')" :required="true"
    :min="1" :max="1000" :step="1" helper-text="Enter quantity between 1 and 1000" />
 
<NumberInput v-model="formData.quantity" label="Unit quantity ($)" :min="0.01" :max="9999.99" :step="0.01"
    :precision="2" required :validation-rules="{ min: 0.01, positive: true }" />

    <NumberInput v-model="formData.quantity" label="Discount %" :min="0" :max="100" :step="1" :custom-validator="(val) => {
              if (val > 50 && formData.quantity > 1000) {
                return 'Discount cannot exceed 50% for items over $1000'
              }
              return null
            }" />

<NumberInput v-model="formData.quantity" label="Order Quantity" :min="1" :max="1000" :step="1" required
    helper-text="Enter quantity between 1 and 1000" :error="productVariantStore.validationErrors.quantity" />

<NumberInput v-model="formData.quantity" label="Order Quantity" :min="1" :max="1000" :step="1" required
    helper-text="Enter quantity between 1 and 1000" :error="productVariantStore.validationErrors.quantity"
    :ai-suggestions="true" />

    <NumberInput v-model="formData.quantity" label="Order Quantity" :min="1" :max="1000" :step="1" required
        helper-text="Enter quantity between 1 and 1000" :error="productVariantStore.validationErrors.quantity"
        :ai-suggestions="[
            { label: 'Small Order', value: 10 },
            { label: 'Medium Order', value: 50 },
            { label: 'Large Order', value: 100 },
            { label: 'Bulk Order', value: 500 }
        ]" />

        <NumberInput v-model="formData.quantity" label="Order Quantity" :min="1" :max="1000" :step="1" required
            helper-text="Enter quantity between 1 and 1000" :error="productVariantStore.validationErrors.quantity"
            :ai-suggestions="getQuantitySuggestions" @ai-suggest="fetchQuantitySuggestions" />

            <script setup>
            import { ref } from 'vue'
            
            const getQuantitySuggestions = ref([])
            
            const fetchQuantitySuggestions = async () => {
                // Fetch from API
                const response = await fetch('/api/ai/quantity-suggestions')
                const data = await response.json()
                getQuantitySuggestions.value = data.map(item => ({
                    label: item.label,
                    value: item.value
                }))
            }
            </script>



-->