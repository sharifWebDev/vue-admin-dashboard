// stores/profitLossStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useProfitLossStore = createBaseStore(
  "profit_loss",
  "profit-loss/report",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 