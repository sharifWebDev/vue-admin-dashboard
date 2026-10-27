// stores/bankStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useBankStore = createBaseStore(
  "bank",
  "banks",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 