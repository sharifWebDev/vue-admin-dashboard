import PermissionManagement from "./PermissionManagement.vue";

export default [
  {
    path: "/permissions",
    component: PermissionManagement,
    meta: {
      requiresAuth: true,
      title: "Permission Management",
      breadcrumb: "Permission Management"
    },
  }
];