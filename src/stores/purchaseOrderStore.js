// stores/purchaseOrderStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePurchaseOrderStore = createBaseStore(
  "purchase-order",
  "purchase-orders",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 