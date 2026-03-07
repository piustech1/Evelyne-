importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDQowFz4CyV4KaU2snaaEog99pWHSlaYtw",
  authDomain: "easyboost-f6ac5.firebaseapp.com",
  databaseURL: "https://easyboost-f6ac5-default-rtdb.firebaseio.com",
  projectId: "easyboost-f6ac5",
  storageBucket: "easyboost-f6ac5.firebasestorage.app",
  messagingSenderId: "363188338779",
  appId: "1:363188338779:web:bb5b264ea2c0a81b0b7f7e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.postimg.cc/sxNQyXFG/0x0.png',
    data: {
      url: payload.data?.url || '/notifications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
