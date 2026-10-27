<template>
    <div class="relative w-full">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ label }}
            <span v-if="required" class="text-xs text-red-500">*</span>
        </label>

        <div class="relative">
            <!-- Search Icon -->
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <input type="text" v-model="searchQuery" :disabled="disabled" :placeholder="placeholder" :class="inputClass"
                @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keyup.enter="handleSearch" />

            <!-- Clear Button -->
            <button v-if="clearable && searchQuery && !disabled" type="button" @click="clearSearch"
                class="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none">
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <!-- Search Button -->
            <button v-if="showSearchButton" @click="handleSearch" :disabled="isSearching"
                class="absolute inset-y-0 right-0 flex items-center px-3 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white text-sm font-medium transition-colors disabled:opacity-50">
                <svg v-if="isSearching" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <span v-else>Search</span>
            </button>
        </div>

        <!-- Search Results -->
        <div v-if="showResults && filteredResults.length > 0 && !hideResults"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <ul class="py-1">
                <li v-for="item in filteredResults" :key="item[valueKey]" @click="selectResult(item)"
                    class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white">
                    <div class="flex items-center justify-between">
                        <span>{{ item[labelKey] }}</span>
                        <span v-if="item.subtitle" class="text-xs text-gray-500">{{ item.subtitle }}</span>
                    </div>
                    <p v-if="item.description" class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
                </li>
            </ul>
        </div>

        <!-- No Results -->
        <div v-if="showNoResults && searchQuery && filteredResults.length === 0 && !isSearching"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500">
            No results found for "{{ searchQuery }}"
        </div>

        <!-- Loading State -->
        <div v-if="isSearching && showLoading"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 text-center">
            <div class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <span>Searching...</span>
            </div>
        </div>

        <!-- Error Message -->
        <p v-if="hasError" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch, useAttrs, normalizeClass } from 'vue'

const attrs = useAttrs()

const props = defineProps({
    modelValue: [String, Number, Object],
    label: String,
    placeholder: { type: String, default: 'Search...' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: [Array, String, Object], default: null },
    options: { type: Array, default: () => [] },
    valueKey: { type: String, default: 'id' },
    labelKey: { type: String, default: 'name' },
    clearable: { type: Boolean, default: true },
    showSearchButton: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    showNoResults: { type: Boolean, default: true },
    showLoading: { type: Boolean, default: true },
    hideResults: { type: Boolean, default: false },
    debounceTime: { type: Number, default: 300 },
    minChars: { type: Number, default: 1 },
    searchOnFocus: { type: Boolean, default: false },
    filterLocally: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'search', 'select', 'clear'])

const searchQuery = ref('')
const isSearching = ref(false)
const isFocused = ref(false)
const searchTimeout = ref(null)
const localResults = ref([])

const hasError = computed(() => {
    if (!props.error) return false
    return Array.isArray(props.error) ? props.error.length > 0 : !!props.error
})

const errorMessage = computed(() => {
    if (Array.isArray(props.error)) return props.error[0]
    return props.error
})

const filteredResults = computed(() => {
    if (props.filterLocally && searchQuery.value.length >= props.minChars) {
        const query = searchQuery.value.toLowerCase()
        return props.options.filter(item =>
            String(item[props.labelKey]).toLowerCase().includes(query)
        )
    }
    return localResults.value
})

const inputClass = computed(() => {
    const baseClasses = 'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors'
    const paddingLeft = props.showSearchButton ? 'pl-10 pr-24' : 'pl-10 pr-10'
    const customClasses = normalizeClass(attrs.class)
    const hasCustomVerticalPadding = customClasses
        .split(/\s+/)
        .some(className => /^!?p(y|t|b)?-/.test(className))

    const colorClasses = hasError.value
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'

    const stateClasses = props.disabled
        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
        : 'bg-white dark:bg-gray-700'

    const verticalPadding = hasCustomVerticalPadding ? '' : 'py-2'

    return `${baseClasses} ${paddingLeft} ${verticalPadding} ${customClasses} ${colorClasses} ${stateClasses}`
})

const handleInput = () => {
    if (searchTimeout.value) clearTimeout(searchTimeout.value)

    if (searchQuery.value.length >= props.minChars) {
        searchTimeout.value = setTimeout(() => {
            performSearch()
        }, props.debounceTime)
    } else if (searchQuery.value.length === 0) {
        emit('clear')
        localResults.value = []
    }
}

const performSearch = async () => {
    if (props.disabled) return

    isSearching.value = true
    emit('search', searchQuery.value)

    // If not filtering locally, wait for parent to provide results
    if (!props.filterLocally) {
        // Parent should update options via prop
        isSearching.value = false
    } else {
        // Local filtering is done via computed property
        isSearching.value = false
    }
}

const handleSearch = () => {
    if (searchQuery.value.length >= props.minChars) {
        performSearch()
    }
}

const selectResult = (item) => {
    searchQuery.value = item[props.labelKey]
    emit('update:modelValue', item[props.valueKey])
    emit('select', item)
    localResults.value = []
}

const clearSearch = () => {
    searchQuery.value = ''
    localResults.value = []
    emit('clear')
    emit('update:modelValue', null)
}

const handleFocus = () => {
    isFocused.value = true
    if (props.searchOnFocus && searchQuery.value.length >= props.minChars) {
        performSearch()
    }
}

const handleBlur = () => {
    setTimeout(() => {
        isFocused.value = false
        localResults.value = []
    }, 200)
}

// Watch for external options updates
watch(() => props.options, (newOptions) => {
    if (!props.filterLocally) {
        localResults.value = newOptions
    }
}, { deep: true })
</script>
<!-- 
<SearchInput v-model="form.selectedUser" label="Search User" :options="users" label-key="name" value-key="id"
    @search="handleSearch" /> -->