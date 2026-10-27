import ProdUnitManagement from "./ProdUnitManagement.vue"; 

export default [
  {
    path: "/product-units",
    component: ProdUnitManagement,
    meta: {
      requiresAuth: true,
      title: "Prod Unit Management",
      breadcrumb: "Prod Unit Management",
    },
  },
];
