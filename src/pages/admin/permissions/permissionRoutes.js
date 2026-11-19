export default [
  {
    path: "/permissions",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Permission Management",
      breadcrumb: "Permission Management"
    },
  }
];