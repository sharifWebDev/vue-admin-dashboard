// stores/companyStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useCompanyStore = createBaseStore(
  "company",
  "companies",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 