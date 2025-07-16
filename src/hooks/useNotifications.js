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
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      console.log('📋 Notification permission:', permission);

      if (permission === 'granted') {
        console.log('✅ Permission granted, getting FCM token...');
        const token = await getToken(messaging, { vapidKey });
        setFcmToken(token);
        console.log('🎫 FCM Token:', token);
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
      
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('🔔 Foreground message received:', payload);
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

          // Auto close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);

        // Refresh notifications list
        setTimeout(() => {
          fetchNotifications();
        }, 500);
      });

      return unsubscribe;
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