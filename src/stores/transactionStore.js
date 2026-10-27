// stores/transactionStore.js
import { createBaseStore } from "./baseStore";
 
export const useTransactionStore = createBaseStore(
  "general-ledger",
  "general-ledgers",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 