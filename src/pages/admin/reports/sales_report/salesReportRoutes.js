import SalesReport from "./index.vue";

export default [
  {
    path: "/reports/sales-report",
    name: "Sales Report",
    component: SalesReport,
    meta: {
      requiresAuth: true,
      title: "Sales Report",
      breadcrumb: "Sales Report"
    },
  }
];