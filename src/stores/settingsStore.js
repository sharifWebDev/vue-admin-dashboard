import { defineStore } from "pinia";
import api from "@/services/api";

export const useSettingsStore = defineStore("settings", {
  actions: {
    async get() {
      const response = await api.get("/settings");
      return response.data?.data || response.data;
    },

    async updateNotificationSettings(settings) {
      const response = await api.put("/settings/notifications", settings);
      return response.data?.data || response.data;
    },

    async updateBillingSettings(settings) {
      const response = await api.put("/settings/billing", settings);
      return response.data?.data || response.data;
    },

    async changePassword(passwordData) {
      const response = await api.put("/settings/password", passwordData);
      return response.data?.data || response.data;
    },

    async deleteAccount() {
      const response = await api.delete("/settings/account");
      return response.data?.data || response.data;
    }
  }
});
