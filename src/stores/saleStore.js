// stores/saleStore.js
import { createBaseStore } from "./baseStore";
 
export const useSaleStore = createBaseStore(
  "sales-invoice",
  "sales-invoices",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 