// stores/ProductsStore.js
import { createBaseStore } from "./baseStore";

export const useProductStore = createBaseStore("product", "products", {
  useFormData: true,
  primaryKey: "id",
});
