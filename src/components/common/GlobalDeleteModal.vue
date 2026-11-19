<!-- components/common/GlobalDeleteModal.vue -->
<template>
  <BaseModal :show="isOpen" :title="title || 'Delete Item'" maxWidth="lg" :showClose="false" @close="handleClose">
    <div class="px-6 py-3">
      <div class="text-center">
        <!-- Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
          :class="iconBgClass || 'bg-red-100 dark:bg-red-900'">
          <i :class="iconClass || 'fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl'"></i>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ title || 'Delete Item' }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {{ description || 'Are you sure you want to delete this item? This action cannot be undone.' }}
        </p>

        <!-- Custom Content Slot -->
        <slot name="content">
          <!-- Default content with item details -->
          <div v-if="item" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
            <div v-for="(field, index) in displayFields" :key="index" class="flex items-center space-x-3"
              :class="{ 'mt-1': index > 0 }">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ field.label }}:</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                getFieldValue(field.key) }}</span>
            </div>
          </div>
        </slot>

        <!-- Custom Actions Slot -->
        <slot name="actions">
          <div class="flex justify-center space-x-3 py-2">
            <Button type="button" :text="cancelText || 'Cancel'" icon="x" variant="outline" size="md"
              @click="handleCancel" />

            <!-- Confirm/Delete Button -->
            <Button type="button" :text="confirmText || 'Delete'" :icon="confirmIcon || 'trash-2'" :loading="loading"
              :disabled="loading" variant="danger" size="md" @click="handleConfirm" />
          </div>
        </slot>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue';
import Button from '@/components/common/Button.vue';

const props = defineProps({
  // Visibility
  modelValue: { type: Boolean, default: false },

  // Content
  title: { type: String, default: 'Delete Item' },
  description: { type: String, default: 'Are you sure you want to delete this item? This action cannot be undone.' },

  // Item data
  item: { type: Object, default: null },
  displayFields: {
    type: Array,
    default: () => [
      { key: 'name', label: 'Name' }
    ]
  },

  // Custom labels
  confirmText: { type: String, default: 'Delete' },
  cancelText: { type: String, default: 'Cancel' },
  loadingText: { type: String, default: 'Deleting...' },

  // Styling
  iconClass: { type: String, default: 'fas fa-exclamation-triangle text-red-600 dark:text-red-300 text-xl' },
  iconBgClass: { type: String, default: 'bg-red-100 dark:bg-red-900' },
  confirmButtonClass: { type: String, default: 'bg-red-600 hover:bg-red-700' },
  confirmIcon: { type: String, default: 'trash-alt' },

  // Behavior
  loading: { type: Boolean, default: false },
  autoClose: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel',
  'close'
])

// State
const isOpen = ref(props.modelValue)

// Methods
const getFieldValue = (key) => {
  if (!props.item) return 'N/A'

  // Handle nested keys like 'product.name'
  const keys = key.split('.')
  let value = props.item
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return 'N/A'
    }
  }
  return value || 'N/A'
}

const handleConfirm = () => {
  emit('confirm', props.item)
  if (props.autoClose) {
    handleClose()
  }
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleClose = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('close')
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

// Watch internal changes
watch(isOpen, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal)
  }
})

// Expose
defineExpose({
  open: () => { isOpen.value = true },
  close: handleClose,
  confirm: handleConfirm,
  cancel: handleCancel
})
</script>



<!-- 
<template> 
  <GlobalDeleteModal
    v-model="showDeleteModal"
    :item="deletingItem"
    title="Delete Product Variant"
    description="Are you sure you want to delete this product variant? This action cannot be undone."
    :display-fields="deleteDisplayFields"
    :loading="productVariantStore.loading"
    confirm-text="Delete Variant"
    loading-text="Deleting..."
    @confirm="handleDelete"
    @cancel="closeDeleteModal"
  >
     Optional: Custom content  
    <template #content>
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6 text-left">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Variant:</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ deletingItem?.name }}</span>
        </div>
        <div class="flex items-center space-x-3 mt-1">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
          <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.product?.name }}</span>
        </div>
        <div v-if="deletingItem?.sku" class="flex items-center space-x-3 mt-1">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU:</span>
          <span class="text-sm text-gray-900 dark:text-white">{{ deletingItem?.sku }}</span>
        </div>
      </div>
    </template> 
  </GlobalDeleteModal>
 
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductVariantStore } from '@/stores/productVariantStore.js'
import BaseModal from '@/components/common/BaseModal.vue'
import GlobalDeleteModal from '@/components/common/GlobalDeleteModal.vue'
 
const deleteDisplayFields = [
  { key: 'name', label: 'Variant' },
  { key: 'product.name', label: 'Product' },
  { key: 'sku', label: 'SKU' }
]
 
</script>








<GlobalDeleteModal
      v-model="showDeleteModal"
      :item="selectedItem"
      title="Delete Item"
      description="Are you sure you want to delete this item?"
      :display-fields="[
        { key: 'name', label: 'Name' },
        { key: 'id', label: 'ID' }
      ]"
      @confirm="handleDelete"
    />


<GlobalDeleteModal v-model="showDeleteModal" :item="deletingItem" title="Delete User"
    description="This action will permanently remove this user from the system." :display-fields="[
      { key: 'full_name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' }
    ]" confirm-text="Delete User" cancel-text="Keep User"
    icon-class="fas fa-user-times text-purple-600 dark:text-purple-300 text-xl"
    icon-bg-class="bg-purple-100 dark:bg-purple-900" confirm-button-class="bg-purple-600 hover:bg-purple-700"
    confirm-icon="user-times" @confirm="deleteUser" />


<GlobalDeleteModal v-model="showDeleteModal" :item="selectedProduct" title="Delete Product" :loading="loading"
    @confirm="deleteProduct">
    <template #content>
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-circle text-yellow-600 dark:text-yellow-400 mt-0.5"></i>
          <div class="text-left">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Deleting this product will also remove all associated:
            </p>
            <ul class="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
              <li>{{ selectedProduct?.variants?.length || 0 }} variants</li>
              <li>{{ selectedProduct?.packages?.length || 0 }} packages</li>
              <li>All inventory records</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-left">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedProduct?.name }}</span>
        </div>
        <div class="flex items-center space-x-3 mt-1">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU:</span>
          <span class="text-sm text-gray-900 dark:text-white">{{ selectedProduct?.sku }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-center space-x-3">
        <button 
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="confirmDelete"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <i class="fas fa-trash-alt"></i>
          <span>Delete Permanently</span>
        </button>
      </div>
    </template>
</GlobalDeleteModal>
-->