import InventoryDashboard from "./InventoryDashboard-v2.vue";

export default [
  {
    path: "",
    name: "Inventory Dashboard",
    component: InventoryDashboard,
    meta: {
      requiresAuth: true,
      title: "Dashboard",
    },
  },
];
