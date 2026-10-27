<!-- components/common/TableRow.vue -->
<template>
    <tr class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <!-- SL Column -->
        <td v-if="showSl" class="px-2 md:px-6 py-2 md:py-4 whitespace-wrap text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            {{ rowNumber }}
        </td>

        <!-- Dynamic Columns -->
        <td v-for="column in columns" :key="column.key" class="px-6 py-4" :class="{
            'whitespace-normal': column.nowrap !== false,
            'text-right': column.align === 'right',
            'text-left': column.align === 'left',
            'text-center': column.align === 'center',
            'font-medium': column.bold,
            'text-sm': true,
            'text-gray-900 dark:text-white': !column.muted,
            'text-gray-500 dark:text-gray-400': column.muted
        }" :style="column.width ? { width: column.width } : {}">
            <!-- Custom Column Slot -->
            <slot :name="`column-${column.key}`" :item="item" :value="getColumnValue(column.key)">
                <!-- Default Display based on type -->
                <template v-if="column.type === 'image'">
                    <img :src="getColumnValue(column.key)" :alt="column.label"
                        class="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                </template>

                <template v-else-if="column.type === 'badge'">
                    <span :class="getBadgeClass(getColumnValue(column.key), column)">
                        {{ getColumnValue(column.key) || '-' }}
                    </span>
                </template>

                <template v-else-if="column.type === 'status'">
                    <span :class="getStatusClass(getColumnValue(column.key))">
                        <span class="mr-1.5 flex h-1.5 w-1.5 items-center justify-center inline-flex">
                            <span :class="getStatusDotClass(getColumnValue(column.key))"
                                class="h-1.5 w-1.5 rounded-full"></span>
                        </span>
                        {{ getStatusText(getColumnValue(column.key)) }}
                    </span>
                </template>

                <template v-else-if="column.type === 'currency'">
                    <span class="font-semibold">
                        {{ formatCurrency(getColumnValue(column.key), column.currency) }}
                    </span>
                </template>

                <template v-else-if="column.type === 'number'">
                    <span class="font-medium">
                        {{ formatNumber(getColumnValue(column.key)) }}
                    </span>
                </template>

                <template v-else-if="column.type === 'date'">
                    {{ formatDate(getColumnValue(column.key)) }}
                </template>

                <template v-else-if="column.type === 'datetime'">
                    {{ formatDateTime(getColumnValue(column.key)) }}
                </template>

                <template v-else-if="column.type === 'email'">
                    <a :href="`mailto:${getColumnValue(column.key)}`"
                        class="text-blue-600 dark:text-blue-400 hover:underline">
                        {{ getColumnValue(column.key) || '-' }}
                    </a>
                </template>

                <template v-else-if="column.type === 'phone'">
                    <a :href="`tel:${getColumnValue(column.key)}`"
                        class="text-blue-600 dark:text-blue-400 hover:underline">
                        {{ getColumnValue(column.key) || '-' }}
                    </a>
                </template>

                <template v-else-if="column.type === 'link'">
                    <a :href="getColumnValue(column.key)" target="_blank"
                        class="text-blue-600 dark:text-blue-400 hover:underline">
                        {{ column.linkText || getColumnValue(column.key) || '-' }}
                    </a>
                </template>

                <template v-else-if="column.type === 'array'">
                    <div class="flex flex-wrap gap-1">
                        <span v-for="(item, idx) in getColumnValue(column.key)" :key="idx"
                            class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {{ item }}
                        </span>
                    </div>
                </template>

                <template v-else-if="column.type === 'custom'">
                    <slot :name="`custom-${column.key}`" :item="item" :value="getColumnValue(column.key)" />
                </template>

                <!-- Default Text -->
                <template v-else>
                    {{ getColumnValue(column.key) || column.fallback || '-' }}
                </template>
            </slot>
        </td>

        <!-- Actions Column -->
        <td v-if="showActions" class="px-6 py-4 text-right text-sm font-medium">
            <div class="flex items-center justify-end space-x-1">
                <!-- View Button -->
                <Button v-if="showViewButton && hasPermission(viewPermission)" type="button" :icon="Eye" :text="false"
                    variant="ghost" size="sm"
                    custom-class="!p-2 !px-2 !py-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    :title="viewButtonTitle || 'Quick View'" @click="handleView" />

                <!-- Custom Actions Slot (Before EllipseButton) -->
                <slot name="actions-before" :item="item" />

                <!-- ✅ EllipseButton (replaces inline dropdown) -->
                <EllipseButton v-if="showDropdown && hasAnyDropdownAction" :permissions="ellipsePermissions"
                    :view-button="false" :edit-button="showEditButton" :delete-button="showDeleteButton"
                    :menu-title="ellipseMenuTitle" @edit="handleEdit" @delete="handleDelete">
                    <!-- Pass through custom dropdown items from parent -->
                    <template v-if="$slots['dropdown-items']" #default="{ close }">
                        <slot name="dropdown-items" :item="item" :close-dropdown="close" />
                    </template>
                </EllipseButton>

                <!-- Custom Actions Slot (After EllipseButton) -->
                <slot name="actions-after" :item="item" />
            </div>
        </td>
    </tr>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Button from './Button.vue'
import EllipseButton from './EllipseButton.vue'
import { Eye } from 'lucide-vue-next'

const props = defineProps({
    // Data
    item: { type: Object, required: true },
    rowNumber: { type: [String, Number], default: '' },

    // Columns Configuration
    columns: {
        type: Array,
        default: () => []
    },

    // SL Column
    showSl: { type: Boolean, default: true },

    // Actions
    showActions: { type: Boolean, default: true },
    showViewButton: { type: Boolean, default: true },
    showDropdown: { type: Boolean, default: true },
    showEditButton: { type: Boolean, default: true },
    showDeleteButton: { type: Boolean, default: true },

    // Permissions (String or Array)
    viewPermission: {
        type: [String, Array],
        default: ''
    },
    editPermission: {
        type: [String, Array],
        default: ''
    },
    deletePermission: {
        type: [String, Array],
        default: ''
    },
    dropdownPermission: {
        type: [String, Array],
        default: ''
    },

    // Button Texts
    viewButtonTitle: { type: String, default: 'Quick View' },
    editButtonText: { type: String, default: 'Edit' },
    deleteButtonText: { type: String, default: 'Delete' },

    // EllipseButton Menu Title
    ellipseMenuTitle: { type: String, default: '' },

    // Status Configuration
    statusLabels: {
        type: Object,
        default: () => ({
            true: 'Active',
            false: 'Inactive',
            1: 'Active',
            0: 'Inactive'
        })
    },
    statusClasses: {
        type: Object,
        default: () => ({
            true: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            false: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
            1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            0: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        })
    },
    statusDotClasses: {
        type: Object,
        default: () => ({
            true: 'bg-emerald-500',
            false: 'bg-gray-400',
            1: 'bg-emerald-500',
            0: 'bg-gray-400'
        })
    },

    // Badge Configuration
    badgeClasses: {
        type: Object,
        default: () => ({})
    },

    // Formatters
    currencySymbol: { type: String, default: '$' },
    locale: { type: String, default: 'en-US' }
})

const emit = defineEmits([
    'view',
    'edit',
    'delete',
    'action'
])

// ============ Auth Store ============
const authStore = useAuthStore()

// ============ Methods ============
const getColumnValue = (key) => {
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

// ============ Permission Methods ============
const hasPermission = (permission) => {
    if (!permission) return true

    if (Array.isArray(permission)) {
        return permission.some(p => authStore.hasPermission(p))
    }

    return authStore.hasPermission(permission)
}

// Convert array permission → single slug string (EllipseButton expects string)
const toSlug = (perm) => {
    if (!perm) return null
    if (Array.isArray(perm)) return perm[0] || null
    return perm
}

// EllipseButton permissions object
const ellipsePermissions = computed(() => ({
    edit: toSlug(props.editPermission),
    delete: toSlug(props.deletePermission)
}))

// ✅ Show EllipseButton if user has any edit/delete permission OR custom dropdown slot exists
const hasAnyDropdownAction = computed(() => {
    if (hasPermission(props.editPermission) || hasPermission(props.deletePermission)) {
        return true
    }
    // If parent passed custom dropdown items, keep trigger visible
    return !!props.item // always true, but we could use useSlots() if needed
})

// ============ Status Methods ============
const getStatusText = (value) => {
    const status = value !== undefined && value !== null ? value : false
    return props.statusLabels[String(status)] || props.statusLabels[String(!!status)] || String(status)
}

const getStatusClass = (value) => {
    const status = value !== undefined && value !== null ? value : false
    return props.statusClasses[String(status)] || props.statusClasses[String(!!status)] || ''
}

const getStatusDotClass = (value) => {
    const status = value !== undefined && value !== null ? value : false
    return props.statusDotClasses[String(status)] || props.statusDotClasses[String(!!status)] || 'bg-gray-400'
}

const getBadgeClass = (value, column) => {
    if (column.badgeClasses && column.badgeClasses[String(value)]) {
        return column.badgeClasses[String(value)]
    }
    if (props.badgeClasses && props.badgeClasses[String(value)]) {
        return props.badgeClasses[String(value)]
    }
    return 'px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded'
}

// ============ Formatters ============
const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat(props.locale, {
        style: 'currency',
        currency: currency || 'USD'
    }).format(value)
}

const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat(props.locale).format(value)
}

const formatDate = (value) => {
    if (!value) return '-'
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
    if (!value) return '-'
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

// ============ Event Handlers ============
const handleView = () => {
    emit('view', props.item)
}

const handleEdit = () => {
    emit('edit', props.item)
}

const handleDelete = () => {
    emit('delete', props.item)
}

// ============ Expose ============
defineExpose({
    hasPermission,
    handleView,
    handleEdit,
    handleDelete
})
</script>

<!-- 
 <DataTable> 
      <template #header>
        <SortableTableHeader :columns="tableColumns" :sort-by="productVariantStore.sortBy"
          :sort-direction="productVariantStore.sortDirection" :show-actions-column="true" :show-sl-column="true"
          @sort="sortByColumn" />
      </template>
 
      <template #loading>
        <TableLoadingState v-if="productVariantStore.loading" :is-loading="true"
          :total-items="productVariantStore.totalItems" :item-name="'product variants'"
          loading-text="Loading product variants..." loading-subtext="Fetching your product variant data" />
      </template>
 
      <template #empty>
        <TableLoadingState v-if="!productVariantStore.loading && productVariantStore.items.length === 0"
          :is-loading="false" :isEmpty="true" :has-search="!!searchQuery" :item-name="'product variants'"
          empty-icon="fas fa-cubes" empty-title="No product variants found"
          :empty-message="searchQuery ? 'No product variants match your search criteria.' : 'Get started by creating your first Product Variant.'"
          :create-button-text="'Add First Variant'" @create="openCreateModal" @clear-search="clearSearch" />
      </template>
 
      <template #rows>
        <TableRow v-for="(data, index) in displayedItems" :key="data.id" :item="data"
          :row-number="calculateRowNumber(index)" :columns="tableColumns" :show-sl="true" :show-actions="true"
          :show-view-button="true" :show-dropdown="true" :show-edit-button="true" :show-delete-button="true"
          :view-permission="['product_variants.view']" :edit-permission="['product_variants.update']"
          :delete-permission="['product_variants.delete']" @view="viewItem" @edit="editItem" @delete="confirmDelete">
        
          <template #column-product_name="{ item }">
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <i class="fas fa-cube text-gray-500 dark:text-gray-400 text-lg"></i>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ item.product?.name || '-' }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Variant: {{ item.name }}
                </div>
              </div>
            </div>
          </template>
 
          <template #column-sku="{ item }">
            <div class="flex flex-col space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">SKU:</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ item.sku || '-' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Barcode:</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ item.barcode || '-' }}</span>
              </div>
            </div>
          </template>
 
          <template #column-quantity="{ item }">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.quantity || 0 }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ item.measurement_unit?.symbol || item.measurement_unit?.name || 'Unit' }}
              </span>
            </div>
          </template>
 
          <template #dropdown-items="{ item, closeDropdown }">
            <div class="py-1">
              <button @click="duplicateItem(item); closeDropdown()"
                class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <i class="fas fa-copy text-blue-500 w-4"></i>
                <span class="font-medium">Duplicate</span>
              </button>
            </div>
          </template>
        </TableRow>
      </template>
 
      <template #pagination>
        <div v-if="productVariantStore.pagination.total > 0" class="mt-6">
            <Pagination v-if="productVariantStore.totalItems > 0" :total-items="productVariantStore.totalItems"
                :per-page="productVariantStore.perPage" :current-page="productVariantStore.currentPage"
                :last-page="productVariantStore.lastPage" :is-loading="productVariantStore.isLoading"
                @change-page="handlePageChange" @change-per-page="handlePerPageChange" />
        </div>
    </template>
    </DataTable>

-->


<!-- 
<template>
    <DataTable>
        <template #rows>
            <TableRow
                v-for="(data, index) in displayedItems"
                :key="data.id"
                :item="data"
                :row-number="calculateRowNumber(index)"
                :columns="rowColumns"
                :show-sl="true"
                :show-actions="true"
                :show-view-button="true"
                :show-dropdown="true"
                :show-edit-button="true"
                :show-delete-button="true"
                view-permission="product_variants.view"
                edit-permission="product_variants.update"
                delete-permission="product_variants.delete"
                @view="viewItem"
                @edit="editItem"
                @delete="confirmDelete"
            >
            
                <template #column-product_name="{ item }">
                    <div class="flex items-center space-x-3">
                        <img v-if="item.image_url" :src="item.image_url" :alt="item.name"
                            class="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                        <div v-else
                            class="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            <Package class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                                {{ item.name }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                SKU: {{ item.sku || '-' }}
                            </div>
                        </div>
                    </div>
                </template>
            </TableRow>
        </template>
    </DataTable>
</template>

<script setup>
import { Package } from 'lucide-vue-next'
</script>

-->