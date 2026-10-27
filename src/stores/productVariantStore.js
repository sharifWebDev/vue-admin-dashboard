// stores/ProductVariantStore.js
import { createBaseStore } from "./baseStore";

export const useProductVariantStore = createBaseStore("product-variant", "product-variants", {
  useFormData: true,
  primaryKey: "id",
});
