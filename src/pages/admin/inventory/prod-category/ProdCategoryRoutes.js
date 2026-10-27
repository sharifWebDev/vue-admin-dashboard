import ProdCategoryManagement from "./ProdCategoryManagement.vue"; 

export default [
  {
    path: "/product-categories",
    component: ProdCategoryManagement,
    meta: {
      requiresAuth: true,
      title: "Product Category Management",
      breadcrumb: "Product Category Management",
    },
  },
];
