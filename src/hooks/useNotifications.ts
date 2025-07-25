import { useState, useEffect } from 'react';
import { messaging, vapidKey, getToken, onMessage } from '../firebase-config';
import type { Messaging, MessagePayload } from 'firebase/messaging';

const BACKEND_URL = 'http://localhost:8000/api';

interface NotificationData {
  title: string;
  body: string;
  topic?: string;
}

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  timestamp: string;
}

interface ToastNotification {
  title: string;
  body: string;
}

interface UseNotificationsReturn {
  fcmToken: string | null;
  permissionStatus: NotificationPermission;
  notifications: NotificationItem[];
  toast: ToastNotification | null;
  setToast: (toast: ToastNotification | null) => void;
  requestPermission: () => Promise<string | null>;
  fetchNotifications: () => Promise<void>;
  sendNotification: (data: NotificationData) => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Request notification permission and get FCM token
  const requestPermission = async (): Promise<string | null> => {
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
        
        const token = await getToken(messaging as Messaging, { 
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
          console.log('⚠️ Could not subscribe to topic (backend endpoint may not exist):', (error as Error).message);
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
    if (messaging && permissionStatus === 'granted') {
      console.log('🎧 Setting up foreground message listener...', { messaging });
      
      try {
        // Double-check that onMessage is available
        if (typeof onMessage !== 'function') {
          console.error('❌ onMessage function not available');
          return;
        }
        
        const unsubscribe = onMessage(messaging as Messaging, (payload: MessagePayload) => {
          console.log('🔔 Foreground message received:', payload);
          
          const notificationData: ToastNotification = {
            title: payload.notification?.title || payload.data?.title || 'New Notification',
            body: payload.notification?.body || payload.data?.body || 'You have a new message',
          };

          // Show toast notification in the app
          setToast(notificationData);

          // CRITICAL: Show browser notification for foreground messages
          if (Notification.permission === 'granted') {
            console.log('🌐 Creating browser notification for foreground message');
            
            try {
              const notification = new Notification(notificationData.title, {
                body: notificationData.body,
                tag: 'fcm-app-notification',
                requireInteraction: false,
                silent: false
              });
              
              // Auto-close after 5 seconds
              setTimeout(() => {
                notification.close();
              }, 5000);
              
              console.log('✅ Foreground browser notification created');
            } catch (error) {
              console.error('❌ Failed to create browser notification:', error);
            }
          } else {
            console.error('❌ Cannot create browser notification - permission:', Notification.permission);
          }

          // Refresh notifications list
          setTimeout(() => {
            fetchNotifications();
          }, 500);
        });

        console.log('✅ Message listener setup successful');
        return unsubscribe;
      } catch (error) {
        console.error('❌ Failed to setup message listener:', error);
        console.error('❌ This might be due to Firebase initialization issues');
      }
    } else {
      if (!messaging) {
        console.error('❌ Cannot setup message listener - messaging is null/undefined');
        console.error('❌ Check Firebase configuration and initialization');
      }
      if (permissionStatus !== 'granted') {
        console.log('⚠️ Cannot setup message listener - permission not granted:', permissionStatus);
      }
    }
    
    // Always return a cleanup function
    return () => {};
  }, [permissionStatus]); // Add permissionStatus as dependency

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      console.log('🔍 Initial permission status:', permission);
    }
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async (): Promise<void> => {
    try {
      console.log('📡 Fetching notifications from backend...');
      const response = await fetch(`${BACKEND_URL}/notifications/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: NotificationItem[] = await response.json();
      setNotifications(data);
      console.log('📋 Fetched notifications:', data);
    } catch (error) {
      console.error('❌ Error fetching notifications:', (error as Error).message);
      setNotifications([]);
    }
  };

  // Send notification via backend
  const sendNotification = async (notificationData: NotificationData): Promise<boolean> => {
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