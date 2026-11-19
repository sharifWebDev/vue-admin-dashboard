import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import firebaseService from "@/services/firebase";
import { useAuthStore } from "@/stores/authStore";

export const useNotificationStore = defineStore("notification", () => {
  const authStore = useAuthStore();

  // ==================== STATE ====================
  const notifications = ref([]);
  const unreadCount = ref(0);
  const pagination = ref({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    has_more: false,
  });
  const isLoading = ref(false);
  const error = ref(null);
  const loading = ref(false); // For backward compatibility
  
  // Force reactivity trigger for components
  const updateTrigger = ref(0);

  // ==================== GETTERS ====================
  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.is_read),
  );

  const hasUnread = computed(() => unreadCount.value > 0);

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  });

  // ==================== HELPER FUNCTIONS ====================
  const getIconForType = (type) => {
    const icons = {
      transaction: "fas fa-exchange-alt",
      success: "fas fa-check-circle",
      warning: "fas fa-exclamation-triangle",
      alert: "fas fa-shield-alt",
      error: "fas fa-times-circle",
      info: "fas fa-info-circle",
      approval_requested: "fas fa-clock",
      approval_approved: "fas fa-check-circle",
      approval_rejected: "fas fa-times-circle",
    };
    return icons[type] || icons.info;
  };

  const getTypeClass = (type) => {
    const classes = {
      transaction: "notification-success",
      success: "notification-success",
      warning: "notification-warning",
      alert: "notification-error",
      error: "notification-error",
      info: "notification-info",
      approval_requested: "notification-warning",
      approval_approved: "notification-success",
      approval_rejected: "notification-error",
    };
    return classes[type] || classes.info;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";

    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return timeString;
    }
  };

  const formatNotification = (item) => {
    const notificationData = item.data || {};

    // Create title based on notification type and data
    let title = "Notification";
    if (notificationData.title) {
      title = notificationData.title;
    } else if (notificationData.requester_name) {
      title = `${notificationData.requester_name} requested ${notificationData.action || 'an action'}`;
    } else if (item.type.includes('Approval')) {
      title = 'Approval Request';
    }

    // Create message based on notification type and data
    let message = "";
    if (notificationData.message) {
      message = notificationData.message;
    } else if (notificationData.requester_name && notificationData.voucher_type) {
      message = `${notificationData.requester_name} requested to ${notificationData.action || 'modify'} ${notificationData.voucher_type} voucher${notificationData.voucher_id ? ' #' + notificationData.voucher_id : ''}`;
    } else {
      message = 'You have a new notification';
    }

    return {
      id: item.id,
      type: item.type || notificationData.type || "info",
      title: title,
      message: message,
      icon: notificationData.icon || getIconForType(item.type || notificationData.type),
      type_class: notificationData.type_class || getTypeClass(item.type || notificationData.type),
      action_url: notificationData.action_url || null,
      data: notificationData,
      is_read: item.is_read || false,
      read_at: item.read_at,
      time: formatTime(item.created_at),
      created_at: item.created_at,
    };
  };

  // ==================== API ACTIONS ====================
  const fetchNotifications = async (params = {}) => {
    if (!authStore.isAuthenticated) return;

    try {
      loading.value = true;
      isLoading.value = true;
      error.value = null;

      // const response = await api.get("/notifications", { params });

      // if (response.data.success && response.data.data) {
      //   const apiData = response.data.data;
      //   const items = apiData.data || [];
      //   const meta = apiData.meta || {};

      //   const formattedNotifications = items.map(formatNotification);
      //   const unread = formattedNotifications.filter((n) => !n.is_read).length;

      //   setNotifications(formattedNotifications);
      //   setUnreadCount(unread);
      //   setPagination({
      //     total: meta.total || 0,
      //     per_page: meta.per_page || 10,
      //     current_page: meta.current_page || 1,
      //     last_page: meta.last_page || 1,
      //     from: meta.from || 0,
      //     to: meta.to || 0,
      //     has_more: meta.has_more_pages || false,
      //   });

      //   // Force reactivity update
      //   forceUpdate();

      //   return {
      //     success: true,
      //     notifications: formattedNotifications,
      //     pagination: pagination.value,
      //     unread_count: unread,
      //   };
      // }

      // return response.data;
    } catch (err) {
      error.value = err;
      console.error("Failed to fetch notifications:", err);
      throw err;
    } finally {
      loading.value = false;
      isLoading.value = false;
    }
  };

  const fetchNextPage = async () => {
    if (!pagination.value.has_more || loading.value) return;
    const nextPage = (pagination.value.current_page || 1) + 1;
    return fetchNotifications({ page: nextPage });
  };

  const fetchPreviousPage = async () => {
    const prevPage = (pagination.value.current_page || 1) - 1;
    if (prevPage < 1) return;
    return fetchNotifications({ page: prevPage });
  };

  const fetchUnreadCount = async () => {
    if (!authStore.isAuthenticated) return 0;

    try {
      // const response = await api.get("/notifications/unread");
      // if (response.data.success) {
      //   const count = response.data.data?.unread_count || 0;
      //   setUnreadCount(count);
      //   return count;
      // }
      return 0;
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      return 0;
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await api.post(`/notifications/${id}/mark-read`);
      if (response.data.success) {
        markAsReadLocal(id);
        await fetchUnreadCount();
        forceUpdate();
      }
      return response.data;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.post("/notifications/mark-all-read");
      if (response.data.success) {
        markAllAsReadLocal();
        setUnreadCount(0);
        forceUpdate();
      }
      return response.data;
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      throw err;
    }
  };

  const storeFcmToken = async (token) => {
    try {
      // const response = await api.post("/notifications/fcm-token", {
      //   fcm_token: token,
      // });
      return response.data;
    } catch (err) {
      console.error("Failed to store FCM token:", err);
      throw err;
    }
  };

  const refresh = async () => {
    return fetchNotifications({ page: 1 });
  };

  // ==================== LOCAL ACTIONS ====================
  const setNotifications = (data) => {
    notifications.value = data || [];
    forceUpdate();
  };

  const addNotification = (notification) => {
    console.log("Adding notification to store:", notification);
    
    // Check if notification already exists (by ID)
    const exists = notifications.value.some(n => n.id === notification.id);
    if (exists) {
      console.log("Notification already exists, skipping");
      return;
    }
    
    // Create a new array to trigger reactivity
    const newNotifications = [notification, ...notifications.value];
    notifications.value = newNotifications;
    
    // Increment unread count if notification is unread
    if (!notification.is_read) {
      console.log("Incrementing unread count from", unreadCount.value, "to", unreadCount.value + 1);
      unreadCount.value = unreadCount.value + 1;
    }
    
    console.log("New unread count:", unreadCount.value);
    
    // Force reactivity update
    forceUpdate();
  };

  const markAsReadLocal = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1 && !notifications.value[index].is_read) {
      // Create a new array to trigger reactivity
      const updatedNotifications = [...notifications.value];
      updatedNotifications[index] = {
        ...updatedNotifications[index],
        is_read: true
      };
      notifications.value = updatedNotifications;
      
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      console.log("Marked as read, new unread count:", unreadCount.value);
      forceUpdate();
    }
  };

  const markAllAsReadLocal = () => {
    // Create a new array with all notifications marked as read
    const updatedNotifications = notifications.value.map(n => ({
      ...n,
      is_read: true
    }));
    notifications.value = updatedNotifications;
    unreadCount.value = 0;
    console.log("Marked all as read, unread count:", unreadCount.value);
    forceUpdate();
  };

  const removeNotification = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      const isUnread = !notifications.value[index].is_read;
      
      // Create a new array without the notification
      const updatedNotifications = notifications.value.filter(n => n.id !== id);
      notifications.value = updatedNotifications;
      
      if (isUnread) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      
      console.log("Removed notification, new unread count:", unreadCount.value);
      forceUpdate();
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
    unreadCount.value = 0;
    forceUpdate();
  };

  const setUnreadCount = (count) => {
    // console.log("Setting unread count to:", count);
    unreadCount.value = count;
    forceUpdate();
  };

  const setPagination = (data) => {
    pagination.value = { ...pagination.value, ...data };
  };

  const setLoading = (status) => {
    isLoading.value = status;
  };

  const setError = (err) => {
    error.value = err;
  };

  const forceUpdate = () => {
    updateTrigger.value++;
  };

  // ==================== FIREBASE HANDLERS ====================
  const handleIncomingNotification = (payload) => {
    console.log("Processing incoming notification payload:", payload);
    
    // Firebase message structure
    const notificationData = payload.data || {};
    const notification = payload.notification || {};
    
    // Generate a unique ID for this notification
    const notificationId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine notification type from title/body
    let type = 'info';
    const title = notification.title || '';
    const body = notification.body || '';
    
    if (title.toLowerCase().includes('approve') || body.toLowerCase().includes('approve')) {
      type = 'approval_approved';
    } else if (title.toLowerCase().includes('reject') || body.toLowerCase().includes('reject')) {
      type = 'approval_rejected';
    } else if (title.toLowerCase().includes('request') || body.toLowerCase().includes('request')) {
      type = 'approval_requested';
    } else if (title.toLowerCase().includes('success') || body.toLowerCase().includes('success')) {
      type = 'success';
    } else if (title.toLowerCase().includes('warning') || body.toLowerCase().includes('warning')) {
      type = 'warning';
    } else if (title.toLowerCase().includes('error') || body.toLowerCase().includes('error')) {
      type = 'error';
    }

    // Create notification object matching API format
    const newNotification = {
      id: notificationId,
      type: `App\\Notifications\\${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Notification`,
      data: {
        type: type,
        title: title,
        message: body,
        ...notificationData
      },
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      // Add computed fields
      title: title || 'New Notification',
      message: body || 'You have a new notification',
      icon: getIconForType(type),
      type_class: getTypeClass(type),
      action_url: null,
      time: 'Just now',
    };

    console.log("Created notification object:", newNotification);
    
    // Add to store - this will increment unreadCount
    addNotification(newNotification);
    
    // Also fetch from server to sync (but wait a bit for server to process)
    setTimeout(() => {
      fetchUnreadCount();
      refresh();
    }, 2000);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: newNotification.data,
          requireInteraction: true,
        });
      } catch (e) {
        console.warn('Failed to show notification:', e);
      }
    }
    
    // Force multiple updates to ensure UI refreshes
    forceUpdate();
    setTimeout(() => forceUpdate(), 100);
    setTimeout(() => forceUpdate(), 300);
    setTimeout(() => forceUpdate(), 500);
  };

  const initRealtimeNotifications = async () => {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, skipping realtime notifications');
      return false;
    }
    
    if (!firebaseService.isSupported()) {
      console.log('Firebase not supported in this browser');
      return false;
    }

    try {
      // Initialize Firebase
      await firebaseService.initialize();
      
      // Check permission status
      const permissionStatus = firebaseService.getPermissionStatus();
      // console.log('Notification permission status:', permissionStatus);
      
      // Set up foreground message listener
      firebaseService.onForegroundMessage((payload) => {
        console.log('🔥 Received real-time notification:', payload);
        handleIncomingNotification(payload);
      });
      
      console.log('✅ Realtime notifications initialized');
      
      // Fetch initial unread count
      await fetchUnreadCount();
      
      return true;
    } catch (err) {
      console.error('❌ Error initializing real-time notifications:', err);
      return false;
    }
  };

  // ==================== EXPORTS ====================
  return {
    // State
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    loading,
    updateTrigger,

    // Getters
    unreadNotifications,
    hasUnread,
    sortedNotifications,

    // API Actions
    fetchNotifications,
    fetchNextPage,
    fetchPreviousPage,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    storeFcmToken,
    refresh,
    initRealtimeNotifications,

    // Local Actions
    setNotifications,
    addNotification,
    markAsReadLocal,
    markAllAsReadLocal,
    removeNotification,
    clearNotifications,
    setUnreadCount,
    setPagination,
    setLoading,
    setError,
    handleIncomingNotification,
    forceUpdate,
  };
});