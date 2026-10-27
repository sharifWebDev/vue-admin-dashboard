// stores/activityLogsStore.js
import { createBaseStore } from "./baseStore";
 
export const useActivityLogsStore = createBaseStore(
  "activity-log",
  "activity-logs",
  {
    useFormData: true,
    primaryKey: "id",
  },
);