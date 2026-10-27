import PackageTypes from "./index.vue";

export default [
  {
    path: "/package-types",
    component: PackageTypes,
    meta: {
      requiresAuth: true,
      title: "Package Type",
      breadcrumb: "Package Type",
    },
  },
];
