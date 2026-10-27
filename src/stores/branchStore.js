// stores/branchStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useBranchStore = createBaseStore(
  "branch",
  "branches",
  {
    useFormData: true,
    primaryKey: "id",
  }
);

// Custom methods example
/*
export const usebranchStoreExtended = () => {
  const store = usebranchStore();

  const toggleStatus = async (item) => {
    return store.update(item.id, {
      ...item,
      status: item.status ? 0 : 1,
    });
  };

  return {
    ...store,
    toggleStatus,
  };
};
*/