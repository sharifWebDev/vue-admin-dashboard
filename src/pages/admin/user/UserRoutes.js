import UserManagement from "./UserManagement.vue";
import TrashUser from "@/components/pages/admin/users/TrashUser.vue";

export default [
  {
    path: "/users",
    component: UserManagement,
    meta: {
      requiresAuth: true,
      title: "User Management",
      breadcrumb: "User Management",
    },
  },
  {
    path: "/my-account",
    component: () => import("@/components/pages/admin/users/UserProfile.vue"),
    meta: {
      requiresAuth: true,
      title: "My Account",
      breadcrumb: "My Account",
    },
  },
];
