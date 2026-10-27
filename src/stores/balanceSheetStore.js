// stores/balanceSheetStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useBalanceSheetStore = createBaseStore(
  "balance_sheets",
  "balance-sheets/report",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 