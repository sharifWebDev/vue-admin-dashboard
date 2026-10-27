import ClientManagement from "./ClientManagement.vue"; 

export default [
  {
    path: "/clients",
    component: ClientManagement,
    meta: {
      requiresAuth: true,
      title: "Clients Management",
      breadcrumb: "Clients Management",
    },
  },
];
