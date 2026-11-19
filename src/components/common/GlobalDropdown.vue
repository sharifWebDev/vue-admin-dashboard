<!-- components/common/GlobalDropdown.vue -->
<template>
    <SearchSelectInput v-model="selectedValue" :options="options" :label="label"
        :placeholder="placeholder || `Select ${storeDisplayName}...`" :value-key="valueKey" :label-key="labelKey"
        :error="error" :required="required" :disabled="disabled" :selected-item="selectedValue" :ai-suggestions="aiSuggestions" :ai-loading="aiLoading" @ai-suggest="$emit('ai-suggest')"
        @update:modelValue="handleUpdate" @change="handleChange" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SearchSelectInput from '@/components/common/SearchSelect.vue'

// Dynamic import for stores
const storeModules = import.meta.glob('@/stores/*Store.js', { eager: true })

const props = defineProps({
    // Value binding
    modelValue: [String, Number],
    aiSuggestions: { type: [Boolean, Array], default: null },
    aiLoading: { type: Boolean, default: false },

    // Store configuration
    storeName: {
        type: String,
        required: true,
        description: 'Name of the store (e.g., "categoryStore", "productStore")'
    },

    // Display
    label: { type: [String, Boolean], required: false, default: "" },
    placeholder: { type: String, default: '' },
    storeDisplayName: { type: String, default: '' },

    // Options configuration
    valueKey: { type: String, default: 'id' },
    labelKey: { type: String, default: 'name' },

    // Behavior
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },

    // Error
    error: { type: [Array, String, Object], default: null },

    // Fetch parameters
    fetchParams: { type: Object, default: () => ({}) },
    fetchOnMount: { type: Boolean, default: true },

    // Custom data transformer
    transformData: { type: Function, default: null },

    // Hidden ID
    hiddenId: { type: [String, Number], default: null }
})

const emit = defineEmits([
    'ai-suggest',
    'update:modelValue',
    'update:hiddenId',
    'select',
    'clear',
    'search',
    'populate',
    'loading',
    'error'
])

// State
const selectedValue = ref(props.modelValue)
const options = ref([])
const isLoading = ref(false)
const storeInstance = ref(null)

// Computed
const storeDisplayNameFinal = computed(() => {
    if (props.storeDisplayName) return props.storeDisplayName
    // Extract store name from storeName (e.g., "categoryStore" -> "Category")
    const name = props.storeName.replace(/Store$/i, '')
    return name.charAt(0).toUpperCase() + name.slice(1)
})

// Get store instance
const getStore = () => {
    if (storeInstance.value) return storeInstance.value

    try {
        // Try to get store from props.storeName
        const storePath = `/src/stores/${props.storeName}.js`
        const storeModule = storeModules[storePath]

        if (storeModule) {
            // Find the store function (Pinia uses useStoreName pattern)
            const baseName = props.storeName.replace(/Store$/i, '')
            const pascalBaseName = baseName.charAt(0).toUpperCase() + baseName.slice(1)
            const pascalStoreName = props.storeName.charAt(0).toUpperCase() + props.storeName.slice(1)

            const candidateFunctionNames = [
                `use${pascalBaseName}Store`,
                `use${pascalStoreName}`,
                `use${baseName}Store`,
                `use${props.storeName}`
            ]

            const useStoreFn = candidateFunctionNames
                .map(name => storeModule[name])
                .find(fn => typeof fn === 'function') || storeModule.default

            if (typeof useStoreFn === 'function') {
                storeInstance.value = useStoreFn()
                return storeInstance.value
            }
        }
    } catch (error) {
        console.error(`Failed to load store: ${props.storeName}`, error)
        emit('error', error)
    }

    return null
}

// Fetch data from store
const fetchData = async (search = '') => {
    const store = getStore()
    if (!store) {
        console.warn('No store instance available for', props.storeName)
        return
    }

    isLoading.value = true
    emit('loading', true)

    try {
        // Prepare fetch parameters
        const params = {
            ...props.fetchParams,
            search: search || props.fetchParams?.search || '',
            per_page: props.fetchParams?.per_page || 100
        }

        let result = null

        // Try different store methods
        if (typeof store.getAll === 'function') {
            result = await store.getAll(params)
        } else if (typeof store.fetchAll === 'function') {
            result = await store.fetchAll(params)
        } else if (typeof store.getItems === 'function') {
            result = await store.getItems(params)
        } else if (typeof store.fetch === 'function') {
            result = await store.fetch(params)
        } else if (typeof store.get === 'function') {
            result = await store.get(params)
        } else {
            // Try to access items directly
            if (store.items && Array.isArray(store.items)) {
                result = { data: store.items }
            } else if (store.list && Array.isArray(store.list)) {
                result = { data: store.list }
            } else if (store.data && Array.isArray(store.data)) {
                result = { data: store.data }
            } else {
                console.warn(`Store ${props.storeName} doesn't have a fetch method`)
                return
            }
        }

        // Extract data from result
        let data = []
        if (result) {
            if (result.data && Array.isArray(result.data)) {
                data = result.data
            } else if (Array.isArray(result)) {
                data = result
            } else if (result.items && Array.isArray(result.items)) {
                data = result.items
            } else if (result.list && Array.isArray(result.list)) {
                data = result.list
            }
        }

        // Apply custom transformation if provided
        if (props.transformData && typeof props.transformData === 'function') {
            data = props.transformData(data)
        }

        options.value = data
        emit('populate', data)

        return { success: true, data }
    } catch (error) {
        console.error(`Error fetching data from ${props.storeName}:`, error)
        emit('error', error)
        return { success: false, error }
    } finally {
        isLoading.value = false
        emit('loading', false)
    }
}

// Event handlers
const handleUpdate = (value) => {
    selectedValue.value = value
    emit('update:modelValue', value)
}

const handleChange = (value, item) => {
    if (value === '' || value === null || value === undefined) {
        emit('clear')
        emit('update:hiddenId', null)
        return
    }

    // Find the selected item to get hidden ID
    const selectedItem = options.value.find(opt => String(opt[props.valueKey]) === String(value))
    const hiddenId = selectedItem?.hidden_id || null

    if (hiddenId) {
        emit('update:hiddenId', hiddenId)
    }

    emit('select', { value, hiddenId, option: selectedItem })
}

// Initialize
onMounted(async () => {
    if (props.fetchOnMount) {
        await fetchData()
    }
})

// Watch for store name changes
watch(() => props.storeName, () => {
    storeInstance.value = null
    if (props.fetchOnMount) {
        fetchData()
    }
})

// Watch for model value changes
watch(() => props.modelValue, (newVal) => {
    selectedValue.value = newVal
})

// Watch for fetch params changes
watch(() => props.fetchParams, () => {
    if (props.fetchOnMount) {
        fetchData()
    }
}, { deep: true })

// Expose methods
defineExpose({
    fetchData,
    options,
    isLoading,
    selectedValue
})
</script>




<!-- 


<template>
  <GlobalDropdown
    v-model="selectedProductId"
    v-model:hiddenId="hiddenProductId"
    label="Product"
    store-name="productStore"
    placeholder="Search products..."
    value-key="id"
    label-key="name"
    :fetch-params="{ per_page: 50, is_active: true }"
    :fetch-on-mount="true"
    @select="handleSelect"
  />
</template>

<script setup>
import { ref } from 'vue'
import GlobalDropdown from '@/components/common/GlobalDropdown.vue'

const selectedProductId = ref(null)
const hiddenProductId = ref(null)

const handleSelect = ({ value, hiddenId, option }) => {
  console.log('Selected:', value, hiddenId, option)
}
</script>
-->

<!-- 
<template>
  <div class="space-y-4">
 
<GlobalDropdown v-model="selectedCategoryId" label="Category" store-name="categoryStore" placeholder="Select category"
    @select="handleCategorySelect" />
 
<GlobalDropdown v-model="selectedProductId" label="Product" store-name="productStore" placeholder="Select product"
    :fetch-params="{ category_id: selectedCategoryId }" :disabled="!selectedCategoryId" @select="handleProductSelect" />
 
<GlobalDropdown v-model="selectedVariantId" label="Variant" store-name="variantStore" placeholder="Select variant"
    :fetch-params="{ product_id: selectedProductId }" :disabled="!selectedProductId" @select="handleVariantSelect" />
</div>
</template>

<script setup>
import { ref } from 'vue'
import GlobalDropdown from '@/components/common/GlobalDropdown.vue'

const selectedCategoryId = ref(null)
const selectedProductId = ref(null)
const selectedVariantId = ref(null)

const handleCategorySelect = ({ value }) => {
  selectedCategoryId.value = value
  selectedProductId.value = null // Reset
  selectedVariantId.value = null // Reset
}

const handleProductSelect = ({ value }) => {
  selectedProductId.value = value
  selectedVariantId.value = null // Reset
}

const handleVariantSelect = ({ value, option }) => {
  console.log('Selected variant:', value, option)
}
</script>

-->



<!-- 


<template>
  <form @submit.prevent="submitForm">
    <GlobalDropdown
      v-model="form.product_id"
      label="Product"
      store-name="productStore"
      :required="true"
      :error="errors.product_id"
      @select="clearError('product_id')"
    />
    
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import GlobalDropdown from '@/components/common/GlobalDropdown.vue'

const form = reactive({
  product_id: null
})

const errors = reactive({
  product_id: null
})

const clearError = (field) => {
  errors[field] = null
}

const submitForm = () => {
  if (!form.product_id) {
    errors.product_id = ['Please select a product']
    return
  }
  // Submit logic...
}
</script>

-->