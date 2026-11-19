<!-- src/components/notifications/NotificationBell.vue -->
<template>
    <div class="relative">
        <!-- Bell Button -->
        <button @click="toggleDropdown"
            class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-600 relative">
            <i class="fas fa-bell text-amber-800 dark:text-amber-200"></i>
            <span v-if="displayUnreadCount > 0"
                class="notification-badge bg-red-500 text-white rounded-full -mt-1 animate-pulse">
                {{ displayUnreadCount > 9 ? '9+' : displayUnreadCount }}
            </span>
        </button>

        <!-- Notification Dropdown -->
        <div v-if="isOpen"
            class="notification-dropdown absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700">

            <!-- Enable Notifications Prompt -->
            <div v-if="showEnablePrompt"
                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <div class="flex items-start space-x-2">
                    <i class="fas fa-bell text-blue-500 mt-1"></i>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Get notified instantly
                        </p>
                        <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            Enable notifications to receive real-time updates
                        </p>
                        <button @click.stop="enableNotifications" :disabled="isEnabling"
                            class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="!isEnabling">Enable Notifications</span>
                            <span v-else>Enabling...</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Notification Header -->
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <h3 class="font-semibold text-gray-800 dark:text-white">
                            Notifications
                        </h3>
                        <span v-if="unreadCount > 0"
                            class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                            {{ unreadCount }} new
                        </span>
                    </div>

                    <div class="flex items-center space-x-2">
                        <button v-if="unreadCount > 0" @click.stop="handleMarkAllRead"
                            class="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center space-x-1"
                            :disabled="loading">
                            <i class="fas fa-check-double text-xs"></i>
                            <span class="hidden sm:inline">Mark all as read</span>
                        </button>

                        <!-- <button @click.stop="openSettings"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Notification Settings">
                            <i class="fas fa-cog text-sm"></i>
                        </button> -->

                        <button @click.stop="refresh"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            :class="{ 'animate-spin': loading }" title="Refresh">
                            <i class="fas fa-sync-alt text-sm"></i>
                        </button>

                        <button @click.stop="closeDropdown"
                            class="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Close">
                            <i class="fas fa-times text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Filter tabs -->
                <div class="flex items-center space-x-2 mt-3">
                    <button @click.stop="setFilter('all')"
                        class="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                        :class="filter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                        All
                    </button>
                    <button @click.stop="setFilter('unread')"
                        class="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                        :class="filter === 'unread'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                        Unread
                        <span v-if="unreadCount > 0"
                            class="ml-1 px-1.5 py-0.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded-full text-[10px]">
                            {{ unreadCount }}
                        </span>
                    </button>
                    <button @click.stop="setFilter('read')"
                        class="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                        :class="filter === 'read'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                        Read
                    </button>
                </div>
            </div>

            <!-- Notification List -->
            <div class="max-h-96 overflow-y-auto">
                <!-- Loading State -->
                <div v-if="loading && !displayNotifications.length" class="px-4 py-8 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading notifications...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="!displayNotifications.length" class="px-4 py-8 text-center">
                    <div
                        class="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <i class="fas fa-bell-slack text-gray-400 text-2xl"></i>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">No notifications yet</p>
                    <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">We'll notify you when something arrives</p>
                </div>

                <!-- Notification Items -->
                <template v-else>
                    <div v-for="notification in displayNotifications" :key="notification.id"
                        class="group relative border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                        :class="{ 'bg-blue-200/30 dark:bg-blue-900/10 border-b border-gray-300': !notification.is_read }">

                        <div class="px-4 py-3 cursor-pointer" @click="handleNotificationClick(notification)">
                            <div class="flex items-start space-x-3">
                                <!-- Icon -->
                                <div :class="[
                                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                                    notification.type_class || 'notification-info'
                                ]">
                                    <i :class="[notification.icon || 'fas fa-bell', 'text-sm']"></i>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between">
                                        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ notification.title }}
                                        </h4>
                                        <span v-if="!notification.is_read" class="ml-2 flex-shrink-0">
                                            <span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                        </span>
                                    </div>

                                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                        {{ notification.message }}
                                    </p>

                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            <i class="far fa-clock mr-1"></i>
                                            {{ notification.time || 'Just now' }}
                                        </span>

                                        <!-- Actions -->
                                        <div
                                            class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button v-if="!notification.is_read"
                                                @click.stop="handleMarkRead(notification.id)"
                                                class="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Mark as read">
                                                <i class="fas fa-check text-xs"></i>
                                            </button>
                                            <button @click.stop="handleDelete(notification.id)"
                                                class="p-1 hidden text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Delete">
                                                <i class="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Load More -->
                    <div v-if="pagination.has_more"
                        class="px-4 py-3 text-center border-t border-gray-100 dark:border-gray-700">
                        <button @click.stop="loadMore" :disabled="loading"
                            class="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="loading">
                                <i class="fas fa-spinner fa-spin mr-1"></i>
                                Loading...
                            </span>
                            <span v-else>
                                Load more notifications
                            </span>
                        </button>
                    </div>
                </template>
            </div>

            <!-- Notification Footer -->
            <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <button @click.stop="viewAll"
                        class="hidden text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                        <span>View all notifications</span>
                        <i class="fas fa-arrow-right text-xs"></i>
                    </button>

                    <div v-if="pagination.total > 0" class="text-xs text-gray-500 dark:text-gray-400">
                        Showing {{ displayNotifications.length }} of {{ pagination.total }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import firebaseService from '@/services/firebase'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Use storeToRefs to maintain reactivity
const { unreadCount, notifications, loading, pagination } = storeToRefs(notificationStore)

// Force reactive update counter
const updateTrigger = ref(0)

const isOpen = ref(false)
const isEnabling = ref(false)
const filter = ref('all')
const previousUnreadCount = ref(0)

// Computed property that depends on updateTrigger to force re-computation
const displayUnreadCount = computed(() => {
    // This forces re-computation when updateTrigger changes
    updateTrigger.value
    return unreadCount.value
})

const displayNotifications = computed(() => {
    // This forces re-computation when updateTrigger changes
    updateTrigger.value
    const list = notifications.value || []
    if (filter.value === 'unread') return list.filter(n => !n.is_read)
    if (filter.value === 'read') return list.filter(n => n.is_read)
    return list
})

const showEnablePrompt = computed(() => {
    return firebaseService.isSupported() &&
        Notification.permission !== 'granted' &&
        authStore.notificationSettings?.enabled !== false
})

// Watch for changes in unread count
watch(unreadCount, (newCount, oldCount) => {
    //   console.log(`🔔 Unread count changed from ${oldCount} to ${newCount}`)
    updateTrigger.value++ // Force update

    if (newCount > oldCount) {
        // console.log('🎉 New notification received! Count increased by', newCount - oldCount)
        playNotificationSound()

        // Show toast for the latest notification
        nextTick(() => {
            const latestNotification = notifications.value[0]
            if (latestNotification) {
                showToast(latestNotification.title, latestNotification.message)
            }
        })
    }
}, { immediate: true })

// Watch for notifications array changes
watch(notifications, (newList, oldList) => {
    //   console.log('📋 Notifications list updated:', {
    //     oldLength: oldList?.length,
    //     newLength: newList?.length,
    //     unreadCount: unreadCount.value
    //   })
    updateTrigger.value++ // Force update
}, { deep: true })

// Set up a more reliable polling mechanism for testing
// This ensures the count updates even if reactivity fails
const startPolling = () => {
    let lastCount = unreadCount.value

    const interval = setInterval(() => {
        const currentCount = notificationStore.unreadCount // Access directly from store

        if (currentCount !== lastCount) {
            //   console.log('📊 Polling detected count change:', lastCount, '->', currentCount)
            lastCount = currentCount
            updateTrigger.value++ // Force update

            // Also try to manually update the ref
            if (unreadCount.value !== currentCount) {
                // console.log('⚠️ Manually syncing unreadCount')
                unreadCount.value = currentCount
            }
        }
    }, 1000)

    return interval
}

// Also set up a MutationObserver as a fallback (optional)
const setupFallbackObserver = () => {
    // This is a heavy-handed approach, but ensures updates
    const originalAddNotification = notificationStore.addNotification

    notificationStore.addNotification = function (notification) {
        // console.log('🔄 Intercepted addNotification')
        originalAddNotification.call(this, notification)

        // Force multiple updates
        nextTick(() => {
            updateTrigger.value++

            // Also update the ref directly
            if (unreadCount.value !== this.unreadCount) {
                unreadCount.value = this.unreadCount
            }

            nextTick(() => {
                updateTrigger.value++
            })
        })
    }
}

// Methods
const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        previousUnreadCount.value = unreadCount.value
        notificationStore.refresh()
    }
}

const closeDropdown = () => {
    isOpen.value = false
}

const setFilter = (value) => {
    filter.value = value
}

const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
        notificationStore.markAsRead(notification.id)
    }

    if (notification.action_url) {
        isOpen.value = false
        router.push(notification.action_url)
    }
}

const handleMarkRead = async (id) => {
    await notificationStore.markAsRead(id)
    updateTrigger.value++ // Force update
}

const handleMarkAllRead = async () => {
    await notificationStore.markAllAsRead()
    updateTrigger.value++ // Force update
}

const handleDelete = (id) => {
    //   console.log('Delete notification:', id)
}

const refresh = async () => {
    await notificationStore.refresh()
    updateTrigger.value++ // Force update
}

const loadMore = async () => {
    await notificationStore.fetchNextPage()
    updateTrigger.value++ // Force update
}

const viewAll = () => {
    isOpen.value = false
    router.push('/notifications')
}

const openSettings = () => {
    isOpen.value = false
    router.push('/settings/notifications')
}

const enableNotifications = async () => {
    isEnabling.value = true
    try {
        const success = await firebaseService.enableNotifications()
        if (success) {
            await authStore.updateNotificationSettings({ enabled: true })
            await notificationStore.refresh()
        }
    } catch (error) {
        console.error('Failed to enable notifications:', error)
    } finally {
        isEnabling.value = false
    }
}

// Helper functions
const playNotificationSound = () => {
    // Optional: Play a sound
    // const audio = new Audio('/notification-sound.mp3')
    // audio.play().catch(e => console.log('Audio play failed:', e))
}

const showToast = (title, message) => {
    //   console.log('Toast:', title, message)
    // If you have vue-toastification:
    // const toast = useToast()
    // toast.info(`${title}: ${message}`)
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    if (isOpen.value && !event.target.closest('.relative')) {
        isOpen.value = false
    }
}

// Lifecycle
onMounted(() => {
    //   console.log('🔔 NotificationBell mounted')
    document.addEventListener('click', handleClickOutside)

    // Initialize realtime notifications
    notificationStore.initRealtimeNotifications()

    // Force an initial fetch
    notificationStore.fetchUnreadCount()

    // Start polling for changes (remove in production)
    const pollingInterval = startPolling()

    // Setup fallback observer (optional)
    // setupFallbackObserver()

    // Clean up on unmount
    onUnmounted(() => {
        clearInterval(pollingInterval)
    })
})

// In onMounted
window.addEventListener('new-notification', (event) => {
    //   console.log('🎯 Custom event received:', event.detail);
    updateTrigger.value++;
    notificationStore.fetchUnreadCount(); // Force refresh
    notificationStore.refresh(); // Also refresh the list
});

// And add a watcher for the global variable
watch(
    () => window.__lastNotificationTime,
    () => {
        updateTrigger.value++;
    }
);

onUnmounted(() => {
    //   console.log('🔔 NotificationBell unmounted')
    document.removeEventListener('click', handleClickOutside)
})

// Expose for debugging
defineExpose({
    unreadCount,
    displayUnreadCount,
    updateTrigger
})
</script>

<style scoped>
.notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
}

.notification-dropdown {
    width: 380px;
    max-height: 500px;
    overflow-y: auto;
}

@media (max-width: 640px) {
    .notification-dropdown {
        width: 300px;
        right: -70px;
    }
}

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

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>