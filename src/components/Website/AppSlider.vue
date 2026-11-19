<template>
  <div class="relative max-w-6xl mx-auto px-4 py-12">
    <div class="relative mx-auto">
      <div class="relative z-10 mx-auto bg-slate-800 rounded-[2.5rem] p-3 border-[8px] border-slate-800 shadow-2xl overflow-hidden aspect-video lg:aspect-[16/10]">
        
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-white/10"></div>
          <div class="w-2 h-2 rounded-full bg-[#1a1a1a] border border-white/5"></div>
        </div>

        <div class="w-full h-full bg-white dark:bg-slate-900 selection:bg-indigo-500/30 relative flex flex-col overflow-hidden rounded-[1.8rem]">
          
          <div class="absolute inset-0 pointer-events-none">
            <div 
              class="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] transition-colors duration-1000 opacity-50"
              :class="slides[currentSlide].glowColor"
            ></div>
          </div>

          <div class="relative z-10 flex items-center justify-between p-6 pb-2">
            <div class="flex space-x-2">
              <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {{ slides[currentSlide].category }}
            </div>
            <div class="px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-bold text-slate-500">
              BUILD v4.2.0
            </div>
          </div>

          <div class="relative z-10 flex-grow px-8 overflow-hidden">
            <transition-group name="fade-slide">
              <div 
                v-for="(slide, index) in slides" 
                :key="index"
                v-show="currentSlide === index"
                class="absolute inset-0 px-8 flex items-center"
              >
                <div class="grid lg:grid-cols-2 gap-12 items-center w-full">
                  <div class="space-y-5 text-left">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                      <i :class="slide.icon"></i> {{ slide.badge }}
                    </div>
                    <h2 class="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      {{ slide.title }}<span class="text-indigo-500">.</span>
                    </h2>
                    <p class="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                      {{ slide.description }}
                    </p>
                    <div class="flex gap-3 pt-2">
                      <button class="px-5 py-3 text-xs bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                        EXPLORE FEATURE
                      </button>
                      <button class="px-5 py-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-50 transition-all">
                        DOCS
                      </button>
                    </div>
                  </div>

                  <div class="hidden lg:flex items-center justify-center min-h-[300px]">
                    <div class="w-full transform scale-110" v-html="slide?.visual?.template"></div>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>

          <div class="relative z-10 flex items-center justify-between px-6 py-1 border-t border-slate-200 
          dark:border-white/5">
            <div class="flex gap-4">
              <button 
                v-for="(_, i) in slides" 
                :key="i" 
                @click="goToSlide(i)"
                class="flex items-center group"
              >
                <div 
                  class="h-1 rounded-full transition-all duration-500"
                  :class="[currentSlide === i ? 'w-10 bg-indigo-500' : 'w-4 bg-slate-300 dark:bg-slate-700']"
                ></div>
              </button>
            </div>
            <div class="flex gap-2 text-xs text-slate-200">
              <button @click="prevSlide" class="p-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
                <i class="fas fa-play rotate-180"></i></button>
              <button @click="nextSlide" class="p-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
                <i class="fas fa-play"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div class="relative mx-auto w-[100%] -left-[0%] h-4 bg-slate-700 rounded-b-xl shadow-xl"></div>
      <div class="relative mx-auto w-[25%] h-2 bg-slate-800/50 rounded-b-xl blur-sm"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentSlide = ref(0);
let autoSlideInterval;

const slides = [
  {
    category: 'Automation',
    badge: 'Smart Engine',
    icon: 'fas fa-wand-magic-sparkles',
    title: 'Agentic CRUD Architect',
    description: 'Auto-generate entire Laravel backend systems with specialized AI agents. Models, Migrations, and Controllers built in seconds.',
    glowColor: 'bg-indigo-500/40',
    visual: {
      template: `
        <div class="flex flex-col space-y-4">
          <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-4 translate-x-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white"><i class="fas fa-database"></i></div>
            <div>
              <div class="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div class="h-1.5 w-16 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
            </div>
          </div>
          <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-4 -translate-x-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><i class="fas fa-code-branch"></i></div>
            <div>
              <div class="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div class="h-1.5 w-16 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
            </div>
          </div>
        </div>`
    }
  },
  {
    category: 'Security',
    badge: 'Guardian Pro',
    icon: 'fas fa-shield-check',
    title: 'Zero-Trust Security Flow',
    description: 'Integrated DDoS protection and SQL injection shielding. Secure your App Builder projects with enterprise-grade middleware.',
    glowColor: 'bg-emerald-500/40',
    visual: {
      template: `
        <div class="flex flex-col items-center justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-emerald-500 blur-[60px] opacity-20 animate-pulse"></div>
            <i class="fas fa-shield-halved text-8xl text-emerald-500 relative drop-shadow-2xl"></i>
          </div>
          <p class="mt-6 font-mono text-[10px] text-emerald-500 tracking-[0.3em] uppercase">Security Layer Active</p>
        </div>`
    }
  },
  {
    category: 'Payments',
    badge: 'Fintech Core',
    icon: 'fas fa-credit-card',
    title: 'Seamless Global Payouts',
    description: 'One-click integration for SSLCommerz and Stripe. Manage subscriptions and invoices within a single unified bento.',
    glowColor: 'bg-amber-500/40',
    visual: {
      template: `
        <div class="relative group">
          <div class="bg-gradient-to-br from-slate-800 to-slate-950 p-7 rounded-[2rem] border border-white/10 shadow-2xl w-72 transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
            <div class="flex justify-between mb-10 text-white/20"><i class="fas fa-microchip text-xl"></i><i class="fab fa-cc-visa text-3xl"></i></div>
            <div class="text-white font-mono tracking-widest mb-4 text-lg">**** **** **** 4421</div>
            <div class="flex justify-between text-white/40 text-[10px] font-bold uppercase tracking-tighter"><span>Member Since 2024</span><span>10/29</span></div>
          </div>
        </div>`
    }
  }
];

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % slides.length; resetAutoSlide(); };
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length; resetAutoSlide(); };
const goToSlide = (i) => { currentSlide.value = i; resetAutoSlide(); };
const startAutoSlide = () => { autoSlideInterval = setInterval(nextSlide, 8000); };
const resetAutoSlide = () => { clearInterval(autoSlideInterval); startAutoSlide(); };

onMounted(startAutoSlide);
onUnmounted(() => clearInterval(autoSlideInterval));
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Hide scrollbar for the screen content */
::-webkit-scrollbar {
  display: none;
}
</style>