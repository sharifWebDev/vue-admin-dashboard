// <!-- /stores/rawMaterialInventoryUsageStore.vue -->
import { createBaseStore } from "./baseStore";

// Base store
export const useRawMaterialInventoryUsageStore = createBaseStore(
  "raw-material-inventory-bulk-usage",
  "raw-material-inventory/bulk-usage",
  {
    useFormData: false,
    primaryKey: "id",
  },
);
