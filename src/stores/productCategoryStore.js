// stores/productCategoryStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useProductCategoryStore = createBaseStore("productCategory", "product-categories", {
  useFormData: true,
  primaryKey: "id",
});
 