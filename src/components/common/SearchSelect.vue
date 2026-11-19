<template>
    <div class="relative w-full" v-click-outside="closeDropdown" :data-ai-instance="aiInstanceId">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative searchable-select w-full">
            <input type="text" v-model="search" :disabled="disabled" @focus="handleFocus" @blur="handleBlur"
                :placeholder="activePlaceholder" :class="inputClass" ref="inputRef" />

            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" v-show="!isOpen">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </div>

            <!-- Clear Button -->
            <button v-if="clearable && modelValue && !disabled" type="button" @click="clearSelection"
                class="absolute inset-y-0 flex items-center pr-2 focus:outline-none"
                :class="hasAiSuggestions ? 'right-14' : 'right-8'">
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <!-- AI Suggestion Component -->
            <AiSuggestion v-if="hasAiSuggestions" ref="aiSuggestionRef" :instance-id="aiInstanceId"
                component-type="select" :label="typeof label === 'string' ? label : ''" :value="selectedLabel"
                :required="required" :disabled="disabled" :ai-suggestions="aiSuggestions" :ai-loading="aiLoading"
                :max-suggestions="5" :fetch-on-mount="false" :fallback="false" :extra-context="aiExtraContext" tone="neutral" @apply="applyAISuggestion" @fetch="fetchAISuggestions"
                @toggle="onAIToggle" />
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !showError" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ helperText }}
        </p>

        <!-- Error Message -->
        <p v-if="showError" class="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
        </p>

        <!-- Dropdown -->
        <div v-if="isOpen"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <ul class="py-1">
                <li @click="selectOption(null)"
                    class="px-4 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    {{ placeholder }}
                </li>

                <li v-for="item in filteredOptions" :key="item[valueKey]" @click="selectOption(item)"
                    class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white flex justify-between items-center"
                    :class="{
                        'bg-gray-50 dark:bg-gray-800 text-blue-600 font-semibold': isMatch(item[valueKey], modelValue),
                        'border-l-2 border-blue-500': isMatch(item[valueKey], modelValue)
                    }">
                    {{ item[labelKey] }}
                    <svg v-if="isMatch(item[valueKey], modelValue)" class="h-4 w-4 text-blue-500" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </li>
                <li v-if="filteredOptions.length === 0" class="px-4 py-2 text-xs text-gray-400 italic text-center">
                    No matches found
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import AiSuggestion from '@/components/common/AiSuggestion.vue'
import { ref, computed, watch, onMounted, onBeforeUnmount, inject, nextTick, useAttrs } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    options: { type: Array, default: () => [] },
    label: {
        type: [String, Boolean],
        default: ""
    },
    placeholder: { type: String, default: '--Select Option--' },
    valueKey: { type: String, default: 'id' },
    labelKey: { type: String, default: 'name' },
    error: { type: [Array, String, Object], default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    selectedItem: [String, Number],
    // AI Suggestions: true (auto fetch) | Array of { label, value } | null (disabled)
    aiSuggestions: { type: [Boolean, Array], default: null },
    aiLoading: { type: Boolean, default: false },
    // Validation Props
    helperText: String,
    clearable: { type: Boolean, default: false },
    validateOnBlur: { type: Boolean, default: true },
    validateOnInput: { type: Boolean, default: false },
    // Custom validation
    customValidator: { type: Function, default: null },
    validationRules: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'ai-suggest'])

const aiInstanceId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
const aiSuggestionRef = ref(null)
const hasAiSuggestions = computed(() => props.aiSuggestions !== null && props.aiSuggestions !== undefined)

// Refs
const search = ref('')
const isOpen = ref(false)
const inputRef = ref(null)
const internalError = ref(null)
const hasBeenTouched = ref(false)
const hasBeenFocused = ref(false)
const submitAttempted = ref(false)

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

// Helper for type-safe comparison
const isMatch = (val1, val2) => String(val1) === String(val2)

// --- Computed Properties ---

const hasError = computed(() => {
    if (props.error) return true
    if (internalError.value) {
        if (props.required && internalError.value.includes('required')) {
            return submitAttempted.value || (hasBeenTouched.value && hasBeenFocused.value === false)
        }
        return submitAttempted.value || hasBeenTouched.value
    }
    return false
})

const showError = computed(() => hasError.value)

const errorMessage = computed(() => {
    if (props.error) {
        return Array.isArray(props.error) ? props.error[0] : props.error
    }
    return internalError.value
})

const attrs = useAttrs()
// Sizing utilities (py-*, h-*, text-*) passed via `class` are applied to the input itself
const inputAttrClass = computed(() => {
    const c = attrs.class
    const list = Array.isArray(c) ? c.flat() : typeof c === 'object' && c ? Object.keys(c).filter(k => c[k]) : String(c || '').split(/\s+/)
    return list.filter(x => typeof x === 'string' && /^!?(py|pt|pb|h|text)-/.test(x))
})

const inputClass = computed(() => {
    return [
        (inputAttrClass.value.some(c => /^!?py-/.test(c)) ? '' : 'py-2') + ' w-full pl-4 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
        showError.value
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 focus:border-blue-400 dark:bg-gray-700',
        props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'cursor-pointer dark:bg-gray-700',
        (selectedLabel.value && !search.value) ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-white',
        hasAiSuggestions.value ? (props.clearable && props.modelValue && !props.disabled ? 'pr-24' : 'pr-16')
            : (props.clearable && props.modelValue && !props.disabled ? 'pr-16' : 'pr-10'),
        inputAttrClass.value
    ]
})

const selectedLabel = computed(() => {
    const selected = props.options.find(opt => isMatch(opt[props.valueKey], props.modelValue))
    return selected ? selected[props.labelKey] : ''
})

const activePlaceholder = computed(() => {
    return isOpen.value ? 'Search..' : (selectedLabel.value || props.placeholder)
})

const filteredOptions = computed(() => {
    const term = search.value.toLowerCase()
    return props.options.filter(item => String(item[props.labelKey]).toLowerCase().includes(term))
})

/**
 * Frontend Validation
 */
const validateValue = (value, triggerSubmit = false) => {
    const errors = []

    // Required validation
    const shouldValidateRequired =
        triggerSubmit ||
        submitAttempted.value ||
        (hasBeenTouched.value && (hasBeenFocused.value || value === null || value === undefined || value === ''))

    if (props.required && shouldValidateRequired) {
        if (value === null || value === undefined || value === '' || value === '') {
            errors.push(`${props.label || 'This field'} is required`)
        }
    }

    // Only validate other rules if value exists
    if (value !== null && value !== undefined && value !== '') {
        // Find selected item for additional validation
        const selectedItem = props.options.find(opt => isMatch(opt[props.valueKey], value))

        // Custom validation rules
        if (props.validationRules) {
            Object.entries(props.validationRules).forEach(([rule, ruleValue]) => {
                switch (rule) {
                    case 'min':
                        if (selectedItem && selectedItem[ruleValue] && selectedItem[ruleValue] < ruleValue) {
                            errors.push(`Selected value must be at least ${ruleValue}`)
                        }
                        break
                    case 'max':
                        if (selectedItem && selectedItem[ruleValue] && selectedItem[ruleValue] > ruleValue) {
                            errors.push(`Selected value must be at most ${ruleValue}`)
                        }
                        break
                }
            })
        }

        // Custom validator
        if (props.customValidator) {
            const customError = props.customValidator(value, selectedItem)
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

// --- Methods ---
const selectOption = (item) => {
    const val = item ? item[props.valueKey] : ''

    // Mark as touched
    if (!hasBeenTouched.value) {
        hasBeenTouched.value = true
    }

    emit('update:modelValue', val)
    emit('change', val)
    search.value = ''
    isOpen.value = false

    // Validate on select
    internalError.value = getValidationMessage(val)

    // Trigger form validation
    if (formValidation && formValidation.validateForm) {
        nextTick(() => {
            formValidation.validateForm()
        })
    }
}

const fetchAISuggestions = () => {
    if (props.aiSuggestions === true) return
    emit('ai-suggest')
}

const aiExtraContext = computed(() => ({
    options: props.options.slice(0, 200).map(opt => opt[props.labelKey])
}))

// Suggestion value may be an option's value or its label
const applyAISuggestion = (value) => {
    const text = String(value ?? '').trim().toLowerCase()
    const option = props.options.find(opt => isMatch(opt[props.valueKey], value))
        || props.options.find(opt => String(opt[props.labelKey]).trim().toLowerCase() === text)
        || props.options.find(opt => text && String(opt[props.labelKey]).toLowerCase().includes(text))
    if (option) selectOption(option)
}

const onAIToggle = (open) => {
    if (open) isOpen.value = false
}

const closeDropdown = () => {
    isOpen.value = false
    search.value = ''
}

const clearSelection = () => {
    selectOption(null)
}

const handleFocus = (event) => {
    hasBeenFocused.value = true
    if (!props.disabled) {
        isOpen.value = true
    }
    emit('focus', event)
}

const handleBlur = (event) => {
    hasBeenTouched.value = true
    hasBeenFocused.value = false

    // Validate on blur
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

// --- Initial/Selected Item Sync ---
const syncSelectedItem = () => {
    if (props.selectedItem !== undefined && props.selectedItem !== null && !props.modelValue) {
        emit('update:modelValue', props.selectedItem)
    }
}

onMounted(syncSelectedItem)
watch(() => props.selectedItem, syncSelectedItem)

// Watch for model value changes
watch(() => props.modelValue, (newVal) => {
    if (hasBeenTouched.value || submitAttempted.value) {
        internalError.value = getValidationMessage(newVal)
    }
})

// --- Directive ---
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value()
            }
        }
        document.addEventListener('mousedown', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('mousedown', el.clickOutsideEvent)
    }
}
</script>

<style scoped>
.searchable-select input::placeholder {
    opacity: 1;
    color: inherit;
}

/* Scrollbar styling for dropdown */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #4b5563;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}
</style>

<!-- 
<SearchSelect 
    v-model="form.product_id" 
    label="Product" 
    :options="products" 
    value-key="id" 
    label-key="name"
    required
    helper-text="Select a product from the list"
/>

<SearchSelect v-model="form.category_id" label="Category" :options="categories" value-key="id" label-key="name"
    required :custom-validator="(value, item) => {
        if (item && item.status === 'inactive') {
            return 'This category is currently inactive'
        }
        return null
    }" />

<GlobalForm ref="formRef" @submit="handleSubmit">
    <SearchSelect v-model="formData.product_id" label="Product" :options="productOptions" value-key="id"
        label-key="name" required clearable />
</GlobalForm>

<SearchSelect v-model="form.priority" label="Priority" :options="priorityOptions" value-key="id" label-key="name"
    required :validation-rules="{
        min: 1,
        max: 5
    }" />

    <!-- ১. auto fetch -->
    <!-- <SearchSelect ... :ai-suggestions="true" /> -->
    
    <!-- ২. static -->
    <!-- <SearchSelect ... :ai-suggestions="[{ label: 'Dhaka', value: 1 }]" /> -->
    
    <!-- ৩. manual fetch -->
    <!-- <SearchSelect ... :ai-suggestions="list" :ai-loading="loading" @ai-suggest="fetchList" /> 
-->
 