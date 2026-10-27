// stores/clientStore.js
import { createBaseStore } from "./baseStore";

// Create the base store directly
export const useClientStore = createBaseStore("client", "clients", {
  useFormData: true,
  primaryKey: "id",
});