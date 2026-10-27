import WarehouseManagement from "./WarehouseManagement.vue"; 

export default [
  {
    path: "/warehouse",
    component: WarehouseManagement,
    meta: {
      requiresAuth: true,
      title: "Warehouse Management",
      breadcrumb: "Warehouse Management",
    },
  },
];
