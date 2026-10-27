// stores/incomeStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useTrialBalanceStore = createBaseStore(
  "trial-balance",
  "trial-balances",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 