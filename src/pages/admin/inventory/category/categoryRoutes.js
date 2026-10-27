 export default [
  {
    path: "/category",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Category",
      breadcrumb: "Category",
    },
  },
];
