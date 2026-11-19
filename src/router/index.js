import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// Layouts
import WebsiteLayout from "@/layouts/Website/WebsiteLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue"; 
import RoleRoutes from "@/pages/admin/roles/roleRoutes.js";
import PermissionRoutes from "@/pages/admin/permissions/permissionRoutes.js"; 

//website

const routes = [
  /* ================= Default Route ================= */

  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/pages/auth/ForgotPassword.vue"),
    meta: {
      title: "Forgot Password",
      guestOnly: true,
    },
  },
  {
    path: "/verify-otp",
    name: "VerifyOTP",
    component: () => import("@/pages/auth/VerifyOtp.vue"),
    meta: {
      title: "Verify OTP",
      guestOnly: true,
    },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => import("@/pages/auth/ResetPassword.vue"),
    meta: {
      title: "Reset Password",
      guestOnly: true,
    },
  },

  /* ================= Website (Customer Landing) ================= */
  {
    path: "/",
    component: WebsiteLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/pages/Home.vue"),
        meta: { title: "Home" },
      },
    ],
  },  
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("@/components/Website/AuthCallback.vue"),
  },
  /* ================= Auth ================= */
  {
    path: "/auth",
    name: "Login",
    component: AuthLayout,
    children: [
      {
        path: "/login",
        component: () => import("@/pages/auth/Login.vue"),
        meta: {
          title: "Login",
          guestOnly: true,
        },
      },
    ],
  },

  /* ================= Admin Dashboard ================= */
  {
    path: "/dashboard",
    component:  () => import("@/layouts/Dashboard/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/pages/admin/dashboard/Dashboard.vue"),
        meta: { title: "Dashboard" },
      }, 
      {
        path: "/settings",
        name: "settings",
        component: () => import("@/components/Website/Settings.vue"),
        meta: {
          title: "Settings",
        },
      },
      ...RoleRoutes,
      ...PermissionRoutes
    ],
  },

  /* ================= 404 ================= */
  {
    path: "/:pathMatch(.*)*",
    component: WebsiteLayout,
    children: [
      {
        path: "",
        component: () => import("@/pages/NotFound.vue"),
        meta: { title: "404" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* ================= Guards ================= */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  document.title = `${to.meta.title || "App"} | App Builder`;

  const isAuth = authStore.isAuthenticated;

  if (to.matched.some((r) => r.meta.requiresAuth) && !isAuth) {
    return next("/login");
  }

  if (to.matched.some((r) => r.meta.guestOnly) && isAuth) {
    return next("/dashboard");
  }

  next();
});

export default router;
