// stores/useWarehouseStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useWarehouseStore = createBaseStore("warehouse", "warehouses", {
  useFormData: true,
  primaryKey: "id",
});