export default [
  {
    path: "/raw-materials-inventory",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Raw Materials Inventory Management",
      breadcrumb: "Raw Materials Inventory Management",
    },
  },
];
