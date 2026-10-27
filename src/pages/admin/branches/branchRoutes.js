import BranchManagement from "./BranchManagement.vue";

export default [
  {
    path: "/branch",
    component: BranchManagement,
    meta: {
      requiresAuth: true,
      title: "Branch Management",
      breadcrumb: "Branch Management"
    },
  }
];