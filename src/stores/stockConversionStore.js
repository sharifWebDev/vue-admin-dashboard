// stores/stockConversionStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useStockConversionStore = createBaseStore(
  "stock-conversion",
  "stock-conversions",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 