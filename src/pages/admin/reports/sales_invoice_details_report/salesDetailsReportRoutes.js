import SalesReport from "./index.vue";

export default [
  {
    path: "/reports/sales-invoice-details-report",
    name: "Sales Invoice Details Report",
    component: SalesReport,
    meta: {
      requiresAuth: true,
      title: "Sales Invoice Details Report",
      breadcrumb: "Sales Invoice Details Report",
    },
  },
];