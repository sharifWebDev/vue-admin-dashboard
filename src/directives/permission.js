// directives/permission.js
import { useAuthStore } from '@/stores/authStore'

export const permission = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const { value } = binding
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = authStore.hasAnyPermission(value)
      
      if (!hasPermission && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('Permissions are required! Format: v-permission="[\'permission.name\']"')
    }
  }
}

export const role = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const { value } = binding
    
    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.some(role => authStore.hasRole(role))
      
      if (!hasRole && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('Roles are required! Format: v-role="[\'role.name\']"')
    }
  }
}