import TrialBalance from "./TrialBalance.vue";

export default [
  {
    path: "/trial-balance",
    component: TrialBalance,
    meta: {
      requiresAuth: true,
      title: "Trial Balance",
      breadcrumb: "Trial Balance"
    },
  }
];