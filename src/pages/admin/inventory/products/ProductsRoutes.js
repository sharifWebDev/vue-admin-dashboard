import ProductsManagement from "./ProductsManagement.vue"; 

export default [
  {
    path: "/products",
    component: ProductsManagement,
    meta: {
      requiresAuth: true,
      title: "Products Management",
      breadcrumb: "Products Management",
    },
  },
  // create. edit
  {
    path: "/products/create",
    component: () => import("./create.vue"),
    meta: {
      requiresAuth: true,
      title: "Create Product",
      breadcrumb: "Create Product",
    },
  },
  {
    path: "/products/edit/:id",
    component: () => import("./create.vue"),
    meta: {
      requiresAuth: true,
      title: "Edit Product",
      breadcrumb: "Edit Product",
    },
  },
  {
    path: "/products/view/:id",
    component: () => import("./view.vue"),
    meta: {
      requiresAuth: true,
      title: "View Product",
      breadcrumb: "View Product",
    },
  },
];
