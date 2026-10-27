// stores/ProdUnitStore.js
import { createBaseStore } from "./baseStore";
 
export const useProdMeasurementUnitStore = createBaseStore(
  "measurement-unit",
  "measurement-units",
  {
    useFormData: true,
    primaryKey: "id",
  }
);