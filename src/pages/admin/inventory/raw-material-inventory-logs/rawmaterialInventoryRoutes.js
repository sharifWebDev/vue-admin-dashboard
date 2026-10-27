import RawMaterialInventoryLogs from "./index.vue"; 

export default [
  {
    path: "/raw-material-inventory-logs",
    component: RawMaterialInventoryLogs,
    meta: {
      requiresAuth: true,
      title: "Raw Material Inventory Logs",
      breadcrumb: "Raw Material Inventory Logs",
    },
  },
];
