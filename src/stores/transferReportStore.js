// stores/saleReportStore.js
import { createBaseStore } from "./baseStore";
 
export const useTransferReportStore = createBaseStore(
  "transfer-report",
  "transfer/report",
  {
    useFormData: true,
    primaryKey: "id",
  },
);
 