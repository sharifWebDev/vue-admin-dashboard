// stores/warehouseStockStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useWarehouseStockBalanceStore = createBaseStore(
  "warehouse-stocks/stock-balance-report",
  "warehouse-stocks/stock-balance-report?grouped=1",
  {
    useFormData: true,
    primaryKey: "id",
  },
);
 