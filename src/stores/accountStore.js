// stores/accountStore.js
import { createBaseStore } from "./baseStore";
 
export const useAccountStore = createBaseStore("account", "accounts", {
  useFormData: true,
  primaryKey: "id",
});
 