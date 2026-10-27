// stores/transferStore.js
import { createBaseStore } from "./baseStore";
 
export const useTransferStore = createBaseStore(
  "stock_movement",
  "stock-movements",
  {
    useFormData: true,
    primaryKey: "id",
  },
);
 