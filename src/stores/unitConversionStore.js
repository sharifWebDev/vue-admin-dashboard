// stores/incomeStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useUnitConversionStore = createBaseStore(
  "unit-conversion",
  "unit-conversions",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 