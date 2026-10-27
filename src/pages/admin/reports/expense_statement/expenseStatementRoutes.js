import ExpenseStatement from "./ExpenseStatement.vue";

export default [
  {
    path: "/expense-statement",
    component: ExpenseStatement,
    meta: {
      requiresAuth: true,
      title: "Expense Statement",
      breadcrumb: "Expense Statement"
    },
  }
];