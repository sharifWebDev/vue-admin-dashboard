import ProductionReport from "./index.vue";

export default [
  {
    path: "/reports/production-report",
    name: "Production Report",
    component: ProductionReport,
    meta: {
      requiresAuth: true,
      title: "Production Report",
      breadcrumb: "Production Report"
    },
  }
];
