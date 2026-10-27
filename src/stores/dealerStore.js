// stores/dealerStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useDealerStore = createBaseStore("dealer", "dealers", {
  useFormData: true,
  primaryKey: "id",
});