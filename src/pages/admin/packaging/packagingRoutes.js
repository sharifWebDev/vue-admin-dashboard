import PackagingManagement from "./index.vue";

export default [
  {
    path: "/packaging",
    component: PackagingManagement,
    meta: {
      requiresAuth: true,
      title: "Production Management",
      breadcrumb: "Production Management",
    },
  },
];