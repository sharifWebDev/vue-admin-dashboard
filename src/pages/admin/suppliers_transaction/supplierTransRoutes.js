
export default [
  {
    path: "/supplier-transactions",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Supplier Transactions",
      breadcrumb: "Supplier Transactions",
    },
  },
];
