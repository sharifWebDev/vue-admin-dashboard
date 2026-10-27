<template>
  <div :class="[
    'min-h-screen transition-all duration-500 ease-in-out m-0',
    darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
  ]">
    <div class="flex flex-col lg:flex-row align-center justify-center min-h-screen 2xl:w-4/5 mx-auto">
      

      <!-- Right Side Login Form (50%) - Enhanced Design -->
      <div class="lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div class="w-full max-w-md animate-slide-up" style="animation-delay: 200ms">
          <!-- Form Container -->
          <div :class="[
            'rounded-3xl p-8 transition-all duration-500 overflow-hidden relative border shadow-xl',
            darkMode 
              ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700/50 shadow-gray-900/30' 
              : 'bg-white/90 backdrop-blur-sm border-white/50 shadow-gray-200/30'
          ]">
            <!-- Header -->
            <div class="text-center mb-8">
              <div :class="[
                'w-auto h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-all duration-500']">
                <!-- <i class="fas fa-lock text-2xl" :class="darkMode ? 'text-gray-300' : 'text-gray-600'"></i> -->
                <div class="h-50 w-auto rounded-lg flex items-center justify-center transition-all duration-500">
                  <img src="/logo/logo-sm.png" alt="" class="h-24">
                </div>
              </div>
              <h3 class="text-xl font-semibold mt-4 transition-colors duration-500"
                :class="darkMode ? 'text-white' : 'text-gray-700'">
                Forgot Password
              </h3> 
              <p class="transition-colors duration-500 text-sm"
                 :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                Enter your email to receive a reset 6-digit OTP code and instructions to reset your password.
              </p>
            </div>

            <!-- Messages -->
            <div v-if="successMessage" 
                 :class="[
                   'mb-6 p-4 rounded-xl border transition-all duration-500 animate-slide-down',
                   darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                 ]">
              <div class="flex items-center">
                <i class="fas fa-check-circle mr-3 transition-colors duration-500"
                   :class="darkMode ? 'text-green-400' : 'text-green-600'"></i>
                <span :class="darkMode ? 'text-green-300' : 'text-green-800'">{{ successMessage }}</span>
              </div>
            </div>
            
            <div v-if="errorMessage" 
                 :class="[
                   'mb-6 p-4 rounded-xl border transition-all duration-500 animate-slide-down',
                   darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                 ]">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-3 transition-colors duration-500"
                   :class="darkMode ? 'text-red-400' : 'text-red-600'"></i>
                <span :class="darkMode ? 'text-red-300' : 'text-red-800'">{{ errorMessage }}</span>
              </div>
            </div>

            <!-- Forgot Password Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Email Field -->
              <div>
                <label :class="[
                  'block text-sm font-medium mb-2 transition-colors duration-500',
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                ]">
                  Email Address
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-envelope transition-colors duration-500"
                       :class="darkMode ? 'text-gray-500' : 'text-gray-400'"></i>
                  </div>
                  <input
                    type="email"
                    v-model.trim="form.email"
                    placeholder="you@example.com"
                    required
                    :class="[
                      'w-full pl-10 pr-4 py-3 border outline-none rounded-xl transition-all duration-500 focus:ring-2 placeholder:transition-colors',
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-transparent focus:bg-gray-700' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent focus:bg-white',
                      errors.email.length
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    ]"
                    @blur="validateField('email')"
                    @input="clearFieldError('email')"
                  />
                  <div v-if="form.email && !errors.email.length" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i class="fas fa-check transition-colors duration-500"
                       :class="darkMode ? 'text-green-400' : 'text-green-500'"></i>
                  </div>
                </div>
                <div v-if="errors.email.length" class="mt-2 flex items-center space-x-2 text-sm animate-slide-down">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                  <span :class="darkMode ? 'text-red-400' : 'text-red-600'">{{ errors.email[0] }}</span>
                </div>
              </div>
  
              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loadingBtn || !form.email"
                :class="[
                  'w-full py-3 rounded-xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group',
                  darkMode 
                  ? 'bg-[#082680] text-white shadow-lg shadow-yellow-50'
    : 'bg-[#082680] text-white shadow-lg shadow-yellow-50',
                   
                  !loadingBtn ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
                ]"
              >
                <span v-if="loadingBtn" class="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-3"></span>
                <span class="flex items-center">{{ loadingBtn ? 'Sending...' : 'Send Reset Link' }}</span>
                <i v-if="!loadingBtn" class="fas fa-paper-plane ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
              </button>
  
              <!-- Back to Login Link -->
              <div class="text-center">
                <router-link
                  to="/login"
                  :class="[
                    'inline-flex items-center text-sm transition-all duration-500 hover:scale-105 active:scale-95 font-medium',
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  ]"
                >
                  <i class="fas fa-arrow-left mr-2"></i> Back to Login
                </router-link>
              </div>
            </form>

            <!-- Additional Info -->
            <div class="mt-8 pt-6 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
              <p class="text-sm text-center transition-colors duration-500"
                 :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                <i class="fas fa-info-circle mr-2"></i>
                The reset 6-digit OTP code will expire in 10 minutes. Check your spam folder if you don't see it.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 text-center text-sm transition-colors duration-500"
               :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            <p>By using our service, you agree to our</p>
            <p>
              <router-link 
                v-for="(link, index) in footerLinks" 
                :key="link.text"
                :to="link.to"
                :class="[
                  'transition-colors duration-300 hover:underline',
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800',
                  link.class
                ]"
              >
                {{ link.text }}
                <span v-if="index < footerLinks.length - 1" class="mx-1">{{ link.separator || '' }}</span>
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useDarkModeStore } from "@/stores/darkMode";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const darkModeStore = useDarkModeStore();
const router = useRouter();

// Theme
const darkMode = computed(() => darkModeStore.darkMode);

// Form state
const form = ref({
  email: "",
});

const errors = ref({
  email: [],
});

const loadingBtn = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Features list
const features = [
  {
    icon: "fas fa-university",
    title: "Multi-Branch Management",
    description: "Manage multiple bank branches from a single unified dashboard"
  },
  {
    icon: "fas fa-lock",
    title: "Advanced Security",
    description: "Bank-grade encryption and multi-level authentication protocols"
  },
  {
    icon: "fas fa-chart-pie",
    title: "Real-time Analytics",
    description: "Monitor transactions and generate detailed financial reports instantly"
  },
  {
    icon: "fas fa-exchange-alt",
    title: "Transaction Processing",
    description: "Fast and secure processing of deposits, withdrawals, and transfers"
  }
];

// Footer links
const footerLinks = [
  { text: "Terms of Service", to: "/terms" },
  { text: "Privacy Policy", to: "/privacy", separator: "•" },
  { text: "Support", to: "/support" }
];
 

// Validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateField = (field) => {
  const value = form.value[field];
  errors.value[field] = [];

  if (!value) {
    errors.value[field] = [`${field.charAt(0).toUpperCase() + field.slice(1)} is required`];
    return false;
  }

  if (field === "email") {
    if (!validateEmail(value)) {
      errors.value.email = ["Please enter a valid email address"];
      return false;
    }
  }

  return true;
};

const clearFieldError = (field) => {
  if (errors.value[field].length) {
    errors.value[field] = [];
  }
  // Clear general messages when user starts typing
  if (field === "email") {
    errorMessage.value = "";
  }
};

const validateForm = () => {
  let isValid = true;
  if (!validateField("email")) isValid = false;
  return isValid;
};

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    errorMessage.value = "Please fix the errors in the form";
    return;
  }

  try {
    loadingBtn.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
     
    const result = await authStore.forgotPassword(form.value);
 
    if (!result.success) {
      errorMessage.value = result.error || "Failed to send reset link. Please try again.";
      return;
    }
    //set email in cookies or store for later use in OTP verification
    authStore.setEmail(form.value.email);
 
    form.value = { email: "" };
    successMessage.value = "Reset link sent successfully! Please check your inbox.";

    setTimeout(() => {
      successMessage.value = "Redirecting to verify OTP page...";
      setTimeout(() => {
        router.push("/verify-otp");
      }, 1000);
    })  

  } catch (error) {
    errorMessage.value = "An unexpected error occurred. Please try again later.";
    console.error("Forgot password error:", error);
  } finally {
    loadingBtn.value = false;
  }
};
 
onMounted(() => {
  errorMessage.value = "";
  successMessage.value = "";
});
</script>

<style scoped>
/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Glass effect enhancements */
.backdrop-blur-lg {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .lg\:w-1\/2 {
    width: 100%;
  }
  
  .min-h-screen {
    min-height: auto;
  }
}

/* Focus styles */
:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Print styles */
@media print {
  .no-print {
    display: none;
  }
}

/* Smooth hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Gradient borders */
.gradient-border {
  position: relative;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gradient-border:hover::before {
  opacity: 1;
}
</style>