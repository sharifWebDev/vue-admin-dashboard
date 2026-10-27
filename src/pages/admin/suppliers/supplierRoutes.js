
export default [
  {
    path: "/suppliers",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Supplier Management",
      breadcrumb: "Supplier Management",
    },
  },
];
