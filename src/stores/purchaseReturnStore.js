// stores/purchaseReturnStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePurchaseReturnStore = createBaseStore(
  "purchase-return",
  "purchase-returns",
  {
    useFormData: true,
    primaryKey: "id",
  },
);
 