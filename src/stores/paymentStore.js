// stores/paymentStore.js
import { createBaseStore } from "./baseStore";
 
export const usePaymentStore = createBaseStore(
  "payment",
  "payments",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
