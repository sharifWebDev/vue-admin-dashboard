// stores/purchaseStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePurchaseStore = createBaseStore(
  "purchase-invoice",
  "purchase-invoices",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 