import PaymentMethods from "./index.vue";

export default [
  {
    path: "/payment-methods",
    component: PaymentMethods,
    meta: {
      requiresAuth: true,
      title: "Payment Methods",
      breadcrumb: "Payment Methods",
    },
  },
];
