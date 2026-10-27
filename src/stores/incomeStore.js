// stores/incomeStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useIncomeStore = createBaseStore(
  "income",
  "incomes",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 