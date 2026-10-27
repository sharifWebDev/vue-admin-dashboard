import DealersDueReport from "./index.vue";

export default [
  {
    path: "/payment-summary-report",
    name: "Payment Summary Report",
    component: DealersDueReport,
    meta: {
      requiresAuth: true,
      title: "Customers Due Report",
      breadcrumb: "Customers Due Report",
    },
  },
];