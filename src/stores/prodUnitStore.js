// stores/ProdUnitStore.js
import { createBaseStore } from "./baseStore";
 
export const useProdUnitStore = createBaseStore("unit", "units", {
  useFormData: true,
  primaryKey: "id",
});
 