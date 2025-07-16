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
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      console.log('Notification permission:', permission);

      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey });
        setFcmToken(token);
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('Error getting permission:', error);
    }
    return null;
  };

  // Setup foreground message listener
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('🔔 Foreground message received:', payload);
        
        const notificationData = {
          title: payload.notification?.title || payload.data?.title || 'New Notification',
          body: payload.notification?.body || payload.data?.body || 'You have a new message',
        };

        // Show toast notification in the app
        setToast(notificationData);
        console.log('📱 Showing toast:', notificationData);

        // Also show browser notification if page is visible
        if (document.visibilityState === 'visible' && Notification.permission === 'granted') {
          const browserNotification = new Notification(notificationData.title, {
            body: notificationData.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'fcm-foreground',
            requireInteraction: false
          });

          // Auto close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);

          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };
        }
        
        // Refresh notifications list
        fetchNotifications();
      });

      return unsubscribe;
    }
  }, []);

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
      console.log('📋 Fetched notifications:', data);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
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