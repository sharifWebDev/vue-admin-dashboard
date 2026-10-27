import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import { useAuthStore } from "@/stores/authStore";
import "./assets/main.css";
import "toastr/build/toastr.min.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import { info, success, error, warning } from "@/utils/alerts.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUser,
  faHome,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.css";
library.add(faUser, faHome, faSignOutAlt);
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "flatpickr/dist/flatpickr.css";
import "vue-multiselect/dist/vue-multiselect.css";
import { permission, role } from "@/directives/permission";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Chart from "chart.js/auto";

// Import only the store - remove service imports
import { useNotificationStore } from "@/stores/notificationStore";

// PWA Registration
import { registerSW } from "virtual:pwa-register";


const toastOptions = {
  position: "top-right",
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  icon: true,
};

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(Toast, toastOptions);
app.use(pinia);
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

app.config.globalProperties.$info = info;
app.config.globalProperties.$success = success;
app.config.globalProperties.$error = error;
app.config.globalProperties.$warning = warning;
app.config.globalProperties.$Chart = Chart;

const authStore = useAuthStore();
authStore.initializeAuth();

app.directive("click-outside", {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
});

app.directive("permission", permission);
app.directive("role", role);

app.mount("#app");

// main.js - Update the Firebase initialization part

// Initialize Firebase notifications with debouncing
let firebaseInitTimeout = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

const initializeFirebaseNotifications = async () => {
  // Clear any pending timeout
  if (firebaseInitTimeout) {
    clearTimeout(firebaseInitTimeout);
  }

  // Prevent infinite loops
  initAttempts++;
  if (initAttempts > MAX_INIT_ATTEMPTS) {
    console.warn("Max Firebase init attempts reached, stopping");
    return;
  }

  try {
    // console.log("🔥 Initializing Firebase notifications...");

    if (!authStore.isAuthenticated) {
      console.log("⏭️ User not authenticated, skipping Firebase init");
      // Try again after auth
      firebaseInitTimeout = setTimeout(initializeFirebaseNotifications, 3000);
      return;
    }

    // Import Firebase service
    let firebaseService;
    try {
      firebaseService = (await import("@/services/firebase")).default;
    } catch (e) {
      console.error("Could not find firebase service file:", e);
      return;
    }

    // Initialize Firebase messaging (don't await - let it run in background)
    firebaseService
      .initialize()
      .then((initialized) => {
        if (initialized) {
          // console.log("✅ Firebase initialized successfully");

          // Set up foreground message listener
          firebaseService.onForegroundMessage((payload) => {
            console.log("📩 New notification received:", payload);

            // Update notification store
            const notificationStore = useNotificationStore();
            if (notificationStore.addRealtimeNotification) {
              notificationStore.addRealtimeNotification(payload);
            }
          });

          // Fetch initial notifications
          const notificationStore = useNotificationStore();
          notificationStore
            .fetchNotifications({ page: 1 })
            .then(() => console.log("📥 Initial notifications loaded"))
            .catch((err) => console.warn("Failed to load notifications:", err));
        }
      })
      .catch((err) => {
        console.warn("Firebase initialization failed:", err);
      });
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
};

// Call with a delay to ensure auth is ready
setTimeout(initializeFirebaseNotifications, 2000);
// Register PWA service worker
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("🔄 New version available");
  },
  onOfflineReady() {
    console.log("📱 App ready for offline use");
  },
});
