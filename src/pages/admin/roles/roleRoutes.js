export default [
  {
    path: "/roles",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Role Management",
      breadcrumb: "Role Management"
    },
  }
];