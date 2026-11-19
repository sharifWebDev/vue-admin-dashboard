// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Hardcode the config here since import.meta doesn't work in service workers
// Make sure to update these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADjwesGcidhdpfPY6mc70pzDxf74Nsq6E",
  authDomain: "accounting-bcaad.firebaseapp.com",
  projectId: "accounting-bcaad",
  storageBucket: "accounting-bcaad.firebasestorage.app",
  messagingSenderId: "21476218849",
  appId: "1:21476218849:web:7484eb0b4d78f5f34ca4a0",
  measurementId: "G-E8QT5JVJG8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  // Customize notification here
  const notificationTitle =
    payload.notification?.title || "Background Message Title";
  const notificationOptions = {
    body: payload.notification?.body || "Background Message body.",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: payload.data,
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received", event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        const urlToOpen = new URL("/", self.location.origin).href;

        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        return clients.openWindow(urlToOpen);
      }),
  );
});