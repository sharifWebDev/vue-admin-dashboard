import ActivityLogManagement from "./ActivityLog.vue";

export default [
  {
    path: "/activity-logs",
    component: ActivityLogManagement,
    meta: {
      requiresAuth: true,
      title: "Activity Logs",
      breadcrumb: "Activity Logs",
    },
  },
];