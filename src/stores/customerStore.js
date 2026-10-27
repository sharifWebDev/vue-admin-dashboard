// stores/customerStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useCustomerStore = createBaseStore("dealer2", "dealers", {
  useFormData: true,
  primaryKey: "id",
});