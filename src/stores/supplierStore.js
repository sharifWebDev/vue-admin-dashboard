// stores/supplierStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useSupplierStore = createBaseStore("supplier", "suppliers", {
  useFormData: true,
  primaryKey: "id",
});