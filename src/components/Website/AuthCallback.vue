<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  const error = route.query.error;
  
  if (error) {
    authStore.error = decodeURIComponent(error);
    router.push('/login');
    return;
  }
  
  if (token) {
    authStore.setToken(token);
    authStore.getVerificationToken(); // Ensure Axios has the token for future requests
    
    if (!authStore.checkAuth()) {
      if (error) {
        authStore.error = decodeURIComponent(error);
      }
      router.push('/login');
      return;
    }
    
    // Fetch user data
    await authStore.fetchUser();
    
    // Redirect to dashboard or home
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
      <p class="text-slate-600 dark:text-slate-400 font-medium">Completing your login...</p>
    </div>
  </div>
</template>