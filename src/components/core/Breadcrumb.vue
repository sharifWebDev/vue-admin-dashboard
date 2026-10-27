<template>
  <nav class="text-xs sm:text-xs md:text-sm lg:text-sm text-gray-500 my-auto" aria-label="Breadcrumb">
    <ol class="flex items-center flex-wrap gap-1 md:gap-2">
      <!-- Fixed Home Link -->
      <li class="flex items-center">
        <router-link to="/dashboard"
          class="flex font-normal items-center text-gray-500 dark:text-gray-100 hover:text-blue-600 transition-colors">
          <component :is="Home" class="mr-1 h-3 w-3" />
          Home
        </router-link>
      </li>

      <!-- Dynamic Breadcrumbs -->
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <component :is="ChevronRight" class="mx-1 h-3 w-3 text-gray-400" />

        <!-- Agar link hai aur last item nahi hai, to clickable link dikhao -->
        <router-link v-if="crumb.link && index !== breadcrumbs.length - 1" :to="crumb.link"
          class="text-gray-600 dark:text-gray-100 hover:text-blue-600 transition-colors">
          {{ crumb.text }}
        </router-link>

        <!-- Current Page (Last item) non-clickable hota hai -->
        <span v-else class="text-gray-500 dark:text-gray-400 font-bold truncate max-w-[150px] sm:max-w-none">
          {{ crumb.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ChevronRight } from 'lucide-vue-next';

const route = useRoute()

const breadcrumbs = computed(() => {
  // route.matched un saare routes ko return karta hai jo current path se match hote hain (parent to child)
  const matchedRoutes = route.matched.filter(r => r.meta && (r.meta.breadcrumb || r.meta.title))

  return matchedRoutes.map(r => ({
    text: r.meta.breadcrumb || r.meta.title,
    link: r.path || '/'
  }))
})
</script>