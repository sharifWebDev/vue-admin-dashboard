// stores/customerPaymentStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useCustomerPaymentStore = createBaseStore("dealer-payment", "dealer-payments", {
  useFormData: true,
  primaryKey: "id",
});