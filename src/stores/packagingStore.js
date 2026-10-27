// stores/bankStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePackagingStore = createBaseStore("packaging", "packagings", {
  useFormData: true,
  primaryKey: "id",
});
 