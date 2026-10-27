import UsageReport from "./index.vue";

export default [
  {
    path: "/reports/raw-material-inventory-usage-report",
    name: "Raw Material Inventory Usages",
    component: UsageReport,
    meta: {
      requiresAuth: true,
      title: "Raw Material Inventory Usages Report",
      breadcrumb: "Raw Material Inventory Usages Report",
    },
  },
];