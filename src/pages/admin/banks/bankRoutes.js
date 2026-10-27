import BankManagement from "./BankManagement.vue";

export default [
  {
    path: "/banks",
    component: BankManagement,
    meta: {
      requiresAuth: true,
      title: "Bank Management",
      breadcrumb: "Bank Management"
    },
  }
];