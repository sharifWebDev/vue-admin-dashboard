<template>
  <BaseModal :show="isOpen" :title="modalTitle || title" :max-width="maxWidth" :show-close="showClose"
    :close-on-backdrop="closeOnBackdrop" @close="handleClose">
    <div class="px-6 py-3">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
          :class="iconBgClass">
          <i :class="iconClass"></i>
        </div>

        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <slot name="description">{{ description }}</slot>
        </p>

        <slot name="actions">
          <div class="flex justify-center space-x-3 py-2">
            <Button type="button" :text="cancelText" icon="x" variant="outline" size="md"
              @click="handleCancel" />
            <Button type="button" :text="loading ? loadingText : confirmText"
              :icon="loading ? false : confirmIcon" :loading="loading" :disabled="loading"
              :variant="confirmVariant" size="md" @click="handleConfirm" />
          </div>
        </slot>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Alert' },
  modalTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  loadingText: { type: String, default: 'Loading...' },
  iconClass: { type: String, default: 'fas fa-exclamation-circle text-yellow-600 dark:text-yellow-300 text-xl' },
  iconBgClass: { type: String, default: 'bg-yellow-100 dark:bg-yellow-900' },
  confirmIcon: { type: [String, Object, Function, Boolean], default: null },
  confirmVariant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  maxWidth: { type: String, default: 'lg' },
  showClose: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
  autoClose: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (value) => {
  isOpen.value = value
})

const handleConfirm = () => {
  emit('confirm')
  if (props.autoClose) handleClose()
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

defineExpose({
  open: () => { isOpen.value = true },
  close: handleClose,
  confirm: handleConfirm,
  cancel: handleCancel
})
</script>
