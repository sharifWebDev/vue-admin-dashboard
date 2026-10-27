<!-- components/common/GlobalViewModal.vue -->
<template>
    <BaseModal :show="isOpen" :title="title || 'View Details'" :maxWidth="maxWidth || '2xl'" @close="handleClose">
        <div class="px-4 md:px-6 py-3">
            <!-- Header Section with Icon and Title -->
            <div v-if="showHeader"
                class="flex items-center space-x-4 mb-4 pb-3">
                <div class="h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="headerIconBgClass || 'bg-gray-100 dark:bg-gray-700'">
                    <i :class="headerIconClass || 'fas fa-info-circle text-gray-500 dark:text-gray-400 text-2xl'"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {{ getHeaderTitle() }}
                    </h3>
                    <p v-if="getHeaderSubtitle()" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ getHeaderSubtitle() }}
                    </p>
                </div>
                <!-- Status Badge -->
                <span v-if="showStatus && item" class="px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                    :class="getStatusClass(item)">
                    {{ getStatusText(item) }}
                </span>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <svg class="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>

            <!-- Content Area -->
            <div v-else>
                <!-- Custom Content Slot -->
                <slot name="content">
                    <!-- Default Grid Layout -->
                    <div :class="gridClass">
                        <!-- Dynamic Fields -->
                        <div v-for="field in displayFields" :key="field.key" :class="getFieldClass(field)">
                            <label
                                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {{ field.label }}
                            </label>
                            <div class="mt-1.5">
                                <!-- Custom Field Slot -->
                                <slot :name="`field-${field.key}`" :item="item" :value="getFieldValue(field.key)">
                                    <!-- Default Field Display -->
                                    <template v-if="field.type === 'image'">
                                        <img :src="getFieldValue(field.key)" :alt="field.label"
                                            class="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                                    </template>
                                    <template v-else-if="field.type === 'badge'">
                                        <span :class="getBadgeClass(getFieldValue(field.key), field)">
                                            {{ getFieldValue(field.key) || 'N/A' }}
                                        </span>
                                    </template>
                                    <template v-else-if="field.type === 'price'">
                                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ formatPrice(getFieldValue(field.key)) }}
                                        </p>
                                    </template>
                                    <template v-else-if="field.type === 'boolean'">
                                        <span :class="[
                                            'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                            getFieldValue(field.key)
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        ]">
                                            {{ getFieldValue(field.key) ? 'Yes' : 'No' }}
                                        </span>
                                    </template>
                                    <template v-else-if="field.type === 'date'">
                                        <p class="text-sm text-gray-900 dark:text-white">
                                            {{ formatDate(getFieldValue(field.key)) }}
                                        </p>
                                    </template>
                                    <template v-else-if="field.type === 'datetime'">
                                        <p class="text-sm text-gray-900 dark:text-white">
                                            {{ formatDateTime(getFieldValue(field.key)) }}
                                        </p>
                                    </template>
                                    <template v-else-if="field.type === 'currency'">
                                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ formatCurrency(getFieldValue(field.key), field.currency) }}
                                        </p>
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900 dark:text-white">
                                            {{ getFieldValue(field.key) || field.fallback || 'N/A' }}
                                        </p>
                                    </template>
                                </slot>
                            </div>
                        </div>
                    </div>
                </slot>

                <!-- Extra Content Slot -->
                <slot name="extra-content"></slot>

                <!-- Tabs Section -->
                <div v-if="tabs && tabs.length > 0" class="mt-6">
                    <div class="border-b border-gray-200 dark:border-gray-700">
                        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
                                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            ]">
                                <i v-if="tab.icon" :class="`fas fa-${tab.icon} mr-2`"></i>
                                {{ tab.label }}
                            </button>
                        </nav>
                    </div>
                    <div class="mt-4">
                        <slot :name="`tab-${activeTab}`">
                            <p class="text-sm text-gray-500 dark:text-gray-400">No content for this tab</p>
                        </slot>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 pb-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <slot name="actions">
                <Button type="button" :text="'Close'" btn-type="cancel" variant="outline" size="md"
                    @click="handleClose" />
                <Button v-if="showEditButton && hasEditPermission" type="button" btn-type="edit" text="Edit"
                    variant="primary" size="md" @click="handleEdit" />
            </slot>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
    // Visibility
    modelValue: { type: Boolean, default: false },

    // Data
    item: { type: Object, default: null },

    // Display Configuration
    title: { type: String, default: 'View Details' },
    maxWidth: { type: String, default: '2xl' },
    columns: { type: Number, default: 2 },
    responsive: { type: Boolean, default: true },

    // Header
    showHeader: { type: Boolean, default: true },
    headerIconClass: { type: String, default: 'fas fa-info-circle text-gray-500 dark:text-gray-400 text-2xl' },
    headerIconBgClass: { type: String, default: 'bg-gray-100 dark:bg-gray-700' },
    headerTitle: { type: String, default: '' },
    titleKey: { type: String, default: 'name' },
    subtitleKey: { type: String, default: '' },

    // Status
    showStatus: { type: Boolean, default: false },
    statusKey: { type: String, default: 'is_active' },
    statusLabels: {
        type: Object,
        default: () => ({
            true: 'Active',
            false: 'Inactive'
        })
    },
    statusClasses: {
        type: Object,
        default: () => ({
            true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            false: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        })
    },

    // Fields Configuration
    displayFields: {
        type: Array,
        default: () => [
            { key: 'name', label: 'Name' }
        ]
    },

    // Tabs
    tabs: { type: Array, default: () => [] },

    // Actions
    showEditButton: { type: Boolean, default: true },
    hasEditPermission: { type: Boolean, default: true },

    // Loading
    loading: { type: Boolean, default: false },

    // Formatters
    dateFormat: { type: String, default: 'MMM DD, YYYY' },
    timeFormat: { type: String, default: 'HH:mm' },
    currencySymbol: { type: String, default: '$' },
    locale: { type: String, default: 'en-US' }
})

const emit = defineEmits([
    'update:modelValue',
    'close',
    'edit',
    'view'
])

// State
const isOpen = ref(props.modelValue)
const activeTab = ref(props.tabs?.[0]?.key || '')

// Computed
const gridClass = computed(() => {
    if (props.responsive) {
        return `grid grid-cols-1 md:grid-cols-${props.columns} gap-6`
    }
    return `grid grid-cols-${props.columns} gap-6`
})

const getFieldClass = (field) => {
    if (field.colspan) {
        return `col-span-${field.colspan}`
    }
    if (field.fullWidth) {
        return `col-span-${props.columns}`
    }
    return 'col-span-1'
}

// Methods
const getFieldValue = (key) => {
    if (!props.item) return null

    const keys = key.split('.')
    let value = props.item
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k]
        } else {
            return null
        }
    }
    return value
}

// Header methods
const getHeaderTitle = () => {
    if (props.headerTitle) {
        // If headerTitle is a string like "item.name", resolve it
        if (props.headerTitle.includes('.')) {
            return getFieldValue(props.headerTitle) || 'Item Details'
        }
        return props.headerTitle
    }
    return getFieldValue(props.titleKey) || 'Item Details'
}

const getHeaderSubtitle = () => {
    if (props.subtitleKey) {
        return getFieldValue(props.subtitleKey) || ''
    }
    return ''
}

const getStatusText = (item) => {
    const status = getFieldValue(props.statusKey)
    return props.statusLabels[String(status)] || props.statusLabels[String(!!status)] || String(status)
}

const getStatusClass = (item) => {
    const status = getFieldValue(props.statusKey)
    return props.statusClasses[String(status)] || props.statusClasses[String(!!status)] || ''
}

const getBadgeClass = (value, field) => {
    if (field.badgeClasses && field.badgeClasses[String(value)]) {
        return field.badgeClasses[String(value)]
    }
    return 'px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded'
}

// Formatters
const formatPrice = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return Number(value).toFixed(2)
}

const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat(props.locale, {
        style: 'currency',
        currency: currency || 'USD'
    }).format(value)
}

const formatDate = (value) => {
    if (!value) return 'N/A'
    try {
        return new Date(value).toLocaleDateString(props.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch {
        return value
    }
}

const formatDateTime = (value) => {
    if (!value) return 'N/A'
    try {
        return new Date(value).toLocaleString(props.locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return value
    }
}

// Handlers
const handleClose = () => {
    isOpen.value = false
    emit('update:modelValue', false)
    emit('close')
}

const handleEdit = () => {
    emit('edit', props.item)
    handleClose()
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
    isOpen.value = newVal
    if (newVal) {
        emit('view', props.item)
        if (props.tabs && props.tabs.length > 0) {
            activeTab.value = props.tabs[0].key
        }
    }
})

// Watch internal changes
watch(isOpen, (newVal) => {
    if (newVal !== props.modelValue) {
        emit('update:modelValue', newVal)
    }
})

// Watch tabs changes
watch(() => props.tabs, (newTabs) => {
    if (newTabs && newTabs.length > 0 && !activeTab.value) {
        activeTab.value = newTabs[0].key
    }
}, { immediate: true })

// Expose
defineExpose({
    open: () => { isOpen.value = true },
    close: handleClose,
    edit: handleEdit
})
</script>


<!-- 
<template>
  <GlobalViewModal
    v-model="showViewModal"
    :item="viewingItem"
    title="Product Variant Details"
    :display-fields="variantViewFields"
    :show-status="true"
    status-key="is_active"
    header-icon-class="fas fa-cube text-blue-500 dark:text-blue-400 text-2xl"
    header-icon-bg-class="bg-blue-50 dark:bg-blue-900/30"
    @edit="editItem"
    @close="closeViewModal"
  >
    
    <template #field-product_id="{ item }">
        <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i class="fas fa-box text-gray-500 dark:text-gray-400"></i>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.product?.name }}
            </span>
        </div>
    </template>
  </GlobalViewModal>
</template>

<script setup>
import { ref } from 'vue'
import GlobalViewModal from '@/components/common/GlobalViewModal.vue'

const showViewModal = ref(false)
const viewingItem = ref(null)

const variantViewFields = [
  { key: 'product_id', label: 'Product' },
  { key: 'name', label: 'Variant Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'measurement_unit.name', label: 'Measurement Unit' },
  { key: 'purchase_cost', label: 'Purchase Cost', type: 'currency', currency: 'BDT' },
  { key: 'created_at', label: 'Created At', type: 'datetime' }
]

const viewItem = (item) => {
  viewingItem.value = item
  showViewModal.value = true
}

const editItem = (item) => {
  // Handle edit
  console.log('Edit item:', item)
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingItem.value = null
}
</script>

-->


<!-- Product view -->
<!-- 
<template>
  <GlobalViewModal
    v-model="showProductView"
    :item="product"
    title="Product Details"
    max-width="4xl"
    :columns="3"
    :display-fields="productFields"
    :tabs="productTabs"
    :show-status="true"
    status-key="is_active"
    header-icon-class="fas fa-boxes text-green-500 dark:text-green-400 text-2xl"
    header-icon-bg-class="bg-green-50 dark:bg-green-900/30"
    @edit="editProduct"
  >
    
    <template #field-image="{ item }">
      <img 
        :src="item.image_url || '/default-product.png'" 
        alt="Product"
        class="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
      />
    </template>
 
    <template #tab-variants>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Variant</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="variant in product?.variants" :key="variant.id">
              <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{{ variant.name }}</td>
              <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{{ variant.sku }}</td>
              <td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                {{ formatCurrency(variant.price) }}
              </td>
              <td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                {{ variant.stock || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
 
    <template #tab-packages>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="pkg in product?.packages" :key="pkg.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">{{ pkg.package_type?.name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ pkg.pieces_per_package }} pieces per package
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {{ formatCurrency(pkg.price) }}
                </p>
            </div>
        </div>
    </template>
  </GlobalViewModal>
</template>

<script setup>
import { ref } from 'vue'
import GlobalViewModal from '@/components/common/GlobalViewModal.vue'

const showProductView = ref(false)
const product = ref(null)

const productFields = [
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'name', label: 'Product Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'category.name', label: 'Category' },
  { key: 'brand.name', label: 'Brand' },
  { key: 'price', label: 'Price', type: 'currency', currency: 'BDT' },
  { key: 'stock', label: 'Stock Quantity', type: 'number' },
  { key: 'description', label: 'Description', fullWidth: true }
]

const productTabs = [
  { key: 'variants', label: 'Variants', icon: 'cubes' },
  { key: 'packages', label: 'Packages', icon: 'box' },
  { key: 'inventory', label: 'Inventory', icon: 'warehouse' }
]

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT'
  }).format(value)
}
</script>

 -->


<!-- profile view -->
<!-- 
<template>
  <GlobalViewModal
    v-model="showUserView"
    :item="user"
    title="User Profile"
    max-width="2xl"
    :columns="2"
    :display-fields="userFields"
    :show-status="true"
    status-key="is_active"
    header-icon-class="fas fa-user text-purple-500 dark:text-purple-400 text-2xl"
    header-icon-bg-class="bg-purple-50 dark:bg-purple-900/30"
    header-title="user.full_name"
    subtitle-key="user.email"
    @edit="editUser"
  > 
    <template #field-avatar="{ item }">
      <img 
        :src="item.avatar || '/default-avatar.png'" 
        alt="Avatar"
        class="h-16 w-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
      />
    </template>
 
    <template #field-role="{ item }">
        <span :class="[
            'px-3 py-1 text-xs font-semibold rounded-full',
            item.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                item.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        ]">
            {{ item.role || 'User' }}
        </span>
    </template>
  </GlobalViewModal>
</template>

<script setup>
import { ref } from 'vue'
import GlobalViewModal from '@/components/common/GlobalViewModal.vue'

const showUserView = ref(false)
const user = ref(null)

const userFields = [
  { key: 'avatar', label: 'Avatar', type: 'image' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone', type: 'phone' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'join_date', label: 'Join Date', type: 'date' },
  { key: 'last_login', label: 'Last Login', type: 'datetime' }
]
</script> 
-->



<!-- order view -->
<!-- 
<template>
    <GlobalViewModal v-model="showOrderView" :item="order" title="Order Details" max-width="4xl" :columns="3"
        :display-fields="orderFields" :show-status="true" status-key="status" :status-labels="orderStatusLabels"
        :status-classes="orderStatusClasses"
        header-icon-class="fas fa-shopping-cart text-orange-500 dark:text-orange-400 text-2xl"
        header-icon-bg-class="bg-orange-50 dark:bg-orange-900/30" @edit="editOrder">
        
        <template #tab-items>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Product</th>
                            <th
                                class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Qty</th>
                            <th
                                class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Price</th>
                            <th
                                class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-for="item in order?.items" :key="item.id">
                            <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {{ item.product?.name }}
                                <span class="text-xs text-gray-500 dark:text-gray-400 block">{{ item.variant?.name
                                    }}</span>
                            </td>
                            <td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{{ item.quantity }}
                            </td>
                            <td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                {{ formatCurrency(item.price) }}
                            </td>
                            <td class="px-4 py-2 text-sm font-semibold text-right text-gray-900 dark:text-white">
                                {{ formatCurrency(item.total) }}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <td colspan="3" class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                                Subtotal</td>
                            <td class="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                {{ formatCurrency(order?.subtotal) }}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3" class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                                Tax</td>
                            <td class="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                {{ formatCurrency(order?.tax) }}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3" class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                                Shipping</td>
                            <td class="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                {{ formatCurrency(order?.shipping) }}
                            </td>
                        </tr>
                        <tr class="border-t-2 border-gray-300 dark:border-gray-600">
                            <td colspan="3" class="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">Total
                            </td>
                            <td class="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">
                                {{ formatCurrency(order?.total) }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </template>
 
        <template #tab-shipping>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipping Address</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ order?.shipping_address?.street }}<br>
                        {{ order?.shipping_address?.city }}, {{ order?.shipping_address?.state }}<br>
                        {{ order?.shipping_address?.zip_code }}<br>
                        {{ order?.shipping_address?.country }}
                    </p>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipping Details</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        <span class="font-medium">Method:</span> {{ order?.shipping_method }}<br>
                        <span class="font-medium">Tracking:</span> {{ order?.tracking_number || 'N/A' }}<br>
                        <span class="font-medium">Estimated Delivery:</span> {{ formatDate(order?.estimated_delivery) }}
                    </p>
                </div>
            </div>
        </template>
    </GlobalViewModal>
</template>

<script setup>
import { ref } from 'vue'
import GlobalViewModal from '@/components/common/GlobalViewModal.vue'

const showOrderView = ref(false)
const order = ref(null)

const orderFields = [
  { key: 'order_number', label: 'Order #' },
  { key: 'customer.name', label: 'Customer' },
  { key: 'customer.email', label: 'Email', type: 'email' },
  { key: 'payment_method', label: 'Payment Method' },
  { key: 'total', label: 'Total Amount', type: 'currency', currency: 'BDT' },
  { key: 'created_at', label: 'Order Date', type: 'datetime' }
]

const orderStatusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const orderStatusClasses = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT'
  }).format(value)
}
</script>
 
-->