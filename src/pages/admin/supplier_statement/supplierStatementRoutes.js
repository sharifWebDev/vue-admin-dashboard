
export default [
  {
    path: "/supplier-statements",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Supplier Statements",
      breadcrumb: "Supplier Statements",
    },
  },
];
