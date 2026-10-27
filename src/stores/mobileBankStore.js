// stores/mobileBankStore.js
import { createBaseStore } from "./baseStore";
 
export const useMobileBankStore = createBaseStore("mobileBank", "mobile-banks", {
  useFormData: true,
  primaryKey: "id",
});
 