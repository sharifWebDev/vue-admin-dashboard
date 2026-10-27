import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// Layouts
import WebsiteLayout from "@/layouts/Website/WebsiteLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import DashboardLayout from "@/layouts/Dashboard/DashboardLayout.vue"; 
import BankRoutes from "@/pages/admin/banks/bankRoutes.js";
import BranchRoutes from "@/pages/admin/branches/branchRoutes.js";
import CompanyRoutes from "@/pages/admin/companies/companyRoutes.js";
import UserRoutes from "@/pages/admin/user/UserRoutes.js";
import RoleRoutes from "@/pages/admin/roles/roleRoutes.js";
import PermissionRoutes from "@/pages/admin/permissions/permissionRoutes.js";
import categoryRoutes from "@/pages/admin/inventory/category/categoryRoutes.js";
import ActivityLogRoutes from "@/pages/admin/activity_logs/ActivityLogRoutes.js";
import DealerRoutes from "@/pages/admin/dealers/DealerRoutes.js";
import CustomerRoutes from "@/pages/admin/customers/CustomerRoutes.js";
import ClientRoutes from "@/pages/admin/clients/ClientRoutes.js";
import WarehouseRoutes from "@/pages/admin/inventory/warehouse/WarehouseRoutes.js";
import ProdCategoryRoutes from "@/pages/admin/inventory/prod-category/ProdCategoryRoutes.js";
import ProdUnitRoutes from "@/pages/admin/inventory/prod-unit/ProdUnitRoutes.js";
import ProductsRoutes from "@/pages/admin/inventory/products/ProductsRoutes.js";
import TransferRoutes from "@/pages/admin/inventory/transfer/TransferRoutes.js";
import SalesRoutes from "@/pages/admin/inventory/sales/salesRoutes.js";
import PackagingRoutes from "@/pages/admin/packaging/packagingRoutes.js"; 
import SalesReport from "@/pages/admin/reports/sales_report/index.vue";
import salesReportRoutes from "@/pages/admin/reports/sales_report/salesReportRoutes";
import transferReportRoutes from "@/pages/admin/reports/transfer_report/transferReportRoutes";
import dealersDueReportRoutes from "@/pages/admin/reports/dealers_due_report/dealersDueReportRoutes";
import paymentsRoutes from "@/pages/admin/inventory/payments/paymentRoutes";
import unitConversionRoutes from "@/pages/admin/inventory/unit-conversion/unitConversionRoutes";
import stockConversionRoutes from "@/pages/admin/inventory/stock-conversion/stockConversionRoutes";
import measurementUnitsRoutes from "@/pages/admin/inventory/measurement-units/measurementUnitsRoutes";
import packageTypesRoutes from "@/pages/admin/inventory/package-types/packageTypesRoutes";
import ProductVariantsRoutes from "@/pages/admin/inventory/product-variants/ProductVariantsRoutes.js";
import variantPackagesRoutes from "@/pages/admin/inventory/variant-packages/variantPackagesRoutes.js";

const routes = [
  /* ================= Default Route ================= */
  /* ================= Auth ================= */
  {
    path: "/",
    redirect: "/login",
  },
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
    path: "/website",
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

  /* ================= Auth ================= */
  {
    path: "/",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "Login",
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
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () =>
          import("@/pages/admin/dashboard/InventoryDashboard-v2.vue"),
        meta: { title: "Dashboard" },
      },
      ...categoryRoutes,
      ...BankRoutes,
      ...BranchRoutes,
      ...CompanyRoutes,
      ...UserRoutes,
      ...RoleRoutes,
      ...PermissionRoutes,
      ...ActivityLogRoutes,
      ...DealerRoutes,
      ...ClientRoutes,
      ...WarehouseRoutes,
      ...ProdCategoryRoutes,
      ...ProdUnitRoutes,
      ...ProductsRoutes,
      ...TransferRoutes,
      ...SalesRoutes,
      ...PackagingRoutes,
      ...salesReportRoutes,
      ...transferReportRoutes,
      ...dealersDueReportRoutes,
      ...paymentsRoutes,
      ...unitConversionRoutes,
      ...stockConversionRoutes,
      ...measurementUnitsRoutes,
      ...packageTypesRoutes,
      ...ProductVariantsRoutes,
      ...variantPackagesRoutes,
      ...CustomerRoutes,
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

  document.title = `${to.meta.title || ""} | Ratan Chemical Company - ERP`;

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
