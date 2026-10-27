// stores/variantPackageStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useVariantPackageStore = createBaseStore(
    "variant_packages",
    "variant-packages",
    {
        useFormData: true,
        primaryKey: "id",
    }
);
 