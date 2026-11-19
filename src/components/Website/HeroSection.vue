<template>
  <section id="home" class="min-h-screen pt-32 pb-20 relative overflow-hidden flex items-center transition-colors duration-700
           bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white">

    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full 
                  bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] animate-pulse"></div>
      <div class="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full 
                  bg-indigo-600/5 dark:bg-blue-600/10 blur-[120px]" style="animation-delay: 2s"></div>

      <div class="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 40px 40px;">
      </div>
    </div>

    <div class="container mx-auto max-w-[90rem] px-6 relative z-10">
      <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

        <div class="w-full lg:w-[45%] text-center lg:text-left order-2 lg:order-1">
          <div class="space-y-8">

            <div class="inline-flex items-center gap-3 px-4 py-2 rounded-2xl 
                        bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 
                        shadow-sm dark:shadow-none backdrop-blur-xl group cursor-default">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-600 dark:bg-cyan-400"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-cyan-100/80">
                Engine v4.2.0 <span class="mx-2 opacity-30">|</span>
                <span class="text-slate-900 dark:text-white transition-colors">Laravel 12 Ready</span>
              </span>
            </div>

            <h1 class="text-4xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tighter">
              Architect Systems <br />
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-300 dark:via-blue-200 dark:to-white">
                at the Speed of Thought
              </span>
            </h1>

            <p class="text-lg md:text-xl font-medium leading-relaxed
                      text-slate-500 dark:text-slate-400 opacity-90 dark:opacity-60 max-w-xl mx-auto lg:mx-0">
              Eliminate boilerplate. Our Agentic AI engine automates complex CRUD logic, payment flows, and security
              protocols in seconds.
            </p>

            <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a href="#pricing" class="group px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl
                       bg-slate-900 dark:bg-white text-white dark:text-slate-900 
                       hover:scale-105 active:scale-95 shadow-indigo-500/20 dark:shadow-cyan-500/20">
                <span>START BUILDING</span>
                <i class="fas fa-bolt group-hover:rotate-12 transition-transform text-cyan-400 dark:text-cyan-600"></i>
              </a>
              <a href="#about" class="px-10 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3
                       bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 
                       text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 backdrop-blur-xl">
                <span>VIEW BLUEPRINTS</span>
                <i class="fas fa-layer-group opacity-40"></i>
              </a>
            </div>

            <div class="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 
                        opacity-40 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <div class="flex items-center gap-2 group">
                <i class="fab fa-laravel text-3xl text-slate-700 dark:text-white group-hover:text-[#FF2D20]"></i>
                <span class="text-[10px] font-black uppercase tracking-widest">Laravel 12</span>
              </div>
              <div class="flex items-center gap-2 group">
                <i class="fab fa-vuejs text-3xl text-slate-700 dark:text-white group-hover:text-[#42b883]"></i>
                <span class="text-[10px] font-black uppercase tracking-widest">Vue 3</span>
              </div>
              <div class="flex items-center gap-2 group">
                <i class="fas fa-brain text-3xl text-slate-700 dark:text-white group-hover:text-cyan-500"></i>
                <span class="text-[10px] font-black uppercase tracking-widest">Agentic AI</span>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-[55%] order-1 lg:order-2 flex justify-center lg:justify-end">
          <div class="w-full max-w-4xl transform lg:rotate-[-1deg] hover:rotate-0 transition-transform duration-700 
                      drop-shadow-2xl dark:drop-shadow-[0_35px_35px_rgba(0,180,216,0.15)]">
            <AppSlider />
          </div>
        </div>
      </div>
    </div>
 
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AppSlider from '@/components/Website/AppSlider.vue'; 
import { useAuthStore } from '@/stores/authStore';  

const authStore = useAuthStore();

const user = ref(null); 

onMounted(() => {
  if (authStore.checkAuth()) {
    authStore.getEmail();
    user.value = authStore.user;
    console.log('Authenticated user:', user.value);
  } else {
    user.value = null;
  }
});
</script>

<style scoped>
/* Custom Dark Mode Base */
.dark #home {
  background-color: #030712;
}

/* Custom Light Mode Gradient */
#home:not(.dark) {
  background-image:
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.03) 0px, transparent 50%);
}

/* Custom Dark Mode Gradient */
.hero-gradient {
  background-color: #030712;
  /* Deep Slate/Black base */
  background-image:
    radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%);
}

/* Ensure the section takes full height on mobile too */
#home {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>