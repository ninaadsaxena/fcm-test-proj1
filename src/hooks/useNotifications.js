import { useState, useEffect } from 'react';
import { messaging, vapidKey, getToken, onMessage } from '../firebase-config';

const BACKEND_URL = 'http://localhost:8000/api';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Request notification permission and get FCM token
  const requestPermission = async () => {
    try {
      console.log('🔔 Requesting notification permission...');
      console.log('🔍 Current permission status:', Notification.permission);
      
      // Register service worker first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service Worker registered:', registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is ready');
        } catch (swError) {
          console.error('❌ Service Worker registration failed:', swError);
          return null;
        }
      }
      
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      console.log('📋 Notification permission:', permission);

      if (permission === 'granted') {
        console.log('✅ Permission granted, getting FCM token...');
        
        if (!messaging) {
          console.error('❌ Firebase messaging not initialized');
          return null;
        }
        
        if (!vapidKey) {
          console.error('❌ VAPID key not configured');
          return null;
        }
        
        console.log('🔑 Using VAPID key:', vapidKey ? vapidKey.substring(0, 20) + '...' : 'undefined');
        
        const token = await getToken(messaging, { 
          vapidKey,
          serviceWorkerRegistration: await navigator.serviceWorker.ready
        });
        setFcmToken(token);
        console.log('🎫 FCM Token:', token);
        console.log('🎫 FCM Token length:', token?.length);
        
        // Subscribe to 'all' topic by sending token to backend
        try {
          await fetch(`${BACKEND_URL}/subscribe-to-topic/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token,
              topic: 'all'
            }),
          });
          console.log('✅ Subscribed to "all" topic');
        } catch (error) {
          console.log('⚠️ Could not subscribe to topic (backend endpoint may not exist):', error.message);
        }
        
        return token;
      } else {
        console.log('❌ Permission denied or dismissed');
      }
    } catch (error) {
      console.error('❌ Error getting permission:', error);
    }
    return null;
  };

  // Setup foreground message listener
  useEffect(() => {
    if (messaging) {
      console.log('🎧 Setting up foreground message listener...', { messaging });
      console.log('🎧 Messaging object:', messaging);
      
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('🔔 Foreground message received:', payload);
        console.log('🔔 Payload structure:', JSON.stringify(payload, null, 2));
        console.log('🔔 Notification permission status:', Notification.permission);
        
        const notificationData = {
          title: payload.notification?.title || payload.data?.title || 'New Notification',
          body: payload.notification?.body || payload.data?.body || 'You have a new message',
        };

        console.log('📱 Processed notification data:', notificationData);

        // Show toast notification in the app
        setToast(notificationData);
        console.log('🍞 Toast notification set:', notificationData);

        // Also show browser notification for immediate visibility
        if (Notification.permission === 'granted') {
          console.log('🌐 Creating browser notification...', notificationData);
          
          try {
            const browserNotification = new Notification(notificationData.title, {
              body: notificationData.body,
              icon: '/vite.svg',
              tag: 'fcm-foreground',
              requireInteraction: false
            });
            
            console.log('✅ Browser notification created successfully');
          } catch (error) {
            console.error('❌ Failed to create browser notification:', error);
          }
        } else {
          console.log('❌ Cannot create browser notification - permission not granted:', Notification.permission);
        }

        // Refresh notifications list
        setTimeout(() => {
          fetchNotifications();
        }, 500);
      });

      console.log('🎧 Message listener setup complete, unsubscribe function:', typeof unsubscribe);
      return unsubscribe;
    } else {
      console.error('❌ Cannot setup message listener - messaging is null/undefined');
    }
  }, []);

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      console.log('🔍 Initial permission status:', permission);
    }
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      console.log('📡 Fetching notifications from backend...');
      const response = await fetch(`${BACKEND_URL}/notifications/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
      console.log('📋 Fetched notifications:', data);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error.message);
      setNotifications([]);
    }
  };

  // Send notification via backend
  const sendNotification = async (notificationData) => {
    try {
      console.log('📤 Sending notification:', notificationData);
      
      const response = await fetch(`${BACKEND_URL}/send-notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notification sent successfully:', result);
        
        // Refresh the notifications list
        setTimeout(() => {
          fetchNotifications();
        }, 500);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send notification:', errorData);
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  };

  // Initial setup
  useEffect(() => {
    console.log('🚀 Initializing notifications...');
    requestPermission();
    fetchNotifications();
  }, []);

  return {
    fcmToken,
    permissionStatus,
    notifications,
    toast,
    setToast,
    requestPermission,
    fetchNotifications,
    sendNotification,
  };
};