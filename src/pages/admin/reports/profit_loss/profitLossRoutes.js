import CashFlow from "./ProfitLoss.vue";

export default [
  {
    path: "/profit-loss",
    component: CashFlow,
    meta: {
      requiresAuth: true,
      title: "Profit Loss",
      breadcrumb: "Profit Loss",
    },
  }
];