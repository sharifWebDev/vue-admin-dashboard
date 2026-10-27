import TransferReport from "./index.vue";

export default [
  {
    path: "/reports/transfer-report",
    name: "Transfer Report",
    component: TransferReport,
    meta: {
      requiresAuth: true,
      title: "Transfer Report",
      breadcrumb: "Transfer Report"
    },
  }
];