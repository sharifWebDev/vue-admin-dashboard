import CustomerManagement from "./index.vue"; 

export default [
  {
    path: "/customers",
    component: CustomerManagement,
    meta: {
      requiresAuth: true,
      title: "Customer Management",
      breadcrumb: "Customer Management",
    },
  },
];
