// <!-- /stores/rawMaterialInventoryUsageStore.vue -->
import { createBaseStore } from "./baseStore";

// Base store
export const useRawMaterialInventoryUsageReportStore = createBaseStore(
  "raw-material-inventory-usage-report",
  "raw-material-inventory/usage/grouped-by-reference",
  {
    useFormData: false,
    primaryKey: "id",
  },
);
