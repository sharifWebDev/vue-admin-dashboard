<!-- components/common/GlobalForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="py-3">
        <slot />

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-3 md:pt-4 lg:pt-5 mb-0 border-t border-gray-200 dark:border-gray-700">
            <!-- Cancel Button -->
            <Button type="button" :text="cancelText" btn-type="cancel" :variant="cancelVariant" @click="handleCancel" />

            <!-- Submit Button -->
            <Button type="submit" :btn-type="dynamicBtnType"
                :text="submitText || (mode === 'create' ? 'Create' : 'Update')" :icon="submitIcon"
                :disabled="isSubmitDisabled" :loading="loading" :loading-text="loadingText"
                :variant="submitVariant || undefined" :custom-class="submitButtonClass" />
        </div>

        <!-- Form Validation Summary -->
        <!-- <div v-if="showValidationSummary && hasErrors"
            class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please fix the following errors:
            </p>
            <ul class="mt-1 space-y-0.5">
                <li v-for="(error, index) in allErrors" :key="index" class="text-xs text-red-600 dark:text-red-400">
                    • {{ error }}
                </li>
            </ul>
        </div> -->
    </form>
</template>

<script setup>
import { computed, ref, provide, watch, nextTick } from 'vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    loading: {
        type: Boolean,
        default: false
    },
    submitText: {
        type: String,
        default: ''
    },
    loadingText: {
        type: String,
        default: ''
    },
    submitIcon: {
        type: [String, Boolean, Object],
        default: null
    },
    submitVariant: {
        type: String,
        default: null
    },
    submitButtonClass: {
        type: String,
        default: ''
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    cancelVariant: {
        type: String,
        default: 'outline'
    },
    validationErrors: {
        type: Array,
        default: () => []
    },
    showValidationSummary: {
        type: Boolean,
        default: true
    },
    disableOnError: {
        type: Boolean,
        default: true
    },
    focusFirstError: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['submit', 'cancel', 'validation-change'])

// State
const formComponents = ref([])
const hasErrors = ref(false)
const errorMessages = ref([])
const isValidationRunning = ref(false)

/**
 * Dynamic button type
 */
const dynamicBtnType = computed(() => {
    if (props.mode === 'create') return 'create'
    if (props.mode === 'edit') return 'update'
    if (props.mode === 'view') return 'view'
    return 'create'
})

/**
 * Combined errors from all sources
 */
const allErrors = computed(() => {
    const errors = []
    if (props.validationErrors && props.validationErrors.length > 0) {
        errors.push(...props.validationErrors)
    }
    if (errorMessages.value && errorMessages.value.length > 0) {
        errors.push(...errorMessages.value)
    }
    return errors
})

/**
 * Check if submit should be disabled
 */
const isSubmitDisabled = computed(() => {
    if (props.loading) return true
    if (props.mode === 'view') return true
    if (props.disableOnError && hasErrors.value) return true
    if (props.validationErrors && props.validationErrors.length > 0) return true
    return false
})

/**
 * Register form component
 */
const registerComponent = (component) => {
    if (component && typeof component.validate === 'function') {
        const exists = formComponents.value.some(c => c === component)
        if (!exists) {
            formComponents.value.push(component)
        }
    }
}

const unregisterComponent = (component) => {
    const index = formComponents.value.indexOf(component)
    if (index > -1) {
        formComponents.value.splice(index, 1)
    }
}

// Provide to children
provide('formValidation', {
    register: registerComponent,
    unregister: unregisterComponent,
    validateForm: () => validateAllFields(false)
})

/**
 * Validate all registered components
 */
const validateAllFields = async (triggerSubmit = true) => {
    // Prevent multiple simultaneous validations
    if (isValidationRunning.value) return

    isValidationRunning.value = true

    try {
        const errors = []
        let hasError = false

        for (const component of formComponents.value) {
            if (component && typeof component.validate === 'function') {
                try {
                    const isValid = component.validate(triggerSubmit)
                    if (!isValid) {
                        hasError = true
                        if (component.errorMessage) {
                            errors.push(component.errorMessage)
                        } else if (component.internalError) {
                            errors.push(component.internalError)
                        }
                    }
                } catch (error) {
                    console.error('Validation error:', error)
                    hasError = true
                }
            }
        }

        hasErrors.value = hasError
        errorMessages.value = errors

        emit('validation-change', {
            hasErrors: hasError,
            errors: errors
        })

        return !hasError
    } finally {
        isValidationRunning.value = false
    }
}

/**
 * Handle form submit
 */
const handleSubmit = async () => {
    // Validate all fields
    const isValid = await validateAllFields(true)

    if (!isValid) {
        if (props.focusFirstError) {
            // Focus first error field
            for (const component of formComponents.value) {
                if (component.$el && component.$el.querySelector) {
                    const input = component.$el.querySelector('input, select, textarea')
                    if (input && !input.disabled && !input.readonly) {
                        input.focus()
                        break
                    }
                }
            }
        }
        return
    }

    emit('submit')
}

/**
 * Handle cancel
 */
const handleCancel = () => {
    emit('cancel')
}

/**
 * Reset validation state
 */
const resetValidation = () => {
    hasErrors.value = false
    errorMessages.value = []

    for (const component of formComponents.value) {
        if (component && typeof component.resetValidation === 'function') {
            component.resetValidation()
        }
    }
}

// Expose methods
defineExpose({
    validate: validateAllFields,
    resetValidation,
    hasErrors,
    errorMessages
})

// Watch for validation errors prop
watch(() => props.validationErrors, (newErrors) => {
    if (newErrors && newErrors.length > 0) {
        hasErrors.value = true
    } else if (errorMessages.value.length === 0) {
        hasErrors.value = false
    }
}, { deep: true })
</script>



<!-- 

    <template>
      <GlobalForm mode="create" :loading="loading" submit-text="Save Product" submit-icon="save" @submit="handleSubmit"
        @cancel="closeModal">
      
        <GlobalFormSection :columns="2" title="Basic Information">
          <GlobalInput v-model="form.name" label="Name" />
          <GlobalInput v-model="form.price" label="Price" type="number" />
        </GlobalFormSection>
      </GlobalForm>
    </template>

    <template>
      <GlobalForm 
        mode="edit"
        :loading="loading"
        submit-text="Update"
        submit-icon="edit"
        submit-variant="success"
        cancel-text="Close"
        cancel-variant="ghost"
        @submit="handleUpdate"
        @cancel="closeModal"
      >
    
      </GlobalForm>
    </template>
-->