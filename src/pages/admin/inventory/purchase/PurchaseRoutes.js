import PurchaseManagement from "./index.vue";
import PurchaseCreate from "./create.vue";
import PurchaseEdit from "./edit.vue";
import PurchaseReturn from "../purchase-return/create.vue";
import PurchaseReturnEdit from "../purchase-return/edit.vue";
import PurchaseReturnList from "../purchase-return/index.vue";



export default [
  {
    path: "/purchase-orders",
    name: "purchase-orders",
    component: PurchaseManagement,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Management",
      breadcrumb: "Purchase Order Management",
    },
  },
  {
    path: "/purchase-orders/create",
    name: "purchase-order-create",
    component: PurchaseCreate,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Create",
      breadcrumb: "Purchase Order Create",
    },
  },
  {
    path: "/purchase-orders/edit/:id",
    name: "purchase-order-edit",
    component: PurchaseEdit,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Edit",
      breadcrumb: "Purchase Order Edit",
    },
  },
  //return
  {
    path: "/purchase-orders/return/:invoice_id",
    name: "purchase-order-return",
    component: PurchaseReturn,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Return",
      breadcrumb: "Purchase Order Return",
    }
  }, 
  {
    path: "/purchase-orders/return/edit/:id",
    name: "purchase-order-return-edit",
    component: PurchaseReturnEdit,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Return Edit",
      breadcrumb: "Purchase Order Return Edit",
    }
  }, 
  {
    path: "/purchase-returns",
    name: "purchase-return-list",
    component: PurchaseReturnList,
    meta: {
      requiresAuth: true,
      title: "Purchase Order Return List",
      breadcrumb: "Purchase Order Return List",
    },
  },
];
