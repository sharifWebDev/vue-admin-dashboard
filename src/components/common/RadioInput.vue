<template>
    <div class="relative w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div :class="[
            'space-y-2',
            layout === 'horizontal' ? 'flex flex-wrap gap-6' : '',
            layout === 'status' ? 'flex items-center space-x-6' : ''
        ]">
            <label v-for="option in options" :key="option[valueKey]" :class="[
                'inline-flex items-center cursor-pointer',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
                layout === 'horizontal' ? 'mr-4' : '',
                layout === 'status' ? 'cursor-pointer' : ''
            ]">
                <!-- পরিবর্তন এখানে: v-model এর বদলে :checked ব্যবহার করা হয়েছে, যা টাইপ ছাড়া শুধু ভ্যালু (==) মেলাবে -->
                <input type="radio" :value="option[valueKey]" :checked="props.modelValue == option[valueKey]"
                    :disabled="disabled || option.disabled" :name="name" :class="getRadioClass(option)"
                    @change="handleRadioChange(option[valueKey])" />

                <span :class="[
                    'ml-2 text-sm',
                    getTextColorClass(option)
                ]">
                    {{ option[labelKey] }}
                </span>

                <!-- Optional Description -->
                <p v-if="option.description" class="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-0">
                    {{ option.description }}
                </p>
            </label>
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
import { computed, useAttrs, normalizeClass } from 'vue'

const attrs = useAttrs()

const props = defineProps({
    modelValue: [String, Number, Boolean],
    options: { type: Array, default: () => [] },
    label: String,
    name: String,
    valueKey: { type: String, default: 'value' },
    labelKey: { type: String, default: 'label' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    layout: { type: String, default: 'vertical' }, // vertical, horizontal, status
    variant: { type: String, default: 'default' }, // default, card, button
    activeColor: { type: String, default: 'green' }, // green, blue, purple, etc.
    inactiveColor: { type: String, default: 'red' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const hasError = computed(() => {
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

// নতুন চেঞ্জ হ্যান্ডেলার ফাংশন
const handleRadioChange = (value) => {
    emit('update:modelValue', value)
    emit('change', value)
}

const getRadioClass = (option) => {
    const baseClasses = 'h-4 w-4 focus:ring-2 focus:ring-opacity-50 transition-colors duration-200'
    const customClasses = normalizeClass(attrs.class)

    if (props.layout === 'status') {
        const value = option[props.valueKey]

        if (value == 1 || value == true || value == '1' || value == 'true') {
            return `${baseClasses} text-green-600 focus:ring-green-500 border-green-300 dark:border-green-600 accent-green-600 ${customClasses}`
        }
        else if (value == 0 || value == false || value == '0' || value == 'false') {
            return `${baseClasses} text-red-600 focus:ring-red-500 border-red-300 dark:border-red-600 accent-red-600 ${customClasses}`
        }
    }

    if (props.variant === 'button') {
        return `${baseClasses} hidden ${customClasses}`
    }

    return `${baseClasses} text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 ${customClasses}`
}

const getTextColorClass = (option) => {
    if (props.layout === 'status') {
        const value = option[props.valueKey]

        if (value == 1 || value == true || value == '1' || value == 'true') {
            return 'text-green-600 dark:text-green-400 font-medium'
        } else if (value == 0 || value == false || value == '0' || value == 'false') {
            return 'text-red-600 dark:text-red-400 font-medium'
        }
    }

    return 'text-gray-700 dark:text-gray-300'
}

defineExpose({
    clearError: () => { }
})
</script>

<style scoped>
/* আপনার আগের CSS স্টাইলগুলো অপরিবর্তিত থাকবে */
input[type="radio"] {
    accent-color: none !important;
    transition: all 0.2s ease;
}

label:hover input[type="radio"]:not(:disabled) {
    transform: scale(1.05);
}

input[type="radio"].text-green-600:checked {
    background-color: #22c55e;
    border-color: #22c55e;
}

input[type="radio"].text-red-600:checked {
    background-color: #ef4444;
    border-color: #ef4444;
}
</style>
<!-- Radio Input -->
<!-- <RadioInput v-model="form.gender" label="Gender" :options="genderOptions" value-key="value" label-key="label"
    layout="horizontal" /> 
    
    <RadioInput v-model="formData.status" label="Status" :options="statusOptions" value-key="value" label-key="label"
        layout="status" active-color="green" inactive-color="red" :error="warehouseStore.validationErrors?.status" />
     
    const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' }
    ]
    -->
