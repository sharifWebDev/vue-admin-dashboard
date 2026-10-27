import UnitConversion from "./index.vue"; 

export default [
  {
    path: "/unit-conversions",
    component: UnitConversion,
    meta: {
      requiresAuth: true,
      title: "Unit Conversion",
      breadcrumb: "Unit Conversion",
    },
  },
];
