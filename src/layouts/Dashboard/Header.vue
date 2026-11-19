<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20">
    <div class="flex items-center justify-between p-2.5 md:px-3">
      <!-- Left side: Mobile Menu Button and Breadcrumb -->
      <div class="flex items-center space-x-3">
        <!-- Mobile Menu Button -->
        <button @click="$emit('toggle-mobile-sidebar')"
          class="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <AlignLeft class="w-5 h-5 text-gray-500" />
        </button>

        <!-- Desktop Sidebar Toggle Button -->
        <button @click="$emit('toggle-sidebar')"
          class="hidden md:block p-3 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <AlignLeft class="w-5 h-5 text-gray-500" />
        </button>

        <!-- <a class="btn bg-gray-50 dark:bg-gray-800 mx-4 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          href="/" target="_blank" title="Browse Website">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M56,48a8,8,0,1,0,8,8A8,8,0,0,0,56,48Zm-.829,14.808a6.858,6.858,0,0,1-4.39-11.256,7.6,7.6,0,0,1,.077.93,2.966,2.966,0,0,0,.382,2.26,3.729,3.729,0,0,1,.362,1.08c.1.341.5.519.77.729.552.423,1.081.916,1.666,1.288.387.246.628.368.515.84a2.98,2.98,0,0,1-.313.951,1.927,1.927,0,0,0,.321.861c.288.288.575.553.889.813C55.938,61.706,55.4,62.229,55.171,62.808Zm5.678-1.959a6.808,6.808,0,0,1-3.56,1.888,2.844,2.844,0,0,1,.842-1.129,2.865,2.865,0,0,0,.757-.937,6.506,6.506,0,0,1,.522-.893c.272-.419-.67-1.051-.975-1.184a10.052,10.052,0,0,1-1.814-1.13c-.435-.306-1.318.16-1.808-.054A9.462,9.462,0,0,1,53,56.166c-.6-.454-.574-.984-.574-1.654.472.017,1.144-.131,1.458.249.1.12.439.655.667.465.186-.155-.138-.779-.2-.925-.193-.451.439-.626.762-.932.422-.4,1.326-1.024,1.254-1.309s-.9-1.1-1.394-.969c-.073.019-.719.7-.844.8q0-.332.01-.663c0-.14-.26-.283-.248-.373.031-.227.664-.64.821-.821-.11-.069-.487-.392-.6-.345-.276.115-.588.194-.863.309a1.756,1.756,0,0,0-.025-.274,6.792,6.792,0,0,1,1.743-.506l.542.218.382.454.382.394.334.108.53-.5L57,49.536v-.321a6.782,6.782,0,0,1,2.9,1.146c-.155.014-.326.037-.518.061a1.723,1.723,0,0,0-.268-.1c.251.54.513,1.073.779,1.606.284.569.915,1.18,1.026,1.781.131.708.04,1.352.111,2.185a3.732,3.732,0,0,0,.9,1.714,1.812,1.812,0,0,0,.707.086A6.815,6.815,0,0,1,60.849,60.849Z"
              transform="translate(-48 -48)" fill="#717580"></path>
          </svg>
        </a> -->
      </div>

      <!-- Right side: User Menu -->
      <div class="flex items-center space-x-4">
        <button @click="toggleDarkMode"
          class="p-3 mr-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <component :is="isDark ? Sun : MoonStar"
            :class="['w-5 h-5 mx-auto', isDark ? 'text-yellow-500' : 'text-gray-600']" />
        </button>

        <NotificationBell />
        <!-- Search Button (Mobile) -->
        <button class="hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-4">
          <i class="fas fa-search"></i>
        </button>

        <!-- User Avatar -->
        <div class="relative"> 
          <!-- User Dropdown -->
          <div class="relative">
            <button type="button" @click="toggleUserDropdown" class="group mr-3 ml-3 flex items-center gap-2 rounded-xl
         border border-transparent
         bg-gray-100 px-2 py-1
         transition-all duration-200
         hover:border-gray-200
         hover:bg-gray-50
         hover:shadow-sm
         focus:outline-none
         focus:ring-2 focus:ring-blue-500/20
         dark:bg-gray-800/80
         dark:hover:border-gray-700
         dark:hover:bg-gray-800">
              <!-- Avatar -->
              <div class="relative shrink-0">
                <div class="h-10 w-10 overflow-hidden rounded-full
             bg-gray-400
             p-[2px]
             shadow-sm
             transition-transform duration-200
             group-hover:scale-105">
                  <div class="flex h-full w-full items-center justify-center
               overflow-hidden rounded-full
               bg-gray-100 dark:bg-gray-900">
                    <!-- Avatar Image -->
                    <img v-if="props.user.avatar" :src="props.user.avatar" :alt="`${props.user?.name || 'User'} Avatar`"
                      class="h-full w-full object-cover" />

                    <!-- Fallback Initials -->
                    <span v-else class="text-sm font-bold
                 text-red-600/50
                 dark:text-red-400/50">
                      {{ props.user.initials || 'JD' }}
                    </span>
                  </div>
                </div>

                <!-- Online Indicator -->
                <span class="absolute right-0 bottom-0
             h-2.5 w-2.5 rounded-full
             border-2 border-white
             bg-emerald-500
             shadow-sm
             dark:border-gray-800"></span>
              </div>

              <!-- User Info -->
              <div class="hidden min-w-0 text-left md:block">
                <p class="max-w-[140px] truncate text-sm font-semibold
             text-gray-600
             transition-colors
             group-hover:text-gray-600
             dark:text-gray-100
             dark:group-hover:text-red-400">
                  {{ props.user?.name || '-' }}
                </p>

                <p class="mt-0.5 text-[11px]
             text-gray-400 dark:text-gray-500">
                  {{ props.user?.role || '-' }}
                </p>
              </div>

              <!-- Chevron -->
              <div class="ml-1 flex h-7 w-7 items-center justify-center
           rounded-lg
           text-gray-400
           transition-all duration-200
           group-hover:bg-gray-100
           group-hover:text-gray-600
           dark:group-hover:bg-gray-700
           dark:group-hover:text-gray-300">
                <component :is="ChevronDown" class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': userDropdownOpen }" />
              </div>
            </button>

            <!-- User Dropdown -->
            <div v-if="userDropdownOpen" class="absolute right-5 mt-3 w-72 z-50
         overflow-hidden rounded-2xl
         border border-gray-200/80 dark:border-gray-700/80
         bg-white/95 dark:bg-gray-800/95
         shadow-2xl shadow-gray-900/10 dark:shadow-black/30
         backdrop-blur-xl
         ring-1 ring-black/5 dark:ring-white/5">
              <!-- Profile Header -->
              <div class="relative overflow-hidden
           border-b border-gray-100 dark:border-gray-700
           bg-gradient-to-br from-gray-50 via-white to-blue-50/70
           dark:from-gray-800 dark:via-gray-800 dark:to-blue-950/30
           px-4 pt-5 pb-4">
                <!-- Decorative background -->
                <div class="absolute -right-8 -top-10 h-28 w-28 rounded-full
             bg-blue-500/10 blur-2xl"></div>

                <div class="absolute -left-10 bottom-0 h-20 w-20 rounded-full
             bg-purple-500/10 blur-2xl"></div>

                <div class="relative flex items-center gap-3">
                  <!-- Avatar -->
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center
               rounded-xl
               bg-gradient-to-br from-blue-500 to-indigo-600
               text-sm font-bold text-white
               shadow-lg shadow-blue-500/20
               ring-4 ring-white/80 dark:ring-gray-800">
                    {{
                      (props.user.name || '-')
                        .charAt(0)
                        .toUpperCase()
                    }}
                  </div>

                  <!-- User -->
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold
                 text-gray-900 dark:text-white">
                      {{ props.user.name || '-' }}
                    </p>

                    <p class="mt-0.5 truncate text-xs
                 text-gray-500 dark:text-gray-400">
                      {{ props.user.email || '-' }}
                    </p>
                  </div>

                  <!-- Online indicator -->
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full
               bg-emerald-500
               ring-4 ring-emerald-500/10" title="Online"></span>
                </div>

                <!-- Role -->
                <div class="relative mt-4">
                  <span class="inline-flex items-center gap-1.5
               rounded-full
               border border-blue-100 dark:border-blue-900/50
               bg-blue-50 dark:bg-blue-900/20
               px-2.5 py-1
               text-[11px] font-semibold
               text-blue-700 dark:text-blue-300">
                    <component :is="User" class="h-3.5 w-3.5" />

                    {{ props.user.role || 'User' }}
                  </span>
                </div>
              </div>

              <!-- Menu -->
              <div class="p-2">

                <!-- Profile -->
                <RouterLink :to="`/my-account?name=${props?.user?.name || '-'}`" class="group flex items-center gap-3
             rounded-xl px-3 py-2.5
             text-sm font-medium
             text-gray-700 dark:text-gray-200
             transition-all duration-200
             hover:bg-gray-100 dark:hover:bg-gray-700/70
             hover:text-gray-900 dark:hover:text-white">
                  <span class="flex h-9 w-9 items-center justify-center
               rounded-lg
               bg-gray-100 dark:bg-gray-700
               text-gray-500 dark:text-gray-400
               transition-colors
               group-hover:bg-blue-100 group-hover:text-blue-600
               dark:group-hover:bg-blue-900/30
               dark:group-hover:text-blue-400">
                    <component :is="User" class="h-4 w-4" />
                  </span>

                  <span class="flex-1">
                    <span class="block">My Profile</span>
                    <span class="mt-0.5 block text-[11px]
                 font-normal text-gray-400 dark:text-gray-500">
                      View profile
                    </span>
                  </span>

                  <span class="text-gray-300 transition-transform
               group-hover:translate-x-0.5
               group-hover:text-gray-500
               dark:text-gray-600">
                    →
                  </span>
                </RouterLink>

                <!-- Divider -->
                <div class="my-2 border-t
             border-gray-100 dark:border-gray-700"></div>

                <!-- Logout -->
                <button type="button" @click="logout" class="group flex w-full items-center gap-3
             rounded-xl px-3 py-2.5
             text-left text-sm font-medium
             text-red-600 dark:text-red-400
             transition-all duration-200
             hover:bg-red-50
             dark:hover:bg-red-900/20">
                  <span class="flex h-9 w-9 items-center justify-center
               rounded-lg
               bg-red-50 dark:bg-red-900/20
               text-red-500 dark:text-red-400
               transition-colors
               group-hover:bg-red-100
               dark:group-hover:bg-red-900/30">
                    <component :is="LogOut" class="h-4 w-4" />
                  </span>

                  <span class="flex-1">
                    <span class="block">Sign out</span>
                    <span class="mt-0.5 block text-[11px]
                 font-normal text-red-400/80
                 dark:text-red-400/60">
                      Sign out of your account
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useDarkModeStore } from '@/stores/darkMode'
import {
  Menu,
  Sun,
  MoonStar,
  ChevronDown,
  User,
  Mail,
  LogOut,
  Search,
  AlignLeft
} from 'lucide-vue-next';

import NotificationBell from '@/components/notifications/NotificationBell.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      initials: 'JD',
      id: 1,
      name: '-',
      email: 'john.doe@example.com',
      role: 'User'
    })
  }
})

const emit = defineEmits(['toggle-sidebar', 'toggle-mobile-sidebar', 'logout'])

const sidebarStore = useSidebarStore()
const darkModeStore = useDarkModeStore()

const windowWidth = ref(window.innerWidth)
const notificationDropdownOpen = ref(false)
const userDropdownOpen = ref(false)

// ✅ Just read from store
const isDark = computed(() => darkModeStore.isDark)

// ✅ Toggle via store
const toggleDarkMode = () => {
  darkModeStore.toggle()
}

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

const unreadNotificationsCount = computed(
  () => notifications.value.filter(n => n.unread).length
)

const toggleNotificationDropdown = () => {
  notificationDropdownOpen.value = !notificationDropdownOpen.value
  userDropdownOpen.value = false
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
  notificationDropdownOpen.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.unread = false)
}

const markAsRead = (notification) => {
  notification.unread = false
}

const removeNotification = (notification) => {
  notifications.value = notifications.value.filter(n => n.id !== notification.id)
}

const logout = () => {
  emit('logout')
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      notificationDropdownOpen.value = false
      userDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>


<style scoped>
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  width: 380px;
  max-height: 500px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .notification-dropdown {
    width: 300px;
    right: -50px;
  }
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.05);
}

.dark .notification-item.unread {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Notification type colors */
.notification-success {
  background-color: #d1fae5;
  color: #065f46;
}

.dark .notification-success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.notification-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.dark .notification-warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.notification-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.dark .notification-error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.notification-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.dark .notification-info {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* Scrollbar styling */
.notification-dropdown::-webkit-scrollbar {
  width: 6px;
}

.notification-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dark .notification-dropdown::-webkit-scrollbar-track {
  background: #374151;
}

.notification-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dark .notification-dropdown::-webkit-scrollbar-thumb {
  background: #6b7280;
}
</style>