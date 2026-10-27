<script setup>
import { onMounted, onUnmounted, watchEffect, computed } from 'vue'

const props = defineProps({
  // Support both v-model and show prop
  modelValue: { type: Boolean, default: false },
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  // Width control korar jonno (default 2xl)
  maxWidth: { type: String, default: '2xl' },
  // Close button show/hide korar jonno
  showClose: { type: Boolean, default: true },
  // Backdrop click korle bondho hobe kina
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'update:modelValue']);

// Compute actual show state from either prop
const isVisible = computed(() => props.modelValue || props.show);

const handleClose = () => {
  if (props.showClose || props.closeOnBackdrop) {
    // Emit both events for compatibility
    emit('close');
    emit('update:modelValue', false);
  }
};

// Close on Escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && isVisible.value && props.showClose) handleClose();
};

// Prevent background scrolling
watchEffect(() => {
  if (isVisible.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});

// Dynamic class for width
const widthClass = computed(() => {
  const widths = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '8xl': 'max-w-8xl',
    '9xl': 'max-w-9xl',
    '10xl': 'max-w-10xl',
    'prose': 'max-w-prose',
    'screen': 'max-w-screen',
    'min': 'max-w-min',
    'full': 'max-w-[95vw]'
  };
  return widths[props.maxWidth] || 'max-w-2xl';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">

        <div class="fixed inset-0 bg-gray-700/60 transition-opacity" @click="closeOnBackdrop ? handleClose() : null">
        </div>

        <Transition name="pop" appear>
          <div v-if="isVisible" :class="[widthClass]"
            class="relative z-[101] w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 md:px-8 py-3">
              <h3 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">
                {{ title }}
              </h3>
              <button v-if="showClose" @click="handleClose"
                class="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              class="px-2 md:px-3 lg:px-6 xl:px-8 pt-2 md:pt-4 pb-1 md:pb-2 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-leave-active {
  transition: all 0.2s ease-in;
}

.pop-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.pop-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>