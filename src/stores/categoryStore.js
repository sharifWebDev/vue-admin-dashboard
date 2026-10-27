// stores/categoryStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useCategoryStore = createBaseStore("category", "categories", {
  useFormData: true,
  primaryKey: "id",
});