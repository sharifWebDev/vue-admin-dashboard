import { defineStore } from "pinia";
import axiosClient from "@/axiosClient";
import router from "@/router";
import firebaseService from "@/services/firebase";
import { useNotificationStore } from "@/stores/notificationStore";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("authToken") || null,
    user: JSON.parse(localStorage.getItem("user") || "null") || null,
    permissions:
      JSON.parse(localStorage.getItem("userPermissions") || "[]") || [],
    roles: JSON.parse(localStorage.getItem("userRoles") || "[]") || [],
    isLoading: false,
    error: null,
    successMessage: null,

    // Notification settings
    notificationSettings: JSON.parse(
      localStorage.getItem("notificationSettings") || "null",
    ) || {
      enabled: true,
      sound: true,
      desktop: true,
      email: true,
    },
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => state.user?.name || "",
    initials: (state) => {
      if (!state.user?.name) return "U";
      return state.user.name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase();
    },
    role: (state) => {
      // Get first role or fallback
      return state.roles?.length > 0
        ? state.roles[0]
        : state.user?.user_type || "user";
    },

    // Check if user is super admin
    isSuperAdmin: (state) => state.roles?.includes("superadmin") || false,

    // Permission check getters
    can: (state) => (permission) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      return state.permissions?.includes(permission) || false;
    },

    canAny: (state) => (permissions) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      if (!permissions || !Array.isArray(permissions)) return false;
      return permissions.some((p) => state.permissions?.includes(p));
    },

    canAll: (state) => (permissions) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      if (!permissions || !Array.isArray(permissions)) return false;
      return permissions.every((p) => state.permissions?.includes(p));
    },

    hasPermission: (state) => (permission) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      return state.permissions?.includes(permission) || false;
    },

    hasAnyPermission: (state) => (permissions) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      if (!permissions || !Array.isArray(permissions)) return false;
      return permissions.some((p) => state.permissions?.includes(p));
    },

    hasAllPermissions: (state) => (permissions) => {
      // Super admin has all permissions
      if (state.roles?.includes("superadmin")) return true;
      if (!permissions || !Array.isArray(permissions)) return false;
      return permissions.every((p) => state.permissions?.includes(p));
    },

    // Role check getters
    hasRole: (state) => (role) => {
      return state.roles?.includes(role) || false;
    },

    hasAnyRole: (state) => (roles) => {
      if (!roles || !Array.isArray(roles)) return false;
      return roles.some((r) => state.roles?.includes(r));
    },

    // Get all permissions
    allPermissions: (state) => state.permissions || [],

    // Get all roles
    allRoles: (state) => state.roles || [],

    // Group permissions by module for UI organization
    permissionsByModule: (state) => {
      const permissions = state.permissions || [];
      const grouped = {};

      permissions.forEach((perm) => {
        const parts = perm.split(".");
        const module = parts[0];
        const action = parts.slice(1).join(".");

        if (!grouped[module]) {
          grouped[module] = [];
        }
        grouped[module].push(action);
      });

      return grouped;
    },

    // Notification settings getters
    notificationsEnabled: (state) =>
      state.notificationSettings?.enabled !== false,
    soundEnabled: (state) => state.notificationSettings?.sound !== false,
    desktopNotificationsEnabled: (state) =>
      state.notificationSettings?.desktop !== false,
    emailNotificationsEnabled: (state) =>
      state.notificationSettings?.email !== false,
  },

  actions: {
    /* ===============================
       TOKEN & USER MANAGEMENT
    =============================== */
    setToken(token) {
      this.token = token;
      localStorage.setItem("authToken", token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    setUser(user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));

      // Extract and store roles and permissions from user object
      if (user && user.roles) {
        this.setRoles(user.roles);
      }

      if (user && user.permissions) {
        this.setPermissions(user.permissions);
      }

      // Emit auth state changed event
      this.emitAuthStateChanged();
    },

    setRoles(roles) {
      this.roles = roles || [];
      localStorage.setItem("userRoles", JSON.stringify(this.roles));
    },

    setPermissions(permissions) {
      this.permissions = permissions || [];
      localStorage.setItem("userPermissions", JSON.stringify(this.permissions));
    },

    setNotificationSettings(settings) {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      localStorage.setItem(
        "notificationSettings",
        JSON.stringify(this.notificationSettings),
      );
    },

    async updateNotificationSettings(settings) {
      try {
        const response = await axiosClient.put(
          "/user/notification-settings",
          settings,
        );

        if (response.data.success) {
          this.setNotificationSettings(settings);

          // Re-initialize Firebase based on settings
          if (settings.enabled) {
            await this.initializeFirebaseNotifications();
          } else {
            await this.cleanupFirebaseNotifications();
          }
        }

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Failed to update notification settings:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Failed to update settings",
        };
      }
    },

    clearAuthData() {
      this.token = null;
      this.user = null;
      this.permissions = [];
      this.roles = [];

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRoles");
      localStorage.removeItem("userPermissions");
      localStorage.removeItem("verificationToken");
      localStorage.removeItem("resetEmail");

      delete axiosClient.defaults.headers.common["Authorization"];
    },

    /* ===============================
       AUTHENTICATION
    =============================== */
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post("/login", credentials);
        const { user, access_token: token } = response.data.data;

        this.setToken(token);
        this.setUser(user);

        // Initialize Firebase notifications after successful login
        await this.initializeFirebaseNotifications();

        router.push("/");

        return {
          success: true,
          data: {
            user,
            token,
            permissions: user.permissions,
            roles: user.roles,
          },
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please check your credentials.";

        return {
          success: false,
          error: this.error,
          status: error.response?.status,
          errors: error.response?.data?.errors || {},
        };
      } finally {
        this.isLoading = false;
      }
    },

    async register(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post("/auth/register", payload);

        this.successMessage =
          response.data.message || "Registration successful! Please log in.";

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /* ===============================
       FIREBASE NOTIFICATIONS
    =============================== */
    async initializeFirebaseNotifications() {
      try {
        // Check if notifications are enabled in settings
        if (!this.notificationsEnabled) {
          console.log("📵 Notifications are disabled by user");
          return;
        }

        console.log(
          "🔥 Initializing Firebase notifications from auth store...",
        );

        // Check if browser supports notifications
        if (!firebaseService.isSupported()) {
          console.warn("⚠️ This browser does not support notifications");
          return;
        }

        // Get notification store
        const notificationStore = useNotificationStore();

        // Request permission and get FCM token
        const fcmToken = await firebaseService.requestPermissionAndGetToken();

        if (fcmToken) {
          console.log("✅ FCM Token registered successfully");

          // Setup foreground message handler if not already set
          if (!window.__firebaseHandlerInitialized) {
            firebaseService.onForegroundMessage((payload) => {
              console.log("📩 Foreground message received:", payload);

              // Add to notification store if enabled
              notificationStore.handleIncomingNotification(payload);

              // Show toast notification
              const toastEvent = new CustomEvent("notification", {
                detail: {
                  title: payload.notification?.title || "New Notification",
                  body: payload.notification?.body || "",
                  type: payload.data?.type || "info",
                },
              });
              window.dispatchEvent(toastEvent);
            });
            window.__firebaseHandlerInitialized = true;
          }

          return true;
        } else {
          console.warn("⚠️ Failed to get FCM token");
          return false;
        }
      } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        return false;
      }
    },

    async cleanupFirebaseNotifications() {
      try {
        await firebaseService.removeToken();
        console.log("🧹 Firebase notifications cleaned up");
      } catch (error) {
        console.error("Error cleaning up Firebase:", error);
      }
    },

    /* ===============================
       PASSWORD MANAGEMENT
    =============================== */
    async changePassword(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(
          "/auth/change-password",
          payload,
        );

        this.successMessage =
          response.data.message || "Password changed successfully!";

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Password change failed.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    async forgotPassword(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(
          "/forgot-password/request",
          payload,
        );

        this.successMessage =
          response.data.message ||
          "Password reset instructions have been sent to your email.";

        // Store email for later use in OTP verification
        if (payload.email) {
          this.setEmail(payload.email);
        }

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        const mainMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to send password reset instructions. Please try again.";

        const fieldErrors = error.response?.data?.errors || {};

        // Show only first email validation error if exists
        if (fieldErrors.email && fieldErrors.email.length > 0) {
          this.error = fieldErrors.email[0];
        } else {
          this.error = mainMessage;
        }

        return {
          success: false,
          error: this.error,
          errors: fieldErrors,
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    // Email management for OTP verification
    setEmail(email) {
      localStorage.setItem("resetEmail", email);
    },

    getEmail() {
      return localStorage.getItem("resetEmail");
    },

    removeEmail() {
      localStorage.removeItem("resetEmail");
    },

    setVerificationToken(token) {
      localStorage.setItem("verificationToken", token);
    },

    getVerificationToken() {
      return localStorage.getItem("verificationToken");
    },

    removeVerificationToken() {
      localStorage.removeItem("verificationToken");
    },

    async verifyOTP(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(
          "/forgot-password/verify",
          payload,
        );

        this.successMessage =
          response.data.message || "OTP verified successfully!";

        if (response.data?.data?.token) {
          this.setVerificationToken(response.data.data.token);
        }

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "OTP verification failed. Please try again.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    async resendOTP(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(
          "/forgot-password/request",
          payload,
        );

        this.successMessage =
          response.data.message || "New OTP sent successfully!";

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to resend OTP. Please try again.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    async resetPassword(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const verificationToken = this.getVerificationToken();
        const email = this.getEmail();

        if (verificationToken) {
          payload.verification_token = verificationToken;
        }

        if (email) {
          payload.email = email;
        }

        const response = await axiosClient.post(
          "/forgot-password/reset",
          payload,
        );

        this.successMessage =
          response.data.message || "Password reset successfully!";

        // Clear reset-related data
        this.removeEmail();
        this.removeVerificationToken();

        if (this.isAuthenticated) {
          await this.logout();
        }

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Password reset failed. Please try again.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /* ===============================
       PROFILE MANAGEMENT
    =============================== */
    async updateProfile(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.put("/auth/profile", payload);

        this.setUser(response.data.data.user);
        this.successMessage =
          response.data.message || "Profile updated successfully!";

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update profile.";

        return {
          success: false,
          error: this.error,
          errors: error.response?.data?.errors || {},
          status: error.response?.status,
        };
      } finally {
        this.isLoading = false;
      }
    },

    async refreshToken() {
      try {
        const response = await axiosClient.post("/auth/refresh-token");

        const { token } = response.data.data;
        this.setToken(token);

        return { success: true, token };
      } catch (error) {
        console.error("Token refresh failed:", error);
        await this.logout();
        return { success: false };
      }
    },

    /* ===============================
       INITIALIZATION & UTILITIES
    =============================== */
    initializeAuth() {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      const permissions = localStorage.getItem("userPermissions");
      const roles = localStorage.getItem("userRoles");
      const notificationSettings = localStorage.getItem("notificationSettings");

      if (token) {
        try {
          this.token = token;
          this.user = user ? JSON.parse(user) : null;
          this.permissions = permissions ? JSON.parse(permissions) : [];
          this.roles = roles ? JSON.parse(roles) : [];
          this.notificationSettings = notificationSettings
            ? JSON.parse(notificationSettings)
            : this.notificationSettings;

          axiosClient.defaults.headers.common["Authorization"] =
            `Bearer ${token}`;

          // Emit auth state changed event
          this.emitAuthStateChanged();

          return true;
        } catch (error) {
          console.error("Error parsing user data:", error);
          this.logout();
          return false;
        }
      }
      return false;
    },

    emitAuthStateChanged() {
      window.dispatchEvent(
        new CustomEvent("auth-state-changed", {
          detail: {
            isAuthenticated: this.isAuthenticated,
            user: this.user,
            roles: this.roles,
            permissions: this.permissions,
          },
        }),
      );
    },

    async logout(redirect = true) {
      try {
        // Cleanup Firebase notifications before logout
        await this.cleanupFirebaseNotifications();

        // Clear notification store
        const notificationStore = useNotificationStore();
        if (notificationStore) {
          notificationStore.clearNotifications();
          notificationStore.setUnreadCount(0);
        }

        // Optional: Notify backend about logout
        try {
          await axiosClient.post("/auth/logout");
        } catch (error) {
          console.error("Logout API call failed:", error);
        }
      } catch (error) {
        console.error("Error during logout cleanup:", error);
      } finally {
        // Clear all auth-related data
        this.clearAuthData();

        // Emit logout event
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", {
            detail: { isAuthenticated: false, user: null },
          }),
        );

        // Redirect to login if not already there
        if (redirect && router.currentRoute.value.path !== "/login") {
          router.push("/login");
        }
      }
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },

    setError(error) {
      this.error = error;
    },

    setSuccessMessage(message) {
      this.successMessage = message;
    },

    /* ===============================
       PASSWORD VALIDATION HELPERS
    =============================== */
    validatePassword(password) {
      const errors = [];

      if (!password || password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }

      if (password && !/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }

      if (password && !/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }

      if (password && !/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
      }

      if (password && !/[!@#$%^&*]/.test(password)) {
        errors.push(
          "Password must contain at least one special character (!@#$%^&*)",
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    calculatePasswordStrength(password) {
      if (!password) return 0;

      let score = 0;

      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[!@#$%^&*]/.test(password)) score++;

      return score;
    },

    getPasswordStrengthText(score) {
      switch (score) {
        case 0:
        case 1:
          return "Very Weak";
        case 2:
          return "Weak";
        case 3:
          return "Fair";
        case 4:
          return "Good";
        case 5:
          return "Strong";
        default:
          return "Very Weak";
      }
    },

    getPasswordStrengthColor(score) {
      switch (score) {
        case 0:
        case 1:
          return "text-red-500";
        case 2:
          return "text-orange-500";
        case 3:
          return "text-yellow-500";
        case 4:
          return "text-blue-500";
        case 5:
          return "text-green-500";
        default:
          return "text-gray-500";
      }
    },

    /* ===============================
       ADDITIONAL UTILITY METHODS
    =============================== */
    updateUserField(field, value) {
      if (this.user) {
        this.user[field] = value;
        localStorage.setItem("user", JSON.stringify(this.user));

        // Emit auth state changed
        this.emitAuthStateChanged();
      }
    },

    // Method to clear only error messages
    clearError() {
      this.error = null;
    },

    // Method to clear only success messages
    clearSuccess() {
      this.successMessage = null;
    },

    // Check if token exists and is valid
    checkAuth() {
      return this.isAuthenticated && this.user !== null;
    },

    // Test notification method
    async testNotification() {
      try {
        const response = await axiosClient.post("/notifications/test");
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        console.error("Test notification failed:", error);
        return {
          success: false,
          error:
            error.response?.data?.message || "Failed to send test notification",
        };
      }
    },
  },
});

// Export notification settings composable for components
export const useNotificationSettings = () => {
  const authStore = useAuthStore();

  return {
    settings: authStore.notificationSettings,
    enabled: authStore.notificationsEnabled,
    soundEnabled: authStore.soundEnabled,
    desktopEnabled: authStore.desktopNotificationsEnabled,
    emailEnabled: authStore.emailNotificationsEnabled,
    updateSettings: authStore.updateNotificationSettings.bind(authStore),
  };
};

// use permissions example
//<template>
// <nav>
//  <router-link to="/dashboard" v-permission="['dashboard.view']">
//    Dashboard
//  </router-link>

//  <router-link to="/users" v-permission="['users.list']">
//     Users
//    </router-link>

//   <router-link to="/reports" v-permission="['reports.list']">
//    Reports
//  </router-link>

//   <router-link to="/settings" v-role="['superadmin']">
//    Settings
//  </router-link>
//  </nav>
//</template>
//
