<template>
    <div class="relative w-full" :data-ai-instance="aiInstanceId">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative">
            <textarea v-model="inputValue" :disabled="disabled" :readonly="readonly" :placeholder="placeholder"
                :rows="rows" :maxlength="maxlength" :class="textareaClass" @input="handleInput" @blur="handleBlur"
                @focus="handleFocus" ref="inputRef"></textarea>

            <!-- AI Suggestion Component -->
            <AiSuggestion v-if="hasAiSuggestions" ref="aiSuggestionRef" :instance-id="aiInstanceId"
                component-type="textarea" :label="label" :value="inputValue" :required="required" :disabled="disabled"
                :readonly="readonly" :ai-suggestions="aiSuggestions" :ai-loading="aiLoading" :max-suggestions="5"
                tone="professional" @apply="applyAISuggestion" @fetch="fetchAISuggestions" @toggle="onAIToggle"
                @update:suggestions="updateAISuggestions" />

            <!-- Resize Handle -->
            <div v-if="resizable" class="absolute bottom-0 right-0 p-1 cursor-nw-resize text-gray-400">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M15 7a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z" clip-rule="evenodd" />
                </svg>
            </div>
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

        <!-- Character Counter -->
        <div v-if="showCounter && maxlength" class="text-xs text-gray-400 mt-1 text-right">
            {{ inputValue?.length || 0 }} / {{ maxlength }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, inject, useAttrs, normalizeClass } from 'vue'
import AiSuggestion from '@/components/common/AiSuggestion.vue'

const attrs = useAttrs()

const props = defineProps({
    modelValue: String,
    label: String,
    placeholder: String,
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    rows: { type: Number, default: 3 },
    maxlength: Number,
    showCounter: { type: Boolean, default: false },
    resizable: { type: Boolean, default: true },
    autoResize: { type: Boolean, default: false },
    trim: { type: Boolean, default: false },
    // AI Props - Can be boolean true, array, or null
    aiSuggestions: {
        type: [Boolean, Array],
        default: null
    },
    aiLoading: {
        type: Boolean,
        default: false
    },
    // Validation Props
    validationRules: {
        type: Object,
        default: () => ({})
    },
    customValidator: { type: Function, default: null },
    minLength: { type: Number, default: null },
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

// Generate unique ID for this instance
const aiInstanceId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Refs
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
                const error = getValidationMessage(inputValue.value, triggerSubmit)
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

// Computed
const inputValue = computed({
    get: () => props.modelValue,
    set: (val) => {
        let processedVal = val
        if (props.trim && typeof processedVal === 'string') {
            processedVal = processedVal.trim()
        }
        emit('update:modelValue', processedVal)

        // Trigger form validation
        if (formValidation && formValidation.validateForm) {
            nextTick(() => {
                formValidation.validateForm()
            })
        }
    }
})

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

const textareaClass = computed(() => {
    const baseClasses = 'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors'
    const resizeClass = props.resizable ? 'resize-y' : 'resize-none'
    const paddingRight = hasAiSuggestions.value ? 'pr-12' : 'pr-3'
    const customClasses = normalizeClass(attrs.class)
    const hasCustomVerticalPadding = customClasses
        .split(/\s+/)
        .some(className => /^!?p(y|t|b)?-/.test(className))

    const colorClasses = showError.value
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'

    const stateClasses = props.disabled
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
        : props.readonly
            ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
            : 'bg-white dark:bg-gray-700'

    const verticalPadding = hasCustomVerticalPadding ? '' : 'p-2'

    return `${baseClasses} ${resizeClass} ${verticalPadding} ${paddingRight} ${customClasses} ${colorClasses} ${stateClasses}`
})

/**
 * AI Methods
 */
const fetchAISuggestions = () => {
    if (props.aiSuggestions === true) {
        return
    }
    emit('ai-suggest')
}

const applyAISuggestion = (value) => {
    inputValue.value = value
    hasBeenTouched.value = true
    internalError.value = getValidationMessage(value)

    if (formValidation && formValidation.validateForm) {
        nextTick(() => {
            formValidation.validateForm()
        })
    }
}

const onAIToggle = (isOpen) => {
    // Handle AI dropdown toggle if needed
}

const updateAISuggestions = (suggestions) => {
    localAiSuggestions.value = suggestions
}

/**
 * Frontend Validation
 */
const validateValue = (value, triggerSubmit = false) => {
    const errors = []
    const strValue = value?.toString?.() || ''

    const shouldValidateRequired =
        triggerSubmit ||
        submitAttempted.value ||
        (hasBeenTouched.value && (hasBeenFocused.value || !strValue.trim()))

    if (props.required && shouldValidateRequired) {
        if (!strValue.trim()) {
            errors.push(`${props.label || 'This field'} is required`)
        }
    }

    if (strValue.trim()) {
        // Min length validation
        if (props.minLength && strValue.length < props.minLength) {
            errors.push(`Must be at least ${props.minLength} characters`)
        }

        // Max length validation
        if (props.maxlength && strValue.length > props.maxlength) {
            errors.push(`Must be at most ${props.maxlength} characters`)
        }

        // Custom validation rules
        if (props.validationRules) {
            Object.entries(props.validationRules).forEach(([rule, ruleValue]) => {
                switch (rule) {
                    case 'minLength':
                        if (strValue.length < ruleValue) {
                            errors.push(`Must be at least ${ruleValue} characters`)
                        }
                        break
                    case 'maxLength':
                        if (strValue.length > ruleValue) {
                            errors.push(`Must be at most ${ruleValue} characters`)
                        }
                        break
                    case 'contains':
                        if (ruleValue && !strValue.includes(ruleValue)) {
                            errors.push(`Must contain "${ruleValue}"`)
                        }
                        break
                    case 'startsWith':
                        if (ruleValue && !strValue.startsWith(ruleValue)) {
                            errors.push(`Must start with "${ruleValue}"`)
                        }
                        break
                    case 'endsWith':
                        if (ruleValue && !strValue.endsWith(ruleValue)) {
                            errors.push(`Must end with "${ruleValue}"`)
                        }
                        break
                }
            })
        }

        // Custom validator
        if (props.customValidator) {
            const customError = props.customValidator(strValue)
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

// Handlers
const handleInput = (event) => {
    emit('change', event.target.value)

    if (!hasBeenTouched.value) {
        hasBeenTouched.value = true
    }

    if (props.validateOnInput) {
        internalError.value = getValidationMessage(event.target.value)
    }

    if (props.autoResize) {
        autoResizeTextarea(event.target)
    }
}

const handleBlur = (event) => {
    hasBeenTouched.value = true
    hasBeenFocused.value = false

    if (props.validateOnBlur) {
        internalError.value = getValidationMessage(inputValue.value)
    }

    emit('blur', event)
}

const handleFocus = (event) => {
    hasBeenFocused.value = true
    emit('focus', event)
}

const autoResizeTextarea = (element) => {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
}

/**
 * Public method to trigger validation
 */
const validate = (triggerSubmit = true) => {
    if (triggerSubmit) {
        submitAttempted.value = true
    }
    const error = getValidationMessage(inputValue.value, triggerSubmit)
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

// Auto-resize on mount and when value changes
watch(() => inputValue.value, () => {
    if (props.autoResize) {
        nextTick(() => {
            if (inputRef.value) {
                autoResizeTextarea(inputRef.value)
            }
        })
    }

    // Validate on value change
    if (hasBeenTouched.value || submitAttempted.value) {
        internalError.value = getValidationMessage(inputValue.value)
    }
})

// Close suggestions on outside click - handled by AiSuggestion component
</script>

<style scoped>
textarea {
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

/* Scrollbar styling */
textarea::-webkit-scrollbar {
    width: 6px;
}

textarea::-webkit-scrollbar-track {
    background: transparent;
}

textarea::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

.dark textarea::-webkit-scrollbar-thumb {
    background: #4b5563;
}

.dark textarea::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}
</style>

<!-- 
<TextAreaInput v-model="form.bio" label="Biography" placeholder="Tell us about yourself" :rows="5" :maxlength="500"
    required :min-length="10" :show-counter="true" helper-text="Enter a brief biography (10-500 characters)" />
     
<TextAreaInput v-model="form.review" label="Review" placeholder="Write your review..." :rows="4" required
    :custom-validator="(value) => {
        if (value && value.split(' ').length < 5) {
            return 'Please write at least 5 words'
        }
        return null
    }" :validation-rules="{
        contains: 'good',
        minLength: 20
    }" />

Usage Examples:
1. No AI (Default)
vue
<TextareaInput v-model="form.bio" label="Biography" placeholder="Tell us about yourself" :rows="5" :maxlength="500"
    required :min-length="10" :show-counter="true" helper-text="Enter a brief biography (10-500 characters)" />
2. Auto AI Suggestions (True - Auto Fetch)
vue
<TextareaInput v-model="form.description" label="Description" placeholder="Describe your product..." :rows="6" required
    :ai-suggestions="true" />
3. Static AI Suggestions (Array Data)
vue
<TextareaInput v-model="form.description" label="Description" placeholder="Describe your product..." :rows="6" required
    :ai-suggestions="[
        { 
            label: '📝 Professional Description', 
            value: 'This is a professional description that highlights the key features and benefits of the product. It provides comprehensive information to help users make informed decisions.'
        },
        { 
            label: '🎯 Marketing Copy', 
            value: 'Discover the best! Our product offers exceptional quality and unbeatable value. Experience the difference today with our limited time offer.'
        },
        { 
            label: '📊 Technical Details', 
            value: 'Technical Specifications:\n- Material: Premium grade stainless steel\n- Dimensions: 25cm x 15cm x 10cm\n- Weight: 2.5 kg\n- Warranty: 2 years comprehensive'
        }
    ]" />
4. Dynamic AI Suggestions (Manual Fetch)
vue
<TextareaInput v-model="form.review" label="Review" placeholder="Write your review..." :rows="4" required
    :ai-suggestions="aiSuggestions" @ai-suggest="fetchAIContent" />
vue
<script setup>
import { ref } from 'vue'

const aiSuggestions = ref([])

const fetchAIContent = async () => {
    // Fetch from API
    const response = await fetch('/api/ai/review-suggestions')
    const data = await response.json()
    aiSuggestions.value = data.map(item => ({
        label: item.label,
        value: item.content
    }))
}
</script>
5. With Custom Validation
vue
<TextareaInput v-model="form.review" label="Review" placeholder="Write your review..." :rows="4" required
    :custom-validator="(value) => {
        if (value && value.split(' ').length < 5) {
            return 'Please write at least 5 words'
        }
        return null
    }" :validation-rules="{
        contains: 'good',
        minLength: 20
    }" :ai-suggestions="true" />
6. With Form Registration
vue
<GlobalForm ref="formRef" @submit="handleSubmit">
    <TextareaInput v-model="formData.content" label="Content" required :min-length="50" :maxlength="5000"
        :show-counter="true" :auto-resize="true" :rows="5" :ai-suggestions="true" />
</GlobalForm>
    -->