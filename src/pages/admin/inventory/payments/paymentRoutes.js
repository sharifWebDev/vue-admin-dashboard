import PaymentManagement from "./index.vue"; 

export default [
  {
    path: "/payments",
    component: PaymentManagement,
    meta: {
      requiresAuth: true,
      title: "Payments",
      breadcrumb: "Payments",
    },
  },
];
