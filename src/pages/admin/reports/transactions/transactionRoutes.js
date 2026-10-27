import TransactionManagement from "./TransactionManagement.vue";

export default [
  {
    path: "/general-ledgers",
    component: TransactionManagement,
    meta: {
      requiresAuth: true,
      title: "General ledger",
      breadcrumb: "General ledger"
    },
  }
];