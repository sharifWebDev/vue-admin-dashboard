// stores/accountStore.js
import { createBaseStore } from "./baseStore";
 
export const useApprovalRequestStore = createBaseStore(
  "voucher-approval",
  "voucher-approvals",
  {
    useFormData: true,
    primaryKey: "id",
  },
);