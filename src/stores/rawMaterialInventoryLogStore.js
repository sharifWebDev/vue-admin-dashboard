// stores/inventorylogStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useRawMaterialInventoryLogStore = createBaseStore(
  "raw-material-inventory/logs",
  "raw-material-inventory/logs",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 