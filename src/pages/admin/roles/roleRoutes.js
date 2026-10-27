import RoleManagement from "./RoleManagement.vue";

export default [
  {
    path: "/roles",
    component: RoleManagement,
    meta: {
      requiresAuth: true,
      title: "Role Management",
      breadcrumb: "Role Management"
    },
  }
];