import CompanyManagement from "./CompanyManagement.vue";

export default [
  {
    path: "/companies",
    component: CompanyManagement,
    meta: {
      requiresAuth: true,
      title: "Company Management",
      breadcrumb: "Company Management"
    },
  }
];