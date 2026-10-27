import DeliveryReport from "./index.vue";

export default [
  {
    path: "/reports/delevery-details-report",
    name: "Delivery Details Report",
    component: DeliveryReport,
    meta: {
      requiresAuth: true,
      title: "Delivery Details Report",
      breadcrumb: "Delivery Details Report",
    },
  },
];