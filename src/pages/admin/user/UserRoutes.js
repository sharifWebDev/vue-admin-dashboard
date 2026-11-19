export default [
  {
    path: "/users",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "User Management",
      breadcrumb: "User Management",
    },
  },
  {
    path: "/my-account",
    component: () => import("./my-account.vue"),
    meta: {
      requiresAuth: true,
      title: "My Account",
      breadcrumb: "My Account",
    },
  },
];
