import VariantPackages from "./index.vue"; 

export default [
  {
    path: "/variant-packages",
    component: VariantPackages,
    meta: {
      requiresAuth: true,
      title: "Variant Packages",
      breadcrumb: "Variant Packages",
    },
  },
];
