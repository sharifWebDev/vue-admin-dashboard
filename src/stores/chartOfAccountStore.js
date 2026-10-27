// stores/chartOfAccountStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useChartOfAccountStore = createBaseStore(
  "chartOfAccount",
  "chart-of-accounts",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 