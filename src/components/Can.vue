<!-- components/Can.vue -->
<template>
  <slot v-if="hasAccess"></slot>
</template>

<script setup>
import { computed } from 'vue'
import { usePermission } from '@/utils/permission'

const props = defineProps({
  permission: {
    type: [String, Array],
    required: true
  },
  mode: {
    type: String,
    default: 'any', // 'any' or 'all'
    validator: (value) => ['any', 'all'].includes(value)
  }
})

const { can, canAny, canAll } = usePermission()

const hasAccess = computed(() => {
  if (Array.isArray(props.permission)) {
    return props.mode === 'any' 
      ? canAny(props.permission)
      : canAll(props.permission)
  }
  return can(props.permission)
})
</script>