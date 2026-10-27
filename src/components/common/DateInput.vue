<template>
    <div class="relative w-full">
        <!-- Label -->
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative">
            <!-- Native Date Input -->
            <input v-if="!flatPicker" type="date" :value="inputValue" :disabled="disabled" :readonly="readonly"
                :placeholder="placeholder" :min="computedMin" :max="computedMax" :step="step"
                :autocomplete="autocomplete" :class="inputClass" @input="handleInput" @blur="handleBlur"
                @focus="handleFocus" ref="dateInput" />

            <!-- Flatpickr Date Input -->
            <flat-pickr v-else :modelValue="flatpickrValue" :config="flatpickrConfig" :disabled="disabled"
                :placeholder="placeholder" :class="inputClass" @update:modelValue="handleFlatpickrUpdate"
                @onChange="handleFlatpickrChange" @onOpen="handleFlatpickrOpen" @onClose="handleFlatpickrClose"
                ref="flatpickrInput" />

            <!-- Left Icon (Calendar) -->
            <div v-if="leftIcon" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <component :is="leftIcon" class="h-5 w-5 text-gray-400" />
            </div>

            <!-- Default Calendar Icon (Left) -->
            <div v-else-if="showDefaultIcon"
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18" />
                </svg>
            </div>

            <!-- Right Icon -->
            <div v-if="rightIcon && !isLoading" @click="handleRightIconClick"
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

            <!-- Clear Button -->
            <button v-if="clearable && displayValue && !disabled && !readonly" type="button" @click="clear"
                class="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none">
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <!-- Date Picker Toggle Button -->
            <button v-if="showPickerToggle" type="button" @click="togglePicker"
                class="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none">
                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18" />
                </svg>
            </button>
        </div>

        <!-- Helper Text -->
        <p v-if="helperText && !hasError" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ helperText }}
        </p>

        <!-- Error Message -->
        <p v-if="hasError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ errorMessage }}
        </p>

        <!-- Date Format Hint -->
        <p v-if="showFormatHint && !hasError" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Format: {{ flatPicker ? flatpickrDateFormat : dateFormat }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, useAttrs, normalizeClass } from 'vue'
import FlatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const attrs = useAttrs()

const props = defineProps({
    modelValue: [String, Date, null],
    label: String,
    placeholder: { type: String, default: 'Select date' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    helperText: String,
    min: [String, Date],
    max: [String, Date],
    step: { type: String, default: '1' },
    autocomplete: { type: String, default: 'off' },
    leftIcon: Object,
    rightIcon: Object,
    clearable: { type: Boolean, default: true },
    isLoading: { type: Boolean, default: false },
    showFormatHint: { type: Boolean, default: false },
    showPickerToggle: { type: Boolean, default: false },
    showDefaultIcon: { type: Boolean, default: true },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    minDate: { type: String, default: null },
    maxDate: { type: String, default: null },
    validateDate: { type: Function, default: null },
    // Flatpickr props
    flatPicker: { type: Boolean, default: false },
    flatpickrDateFormat: { type: String, default: 'Y-m-d' },
    flatpickrOptions: { type: Object, default: () => ({}) },
    enableTime: { type: Boolean, default: false },
    time24hr: { type: Boolean, default: true },
    enableSeconds: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'clear', 'right-icon-click', 'picker-toggle'])

const dateInput = ref(null)
const flatpickrInput = ref(null)
const inputValue = ref(formatDateForInput(props.modelValue))
const flatpickrValue = ref(props.modelValue)
const isUpdating = ref(false)

// Format date for input field
function formatDateForInput(value) {
    if (!value) return ''
    if (value instanceof Date) {
        return value.toISOString().split('T')[0]
    }
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value
        }
        const parsed = new Date(value)
        if (!isNaN(parsed)) {
            return parsed.toISOString().split('T')[0]
        }
        return value
    }
    return ''
}

// Get display value for clear button
const displayValue = computed(() => {
    if (props.flatPicker) {
        return flatpickrValue.value
    }
    return inputValue.value
})

// Flatpickr configuration
const flatpickrConfig = computed(() => {
    const config = {
        dateFormat: props.flatpickrDateFormat,
        enableTime: props.enableTime,
        time_24hr: props.time24hr,
        enableSeconds: props.enableSeconds,
        ...props.flatpickrOptions
    }

    if (computedMin.value) {
        config.minDate = computedMin.value
    }
    if (computedMax.value) {
        config.maxDate = computedMax.value
    }

    if (props.validateDate) {
        config.disable = [
            (date) => {
                const dateStr = date.toISOString().split('T')[0]
                return !props.validateDate(dateStr)
            }
        ]
    }

    return config
})

// Compute min/max dates
const computedMin = computed(() => {
    if (props.minDate) {
        const date = getDynamicDate(props.minDate)
        return date ? formatDateForInput(date) : null
    }
    if (props.min) {
        return formatDateForInput(props.min)
    }
    return null
})

const computedMax = computed(() => {
    if (props.maxDate) {
        const date = getDynamicDate(props.maxDate)
        return date ? formatDateForInput(date) : null
    }
    if (props.max) {
        return formatDateForInput(props.max)
    }
    return null
})

// Handle dynamic date strings
function getDynamicDate(dynamicStr) {
    if (!dynamicStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const map = {
        'today': today,
        'yesterday': new Date(today.getTime() - 86400000),
        'tomorrow': new Date(today.getTime() + 86400000),
        'startOfWeek': new Date(today.getTime() - today.getDay() * 86400000),
        'endOfWeek': new Date(today.getTime() + (6 - today.getDay()) * 86400000),
        'startOfMonth': new Date(today.getFullYear(), today.getMonth(), 1),
        'endOfMonth': new Date(today.getFullYear(), today.getMonth() + 1, 0),
        'startOfYear': new Date(today.getFullYear(), 0, 1),
        'endOfYear': new Date(today.getFullYear(), 11, 31)
    }

    return map[dynamicStr.toLowerCase()] || null
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
    if (isUpdating.value) return

    if (props.flatPicker) {
        flatpickrValue.value = newVal
    } else {
        inputValue.value = formatDateForInput(newVal)
    }
}, { immediate: true })

// Handle native input
const handleInput = (event) => {
    if (isUpdating.value) return

    const value = event.target.value
    inputValue.value = value

    let finalValue = value

    if (props.validateDate && value) {
        const isValid = props.validateDate(value)
        if (!isValid) {
            return
        }
    }

    if (value) {
        const parsedDate = new Date(value)
        if (!isNaN(parsedDate)) {
            finalValue = parsedDate
        }
    } else {
        finalValue = null
    }

    isUpdating.value = true
    emit('update:modelValue', finalValue)
    emit('change', finalValue)
    nextTick(() => {
        isUpdating.value = false
    })
}

// Handle Flatpickr update
const handleFlatpickrUpdate = (value) => {
    if (isUpdating.value) return

    isUpdating.value = true
    flatpickrValue.value = value
    emit('update:modelValue', value)
    nextTick(() => {
        isUpdating.value = false
    })
}

// Handle Flatpickr change
const handleFlatpickrChange = (selectedDates, dateStr, instance) => {
    if (isUpdating.value) return

    const value = selectedDates[0] || null

    if (props.validateDate && value) {
        const dateStr = value.toISOString().split('T')[0]
        const isValid = props.validateDate(dateStr)
        if (!isValid) {
            // Revert to previous value
            instance.setDate(flatpickrValue.value, false)
            return
        }
    }

    isUpdating.value = true
    flatpickrValue.value = value
    emit('update:modelValue', value)
    emit('change', value)
    nextTick(() => {
        isUpdating.value = false
    })
}

// Handle Flatpickr open/close
const handleFlatpickrOpen = () => {
    emit('focus', null)
}

const handleFlatpickrClose = (selectedDates, dateStr, instance) => {
    emit('blur', null)
}

const handleBlur = (event) => {
    if (isUpdating.value) return

    if (!props.flatPicker && inputValue.value) {
        const date = new Date(inputValue.value)
        if (isNaN(date)) {
            emit('blur', event)
            return
        }

        if (computedMin.value && inputValue.value < computedMin.value) {
            isUpdating.value = true
            inputValue.value = computedMin.value
            const correctedDate = new Date(computedMin.value)
            emit('update:modelValue', correctedDate)
            emit('change', correctedDate)
            nextTick(() => {
                isUpdating.value = false
            })
        } else if (computedMax.value && inputValue.value > computedMax.value) {
            isUpdating.value = true
            inputValue.value = computedMax.value
            const correctedDate = new Date(computedMax.value)
            emit('update:modelValue', correctedDate)
            emit('change', correctedDate)
            nextTick(() => {
                isUpdating.value = false
            })
        }
    }
    emit('blur', event)
}

const handleFocus = (event) => {
    emit('focus', event)
}

const handleRightIconClick = () => {
    emit('right-icon-click')
}

const clear = () => {
    if (isUpdating.value) return

    isUpdating.value = true
    inputValue.value = ''
    flatpickrValue.value = null
    emit('clear')
    emit('update:modelValue', null)
    nextTick(() => {
        isUpdating.value = false
    })
}

const togglePicker = () => {
    if (props.flatPicker && flatpickrInput.value) {
        flatpickrInput.value.fp.open()
    } else if (dateInput.value) {
        dateInput.value.showPicker?.()
    }
    emit('picker-toggle')
}

// Validation
const hasError = computed(() => {
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

// CSS Classes
const inputClass = computed(() => {
    const baseClasses = 'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors'
    const paddingClasses = (props.leftIcon || props.showDefaultIcon) ? 'pl-10' : 'pl-3'
    const customClasses = normalizeClass(attrs.class)
    const hasCustomVerticalPadding = customClasses
        .split(/\s+/)
        .some(className => /^!?p(y|t|b)?-/.test(className))

    let rightPadding = 'pr-3'
    if (props.clearable || props.rightIcon || props.isLoading || props.showPickerToggle) {
        rightPadding = 'pr-10'
    }

    const colorClasses = hasError.value
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'

    const stateClasses = props.disabled
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
        : props.readonly
            ? 'bg-gray-50 dark:bg-gray-800 cursor-default'
            : 'bg-white dark:bg-gray-700'

    const verticalPadding = hasCustomVerticalPadding ? '' : 'py-2'

    return `${baseClasses} ${paddingClasses} ${rightPadding} ${verticalPadding} ${customClasses} ${colorClasses} ${stateClasses}`
})

// Expose methods
defineExpose({
    focus: () => {
        if (props.flatPicker && flatpickrInput.value) {
            flatpickrInput.value.fp.open()
        } else {
            dateInput.value?.focus()
        }
    },
    blur: () => {
        if (props.flatPicker && flatpickrInput.value) {
            flatpickrInput.value.fp.close()
        } else {
            dateInput.value?.blur()
        }
    },
    clear,
    togglePicker,
    showPicker: () => {
        if (props.flatPicker && flatpickrInput.value) {
            flatpickrInput.value.fp.open()
        } else {
            dateInput.value?.showPicker?.()
        }
    }
})
</script>

<style scoped>
/* Style for native date input */
input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

input[type="date"]::-webkit-datetime-edit {
    padding: 0;
}

input[type="date"] {
    color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    color: transparent;
}

/* Flatpickr overrides */
:deep(.flatpickr-input) {
    background: transparent !important;
}

:deep(.flatpickr-calendar) {
    @apply shadow-lg rounded-lg border border-gray-200 dark:border-gray-700;
}

:deep(.flatpickr-day.selected) {
    @apply bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700;
}

:deep(.flatpickr-day.today) {
    @apply border-blue-500;
}

:deep(.flatpickr-day:hover) {
    @apply bg-gray-100 dark:bg-gray-700;
}

:deep(.flatpickr-months .flatpickr-month) {
    @apply text-gray-700 dark:text-gray-300;
}

:deep(.flatpickr-weekdays) {
    @apply text-gray-600 dark:text-gray-400;
}

:deep(.flatpickr-day) {
    @apply text-gray-700 dark:text-gray-300;
}

:deep(.flatpickr-day.disabled) {
    @apply text-gray-400 dark:text-gray-600;
}

:deep(.flatpickr-current-month .flatpickr-monthDropdown-months) {
    @apply bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300;
}
</style>

<!-- 
npm install vue-flatpickr-component flatpickr
  
    <DateInput 
        v-model="form.date" 
        label="Select Date"
        required 
        :clearable="true"
    />
    
    <DateInput v-model="form.date" label="Select Date" @update:model-value="handleFilterChange" required
        :clearable="true" />

<DateInput v-model="filters.to_date" label="Event Date" :flat-picker="true"
    flatpickrDateFormat="Y-m-d" :clearable="true" :min="'today'"
     @update:model-value="handleFilterChange" />  

    <DateInput 
        v-model="form.flatpickrDate" 
        label="Select Date with Flatpickr" 
        :flat-picker="true"
        :clearable="true"
        flatpickrDateFormat="Y-m-d"
    />

    <DateInput 
        v-model="form.datetime" 
        label="Select Date & Time" 
        :flat-picker="true"
        :enable-time="true"
        :time-24hr="true"
        flatpickrDateFormat="Y-m-d H:i"
    />

    <DateInput 
        v-model="form.customDate" 
        label="Custom Flatpickr" 
        :flat-picker="true"
        :flatpickr-options="{
            minDate: 'today',
            disable: [
                function(date) {
                    return date.getDay() === 0 || date.getDay() === 6;
                }
            ],
            locale: {
                firstDayOfWeek: 1
            }
        }"
    />

    <DateInput 
        v-model="form.bookingDate" 
        label="Booking Date" 
        :flat-picker="true"
        :validateDate="isWeekday"
        :error="dateError"
    />

    <DateInput 
        v-model="form.eventDate" 
        label="Event Date" 
        :flat-picker="true"
        minDate="today"
        maxDate="endOfMonth"
        helperText="Select a date between today and end of month"
    />

    <DateInput v-model="date" label="Select Date" :flat-picker="true" flatpickrDateFormat="Y-m-d" />
    
      Flatpickr with time  
    <DateInput v-model="datetime" label="Select Date & Time" :flat-picker="true" :enable-time="true"
        flatpickrDateFormat="Y-m-d H:i" />

<script setup>
import { ref } from 'vue'

const form = ref({
    date: new Date(),
    flatpickrDate: null,
    datetime: null,
    customDate: null,
    bookingDate: null,
    eventDate: null
})

const dateError = ref('')

const isWeekday = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    if (day === 0 || day === 6) {
        dateError.value = 'Weekends are not available for booking'
        return false
    }
    dateError.value = ''
    return true
}
</script>

-->