<template>
    <div class="relative w-full" :data-ai-instance="aiInstanceId">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative" @click.stop>
            <input :type="type" v-model="inputValue" :disabled="disabled" :readonly="readonly"
                :placeholder="placeholder" :maxlength="maxlength" :min="min" :max="max" :step="step"
                :autocomplete="autocomplete" :class="inputClass" @input="handleInput" @blur="handleBlur"
                @focus="handleFocus" ref="inputRef" @click.stop @keydown.enter.prevent />

            <!-- Left Icon -->
            <div v-if="leftIcon" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <component :is="leftIcon" class="h-5 w-5 text-gray-400" />
            </div>

            <!-- Clear Button -->
            <button v-if="clearable && inputValue && !disabled && !readonly" type="button" @click.stop="clear"
                class="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none">
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <!-- AI Suggestion Component -->
            <AiSuggestion v-if="hasAiSuggestions" ref="aiSuggestionRef" :instance-id="aiInstanceId"
                component-type="text-input" :label="label" :value="inputValue" :required="required" :disabled="disabled"
                :readonly="readonly" :ai-suggestions="aiSuggestions" :ai-loading="aiLoading" :max-suggestions="5"
                tone="professional" @apply="applyAISuggestion" @fetch="fetchAISuggestions" @toggle="onAIToggle"
                @update:suggestions="updateAISuggestions" />

            <!-- Right Icon -->
            <div v-if="rightIcon && !isLoading" @click.stop="handleRightIconClick"
                class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                <component :is="rightIcon" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>

            <!-- Loading Spinner -->
            <div v-if="isLoading" class="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
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
import { ref, computed, watch, nextTick, onBeforeUnmount, inject, onMounted, useAttrs, normalizeClass } from 'vue'
import AiSuggestion from '@/components/common/AiSuggestion.vue'

const attrs = useAttrs()

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    maxlength: Number,
    min: [String, Number],
    max: [String, Number],
    step: [String, Number],
    autocomplete: { type: String, default: 'off' },
    leftIcon: Object,
    rightIcon: Object,
    clearable: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    showCounter: { type: Boolean, default: false },
    trim: { type: Boolean, default: false },
    uppercase: { type: Boolean, default: false },
    lowercase: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
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
    validateOnInput: { type: Boolean, default: false },
    pattern: { type: String, default: null },
    minLength: { type: Number, default: null },
    maxLength: { type: Number, default: null }
})

const emit = defineEmits([
    'update:modelValue',
    'change',
    'blur',
    'focus',
    'clear',
    'right-icon-click',
    'ai-suggest'
])

// Generate unique ID for this instance
const aiInstanceId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const inputRef = ref(null)
const aiSuggestionRef = ref(null)
const internalError = ref(null)
const hasBeenTouched = ref(false)
const hasBeenFocused = ref(false)
const submitAttempted = ref(false)
const localAiSuggestions = ref([])

const hasAiSuggestions = computed(() => {
    return props.aiSuggestions !== null && props.aiSuggestions !== undefined
})

const formValidation = inject('formValidation', null)

let componentRef = null

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

onBeforeUnmount(() => {
    if (formValidation && componentRef) {
        formValidation.unregister(componentRef)
        componentRef = null
    }
})

const inputValue = computed({
    get: () => props.modelValue,
    set: (val) => {
        let processedVal = val

        if (props.trim && typeof processedVal === 'string') {
            processedVal = processedVal.trim()
        }
        if (props.uppercase && typeof processedVal === 'string') {
            processedVal = processedVal.toUpperCase()
        }
        if (props.lowercase && typeof processedVal === 'string') {
            processedVal = processedVal.toLowerCase()
        }

        emit('update:modelValue', processedVal)

        if (formValidation && formValidation.validateForm) {
            nextTick(() => {
                formValidation.validateForm()
            })
        }
    }
})

const fetchAISuggestions = () => {
    if (props.aiSuggestions === true) {
        return
    }
    emit('ai-suggest')
}

const applyAISuggestion = (value) => {
    inputValue.value = value
}

const onAIToggle = (isOpen) => {
    // Handle AI dropdown toggle if needed
}

const updateAISuggestions = (suggestions) => {
    localAiSuggestions.value = suggestions
}

const validateValue = (value, triggerSubmit = false) => {
    const errors = []
    const strValue = value?.toString?.() || ''

    const shouldValidateRequired =
        triggerSubmit ||
        submitAttempted.value ||
        (hasBeenTouched.value && (hasBeenFocused.value || value === '' || value === null || value === undefined))

    if (props.required && shouldValidateRequired) {
        if (value === null || value === undefined || value === '' || value === '') {
            errors.push(`${props.label || 'This field'} is required`)
        }
    }

    if (value !== null && value !== undefined && value !== '') {
        if (props.minLength && strValue.length < props.minLength) {
            errors.push(`Must be at least ${props.minLength} characters`)
        }

        if (props.maxLength && strValue.length > props.maxLength) {
            errors.push(`Must be at most ${props.maxLength} characters`)
        }

        if (props.pattern) {
            try {
                const regex = new RegExp(props.pattern)
                if (!regex.test(strValue)) {
                    errors.push(`Invalid format`)
                }
            } catch (e) {
                console.warn('Invalid pattern regex:', e)
            }
        }

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
                    case 'pattern':
                        if (ruleValue) {
                            try {
                                const regex = new RegExp(ruleValue)
                                if (!regex.test(strValue)) {
                                    errors.push(`Invalid format`)
                                }
                            } catch (e) {
                                console.warn('Invalid pattern regex in validationRules:', e)
                            }
                        }
                        break
                    case 'email':
                        if (ruleValue) {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                            if (!emailRegex.test(strValue)) {
                                errors.push(`Must be a valid email address`)
                            }
                        }
                        break
                    case 'url':
                        if (ruleValue) {
                            try {
                                new URL(strValue)
                            } catch (e) {
                                errors.push(`Must be a valid URL`)
                            }
                        }
                        break
                    case 'alphanumeric':
                        if (ruleValue && !/^[a-zA-Z0-9]+$/.test(strValue)) {
                            errors.push(`Must contain only letters and numbers`)
                        }
                        break
                    case 'numeric':
                        if (ruleValue && !/^\d+$/.test(strValue)) {
                            errors.push(`Must contain only numbers`)
                        }
                        break
                }
            })
        }

        if (props.customValidator) {
            const customError = props.customValidator(value, strValue)
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

const handleInput = (event) => {
    if (!props.lazy) {
        const val = event.target.value
        inputValue.value = val

        if (!hasBeenTouched.value) {
            hasBeenTouched.value = true
        }

        if (props.validateOnInput) {
            internalError.value = getValidationMessage(val)
        }
    }
    emit('change', event.target.value)
}

const handleBlur = (event) => {
    if (props.lazy) {
        const val = event.target.value
        inputValue.value = val
    }

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

const handleRightIconClick = () => {
    emit('right-icon-click')
}

const clear = () => {
    inputValue.value = ''
    emit('clear')
    emit('update:modelValue', '')
    internalError.value = null
}

const validate = (triggerSubmit = true) => {
    if (triggerSubmit) {
        submitAttempted.value = true
    }
    const error = getValidationMessage(inputValue.value, triggerSubmit)
    internalError.value = error
    return !error
}

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

const showError = computed(() => {
    return hasError.value
})

const errorMessage = computed(() => {
    if (props.error) {
        return Array.isArray(props.error) ? props.error[0] : props.error
    }
    return internalError.value
})

const inputClass = computed(() => {
    const baseClasses = 'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors'
    const paddingClasses = props.leftIcon ? 'pl-3' : 'pl-3'
    const customClasses = normalizeClass(attrs.class)
    const hasCustomVerticalPadding = customClasses
        .split(/\s+/)
        .some(className => /^!?p(y|t|b)?-/.test(className))

    let rightPadding = 'pr-3'
    if (hasAiSuggestions.value) {
        rightPadding = 'pr-12'
    } else if (props.clearable || props.rightIcon || props.isLoading) {
        rightPadding = 'pr-10'
    }

    const colorClasses = hasError.value
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-300 focus:border-blue-500 dark:bg-gray-700 dark:text-white'

    const stateClasses = props.disabled
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
        : props.readonly
            ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
            : 'bg-white dark:bg-gray-700'

    const verticalPadding = hasCustomVerticalPadding ? '' : 'py-2'

    return `${baseClasses} ${paddingClasses} ${rightPadding} ${verticalPadding} ${customClasses} ${colorClasses} ${stateClasses}`
})

watch(() => inputValue.value, (newVal) => {
    if (hasBeenTouched.value || submitAttempted.value) {
        if (!hasBeenTouched.value && !submitAttempted.value && (newVal === null || newVal === undefined)) {
            return
        }
        internalError.value = getValidationMessage(newVal)
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


<!-- usage -->
<!-- <TextInput v-model="form.name" label="Full Name" placeholder="Enter your name" required :clearable="true"
    :maxlength="100" :error="errors.name" />
     
<TextInput v-model="form.name" label="Product Name" required placeholder="Enter product name" :min-length="3"
:max-length="100" />
  
<TextInput v-model="form.email" label="Email" type="email" required :validation-rules="{ email: true }"
placeholder="Enter email address" />
  

<TextInput v-model="form.name" label="Full Name" placeholder="Enter your name" required :clearable="true"
    :maxlength="100" :error="errors.name" />

    Usage Examples:
    1. No AI (Default)
    vue
    <TextInput v-model="form.name" label="Full Name" placeholder="Enter your name" required :clearable="true"
        :maxlength="100" :error="errors.name" />
    2. Auto AI Suggestions (True - Auto Fetch)
    vue
    <TextInput v-model="form.name" label="Product Name" required placeholder="Enter product name" :min-length="3"
        :max-length="100" :ai-suggestions="true" />
    3. Static AI Suggestions (Array Data)
    vue
    <TextInput v-model="form.description" label="Description" required :ai-suggestions="[
            { label: 'Short Description', value: 'High quality product with excellent features' },
            { label: 'Detailed Description', value: 'This premium product offers exceptional quality and durability' },
            { label: 'SEO Description', value: 'Best quality product with amazing features and benefits' }
        ]" />
    4. Dynamic AI Suggestions (Manual Fetch)
    vue
    <TextInput v-model="form.description" label="Description" required :ai-suggestions="aiSuggestions"
        @ai-suggest="fetchAIDescriptions" />
    vue
    <script setup>
    import { ref } from 'vue'
    
    const aiSuggestions = ref([])
    
    const fetchAIDescriptions = async () => {
        // Fetch from API
        const response = await fetch('/api/ai/descriptions')
        const data = await response.json()
        aiSuggestions.value = data.map(item => ({
            label: item.label,
            value: item.value
        }))
    }
    </script>
    
    -->