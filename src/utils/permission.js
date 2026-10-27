// utils/permission.js
import { useAuthStore } from "@/stores/authStore";

export const usePermission = () => {
  const authStore = useAuthStore();

  const can = (permission) => {
    return authStore.hasPermission(permission);
  };

  const canAny = (permissions) => {
    return authStore.hasAnyPermission(permissions);
  };

  const canAll = (permissions) => {
    return authStore.hasAllPermissions(permissions);
  };

  const hasRole = (role) => {
    return authStore.hasRole(role);
  };

  const isSuperAdmin = () => {
    return authStore.roles.includes("superadmin");
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    isSuperAdmin,
    permissions: authStore.permissions,
    roles: authStore.roles,
  };
};
// Usages
// canAny(["users.edit", "users.delete"]);
// canAll(['users.edit', 'users.delete'])
// hasRole('admin')
// isSuperAdmin()
// can('users.edit')
