// stores/saleReportStore.js
import { createBaseStore } from "./baseStore";
 
export const useSaleReportStore = createBaseStore(
  "sales-invoices-report",
  "sales-invoices/report",
  {
    useFormData: true,
    primaryKey: "id",
  },
);
 