<template>
  <div :class="[
    'min-h-screen transition-all duration-500 ease-in-out m-0',
    darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
  ]">
    <div class="flex flex-col lg:flex-row align-center justify-center min-h-screen 2xl:w-4/5 mx-auto">
      
      <!-- Right Side Reset Password Form (50%) -->
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
                Reset Your Password
              </h3> 
              <p class="transition-colors duration-500 text-sm"
                 :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                Create a new strong password for your account
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

            <!-- Password Requirements -->
            <div :class="[
              'mb-6 p-4 rounded-xl border transition-all duration-500',
              darkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50 border-blue-100'
            ]">
              <h4 class="font-semibold mb-2 transition-colors duration-500 flex items-center"
                  :class="darkMode ? 'text-blue-300' : 'text-blue-700'">
                <i class="fas fa-shield-alt mr-2"></i>
                Password Requirements
              </h4>
              <ul class="space-y-1 text-sm">
                <li v-for="(requirement, index) in passwordRequirements" :key="index"
                    class="flex items-center transition-colors duration-500"
                    :class="[
                      checkRequirement(index) 
                        ? darkMode ? 'text-green-300' : 'text-green-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    ]">
                  <i :class="[
                    'fas mr-2 transition-transform duration-300',
                    checkRequirement(index) ? 'fa-check-circle scale-110' : 'fa-circle'
                  ]"></i>
                  {{ requirement }}
                </li>
              </ul>
              
              <!-- Password Strength Meter -->
              <div class="mt-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs font-medium transition-colors duration-500"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                    Password Strength:
                  </span>
                  <span class="text-xs font-semibold transition-colors duration-500"
                        :class="passwordStrength.class">
                    {{ passwordStrength.text }}
                  </span>
                </div>
                <div class="h-2 rounded-full overflow-hidden"
                     :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div class="h-full transition-all duration-500"
                       :class="passwordStrength.barClass"
                       :style="{ width: passwordStrength.percentage + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Reset Password Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- New Password Field -->
              <div>
                <label :class="[
                  'block text-sm font-medium mb-2 transition-colors duration-500',
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                ]">
                  New Password
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-key transition-colors duration-500"
                       :class="darkMode ? 'text-gray-500' : 'text-gray-400'"></i>
                  </div>
                  <input
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model.trim="form.newPassword"
                    placeholder="Enter new password"
                    required
                    :class="[
                      'w-full pl-10 pr-10 py-3 border outline-none rounded-xl transition-all duration-500 focus:ring-2 placeholder:transition-colors',
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-transparent focus:bg-gray-700' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent focus:bg-white',
                      errors.newPassword.length
                        ? 'border-red-500 focus:ring-red-500'
                        : '',
                      form.newPassword && !errors.newPassword.length && passwordScore >= 3
                        ? darkMode ? 'border-green-500' : 'border-green-500'
                        : ''
                    ]"
                    @input="validatePassword"
                  />
                  <!-- Toggle Password Visibility -->
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-500"
                    :class="darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
                    aria-label="Toggle password visibility"
                  >
                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.newPassword.length" class="mt-2 flex items-center space-x-2 text-sm animate-slide-down">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                  <span :class="darkMode ? 'text-red-400' : 'text-red-600'">{{ errors.newPassword[0] }}</span>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div>
                <label :class="[
                  'block text-sm font-medium mb-2 transition-colors duration-500',
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                ]">
                  Confirm New Password
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-key transition-colors duration-500"
                       :class="darkMode ? 'text-gray-500' : 'text-gray-400'"></i>
                  </div>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model.trim="form.confirmPassword"
                    placeholder="Confirm your new password"
                    required
                    :class="[
                      'w-full pl-10 pr-10 py-3 border outline-none rounded-xl transition-all duration-500 focus:ring-2 placeholder:transition-colors',
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-transparent focus:bg-gray-700' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent focus:bg-white',
                      errors.confirmPassword.length
                        ? 'border-red-500 focus:ring-red-500'
                        : '',
                      form.confirmPassword && !errors.confirmPassword.length && form.newPassword === form.confirmPassword
                        ? darkMode ? 'border-green-500' : 'border-green-500'
                        : ''
                    ]"
                    @input="validateConfirmPassword"
                  />
                  <!-- Toggle Password Visibility -->
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-500"
                    :class="darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
                    aria-label="Toggle password visibility"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  
                  <!-- Check mark when passwords match -->
                  <div v-if="form.confirmPassword && form.newPassword === form.confirmPassword" 
                       class="absolute inset-y-0 right-8 pr-3 flex items-center">
                    <i class="fas fa-check transition-colors duration-500"
                       :class="darkMode ? 'text-green-400' : 'text-green-500'"></i>
                  </div>
                </div>
                <div v-if="errors.confirmPassword.length" class="mt-2 flex items-center space-x-2 text-sm animate-slide-down">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                  <span :class="darkMode ? 'text-red-400' : 'text-red-600'">{{ errors.confirmPassword[0] }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loadingBtn || !isFormValid"
                :class="[
                  'w-full py-3 rounded-xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group',
                  darkMode 
                 ? 'bg-[#082680] text-white shadow-lg shadow-yellow-50'
    : 'bg-[#082680] text-white shadow-lg shadow-yellow-50',  
                  !loadingBtn && isFormValid ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
                ]"
              >
                <span v-if="loadingBtn" class="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-3"></span>
                <span class="flex items-center">{{ loadingBtn ? 'Updating...' : 'Reset Password' }}</span>
                <i v-if="!loadingBtn && isFormValid" class="fas fa-check ml-2 transition-transform duration-300 group-hover:scale-110"></i>
              </button>

              <!-- Back to Login Link -->
              <div class="text-center pt-4">
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

            <!-- Security Note -->
            <div class="mt-8 pt-6 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
              <p class="text-sm text-center transition-colors duration-500"
                 :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                <i class="fas fa-shield-alt mr-2" :class="darkMode ? 'text-blue-400' : 'text-blue-500'"></i>
                For security, please don't use passwords you've used on other sites.
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
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useDarkModeStore } from "@/stores/darkMode";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const darkModeStore = useDarkModeStore();
const router = useRouter();
const userEmail = ref(''); 
const verificationToken = ref('');

// Theme
const darkMode = computed(() => darkModeStore.darkMode);

// Form state
const form = ref({
  newPassword: "",
  confirmPassword: ""
});

const errors = ref({
  newPassword: [],
  confirmPassword: []
});

const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordScore = ref(0);
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

// Password requirements
const passwordRequirements = [
  "At least 8 characters long",
  "Contains uppercase letters (A-Z)",
  "Contains lowercase letters (a-z)",
  "Contains numbers (0-9)",
  "Contains special characters (!@#$%^&*)"
];

// Computed properties
const isFormValid = computed(() => {
  return form.value.newPassword && 
         form.value.confirmPassword && 
         !errors.value.newPassword.length && 
         !errors.value.confirmPassword.length &&
         passwordScore.value >= 3 &&
         form.value.newPassword === form.value.confirmPassword;
});

const passwordStrength = computed(() => {
  if (passwordScore.value === 0) {
    return {
      text: "Very Weak",
      class: darkMode.value ? "text-red-400" : "text-red-600",
      barClass: "bg-red-500",
      percentage: 20
    };
  } else if (passwordScore.value === 1) {
    return {
      text: "Weak",
      class: darkMode.value ? "text-orange-400" : "text-orange-600",
      barClass: "bg-orange-500",
      percentage: 40
    };
  } else if (passwordScore.value === 2) {
    return {
      text: "Fair",
      class: darkMode.value ? "text-yellow-400" : "text-yellow-600",
      barClass: "bg-yellow-500",
      percentage: 60
    };
  } else if (passwordScore.value === 3) {
    return {
      text: "Good",
      class: darkMode.value ? "text-blue-400" : "text-blue-600",
      barClass: "bg-blue-500",
      percentage: 80
    };
  } else {
    return {
      text: "Strong",
      class: darkMode.value ? "text-green-400" : "text-green-600",
      barClass: "bg-green-500",
      percentage: 100
    };
  }
});

// Password validation functions
const calculatePasswordScore = (password) => {
  let score = 0;
  
  // Length check (8+ characters)
  if (password.length >= 8) score++;
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  
  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  
  // Number check
  if (/[0-9]/.test(password)) score++;
  
  // Special character check
  if (/[!@#$%^&*]/.test(password)) score++;
  
  return score;
};

const checkRequirement = (index) => {
  const password = form.value.newPassword;
  
  switch(index) {
    case 0: // Length
      return password.length >= 8;
    case 1: // Uppercase
      return /[A-Z]/.test(password);
    case 2: // Lowercase
      return /[a-z]/.test(password);
    case 3: // Numbers
      return /[0-9]/.test(password);
    case 4: // Special characters
      return /[!@#$%^&*]/.test(password);
    default:
      return false;
  }
};

const validatePassword = () => {
  const password = form.value.newPassword;
  errors.value.newPassword = [];
  passwordScore.value = calculatePasswordScore(password);
  
  if (!password) {
    errors.value.newPassword = ["Password is required"];
    return false;
  }
  
  if (password.length < 8) {
    errors.value.newPassword = ["Password must be at least 8 characters long"];
    return false;
  }
  
  if (passwordScore.value < 3) {
    errors.value.newPassword = ["Password is too weak. Please use a stronger password."];
    return false;
  }
  
  return true;
};

const validateConfirmPassword = () => {
  const confirmPassword = form.value.confirmPassword;
  const password = form.value.newPassword;
  errors.value.confirmPassword = [];
  
  if (!confirmPassword) {
    errors.value.confirmPassword = ["Please confirm your password"];
    return false;
  }
  
  if (confirmPassword !== password) {
    errors.value.confirmPassword = ["Passwords do not match"];
    return false;
  }
  
  return true;
};
 
// Watch for password changes to update validation
watch(() => form.value.newPassword, () => {
  validatePassword();
  // Also re-validate confirm password when password changes
  if (form.value.confirmPassword) {
    validateConfirmPassword();
  }
});

watch(() => form.value.confirmPassword, () => {
  validateConfirmPassword();
});

// Form submission
const handleSubmit = async () => {
  if (!validatePassword() || !validateConfirmPassword()) {
    errorMessage.value = "Please fix the errors in the form";
    return;
  }

  try {
    loadingBtn.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const payload = {
      password: form.value.newPassword,
      password_confirmation: form.value.confirmPassword,
      token: verificationToken.value,
      email: userEmail.value
    };
    
    const result = await authStore.resetPassword(payload);
 
    if (!result.success) {
      errorMessage.value = result.error || "Failed to reset password. Please try again.";
      return;
    }
 
    form.value = { newPassword: "", confirmPassword: "" };
    successMessage.value = "Password reset successfully! Redirecting to login...";
 
    setTimeout(() => {
      router.push("/login");
    }, 2000);

  } catch (error) {
    errorMessage.value = "An unexpected error occurred. Please try again later.";
    console.error("Reset password error:", error);
  } finally {
    loadingBtn.value = false;
  }
};

// Clear form on mount
onMounted(() => {
  form.value = { newPassword: "", confirmPassword: "" };
  errors.value = { newPassword: [], confirmPassword: [] };
  errorMessage.value = "";
  successMessage.value = "";
  userEmail.value = authStore.getEmail() || "";
  verificationToken.value = authStore.getVerificationToken() || "";
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

@keyframes checkmark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
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

.animate-checkmark {
  animation: checkmark 0.3s ease-out forwards;
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

/* Password strength bar animation */
@keyframes strengthBar {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none;
  }
}

/* Password requirement check animation */
.fa-check-circle {
  animation: checkmark 0.3s ease-out forwards;
}

/* Strength meter bar */
.h-2 > div {
  animation: strengthBar 0.5s ease-out forwards;
  transform-origin: left;
}

/* Password visibility toggle button */
button[type="button"]:focus {
  outline: none;
  ring: 2px;
}

/* List item hover effect */
li:hover {
  transform: translateX(2px);
}

/* Form input validation states */
input:valid {
  border-color: rgb(34, 197, 94);
}

input:invalid:not(:placeholder-shown) {
  border-color: rgb(239, 68, 68);
}

/* Progress bar animation */
@keyframes progress {
  0% {
    width: 0%;
  }
  100% {
    width: var(--percentage);
  }
}

.h-2 > div {
  animation: progress 0.6s ease-out forwards;
}

/* Smooth hover effects for requirement items */
li {
  transition: all 0.2s ease;
}

li:hover {
  transform: translateX(4px);
}

/* Button hover effects */
.group:hover .fa-check {
  animation: checkmark 0.3s ease-out;
}
</style>