import DealerManagement from "./index.vue"; 

export default [
  {
    path: "/dealers",
    component: DealerManagement,
    meta: {
      requiresAuth: true,
      title: "Dealer Management",
      breadcrumb: "Dealer Management",
    },
  },
];
