<template>
  <header 
    class="fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent"
    :class="[
      isScrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm py-2' 
        : 'bg-transparent py-4'
    ]"
  >
     <div class="container mx-auto max-w-[90rem] px-6 relative z-10 mx-auto flex justify-between items-center">

      <RouterLink to="/" class="group flex items-center space-x-3 outline-none">
        <div class="relative w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 bg-indigo-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
          <div class="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center">
            <i class="fas fa-layer-group text-white dark:text-slate-900 text-lg"></i>
          </div>
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            App<span class="text-indigo-600">Builder</span>
          </span>
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">Engineered Pro</span>
        </div>
      </RouterLink>

      <nav class="hidden lg:flex items-center space-x-1">
        <RouterLink 
          v-for="item in menu" 
          :key="item.title" 
          :to="item.path" 
          class="nav-link px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
          @click="handleHashClick(item.path)"
        >
          {{ item.title }}
        </RouterLink>
      </nav>

      <div class="hidden lg:flex items-center space-x-4">
        

        <div class="relative"  v-if="authStore.checkAuth()">
          <button 
            @click="toggleNotificationDropdown"
            class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all"
          >
            <i class="fas fa-bell"></i>
            <span v-if="unreadNotificationsCount" class="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <Transition name="dropdown">
            <div v-if="notificationDropdownOpen" class="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[60]">
              <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 class="font-bold text-slate-900 dark:text-white">Activity</h4>
                <button @click="markAllAsRead" class="text-xs text-indigo-600 font-bold hover:underline">Clear All</button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div v-for="n in notifications" :key="n.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3">
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', n.typeClass]">
                    <i :class="n.icon"></i>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ n.title }}</p>
                    <p class="text-xs text-slate-500">{{ n.message }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div v-if="authStore.checkAuth()" class="relative">
          <button @click="toggleUserDropdown" class="flex items-center space-x-2 p-1 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ user?.name.split(' ')[0] }}</span>
            <div class="w-8 h-8 rounded-lg overflow-hidden bg-indigo-100 ring-2 ring-indigo-50 dark:ring-slate-700">
              <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xs">{{ user?.initials }}</div>
            </div>
          </button>
          
          <Transition name="dropdown">
            <div v-if="userDropdownOpen" class="absolute right-0 mt-4 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-[60]">
               <RouterLink to="/profile" class="flex items-center space-x-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                  <i class="fas fa-user-circle opacity-50"></i>
                  <span class="text-sm font-semibold">Settings</span>
               </RouterLink>
               <button @click="logout" class="w-full flex items-center space-x-2 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                  <i class="fas fa-sign-out-alt opacity-50"></i>
                  <span class="text-sm font-semibold">Sign Out</span>
               </button>
            </div>
          </Transition>
        </div>

        <button 
          v-else 
          @click="openLoginModal"
          class="text-sm font-bold text-slate-700 dark:text-white hover:text-indigo-600 px-4 transition-colors"
        >
          Login
        </button>

        <RouterLink 
          to="/dashboard"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          Build Project
        </RouterLink>
        <button 
          @click="toggleDark"
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-colors"
        >
          <i class="fas" :class="isDark ? 'fa-sun text-amber-400' : 'fa-moon'"></i>
        </button>
      </div>

      <button @click="toggleMobileMenu" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <i class="fas" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars-staggered'"></i>
      </button>
    </div>

    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="fixed inset-0 top-[65px] bg-white dark:bg-slate-900 z-40 p-6 lg:hidden">
        <div class="flex flex-col space-y-4">
          <RouterLink 
            v-for="item in menu" 
            :key="item.title" 
            :to="item.path"
            class="text-2xl font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4"
            @click="mobileMenuOpen = false"
          >
            {{ item.title }}
          </RouterLink>
          <div class="pt-8 space-y-4">
            <button @click="toggleDark" class="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center space-x-2">
              <i class="fas" :class="isDark ? 'fa-sun' : 'fa-moon'"></i>
              <span>Switch Theme</span>
            </button>
            <RouterLink to="/dashboard" class="block w-full py-5 rounded-2xl bg-indigo-600 text-white text-center font-black shadow-xl shadow-indigo-200">
              GET STARTED FREE
            </RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </header> 
  <SimpleModal :show="showLoginModal" maxWidth="xl" title="" @close="closeViewModal">
      <div class="m-0 p-0">
        <AuthJoinCard class="m-0 p-0" />
      </div> 
    </SimpleModal>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' 
import SimpleModal from '@/components/common/SimpleModal.vue'
import AuthJoinCard from '@/components/Website/AuthJoinCard.vue'
 
const route = useRoute()
const authStore = useAuthStore()
const showLoginModal = ref(false)

const userDropdownOpen = ref(false)
const mobileMenuOpen = ref(false)
const notificationDropdownOpen = ref(false)


const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})


const openLoginModal = () => {
  showLoginModal.value = true 
}
const closeViewModal = () => {
  showLoginModal.value = false
} 

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
  notificationDropdownOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Close notification dropdown when opening mobile menu
  if (mobileMenuOpen.value) {
    notificationDropdownOpen.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const toggleNotificationDropdown = () => {
  notificationDropdownOpen.value = !notificationDropdownOpen.value
  userDropdownOpen.value = false
  // Close mobile menu when opening notifications
  if (notificationDropdownOpen.value && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

// Watch for route changes to close mobile menu
watch(() => route.path, () => {
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
})

const user = computed(() => authStore.user)
const isDark = ref(document.documentElement.classList.contains('dark'))

const menu = [
  { title: 'Home', path: { path: '/', hash: '#home'}}
]

/* ---------------- Notifications ---------------- */
const notifications = ref([
  {
    id: 1,
    title: 'Transaction Completed',
    message: 'Your transaction has been successfully completed.',
    time: '2 hours ago',
    unread: true,
    icon: 'fas fa-check-circle text-sm',
    typeClass: 'notification-success'
  },
  {
    id: 2,
    title: 'Storage limit warning',
    message: 'You have used 85% of storage.',
    time: '5 hours ago',
    unread: true,
    icon: 'fas fa-exclamation-triangle text-sm',
    typeClass: 'notification-warning'
  }
])

/**
 * Fix: Same route hash click scroll issue
 */
const handleHashClick = async (path) => {
  if (typeof path === 'object' && path.hash) {
    if (route.path === path.path) {
      await nextTick()
      const el = document.querySelector(path.hash)
      if (el) {
        el.scrollIntoView()
      }
    }
  }
}

const toggleDark = () => {
  isDark.value = document.documentElement.classList.toggle('dark')
}

// notification helpers
const unreadNotificationsCount = computed(() => notifications.value.filter(n => n.unread).length)

const markAllAsRead = () => {
  notifications.value.forEach(n => n.unread = false)
}

const markAsRead = (notification) => {
  notification.unread = false
}

const removeNotification = (notification) => {
  notifications.value = notifications.value.filter(n => n.id !== notification.id)
}

const openNotificationSettings = () => {
  console.log('open notification settings')
}

const logout = () => {
  // Add your logout logic here
  mobileMenuOpen.value = false
  userDropdownOpen.value = false
  authStore.logout()
}

const handleDocumentClick = (e) => {
  // Close dropdowns when clicking outside
  if (!e.target.closest('.relative')) {
    userDropdownOpen.value = false
  }
  
  // Close mobile menu if clicking outside header (optional - we already have backdrop)
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.body.style.overflow = ''
})
</script>
 
<style scoped>
/* Luxury Animations */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  transform: translateX(100%);
}

.notification-success {
  @apply bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400;
}
.notification-warning {
  @apply bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400;
}

/* Hide scrollbars but keep functionality */
.max-h-80::-webkit-scrollbar {
  display: none;
}
</style>