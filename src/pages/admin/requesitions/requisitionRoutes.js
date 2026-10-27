export default [
  {
    path: "/work-orders",
    name: "work-orders",
    component: () => import("./index.vue"),
    meta: {
      requiresAuth: true,
      title: "Work Order Management",
      breadcrumb: "Work Order Management",
    },
  },
  {
    path: "/new-work-orders",
    name: "new-work-order",
    component: () => import("./create.vue"),
    meta: {
      requiresAuth: true,
      title: "New Work Order",
      breadcrumb: "New Work Order",
    },
  },
  {
    path: "/work-orders/edit/:id",
    name: "work-order-edit",
    component: () => import("./edit.vue"),
    meta: {
      requiresAuth: true,
      title: "Edit Work Order",
      breadcrumb: "Edit Work Order",
    },
  },
];
