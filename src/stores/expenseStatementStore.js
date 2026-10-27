// stores/expenseStatementStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useExpenseStatementStore = createBaseStore(
  "expenseStatement",
  "/expenses/report",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 