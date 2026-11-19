// stores/permissionStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePermissionStore = createBaseStore(
  "permission",
  "permissions",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 