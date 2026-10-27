<!-- components/common/AiSuggestion.vue -->
<template>
    <!-- AI Suggestion Button -->
    <button v-if="hasAiSuggestionsProp && !readonly && !disabled" type="button" @click.stop.prevent="toggleSuggestions"
        class="absolute right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20"
        :title="hasSuggestions ? 'AI Suggestions' : 'Generate AI Suggestions'"
        :class="isLoading ? 'animate-pulse' : ''">
        <svg class="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span v-if="isLoading" class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
    </button>

    <!-- AI Suggestions Dropdown -->
    <div v-if="showDropdown && hasSuggestions" @click.stop.prevent
        class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto"
        ref="dropdownRef">
        <div class="p-2">
            <div class="flex items-center justify-between px-2 py-1.5 mb-1">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    <i class="fas fa-robot mr-1"></i> AI Suggestions
                </span>
                <span class="text-[10px] text-gray-400">Click to apply</span>
            </div>
            <button v-for="(suggestion, index) in suggestions" :key="index" type="button"
                @click.stop.prevent="applySuggestion(suggestion)"
                class="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span class="text-gray-700 dark:text-gray-300">{{ suggestion.label }}</span>
                <span class="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply →
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted, nextTick } from 'vue'
import { useAiSuggestionStore } from '@/stores/aiSuggestionStore'

const props = defineProps({
    aiSuggestions: {
        type: [Boolean, Array],
        default: null
    },
    aiLoading: {
        type: Boolean,
        default: false
    },
    componentType: { type: String, default: 'text-input' },
    label: { type: String, default: '' },
    value: { type: [String, Number], default: '' },
    required: { type: Boolean, default: false },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    // Extra data for the prompt (e.g. select options)
    extraContext: { type: Object, default: () => ({}) },
    fallback: { type: Boolean, default: true },
    fetchOnMount: { type: Boolean, default: true },
    maxSuggestions: { type: Number, default: 5 },
    tone: { type: String, default: 'professional' },
    // Unique ID for this instance
    instanceId: { type: String, default: () => `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
})

const emit = defineEmits([
    'apply',
    'fetch',
    'toggle',
    'update:suggestions'
])

const aiStore = useAiSuggestionStore()

// Local state
const showDropdown = ref(false)
const localSuggestions = ref([])
const isLoading = ref(false)
const isAutoFetch = ref(false)
const dropdownRef = ref(null)
const wrapperRef = ref(null)

// Computed
const hasAiSuggestionsProp = computed(() => {
    return props.aiSuggestions !== null && props.aiSuggestions !== undefined
})

const hasSuggestions = computed(() => {
    if (Array.isArray(props.aiSuggestions) && props.aiSuggestions.length > 0) {
        return true
    }
    if (localSuggestions.value && localSuggestions.value.length > 0) {
        return true
    }
    return false
})

const suggestions = computed(() => {
    if (Array.isArray(props.aiSuggestions) && props.aiSuggestions.length > 0) {
        return props.aiSuggestions
    }
    if (localSuggestions.value && localSuggestions.value.length > 0) {
        return localSuggestions.value
    }
    return []
})

const loading = computed(() => {
    return props.aiLoading || isLoading.value || aiStore.loading
})

// Methods
const toggleSuggestions = async (event) => {
    event?.stopPropagation()
    event?.preventDefault()

    if (showDropdown.value) {
        closeDropdown()
        return
    }

    if (hasSuggestions.value) {
        showDropdown.value = true
        emit('toggle', true)
    } else {
        await fetchSuggestions()
    }
}

const fetchSuggestions = async () => {
    isLoading.value = true

    try {
        if (props.aiSuggestions === true) {
            isAutoFetch.value = true
            const context = `${props.componentType}_${props.label || 'default'}_${props.instanceId}`

            if (aiStore.hasSuggestions(context)) {
                localSuggestions.value = aiStore.getSuggestionsForContext(context)
                showDropdown.value = true
                emit('toggle', true)
                emit('update:suggestions', localSuggestions.value)
                return
            }

            const result = await aiStore.generateForComponent(props.componentType, {
                label: props.label,
                value: props.value,
                required: props.required,
                min: props.min,
                max: props.max,
                fallback: props.fallback,
                ...props.extraContext
            })

            if (result.success) {
                localSuggestions.value = result.data
                showDropdown.value = true
                emit('toggle', true)
                emit('update:suggestions', localSuggestions.value)
            }
        } else {
            emit('fetch')
        }
    } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        if (props.fallback) {
            localSuggestions.value = getFallbackSuggestions()
            showDropdown.value = true
            emit('toggle', true)
            emit('update:suggestions', localSuggestions.value)
        }
    } finally {
        isLoading.value = false
    }
}

const getFallbackSuggestions = () => {
    const fallbacks = {
        'number': [
            { label: 'Minimum', value: props.min || 1 },
            { label: 'Recommended', value: Math.floor(((props.min || 0) + (props.max || 100)) / 2) },
            { label: 'Maximum', value: props.max || 100 }
        ],
        'text-input': [
            { label: 'Example 1', value: 'Example value 1' },
            { label: 'Example 2', value: 'Example value 2' },
            { label: 'Example 3', value: 'Example value 3' }
        ]
    }
    return fallbacks[props.componentType] || fallbacks['text-input']
}

const applySuggestion = (suggestion) => {
    showDropdown.value = false
    emit('toggle', false)
    emit('apply', suggestion.value)
}

const closeDropdown = () => {
    showDropdown.value = false
    emit('toggle', false)
}

// Watch for external suggestions
watch(() => props.aiSuggestions, (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
        showDropdown.value = true
        emit('toggle', true)
    }
}, { deep: true })

// Watch for showDropdown changes
watch(showDropdown, (newVal) => {
    if (newVal) {
        // Use nextTick to ensure DOM is updated
        nextTick(() => {
            // Find the wrapper element
            const wrapper = document.querySelector(`[data-ai-instance="${props.instanceId}"]`)
            if (wrapper) {
                wrapperRef.value = wrapper
            }
        })
        document.addEventListener('click', handleOutsideClick)
    } else {
        document.removeEventListener('click', handleOutsideClick)
    }
})

const handleOutsideClick = (event) => {
    // Check if click is outside this specific AI instance
    const wrapper = document.querySelector(`[data-ai-instance="${props.instanceId}"]`)
    if (wrapper && !wrapper.contains(event.target)) {
        closeDropdown()
    }
}

// Auto-fetch on mount if aiSuggestions is true
onMounted(() => {
    if (props.aiSuggestions === true && props.fetchOnMount) {
        setTimeout(() => {
            fetchSuggestions()
        }, 300)
    }
})

// Cleanup
onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
})

// Expose methods
defineExpose({
    toggle: toggleSuggestions,
    fetch: fetchSuggestions,
    close: closeDropdown,
    showDropdown: showDropdown
})
</script>

<style scoped>
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes ping {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.animate-pulse {
    animation: pulse 1.5s ease-in-out infinite;
}

.animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Ensure AI dropdown stays on top */
.z-100 {
    z-index: 100;
}
</style>