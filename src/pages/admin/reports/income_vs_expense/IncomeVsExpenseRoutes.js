import IncomeVsExpenseRoutes from "./IncomeVsExpenseRoutes.vue";

export default [
  {
    path: "/income-vs-expense",
    component: IncomeVsExpenseRoutes,
    meta: {
      requiresAuth: true,
      title: "Income Vs Expense",
      breadcrumb: "Income Vs Expense"
    },
  }
];