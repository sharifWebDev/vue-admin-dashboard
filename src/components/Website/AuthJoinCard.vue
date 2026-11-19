<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = ref({
  email: '',
  password: ''
});

const isLoading = ref(false);

// Check for error in URL
onMounted(() => {
  const error = route.query.error;
  if (error) {
    authStore.error = decodeURIComponent(error);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

const handleEmailLogin = async () => {
  if (!form.value.email || !form.value.password) {
    authStore.error = 'Please fill in all fields';
    return;
  }
  
  isLoading.value = true;
  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password
  });
  isLoading.value = false;

  if (result.success) {
    router.push('/dashboard');
  }
};

const handleGoogleLogin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const frontendUrl = window.location.origin;
  window.location.href = `${apiUrl}/api/v1/auth/google/redirect?frontend_url=${frontendUrl}`;
};
</script>

<template>
  <div class="w-full max-w-md p-8 rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 shadow-xl transition-all">
    
    <Transition name="fade">
      <div v-if="authStore.error" class="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold text-center">
        {{ authStore.error }}
      </div>
    </Transition>

    <!-- Google Login Button -->
    <button @click="handleGoogleLogin" class="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-slate-900 dark:text-white font-bold text-sm">
      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" class="w-5 h-5" alt="Google" />
      Continue with Google
    </button>

    <div class="relative my-8 flex items-center justify-center">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 dark:border-white/10"></div></div>
      <span class="relative px-4 bg-white dark:bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">OR</span>
    </div>

    <!-- Email Login Form -->
    <form @submit.prevent="handleEmailLogin" class="space-y-4">
      <div class="space-y-3">
        <input 
          v-model="form.email" 
          type="email" 
          placeholder="Email address" 
          required
          :disabled="isLoading"
          class="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-50" />
        
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Password" 
          required
          :disabled="isLoading"
          class="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-50" />
      </div>

      <button type="submit" :disabled="isLoading || authStore.isLoading"
        class="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50">
        <span v-if="isLoading || authStore.isLoading">
          <svg class="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Authenticating...
        </span>
        <span v-else>Continue with email</span>
      </button>
    </form>
    
    <div class="mt-6 text-center">
      <router-link to="/forgot-password" class="text-[10px] text-indigo-500 hover:text-indigo-600 uppercase tracking-widest font-bold transition-colors">
        Forgot password?
      </router-link>
    </div>
    
    <p class="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
      By continuing, you acknowledge our <br/>
      <router-link to="/privacy" class="underline hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</router-link>.
    </p>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>