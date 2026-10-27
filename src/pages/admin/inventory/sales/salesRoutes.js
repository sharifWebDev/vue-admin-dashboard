import SalesManagement from "./index.vue";
import SalesCreate from "./create.vue";
import SalesEdit from "./edit.vue";
import SalesReturn from "../sales-return/SalesReturn.vue";
import SalesReturnList from "../sales-return/SalesReturnList.vue";
import SalesReturnEdit from "../sales-return/SalesReturnEdit.vue";

import OrdersManagement from "../orders/index.vue";
import OrderSheetManagement from "../order-sheets/index.vue";
import OrderSheetCreate from "../order-sheets/create.vue";
import OrderSheetEdit from "../order-sheets/edit.vue";

export default [
  {
    path: "/sales",
    name: "sales",
    component: SalesManagement,
    meta: {
      requiresAuth: true,
      title: "Sales Management",
      breadcrumb: "Sales Management",
    },
  },
  {
    path: "/new-sales",
    name: "new-sales",
    component: SalesCreate,
    meta: {
      requiresAuth: true,
      title: "Sales Create",
      breadcrumb: "Sales Create",
    },
  },
  {
    path: "/sales/edit/:id",
    name: "sales-edit",
    component: SalesEdit,
    meta: {
      requiresAuth: true,
      title: "Sales Edit",
      breadcrumb: "Sales Edit",
    },
  },
  // sales return
  //return
  {
    path: "/return/sales/:invoice_id",
    name: "sales-return",
    component: SalesReturn,
    meta: {
      requiresAuth: true,
      title: "Sales Return",
      breadcrumb: "Sales Return",
    },
  },
  {
    path: "/return/sales",
    name: "sales-return-list",
    component: SalesReturnList,
    meta: {
      requiresAuth: true,
      title: "Sales Return List",
      breadcrumb: "Sales Return List",
    },
  },
  {
    path: "/return/sales/edit/:id",
    name: "sales-return-edit",
    component: SalesReturnEdit,
    meta: {
      requiresAuth: true,
      title: "Sales Return Edit",
      breadcrumb: "Sales Return Edit",
    },
  },
  //orders and order sheets
  {
    path: "/orders",
    name: "orders",
    component: OrdersManagement,
    meta: {
      requiresAuth: true,
      title: "Orders Management",
      breadcrumb: "Orders Management",
    },
  },
  {
    path: "/order-sheets",
    name: "order-sheets",
    component: OrderSheetManagement,
    meta: {
      requiresAuth: true,
      title: "Order Sheets Management",
      breadcrumb: "Order Sheets Management",
    },
  },
  {
    path: "/new-order-sheet",
    name: "new-order-sheet",
    component: OrderSheetCreate,
    meta: {
      requiresAuth: true,
      title: "Order Sheet Create",
      breadcrumb: "Order Sheet Create",
    },
  },
  {
    path: "/order-sheet/edit/:id",
    name: "order-sheet-edit",
    component: OrderSheetEdit,
    meta: {
      requiresAuth: true,
      title: "Order Sheet Edit",
      breadcrumb: "Order Sheet Edit",
    },
  },
  {
    // customer payment route
    path: "/customer-payment",
    name: "customer-payment",
    component: () => import("../customer-payment/index.vue"),
    meta: {
      requiresAuth: true,
      title: "Customer Payment",
      breadcrumb: "Customer Payment",
    },
  },
  // customer - payment - list
  {
    path: "/customer-payment-list",
    name: "customer-payment-list",
    component: () => import("../customer-payment/list.vue"),
    meta: {
      requiresAuth: true,
      title: "Customer Payment List",
      breadcrumb: "Customer Payment List",
    },
  },
];
