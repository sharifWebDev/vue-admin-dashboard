// stores/roleStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useRoleStore = createBaseStore(
  "role",
  "roles",
  {
    useFormData: true,
    primaryKey: "id",
  }
); 