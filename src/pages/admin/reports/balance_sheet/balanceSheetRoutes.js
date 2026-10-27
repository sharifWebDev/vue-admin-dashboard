import CashFlow from "./BalanceSheet.vue";

export default [
  {
    path: "/balance-sheet",
    component: CashFlow,
    meta: {
      requiresAuth: true,
      title: "Balance Sheet",
      breadcrumb: "Balance Sheet",
    },
  }
];