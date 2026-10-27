// firebase.js
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import api from "./api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

class FirebaseService {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.onMessageCallback = null;
    this.isInitialized = false;
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    this.initAttempts = 0;
    this.maxInitAttempts = 3;
    this.storeUpdateCallback = null; // Add this to store reference
  }

  /**
   * Register callback for store updates when messages are received
   */
  registerStoreUpdateCallback(callback) {
    this.storeUpdateCallback = callback;
  }

  /**
   * Initialize Firebase Messaging
   */
  async initialize() {
    if (this.isInitialized && this.messaging) {
      return true;
    }

    // Prevent infinite initialization attempts
    this.initAttempts++;
    if (this.initAttempts > this.maxInitAttempts) {
      console.warn("Max Firebase initialization attempts reached");
      return false;
    }

    try {
      // Check if messaging is supported
      const supported = await isSupported();
      if (!supported) {
        console.warn("Firebase messaging is not supported in this browser");
        return false;
      }

      // Initialize messaging
      this.messaging = getMessaging(app);
      this.isInitialized = true;
      // console.log("✅ Firebase messaging initialized");

      // Check permission and get token if already granted
      if (Notification.permission === "granted") {
        // Don't await this - let it happen in background
        this.getTokenWithExistingPermission().catch((err) => {
          console.warn("Background token fetch failed:", err);
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize Firebase messaging:", error);
      return false;
    }
  }

  /**
   * Check if browser supports notifications
   */
  isSupported() {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return Notification.permission;
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken() {
    try {
      // Initialize first
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn("Firebase messaging not available");
        return null;
      }

      // Check browser support
      if (!this.isSupported()) {
        console.warn("This browser does not support notifications");
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        return await this.getTokenWithExistingPermission();
      } else {
        console.warn("Notification permission denied");
        return null;
      }
    } catch (error) {
      console.error("Error in requestPermissionAndGetToken:", error);
      return null;
    }
  }

  /**
   * Get token when permission already granted
   */
  async getTokenWithExistingPermission() {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      // Try to get token without service worker first
      try {
        const tokenOptions = {
          vapidKey: this.vapidKey,
        };

        const token = await getToken(this.messaging, tokenOptions);

        if (token) {
          this.currentToken = token;
          // console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");

          // Send to server (don't await)
          this.sendTokenToServer(token).catch((err) => {
            console.warn("Failed to send token to server:", err);
          });

          return token;
        }
      } catch (tokenError) {
        console.warn("Error getting token without SW:", tokenError);
      }

      // Try with service worker registration
      let swRegistration = null;

      if ("serviceWorker" in navigator) {
        try {
          // Check if service worker is already registered
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          // Look for our firebase-messaging-sw.js
          swRegistration = registrations.find((reg) =>
            reg.active?.scriptURL?.includes("firebase-messaging-sw"),
          );

          // If not found, try to register it
          if (!swRegistration) {
            try {
              swRegistration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                {
                  scope: "/",
                  // Add update via cache control
                  updateViaCache: "none",
                },
              );

              // Wait for the service worker to be ready
              await navigator.serviceWorker.ready;
              console.log("✅ Firebase service worker registered");
            } catch (swError) {
              console.warn("Service worker registration failed:", swError);
              // Continue without service worker
            }
          }

          // Get token with service worker if available
          if (swRegistration) {
            const tokenWithSW = await getToken(this.messaging, {
              vapidKey: this.vapidKey,
              serviceWorkerRegistration: swRegistration,
            });

            if (tokenWithSW) {
              this.currentToken = tokenWithSW;
              // console.log(
              //   "✅ FCM Token obtained with SW:",
              //   tokenWithSW.substring(0, 20) + "...",
              // );

              this.sendTokenToServer(tokenWithSW).catch((err) => {
                console.warn("Failed to send token to server:", err);
              });

              return tokenWithSW;
            }
          }
        } catch (swError) {
          console.warn("Service worker operation failed:", swError);
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  /**
   * Send FCM token to backend
   */
  async sendTokenToServer(token) {
    try {
      // const response = await api.post("/notifications/fcm-token", {
      //   fcm_token: token,
      //   platform: "web",
      //   device_id: this.getDeviceId(),
      // });

      // if (response.data.success) {
      //   // console.log("✅ Token registered with server");
      // }
    } catch (error) {
      console.error("Failed to register token with server:", error);
    }
  }

  /**
   * Get device ID
   */
  getDeviceId() {
    let deviceId = localStorage.getItem("device_id");

    if (!deviceId) {
      deviceId = "web_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("device_id", deviceId);
    }

    return deviceId;
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback) {
    if (!this.messaging) {
      this.initialize().then(() => {
        if (this.messaging) {
          this.setupMessageListener(callback);
        }
      });
      return;
    }

    this.setupMessageListener(callback);
  }

  /**
   * Setup message listener
   */
  setupMessageListener(callback) {
    if (!this.messaging) return;

    try {
      onMessage(this.messaging, (payload) => {
        console.log("📩 Message received in foreground:", payload);

        // Ensure payload has expected structure
        const normalizedPayload = {
          ...payload,
          data: payload.data || {},
          notification: payload.notification || {
            title: payload.data?.title || "New Notification",
            body: payload.data?.body || "",
          },
        };

        // Call the provided callback
        if (callback) {
          callback(normalizedPayload);
        }

        // **IMPORTANT: Trigger store update when message is received**
        if (this.storeUpdateCallback) {
          console.log("🔄 Triggering store update from Firebase message");
          this.storeUpdateCallback(normalizedPayload);
        }

        // Also show browser notification if permission granted
        if (
          Notification.permission === "granted" &&
          normalizedPayload.notification
        ) {
          try {
            new Notification(
              normalizedPayload.notification.title || "New Notification",
              {
                body: normalizedPayload.notification.body || "",
                icon: "/icon-192x192.png",
                badge: "/badge-72x72.png",
                data: normalizedPayload.data,
              },
            );

            // In firebase.js setupMessageListener method, add this after getting the message:

          // Create a custom event that components can listen to
          const event = new CustomEvent('new-notification', { 
            detail: { 
              payload: normalizedPayload,
              timestamp: Date.now()
            } 
          });
          window.dispatchEvent(event);

          // Also update a global counter
          window.__lastNotificationTime = Date.now();

          } catch (notifError) {
            console.warn("Failed to show notification:", notifError);
          }
        }
      });

      // console.log("✅ Foreground message listener setup");
    } catch (error) {
      console.error("Error setting up message listener:", error);
    }
  }

  /**
   * Remove FCM token
   */
  async removeToken() {
    try {
      if (this.currentToken) {
        await api.post("/fcm/remove", {
          fcm_token: this.currentToken,
        });

        localStorage.removeItem("fcm_token");
        this.currentToken = null;
        console.log("Token removed");
      }
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }
}

export default new FirebaseService();