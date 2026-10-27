import CashFlow from "./CashFlow.vue";

export default [
  {
    path: "/cash-flow",
    component: CashFlow,
    meta: {
      requiresAuth: true,
      title: "Cash Flow",
      breadcrumb: "Cash Flow",
    },
  }
];