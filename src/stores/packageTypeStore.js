// stores/packageTypeStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const usePackageTypeStore = createBaseStore("package-type", "package-types", {
    useFormData: true,
    primaryKey: "id",
});