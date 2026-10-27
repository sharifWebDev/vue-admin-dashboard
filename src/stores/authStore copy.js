import { defineStore } from "pinia";
import axiosClient from "@/axiosClient";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("authToken") || null,
    user: JSON.parse(localStorage.getItem("user") || "null") || null,
    isLoading: false,
    error: null,
    successMessage: null,
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

    role: (state) => state.user?.user_type || state.user?.role || "user",
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

        router.push("/");

        return { success: true, data: { user, token } };
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
       PASSWORD MANAGEMENT
    =============================== */
    async changePassword(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(`/auth/change-password`, payload);
          
        this.successMessage = response.data.message || "Password changed successfully!";

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
        const response = await axiosClient.post(`/forgot-password/request`, payload);

        // Success message from backend, or fallback
        this.successMessage =
          response.data.message ||
          "Password reset instructions have been sent to your email.";

        return {
          success: true,
          data: response.data,
          message: this.successMessage,
        };
      } catch (error) {
        // Main fallback message
        const mainMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to send password reset instructions. Please try again.";

        // Field-level validation errors
        const fieldErrors = error.response?.data?.errors || {};

        // Show only first email validation error if exists
        if (fieldErrors.email && fieldErrors.email.length > 0) {
          this.error = fieldErrors.email[0]; // e.g., "The selected email is invalid."
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

    //set email for later use in OTP verification
    setEmail(email) {
      localStorage.setItem("resetEmail", email);
    },
    getEmail() {
      return localStorage.getItem("resetEmail");
    },

    removeEmail() {
      localStorage.removeItem("resetEmail");
    },

    setToken(token) {
      localStorage.setItem("verificationToken", token);
    },

    getToken() {
      return localStorage.getItem("verificationToken");
    },

    removeToken() {
      localStorage.removeItem("verificationToken");
    },

    async verifyOTP(payload) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const response = await axiosClient.post(`/forgot-password/verify`, payload);
         
        this.successMessage =
          response.data.message || "OTP verified successfully!";

        // Store the verification token if provided
        if (response.data.data?.verification_token) {
          this.setToken(response.data.data.verification_token);
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
        const response = await axiosClient.post(`/forgot-password/request`, payload);

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
        const verificationToken = localStorage.getItem("verificationToken");
 
        if (verificationToken) {
          payload.verification_token = verificationToken;
        }

        const response = await axiosClient.post(`/forgot-password/reset`, payload);

        this.successMessage = response.data.message || "Password reset successfully!";
 
        this.logout();  
        this.removeEmail();
        this.removeToken();

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
        this.logout();
        return { success: false };
      }
    },

    /* ===============================
       INITIALIZATION & UTILITIES
    =============================== */
    initializeAuth() {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          this.token = token;
          this.user = JSON.parse(user);
          axiosClient.defaults.headers.common["Authorization"] =
            `Bearer ${token}`;
          return true;
        } catch (error) {
          console.error("Error parsing user data:", error);
          this.logout();
          return false;
        }
      }
      return false;
    },

    logout() {
      // Clear all auth-related data
      this.token = null;
      this.user = null;
      this.error = null;
      this.successMessage = null;

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("verificationToken");

      // Clear axios headers
      delete axiosClient.defaults.headers.common["Authorization"];

      // Redirect to login
      router.push("/login");
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

      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }

      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }

      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }

      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
      }

      if (!/[!@#$%^&*]/.test(password)) {
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
  },
});
