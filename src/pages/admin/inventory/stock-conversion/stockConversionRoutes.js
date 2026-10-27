import UnitConversion from "./index.vue"; 

export default [
  {
    path: "/stock-conversions",
    component: UnitConversion,
    meta: {
      requiresAuth: true,
      title: "Stock Conversion",
      breadcrumb: "Stock Conversion",
    },
  },
];
