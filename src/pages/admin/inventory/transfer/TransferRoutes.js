import TransferManagement from "./TransferManagement.vue";
import TransferCreate from "./TransferCreate.vue";
import TransferEdit from "./TransferEdit.vue";
import TransferConvert from "./TransferConvert.vue";  

export default [
  {
    path: "/transfer",
    component: TransferManagement,
    meta: {
      requiresAuth: true,
      title: "Transfer Management",
      breadcrumb: "Transfer Management",
    },
  },
  {
    path: "/new-transfer",
    name: "new-transfer",
    component: TransferCreate,
    meta: {
      requiresAuth: true,
      title: "Transfer Create",
      breadcrumb: "Transfer Create",
    },
  },
  {
    path: "/transfer/edit/:id",
    name: "transfer-edit",
    component: TransferEdit,
    meta: {
      requiresAuth: true,
      title: "Transfer Edit",
      breadcrumb: "Transfer Edit",
    },
  },
  {
    path: "/transfer-convert/:id",
    name: "transfer-convert",
    component: TransferConvert,
    meta: {
      requiresAuth: true,
      title: "Transfer Convert",
      breadcrumb: "Transfer Convert",
    },
  },
];
