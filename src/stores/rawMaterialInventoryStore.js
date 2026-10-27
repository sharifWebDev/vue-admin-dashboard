// stores/rawMaterialInventoryStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useRawMaterialInventoryStore = createBaseStore(
  "material-inventory",
  "raw-material-inventory",
  {
    useFormData: false,
    primaryKey: "id",
  },
);
 