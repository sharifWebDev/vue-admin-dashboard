<template>
  <section
    id="home"
    class="min-h-screen py-16 relative overflow-hidden flex items-center transition-colors duration-700
           bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white"
  >
    <!-- Ambient Background -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div
        class="absolute -top-24 -left-24 w-96 h-96 rounded-full
               bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] animate-pulse"
      ></div>
      <div
        class="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full
               bg-indigo-600/5 dark:bg-blue-600/10 blur-[120px]"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 40px 40px;"
      ></div>
    </div>

    <div class="container mx-auto max-w-[90rem] px-6 relative z-10">
      <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
        <!-- Left Column -->
        <div class="w-full text-center order-2 lg:order-1">
          <div class="space-y-8">
            <!-- Status / Version Badge -->
            <div
              v-if="config.badgeLeft || config.badgeRight"
              class="inline-flex items-center gap-3 px-4 py-2 rounded-2xl
                     bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10
                     shadow-sm dark:shadow-none backdrop-blur-xl group cursor-default"
            >
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-600 dark:bg-cyan-400"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-cyan-100/80">
                <template v-if="config.badgeLeft">{{ config.badgeLeft }}</template>
                <span v-if="config.badgeLeft && config.badgeRight" class="mx-2 opacity-30">|</span>
                <span v-if="config.badgeRight" class="text-slate-900 dark:text-white transition-colors">
                  {{ config.badgeRight }}
                </span>
              </span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-4xl md:text-4xl xl:text-5xl font-black leading-[0.95] tracking-tighter">
              {{ config.titleLine1 }} <br />
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-300 dark:via-blue-200 dark:to-white"
              >
                {{ config.titleHighlight }}
              </span>
            </h1>

            <!-- Subtitle -->
            <p
              class="text-lg md:text-xl font-medium leading-relaxed
                     text-slate-500 dark:text-slate-400 opacity-90 dark:opacity-60 max-w-xl mx-auto text-center"
            >
              {{ config.description }}
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a
                :href="primaryCtaHref"
                class="group px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl
                       bg-slate-900 dark:bg-white text-white dark:text-slate-900
                       hover:scale-105 active:scale-95 shadow-indigo-500/20 dark:shadow-cyan-500/20"
              >
                <span>{{ primaryCtaLabel }}</span>
                <i :class="[config.primaryIcon, 'group-hover:rotate-12 transition-transform text-cyan-400 dark:text-cyan-600']"></i>
              </a>

              <a
                v-if="config.secondaryCtaLabel"
                :href="config.secondaryCtaHref"
                class="px-10 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3
                       bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                       text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 backdrop-blur-xl"
              >
                <span>{{ config.secondaryCtaLabel }}</span>
                <i :class="[config.secondaryIcon, 'opacity-40']"></i>
              </a>
            </div>

            <!-- Highlights / Tech Stack Row -->
            <div
              v-if="config.highlights?.length"
              class="pt-8 flex flex-wrap items-center justify-center gap-8
                     opacity-40 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
            >
              <div
                v-for="(item, idx) in config.highlights"
                :key="idx"
                class="flex items-center gap-2 group"
              >
                <i :class="[item.icon, item.colorClass, 'text-3xl text-slate-700 dark:text-white transition-colors']"></i>
                <span class="text-[10px] font-black uppercase tracking-widest">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  heroData: {
    type: Object,
    default: () => ({})
  }
});

const authStore = useAuthStore();
const user = ref(null);

const defaultConfig = {
  badgeLeft: 'Welcome',
  badgeRight: 'Digital Platform',
  titleLine1: 'Welcome to',
  titleHighlight: 'Your Digital Workspace',
  description:
    'Welcome aboard. Manage your workflows, collaborate seamlessly, and scale your ideas effortlessly from one unified platform.',
  primaryCtaLabel: 'Get Started',
  primaryCtaHref: '#pricing',
  authenticatedCtaLabel: 'Welcome Back • Dashboard',
  authenticatedCtaHref: '/dashboard',
  primaryIcon: 'fas fa-bolt',
  secondaryCtaLabel: 'Explore More',
  secondaryCtaHref: '#about',
  secondaryIcon: 'fas fa-layer-group',
  highlights: [
    { icon: 'fas fa-shield-halved', colorClass: 'group-hover:text-cyan-500', label: 'Secure Access' },
    { icon: 'fas fa-globe', colorClass: 'group-hover:text-indigo-500', label: 'Global Ready' },
    { icon: 'fas fa-gauge-high', colorClass: 'group-hover:text-emerald-500', label: 'Fast & Reliable' }
  ],
  slides: []
};

const config = computed(() => ({
  ...defaultConfig,
  ...props.heroData,
  highlights: props.heroData?.highlights?.length ? props.heroData.highlights : defaultConfig.highlights
}));

const isAuthenticated = computed(() => Boolean(user.value));

const primaryCtaLabel = computed(() =>
  isAuthenticated.value ? config.value.authenticatedCtaLabel : config.value.primaryCtaLabel
);

const primaryCtaHref = computed(() =>
  isAuthenticated.value ? config.value.authenticatedCtaHref : config.value.primaryCtaHref
);

onMounted(() => {
  if (authStore.checkAuth()) {
    authStore.getEmail?.();
    user.value = authStore.user || true;
  } else {
    user.value = null;
  }
});
</script>

<style scoped>
.dark #home {
  background-color: #030712;
}

#home:not(.dark) {
  background-image:
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.03) 0px, transparent 50%);
}

#home {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>