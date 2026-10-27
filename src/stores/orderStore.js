// stores/orderStore.js
import { createBaseStore } from "./baseStore";
 
export const useOrderStore = createBaseStore(
  "order",
  "orders",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 