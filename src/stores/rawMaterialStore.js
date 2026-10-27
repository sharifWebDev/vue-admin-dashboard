// stores/rawMaterialStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useRawMaterialStore = createBaseStore("raw-material", "raw-materials", {
  useFormData: false,
  primaryKey: "id",
});
 