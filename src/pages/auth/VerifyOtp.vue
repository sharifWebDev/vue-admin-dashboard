<template>
  <div :class="[
    'min-h-screen transition-all duration-500 ease-in-out m-0',
    darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
  ]">
    <div class="flex flex-col lg:flex-row align-center justify-center min-h-screen 2xl:w-4/5 mx-auto">

      <!-- Right Side OTP Verification Form (50%) - Enhanced Design -->
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
                Verify OTP
              </h3> 
              <p class="transition-colors duration-500 mb-1 text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                Enter the 6-digit code sent to
              </p>
              <p class="font-medium transition-colors duration-500"
                :class="darkMode ? 'text-blue-300' : 'text-blue-600'">
                {{ userEmail }}
              </p>
            </div>

            <!-- Messages -->
            <div v-if="successMessage" :class="[
              'mb-6 p-4 rounded-xl border transition-all duration-500 animate-slide-down',
              darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            ]">
              <div class="flex items-center">
                <i class="fas fa-check-circle mr-3 transition-colors duration-500"
                  :class="darkMode ? 'text-green-400' : 'text-green-600'"></i>
                <span :class="darkMode ? 'text-green-300' : 'text-green-800'">{{ successMessage }}</span>
              </div>
            </div>

            <div v-if="errorMessage" :class="[
              'mb-6 p-4 rounded-xl border transition-all duration-500 animate-slide-down',
              darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            ]">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-3 transition-colors duration-500"
                  :class="darkMode ? 'text-red-400' : 'text-red-600'"></i>
                <span :class="darkMode ? 'text-red-300' : 'text-red-800'">{{ errorMessage }}</span>
              </div>
            </div>

            <!-- OTP Verification Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- OTP Input -->
              <div>
                <label :class="[
                  'block text-sm font-medium mb-2 transition-colors duration-500',
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                ]">
                  6-Digit OTP Code
                  <span class="text-red-500">*</span>
                </label>

                <!-- OTP Input Fields -->
                <div class="flex justify-center space-x-3 mb-2">
                  <input v-for="(digit, index) in otpDigits" :key="index" type="text" v-model="otpDigits[index]"
                    maxlength="1" @input="handleOtpInput(index, $event)" @keydown="handleOtpKeyDown(index, $event)"
                    @paste="handleOtpPaste" :ref="el => otpInputRefs[index] = el" :class="[
                      'w-12 h-12 text-center border rounded-xl text-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2',
                      darkMode
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent',
                      otpDigits[index] && !errors.otp.length
                        ? darkMode ? 'border-green-500' : 'border-green-500'
                        : '',
                      errors.otp.length
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    ]" />
                </div>

                <!-- OTP Error Message -->
                <div v-if="errors.otp.length" class="mt-2 flex items-center space-x-2 text-sm animate-slide-down">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                  <span :class="darkMode ? 'text-red-400' : 'text-red-600'">{{ errors.otp[0] }}</span>
                </div>

                <!-- Timer -->
                <div class="mt-4 text-center">
                  <p class="text-sm transition-colors duration-500"
                    :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                    <i class="fas fa-clock mr-2" :class="timer <= 30 ? 'text-red-500' : ''"></i>
                    Code expires in:
                    <span :class="[
                      'font-semibold',
                      timer <= 30 ? 'text-red-500 animate-pulse' : darkMode ? 'text-blue-300' : 'text-blue-600'
                    ]">
                      {{ formatTime(timer) }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" :disabled="loadingBtn || !isOtpComplete || timer === 0" :class="[
                'w-full py-3 rounded-xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group',
                darkMode
                  ? 'bg-[#082680] text-white shadow-lg shadow-yellow-50'
                  : 'bg-[#082680] text-white shadow-lg shadow-yellow-50',
                !loadingBtn && isOtpComplete && timer > 0 ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
              ]">
                <span v-if="loadingBtn"
                  class="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-3"></span>
                <span class="flex items-center">
                  {{ loadingBtn ? 'Verifying...' : timer === 0 ? 'OTP Expired' : 'Verify OTP' }}
                </span>
                <i v-if="!loadingBtn && timer > 0"
                  class="fas fa-check ml-2 transition-transform duration-300 group-hover:scale-110"></i>
              </button>

              <!-- Resend OTP -->
              <div class="text-center">
                <button type="button" @click="resendOtp" :disabled="resendTimer > 0" :class="[
                  'text-sm transition-all duration-500 hover:scale-105 active:scale-95 font-medium',
                  darkMode
                    ? resendTimer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'
                    : resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                ]">
                  <i class="fas fa-redo-alt mr-2" :class="resendTimer > 0 ? 'animate-spin' : ''"></i>
                  {{ resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP' }}
                </button>
              </div>

              <!-- Back to Login Link -->
              <div class="text-center pt-4 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
                <router-link to="/login" :class="[
                  'inline-flex items-center text-sm transition-all duration-500 hover:scale-105 active:scale-95 font-medium',
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                ]">
                  <i class="fas fa-arrow-left mr-2"></i> Back to Login
                </router-link>
              </div>
            </form>

            <!-- Additional Info -->
            <div class="mt-8 pt-6 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
              <p class="text-sm text-center transition-colors duration-500"
                :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                <i class="fas fa-info-circle mr-2"></i>
                The OTP code is valid for 10 minutes. Check your spam folder if you don't see it.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 text-center text-sm transition-colors duration-500"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            <p>By using our service, you agree to our</p>
            <p>
              <router-link v-for="(link, index) in footerLinks" :key="link.text" :to="link.to" :class="[
                'transition-colors duration-300 hover:underline',
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800',
                link.class
              ]">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useDarkModeStore } from "@/stores/darkMode";
import { useRouter, useRoute } from "vue-router";

const authStore = useAuthStore();
const darkModeStore = useDarkModeStore();
const router = useRouter();
const route = useRoute();

// Theme
const darkMode = computed(() => darkModeStore.darkMode);

// Form state
const otpDigits = ref(['', '', '', '', '', '']);
const otpInputRefs = ref([]);
const timer = ref(600); // 10 minutes in seconds
const resendTimer = ref(60); // 60 seconds before resend
const userEmail = ref('');

const errors = ref({
  otp: [],
});

const loadingBtn = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
let timerInterval = null;
let resendTimerInterval = null;

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

// Computed properties
const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const formattedOtp = computed(() => {
  return otpDigits.value.join('');
});

// Timer functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const startResendTimer = () => {
  if (resendTimerInterval) clearInterval(resendTimerInterval);

  resendTimerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      clearInterval(resendTimerInterval);
    }
  }, 1000);
};

// OTP input handling
const handleOtpInput = (index, event) => {
  const value = event.target.value;

  // Allow only digits
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = '';
    return;
  }

  // Take only the first digit if multiple entered
  if (value.length > 1) {
    otpDigits.value[index] = value.charAt(0);
  } else {
    otpDigits.value[index] = value;
  }

  // Clear errors when user starts typing
  if (errors.value.otp.length) {
    errors.value.otp = [];
    errorMessage.value = '';
  }

  // Auto-focus next input
  if (value && index < 5) {
    nextTick(() => {
      otpInputRefs.value[index + 1]?.focus();
    });
  }

  // If deleting, focus previous input
  if (!value && index > 0) {
    nextTick(() => {
      otpInputRefs.value[index - 1]?.focus();
    });
  }
};

const handleOtpKeyDown = (index, event) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      otpInputRefs.value[index - 1]?.focus();
    });
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault();
    otpInputRefs.value[index - 1]?.focus();
  }

  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault();
    otpInputRefs.value[index + 1]?.focus();
  }
};

const handleOtpPaste = (event) => {
  event.preventDefault();
  const pasteData = event.clipboardData.getData('text');

  if (!/^\d{6}$/.test(pasteData)) {
    errorMessage.value = "Please paste a valid 6-digit OTP";
    return;
  }

  const digits = pasteData.split('');
  digits.forEach((digit, index) => {
    if (index < 6) {
      otpDigits.value[index] = digit;
    }
  });

  // Focus last input
  nextTick(() => {
    otpInputRefs.value[5]?.focus();
  });

  // Clear errors
  errors.value.otp = [];
  errorMessage.value = '';
};

// Validation
const validateOtp = () => {
  errors.value.otp = [];

  if (!isOtpComplete.value) {
    errors.value.otp = ["Please enter the complete 6-digit OTP"];
    return false;
  }

  if (timer.value === 0) {
    errors.value.otp = ["OTP has expired. Please request a new one."];
    return false;
  }

  if (formattedOtp.value.length !== 6) {
    errors.value.otp = ["OTP must be exactly 6 digits"];
    return false;
  }

  return true;
};

// Resend OTP
const resendOtp = async () => {
  if (resendTimer.value > 0) return;

  try {
    loadingBtn.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    // Reset OTP fields
    otpDigits.value = ['', '', '', '', '', ''];
    errors.value.otp = [];

    // TODO: Replace with actual API call
    await authStore.resendOtp({ email: userEmail.value });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset timers
    timer.value = 600;
    resendTimer.value = 60;
    startTimer();
    startResendTimer();

    // Focus first input
    nextTick(() => {
      otpInputRefs.value[0]?.focus();
    });

    successMessage.value = "New OTP sent to your email!";

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);

  } catch (error) {
    errorMessage.value = "Failed to resend OTP. Please try again.";
    console.error("Resend OTP error:", error);
  } finally {
    loadingBtn.value = false;
  }
};

// Form submission
const handleSubmit = async () => {
  if (!validateOtp()) {
    errorMessage.value = "Please fix the errors in the form";
    return;
  }

  try {
    loadingBtn.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const payload = {
      email: userEmail.value,
      otp: formattedOtp.value
    };

    // TODO: Replace with actual API call
    const result = await authStore.verifyOTP(payload);

    if (!result.success) {
      errorMessage.value = result.error || "Invalid OTP. Please try again.";
      return;
    }

    successMessage.value = result.message || "OTP verified successfully! Redirecting to reset password...";

    setTimeout(() => {
      router.push("/reset-password");
    }, 2000);

  } catch (error) {
    errorMessage.value = "An unexpected error occurred. Please try again later.";
    console.error("Verify OTP error:", error);
  } finally {
    loadingBtn.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Get email from route query or store
  if (route.query.email) {
    userEmail.value = route.query.email;
  } else {
    userEmail.value = authStore.getEmail() || '';
  }

  // Start timers
  startTimer();
  startResendTimer();

  // Focus first OTP input
  nextTick(() => {
    otpInputRefs.value[0]?.focus();
  });
});

onUnmounted(() => {
  // Clean up intervals
  if (timerInterval) clearInterval(timerInterval);
  if (resendTimerInterval) clearInterval(resendTimerInterval);
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

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
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

.animate-shake {
  animation: shake 0.5s ease-in-out;
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

@media (max-width: 640px) {
  .flex.space-x-3 {
    gap: 0.5rem;
  }

  .w-12.h-12 {
    width: 2.5rem;
    height: 2.5rem;
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

/* OTP input specific styles */
input[type="text"] {
  caret-color: rgb(59, 130, 246);
  text-align: center;
}

/* Smooth hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Input focus effects */
.otp-input:focus {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Success state for OTP inputs */
.otp-input.success {
  border-color: rgb(34, 197, 94);
  background-color: rgba(34, 197, 94, 0.05);
}

/* Error state for OTP inputs */
.otp-input.error {
  border-color: rgb(239, 68, 68);
  background-color: rgba(239, 68, 68, 0.05);
  animation: shake 0.5s ease-in-out;
}
</style>