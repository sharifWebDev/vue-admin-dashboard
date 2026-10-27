// stores/cashflowStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useCashflowStore = createBaseStore(
  "cashflow",
  "cashflows/report",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 