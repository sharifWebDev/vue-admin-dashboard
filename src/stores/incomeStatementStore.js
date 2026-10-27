// stores/incomeStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useIncomeStore = createBaseStore(
  "income",
  "/incomes/report",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 