// stores/workOrderStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useWorkOrderStore = createBaseStore(
  "work-order",
  "work-orders",
  {
    useFormData: true,
    primaryKey: "id",
  }
); 