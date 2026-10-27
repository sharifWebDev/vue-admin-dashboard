// stores/supplierStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useSupplierTransStore = createBaseStore(
  "supplier-transaction",
  "supplier-transactions",
  {
    useFormData: true,
    primaryKey: "id",
  },
);