export default [
  {
    path: "/raw-materials",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Raw Materials Management",
      breadcrumb: "Raw Materials Management",
    },
  },
];
