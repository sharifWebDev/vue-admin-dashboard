import MeasurementUnit from "./index.vue";

export default [
  {
    path: "/measurement-units",
    component: MeasurementUnit,
    meta: {
      requiresAuth: true,
      title: "Measurement Unit",
      breadcrumb: "Measurement Unit",
    },
  },
];
