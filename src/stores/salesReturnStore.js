// stores/salesReturnStore.js
import { createBaseStore } from "./baseStore";
 
export const useSalesReturnStore = createBaseStore(
    "sales-return",
    "sales-returns",
    // "sales-invoice",
    // "sales-invoices",
    {
        useFormData: true,
        primaryKey: "id",
    }
);
  