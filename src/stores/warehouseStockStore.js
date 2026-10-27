// stores/warehouseStockStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useWarehouseStockStore = createBaseStore(
  "warehouse_stock",
  "warehouse-stocks?grouped=1",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 