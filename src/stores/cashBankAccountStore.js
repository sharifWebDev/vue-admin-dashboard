// stores/cashBankAccountStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useCashBankAccountStore = createBaseStore(
  "cashBankAccount",
  "cash-bank-accounts",
  {
    useFormData: true,
    primaryKey: "id",
  }
); 