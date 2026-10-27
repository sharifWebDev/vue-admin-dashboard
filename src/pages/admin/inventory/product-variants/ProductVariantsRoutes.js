import ProductVariantsManagement from "./index.vue"; 

export default [
  {
    path: "/product-variants",
    component: ProductVariantsManagement,
    meta: {
      requiresAuth: true,
      title: "Product Variants Management",
      breadcrumb: "Product Variants Management",
    },
  },
];
