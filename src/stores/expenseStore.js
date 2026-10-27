// stores/expenseStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useExpenseStore = createBaseStore(
  "expense",
  "expenses",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 